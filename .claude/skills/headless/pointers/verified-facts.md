---
tier: 1
load_when: ["platform-headless", "headless-platform-active", "g0-intake-stage", "g0.5-audit-stage", "g1-plan-stage", "code-production"]
description: "Verification register for the Headless arm. Every version, limit, plan gate and quota asserted anywhere under skills/headless/** must appear here first with a source URL and a verification date. Includes the open TODO-VERIFY list — an open item may be named as an open question but may not be written as a fact, estimated against, or quoted to a client."
applies_to: [headless]
decision_refs: [D-HL-STACK-01, D-HL-SEC-01, D-HL-ENV-01, D-HL-APPS-01]
doc_type: verification-register
canonical: true
source_packet: "outputs/headless-skill-dev/VERIFIED-FACTS-shopify-bigcommerce.md (proposal-packet copy, historical)"
last_reviewed: 2026-08-06
next_review_due: 2026-11-06
---

# Verified Facts Register — Shopify + BigCommerce Headless

> **This file is not a decision.** It is the source of truth behind every number in the Headless arm.
>
> **The rule:** if a number, plan gate, or version appears in any `skills/headless/**` file, it must appear here first, with a source URL and a verification date. Nothing in the arm is written from memory.
>
> **Re-verify quarterly.** Version numbers in §7 go stale fastest.

---

## 1. Oxygen runtime limits — VERIFIED

Source: <https://shopify.dev/docs/storefronts/headless/hydrogen/fundamentals>

| Constraint | Limit |
|---|---|
| Worker bundle size | **10 MB or less** |
| Worker startup time | **400 ms or less** |
| CPU time per request | **30 s** |
| Memory | **128 MB** |
| Custom environment variables | **110** |
| Outbound request completion | within **2 min** |

Static asset limits (separate from the worker bundle): images 20 MB, video 1 GB, 3D models 500 MB, other files 20 MB.

**Resolves the team's "10 MB theme zip" claim.** There is no theme zip in a Hydrogen storefront — there is no theme. The 10 MB figure is the **Oxygen worker bundle cap**, and the correct framing is: *"If your Oxygen worker bundle exceeds 10 MB, your Hydrogen deployment fails."* It is a deploy-time failure, not an upload limit.

---

## 2. Oxygen plan availability — VERIFIED

Source: <https://shopify.dev/docs/storefronts/headless/hydrogen/fundamentals>

Oxygen is included **at no extra cost** on: Starter, Basic, Grow, Advanced, Plus, and Pause-and-build.

Quoted exclusion: **"isn't available on Agentic plans."**

**Consequence:** headless on Shopify does **not** require Plus. Any KB sentence implying it does is a defect.

---

## 3. Headless channel — VERIFIED

Source: <https://shopify.dev/docs/storefronts/headless>

| Fact | Value |
|---|---|
| Cost | Free |
| Provider | Shopify first-party sales channel |
| Grants | Storefront API access + Customer Account API access |
| Tokens | Public **and** private access tokens, with **rotation** supported |
| Cap | **"maximum of 100 active storefronts and access tokens per shop"** |
| Plan gate | None documented |
| What it does **not** do | Build, host, or provide the frontend |

---

## 4. Which sales channel each architecture needs — VERIFIED

| Architecture | Channel required |
|---|---|
| **A** — Hydrogen + Oxygen | **Hydrogen** channel |
| **B** — Hydrogen + self-host | **Headless** channel |
| **C** — Headless channel + Next.js | **Headless** channel |
| **D** — BigCommerce Catalyst | n/a — BigCommerce channel configuration |

Linking a Hydrogen storefront: `npx shopify hydrogen link`, then `npx shopify hydrogen env pull`.

**Failure mode this prevents:** installing the Hydrogen channel for a self-hosted build. Same framework, wrong channel, and the resulting token errors do not name the cause.

### 4b. Node version — a live example of why `TODO-VERIFY` exists

| Source | Stated requirement |
|---|---|
| Shopify Hydrogen getting-started documentation page | **"Node.js v16.20+"**, npm v8.19+ |
| `npm view @shopify/cli-hydrogen@13.0.3 engines` | **`{ node: '^22 \|\| ^24' }`** |
| `npm view @shopify/hydrogen@2026.4.4 engines` | *(no `engines` field declared)* |

Node 16 reached **end of life in September 2023**.

**Binding consequence:** the environment preflight reads the pinned toolchain's `engines` field, never a documentation page. See `D-HL-ENV-01` check 1.

---

## 5. Self-hosting Hydrogen — VERIFIED, and carries a documented staleness warning

Source: Shopify self-hosting guide, `shopify.dev`

Named supported hosts: **Vercel, Netlify, Fly.io, Cloudflare Workers**.

Required conversion work, quoted or paraphrased from the guide:
- **"Remove Oxygen-specific packages and code"**
- Reconfigure `server.js`, `react-router.config.ts`, `vite.config.ts`, and possibly `app/entry.server.tsx`
- The custom server entry must **"create a Hydrogen context and pass it through `getLoadContext`"**

**Warning carried in the guide, quoted verbatim:**

> **"This guide might not be compatible with features introduced in Hydrogen version 2025-05 and above."**

Current Hydrogen is **2026.4.4** (§7). Shopify's own instructions for this path are documented as potentially about a year behind the release.

---

## 6. Customer accounts, Customer Account API, Multipass — VERIFIED

Sources:
- <https://shopify.dev/docs/storefronts/headless/building-with-the-customer-account-api/getting-started>
- <https://shopify.dev/docs/api/customer-authentication/multipass>
- <https://shopify.dev/docs/storefronts/headless/bring-your-own-stack/b2b>

| Fact | Value |
|---|---|
| Customer Account API prerequisite | Headless **or** Hydrogen channel installed |
| Customer Account API prerequisite | Shopify **customer accounts** feature enabled ("required to use the Customer Account API") |
| Local dev | `localhost` and any `http` URL **not supported** — tunnel (e.g. ngrok) required |
| Multipass plan gate | **"Your store must be on a Shopify Plus plan."** |
| Multipass account-type gate | **"Multipass login is only available with legacy Customer accounts"** — must be explicitly selected in admin |
| B2B plan gate | Docs say only "a plan that supports B2B capabilities" — Plus is **not** named as the requirement on the headless B2B page |
| B2B account gate | "B2B only works with customer accounts" |

**Mutually exclusive pair (discovery blocker):** Multipass requires *legacy* customer accounts; the Customer Account API requires *new* customer accounts. A client on Multipass SSO cannot simply move to the Customer Account API — that is a re-architecture of authentication, not a port. This must be caught at discovery, not in build.

### 6b. Multipass mechanics and the headless build path — VERIFIED 2026-08-05

Sources:
- <https://shopify.dev/docs/api/customer-authentication/multipass>
- <https://shopify.dev/docs/storefronts/headless/hydrogen/cookbook/legacy-customer-account-flow>

| Fact | Value |
|---|---|
| What Multipass is for | **"Manage the authentication of customers across multiple applications to provide a single login experience."** |
| Flow | External system builds an encrypted + signed token containing customer data (email required; optional name, addresses, tags) → browser redirected to `/account/login/multipass/[token]` → Shopify logs the customer in, creating the account if it does not exist |
| Token lifetime | **15 minutes**, **single use** |
| External customer DB sync required? | No — accounts are auto-created on first redirect |
| **Store-to-store login?** | **"No, Multipass cannot be used to log in between multiple Shopify stores without redirection to an external site."** |
| Plan gate | Shopify Plus only (see §6) |
| Account-type gate | Legacy customer accounts only (see §6) |

**Direction of travel:** Multipass bridges **one external identity system → one Shopify store**. It is not a store-to-store SSO mechanism. A multi-store single-login requirement is satisfied by the *external IdP* being the shared identity, with a separate Multipass token minted per store — not by Multipass linking stores.

**Legacy customer account flow in Hydrogen — a supported path exists:**

| Fact | Value |
|---|---|
| Artifact | Shopify Hydrogen cookbook recipe: **"converts a Hydrogen app from the new Customer Account API authentication to the legacy customer account flow using deprecated customer endpoints in Storefront API"** |
| Mechanism | Storefront API `customerAccessTokenCreate`; customer access token stored in the session cookie; form-based register / login / password recovery / account management |
| **Cost, quoted** | **"This legacy authentication strategy will not maintain authentication between your Hydrogen storefront and checkout"** |
| Shopify's own position | Deprecated — **"Consider migrating to the new Customer Account API for better security and features"** |

**Net:** Multipass + Hydrogen is buildable and first-party-documented, but it is a deprecated path that costs storefront↔checkout auth continuity and requires Plus. It is a *priced architecture decision*, not a configuration toggle.

---

## 7. Hydrogen / React Router versions — VERIFIED (npm registry, 2026-08-05)

```
npm view @shopify/hydrogen version          → 2026.4.4        (dist-tag: latest)
npm view @shopify/cli-hydrogen version      → 13.0.3
npm view react-router version               → 8.3.0           (latest on npm)

npm view @shopify/hydrogen@2026.4.4 peerDependencies
{
  vite:                '^5.1.0 || ^6.2.1 || ^7.0.0 || ^8.0.0',
  react:               '^18.3.1 || ~19.0.3 || ~19.1.4 || ^19.2.3',
  'react-router':      '~7.16.0',
  '@react-router/dev': '~7.16.0'
}
```

**Two facts that matter more than the numbers:**

1. **Hydrogen ships on a CalVer train** (`2026.4.x`) aligned to Storefront API versions — not SemVer. An "upgrade" is therefore an **API-version migration** with a support window, not a dependency bump. This is what makes Framework Upgrade a real project type.
2. **Hydrogen peer-pins react-router `~7.16.0`** while react-router's own latest is **8.3.0**. Scaffolding a Hydrogen project against React Router 8 because it is newest is a defect, not a modernisation.

React Router is the framework Hydrogen is built on top of — Hydrogen's foundation has moved twice (own runtime → Remix → React Router), which is the basis for the framework-churn risk in `D-HL-STACK-01`.

---

## 8. BigCommerce Catalyst — VERIFIED

Source: BigCommerce Catalyst documentation, `docs.bigcommerce.com`

| Fact | Value |
|---|---|
| Framework | **Next.js** with **React Server Components** |
| Data layer | **GraphQL Storefront API** |
| Hosting | **"can be deployed to any hosting provider that supports Node.js"**; minimal infrastructure dependencies |
| On Vercel | **"Vercel Runtime Cache is used automatically... without requiring external KV storage setup"** |
| BigCommerce-hosted equivalent to Oxygen | **None exists** |

**Consequence:** hosting and DevOps ownership sits with WebDesk or the client in *every* Catalyst engagement and must be named in the SOW. Off Vercel, the caching layer is explicitly designed and owned before build — it is not free.

---

## 9. BigCommerce API rate limits by plan — VERIFIED (REST only)

Source: BigCommerce API rate limits documentation, `docs.bigcommerce.com`

| Plan | REST limit |
|---|---|
| Enterprise | By plan and resource |
| Pro | 60,000/hr (450 per 30 s) |
| Plus & Standard | 20,000/hr (150 per 30 s) |
| Unlimited Rate Plan | None |

Window refreshes every **30 seconds**. **All apps installed on a store share the store's quota.**

**Consequence for `D-HL-SEC-01`:** an unrate-limited server route that proxies the commerce API is a store-wide denial-of-service vector, because exhausting the quota takes down every app on the store, not just the storefront.

### 9b. GraphQL **Storefront** API limits — VERIFIED 2026-08-06 *(closes `TODO-VERIFY` 1)*

Sources:
- <https://docs.bigcommerce.com/developer/docs/storefront/guides/graphql-storefront-api/overview>
- <https://docs.bigcommerce.com/developer/docs/overview/api-fundamentals/rate-limits>

| Constraint | Limit |
|---|---|
| Query **complexity** per request | **10,000** — *"The API sets a complexity limit of 10,000 for each request to prevent excessive loads"* |
| Query **depth** | **16** — *"The limit is 16. Queries must not exceed the query depth limit and the complexity limit"* |
| Requests per hour | **None documented.** No request-count quota is published for the GraphQL Storefront API. |
| Plan gating | **None documented** — unlike REST, the Storefront API limits are not stated per plan. |

**This changes the shape of the architecture-D risk, and the change is the useful part.** The REST picture (§9) says "watch your request volume, and your plan tier decides how much you get." The GraphQL Storefront picture says the opposite: **the governing constraint is query *shape*, not request volume, and it is not plan-gated.** A Catalyst storefront is far more likely to be broken by one over-nested category→products→variants→options query than by traffic.

**Binding consequences:**
- `D-HL-ENV-01` check D3 verifies the **deepest and most complex query in the build** against depth 16 and complexity 10,000 — not "the rate limit."
- Architecture D pricing does **not** need a plan-tier question for the storefront data layer. It still does for anything on REST (§9), and REST quota is shared store-wide.
- The unrate-limited-proxy vector in `D-HL-SEC-01` §7 is a **REST** concern. It is not mitigated by the GraphQL numbers above and stands unchanged.

---

## 10. `@shopify/hydrogen-react` — VERIFIED 2026-08-06 *(closes `TODO-VERIFY` 5)*

Sources: <https://shopify.dev/docs/api/hydrogen-react>; npm registry, re-checked 2026-08-06.

```
npm view @shopify/hydrogen-react version    → 2026.4.3   (dist-tag: latest)
time.modified                               → 2026-06-08T16:55:50.936Z
deprecated                                  → (field absent — NOT deprecated)

peerDependencies
{
  react:       '^18.3.1 || ~19.0.3 || ~19.1.4 || ^19.2.3',
  'react-dom': '^18.3.1 || ~19.0.3 || ~19.1.4 || ^19.2.3',
  vite:        '^5.1.0 || ^6.2.1 || ^7.0.0 || ^8.0.0'
}
```

| Fact | Value |
|---|---|
| Status | **Alive and current.** Same CalVer train as Hydrogen (`2026.4.x`), one patch behind `@shopify/hydrogen` 2026.4.4. Not deprecated. |
| What it is, quoted | *"Hydrogen React is a performant, framework-agnostic library of React components, reusable functions, and utilities for interacting with Shopify's Storefront API"* |
| Framework coupling, quoted | *"It's bundled with Hydrogen, but can be used by any React-based web app"*; *"published separately as a standalone package so that it can be used by other React-based frameworks"* |
| **No `react-router` peer** | This is the load-bearing detail. Hydrogen peer-pins `react-router ~7.16.0` (§7); hydrogen-react pins **nothing** router-shaped. That absence is exactly what makes it consumable from Next.js App Router. |
| What Hydrogen adds on top, quoted | *"standard routes, caching strategies, redirects, and SEO"* |

**Consequence for architecture C.** The technical hard-stop lifts: C has a maintained, first-party, explicitly framework-agnostic data layer, and the "must build yourself" inventory is now a **known, bounded list** — routing, caching strategy, redirects and SEO — rather than an unknown. C stays **SUPPORTED-ON-DEMAND**, but for the commercial reason master gave (no named client), not a technical one. If a named C client lands, the KB is writable.

**What this does not license:** hydrogen-react being framework-agnostic does not make C equivalent to A or B. The four things Hydrogen supplies are four things a C engagement builds and maintains, per project, forever.

---

## 11. BigCommerce Storefront token deprecation for server-to-server — VERIFIED 2026-08-06

Source: <https://docs.bigcommerce.com/developer/docs/storefront/guides/graphql-storefront-api/authentication>

**Quoted:** *"Storefront tokens used in server-to-server contexts are deprecated."*

| Date | What happens | Status as of 2026-08-06 |
|---|---|---|
| **2026-06-30** | Storefront tokens can no longer be **created** without CORS origins | **This date has already passed.** |
| **2027-03-31** | Storefront tokens without origins will **no longer be accepted** | ~8 months out |

| Token type | Where it may be used | Notes |
|---|---|---|
| **Storefront token** | **Browser-side only**, going forward. CORS origins now required at creation. | Public-facing. Not for s2s. |
| **Private token** | **Server-to-server and headless.** No CORS origins required. | **Sensitive — server env only.** Scopes: Unauthenticated, Customer, B2B. `expires_at` takes a unix timestamp; **no maximum lifetime is stated** and *"It is possible to create a long-lived token that does not expire."* |
| **Customer impersonation token** | **Server-to-server only.** Quoted: the *"API will reject...requests that originate from a web browser."* | Highest sensitivity. |

**Why this is in the register and not just a footnote:** it changes the default answer for architecture D. A Catalyst build's server-side data fetching uses a **private token**, not a storefront token, and the first deprecation milestone is already behind us — so this is not a future migration, it is the current correct build. Any architecture-D material written against storefront-token s2s would be wrong on the day it shipped.

**Binding consequences:**
- `D-HL-SEC-01` token classification table gains the BigCommerce private token and customer-impersonation token as **server-env-only** classes, alongside the Store API `X-Auth-Token`.
- A private token with no expiry is a permanent credential. The register's own rule applies: *if this repository were public on GitHub tomorrow, what could an attacker do?* — the answer for a non-expiring private token is "everything the scope allows, indefinitely." **Set `expires_at`.**
- Any existing BigCommerce integration WebDesk inherits at discovery is checked for storefront-token s2s use. That is a dated, named remediation item with a **2027-03-31 hard deadline**, and it belongs in the discovery audit output rather than being found at renewal.

---

## 12. Hydrogen 2026.4.4 API surface, cache strategies and CLI — VERIFIED 2026-08-06

Source: the **published npm packages themselves** (`npm pack` + published `.d.ts` and sourcemap `sourcesContent`), not documentation. Where docs and the published artifact disagree, the artifact governs — see §4b for why that rule exists.

### 12a. Versions and peers — `@shopify/hydrogen@2026.4.4`

```
version = 2026.4.4        dist-tags.latest = 2026.4.4
peerDependencies:
  vite:                '^5.1.0 || ^6.2.1 || ^7.0.0 || ^8.0.0'
  react:               '^18.3.1 || ~19.0.3 || ~19.1.4 || ^19.2.3'
  react-router:        '~7.16.0'
  '@react-router/dev': '~7.16.0'
```

`@shopify/cli-hydrogen@13.0.3` → `engines: { node: '^22 || ^24' }`. Confirms §4b: the docs' "Node.js v16.20+" is contradicted by the pinned artifact.

**Both `react-router` and `@react-router/dev` are pinned to `~7.16.0`** while react-router's published latest is `8.3.0` (§7). Two pins, not one — an upgrade that moves only one breaks.

### 12b. Exported API surface (from published `.d.ts`)

`createHydrogenContext`, `createStorefrontClient`, `createCartHandler`, `cartGetIdDefault`, `cartSetIdDefault`, `createCustomerAccountClient`, `storefrontRedirect`, `CacheNone`, `CacheShort`, `CacheLong`, `CacheCustom`, `generateCacheControlHeader`, `InMemoryCache`.

Package export paths: `.`, `./vite`, `./oxygen`, `./storefront-api-types`, `./storefront.schema.json`, `./customer-account-api-types`, `./customer-account.schema.json`, `./react-router-types`, `./react-router-preset`.

**These names may be used in KB files and code examples. Any Hydrogen export not on this list must be verified before it is named.**

### 12c. Cache strategy default values — the surprising one

Extracted from the published sourcemap's `sourcesContent`:

| Strategy | Returns |
|---|---|
| `CacheNone()` | `{ mode: NO_STORE }` |
| `CacheShort()` | `{ mode: PUBLIC, maxAge: 1, staleWhileRevalidate: 9 }` |
| `CacheLong()` | `{ mode: PUBLIC, maxAge: 3600, staleWhileRevalidate: 82800 }` — comments in source read `// 1 hour` and `// 23 Hours` |
| `CacheCustom(opts)` | passes `opts` through unchanged |

`CacheShort` and `CacheLong` accept overrides merged after the defaults, and both call `guardExpirableModeType` on the override.

**Why this entry exists.** `CacheShort` is **1 second** fresh with a **9 second** stale-while-revalidate window. Nearly everyone guesses minutes. A KB file or a developer assuming "short means a few minutes" mis-sizes cache behaviour and origin load in the same direction, and nothing in the name signals it. This is a textbook `HEADLESS-HALLUCINATION-01` candidate — a plausible number that would never have been questioned.

### 12d. CLI command surface — `@shopify/cli-hydrogen@13.0.3`

Enumerated from the package's `dist/commands/hydrogen` directory:

`build`, `check`, `codegen`, `customer-account/push`, `debug/cpu`, `deploy`, `dev`, `env/list`, `env/pull`, `env/push`, `g`, `generate/route`, `generate/routes`, `init`, `link`, `list`, `login`, `logout`, `preview`, `setup`, `setup/css`, `setup/markets`, `setup/vite`, `shortcut`, `unlink`, `upgrade`.

Confirms `D-HL-ENV-01` check **A3** (`link` + `env pull` both exist). Also notable: `debug/cpu` exists and is the tool for the 400 ms startup / 30 s CPU ceilings (§1); `upgrade` exists and is the CalVer migration path; `setup/markets` exists but **Shopify Markets per-plan capability remains open item 3 — the command existing is not evidence of what any plan permits.**

---

## 13. Catalyst toolchain packages — VERIFIED 2026-08-11

Source: the **npm registry and the published packages**, not documentation.

| Package | Version | `engines` | Notes |
|---|---|---|---|
| `@bigcommerce/create-catalyst` | **2.0.3** (`latest`, modified 2026-07-24) | **`{ node: '^24.0.0' }`** | Scaffolder. Depends on `@bigcommerce/catalyst ^1.2.0`. |
| `@bigcommerce/catalyst` | **1.2.0** (`latest`, modified 2026-07-24) | **`{ node: '^20.0.0 \|\| ^22.0.0 \|\| ^24.0.0' }`** | Declares `@opennextjs/cloudflare: 1.17.3` as a peer, pinned exact. |
| `@bigcommerce/catalyst-client` | **1.0.2** (`latest`, modified 2026-06-01) | — | Storefront GraphQL client. Deps: `@0no-co/graphql.web`, `std-env`. No peers. |
| `@bigcommerce/catalyst-core` | **DOES NOT EXIST** | — | npm 404. **Do not name it.** A plausible-sounding package that isn't real. |

### 13a. The toolchain contradicts itself on Node

**`create-catalyst` requires `^24.0.0`. The `@bigcommerce/catalyst` package it depends on accepts `^20.0.0 || ^22.0.0 || ^24.0.0`.** The wrapper is stricter than the thing it wraps.

**Cross-architecture consequence, and it is the practical one:** Hydrogen's CLI declares `^22 || ^24` (§12a). A workstation or CI image standardised on **Node 22 for Hydrogen work cannot run the Catalyst scaffolder.** An agency doing both A/B and D needs **Node 24** to cover both, or per-project version management. This belongs in `D-HL-ENV-01` check 1 for architecture D and it is not discoverable from either project in isolation.

This is the **second** live instance of the arm's governing rule — §4b was docs-versus-artifact; this is artifact-versus-artifact inside one toolchain. **Read `engines` from the package you are actually invoking.**

### 13b. `@bigcommerce/catalyst-client@1.0.2` exported surface

From the published `.d.ts`: `createClient`, `Client`, `removeEdgesAndNodes`, `BigCommerceAPIError`, `BigCommerceAuthError`, `BigCommerceGQLError`, `InvalidCustomerAccessTokenError`, `MissingCustomerAccessTokenError`.

**These names may be used. Any other Catalyst client export must be verified before it is named.**

The two customer-token error classes are worth noting: the client models missing-token and invalid-token as **distinct** failures, which is the distinction a session-expiry path has to handle correctly.

### 13c. Cloudflare via OpenNext

`@bigcommerce/catalyst@1.2.0` declares `@opennextjs/cloudflare` at an **exact pin, `1.17.3`**. So the register's *"can be deployed to any hosting provider that supports Node.js"* (§8) coexists with a specific, pinned Cloudflare path.

**Consequence:** a Cloudflare deployment of Catalyst is a **worker runtime**, not a Node runtime — the same runtime-family distinction that governs architecture B. The dependency audit runs against the actual target runtime. **An exact pin also means the adapter version is not yours to choose**, and it is a compatibility surface to re-check at every upgrade.

**Not verified and not asserted:** which hosts BigCommerce officially supports, what OpenNext supports, and whether Cloudflare is a recommended or merely possible target. The pin is evidence the path exists. It is not evidence of support posture.

---

## 14. Checkout surface — plan gating PARTIALLY VERIFIED 2026-08-12 *(partially closes open item 2)*

Source: <https://shopify.dev/docs/api/checkout-ui-extensions/latest>

> **"Checkout UI extensions for the information, shipping, and payment steps are available only to stores on a Shopify Plus plan."**

**Not a blanket yes or no, which is why guessing either way would have been wrong.**

| Surface | Status |
|---|---|
| Checkout UI extensions — **information, shipping, payment step targets** | **VERIFIED Plus-only.** Assertable. |
| Checkout UI extensions — other targets | **NOT STATED.** Absence of a restriction is not a grant. |
| **Checkout branding / styling** | **STILL OPEN.** <https://shopify.dev/docs/apps/build/checkout/index> states no plan eligibility for branding. |

`D-HL-APPS-01` gate question 3 **narrows; it does not close.**

*Signal, not evidence:* a Shopify Community thread titled *"Checkout UI Extensions Shopify Plus Requirement Doc Inconsistencies"* exists. Nothing asserted from it — recorded because it independently suggests the docs are inconsistent here, which is why this item resisted closing and why it should be re-verified rather than trusted from one page.

---

## 15. `checkout.liquid` ScriptTag sunset — VERIFIED 2026-08-12 — **NOW IN EFFECT**

Source: <https://shopify.dev/docs/apps/build/checkout/index>

> **"Script tags were sunset on those pages on August 28, 2025 for Plus stores, and are sunset for non-Plus stores on August 26, 2026."**

| Store type | Sunset | State as of 2026-08-27 |
|---|---|---|
| **Plus** | 2025-08-28 | **In effect** |
| **Non-Plus** | **2026-08-26** | **IN EFFECT — passed yesterday** |

**This is no longer a deadline to plan around. It is a change that has already happened.**

Both dates have now passed. Any audit of any store — Plus or not — that finds ScriptTag-based functionality on those pages is looking at functionality that **is already gone**, not functionality at risk. The question is not *"does this survive going headless"* and no longer *"when does this break"*; it is **"what replaced it, and did anyone notice?"**

A non-Plus client who has not looked at those pages since 26 August may have lost behaviour without an error appearing anywhere.

**Scope caution:** the quote concerns the `checkout.liquid`-related pages its source page covers. **Not a blanket statement about all ScriptTags everywhere.**

---

## 16. Hydrogen versioning and bundle-size tooling — VERIFIED 2026-08-12

Sources: <https://shopify.dev/docs/api/hydrogen/latest> · <https://shopify.dev/docs/storefronts/headless/hydrogen/debugging/bundle-size>

### 16a. Versioning — confirms the CalVer model, does **not** close open item 4

> **"Hydrogen is tied to specific versions of the Storefront API, which is versioned quarterly."**
> **"If a Storefront API version includes breaking changes, then the corresponding Hydrogen version will include the same breaking changes."**

**Confirms the arm's type-5 argument from a first-party source** — an upgrade inherits the API's breaking changes by construction. **Quarterly** is the cadence a retainer's CalVer-tracking obligation runs against.

**Open item 4 stays OPEN, and the absence is itself now a finding:** the versioning page states **no support window, no concurrent-version count, no end-of-support schedule.** It is not documented where a reader would most expect it. **Cadence is not support duration** — do not infer one from the other.

### 16b. Bundle size — the method for check A4

The page **states no numbers**, deferring to the fundamentals page — register §1's source. **The 10 MB figure has one home, not two.**

What it gives is the **method**, which A4 previously lacked:

- **`npx shopify hydrogen build`** prints *"the size of the app bundle in the terminal, along with a summary of the top dependencies and app files that make up the bundle."*
- It emits **`dist/server/server-bundle-analyzer.html`** — interactive composition charts.

Documented reduction levers: import only the needed portions of a package; find smaller alternatives; replace SDKs with direct API calls; serve frontend dependencies from a CDN rather than bundling.

**A4 can be run, not merely required.**

---

## 17. Publication scoping — VERIFIED 2026-08-27 *(closes `HL-CAP-002`)*

Source: <https://shopify.dev/docs/api/storefront/latest/queries/product>

> **"The Storefront API will automatically limit your query to products that are published in any applicable catalogs."**
>
> **"Unpublished products will behave just like they were archived or deleted: they will be omitted from connections and not found when queried by handle or ID."**
>
> **"If your app is a sales channel to which products can be published, then the Storefront API will only return products that are published both to your sales channel *and* the market you're querying for."**

### 17a. Two conditions, not one

This is the detail worth the verification. It is **not** simply "publish it to the channel":

| Condition | Consequence if unmet |
|---|---|
| Published to **your sales channel** | Product absent |
| Published to **the market being queried** | Product absent — **even when it is published to the channel** |

**Both must hold.** A multi-market storefront can have a product correctly published to the Headless channel and still absent from one market's queries. Nothing distinguishes the two causes at the API surface.

### 17b. Why it is a silent, launch-day-shaped failure

*"Omitted from connections and not found when queried by handle or ID."* **No error. No empty-with-a-reason. The product behaves exactly as though it were archived or deleted.**

The merchant sees the product in admin and it looks fine. The developer sees a `null` and starts debugging a query that is correct. **The failure presents as an application bug and is a configuration fact**, which is why it can burn a day before anyone checks the right thing.

### 17c. What this obligates

- **Publication scoping is a preflight item, not a build item.** Confirm at preflight that the products, collections and other resources the storefront renders are published to the channel it queries — and to the markets it serves.
- **A `null` product or a short collection is a publication question before it is a code question.** Check publication first; it is the cheaper check by a wide margin.
- **On any engagement where an existing storefront stays live**, publication is also the mechanism that scopes what the new storefront sees — which is what makes "dedicated products for the headless channel" a real capability rather than a wish.
- The **market** half interacts with open item 3 (Shopify Markets **per-plan capability**, still OPEN). The behaviour above is verified and assertable; **what any given plan permits in Markets is not.** Do not merge the two.

---

## Open items — `TODO-VERIFY` before any KB file asserts them

| # | Item | Status |
|---|---|---|
| 1 | BigCommerce GraphQL Storefront API rate limits | ~~open~~ **VERIFIED 2026-08-06 → §9b.** Complexity 10,000, depth 16, no request quota, no plan gate. |
| 2 | Checkout branding / checkout UI extensions — Plus-gated? | **PARTIALLY CLOSED 2026-08-12 → §14.** UI extensions for information/shipping/payment steps = **Plus-only, verified, assertable**. **Branding still OPEN**; unnamed targets not stated. |
| 3 | Shopify Markets per-plan capabilities | **OPEN.** Nothing about multi-market or multi-currency headless may be written until this lands. |
| 4 | Hydrogen release support window | **STILL OPEN — and now verified as *undocumented*** on the versioning page (§16a). Quarterly cadence verified; cadence is not support duration. Determines maintenance cadence quoted in SOWs and the CalVer-tracking obligation in `D-HL-TYPES-01` §6. |
| 5 | `@shopify/hydrogen-react` current status and version | ~~open~~ **VERIFIED 2026-08-06 → §10.** 2026.4.3, not deprecated, framework-agnostic, no router peer. |

**Commercial effect of closing 1 and 5:** master's *"cannot quote"* hold on **architecture D** can lift — the governing constraint is now a verified number. The hold on **C** was always two things bundled together; the technical half is resolved, the commercial half (no named client) is not, so **C remains not-quotable and deferred**. Items 2, 3 and 4 remain open and their scope of blockage is unchanged.

**Rule, unchanged:** an unverified item may be named as an open question. It may not be written as a fact, estimated against, or quoted to a client.

---

Last reviewed: 2026-08-06
Next review due: 2026-11-06 (§7 and §10 version numbers go stale fastest; §11 has a hard 2027-03-31 milestone)
