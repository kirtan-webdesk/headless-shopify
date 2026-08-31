---
doc_type: verification-register
status: REFERENCE (not a decision)
compiled_by: Headless skill-dev window (Claude)
compiled_date: 2026-08-05
rebuilt_date: 2026-08-06
rebuild_note: "Working directory lost all files except D-HL-STACK-01 rev 1. This register was reconstructed from the verification results captured in this window's own record. Every figure below was fetched from a live source on 2026-08-05; the URLs are recorded so any figure can be re-checked in seconds. Items marked TODO-VERIFY were never verified and must not be asserted."
applies_to: [headless]
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

**`TODO-VERIFY`:** GraphQL **Storefront** API limits are not covered by the above — and that is the limit that actually governs a Catalyst build.

---

## Open items — `TODO-VERIFY` before any KB file asserts them

1. **BigCommerce GraphQL Storefront API rate limits.** The governing number for architecture D. Not yet verified.
2. **Checkout branding / checkout UI extensions — are they Plus-gated?** Affects the `D-HL-APPS-01` qualification gate item 5.
3. **Shopify Markets per-plan capabilities.** Needed before the arm says anything about multi-market or multi-currency headless.
4. **Hydrogen release support window.** How long a given CalVer release is supported determines the maintenance cadence quoted in SOWs.
5. **`@shopify/hydrogen-react` current status and version.** This is the bridge library for non-Hydrogen React frontends and therefore load-bearing for architecture C.

**Rule for all five:** an unverified item may be named as an open question. It may not be written as a fact, estimated against, or quoted to a client.

---

Last reviewed: 2026-08-06
Next review due: 2026-11-06
