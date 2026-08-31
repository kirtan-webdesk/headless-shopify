---
tier: 1
load_when: ["platform-headless", "headless-platform-active", "code-production", "agent-code-review", "g3-scaffold-stage", "g4-sprint-qa"]
description: "Cross-architecture coding standards for the Headless arm. TypeScript and generated types, the server/client boundary as the organising principle, project structure, dependency and version discipline against Hydrogen's CalVer train and peer pins, environment access, error handling, testing expectations, and the review checklist. Applies to all four architectures; A and B share code and any divergence between them is a finding."
applies_to: [headless]
decision_refs: [D-HL-SPEC-01, D-HL-ENV-01, D-HL-SEC-01, D-HL-STACK-01, D-HL-TYPES-01, D-KB-FIDELITY-01]
last_reviewed: 2026-08-06
next_review_due: 2026-11-06
---

# 01 — Coding Standards (Headless)

> Cross-architecture. **A and B are the same code** — they differ in hosting and the custom server entry (`D-HL-ENV-01` B3/B4), not in how application code is written. A pattern that differs between A and B is a finding, not a preference.
>
> Global standards still apply: `_spine/shared-knowledge/`. This file is additive.

---

## 1. The organising principle

**Every module has an unambiguous side of the server/client boundary.**

That is not a style rule here — it is the rule that prevents `HL-SEC-001`. A module that could plausibly run in either place will eventually run in the browser, carrying whatever it imports.

- Server-only modules are named and located so that importing one from client code is obviously wrong at a glance, not just wrong at build time.
- **Never import a server module for a type alone.** Import the type from a types module; importing the module drags its dependency graph — and its secrets — toward the bundle.
- **C and D (Next.js):** `"use client"` goes at the leaf, not near the root. A boundary set high pulls its whole subtree into the browser, including data fetching that was supposed to stay on the server.
- **A and B (Hydrogen):** data belongs in the route loader, not in components.

---

## 2. TypeScript

- **Strict mode on.** Non-negotiable, from the scaffold, before there is code to migrate.
- **Generate types from the schema.** Storefront API and BigCommerce GraphQL types are generated, committed and regenerated when the API version moves. Hand-written response interfaces drift from the schema silently and are wrong in exactly the direction that passes review.
- `any` requires a comment explaining why. `as` casts on API responses are almost always a generated-types problem wearing a disguise.
- Type the boundaries — loader returns, route params, env, mutation inputs. Interior inference is fine.
- Nullability from the API is real. A GraphQL schema that says a field is nullable means it is; `!` on it is a runtime error waiting for the one product that lacks it.

---

## 3. Project structure

Optimise for *"where does this belong"* having one answer.

- Route files stay thin: fetch, compose, render. Business logic lives in modules a test can reach without a request.
- **Fragments colocate with the component that renders them** (`06-data-layer-patterns.md` §4).
- Shared UI carries no commerce assumptions. A component that fetches its own cart is not shared UI.
- No `utils.ts`. A file named for what it is not becomes the place things go to avoid a decision.
- Directory names match the domain language in `02-naming-conventions.md` — cart, collection, product, customer — not invented synonyms.

---

## 4. Dependencies and versions

**Hydrogen's peer pins are not advisory.**

- It pins `react-router ~7.16.0` while react-router's published latest is `8.3.0`. **"Latest" is wrong here, not modern.** Any bot or IDE action offering to fix the "outdated" dependency is offering to break the build.
- Hydrogen ships on a **CalVer train** (`2026.4.x`) aligned to Storefront API versions, not SemVer. **An upgrade is an API-version migration** — engagement type 5, priced as a project, never absorbed into a retainer ticket (`D-HL-TYPES-01`).
- Node version comes from the pinned package's `engines` field, **not from the documentation** (`D-HL-ENV-01` check 1). The documented contradiction is live: docs say v16.20+, the CLI declares `^22 || ^24`, Node 16 died in 2023.
- Lockfile committed; CI installs from it, never a fresh resolve.
- Dependency audit runs in CI and a failure blocks release.
- **A new dependency in a headless storefront is a supply-chain decision**, and on architecture A a bundle-size decision against a 10 MB cap that fails the deploy.

---

## 5. Environment access

- Read env in **one module per app**, validate it at startup, and export typed values. Scattered `process.env` access is how a missing variable becomes a production 500 instead of a boot failure.
- **Fail fast and loudly on a missing required variable.** A silent fallback to a default is how staging credentials reach production.
- Public-prefixed variables (`VITE_`, `NEXT_PUBLIC_`) are enumerated and each justified in writing as public (`HL-SEC-002`).
- Never branch on `NODE_ENV` to decide whether something is secret. It is secret or it is not.

---

## 6. Errors

- **Check the GraphQL `errors` array.** A 200 is not success (`06-data-layer-patterns.md` §6).
- Every route has a defined failure behaviour: degrade, or fail with the correct status. **Never render a `200` for a page that could not load its content** — that is the soft-404 problem in `10-seo-baseline.md` §8.
- Log server-side with enough context to identify the query. **Never log a cart ID, a token, or a customer identifier** (`HL-CART-001`).
- Customer-facing errors say what happened and what to do. Stack traces and GraphQL error strings are not customer-facing.

---

## 7. Testing

Proportionate, and pointed at the things that actually break in this arm:

- **Money and cart logic** — the highest-value tests here. Quantity changes crossing volume breaks, discount application, totals re-read after mutation.
- **Webhook signature verification, including the negative cases** — bad signature and missing signature, both rejected with no side effect (`HL-SEC-003`). A handler tested only on valid input passes while being broken.
- **Cache-key construction** — assert every input that varies the response is in the key (`HL-CACHE-001`).
- **Redirect map** — automated against staging before launch (`10-seo-baseline.md` §2).
- **Shared surfaces — navigation and mega-menu, header, footer, page shell, design tokens.** *(Added v1.11.31 per `D-HL-SPEC-01` 4c, from K4 pilot feedback.)* These need **explicit regression coverage** because their breakage is **invisible to the person who caused it** — a developer changing a homepage section has no reason to open the header, which is exactly why the header breaks. The pilot lost navigation and responsive parity this way.
- Component tests where behaviour is non-trivial.
- **On snapshot tests, corrected.** The earlier position — that snapshot tests mostly prove markup did not change, which is rarely the question — is **right for commerce logic and wrong for a design-system build.** On shared surfaces *"did this markup change"* **is** the question, because an unintended change there is the defect. Use them on the shared surfaces above; keep them off the commerce path, where behaviour is what matters.

---

## 8. Review checklist

Before a change is approved:

- [ ] No secret can reach the browser — checked against the **built bundle**, not the source (`HL-SEC-001`)
- [ ] Server/client boundary unambiguous for every new module
- [ ] Query asks only for rendered fields; connections bounded with `first`
- [ ] Independent queries concurrent, not serialised
- [ ] `errors` array checked; failure behaviour defined
- [ ] No money value originating in the client
- [ ] Cache key contains every input that varies the response
- [ ] Rendering strategy **and** cache behaviour declared for any new route
- [ ] No cart ID, token or customer identifier in logs or analytics
- [ ] Types generated from schema, not hand-written
- [ ] No peer-pinned dependency "upgraded to latest"

---

## Anti-patterns

1. Writing a module whose side of the server/client boundary is ambiguous.
2. Importing a server module for a type, and dragging its dependency graph toward the bundle.
3. Putting `"use client"` near the root of the tree and pulling the subtree's data fetching into the browser.
4. Hand-writing API response interfaces instead of generating them from the schema.
5. Casting an API response with `as` to silence a type error that generated types would have answered.
6. Treating a nullable schema field as non-null because it has always been present so far.
7. Upgrading a peer-pinned dependency because it is newest.
8. Treating a Hydrogen CalVer step as a version bump rather than an API-version migration priced as type 5.
9. Reading the Node version from the documentation instead of the pinned package's `engines`.
10. Scattering `process.env` reads through the codebase instead of one validated module.
11. Defaulting a missing required environment variable instead of failing at boot.
12. Branching on `NODE_ENV` to decide whether a value is secret.
13. Treating HTTP 200 as success on a GraphQL response.
14. Rendering a `200` for a page whose content failed to load.
15. Logging a cart ID, token or customer identifier while debugging.
16. Creating a `utils.ts` and letting it become the place decisions go to be avoided.
17. Testing webhook verification only with a valid signature.
18. Writing snapshot tests of markup instead of tests of the money and cart logic that actually breaks.
19. Letting architecture A and architecture B diverge in application code — they are the same code.
20. Leaving navigation, header and shared layout uncovered while commerce logic is thoroughly tested — the pilot regressed exactly there.
21. Applying the no-snapshot-tests rule to the design system. It was written for commerce logic.

---

Last reviewed: 2026-08-06
Next review due: 2026-11-06
