---
tier: 3
load_when: ["human-reference-only"]
description: "Template for the discovery-audit.md artifact required by D-HL-DISCOVERY-01. Eight required sections covering the seven ratified review points plus the migration handoff register. An incomplete artifact blocks SOW pricing under D-QA-GATE-BLOCK semantics. The client signs section 4's dropped-functionality column — that column only, per the v1.11.21 ruling."
applies_to: [headless]
decision_refs: [D-HL-DISCOVERY-01, D-HL-APPS-01, D-HL-TYPES-01, D-QA-GATE-BLOCK, INT-001, INT-002]
doc_type: template
last_reviewed: 2026-08-12
next_review_due: 2026-11-12
---

# Discovery Audit — `<CLIENT>` / `<ENGAGEMENT>`

> **Required before pricing on every engagement type except New Build.** Also required once, before the first ticket, on any retainer storefront WebDesk did not build.
> **An incomplete artifact blocks SOW pricing.** Rules: `knowledge/12-discovery-audit.md`.

**The binding rule, quoted, never paraphrased:**

> *"Never assume that an existing Shopify theme feature, app block or third-party app will work in Hydrogen. Verify API, SDK, Customer Account API and Oxygen runtime compatibility before confirming feasibility or estimating development effort. Clearly separate native Shopify capabilities, custom Hydrogen development, third-party integrations and external middleware requirements."*

Sentence three is the estimating discipline: **native capability, custom development, third-party integration and external middleware are four different cost structures with four different owners.** Do not blend them into one line item.

| | |
|---|---|
| Engagement type | `1–6` |
| Architecture | `A / B / C / D` |
| Audited by / date | |
| Existing site | |

---

## 1. App inventory — four-way classification

**From the store admin, not the client's recollection. Default bucket is 4. A blank evidence field is a failure, not a pass.**

| App / script / pixel | Bucket 1–4 | **Evidence** (what the vendor documents, named) | Q1–Q5 answered? | Commercial consequence |
|---|---|---|---|---|
| | | | | |

Bucket key: **1** fully compatible (config line) · **2** custom integration required (build line **with hours**) · **3** replacement required (selection + build + **client decision**) · **4** requires discovery (**blocks pricing** — timebox or exclude in writing).

**Payments / shipping / tax remain manual per `INT-001` / `INT-002`** — not covered by this classification.

---

## 2. Authentication finding

| | |
|---|---|
| Current state | new accounts / legacy accounts / B2B / Multipass / external IdP |
| Target state | |
| **Re-architecture implied?** | **Yes / No** — legacy↔new is exclusive and is a re-architecture, not a port |
| Multipass in scope? | If yes: IdP, stores in scope, checkout expectation **in the client's words**, and signed acknowledgement that **storefront login does not carry into checkout** |

---

## 3. Dependency audit vs target runtime

**A README is not verification. A build that fits under the ceiling is.**

| | |
|---|---|
| Target runtime | `workerd` (Oxygen) / worker host / Node host |
| Dependencies needing unavailable Node APIs | |
| **Measured** bundle size (architecture A) | vs **10 MB** |
| Verdict | Fits / **disqualifies this architecture → gate 4 re-derivation, human confirmation** |

---

## 4. Analytics and marketing event inventory

**In a theme these arrived free. In headless every one is your code.**

| Event / tag | Surface | Who builds it | In scope? |
|---|---|---|---|

Storefront→checkout attribution: ______   Consent enforcement owner: ______

---

## 5. CMS and content decision

**Ask marketing users, not developers.**

| | |
|---|---|
| Metaobjects/metafields vs external CMS | |
| **Preview / scheduling verdict** | Metaobjects have no built-in preview or scheduling. Deciding after the frontend is built is a **rewrite**. |
| Drafts / reusable blocks / localization | |

---

## 6. Middleware inventory

| System | Runs in-runtime or external? | Owner | Who pays |
|---|---|---|---|

**Heavy processing, scheduled jobs, queues and sync move external.** On Oxygen's 30 s CPU / 128 MB / 2 min outbound ceilings this is structural — a nightly ERP sync cannot live in the storefront worker.

---

## 7. Effort-impact statement

**"Do not estimate a Hydrogen project as a normal theme redevelopment."**

Separate lines, never blended: frontend development · API integration · testing · deployment · monitoring · maintenance.

| | |
|---|---|
| Delta vs a theme build, stated | |
| CalVer tracking obligation | Recurring. **Without a maintenance arrangement the storefront goes stale by default** — say so here, not at renewal. |
| Retainer decision | Bought / **declined in writing** |

---

## 8. Handoff register

**A finding handed to another skill is not closed until the confirmation comes back. An unhanded-over finding is this arm's gate failure.**

| Finding | Handed to | Date | **Confirmation received** | Blocks cutover? |
|---|---|---|---|---|

Required on a Replatform: **named entity list**, **URL inventory requirement**, **credential-reset consequence**.

---

## Dropped functionality — **CLIENT SIGNS THIS SECTION**

**This column only. The rest of this audit is internal working product.**

Every capability that exists today and will not exist after launch. Unsigned, *"we assumed you didn't need that"* becomes a dispute at UAT.

| Exists today | Gone after launch because | Replacement offered? |
|---|---|---|
| | | |

Client name: ______________  Signature: ______________  Date: __________

---

## Open questions

| Question | What it blocks | Owner |
|---|---|---|

**Register `TODO-VERIFY` items touching this engagement** — name them, do not estimate against them: checkout branding / UI extensions Plus-gating · Shopify Markets per-plan · Hydrogen support window.

---

**Artifact complete:** ☐   **Dropped column signed:** ☐   **Pricing unblocked:** ☐
