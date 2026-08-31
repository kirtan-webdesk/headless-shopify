---
tier: 2
load_when: ["platform-headless", "headless-platform-active", "code-production", "agent-code-review"]
description: "Naming conventions for the Headless arm. Files and directories, routes, GraphQL operations and fragments, server-only module naming as a security affordance, environment variables and their public prefixes, cache keys, types, and the domain vocabulary the arm holds to. Server-only naming is the one convention here that prevents a CRITICAL code rather than an argument."
applies_to: [headless]
decision_refs: [D-HL-SEC-01, D-HL-STACK-01, D-KB-FIDELITY-01]
last_reviewed: 2026-08-06
next_review_due: 2026-11-06
---

# 02 — Naming Conventions (Headless)

> Tier 2 — load on demand. Most of this is convention. **Section 3 is not** — server-only naming is a security affordance, and it is the reason this file exists at tier 2 rather than being folded into `01-coding-standards.md`.

---

## 1. Files and directories

| Thing | Convention |
|---|---|
| Directories | `kebab-case` |
| React components | `PascalCase.tsx`, named for what they render |
| Non-component modules | `kebab-case.ts` |
| Route files | The framework's convention. Do not fight it. |
| Tests | Alongside the subject, `*.test.ts` |
| Generated files | Obviously generated, and gitignored or committed **deliberately** — decide once |

One exported component per file where the component is meaningful on its own. Local sub-components that exist only to structure one render can stay.

---

## 2. Routes

- Route paths mirror the customer-facing URL. A route file whose path does not match the URL it serves is a redirect-map bug waiting to happen (`10-seo-baseline.md`).
- Use the platform's own resource vocabulary — `products`, `collections`, `cart`, `account` — not invented synonyms. Every downstream consumer (analytics, redirect maps, Search Console, the client's own team) already speaks it.
- Dynamic segments are named for what they are: `handle`, `id`. Never `slug` for a Shopify handle — the platform calls it a handle.
- URL casing and trailing-slash policy: decided once, applied everywhere.

---

## 3. Server-only modules — the one that matters

**A module that must never reach the browser says so in its name.**

Use the framework's convention where one exists (`.server.ts` and equivalents) and be consistent where one does not. The point is not the suffix — it is that **importing a server module from client code should be visibly wrong when reading the diff**, before the build catches it and long before the secret scan does.

This is a defence-in-depth layer under `HL-SEC-001` and `HL-SEC-002`. It fails safe: a reviewer who knows nothing else about the codebase can still spot `import { getAdminClient } from './admin.server'` in a client component.

The same logic applies to what lives *next to* what. Server-only modules do not sit in a directory whose other contents are shared.

---

## 4. GraphQL

| Thing | Convention |
|---|---|
| Query operation | `PascalCase`, named for what it fetches — `ProductDetail`, `CollectionGrid` |
| Mutation operation | `PascalCase`, verb-first — `CartLinesAdd` |
| Fragment | Named for the **component that owns it**, so the pairing is obvious |
| Variables | `camelCase`, matching the schema |

**Every operation is named.** Anonymous operations are invisible in API logs, in error reports, and in any conversation about which query is expensive — which on architecture D, where complexity is the governing constraint, is the conversation you will be having.

Do not name a fragment for the data it happens to contain today. `ProductCardFields` survives a field change; `ProductTitleAndPrice` does not.

---

## 5. Environment variables

- `SCREAMING_SNAKE_CASE`.
- Prefix by service, not by usage: `SHOPIFY_STOREFRONT_TOKEN`, not `TOKEN_FOR_PRODUCTS`.
- **Public prefixes are load-bearing and framework-specific** — `VITE_` for Hydrogen, `NEXT_PUBLIC_` for Next.js and Catalyst. A public prefix is a **declaration that this value ships to the browser**, and it is enumerated and justified in writing (`HL-SEC-002`).
- **Never name a secret in a way that makes it sound public**, and never add a public prefix to make a build work. That error compiles cleanly and ships.
- Name the environment in the value's home, not in the variable: one `SHOPIFY_STOREFRONT_TOKEN` per environment, not `SHOPIFY_STOREFRONT_TOKEN_STAGING` in production's config.

---

## 6. Cache keys

Keys are constructed, not concatenated ad hoc.

- One helper builds keys. Every input that varies the response is a named parameter (`HL-CACHE-001`).
- A key reads as a description of what varies: resource, identifier, then every varying dimension — market, locale, currency, segment.
- **A key with an unexplained fragment in it is a key nobody can audit**, and auditing keys is how the privacy failure gets caught before it ships.

---

## 7. Types

- Generated types keep their generated names. Do not rename them into local vocabulary — the mapping cost is paid on every schema regeneration.
- Local types describing our own shapes are `PascalCase` and named for the domain concept.
- Do not prefix interfaces with `I`.
- A type named after a component's props is `ComponentNameProps`.

---

## 8. Domain vocabulary

The arm holds to the platform's words, and to its own where the platforms differ.

| Concept | Say | Not |
|---|---|---|
| Shopify URL key | **handle** | slug |
| Purchasable unit | **variant** | SKU, unless referring to the SKU field itself |
| Grouping | **collection** (Shopify) / **category** (BigCommerce) | interchangeably |
| The four stacks | **architecture A / B / C / D** | "the Vercel one," "the Next one" |
| Engagement kinds | **type 1–6**, by their ratified names | invented labels |
| Buckets | **1–4**, by their ratified names | "green/amber/red" |

**Architecture letters and type numbers are ratified identifiers**, not shorthand. Renaming them locally breaks the citation chain into the decisions (`D-KB-FIDELITY-01`), and "the Vercel one" is ambiguous the moment a C engagement also deploys to Vercel.

---

## Anti-patterns

1. Naming a server-only module so that importing it from client code looks fine in a diff.
2. Putting a server-only module in a directory whose other contents are shared.
3. Adding a public build prefix to a secret to make the build work.
4. Naming a variable in a way that obscures whether its value is secret.
5. Baking the environment into the variable name instead of the value's home.
6. Shipping anonymous GraphQL operations, then being unable to identify the expensive query.
7. Naming a fragment for the fields it contains today rather than the component that owns it.
8. Calling a Shopify handle a slug.
9. Inventing route vocabulary the platform, analytics and the client's team do not already share.
10. A route path that does not match the URL it serves.
11. Concatenating cache keys ad hoc so that no one can audit which dimensions are covered.
12. Leaving an unexplained fragment in a cache key.
13. Renaming generated schema types into local vocabulary, and paying the mapping cost on every regeneration.
14. Referring to architectures as "the Vercel one" — ambiguous the moment C also deploys to Vercel.
15. Substituting local labels for ratified type numbers or bucket numbers, and breaking the citation chain into the decisions.

---

Last reviewed: 2026-08-06
Next review due: 2026-11-06
