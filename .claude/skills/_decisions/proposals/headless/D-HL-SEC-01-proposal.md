---
proposal_id: D-HL-SEC-01
revision: 2
status: RATIFIED
proposed_by: Headless skill-dev window (Claude)
proposed_date: 2026-08-05
revised_date: 2026-08-06
revision_reason: "Rebuilt after working-directory loss. Rate-limiting section now cites the verified BigCommerce shared-quota fact; hosting-ownership resolution from D-HL-STACK-01 rev 4 referenced."
rebuild_note: "Rebuilt 2026-08-06 from this window's own record. Structure and rules are faithful; exact rev 1 wording is not guaranteed."
ratified_by: master (v1.11.17)
related: D-HL-STACK-01, D-HL-ENV-01, D-HL-APPS-01
applies_to: [headless]
severity: critical
---

# D-HL-SEC-01 (PROPOSED, rev 2) — Headless Security Baseline

## Master reconciliation (v1.11.17)

**Status:** RATIFIED by master 2026-08-07 in v1.11.17. Below-line rulings:

- **Operational-responsibility SOW line for declined-management case:** ~~recommend~~ **RULED v1.11.17 = mandatory boilerplate on every B/C/D SOW:** *"Client owns hosting, monitoring and incident response. WebDesk responds on request at prevailing hourly rates, no response-time commitment."*
- **Unsourced claim flagged v1.11.20:** "Shopify rate-limits public Storefront tokens per-IP" has no register entry. Marked in arm files as unverified and not client-quotable pending verification. Verification pending.
- **HEADLESS-\* prefix range:** ~~escalated separately~~ **RESERVED v1.11.18.** Plus five HL-\* prefix ranges reserved v1.11.17.

Precedence per D-KB-FIDELITY-01 v1.11.21 amendment: **inventory authoritative for status; this proposal authoritative for detail.**

---

> **Status: PROPOSED — awaiting master ratification.**

---

## Decision (one line)

A headless storefront moves security responsibility from Shopify/BigCommerce to **WebDesk's code and the client's hosting**. This baseline is mandatory on every architecture and its ship gate blocks release.

---

## Why this exists

In a theme, the platform owns the server, the TLS, the CSP defaults, the session, and the secret store. There is nowhere for a developer to put a secret that reaches the browser, because there is no bundler.

In a headless storefront **all of that becomes ours**. Architecture A gives some of it back (Oxygen is managed). Architectures B, C and D give none of it back — and per `D-HL-STACK-01` rev 4, the **client owns the hosting account by default** and may decline the managed-service option, which means the security posture is being handed to someone who did not build it. That handoff is exactly why this baseline must be written down rather than held in a developer's head.

---

## 1. Token classification — the single most consequential table in this arm

| Token | Class | May it reach the browser? | Where it lives |
|---|---|---|---|
| Storefront API **public** access token | Public | **Yes** — it is designed for it | Client bundle, rate-limited by Shopify per-IP |
| Storefront API **private** (delegate) access token | **Secret** | **No** | Server env only |
| Customer Account API client secret | **Secret** | **No** | Server env only |
| Admin API access token | **Secret — never in a storefront at all** | **No** | Not in the storefront codebase, period |
| Multipass secret | **Secret** | **No** | Server env only, on the identity-issuing service |
| BigCommerce Storefront API token | Scoped — depends on issuance | Only if issued as a public/customer-impersonation-free token | Verify per token |
| BigCommerce **Store API** (X-Auth-Token) | **Secret** | **No** | Server env only |
| Webhook signing secrets | **Secret** | **No** | Server env only |

**The test that resolves every argument:** *"If this repository were public on GitHub tomorrow, what could an attacker do?"* If the answer is anything other than "read products at the same rate limit as any visitor," a secret is in the wrong place.

---

## 2. Environment variable discipline

- The build tool decides what ships to the browser by **prefix convention**, and the conventions differ per framework: Vite (`VITE_`), Next.js (`NEXT_PUBLIC_`). A secret that accidentally carries a public prefix is published, silently, at build time.
- **Never** give a secret a public prefix "to make it work." That error compiles cleanly and ships.
- Oxygen caps custom env vars at **110** (verification register §1). Architectures B/C/D inherit their host's limits — verify at preflight (`D-HL-ENV-01`).
- Secrets are set in the host's secret store, not committed, not in `.env` files tracked in git, not pasted into a CI log.
- Rotation is a documented procedure per engagement, not a thing discovered during an incident. The Headless channel supports token rotation (verification register §3) — the procedure should use it.

---

## 3. CSP, CORS, cookies

- **CSP:** the theme's implicit policy is gone. A headless app needs an explicit Content-Security-Policy, and every third-party script the client wants (analytics, chat, reviews, consent) is an explicit allowance. This work is unbounded if the script list is unbounded — the script list belongs in the SOW.
- **CORS:** the storefront's own API routes must not be open. A permissive CORS header on a server route that proxies commerce data is a data-exfiltration and quota-exhaustion vector.
- **Cookies:** session and cart cookies are the app's responsibility — `Secure`, `HttpOnly` where the value is not read by client JS, `SameSite` set deliberately, and a documented expiry. Defaults from a starter template are not a decision.

---

## 4. Cart and session integrity

- The cart ID is a **bearer capability**. Anyone holding it can read and modify that cart. It is not a secret in the token sense, but it is not public data either — it must not be logged, must not appear in a URL that gets shared, and must not be placed in an analytics payload.
- Prices, discounts and totals are **authoritative from the commerce API only**. Any client-computed total is display-only and must be re-derived server-side before it influences anything.
- Never accept a price, discount amount or line-item cost from the client.

---

## 5. Customer Account API

- OAuth-based; requires the Headless or Hydrogen channel and customer accounts enabled (verification register §6).
- `localhost` and plain `http` are **not supported** in development — a tunnel is required. This is a setup fact that costs an afternoon if discovered late; it belongs in preflight.
- Tokens are stored server-side in the session, not in `localStorage`.
- The **Multipass exclusivity** applies: Multipass requires *legacy* customer accounts, the Customer Account API requires *new* customer accounts. Choosing one closes the other. That is an architecture decision with a security posture attached (the legacy flow does not maintain auth continuity to checkout — verification register §6b).

---

## 6. Webhooks

- Every inbound webhook is **signature-verified before the payload is parsed**. Not after. Not "usually."
- Webhook endpoints are idempotent — retries are normal, not exceptional.
- A webhook endpoint that triggers expensive work with no verification is a free denial-of-service.

---

## 7. Server-layer rate limiting — the store-wide blast radius

Any server route that proxies the commerce API must be rate-limited by **us**, at our layer.

The reason, from the verification register §9: on BigCommerce, **all apps installed on a store share the store's API quota**. An unthrottled proxy route does not just degrade the storefront — exhausting the quota takes down every other app on the store. The blast radius is the client's whole business, not our page.

Shopify's Storefront API rate-limits public tokens per-IP; a **private** token used server-side pools all traffic onto one bucket, which removes that protection unless we reinstate it.

---

## 8. Supply chain

- Dependencies are pinned. Hydrogen's peer pins are **not advisory** — `react-router ~7.16.0` against a latest of 8.3.0 (verification register §7) means "latest" is wrong, not modern.
- A lockfile is committed and CI installs from it.
- Dependency audit runs in CI and a failing audit is a release blocker, not a warning to triage later.
- Every third-party script added to the storefront is a supply-chain entry with the same privileges as our own code.

---

## 9. Ship gate — five checks, all blocking

| # | Check | Pass condition |
|---|---|---|
| 1 | **Secret scan of the built client bundle** | Grep the production bundle for every secret's value. Zero hits. This is the check that catches the prefix mistake, and it is check 1 because it is the one that ends careers. |
| 2 | **CSP present and enforced** | Not report-only at launch, and every allowed origin justified |
| 3 | **All server routes rate-limited** | Named limit per route, tested |
| 4 | **All webhooks signature-verified** | Verified before parse, test with a bad signature |
| 5 | **Cookie flags and session storage reviewed** | `Secure`/`HttpOnly`/`SameSite` set deliberately; no tokens in `localStorage` |

Fails `D-QA-GATE-BLOCK` semantics: a failing check blocks the release, it does not generate a ticket.

---

## Forbidden prefix request

Reserve `HL-SEC-001` … `HL-SEC-010`. Escalated to master separately.

---

## Anti-patterns

1. Giving a secret a public build prefix to make the build work.
2. Using an Admin API token anywhere in a storefront codebase.
3. Shipping a starter template's CSP, cookie flags or CORS headers unchanged.
4. Treating the cart ID as public data and logging it or putting it in a URL.
5. Trusting a client-supplied price, discount or total.
6. Parsing a webhook payload before verifying its signature.
7. Proxying the commerce API with no rate limit at our layer.
8. Upgrading a peer-pinned dependency to "latest" because it is newest.
9. Storing customer access tokens in `localStorage`.
10. Handing hosting to a client who declined managed service without also handing over the security operations runbook.

---

## Open question requiring an answer before ratification

**Does a declined managed-hosting option also decline the security runbook?** `D-HL-STACK-01` rev 4 resolves who owns the hosting account. It does not resolve who patches, who monitors, and who responds when the secret scan would have caught something post-launch. Recommend every B/C/D SOW carry an explicit operational-responsibility line.

---

## Ask to master

Ratify D-HL-SEC-01 rev 2, reserve the `HL-SEC-` prefix, and rule on the operational-responsibility line.

---

Last reviewed: 2026-08-06
Next review due: 2026-11-06
