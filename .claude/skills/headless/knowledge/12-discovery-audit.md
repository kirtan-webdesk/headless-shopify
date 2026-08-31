---
tier: 1
load_when: ["platform-headless", "headless-platform-active", "g0-intake-stage", "g0.5-audit-stage", "audit-active", "g1-plan-stage"]
description: "The mandatory seven-point compatibility audit per D-HL-DISCOVERY-01, completed and signed off before the SOW is priced on every engagement type except New Build. The seven points are user-supplied and are reproduced here in their ratified order: app compatibility, customer accounts and SSO (including the Multipass build path), runtime compatibility, analytics and marketing, CMS and content management, middleware requirements, and development and maintenance impact. Produces discovery-audit.md, whose dropped-functionality column is client-signed (ruled v1.11.21) — that column only, not the whole audit. Incomplete audit blocks pricing under D-QA-GATE-BLOCK semantics."
applies_to: [headless]
decision_refs: [D-HL-DISCOVERY-01, D-KB-FIDELITY-01, D-HL-APPS-01, D-HL-TYPES-01, D-HL-STACK-01, D-HL-ENV-01, D-QA-GATE-BLOCK, INT-001, INT-002]
last_reviewed: 2026-08-06
next_review_due: 2026-11-06
---

# 12 — Discovery Audit (Headless)

> Governing decision: **`D-HL-DISCOVERY-01`** (ratified v1.11.17, rev 3). Canonical text: `_decisions/proposals/headless/D-HL-DISCOVERY-01-proposal.md`.
>
> **The highest-leverage code in the arm: every other headless failure mode is a discovery failure that reached build.**

---

## The binding rule — user-supplied, quoted, never paraphrased

> **"Never assume that an existing Shopify theme feature, app block or third-party app will work in Hydrogen. Verify API, SDK, Customer Account API and Oxygen runtime compatibility before confirming feasibility or estimating development effort. Clearly separate native Shopify capabilities, custom Hydrogen development, third-party integrations and external middleware requirements."**

Three sentences, and the third is the one that gets dropped. **Native Shopify capability, custom Hydrogen development, third-party integration and external middleware are four different cost structures with four different owners.** A line item that blends them cannot be priced, cannot be assigned, and cannot be defended when it overruns.

And the estimating rule that follows, also verbatim: **"Do not estimate a Hydrogen project as a normal theme redevelopment."**

---

## Audit primacy

Data migration is owned by separate WebDesk skills and automation (`D-HL-TYPES-01` scope boundary). That makes **this audit the Headless arm's primary contribution to every non-New-Build engagement**: validate every feature of the existing site against the scope of work, before anything is built, so nothing is missed.

Two consequences:

- **The audit is not a preliminary.** It is the deliverable the rest of the arm depends on, and it is what stops a signed scope from silently omitting something the client is already using.
- Where the audit finds work owned by another skill, it **names the handoff and the confirmation it needs back.** An unhanded-over finding is *this arm's* gate failure, not the other skill's.

| Engagement type | Audit before pricing? |
|---|---|
| 1. New Build | **No** — nothing exists to audit. Environment preflight still applies. |
| 2. Replatform | **Yes** — the largest of the five; backend and frontend both change. |
| 3. Migrate-to-Headless | **Yes** — highest value in the arm. The theme is being removed and everything attached to it must be found first. |
| 4. Redesign | **Yes** — already headless, but the existing integrations, routes and rendering posture constrain what a redesign costs. |
| 5. Framework Upgrade | **Yes** — narrower, but the deprecations between current and target versions *are* the audit. |
| 6. Support / Retainer | **Yes, once**, before the first ticket, on any storefront WebDesk did not build. |

**A quote issued without a required audit is not a conservative quote. It is an unpriced one.**

---

## The seven review points

Point order is ratified and user-supplied. Do not renumber.

### 1. Existing App Compatibility

- List **every** installed app — **from the store admin, not from the client's recollection.**
- For each: does it support headless via API, SDK, storefront component, or documented integration?
- Classify as exactly one of: **Fully compatible / Custom integration required / Replacement required / Requires discovery.**
- Policy and rubric live in `D-HL-APPS-01` → `knowledge/08-app-integrations/`. Default bucket is 4.
- **"Requires discovery" is not a resting state.** Every item in that bucket is timeboxed and resolved before pricing, or carried into the SOW as an explicit assumption with a **named risk owner** (`HL-APPS-001`).

Payments, shipping and tax are always manual per `INT-001` / `INT-002` and are never bucket 1 on the strength of an app listing.

**Publication scoping — record it here** *(verified, register §17)*. Which channel will the new storefront query, and which markets does it serve? The Storefront API returns only products published to **both** the sales channel **and** the market being queried. On a store where an existing storefront stays live, **publication is the mechanism that scopes what the new storefront sees** — so *"dedicated products and collections for the headless channel"* is a real, configurable capability, and its owner is named here.

Unpublished resources are *"omitted from connections and not found when queried by handle or ID"* — **no error**. A catalogue that looks short at launch is a publication question before it is a code question.

### 2. Customer Accounts and SSO

- Determine which is in use: **new** customer accounts, **legacy** accounts, Shopify B2B, Multipass, or an external SSO/IdP.
- Validate Customer Account API compatibility. Verified prerequisites: Headless **or** Hydrogen sales channel installed, and Shopify customer accounts enabled.
- Flag unsupported or limited authentication workflows.

**The blocker to catch here:** Multipass requires **Shopify Plus** *and* **legacy customer accounts**. The Customer Account API requires **new** customer accounts. **Mutually exclusive.** A client on Multipass SSO moving to headless is doing an **authentication re-architecture, not a frontend port.** Discovering this after signature is a project-threatening change order.

Also verified: the Customer Account API does **not** support `localhost` or any `http` URL in development — a tunnel is required. Environment prerequisite, see `knowledge/11-environment-preflight.md`.

#### 2a. Multipass — documented build path

Multipass is **not** a blocker-only item. The arm carries a build path so a Multipass requirement is a **priced decision** rather than a discovery dead end.

**What it actually does** *(register §6b)*: an external system mints an encrypted, signed, **15-minute single-use** token containing the customer's email (plus optional name, addresses, tags), then redirects to `/account/login/multipass/[token]`. Shopify logs the customer in, **creating the account if it does not exist.** No customer database sync required.

**The premise to correct at discovery.** Multipass is usually requested for "one login across our stores." Shopify answers this directly: **"No, Multipass cannot be used to log in between multiple Shopify stores without redirection to an external site."** Multipass runs **external IdP → one store.** A genuine multi-store single-login requirement is satisfied by making the *external IdP* the shared identity and minting a **separate Multipass token per store.** If the client has no external IdP, the requirement is "build an IdP" — its own project, named in the SOW before anyone estimates a storefront.

**The Hydrogen build path** *(verified)*: Shopify publishes a cookbook recipe converting a Hydrogen app from Customer Account API auth to the **legacy customer account flow** — Storefront API `customerAccessTokenCreate`, customer access token in the session cookie, form-based register / login / password-recovery / account pages. Multipass lands the customer into that legacy session model. The recipe is first-party maintained; **reference it, do not duplicate it.**

**What it costs — state all four in the SOW, not one:**

1. **Shopify Plus.** Not negotiable, not workaroundable.
2. **Legacy customer accounts only.** The Customer Account API is off the table for that store.
3. **Storefront↔checkout auth continuity is lost.** Quoted: *"This legacy authentication strategy will not maintain authentication between your Hydrogen storefront and checkout."* The customer is logged into the storefront and **is not logged into checkout.** Whatever the client expects at checkout — saved addresses, saved payment, order-history continuity — is re-confirmed against that, in writing, before pricing.
4. **Shopify recommends against it.** *"Consider migrating to the new Customer Account API for better security and features."* A deprecated path is a maintenance liability that belongs in the maintenance line item, not a footnote.

**Discovery output for any Multipass project:** current IdP (or its absence), which stores are in scope, the exact checkout expectation **in the client's words**, and an explicit signed acknowledgement of cost 3.

**Build sequencing.** The two halves are built at different times:

| Half | Build when | Rationale |
|---|---|---|
| **Discovery half** — this section: the questions, the four costs, the premise correction, the sign-off | **Now.** Already written; costs nothing further. | Protects every SOW from the moment the arm ships, including SOWs where Multipass turns out not to be needed. |
| **Implementation half** — legacy flow wiring, token minting, session handling | **Deferred** until a named Plus client with a real requirement exists | Deprecated path; a speculative guide is stale before use. Shopify's cookbook is first-party maintained, so deferring costs little. |

A recommendation, not a restriction — if a Multipass client lands during buildout, the implementation half moves up. That is an escalation trigger.

### 3. Runtime Compatibility

The source framing was "Oxygen Runtime Compatibility." Correct for A; B, C and D have their own ceilings, so the point generalises.

- Review all Node.js packages and server-side dependencies.
- Identify dependencies requiring Node-specific APIs the target runtime does not provide.
- Recommend a runtime-compatible alternative, or **move the work to an external backend.**

**Architecture A (Oxygen) — verified hard ceilings:**

| Constraint | Limit |
|---|---|
| Worker bundle | **10 MB or less** |
| Startup time | **400 ms or less** |
| CPU time per request | **30 s** |
| Memory | **128 MB** |
| Custom env vars | **110** |
| Outbound request completion | **2 min** |

Oxygen is a **`workerd`-based worker runtime, not Node.** Anything assuming Node built-ins, long-lived processes, a filesystem, or background timers is **disqualified before it is written.**

**Architectures B / C / D:** the host's own limits apply (Vercel function duration and size, Netlify, Fly, Cloudflare Workers). These are verified **per project** against the host's current published limits. **The arm must not hard-code them** — they change.

**Rule:** a dependency audit that has not actually been run against the target runtime does not count as a review point. **Reading a package's README is not verification; a build that fits under the ceiling is.**

### 4. Analytics and Marketing

- Identify required GA4, Google Ads, Meta, Klaviyo, pixels and consent tooling.
- Define which tracking events must be **implemented separately in the headless storefront** — in a theme they arrive free via ScriptTag and app embeds; in headless **they are your code.**
- Include **storefront-to-checkout attribution** and consent validation.

**Platform change now IN EFFECT — verified, register §15.** Shopify: *"Script tags were sunset on those pages on August 28, 2025 for Plus stores, and are sunset for non-Plus stores on August 26, 2026."* **Both dates have passed.** ScriptTag functionality on those pages is **already gone**, on every store type. On an audit this is not a risk to flag — it is **behaviour the client may already have lost without an error appearing anywhere.** Ask what was on those pages and whether anyone checked after the date. Scope caution: this concerns the `checkout.liquid`-related pages, **not all ScriptTags everywhere.**

**Why this fails so often:** the client's current analytics work because the theme carries them. **Nothing carries them in headless.** Every event is a build item, and attribution across the storefront→checkout boundary is its own integration, not a checkbox. A client who says "we already have GA4" is describing a theme fact, not a headless one.

### 5. CMS and Content Management

- Confirm how **marketing users** will create and edit pages — **not how developers will.**
- Evaluate Shopify metaobjects and metafields versus an external headless CMS.
- Confirm requirements for: preview, drafts, scheduling, reusable content blocks, localization.

**The decision this forces:** metaobjects are free and native but have **no built-in preview or scheduling workflow.** If the client's marketing team expects to schedule a campaign page with a preview link, that is either an external CMS or a custom build. **Deciding this after the frontend is built is a rewrite**, not a change.

Pilot note: metaobject structure is currently created **manually**. Generating it is a named automation candidate for this arm.

### 6. Middleware Requirements

- Identify ERP, CRM, PIM, OMS, search, reviews, subscriptions and fulfillment integrations.
- Determine whether each can run **within the chosen runtime.**
- **Move heavy processing, scheduled jobs, queues, webhooks and complex synchronization to external middleware.**

On Oxygen the **30 s CPU / 128 MB / 2 min outbound** ceilings make this non-negotiable rather than a preference: **a nightly ERP sync cannot live in the storefront worker.** Where the middleware lives, who owns it, and who pays for it are **SOW line items** — which is sentence three of the binding rule doing its work.

### 7. Development and Maintenance Impact

- Compare headless development against a standard theme implementation.
- Include as **separate lines**: frontend development, API integration, testing, deployment, monitoring, maintenance.
- **"Do not estimate a Hydrogen project as a normal theme redevelopment."** *(verbatim)*

Ongoing cost is **structurally** different. Hydrogen ships on a **CalVer train tied to Storefront API versions**, so version tracking is a recurring obligation, not a one-off. **If no maintenance arrangement exists, the storefront goes stale by default** — say so in the SOW rather than discovering it at renewal. Retainer terms: `D-HL-TYPES-01` §6.

---

## Output artifact — `discovery-audit.md`

Produced in the project outputs. Eight required sections:

1. **App inventory table** — four-way classification with a resolution per row.
2. **Authentication finding** — current state, target state, and whether a re-architecture is implied.
3. **Dependency audit result** against the target runtime, with the **measured** bundle size for architecture A.
4. **Analytics event inventory** — which events, which surface, who builds them.
5. **CMS decision** with rationale, including the preview/scheduling verdict.
6. **Middleware inventory** — what runs in-runtime, what moves external, who owns and pays.
7. **Effort-impact statement** naming the delta versus a theme build.
8. **Handoff register** — every finding owned by another skill (data migration and its dependents), who it went to, and the confirmation required back before cutover.

**Gate behaviour:** an incomplete `discovery-audit.md` **blocks SOW pricing**, in the same class as `D-QA-GATE-BLOCK`.

### Who signs it — **RULED v1.11.21**

**The client signs the dropped-functionality column. Only that column, not the whole audit.**

One signature line, on section 4 of the artifact. The remaining seven sections are internal working product.

The reasoning, so nobody "improves" it later into a full-audit signature: the rest of the audit is vendor detail a client has **no basis to approve** — runtime ceilings, dependency verdicts, token classes — and requesting a signature on it invites line-by-line negotiation of technical findings by someone not equipped to have that argument. The dropped column is the opposite: it is purely *"here is what you have today and will not have after launch,"* it is the one section a client can assess on their own terms, and it is **the exact document that prevents the UAT dispute.**

An audit whose dropped column is unsigned at pricing is not a completed audit.

**Still open — one question, and this window may not answer it:**

| Open question | Status |
|---|---|
| The gate ID and position for the discovery block (pre-G0, or a G0 sub-step alongside `D-PM-04`'s `sow-spec.md` read) | **Unassigned.** This window cannot define gates. Until master assigns one, the block is enforced under `D-QA-GATE-BLOCK` semantics without a gate ID of its own. |

*Note for a future sweep: `D-HL-DISCOVERY-01`'s own reconciliation section still records the signer question as "pending master ratification." The canonical inventory records it as ruled in v1.11.21. Per the `D-KB-FIDELITY-01` precedence rule, **the inventory wins on status** — this file follows the inventory.*

---

## Pilot baseline — what "without the skill" produced

Recorded so the arm can be measured against it, **not as a target**:

- Shopify default system pages retained, UI-only adjustments.
- Footer newsletter on Shopify default functionality.
- Contact Us page on Shopify default form functionality.
- Metaobject structure generated with Claude assistance; **currently added manually**.
- Cart drawer built to the provided design.

**What the arm must add over this baseline:** the seven-point audit before pricing (absent in the pilot), the four-way app classification, the runtime dependency audit, and an automated path for metaobject structure generation. **If the arm ships without those, it has not improved on the pilot.**

---

## Failure behaviour

| Situation | Correct behaviour |
|---|---|
| Required audit not run | **Do not price.** No range, no ballpark, no "conservative" number. |
| An app cannot be classified | Bucket 4. Timeboxed and resolved, or into the SOW as an explicit assumption **with a named risk owner**. Never priced as bucket 1. |
| A theme-carried behaviour has no owner in the new stack | It is a build item with a number, or it is dropped and recorded as dropped. |
| Declared architecture contradicts a verified store fact | Mode 3 — **halt and surface the evidence.** Never switch silently. `knowledge/00-overview.md` §3. |
| An open `TODO-VERIFY` governs a scope decision | Name it as an open question. Do not estimate against it or quote it (`HEADLESS-HALLUCINATION-01`). |
| A finding was handed to another skill | Not closed until the **confirmation comes back**. Handoff without confirmation is this arm's failure. |

---

## Anti-patterns *(lifted verbatim from `D-HL-DISCOVERY-01`)*

1. Confirming feasibility from an app's marketing page instead of its API docs.
2. Taking the app list from the client instead of the store admin.
3. Leaving items in "Requires discovery" at the time of pricing.
4. Assuming a theme-app-extension has a headless equivalent.
5. Assuming analytics carry over because the client "already has GA4."
6. Choosing metaobjects without asking marketing about preview and scheduling.
7. Planning a nightly ERP sync inside an Oxygen worker.
8. Auditing dependencies by reading READMEs instead of building against the target runtime.
9. Discovering Multipass after the SOW is signed.
10. Presenting a headless estimate benchmarked against a theme build.
11. Answering a "one login across our stores" requirement with Multipass alone — it runs external IdP → one store, not store to store.
12. Quoting a Multipass build without the client signing off that storefront login does not carry into checkout.
13. Treating a finding as closed because it was handed to another skill, with no confirmation received back.

**Added by this KB file, not from the decision:**

14. Renumbering or re-ordering the seven review points. They are user-supplied and are cited by number.
15. Quoting the binding rule without its third sentence — the one that separates native capability, custom development, third-party integration and middleware into four cost structures.

---

Last reviewed: 2026-08-06
Next review due: 2026-11-06
