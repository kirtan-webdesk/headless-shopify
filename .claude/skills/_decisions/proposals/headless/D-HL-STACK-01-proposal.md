---
proposal_id: D-HL-STACK-01
revision: 4
status: RATIFIED
proposed_by: Headless skill-dev window (Claude)
proposed_date: 2026-08-04
revised_date: 2026-08-06
revision_reason: "rev 2 — user added a third Shopify architecture (Headless app + Vercel) and required plan-awareness. rev 3 — user confirmed architecture B (Hydrogen + Vercel) is a live client requirement; the SUPPORTED-ON-DEMAND recommendation is withdrawn. rev 4 — adds the architecture selection protocol (declared / derived / blocked) answering 'how is the architecture decided'; resolves the hosting-ownership open question per user directive 2026-08-06."
ratified_by: master (v1.11.17)
supersedes: none
related: C-HEADLESS-01, D-PLAT-01, D-HL-TYPES-01, D-HL-DISCOVERY-01, D-HL-APPS-01, D-HL-SEC-01, D-HL-ENV-01
evidence: outputs/headless-skill-dev/VERIFIED-FACTS-shopify-bigcommerce.md
applies_to: [headless]
severity: high
---

# D-HL-STACK-01 (PROPOSED, rev 4) — Headless Stack, Architecture Shortlist & Selection Protocol

## Master reconciliation (v1.11.17, v1.11.19)

**Status:** RATIFIED by master 2026-08-07 in v1.11.17. Below-line rulings that supersede open questions in this proposal's body:

- **OQ1 — Architecture C framework + named client test:** ~~open~~ **RULED v1.11.17.** No named client for C; demoted to `SUPPORTED-ON-DEMAND` per the same consistency test that promoted B. Presumptive framework = Next.js App Router when C activates.
- **OQ2 — Hosting ownership for B/C/D:** already resolved in body per user directive 2026-08-06.
- **OQ3 — B pipeline status:** already resolved in body 2026-08-05 (named client).
- **Blockers on architecture C/D KB (v1.11.19):** D UNBLOCKED (BC GraphQL rate limits verified 2026-08-06, verified-facts §9b). C still held for commercial reason (no named client), NOT for verification (`@shopify/hydrogen-react` verified §10).

Precedence per D-KB-FIDELITY-01 v1.11.21 amendment: **inventory authoritative for status; this proposal authoritative for detail.**

---

> **Status: PROPOSED — awaiting master ratification.** This window cannot add D-codes to the inventory. No content buildout under `skills/headless/` until this ships.
>
> Every number, plan gate and version below traces to `VERIFIED-FACTS-shopify-bigcommerce.md`. Nothing here is written from memory.

---

## Decision (one line)

WebDesk supports **two backends** — Shopify and BigCommerce — across **four architectures**: three on Shopify (**A** Hydrogen+Oxygen, **B** Hydrogen+self-host, **C** Headless channel + Next.js) and one on BigCommerce (**D** Catalyst + self-host). Everything else is OUT. The architecture is **declared before the skill starts work** where possible, and derived from ordered gates where it is not.

---

## The framework × hosting grid

Revision 1 modelled Shopify as *one framework with two hosting sub-variants*. That was wrong once architecture C entered scope. C is not a hosting change — **it is a different frontend framework**. The real axes are:

| | Oxygen | Self-host (Vercel/Netlify/Fly/CF Workers) |
|---|---|---|
| **Hydrogen (React Router 7)** | **A** | **B** |
| **Next.js** | not available | **C** (Shopify) · **D** (BigCommerce) |

Oxygen only runs Hydrogen, so that cell is empty. A and B **share a codebase** and differ in deployment. **C shares almost nothing with A or B** beyond the Storefront API — it is a different framework against the same backend.

---

## THE FOUR FINALIZED ARCHITECTURES

### Architecture A — Shopify + Hydrogen + Oxygen

| | |
|---|---|
| **Backend** | Shopify |
| **Framework** | Hydrogen `2026.4.4` (a React Router app; peer-pins react-router `~7.16.0` — **not** React Router 8) |
| **Channel** | **Hydrogen** sales channel |
| **Hosting** | Oxygen — Cloudflare `workerd` edge runtime, free on Starter/Basic/Grow/Advanced/Plus/Pause-and-build. **Not on Agentic plans.** |
| **Hard ceilings** | worker ≤ **10 MB**, startup ≤ **400 ms**, **30 s** CPU/request, **128 MB** memory, **110** env vars, outbound ≤ **2 min** |
| **Who owns hosting** | Shopify |
| **Best fit** | New builds; standard catalogue + content storefronts; clients with no infrastructure mandate; teams that want Shopify to own DevOps |
| **Disqualifiers** | Node-API dependencies `workerd` does not provide; a bundle that cannot be held under 10 MB; a contractual own-cloud requirement; store on an Agentic plan |

### Architecture B — Shopify + Hydrogen + self-host

| | |
|---|---|
| **Backend** | Shopify |
| **Framework** | Hydrogen — **same codebase as A** |
| **Channel** | **Headless** channel (not Hydrogen — explicit prerequisite in Shopify's self-hosting guide) |
| **Hosting** | Vercel, Netlify, Fly.io, or Cloudflare Workers |
| **Conversion work required** | Strip Oxygen packages and code; rewrite `server.js`, `react-router.config.ts`, `vite.config.ts`, possibly `app/entry.server.tsx`; construct the Hydrogen context and pass it through `getLoadContext` |
| **Who owns hosting** | Client account by default — see the hosting-ownership section below |
| **Best fit** | Client already owns a Hydrogen codebase and must move it; own-cloud mandate; compliance constraints Oxygen cannot meet |
| **Pipeline status** | **CONFIRMED (user, 2026-08-05)** — live client requirement |

**Flagged risk — cite this in every B SOW:** Shopify's self-hosting guide carries the warning *"This guide might not be compatible with features introduced in Hydrogen version 2025-05 and above."* Current Hydrogen is **2026.4.4**. Shopify's own instructions for this path are documented as potentially a year stale.

**Honest position:** B is the **highest-risk** of the four. It takes on Oxygen's absent managed layer *and* runs against first-party docs Shopify has flagged as behind. Do not sell B as "Hydrogen, just on Vercel."

**Fork to resolve before committing any client to B:** if the driver is *"we don't want Oxygen"* (bundle size, ceilings, an existing Vercel contract, non-commerce surface in the same app), **C is the lower-risk answer** — Next.js on Vercel is current and carries no staleness warning. B is right when the client **already owns a Hydrogen codebase** and the job is to move it, or when Hydrogen's Shopify-native primitives are specifically wanted. **B is a port; C is a build.** Record which one applies in the SOW.

### Architecture C — Shopify + Headless channel + Next.js

| | |
|---|---|
| **Backend** | Shopify |
| **Framework** | **Next.js App Router** — see open question 1; this is the item needing the user's ratification |
| **Channel** | **Headless** channel — free, first-party, no documented plan gate. Cap: **100 active storefronts + access tokens per shop** |
| **Hosting** | Vercel, or any Node host |
| **Who owns hosting** | Client account by default |
| **Best fit** | Frontends that must carry substantial non-commerce surface (marketing site, portal, external CMS) in one Next app; teams already deep in Next; bundles or workloads Oxygen would reject |

**What the Headless channel gives you:** storefront registration, Storefront API + Customer Account API access, public/private token issuance and rotation, permissions, order attribution. **It does not give you a frontend.**

**What you give up versus A/B:** every Hydrogen-native primitive — caching helpers, cart handlers, analytics and consent components, Customer Account API client wiring — becomes your code. `@shopify/hydrogen-react` is the bridge library for non-Hydrogen React frontends; its current status is `TODO-VERIFY` (evidence register, open item 5).

**What you gain:** no Oxygen 10 MB / 400 ms / 128 MB ceilings, the generic Next.js ecosystem, and pattern overlap with architecture D.

### Architecture D — BigCommerce + Catalyst + self-host

| | |
|---|---|
| **Backend** | BigCommerce |
| **Framework** | **Catalyst** — Next.js with React Server Components on the **GraphQL Storefront API** |
| **Channel** | BigCommerce channel configuration |
| **Hosting** | Any Node host. On Vercel, Vercel Runtime Cache is automatic with no external KV setup. **Off Vercel, the caching layer is the integrator's problem.** |
| **Who owns hosting** | Client account by default |
| **Plan-relevant limits (REST, verified)** | Pro 60k/hr (450/30 s); Plus & Standard 20k/hr (150/30 s); Enterprise by plan and resource. **All apps on a store share the quota.** GraphQL Storefront limits are `TODO-VERIFY` — and that is the number that actually governs a Catalyst build. |

**No Oxygen equivalent exists on BigCommerce.** Hosting and DevOps ownership sits with WebDesk or the client in *every* Catalyst engagement, and must be named in the SOW.

---

## HOW AN ARCHITECTURE IS SELECTED

Three modes. The skill does not guess, and it never silently changes architecture mid-project.

### Mode 1 — DECLARED (preferred)

The architecture is named in the SOW intake **before the skill starts working**: `architecture: A | B | C | D`. This is the normal case for any engagement that went through pre-sales, because the hosting decision, the plan check and the client's infrastructure mandate are all commercial conversations that happen before build.

When an architecture is declared, the skill **validates it — it does not re-litigate it.** Validation is exactly the hard disqualifiers:

| Declared | Validated against |
|---|---|
| A | Store is not on an Agentic plan; Hydrogen channel installable; dependency audit fits `workerd`; bundle projection under 10 MB |
| B | Headless channel installed (**not** Hydrogen channel); deploy spike passed (`D-HL-ENV-01` B1); host limits recorded |
| C | Headless channel installed; storefront registered under the 100 cap; "build it yourself" inventory recorded |
| D | BigCommerce channel configured; store plan quota recorded; caching layer owner named if off Vercel |

Validation passes → build proceeds. Validation fails → **Mode 3**.

### Mode 2 — DERIVED (when nothing was declared)

The skill runs the ordered gates below against verified store facts and the discovery audit, then **proposes exactly one architecture with its rationale and the gate that decided it** — and stops for human confirmation. It does not begin building on a derived architecture without that confirmation.

**Ordered gates, first failure decides:**

1. Backend is BigCommerce → **D**. No further branching.
2. Store is on an Agentic plan → Oxygen unavailable → **B** or **C**.
3. Client mandates their own cloud, or has compliance constraints Oxygen cannot meet → **B** or **C**.
4. Dependency audit finds Node-specific APIs `workerd` does not provide, or a bundle that will not hold under 10 MB → **B** or **C**.
5. Scope includes substantial non-commerce surface in the same application (portal, marketing site, external CMS) → **C**.
6. Otherwise → **A**.

**Between B and C when both survive:** choose **C** unless the client already owns a Hydrogen codebase, in which case B is a port rather than a rewrite. B's documented staleness risk means it should be the deliberate answer to *"we already have Hydrogen and must move it"*, not the default answer to *"we don't want Oxygen."*

### Mode 3 — BLOCKED (declared architecture is impossible)

If a declared architecture contradicts a **verified hard disqualifier** — the store is on an Agentic plan and A was declared; the B deploy spike failed; a required dependency cannot run in `workerd` — the skill **halts and surfaces the conflict with the evidence**. It does not switch architecture on its own initiative, and it does not build a workaround.

This matters because the architecture is a **commercial** decision, not only a technical one. Silently moving a signed A engagement to C changes the price, the hosting arrangement, the maintenance obligation and the risk profile. That is a change order, and a human signs change orders.

### Lock point

The architecture is **locked at SOW signature** and recorded in the project record. Changing it afterwards is a change order, not a refactor. `D-HL-TYPES-01`'s combination rule applies: if a change of architecture is agreed mid-flight, the work is re-priced, not absorbed.

### No architecture is "recommended"

There is no house default. Selection is per-project against the gates above and is recorded with the deciding gate named. *(Stack-bias rule: LLM preference is not a decision input.)*

---

## HOSTING OWNERSHIP — RESOLVED (user directive, 2026-08-06)

Applies to architectures **B, C and D**. Architecture A does not have this question — Shopify owns Oxygen.

**Default: the client owns the hosting account. WebDesk deploys into it.** No reseller relationship, no WebDesk billing exposure, clean exit at the end of the engagement.

**Optional add-on:** WebDesk offers server / infrastructure management as a **separately priced service**. If the client accepts, it is a named SOW line with its own scope and term. **If the client declines, server management is explicitly OUT of scope** and the default applies with no further negotiation.

**The gap to close in the SOW template — flagged, not yet resolved:** in a theme deployment, uptime, patching and platform upgrades are Shopify's problem. In B, C and D they are *someone's* problem, and "the client declined management" does not by itself say who responds when the storefront is down at 2am, who applies a security patch, or who tracks the Hydrogen CalVer train. **Recommendation:** every B/C/D SOW carries an explicit "operational responsibility" line even in the declined case — e.g. *"Client owns hosting, monitoring and incident response. WebDesk responds on request at prevailing hourly rates, no response-time commitment."* Recording "declined" as an outcome is what stops the first outage becoming a free-work argument.

---

## The argument for naming Next.js in architecture C

Not a preference — a maintenance-surface argument. **No code is shared between architectures and no client project touches two of them.** What is shared is the *team's* knowledge:

- If C is **Next.js App Router**, WebDesk maintains **two** frontend paradigms in total: Hydrogen / React-Router-7 (A + B), and Next.js App Router + RSC (C and D). Catalyst **is already Next.js** — that is BigCommerce's choice, not WebDesk's — so the RSC data-fetching, route caching, deployment and environment patterns learned on one serve the other.
- If C is left open ("Next or React or Vue, per client"), WebDesk maintains **three or more** paradigms, and C can never ship a repeatable pattern — every C project becomes a bespoke custom engagement, priced and delivered as one.
- Vue/Nuxt on Shopify is a real technical option. It is rejected for the same reason Saleor is: no pipeline, no existing WebDesk depth, and it would be the only Vue surface in the entire system.

---

## Rejected candidates (NO) — with rationale

| Candidate | Verdict | Rationale |
|---|---|---|
| Vue / Nuxt on the Headless channel | NO | Technically supported by the channel. Rejected: no pipeline, zero existing WebDesk Vue depth, and it would fragment the arm's only shared frontend paradigm. Revisit only on a signed contract that mandates it. |
| Remix (standalone) on Shopify | NO | Hydrogen already moved off Remix onto React Router; adopting Remix separately walks into the churn, not away from it. |
| Next.js Commerce (Vercel's template) on Shopify | NO **as a distinct stack** — folded into C | It is a starter for exactly architecture C. Treat it as a possible *starting point* for C, not a fifth supported architecture with its own KB. |
| Saleor / Vendure / Medusa | NO | Each introduces a commerce **backend** WebDesk would own, host and maintain — a different liability class from frontend work on a managed backend. No pipeline. |
| Custom composable (headless WP + Contentful + Next, etc.) | NO | Bespoke; no repeatable productized pattern. Case-by-case custom engagement, not an arm. |
| Adobe Commerce + Hyvä | OUT OF SCOPE for the headless arm | **Hyvä is not headless** — a server-rendered Magento theme (PHTML + Tailwind + Alpine.js) inside the monolith. Belongs in the Magento/Adobe Commerce arm as a theme option. Adobe Commerce *headless* (PWA Studio / Alokai / custom Next on Magento GraphQL) is a separate future decision. |

---

## Plan-awareness — mandatory, per user directive 2026-08-05

The arm is **plan-aware, not Plus-assuming.** `00-overview.md` carries this matrix. Verified baseline:

| Capability | Plan reality |
|---|---|
| Storefront API / Headless channel | No documented plan gate. Free channel. |
| Oxygen | Free on Starter, Basic, Grow, Advanced, Plus, Pause-and-build. **Not on Agentic plans.** |
| Headless storefronts per shop | Max **100** active storefronts + access tokens |
| Customer Account API | Requires Headless *or* Hydrogen channel **and** customer accounts enabled. No plan gate documented. |
| Multipass SSO | **Shopify Plus only**, and **legacy customer accounts only** |
| B2B (headless) | "a plan that supports B2B capabilities"; works only with customer accounts. Plus not named as the gate in the headless B2B doc. |
| BigCommerce API quota | Pro 60k/hr; Plus & Standard 20k/hr; Enterprise by plan+resource |

**Headless on Shopify does not require Plus.** Any KB sentence implying otherwise is a defect.

**The trap to encode as a discovery blocker:** Multipass needs *legacy* accounts; the Customer Account API needs *new* accounts. They are mutually exclusive. A Plus client on Multipass SSO is an authentication re-architecture, not a frontend port — and that has to surface at discovery, not in sprint 3.

**Multipass is nonetheless a documented build path, not a refusal** (user directive, 2026-08-05). Shopify publishes a Hydrogen cookbook for the legacy customer account flow, so Multipass + Hydrogen is buildable — at the cost of Plus, legacy accounts, a deprecated auth model, and **no authentication continuity from storefront into checkout**. Full treatment and the multi-store premise correction live in **D-HL-DISCOVERY-01 §2a**; verified facts in evidence register **§6b**.

---

## Risks flagged with this decision

1. **Hydrogen framework churn (medium→high).** The foundation moved twice (own runtime → Remix → React Router). Hydrogen ships on a CalVer train tied to Storefront API versions and pins react-router `~7.16.0` while RR's own latest is 8.3.0. **Mitigation:** pin Hydrogen + react-router per project in the SOW; keep the KB anchored on Storefront-API patterns, not framework internals; re-verify evidence register §7 quarterly.
2. **Architecture B doc staleness (high).** Shopify's self-hosting guide is flagged as possibly incompatible with Hydrogen ≥ 2025-05; current is 2026.4.4. **Mitigation:** B requires a deploy spike **before** the SOW is signed. Treat "can we self-host this Hydrogen version" as unproven until a deploy succeeds.
3. **Architecture C reimplementation surface (medium).** Everything Hydrogen gives free — cart, caching, analytics, consent, Customer Account API wiring — is WebDesk's code in C. **Mitigation:** C's KB leads with an explicit "what you must build yourself" inventory so it is estimated, not discovered.
4. **Catalyst hosting liability (medium).** Someone owns the host. Resolved in principle by the hosting-ownership section above; the residual risk is the declined-management case, which needs the operational-responsibility line.
5. **Four architectures = four forks (medium).** `05-secret-management`, `06-cache-and-cdn`, `08-observability` and `09-forbidden` each carry per-architecture paths. **Mitigation:** shared `knowledge/00-11` for the ~70% that is genuinely cross-architecture; per-architecture directories for the rest.

---

## Proposed directory structure

Rev 1 keyed directories off *platform*. With C in scope, platform is no longer the discriminator — architecture is:

```
skills/headless/
  knowledge/00-11              # cross-architecture (~70%)
  architectures/
    shopify-hydrogen-oxygen/   # A
    shopify-hydrogen-selfhost/ # B   (delta doc over A, not a full copy)
    shopify-headless-next/     # C
    bigcommerce-catalyst/      # D
```

B is authored as a **delta over A**, not a parallel KB — same codebase, different deployment and channel. C and D are full KBs and should deliberately cross-reference each other on shared Next.js/RSC concerns.

---

## What this decision does NOT cover (deferred)

- Adobe Commerce headless — separate future decision.
- Project-type taxonomy — **D-HL-TYPES-01**.
- Discovery/compatibility audit gate — **D-HL-DISCOVERY-01**.
- App compatibility policy — **D-HL-APPS-01**.
- External-hosting security baseline — **D-HL-SEC-01**.
- Environment preflight gate — **D-HL-ENV-01**.
- Build order (**changed in rev 3**): **A first, then B, then C, then D.** A still leads because B is authored as a delta over A. B moved from last to second because the user confirmed on 2026-08-05 that B is a live client requirement. Shopify still precedes BigCommerce per the original user directive.

---

## Open questions requiring answers before ratification

1. **Architecture C's frontend framework — Next.js App Router, confirmed?** This proposal names it for the maintenance-surface reason above. If WebDesk instead wants C to stay framework-agnostic, say so — but then C cannot ship a repeatable pattern and should be scoped as a custom engagement, not a productized architecture. **Related test, not yet applied:** architecture B was promoted from `SUPPORTED-ON-DEMAND` because a real client requires it. **Is there a named client for C?** If not, the same reasoning that promoted B should demote C to `SUPPORTED-ON-DEMAND` until one exists — the user's original directive named it as a required architecture, so this needs an explicit ruling rather than an assumption.
2. ~~**Does WebDesk own hosting in B/C/D, or does the client?**~~ **RESOLVED 2026-08-06.** Client owns the account by default; WebDesk deploys into it; server management is an optional priced add-on and is explicitly out of scope if declined. See the hosting-ownership section. **Residual item for master:** whether the SOW template gains a mandatory "operational responsibility" line for the declined case.
3. ~~**Is architecture B actually in the pipeline, or defensive?**~~ **RESOLVED 2026-08-05 — YES.** User: *"This is the requirement of our new client."* SUPPORTED-ON-DEMAND withdrawn; B receives full KB buildout as a delta over A, moves to second in the build order, and `D-HL-ENV-01` B1 (deploy spike before signature) becomes an active engagement requirement. Left visible rather than deleted so master sees the reasoning changed on evidence, not on preference.
4. **For this specific B client — is the driver "we already have Hydrogen" or "we don't want Oxygen"?** If the latter, C is the lower-risk architecture and B is being chosen against its own documented risk. Does not block ratification of the stack list; must be answered before that SOW is priced.

---

## Ask to master

Ratify D-HL-STACK-01 rev 4 as written (or amended), including the **architecture selection protocol** (Modes 1–3) and the **hosting-ownership default**, add to canonical `_decisions/decision-inventory.md`, and ship a release with the code locked. This window then reinstalls and begins buildout on `00-overview.md` and architecture A.

---

Last reviewed: 2026-08-06
Next review due: 2026-11-06
