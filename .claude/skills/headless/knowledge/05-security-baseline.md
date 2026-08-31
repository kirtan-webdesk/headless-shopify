---
tier: 1
load_when: ["platform-headless", "headless-platform-active", "code-production", "g1-plan-stage", "g4-sprint-qa", "g6-prelaunch-stage", "agent-code-review"]
description: "Headless security baseline per D-HL-SEC-01. Token classification across both backends, environment-variable discipline by framework prefix, CSP/CORS/cookies, cart and money integrity, Customer Account API and Multipass exclusivity, webhook verification, server-layer rate limiting and its store-wide blast radius, supply chain, and the five-check blocking ship gate. Mandatory on all four architectures."
applies_to: [headless]
decision_refs: [D-HL-SEC-01, D-HL-STACK-01, D-HL-ENV-01, D-HL-APPS-01, D-QA-GATE-BLOCK]
last_reviewed: 2026-08-06
next_review_due: 2026-11-06
---

# 05 — Security Baseline (Headless)

> Governing decision: **`D-HL-SEC-01`** (ratified, v1.11.17). Enforcement codes: `knowledge/09-forbidden.md`. Every figure traces to `pointers/verified-facts.md`.
>
> **Mandatory on all four architectures, including A.** Oxygen being managed reduces the surface; it does not remove the baseline.

---

## 1. What actually changed

In a theme, the platform owns the server, the TLS, the CSP defaults, the session and the secret store. **There is nowhere for a developer to put a secret that reaches the browser, because there is no bundler.** That single structural fact is doing more security work than most teams realize.

Headless removes it. There is now a bundler, a server you deploy, an env store you configure, and a set of routes you wrote.

| Architecture | What the platform still gives back |
|---|---|
| **A** — Hydrogen + Oxygen | Managed runtime, TLS, platform-side deploy. Env var store with a **110** custom-variable cap (register §1). Secrets, CSP, CORS, cookies, rate limiting and webhook verification are still ours. |
| **B / C / D** — self-host | **Nothing.** And per `D-HL-STACK-01`, the **client owns the hosting account by default** and may decline managed service. |

That last row is the reason this file exists as a written baseline rather than a habit: in B, C and D the security posture is routinely handed to someone who did not build it. Every B/C/D SOW carries the ratified line — *"Client owns hosting, monitoring and incident response. WebDesk responds on request at prevailing hourly rates, no response-time commitment."* — and the handover includes this baseline as a runbook, not as a link.

---

## 2. Token classification

The most consequential table in this arm. Get a row wrong and the failure is silent.

| Token | Class | May it reach the browser? | Where it lives |
|---|---|---|---|
| Shopify Storefront API **public** access token | Public | **Yes** — designed for it | Client bundle. Rate-limited by Shopify **per-IP** *(no register entry — unverified)*. |
| Shopify Storefront API **private** (delegate) token | **Secret** | **No** | Server env only |
| Customer Account API client secret | **Secret** | **No** | Server env only |
| Shopify **Admin API** access token | **Secret — not in a storefront at all** | **No** | A different service, with a different deploy target. `HL-SEC-005`. |
| Multipass secret | **Secret** | **No** | Server env only, on the identity-issuing service |
| BigCommerce **Storefront** token | Browser class | Browser only, and now **requires CORS origins** | Not for server-to-server. `HL-SEC-006`. |
| BigCommerce **Private** token | **Secret** | **No** | Server env only. **This is the correct token for a Catalyst build's server-side fetching.** |
| BigCommerce **Customer Impersonation** token | **Secret** | **No** | Server env only — the API *"will reject...requests that originate from a web browser."* |
| BigCommerce **Store API** (`X-Auth-Token`) | **Secret** | **No** | Not in a storefront codebase. `HL-SEC-005`. |
| Webhook signing secrets | **Secret** | **No** | Server env only |

**The test that resolves every argument:** *"If this repository were public on GitHub tomorrow, what could an attacker do?"* If the answer is anything other than *"read products at the same rate limit as any visitor,"* a secret is in the wrong place.

### BigCommerce private tokens — the specifics (register §11)

Scopes: Unauthenticated, Customer, B2B. No CORS origins. Server-environment only. `expires_at` is a unix timestamp with **no maximum lifetime** — BigCommerce's words: *"It is possible to create a long-lived token that does not expire."*

A non-expiring token is a **decision with a rotation procedure attached**, not a default. If you create one, the engagement record names who holds it and how it is rotated.

---

## 3. Environment variables

The build tool decides what ships to the browser by **prefix convention**, and the conventions differ per framework:

| Stack | Public prefix |
|---|---|
| Hydrogen (Vite) — A, B | `VITE_` |
| Next.js — C, Catalyst D | `NEXT_PUBLIC_` |

Rules:

- **Never give a secret a public prefix to make the build work.** That error compiles cleanly and ships (`HL-SEC-002` → `HL-SEC-001`).
- Every public-prefixed variable is **justified in writing** as public. Default answer is "this is not public."
- Secrets live in the host's secret store. Not committed. Not in a tracked `.env`. Not pasted into a CI log — CI logs are searchable and retained.
- Oxygen caps custom env vars at **110** (register §1). B/C/D inherit the host's limits — **verify at preflight** (`D-HL-ENV-01`).
- Rotation is a documented per-engagement procedure written before launch, not a thing invented during an incident. The Headless channel supports token rotation (register §3); the procedure uses it.
- A credential that has ever been built into a bundle is **burned** — rotate it, even if the bundle never shipped. Artifact stores and CI caches keep copies.

---

## 4. CSP, CORS, cookies

**CSP.** The theme's implicit policy is gone. A headless app needs an explicit Content-Security-Policy, and every third-party script the client wants — analytics, chat, reviews, consent, personalization — is an explicit allowance.

This work is **unbounded if the script list is unbounded.** The script list belongs in the SOW. "Marketing will send over a few tags" is an open-ended commitment that will be discovered at launch.

At launch the policy is **enforcing, not report-only.** Report-only shipped "temporarily" is report-only permanently.

**CORS.** The storefront's own API routes are not open. A permissive header on a route that proxies commerce data is simultaneously a data-exfiltration vector and a quota-exhaustion vector — see §7.

**Cookies.** Session and cart cookies are the app's responsibility: `Secure` always; `HttpOnly` wherever the value is not read by client JS; `SameSite` set deliberately with the cross-site checkout return path considered; expiry documented. **A starter template's cookie flags are not a decision** — they are a default written by someone who had not met this client.

---

## 5. Cart, session and money integrity

- The cart ID is a **bearer capability**. Anyone holding it can read and modify that cart. Not a secret in the token sense; not public data either. It must not be logged, must not appear in a shareable URL, must not go into an analytics payload (`HL-CART-001`).
- Prices, discounts and totals are **authoritative from the commerce API only**. Client-computed values are display-only and are re-derived server-side before they influence anything (`HL-CART-002`).
- **Never accept a price, discount amount or line-item cost from the client.** There is no shortcut here that is worth its failure mode, and the failure always goes in the customer's favour.
- The platform owns the cart in all four architectures. Client state is a cache of it, never the source of truth (`HL-CART-003`).

---

## 6. Customer Account API and Multipass

- OAuth-based. Requires the **Headless or Hydrogen channel** and customer accounts enabled (register §6). No plan gate documented.
- **`localhost` and plain `http` are not supported in development — a tunnel is required.** This costs an afternoon when discovered late, so it is a preflight item, not a build-day surprise.
- Tokens are stored **server-side in the session**, never in `localStorage`.
- **Multipass exclusivity is an architecture decision, not a toggle.** Multipass requires *legacy* customer accounts; the Customer Account API requires *new* customer accounts. Choosing one closes the other.

Multipass, quoted so it is never softened in a proposal:

- **Shopify Plus only**, **legacy customer accounts only.**
- Token: **15 minutes, single use**, `/account/login/multipass/[token]`. Auto-creates accounts.
- *"No, Multipass cannot be used to log in between multiple Shopify stores without redirection to an external site."*
- The cost that must appear in the quote: *"This legacy authentication strategy will not maintain authentication between your Hydrogen storefront and checkout."*

A client asking for multistore SSO is asking to give up storefront→checkout auth continuity. That trade is theirs to make, in writing, at discovery.

---

## 7. Server-layer rate limiting

Any server route that proxies the commerce API is rate-limited **by us, at our layer** (`HL-SEC-004`). Named limit per route, tested.

**BigCommerce — why this is critical and not hygiene.** All apps installed on a store **share the store's REST quota** (register §9): Pro 60k/hr (450 per 30 s); Plus and Standard 20k/hr (150 per 30 s); Enterprise by plan and resource; 30-second window. An unthrottled proxy route does not degrade our storefront — **exhausting the quota takes down every other app on the store.** The blast radius is the client's whole business.

The GraphQL Storefront API is a different shape (register §9b): complexity **10,000** per request, depth **16**, **no documented request-count quota and no plan gate.** The governing constraint there is query *shape*, not volume — which means a rate limit alone does not protect it; query complexity does.

**Shopify** *(carried from `D-HL-SEC-01`; **no register entry** — unverified vendor behaviour, not quotable to a client)*. A **public** Storefront token is rate-limited per-IP by Shopify. Moving to a **private** token for server-side use pools every visitor onto one bucket and **removes that protection.** If you make that swap, you have taken on the rate limiting yourself — that is the trade, and it is frequently made accidentally.

---

## 8. Webhooks

- **Signature-verified before the payload is parsed.** Not after. Not "usually." (`HL-SEC-003`)
- Verify against the **raw body**. If the framework consumes the body before your handler sees it, your verification is not real — fix the framework configuration, do not work around it.
- **Test the negative case:** a bad signature and a missing signature, both rejected with no side effect. A handler that works on good input and silently proceeds on missing input passes every happy-path test.
- Handlers are **idempotent**. Retries are normal traffic.
- An endpoint that triggers expensive work without verification is a free denial-of-service with our name on the invoice.

---

## 9. Supply chain

- **Dependencies are pinned, and Hydrogen's peer pins are not advisory.** `react-router ~7.16.0` against a published latest of `8.3.0` (register §7) means "latest" is *wrong*, not modern.
- Hydrogen ships on a **CalVer train** aligned to Storefront API versions. An upgrade is an **API-version migration**, which is engagement type 5, not a dependency bump inside a retainer ticket.
- Lockfile committed; CI installs from it.
- Dependency audit runs in CI. A failing audit is a **release blocker**, not a warning to triage later.
- Every third-party script added to the storefront is a supply-chain entry running with the same privileges as our code. It goes through the CSP allowance and the app-classification gate (`D-HL-APPS-01`), not around them.

---

## 10. Ship gate — five checks, all blocking

Carries **`D-QA-GATE-BLOCK`** semantics: a failing check **blocks the release.** It does not generate a ticket.

| # | Check | Pass condition | Code |
|---|---|---|---|
| 1 | **Secret scan of the built client bundle** | Build for production; grep the **emitted bundle** for each secret's *value*. Zero hits. | `HL-SEC-001` |
| 2 | **CSP present and enforced** | Enforcing at launch, not report-only; every allowed origin justified. | — |
| 3 | **All server routes rate-limited** | Named limit per route, tested. | `HL-SEC-004` |
| 4 | **All webhooks signature-verified** | Verified before parse; negative case tested. | `HL-SEC-003` |
| 5 | **Cookie flags and session storage reviewed** | `Secure` / `HttpOnly` / `SameSite` set deliberately; no tokens in `localStorage`. | — |

Check 1 is first because it is the only failure in this arm that is simultaneously silent, complete and irreversible.

Architecture D adds a sixth pre-condition at audit rather than at release: **token class verified as private for all server-to-server fetching** (`HL-SEC-006`), with the **2027-03-31** deadline recorded against any existing build still on storefront tokens.

---

## Anti-patterns

1. Giving a secret a public build prefix to make the build work.
2. Putting an Admin API or Store API credential anywhere in a storefront codebase, including "just for a one-off script."
3. Shipping a starter template's CSP, cookie flags or CORS headers unchanged and calling that a configuration.
4. Launching with CSP in report-only "for the first week."
5. Accepting an open-ended third-party script list into scope without pricing the CSP work it implies.
6. Treating the cart ID as public data — logging it, putting it in a URL, sending it to analytics.
7. Trusting a client-supplied price, discount or total anywhere in the flow.
8. Parsing a webhook payload before verifying its signature, or testing only the valid-signature case.
9. Proxying the commerce API with no rate limit at our layer — on BigCommerce this is store-wide, not storefront-wide.
10. Swapping a Shopify public token for a private one and inheriting an unprotected bucket without noticing.
11. Rate-limiting a GraphQL endpoint by request count and assuming complexity is therefore bounded.
12. Upgrading a peer-pinned dependency because it is newest, or treating a Hydrogen CalVer step as a patch bump.
13. Storing customer access tokens in `localStorage`.
14. Handing hosting to a client who declined managed service without also handing over this baseline as a runbook and getting the SOW line signed.
15. Creating a non-expiring BigCommerce private token with no named holder and no rotation procedure.
16. Treating a Multipass requirement as a configuration toggle rather than a priced architecture decision that costs storefront→checkout auth continuity.

---

Last reviewed: 2026-08-06
Next review due: 2026-11-06
