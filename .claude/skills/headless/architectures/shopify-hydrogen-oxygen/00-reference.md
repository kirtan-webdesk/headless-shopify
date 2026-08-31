---
tier: 1
load_when: ["platform-headless", "headless-platform-active", "headless-arch-a", "g1-plan-stage", "g3-scaffold-stage", "code-production", "g4-sprint-qa"]
description: "Architecture A reference spec — Hydrogen on Oxygen. The reference architecture the other three are written against. Covers the verified stack and pin set, the Hydrogen context and cart handler, the four cache strategies with their verified default values, the Oxygen hard ceilings and what each failure looks like, environments and the CLI surface, the CalVer upgrade path, and the open items that may not be asserted. A is the reference because it is the most constrained and best documented — not because it is preferred."
applies_to: [headless]
decision_refs: [D-HL-STACK-01, D-HL-ENV-01, D-HL-SEC-01, D-HL-TYPES-01, D-KB-FIDELITY-01, D-QA-GATE-BLOCK]
last_reviewed: 2026-08-06
next_review_due: 2026-11-06
---

# Architecture A — Hydrogen + Oxygen (reference spec)

> **A is the reference architecture because it is the most constrained and the best documented. It is not the recommended one.** If the gates in `knowledge/00-overview.md` §3 point at B or D, the answer is B or D. *LLM preference is not a decision input.*
>
> **B is written as a delta over this file.** A pattern that differs between A and B in application code is a finding, not a choice.
>
> Every version, limit and API name below traces to `pointers/verified-facts.md` (`HEADLESS-HALLUCINATION-01`). Names not on the verified list are marked, not guessed.

---

## 1. The stack, as verified

Register §12a, verified 2026-08-06 from the published packages:

| | Value |
|---|---|
| `@shopify/hydrogen` | **2026.4.4** (dist-tag `latest`) |
| `@shopify/cli-hydrogen` | **13.0.3**, `engines: { node: '^22 \|\| ^24' }` |
| `react-router` | **`~7.16.0`** (peer) |
| `@react-router/dev` | **`~7.16.0`** (peer) |
| `react` | `^18.3.1 \|\| ~19.0.3 \|\| ~19.1.4 \|\| ^19.2.3` |
| `vite` | `^5.1.0 \|\| ^6.2.1 \|\| ^7.0.0 \|\| ^8.0.0` |
| Runtime | Oxygen — **`workerd`, not Node** |
| Sales channel | **Hydrogen** channel (not Headless) |

**Two react-router pins, not one.** An upgrade that moves `react-router` and leaves `@react-router/dev` behind breaks in a way that reads as an application bug. Both are `~7.16.0` while react-router's published latest is `8.3.0` — "latest" is wrong here, not modern.

**Node comes from `engines`, never from the docs.** Shopify's own getting-started page says v16.20+; the pinned CLI says `^22 || ^24`; Node 16 died in September 2023. This is `D-HL-ENV-01` check 1 and it is the arm's standing proof that the artifact outranks the documentation.

---

## 2. Verified API surface

These names are confirmed present in `@shopify/hydrogen@2026.4.4`'s published type definitions (register §12b) and may be used in code and KB files:

`createHydrogenContext` · `createStorefrontClient` · `createCartHandler` · `cartGetIdDefault` · `cartSetIdDefault` · `createCustomerAccountClient` · `storefrontRedirect` · `CacheNone` · `CacheShort` · `CacheLong` · `CacheCustom` · `generateCacheControlHeader` · `InMemoryCache`

Export paths: `.`, `./vite`, `./oxygen`, `./storefront-api-types`, `./storefront.schema.json`, `./customer-account-api-types`, `./customer-account.schema.json`, `./react-router-types`, `./react-router-preset`.

**Any Hydrogen export not on this list is verified before it is named.** A plausible-sounding helper that does not exist is the exact failure `HEADLESS-HALLUCINATION-01` blocks, and it is the failure most likely to occur in this file's subject matter.

### The shape

- **`createHydrogenContext`** assembles the request context — storefront client, cart handler, customer account client, session, environment. It is created in the server entry and passed through to loaders and actions.
- **`createCartHandler`** owns cart operations. `cartGetIdDefault` / `cartSetIdDefault` are the default cookie-based cart-ID accessors. The cart ID they move is a **bearer capability** (`knowledge/07-cart-and-checkout.md` §2) — it does not go in logs, URLs or analytics.
- **`createCustomerAccountClient`** is the Customer Account API path, requiring **new** customer accounts. Choosing Multipass instead closes it (`knowledge/12-discovery-audit.md` §2a). `localhost` and plain `http` are unsupported in development — a tunnel is required.
- **`storefrontRedirect`** handles the platform's redirect table. Wire it, or Shopify-side redirects silently stop working after the move — a `10-seo-baseline.md` failure that looks like a routing bug.
- Types are **generated** from `./storefront-api-types` and `./customer-account-api-types`, committed, and regenerated when the API version moves (`knowledge/01-coding-standards.md` §2).

---

## 3. Caching — the numbers nobody guesses

Verified from the published sourcemap (register §12c):

| Strategy | Actual return value |
|---|---|
| `CacheNone()` | `{ mode: NO_STORE }` |
| `CacheShort()` | `{ mode: PUBLIC, maxAge: 1, staleWhileRevalidate: 9 }` |
| `CacheLong()` | `{ mode: PUBLIC, maxAge: 3600, staleWhileRevalidate: 82800 }` — source comments: `// 1 hour`, `// 23 Hours` |
| `CacheCustom(opts)` | passes `opts` through unchanged |

**`CacheShort` is one second fresh, nine seconds stale-while-revalidate.** Not minutes. Almost everyone reads "short" as a few minutes and sizes origin load against that assumption — and nothing in the name corrects them. If a route needs "a couple of minutes," that is `CacheCustom`, deliberately, with the number written down.

Both `CacheShort` and `CacheLong` merge overrides **after** the defaults and validate the override's mode.

**Rules that follow:**

- **Never cache a personalized, session-bound or authenticated response** (`HL-CACHE-001`). No strategy makes this safe — cart, customer and account routes are `CacheNone`.
- Every route declares a strategy **and** the cache behaviour, before build (`HL-CACHE-002`). Inheriting a starter template's choice is not a declaration.
- Every input that varies the response is in the key — market, locale, currency, segment.
- A revalidation window needs a purge path on catalog change (`HL-ISR-001`) and a stated staleness tolerance (`HL-ISR-002`). `staleWhileRevalidate: 82800` means a price can be up to 23 hours stale while it refreshes — that is a commercial decision, not a default to inherit.

`InMemoryCache` is for development. It is per-instance and does not survive; do not reason about production cache behaviour from it.

---

## 4. Oxygen ceilings — what failure actually looks like

Register §1. **These are not performance targets.** Each has a distinct failure mode, and knowing which one you hit is most of the debugging:

| Ceiling | Limit | Failure |
|---|---|---|
| Worker bundle | **10 MB** | **Deploy fails.** Not a slow site — no site. |
| Startup | **400 ms** | Worker rejected. Caused by top-level module work, not request work. |
| CPU per request | **30 s** | Request killed mid-flight |
| Memory | **128 MB** | Request killed |
| Custom env vars | **110** | Configuration rejected |
| Outbound completion | **2 min** | Request killed |

Static assets are separate: images 20 MB, video 1 GB, 3D models 500 MB, other 20 MB.

**The 10 MB number is not "the theme zip limit."** There is no theme and no zip. It is the compiled worker bundle, and the framing is: *if your Oxygen worker bundle exceeds 10 MB, your Hydrogen deployment fails.*

**`workerd` is not Node.** Anything assuming Node built-ins, a filesystem, long-lived processes or background timers is disqualified before it is written — and a dependency dragging one in disqualifies **architecture A itself**, firing derivation gate 4 → B or C. That is a Mode 2 re-derivation stopping for human confirmation, never an in-flight substitution.

Heavy processing, scheduled jobs, queues and ERP synchronisation move to external middleware. On these ceilings that is structural, not a preference: **a nightly ERP sync cannot live in the storefront worker.**

**Measuring the bundle — verified method** (register §16b). `npx shopify hydrogen build` prints *"the size of the app bundle in the terminal, along with a summary of the top dependencies and app files that make up the bundle,"* and emits **`dist/server/server-bundle-analyzer.html`**. Reduction levers: import only needed portions of a package, find smaller alternatives, replace SDKs with direct API calls, serve frontend dependencies from a CDN.

Shopify's bundle-size page states **no numbers** and defers to fundamentals — **the 10 MB figure has one home, not two.**

`debug/cpu` exists in the CLI (§5) and is the tool for the startup and CPU ceilings.

---

## 5. CLI and environments

Full verified command list, register §12d:

`build` · `check` · `codegen` · `customer-account/push` · `debug/cpu` · `deploy` · `dev` · `env/list` · `env/pull` · `env/push` · `g` · `generate/route` · `generate/routes` · `init` · `link` · `list` · `login` · `logout` · `preview` · `setup` · `setup/css` · `setup/markets` · `setup/vite` · `shortcut` · `unlink` · `upgrade`

- **`link`** and **`env pull`** are `D-HL-ENV-01` check **A3**. Both verified present.
- **Env vars are pulled, not retyped.** `env list` / `env pull` / `env push` exist so the storefront's configuration has one source of truth. Count against the **110** cap at preflight, projected not current (`D-HL-ENV-01` A6).
- **Secrets live in Oxygen's env store**, never committed, never public-prefixed. Hydrogen builds with Vite, so the public prefix is **`VITE_`** — a secret carrying it is published silently at build time (`HL-SEC-002` → `HL-SEC-001`).
- **`setup/markets` exists, and its existence proves nothing about plan entitlement.** Shopify Markets per-plan capability is open item 3 — it may be named as an open question and may not be estimated or quoted.

---

## 6. Upgrades are migrations

Hydrogen ships on a **CalVer train** (`2026.4.x`) aligned to Storefront API versions, not SemVer.

**An upgrade is an API-version migration**, which is engagement **type 5**, priced as a project (`D-HL-TYPES-01`). It is never absorbed into a retainer ticket — that is one of the five ratified change-order triggers. `upgrade` exists in the CLI and is the path; the CLI existing does not make it a small job.

**The Hydrogen release support window is open item 4** and may not be asserted. It determines the maintenance cadence quoted in SOWs and the CalVer-tracking obligation in the retainer, so a quote that depends on it is a quote depending on an unverified fact.

---

## 7. What A gives you that B, C and D do not

Stated so the delta files have something concrete to subtract from:

| Supplied by A | Consequence elsewhere |
|---|---|
| Managed runtime, TLS, platform deploy | **B/C/D:** yours, and the client owns the account by default |
| A caching layer (§3) | **B/C:** none by default. **D:** Vercel Runtime Cache on Vercel, nothing off it. Designed, owned, priced (`HL-CACHE-003`). |
| Documented, fixed ceilings | **B/C/D:** the host's, fetched at preflight, never assumed |
| Cart, session, analytics/consent components, Customer Account API wiring | **C:** all of it is yours to build and maintain — the give-up list that prices C |
| Env store with a known cap | **B/C/D:** host-dependent |

**A's constraints are its advantage.** They are documented, so they are checkable at preflight rather than discoverable at launch.

---

## 8. Open items — may be named, may not be asserted

| Item | Status |
|---|---|
| Checkout branding / checkout UI extensions Plus-gating | **OPEN** (register item 2). *"Do not assert checkout capability until that item is verified."* |
| Shopify Markets per-plan capability | **OPEN** (item 3). Nothing multi-market or multi-currency may be written, estimated or quoted. |
| Hydrogen release support window | **OPEN** (item 4). Affects maintenance cadence in every A SOW. |
| Shopify per-IP rate limiting of public Storefront tokens | **No register entry.** Carried from `D-HL-SEC-01`, unverified, **not client-quotable.** |

---

## Anti-patterns

1. Treating A as the recommended default rather than the reference spec, and letting that preference decide a project the gates would have sent to B or D.
2. Installing the **Headless** channel for an A build. A needs the **Hydrogen** channel.
3. Naming a Hydrogen export that is not on the verified list in §2.
4. Reading `CacheShort` as "a few minutes." It is 1 second fresh, 9 seconds stale-while-revalidate.
5. Inheriting `CacheLong`'s 23-hour stale window without asking the client how stale a price may be.
6. Caching a cart, customer or account response under any strategy.
7. Declaring a route's rendering strategy and leaving its cache behaviour to the starter template.
8. Reasoning about production cache behaviour from `InMemoryCache`.
9. Calling the 10 MB worker cap a "theme zip limit."
10. Treating a hard ceiling as a target to optimize toward later — the bundle cap fails the deploy.
11. Measuring bundle size for the first time at launch instead of baselining the scaffold.
12. Doing heavy work at module top level and hitting the 400 ms startup ceiling, then debugging it as a request-time problem.
13. Planning a scheduled job, queue or ERP sync inside the Oxygen worker.
14. Silently switching to B or C when a dependency fails `workerd` — gate 4 fires a re-derivation that stops for human confirmation.
15. Upgrading `react-router` without `@react-router/dev`, or either one to "latest."
16. Treating a CalVer step as a version bump rather than an API-version migration priced as type 5.
17. Absorbing a Hydrogen upgrade into a retainer ticket.
18. Giving a secret the `VITE_` prefix to make the build work.
19. Retyping environment variables instead of using `env pull`, and counting the cap from current rather than projected.
20. Reading `setup/markets` existing as evidence of what a plan permits.
21. Skipping `storefrontRedirect`, and losing the platform's redirect table without an error to explain it.

---

Last reviewed: 2026-08-06
Next review due: 2026-11-06
