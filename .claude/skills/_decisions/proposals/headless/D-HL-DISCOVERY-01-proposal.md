---
proposal_id: D-HL-DISCOVERY-01
revision: 3
status: RATIFIED
proposed_by: Headless skill-dev window (Claude)
proposed_date: 2026-08-05
revised_date: 2026-08-06
revision_reason: "rev 2 — user directive: Multipass must be a documented build path, not only a discovery blocker; adds §2a. rev 3 — user directive 2026-08-06: data migration is owned by separate skills, so the existing-site audit is this arm's primary Replatform contribution; adds the audit-primacy framing and the migration handoff reference. Reconstructed after working-directory loss."
rebuild_note: "Rebuilt 2026-08-06 after the working directory lost all files except D-HL-STACK-01 rev 1. Content is faithful to rev 1 plus the two directives above."
ratified_by: master (v1.11.17)
related: D-HL-STACK-01, D-HL-TYPES-01, D-HL-APPS-01, D-HL-ENV-01, D-QA-GATE-BLOCK
source: "User-supplied Headless Documents.md, 2026-08-05 — 7 mandatory review points"
evidence: outputs/headless-skill-dev/VERIFIED-FACTS-shopify-bigcommerce.md
applies_to: [headless]
severity: high
---

# D-HL-DISCOVERY-01 (PROPOSED, rev 3) — Mandatory Headless Discovery Audit

## Master reconciliation (v1.11.17, v1.11.19, v1.11.20)

**Status:** RATIFIED by master 2026-08-07 in v1.11.17. Below-line rulings:

- **Multipass build path (§2a):** discovery-half build now; implementation-half deferred until named Plus client requires. Ratified in v1.11.17.
- **Verbatim binding rule:** three sentences, all required. Sentence 3 truncated in v1.11.19 KB fold; restored v1.11.20.
- **Audit signer — open question:** re-opened v1.11.20; Headless window recommendation on record (client sign-off on dropped-functionality column only, not whole audit) — pending master ratification.

Precedence per D-KB-FIDELITY-01 v1.11.21 amendment: **inventory authoritative for status; this proposal authoritative for detail.**

---

> **Status: PROPOSED — awaiting master ratification.**
>
> This code encodes the seven review points the user supplied on 2026-08-05. It is the **highest-leverage code in the packet**: every other headless failure mode is a discovery failure that reached build.

---

## Decision (one line)

For every headless project type except New Build, a **seven-point compatibility audit is completed and signed off before the SOW is priced**. Feasibility is never confirmed and effort is never estimated on assumption.

---

## The binding rule (preserve verbatim — user-supplied)

> **Never assume that an existing Shopify theme feature, app block or third-party app will work in Hydrogen. Verify API, SDK, Customer Account API and Oxygen runtime compatibility before confirming feasibility or estimating development effort. Clearly separate native Shopify capabilities, custom Hydrogen development, third-party integrations and external middleware requirements.**

This sentence is the arm's operating principle. It is quoted in `SKILL.md`, in `00-overview.md`, and at the head of the discovery KB file. It is not paraphrased.

---

## Audit primacy *(added rev 3, user directive 2026-08-06)*

Data migration is owned by separate WebDesk skills and automation (`D-HL-TYPES-01` scope boundary). That makes **this audit the Headless arm's primary contribution to every non-New-Build engagement**: validate every feature of the existing site against the scope of work, before anything is built, so nothing is missed.

Two consequences:

- The audit is not a preliminary. It is the deliverable that the rest of the arm depends on, and it is what stops a signed scope from silently omitting something the client is already using.
- Where the audit finds work that belongs to another skill (data migration, and the parts of URL/credential handling that go with it), it **names the handoff and the confirmation it needs back**. An unhanded-over finding is this arm's gate failure, not the other skill's.

---

## The seven review points

### 1. Existing App Compatibility

- List **every** installed app — from the store admin, not from the client's recollection.
- For each: does it support headless via API, SDK, storefront component, or documented integration?
- Classify each as exactly one of: **Fully compatible / Custom integration required / Replacement required / Requires discovery**.
- Policy and the classification rubric live in **D-HL-APPS-01**.
- **"Requires discovery" is not a resting state.** Every item in that bucket is timeboxed and resolved before pricing, or carried into the SOW as an explicit assumption with a named risk owner.

### 2. Customer Accounts and SSO

- Determine which is in use: new customer accounts, legacy accounts, Shopify B2B, Multipass, or an external SSO/IdP.
- Validate Customer Account API compatibility. Verified prerequisites: Headless **or** Hydrogen sales channel installed, and Shopify customer accounts enabled.
- Flag unsupported or limited authentication workflows.

**The blocker to catch here:** Multipass requires **Shopify Plus** *and* **legacy customer accounts**. The Customer Account API requires **new customer accounts**. These are mutually exclusive. A client on Multipass SSO moving to headless is doing an **authentication re-architecture**, not a frontend port. Discovering this after signature is a project-threatening change order.

Also verified: the Customer Account API does **not** support `localhost` or any `http` URL in development — a tunnel (e.g. ngrok) is required. This is an environment prerequisite, see `D-HL-ENV-01`.

#### 2a. Multipass — documented build path *(added rev 2 per user directive)*

Multipass is **not** treated as a blocker-only item. The arm carries a build path so a Multipass requirement is a priced decision rather than a discovery dead end.

**What Multipass actually does** *(verified — evidence register §6b)*: an external system mints an encrypted, signed, **15-minute single-use** token containing the customer's email (plus optional name, addresses, tags), then redirects the browser to `/account/login/multipass/[token]`. Shopify logs the customer in, **creating the account if it does not exist**. No customer database sync is required.

**The premise to correct at discovery:** Multipass is often requested for "one login across our stores." Shopify's own documentation answers this directly — **"No, Multipass cannot be used to log in between multiple Shopify stores without redirection to an external site."** Multipass runs **external IdP → one store**. A genuine multi-store single-login requirement is satisfied by making the *external IdP* the shared identity and minting a **separate Multipass token per store**. If the client has no external IdP, the requirement is "build an IdP," and that is its own project — name it in the SOW before anyone estimates a storefront.

**The Hydrogen build path** *(verified)*: Shopify publishes a cookbook recipe converting a Hydrogen app from Customer Account API auth to the **legacy customer account flow** — Storefront API `customerAccessTokenCreate`, customer access token in the session cookie, form-based register/login/password-recovery/account pages. Multipass lands the customer into that legacy session model.

**What it costs — state all four in the SOW, not one:**

1. **Shopify Plus.** Not negotiable, not workaroundable.
2. **Legacy customer accounts only.** The Customer Account API is off the table for that store — the mutual exclusivity above, restated as a consequence rather than a warning.
3. **Storefront↔checkout auth continuity is lost.** Quoted: *"This legacy authentication strategy will not maintain authentication between your Hydrogen storefront and checkout."* The customer is logged into the storefront and is not logged into checkout. Whatever the client expects at checkout — saved addresses, saved payment, order-history continuity — must be re-confirmed against that, in writing, before pricing.
4. **Shopify recommends against it.** *"Consider migrating to the new Customer Account API for better security and features."* Building on a deprecated path is a maintenance liability that belongs in the maintenance line item, not a footnote.

**Discovery output for any Multipass project:** current IdP (or the absence of one), which stores are in scope, the exact checkout-experience expectation in the client's words, and an explicit signed acknowledgement of item 3.

**Build sequencing recommendation *(added rev 3)*.** Split Multipass into two halves and build them at different times:

| Half | Build when | Rationale |
|---|---|---|
| **Discovery half** — §2a as written: the questions, the four costs, the premise correction, the sign-off requirement | **Now.** It is already written and costs nothing further. | It protects every SOW from the moment the arm ships, including SOWs where Multipass turns out not to be needed. |
| **Implementation half** — the legacy customer account flow wiring, token minting, session handling | **Deferred** until a named Plus client with a real Multipass requirement exists | It is a deprecated path; a speculative implementation guide will be stale before it is used. Shopify's cookbook is first-party maintained, so deferring costs little — the recipe does not need duplicating in the KB, only referencing. |

This is a recommendation, not a restriction: if a Multipass client lands during buildout, the implementation half moves up.

### 3. Runtime Compatibility *(scope widened beyond the source doc)*

The source doc frames this as "Oxygen Runtime Compatibility." Correct for architecture A, but B, C and D have their own runtime ceilings, so the review point generalises:

- Review all Node.js packages and server-side dependencies.
- Identify dependencies requiring Node-specific APIs the target runtime does not provide.
- Recommend a runtime-compatible alternative, or move the work to an external backend.

**Architecture A (Oxygen) — verified hard ceilings:**

| Constraint | Limit |
|---|---|
| Worker bundle | **10 MB or less** |
| Startup time | **400 ms or less** |
| CPU time per request | **30 s** |
| Memory | **128 MB** |
| Custom env vars | **110** |
| Outbound request completion | **2 min** |

Oxygen is a `workerd`-based worker runtime, not Node. Anything assuming Node built-ins, long-lived processes, a filesystem, or background timers is disqualified before it is written.

**Architectures B/C/D:** the platform's own limits apply (Vercel function duration/size, Netlify, Fly, CF Workers). These are `TODO-VERIFY` per project against the chosen host's current published limits — they change, and the arm must not hard-code them.

**Rule:** a dependency audit that has not actually been run against the target runtime does not count as a review point. Reading a package's README is not verification; a build that fits under the ceiling is.

### 4. Analytics and Marketing

- Identify required GA4, Google Ads, Meta, Klaviyo, pixels and consent tooling.
- Define which tracking events must be **implemented separately in the headless storefront** — in a theme these arrive free via ScriptTag / app embeds; in headless they are your code.
- Include **storefront-to-checkout attribution** and consent validation.

**Why this fails so often:** the client's current analytics work because the theme carries them. Nothing carries them in headless. Every event is a build item, and attribution across the storefront→Shopify-checkout boundary is its own integration, not a checkbox.

### 5. CMS and Content Management

- Confirm how **marketing users** will create and edit pages — not how developers will.
- Evaluate Shopify metaobjects/metafields versus an external headless CMS.
- Confirm requirements for: preview, drafts, scheduling, reusable content blocks, localization.

**The decision this forces:** metaobjects are free and native but have no built-in preview or scheduling workflow. If the client's marketing team expects to schedule a campaign page with a preview link, that is either an external CMS or a custom build. Deciding this after the frontend is built is a rewrite.

Note from the pilot baseline: metaobject structure is currently created **manually**. Generating that structure is a candidate for automation in this arm — see the pilot section below.

### 6. Middleware Requirements

- Identify ERP, CRM, PIM, OMS, search, reviews, subscriptions and fulfillment integrations.
- Determine whether each can run **within the chosen runtime**.
- **Move heavy processing, scheduled jobs, queues, webhooks and complex synchronization to external middleware.**

On Oxygen the 30 s CPU / 128 MB / 2 min outbound ceilings make this non-negotiable, not a preference: a nightly ERP sync cannot live in the storefront worker. Where the middleware lives, who owns it, and who pays for it are SOW line items.

### 7. Development and Maintenance Impact

- Compare headless development against a standard theme implementation.
- Include, as separate lines: frontend development, API integration, testing, deployment, monitoring, maintenance.
- **"Do not estimate a Hydrogen project as a normal theme redevelopment."** *(user-supplied, verbatim)*

Ongoing cost is structurally different: Hydrogen ships on a CalVer train tied to Storefront API versions, so version tracking is a recurring obligation, not a one-off. If no maintenance arrangement exists, the storefront goes stale by default — say so in the SOW rather than discovering it at renewal.

---

## Output artifact

The audit produces `discovery-audit.md` in the project outputs, containing:

1. App inventory table with the four-way classification and a resolution per row.
2. Authentication finding — current state, target state, and whether a re-architecture is implied.
3. Dependency audit result against the target runtime, with the measured bundle size for architecture A.
4. Analytics event inventory — which events, which surface, who builds them.
5. CMS decision with the rationale, including the preview/scheduling verdict.
6. Middleware inventory — what runs in-runtime, what moves external, who owns and pays.
7. Effort-impact statement naming the delta versus a theme build.
8. **Handoff register** *(added rev 3)* — every finding owned by another skill (data migration and its dependents), who it went to, and the confirmation required back before cutover.

**Gate behaviour:** an incomplete `discovery-audit.md` blocks SOW pricing. This is a hard block in the same class as `D-QA-GATE-BLOCK` — master to confirm the gate ID and placement, since this window cannot define gates.

---

## Pilot baseline (from the user's doc) — what "without the skill" produced

Recorded so the arm can be measured against it, not as a target:

- Shopify default system pages retained, UI-only adjustments.
- Footer newsletter on Shopify default functionality.
- Contact Us page on Shopify default form functionality.
- Metaobject structure generated with Claude assistance; **currently added manually**.
- Cart drawer built to the provided design.

**What the skill must add over this baseline:** the seven-point audit before pricing (absent in the pilot), the four-way app classification, the runtime dependency audit, and an automated path for metaobject structure generation. If the arm ships without those, it has not improved on the pilot.

---

## Anti-patterns (to be lifted into the KB file verbatim)

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

---

## Open questions requiring answers before ratification

1. **What is the gate ID and position for the discovery block?** This window cannot define gates. Master to assign — a pre-G0 gate, or a G0 sub-step alongside `D-PM-04`'s `sow-spec.md` read.
2. **Who signs the audit** — internal PM, or does it require client sign-off? If client-signed, the "dropped functionality" column needs a signature line, and that changes the artifact template.

---

## Ask to master

Ratify D-HL-DISCOVERY-01 rev 3, assign the gate ID, and add to canonical `_decisions/decision-inventory.md`.

---

Last reviewed: 2026-08-06
Next review due: 2026-11-06
