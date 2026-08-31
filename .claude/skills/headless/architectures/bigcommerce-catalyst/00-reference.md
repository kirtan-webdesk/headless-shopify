---
tier: 1
load_when: ["platform-headless", "headless-platform-active", "headless-arch-d", "g0-intake-stage", "g1-plan-stage", "g3-scaffold-stage", "code-production", "g4-sprint-qa"]
description: "Architecture D reference spec — BigCommerce Catalyst self-hosted. The only non-Shopify architecture in the arm. Covers the verified toolchain and its Node engines contradiction, the private-token requirement and its dated deprecation cutoff, the GraphQL complexity ceiling that governs instead of a request quota, the shared store REST quota and its store-wide blast radius, caching on and off Vercel, the runtime-family question, and what does not transfer from the Shopify architectures."
applies_to: [headless]
decision_refs: [D-HL-STACK-01, D-HL-ENV-01, D-HL-SEC-01, D-HL-APPS-01, D-KB-FIDELITY-01, D-QA-GATE-BLOCK]
last_reviewed: 2026-08-11
next_review_due: 2026-11-11
---

# Architecture D — BigCommerce Catalyst (reference spec)

> **The only non-Shopify architecture in this arm.** Everything Shopify-specific in A and B — the Storefront API, the Hydrogen context, Oxygen's ceilings, the sales-channel question, Multipass — **does not apply here.** Read this file standalone; it is not a delta.
>
> **What does carry across** are the cross-architecture rules in `knowledge/00-12`. They are platform-independent by construction.
>
> Every version, limit and name below traces to `pointers/verified-facts.md` (`HEADLESS-HALLUCINATION-01`).

---

## 1. The toolchain, as verified

Register §13, verified 2026-08-11 from npm:

| Package | Version | `engines` |
|---|---|---|
| `@bigcommerce/create-catalyst` | **2.0.3** | **`^24.0.0`** |
| `@bigcommerce/catalyst` | **1.2.0** | `^20.0.0 \|\| ^22.0.0 \|\| ^24.0.0` |
| `@bigcommerce/catalyst-client` | **1.0.2** | — |

**`@bigcommerce/catalyst-core` does not exist.** It 404s on npm. It is a plausible-sounding name and it is not real — do not write it into a README, a scaffold command, or a client-facing document.

### The Node contradiction — check it before the first install

**The scaffolder demands `^24.0.0`. The package it depends on accepts `^20 || ^22 || ^24`.** The wrapper is stricter than the thing it wraps.

**The cross-architecture consequence is the one that bites an agency doing both.** Hydrogen's CLI declares `^22 || ^24`. A workstation or CI image standardised on **Node 22 for Hydrogen work cannot run the Catalyst scaffolder.** Cover both with **Node 24**, or manage versions per project — but decide it at preflight, not on the morning someone tries to scaffold.

This is the arm's governing rule appearing a second time, in a new form: §4b was documentation contradicting an artifact; this is **one artifact contradicting another inside a single toolchain.** Read `engines` from the package you are actually invoking.

---

## 2. Verified client surface

`@bigcommerce/catalyst-client@1.0.2` exports (register §13b):

`createClient` · `Client` · `removeEdgesAndNodes` · `BigCommerceAPIError` · `BigCommerceAuthError` · `BigCommerceGQLError` · `InvalidCustomerAccessTokenError` · `MissingCustomerAccessTokenError`

**Any other Catalyst client export is verified before it is named.**

Two of these are worth designing around rather than catching generically: `MissingCustomerAccessTokenError` and `InvalidCustomerAccessTokenError` are **distinct classes**. A missing token is an anonymous visitor; an invalid token is an expired or revoked session that must be cleared and re-established. Collapsing them into one handler produces either a login loop or a silently anonymous customer.

`removeEdgesAndNodes` exists because the GraphQL connection shape is pervasive here — it is a flattening helper, not a data-fetching one.

---

## 3. Tokens — the dated one

`knowledge/05-security-baseline.md` §2 has the full table. The D-specific rule, `HL-SEC-006`:

**Server-to-server fetching uses a Private token. Not a storefront token.**

| Token | Use |
|---|---|
| **Storefront** | Browser only. **Now requires CORS origins.** Deprecated for server-to-server. |
| **Private** | **Correct for Catalyst's server-side fetching.** No CORS origins, server-env only. Scopes: Unauthenticated / Customer / B2B. |
| **Customer Impersonation** | Server only — the API *"will reject...requests that originate from a web browser."* |
| **Store API (`X-Auth-Token`)** | Never in a storefront codebase. `HL-SEC-005`. |

**The deprecation has dates, not preferences** (register §11):

- **2026-06-30** — already passed. Storefront tokens can no longer be created without CORS origins.
- **2027-03-31** — tokens without origins stop being accepted.

**An existing Catalyst build on storefront tokens has a dated failure**, and it belongs in the audit remediation list with that date attached (`12-discovery-audit.md`). This is the one D finding that converts directly into a client conversation with a deadline in it.

Private tokens carry `expires_at` as a unix timestamp with **no maximum lifetime** — *"It is possible to create a long-lived token that does not expire."* A non-expiring token is a **decision with a named holder and a rotation procedure**, not a default.

---

## 4. The two rate-limit regimes, and only one of them is a rate limit

This is the section that most changes how D code is written.

### GraphQL Storefront API — shape, not volume

Register §9b:

| | |
|---|---|
| Query complexity | **10,000** per request |
| Query depth | **16** |
| Request-count quota | **None documented** |
| Plan gate | **None** |

**A rate limit does not protect this endpoint. Complexity does.** The deepest planned query is checked at preflight (`D-HL-ENV-01` D4), and nesting multiplies: products → variants → metafields is three multiplied levels before anything renders.

The practical rule from `knowledge/06-data-layer-patterns.md` §3: **flatten before you nest.** Two shallow queries usually cost less complexity than one deep one, and they parallelise.

### REST — a genuine quota, and it is shared

Register §9:

| Plan | Limit |
|---|---|
| Pro | 60,000/hr (450 per 30 s) |
| Plus & Standard | 20,000/hr (150 per 30 s) |
| Enterprise | by plan and resource |

Window is **30 seconds**.

**All apps installed on the store share this quota.** An unthrottled proxy route does not degrade our storefront — **exhausting the quota takes down every other app on the client's store.** The blast radius is the client's whole business, which is why `HL-SEC-004` is critical rather than hygiene here.

---

## 5. Hosting, caching and the runtime family

Register §8: Catalyst *"can be deployed to any hosting provider that supports Node.js"*, with minimal infrastructure dependencies. **There is no BigCommerce-hosted equivalent to Oxygen.** Hosting and operational ownership sits with the client or WebDesk in **every** Catalyst engagement.

**Caching:**

- **On Vercel** — *"Vercel Runtime Cache is used automatically... without requiring external KV storage setup."*
- **Off Vercel** — **nothing.** The caching layer is designed, owned and **priced** before build (`HL-CACHE-003`). `D-HL-ENV-01` check D2.

**Runtime family.** `@bigcommerce/catalyst@1.2.0` declares `@opennextjs/cloudflare` as a peer at an **exact pin, `1.17.3`** (register §13c). So a Cloudflare deployment is a real path — and it is a **worker runtime, not a Node runtime**, which is the same distinction that governs architecture B. Run the dependency audit against the **actual target runtime**, never against "self-hosted" as a category.

The exact pin has its own consequence: **the adapter version is not yours to choose**, and it is a compatibility surface to re-check at every upgrade.

**Not verified, therefore not asserted:** which hosts BigCommerce officially supports, what OpenNext supports, and whether Cloudflare is recommended or merely possible. The pin proves the path exists. It proves nothing about support posture.

**Every host-specific limit is fetched at preflight, never assumed** — function size, execution time, memory, cold start, env var cap.

---

## 6. What does not transfer from A and B

Stated explicitly, because the Shopify architectures are the arm's centre of gravity and the habits travel:

| Shopify concept | In D |
|---|---|
| Storefront API, Hydrogen context, `createHydrogenContext` | **Not applicable.** Different platform, different client. |
| Oxygen's ceilings — 10 MB / 400 ms / 30 s / 128 MB / 110 env vars | **Not applicable.** The host's limits apply. |
| `CacheShort` / `CacheLong` and their 1s/9s and 3600s/82800s values | **Not applicable.** Those are Hydrogen exports. |
| Sales channel (Hydrogen vs Headless) | **Not applicable.** BigCommerce channel configuration instead. |
| Multipass, legacy vs new customer accounts | **Not applicable.** |
| The `VITE_` public prefix | **`NEXT_PUBLIC_`** here — Catalyst is Next.js. |

**What does transfer**, without exception: checkout belongs to the platform; the cart is the platform's and its ID is a bearer capability; no money value originates in the client; every cache key contains every input that varies the response; every app is classified with evidence and the default bucket is 4; webhooks are signature-verified before parse.

---

## 7. Preflight — D-specific

`D-HL-ENV-01` checks D1–D4, plus the register-derived additions:

| Check | Pass condition |
|---|---|
| **D1** | Node-capable host confirmed; BigCommerce channel configured |
| **D2** | **Caching layer designed if not on Vercel** |
| **D3** | GraphQL Storefront limits — **closed 2026-08-06**: complexity 10,000, depth 16, no request quota, no plan gate. Check the **deepest planned query**. |
| **D4** | Store quota sharing understood — all apps share it |
| *added* | **Token class is Private** for all server-to-server fetching (`HL-SEC-006`), with **2027-03-31** recorded against any existing build still on storefront tokens |
| *added* | Private-token lifetime and rotation recorded — named holder, named procedure |
| *added* | **Node version resolved against `create-catalyst`'s `^24.0.0`**, not against the wider range its dependency accepts |

---

## Anti-patterns

1. Naming `@bigcommerce/catalyst-core`. It does not exist.
2. Reading `engines` from `@bigcommerce/catalyst` and concluding Node 20 or 22 will scaffold a project. The scaffolder requires `^24.0.0`.
3. Standardising a workstation or CI image on Node 22 for Hydrogen work and assuming Catalyst will run on it.
4. Using a **storefront** token for server-side fetching because a tutorial did.
5. Carrying an existing Catalyst build past audit without checking its token class against the **2027-03-31** cutoff.
6. Creating a non-expiring private token with no named holder and no rotation procedure.
7. Assuming a request-count rate limit protects the GraphQL endpoint. The governing constraint is **query shape**.
8. Nesting connections until depth 16 or complexity 10,000 is the thing that fails, instead of flattening.
9. Proxying the REST API with no rate limit at our layer — on BigCommerce this is **store-wide**, not storefront-wide.
10. Assuming an off-Vercel Catalyst deployment gets caching for free.
11. Treating a Cloudflare Catalyst deployment as a Node runtime, and running the dependency audit against the wrong runtime family.
12. Treating the exact `@opennextjs/cloudflare` pin as a version you may bump at will.
13. Reading the OpenNext peer pin as evidence of BigCommerce's official support posture. It is evidence a path exists.
14. Catching `MissingCustomerAccessTokenError` and `InvalidCustomerAccessTokenError` in one handler, and producing a login loop or a silently anonymous customer.
15. Carrying Oxygen's ceilings, Hydrogen's cache values, or the `VITE_` prefix into a Catalyst build.
16. Naming a Catalyst client export that is not on the verified list in §2.

---

Last reviewed: 2026-08-11
Next review due: 2026-11-11
