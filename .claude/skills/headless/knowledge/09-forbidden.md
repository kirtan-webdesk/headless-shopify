---
tier: 0
load_when: ["platform-headless", "headless-platform-active", "code-production", "agent-code-review", "g4-sprint-qa", "g6-prelaunch-stage"]
description: "Forbidden patterns for the Headless arm. HEADLESS-HALLUCINATION-01 covers both unverified facts and — per D-KB-FIDELITY-01 — divergence from ratified decision content. Full rule text for the CRITICAL codes HEADLESS-HALLUCINATION-01, HL-SEC-001..006, HL-APPS-001..004, HL-CACHE-001..003, HL-CART-001..003, HL-ISR-001..002 — each with the condition that trips it, the gate it blocks, how to detect it, and the fix. These block gates under D-QA-GATE-BLOCK semantics; they do not generate tickets."
applies_to: [headless]
decision_refs: [D-KB-FIDELITY-01, D-HL-SPEC-01, D-HL-SEC-01, D-HL-APPS-01, D-HL-ENV-01, D-HL-STACK-01, D-HL-DISCOVERY-01, D-QA-GATE-BLOCK]
last_reviewed: 2026-08-06
next_review_due: 2026-11-06
---

# 09 — Forbidden Patterns (Headless)

> **Tier 0 — always loaded when this arm is active.** These are gate blockers, not guidance.
>
> Codes sit inside the ranges master reserved in v1.11.17 and v1.11.18: `HEADLESS-*`, `HL-SEC-001..010`, `HL-APPS-001..008`, `HL-CACHE-*`, `HL-CART-*`, `HL-ISR-*`. **No code outside those ranges may be invented in this arm.** If a rule needs a prefix that does not exist yet, escalate — do not improvise one.
>
> Global rules still apply on top of these: `_spine/shared-knowledge/forbidden-global.md`. This file is additive, never a replacement.

---

## How to read a rule

| Field | Meaning |
|---|---|
| **Blocks** | The gate that fails. Failure carries `D-QA-GATE-BLOCK` semantics — **halt, do not ticket.** |
| **Detect** | The specific check. A rule with no mechanical check is a wish, not a gate. |
| **Applies to** | Which of the four architectures. "All" means all four, including A. |

A rule fires on the **condition**, not on intent. "We meant to fix it before launch" is not a pass.

---

## HEADLESS — the hallucination guard

### `HEADLESS-HALLUCINATION-01` — Unverified API surface, limit, plan gate or version asserted

- **Blocks:** **every gate.** G0.5 pricing, G1 plan, G4 build, G6 release — whichever the assertion reaches first. **Applies to:** all.
- **Condition:** any API field, query, mutation, runtime limit, plan gate, quota, or version number is asserted in an estimate, a client-facing document, a KB file, or code — and does **not** appear in `pointers/verified-facts.md` with a source URL and a verification date.
- **Detect:** for each number, capability claim or API identifier in the artifact, find its entry in the register. No entry, or an entry with no source URL, is a fail. A `TODO-VERIFY` entry is also a fail: **an open item may be named as an open question; it may not be written as a fact, estimated against, or quoted to a client.**
- **Fix:** verify against the live primary source, add the entry with URL and date, then assert. If it cannot be verified, it stays an open question and the dependent scope is held.

**Why this arm needs its own guard, and why it is arguably the worst version of the problem in the system.** A theme-arm hallucination usually fails loudly — the Liquid object does not exist, the page breaks in review. A headless hallucination fails *commercially*: an invented Storefront API field, a misremembered Oxygen limit or an imagined plan gate goes into an estimate, a client signs it, and the error surfaces during build as unpriced work. **Nothing crashes. A number was simply wrong, and it was wrong in a signed document.**

Two live proofs sit in the register right now, both of which a confident guess would have gotten wrong in the *safe-sounding* direction:

- Shopify's own documentation says Node **v16.20+**, while the pinned CLI's `engines` field says **`^22 || ^24`** and Node 16 reached end of life in 2023. Trusting the doc — the more authoritative-looking source — produces a broken environment.
- BigCommerce **storefront tokens are deprecated for server-to-server** use, with the first milestone already behind us and the second dated **2027-03-31**. The pattern still works today, which is exactly why it gets written into a new build.

### Extension — ratified decision content *(`D-KB-FIDELITY-01`, v1.11.20)*

The guard covers **two** classes, not one. Class A is verified facts, above. **Class B is ratified decision content**, and it is the class this arm shipped a defect through in v1.11.19.

- **Condition:** KB content backed by a D-code diverges from the ratified decision — a verbatim rule paraphrased or truncated, a numbered list short an item or reordered, a check ID renumbered so it means something different, a documented halt response dropped, or an **open question answered locally**.
- **Detect:** diff the KB file against the decision in `_decisions/proposals/headless/` **before delivery**, reconciled against `_decisions/decision-inventory.md` for anything master has ruled on since. Cite the proposal path in the file header.
- **The rule is not "match the inventory summary."** Summaries deliberately abbreviate. The proposal is authoritative for numbered and named content; the inventory is authoritative for what has since been **ratified, closed or superseded**. Where they disagree, the inventory wins on status and the proposal wins on detail.
- **Answering an open question locally is the most serious form.** It is not a documentation error, it is a **decision-authority failure** — the KB starts issuing rulings master has not made.

**Why removing something can be worse than adding it.** A rule written *stricter* than ratified reads as the safe direction and is not: a gate harsher than the decision gets overridden in practice, and a team that learns to override one gate rule stops treating the others as binding. Dropping halt response 3 from `D-HL-ENV-01` did exactly that.

**The two classes fail differently.** A wrong number breaks a build or a quote. Wrong decision content breaks the *authority chain* — it looks ratified, cites a D-code, passes the validator, and nobody re-reads it. That is why it survived a release.

**The register outranks memory, and it outranks the docs.** Where a vendor doc and a live artifact disagree, record both in the register and treat the live artifact as governing — that is precisely the case the Node contradiction documents.

---

## HL-SEC — secrets, credentials, request integrity

### `HL-SEC-001` — Secret present in the built client bundle

- **Blocks:** G6 / release. **Applies to:** all.
- **Condition:** the literal value of any server-only credential appears in the production build output.
- **Detect:** build for production, then grep the emitted bundle for each secret's *value* — not its variable name. Zero hits required. **Grep the build output, never the source.** Source-level review does not catch this class; the bundler is what leaks it.
- **Fix:** move the read server-side, rebuild, re-scan, then **rotate the leaked credential**. A secret that has been built into a bundle is burned even if the bundle never shipped — CI caches and artifact stores keep copies.
- **Why it is check 1 of the ship gate:** it is the one failure in this arm that is simultaneously silent, complete, and irreversible.

### `HL-SEC-002` — Server-only credential carrying a public build prefix

- **Blocks:** G6 / release, and G4 on review. **Applies to:** all.
- **Condition:** a secret is exposed via a framework's public-env convention — `VITE_` (Vite / Hydrogen), `NEXT_PUBLIC_` (Next.js / Catalyst, architectures C and D).
- **Detect:** enumerate every public-prefixed variable in the host's env and in `.env*`; each one must be justified in writing as public. Default answer is "this is not public."
- **Fix:** rename without the prefix and move the read to a server route or loader.
- **Note:** this compiles cleanly and ships. There is no error message. It is the most common route to `HL-SEC-001`, which is why it is a separate code with its own check.

### `HL-SEC-003` — Webhook payload parsed before signature verification

- **Blocks:** G6 / release. **Applies to:** all.
- **Condition:** any inbound webhook handler that deserializes, logs, branches on, or persists the body before the signature check passes.
- **Detect:** read every webhook handler top-down. Then send a request with a deliberately bad signature and confirm rejection with no side effect. **Test the negative case** — a handler that verifies correctly on good input and silently proceeds on missing signature passes the happy-path test.
- **Fix:** verify against the raw body first, return early on failure. Note that some frameworks consume the raw body before your handler sees it; if you cannot get the raw bytes, the verification is not real.
- **Also required:** handlers are idempotent. Retries are normal traffic, not an exception path.

### `HL-SEC-004` — Commerce-API proxy route with no rate limit at our layer

- **Blocks:** G6 / release. **Applies to:** all.
- **Condition:** a server route that forwards to the Storefront/GraphQL/REST API has no named, tested limit.
- **Detect:** enumerate server routes that touch the commerce API; each needs a documented limit and a test that trips it.
- **Why it is critical, not hygiene:** on BigCommerce **all apps installed on a store share the store's REST quota** (register §9). An unthrottled proxy does not degrade our page — it takes down every other app on the client's store. The blast radius is the client's whole business.
- **Shopify-specific** *(carried from `D-HL-SEC-01`; **no register entry** — treat as unverified vendor behaviour, do not quote to a client until it is verified)*: a Storefront **public** token is rate-limited per-IP by Shopify. A **private/delegate** token used server-side pools every visitor onto one bucket, which *removes* that protection. Using a private token means you have taken on the rate limiting yourself.

### `HL-SEC-005` — Admin API credential present in a storefront codebase

- **Blocks:** G4 and G6. **Applies to:** all.
- **Condition:** a Shopify Admin API token or a BigCommerce Store API `X-Auth-Token` appears anywhere in the storefront repository or its runtime env — including "just for a one-off script" and "only in the seed task."
- **Detect:** repo-wide scan of source, CI config, and the host's env var list.
- **Fix:** the operation belongs in a separate service with its own credentials and its own deploy target. There is no correct storefront use of an Admin credential.
- **Test that resolves the argument:** *"If this repository were public on GitHub tomorrow, what could an attacker do?"* If the answer is anything other than "read products at the same rate limit as any visitor," a secret is in the wrong place.

### `HL-SEC-006` — BigCommerce storefront token used for server-to-server requests

- **Blocks:** G4 build, G6 release, and **G0.5 on any audit of an existing Catalyst build**. **Applies to:** D.
- **Condition:** server-side data fetching authenticates with a **Storefront** token rather than a **Private** token.
- **Detect:** identify the token type of every credential the server uses. Storefront tokens are the browser-facing class and now require CORS origins; private tokens carry no CORS origins and are server-env-only.
- **Deadline, not a preference (register §11):** *"Storefront tokens used in server-to-server contexts are deprecated."* **2026-06-30** — storefront tokens can no longer be created without CORS origins (already passed). **2027-03-31** — tokens without origins stop being accepted. An existing build on the old pattern has a dated failure, and it belongs in the audit remediation list with that date attached.
- **Fix:** issue a private token, scope it (Unauthenticated / Customer / B2B), store it server-side only, and record its `expires_at`. A non-expiring token is possible and is a decision, not a default.

---

## HL-APPS — the compatibility gate

### `HL-APPS-001` — App priced without a bucket and named evidence

- **Blocks:** **G0.5 / pricing.** **Applies to:** all.
- **Condition:** any app, script, pixel or integration appears in a quote without a classification (1 fully compatible / 2 custom integration required / 3 replacement required / 4 requires discovery) *and* the named evidence behind it.
- **Detect:** the audit artifact has one row per detected app, with a bucket and an evidence field. A blank evidence field is a failure, not a default-pass.
- **The rule that makes this work:** **the default bucket is 4.** No app is compatible until proven compatible. "It has an API" is not evidence. The ratified bar is: **the vendor documents a headless/API path *and the specific capability needed is named in that documentation*.** Endpoints we identified ourselves by inspection do not clear it — that is the inference the evidence bar exists to forbid.
- **Governing text:** `D-HL-DISCOVERY-01`, verbatim — *"Never assume that an existing Shopify theme feature, app block or third-party app will work in Hydrogen. Verify API, SDK, Customer Account API and Oxygen runtime compatibility before confirming feasibility or estimating development effort. Clearly separate native Shopify capabilities, custom Hydrogen development, third-party integrations and external middleware requirements."*

### `HL-APPS-002` — Classification resting on a stale register entry

- **Blocks:** G0.5 / pricing. **Applies to:** all.
- **Condition:** a bucket-1 or bucket-2 call is justified by a shared-register entry older than **90 days**.
- **Detect:** every register-sourced classification carries the entry's verification date; compare against today.
- **Why:** the shared register is **heuristic only and never authoritative**. Apps ship theme-app-extension-only releases and drop headless paths without notice. An entry is a starting hypothesis, not a finding.

### `HL-APPS-003` — Theme-layer surface assumed to survive the move

- **Blocks:** G0.5 / pricing, and G4 if it reaches build. **Applies to:** all.
- **Condition:** a theme app block, script tag, checkout script, theme editor setting, or metafield-driven theme behaviour is carried into scope without a named replacement mechanism in the headless app.
- **Detect:** the audit's dropped-functionality column. Anything that cannot be traced to an owner in the new stack goes in that column, and **the client signs it.**
- **Why:** the theme layer is gone, not replaced. Every theme-layer behaviour that survives does so because someone built it to survive, and that build is billable work that must be in the estimate.

### `HL-APPS-004` — Checkout boundary crossed

- **Blocks:** G0.5 and G4. **Applies to:** all.
- **Condition:** scope includes proxying, reimplementing, wrapping, or "lightly customizing" the checkout in application code.
- **Detect:** search the SOW and the route table for any checkout-owning route.
- **The rule:** **checkout belongs to the platform. Always. In all four architectures.** A requirement that appears to need otherwise is an escalation at discovery, not an implementation task. **Partially verified 2026-08-12 (register §14). The line is narrower than it was, and it is still a line.**

- **Verified, assertable:** *"Checkout UI extensions for the information, shipping, and payment steps are available only to stores on a Shopify Plus plan."* A non-Plus store cannot have them, and scoping one is a defect.
- **Still open, not assertable:** **checkout branding**, and **every target the page does not name.** Absence of a stated restriction is not a grant.

`D-HL-APPS-01` gate question 3 narrows; it does not close. Outside the three named steps the verbatim rule stands: *"Do not assert checkout capability until that item is verified."*

---

## HL-CACHE — caching correctness

### `HL-CACHE-001` — Personalized or authenticated response cached

- **Blocks:** G4 / G6. **Applies to:** all.
- **Condition:** a response that varies by session, customer, cart, or locale is stored in a shared cache, or a cache key omits a parameter that changes the response.
- **Detect:** for each cached route, list every input that changes the output and confirm each appears in the key. Then request the route as two different sessions and diff.
- **Why it is critical rather than a bug:** the failure mode is one customer being served another customer's data. It is a privacy incident, not a stale page.

### `HL-CACHE-002` — Route shipped with no declared caching posture

- **Blocks:** G4. **Applies to:** all.
- **Condition:** a route exists with no recorded rendering strategy *and* cache behaviour.
- **Detect:** the route table. Every route has both, recorded before build. "Whatever the starter template did" is not a declaration.
- **Why:** in a theme, caching was the platform's. In headless it is a design decision on every route, and an undeclared one is a decision made by a template author who had never seen this client's traffic.

### `HL-CACHE-003` — A caching layer assumed to exist

- **Blocks:** G1 / plan, and pricing. **Applies to:** B, C, D — and D on any non-Vercel host.
- **Condition:** the plan or estimate relies on edge caching, image optimization, or ISR infrastructure that the chosen host does not provide.
- **Detect:** name the host, then name the specific product that supplies each assumed capability. Unnamed means absent.
- **Why:** Oxygen supplies a caching layer in architecture A. B, C, and D supply nothing by default. That capability is designed, owned and **priced**, or it is not there — and discovering it at launch is discovering it too late.

---

## HL-CART — cart and money integrity

### `HL-CART-001` — Cart ID exposed

- **Blocks:** G4 / G6. **Applies to:** all.
- **Condition:** the cart ID appears in a URL, `localStorage`, an analytics payload, an error report, or a log line.
- **Detect:** grep the logging and analytics call sites; inspect the network tab on a real session for the ID in any outbound third-party request.
- **Why:** the cart ID is a **bearer capability** — anyone holding it can read and modify that cart. It is not a secret in the token sense and it is not public data either, and treating it as the latter is how it ends up in a shared URL.

### `HL-CART-002` — Client-supplied price, discount or total trusted

- **Blocks:** G4 / G6. **Applies to:** all.
- **Condition:** any monetary value originating in the client influences a persisted cart, an order, or a displayed authoritative total.
- **Detect:** trace every money value in a request body back to its origin. Client-computed totals are display-only and must be re-derived from the commerce API before they influence anything.

### `HL-CART-003` — Cart state owned client-side

- **Blocks:** G4. **Applies to:** all.
- **Condition:** cart contents live in client state as the source of truth, with the commerce API treated as a sync target.
- **Detect:** kill the client state mid-session and reload. The cart must survive because the platform holds it.
- **Why:** the platform's cart is authoritative in all four architectures. A client-owned cart diverges under concurrency, multi-tab use, and price or inventory changes — and it diverges toward the customer's advantage, which is the direction that costs money.

---

## HL-ISR — revalidation

### `HL-ISR-001` — Revalidation window with no purge path

- **Blocks:** G4 / G6. **Applies to:** all, and acutely on B, C, D.
- **Condition:** a page is served from a time-based revalidation window with no mechanism to purge it when the underlying catalog data changes.
- **Detect:** for each revalidated route, name the event that purges it and demonstrate the purge.
- **Why:** prices and inventory go stale **silently**. The customer sees a price that is no longer real, and the first report of the fault arrives from a customer, not from monitoring.

### `HL-ISR-002` — Revalidation interval set without a stated business tolerance

- **Blocks:** G4. **Applies to:** all.
- **Condition:** a revalidation window exists as a number with no recorded answer to "how stale may this page be, per the client?"
- **Detect:** each interval has a one-line justification naming the tolerance it implements.
- **Why:** the interval is a commercial decision about acceptable staleness. Copied from a template, it is a commercial decision made by a stranger.

---

## HL-SPEC — build-versus-spec fidelity

**`HL-SPEC-001` · `HL-SPEC-002` · `HL-SPEC-003` · `HL-SPEC-004`** — full rule text lives in **`knowledge/13-spec-conformance.md` §8**, which is Tier 0 and always loaded alongside this file.

They are cross-referenced rather than duplicated: `13` carries the ledger, the G4 walk and the design-fidelity comparison those codes enforce, and a rule split across two files drifts (`D-KB-FIDELITY-01`).

**Why the prefix exists.** The nineteen codes above this line cover technical correctness and commercial protection. **Every one of them passes on a storefront that delivers the wrong thing correctly.** The K4 pilot proved that in production: four SOW-compliance failures, zero technical failures.

---

## What is *not* in this file

- **Global rules** — `_spine/shared-knowledge/forbidden-global.md` governs everything not headless-specific. This file never restates or overrides it.
- **~~Hallucination guards.~~** *Resolved.* The `HEADLESS-*` prefix was reserved by master in **v1.11.18** after this file flagged the gap, and `HEADLESS-HALLUCINATION-01` is now the first section of this file. Recorded here rather than deleted so the reasoning survives: the arm **declined to invent a prefix** while none was reserved, because an unbacked code looks enforced without being enforceable anywhere else in the system.
- **Per-app wiring.** Policy and classification live here; wiring is the developer's, and app-by-app instructions are stale within a quarter.

---

## Anti-patterns

1. Asserting a number, limit, plan gate or API field from memory instead of from `pointers/verified-facts.md` — `HEADLESS-HALLUCINATION-01`. Confidence is not verification.
2. Writing KB content from memory of a D-code instead of diffing against the proposal in `_decisions/proposals/headless/` — the same guard, class B (`D-KB-FIDELITY-01`).
3. Answering a question the ratified decision marks OPEN. That is a decision-authority failure, not a documentation shortcut.
4. Writing a gate rule stricter than ratified because strict feels safe. A rule harsher than the decision gets overridden, and the habit spreads.
5. Trusting a vendor doc over a live artifact when the two disagree, because the doc looks authoritative.
6. Quoting an open `TODO-VERIFY` item to a client as though the open status were a formality.
7. Treating a code in this file as advisory because the release date is close. These carry `D-QA-GATE-BLOCK` semantics — they halt, they do not become tickets.
8. Running the `HL-SEC-001` scan against source instead of the built bundle, and recording a pass.
9. Rebuilding after a leak without rotating the credential, on the reasoning that the bundle never shipped.
10. Testing webhook verification only with a valid signature.
11. Rate-limiting the storefront's public routes but not the server routes that proxy the commerce API — the reverse of the actual risk.
12. Swapping a Shopify public token for a private one to "fix" rate limiting, without adding the limit that the public token's per-IP bucket was providing.
13. Marking an app bucket 1 because the vendor's marketing page says "API-first."
14. Letting the shared app register act as authority instead of hypothesis, then discovering the theme-app-extension-only release during build.
15. Declaring a route's rendering strategy and leaving its cache behaviour to the framework default.
16. Pricing architecture B, C or D with Oxygen's caching layer silently assumed to exist.
17. Putting the cart ID in an analytics event because it "makes funnel attribution easier."
18. Copying a revalidation interval from a starter template and never asking the client how stale a price may be.
19. Inventing a code prefix — `HEADLESS-*`, `HL-PERF-*`, anything — because a rule needed one. Escalate instead; an unreserved code cannot be enforced by any other arm.
20. Carrying an existing Catalyst build past audit without checking its token class against the 2027-03-31 deadline.

---

Last reviewed: 2026-08-06
Next review due: 2026-11-06
