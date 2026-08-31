---
tier: 1
load_when: ["platform-headless", "headless-platform-active", "g0-intake-stage", "g0.5-audit-stage", "audit-active", "g1-plan-stage"]
description: "App and integration classification policy per D-HL-APPS-01. The binding rule, the four buckets with their evidence standards and commercial consequences, the five qualification questions every app must answer, the categories that predictably break, and the shared register's heuristic-only status with its 90-day expiry. This arm owns policy, classification and commercial consequence; the developer owns per-app wiring. Blocks pricing under HL-APPS-001/002."
applies_to: [headless]
decision_refs: [D-HL-APPS-01, D-HL-DISCOVERY-01, D-HL-SEC-01, D-KB-FIDELITY-01, D-QA-GATE-BLOCK, INT-001, INT-002]
last_reviewed: 2026-08-06
next_review_due: 2026-11-06
---

# 08 — App Integrations: Classification

> Governing decision: **`D-HL-APPS-01`** (RATIFIED v1.11.17). Canonical text: `_decisions/proposals/headless/D-HL-APPS-01-proposal.md`.
>
> **This file closes a recorded gap.** The five qualification questions below were authoritative in the proposal and homed in no KB file until now — recorded in v1.11.21 as "unwritten, not drifted."

---

## 1. What this arm owns, and what it does not

| Owned here | Not owned here |
|---|---|
| The classification policy — the four buckets | Writing the integration code |
| The **qualification gate** — the five questions asked of any app before it enters a headless scope | Version-specific SDK usage |
| The **evidence standard** — what counts as proof of compatibility | Debugging a particular vendor's SDK |
| The **commercial consequence** — how each bucket lands in the SOW | Per-app wiring instructions |

**Reason, from the decision:** *"app-by-app wiring instructions are stale within one quarter and there are thousands of apps. A classification policy is durable. If the skill starts documenting 'how to integrate Klaviyo,' it has taken on maintenance debt it cannot service."*

That is why this directory holds policy files and no per-vendor files. A `klaviyo.md` here would be wrong on purpose.

---

## 2. The binding rule

**No app is compatible until proven compatible.**

The presence of an app on the current site is evidence that the app works **in a theme**. It is not evidence of anything in a headless storefront.

The failure mode this exists to stop: quoting a headless build with the app list copied from the theme site and the assumption that it carries over. It does not. **In a theme, the app injects itself. In a headless storefront, there is no theme to inject into.**

---

## 3. The four buckets

| Bucket | Meaning | Evidence required | Commercial consequence |
|---|---|---|---|
| **1 — Fully compatible** | Works via API/SDK with no custom frontend work beyond configuration | Vendor documents a headless/API path **and the specific capability needed is named in that documentation** | Configuration line item |
| **2 — Custom integration required** | The backend capability exists via API, but the storefront presentation must be built | API exists; no drop-in frontend; the UI it provided in the theme must be rebuilt | Named build line item **with hours** |
| **3 — Replacement required** | Depends on the theme layer (app blocks, ScriptTag, theme app extension) with no API path | Vendor offers no headless path, or the capability is theme-only | Replacement product selection + build + **client decision required** |
| **4 — Requires discovery** | Cannot be determined without contacting the vendor or building a spike | Anything not proven into 1–3 | **Blocks pricing.** Either time-box the spike or exclude the app from scope in writing |

**Default bucket is 4.** An app with no evidence is not "probably fine" — it is undetermined.

**Bucket 4 is not a soft bucket.** An app sitting in bucket 4 at signature is **an unpriced risk that has been signed for**. Either it moves to 1/2/3 before signature, or the SOW names it as excluded.

### On the bucket-1 evidence bar

The bar is *named in the vendor's documentation* — not *we found some endpoints that look sufficient*. Our own inspection is the exact inference the bar exists to forbid, because it converts "the vendor has not committed to this" into "we think it will work," and that conversion is invisible in a quote.

"It has an API" is not evidence.

---

## 4. The five qualification questions

Asked before an app enters a headless scope — **whether it is an existing app or one being newly proposed**:

1. **Does the vendor document a headless or API-based integration path** — and does that documentation name the *specific* capability required, not just "we have an API"?
2. **Does it rely on the theme layer?** App blocks, ScriptTag, theme app extensions, `theme.liquid` injection — all of these have no equivalent in a headless storefront.
3. **Does it require a checkout surface?** Checkout is platform-hosted in every architecture here. Checkout extensibility is a **different mechanism** from storefront rendering.
   - **Verified 2026-08-12 (register §14):** *"Checkout UI extensions for the information, shipping, and payment steps are available only to stores on a Shopify Plus plan."* On a **non-Plus** store an app needing those steps is **bucket 3 — replacement required**, and that is a determination, not a discovery item.
   - **Still open:** **checkout branding**, and any target the page does not name. There the verbatim rule stands — ***"Do not assert checkout capability until that item is verified."***
4. **Does it require server-side secrets?** If yes it cannot live in the browser bundle — it becomes a server route, which drags in `D-HL-SEC-01` (rate limiting, token handling) and is a **build item, not a config item**.
5. **What happens on failure?** If the app's service is down or rate-limited, does the storefront degrade or does the page fail? **A hard dependency on a third-party service in the render path is an availability decision that must be named.**

**An app that cannot answer all five is bucket 4.**

Question 5 is the one that gets skipped, and it is the one that turns a working integration into an outage. Answer it in writing, per app, before it enters scope.

---

## 5. Categories that predictably break

These are **not classifications** — the four buckets are. These are the categories where the theme assumption bites hardest, with the question that resolves each fastest.

| Category | The question |
|---|---|
| Reviews | Is there a public API for review retrieval and submission, or **was the widget the product**? |
| Subscriptions | Is the selling plan exposed on the Storefront API, and does the cart carry it through to checkout? |
| Loyalty / rewards | Does point display and redemption have an API, or is it a theme widget plus a checkout extension? |
| Search / merchandising | Is the search index queryable server-side, or is it a JS drop-in bound to theme markup? |
| Consent / cookie banners | Consent must be enforced **before** third-party scripts load — in a headless app this is your code, not the app's |
| Analytics / pixels | Every pixel that "just worked" via the theme now needs **explicit event emission** from your app |
| Upsell / bundling | Cart-transform logic often lives in Shopify Functions (**still works**) *or* in theme JS (**does not**) |
| Page builders | **Almost always bucket 3** — the builder renders into a theme |

**Payments, shipping and tax remain manual per `INT-001` / `INT-002`.** Headless does not change that. Stated here so nobody reads the four-bucket policy as covering them.

---

## 6. The shared register — heuristic only

**RULED v1.11.17: heuristic-only, 90-day per-entry expiry, never authoritative.**

Treat it as *"check here first, then re-verify."* Never as ratified truth.

- A bucket-1 or bucket-2 classification resting on an entry older than **90 days** fails `HL-APPS-002`.
- An entry is a **starting hypothesis**, not a finding. Vendors ship theme-app-extension-only releases and drop headless paths without announcing it.
- **Register schema is deliberately not drafted yet** — master ruled it waits for the second real engagement, because the bootstrap value of a register with one engagement in it is zero.

---

## 7. What the audit produces

One row per detected app, and a row is incomplete without all four:

| Field | Rule |
|---|---|
| App name | From the **store admin**, not the client's recollection |
| Bucket | 1–4. Default 4. |
| **Evidence** | Named and specific. A blank evidence field is a **failure, not a default-pass** (`HL-APPS-001`). |
| Commercial consequence | The SOW line this becomes — configuration, build with hours, replacement plus client decision, or excluded in writing |

Feeds `12-discovery-audit.md` review point 1 and the `discovery-audit.md` artifact's section 1.

---

## Anti-patterns *(lifted from `D-HL-APPS-01`)*

1. Classifying from an app's marketing page instead of its API documentation.
2. Taking the app list from the client instead of the store admin.
3. Leaving an app in bucket 4 at signature without excluding it in writing.
4. Absorbing bucket 2 work into a generic "frontend build" line.
5. Discovering a bucket 3 app at UAT and telling the client then.
6. Assuming a checkout-surface app works because the storefront app does — **different mechanism**.
7. Treating the shared register as authority rather than hypothesis.
8. Building a hard third-party dependency into the render path with no degradation behaviour.
9. Documenting per-app wiring in this arm, and inheriting maintenance debt it cannot service.
10. Forgetting that consent enforcement is now the **storefront's** job, not the app's.

**Added by this KB file:**

11. Clearing the bucket-1 bar with endpoints we identified ourselves rather than a capability the vendor names in its own documentation.
12. Skipping question 5 because the integration works in the happy path.
13. Reading the four-bucket policy as covering payments, shipping or tax. It does not — those stay manual.

---

Last reviewed: 2026-08-06
Next review due: 2026-11-06
