---
proposal_id: D-HL-APPS-01
revision: 2
status: RATIFIED
proposed_by: Headless skill-dev window (Claude)
proposed_date: 2026-08-05
revised_date: 2026-08-06
revision_reason: "Rebuilt after working-directory loss. Adds the skill-owns-policy / dev-owns-wiring split explicitly, and aligns the four-way classification with D-HL-DISCOVERY-01 rev 3."
rebuild_note: "Rebuilt 2026-08-06 from this window's own record. Structure and rules are faithful; exact rev 1 wording is not guaranteed."
ratified_by: master (v1.11.17)
related: D-HL-DISCOVERY-01, D-HL-STACK-01, D-HL-TYPES-01, INT-001, INT-002
applies_to: [headless]
severity: high
---

# D-HL-APPS-01 (PROPOSED, rev 2) — App and Integration Compatibility Policy

## Master reconciliation (v1.11.17)

**Status:** RATIFIED by master 2026-08-07 in v1.11.17. Below-line rulings:

- **Shared cross-engagement app-classification register (§ OQ):** ~~open~~ **RULED v1.11.17 = heuristic-only, 90-day per-entry expiry, never authoritative.** Register schema drafted when second engagement lands.
- **Five qualification questions:** authoritative in the body. Not yet homed in an arm KB file (belongs in `08-app-integrations/`, unwritten) — recorded so a future sweep does not mistake absence for drift.

Precedence per D-KB-FIDELITY-01 v1.11.21 amendment: **inventory authoritative for status; this proposal authoritative for detail.**

---

> **Status: PROPOSED — awaiting master ratification.**

---

## Decision (one line)

Every Shopify app, BigCommerce app, script, pixel and third-party integration present on (or proposed for) a headless engagement is classified into **one of four buckets with named evidence**, before pricing. No app is assumed to work.

---

## What this skill owns, and what it does not

This is the boundary that stops the skill from becoming a wiring manual that goes stale every quarter.

| Owned by this skill | Owned by the developer at build time |
|---|---|
| The **classification policy** — the four buckets, and what evidence is required to place an app in each | The actual API calls for any specific app |
| The **qualification gate** — the five questions asked of any app before it enters a headless scope | Version-specific SDK usage |
| The **evidence standard** — what counts as proof of compatibility | Debugging a particular vendor's SDK |
| The **commercial consequence** — how each bucket lands in the SOW | Writing the integration code |

**Reason:** app-by-app wiring instructions are stale within one quarter and there are thousands of apps. A classification policy is durable. If the skill starts documenting "how to integrate Klaviyo," it has taken on maintenance debt it cannot service.

---

## The binding rule

**No app is compatible until proven compatible.** The presence of an app on the current site is evidence that the app works *in a theme*. It is not evidence of anything in a headless storefront.

The failure mode this exists to stop: quoting a headless build with the app list copied from the theme site and the assumption that it carries over. It does not. In a theme, the app injects itself. In a headless storefront, **there is no theme to inject into.**

---

## The four-way classification

Every app gets exactly one bucket, with evidence recorded.

| Bucket | Definition | Evidence required to place it here | SOW consequence |
|---|---|---|---|
| **1 — Fully compatible** | Works via API/SDK with no custom frontend work beyond configuration | Vendor documents a headless/API path **and** the specific capability needed is named in that documentation | Configuration line item |
| **2 — Custom integration required** | The backend capability exists via API, but the storefront presentation must be built | API exists; no drop-in frontend; the UI it provided in the theme must be rebuilt | Named build line item with hours |
| **3 — Replacement required** | Depends on the theme layer (app blocks, ScriptTag, theme app extension) with no API path | Vendor offers no headless path, or the capability is theme-only | Replacement product selection + build + **client decision required** |
| **4 — Requires discovery** | Cannot be determined without contacting the vendor or building a spike | Anything not proven into 1–3 | **Blocks pricing.** Either time-box the spike or exclude the app from scope in writing |

**Bucket 4 is not a soft bucket.** An app in bucket 4 at signature time is an unpriced risk that has been signed for. Either it moves to 1/2/3 before signature, or the SOW names it as excluded.

**Default bucket is 4.** An app with no evidence is not "probably fine" — it is undetermined.

---

## The qualification gate — five questions per app

Asked before an app enters a headless scope, whether it is an existing app or one being newly proposed:

1. **Does the vendor document a headless or API-based integration path** — and does that documentation name the *specific* capability required, not just "we have an API"?
2. **Does it rely on the theme layer?** App blocks, ScriptTag, theme app extensions, `theme.liquid` injection — all of these have no equivalent in a headless storefront.
3. **Does it require a checkout surface?** Checkout is Shopify-hosted in every architecture here. Checkout extensibility is a different mechanism from storefront rendering, and its plan gating is **`TODO-VERIFY`** (see the verification register). Do not assert checkout capability until that item is verified.
4. **Does it require server-side secrets?** If yes it cannot live in the browser bundle — it becomes a server route, which drags in `D-HL-SEC-01` (rate limiting, token handling) and is a build item, not a config item.
5. **What happens on failure?** If the app's service is down or rate-limited, does the storefront degrade or does the page fail? A hard dependency on a third-party service in the render path is an availability decision that must be named.

An app that cannot answer all five is bucket 4.

---

## Categories that predictably break, and the question to ask

These are not classifications — the four buckets are. These are the categories where the theme assumption bites hardest, with the question that resolves them fastest.

| Category | The question |
|---|---|
| Reviews | Is there a public API for review retrieval and submission, or was the widget the product? |
| Subscriptions | Is the selling plan exposed on the Storefront API, and does the cart carry it through to checkout? |
| Loyalty / rewards | Does point display and redemption have an API, or is it a theme widget plus a checkout extension? |
| Search / merchandising | Is the search index queryable server-side, or is it a JS-drop-in bound to theme markup? |
| Consent / cookie banners | Consent must be enforced before third-party scripts load — in a headless app this is your code, not the app's |
| Analytics / pixels | Every pixel that "just worked" via the theme now needs explicit event emission from your app |
| Upsell / bundling | Cart-transform logic often lives in Shopify Functions (still works) *or* in theme JS (does not) |
| Page builders | Almost always bucket 3 — the builder renders into a theme |

**Payments, shipping and tax remain manual per `INT-001` / `INT-002`.** Headless does not change that; it is stated here so nobody reads the four-bucket policy as covering them.

---

## Where this lands commercially

- Bucket 2 and 3 items are **named line items with hours**, not absorbed into "frontend build."
- Bucket 3 requires a **client decision** — they are being told an app they pay for monthly will not survive the rebuild. That conversation happens at proposal stage, not at UAT.
- The complete classified inventory is an **artifact of discovery** (`D-HL-DISCOVERY-01`) and is attached to the SOW.

---

## Forbidden prefix request

Reserve `HL-APPS-001` … `HL-APPS-008` for this arm's app-compatibility rules. Escalated to master separately.

---

## Anti-patterns

1. Copying the app list from the theme site into the headless SOW and assuming it carries over.
2. Treating "the vendor has an API" as proof of compatibility without checking the *specific* capability.
3. Leaving an app in bucket 4 at signature without excluding it in writing.
4. Absorbing bucket 2 work into a generic "frontend build" line.
5. Discovering a bucket 3 app at UAT and telling the client then.
6. Assuming a checkout-surface app works because the storefront app does — different mechanism.
7. Putting a server-side secret in the browser bundle because the vendor's quickstart did.
8. Building a hard third-party dependency into the render path with no degradation behaviour.
9. Writing app-specific wiring instructions into this skill instead of the classification policy.
10. Forgetting that consent enforcement is now the storefront's job, not the app's.

---

## Open question requiring an answer before ratification

**Should the classified app inventory be a shared register across engagements?** The same twenty apps will recur. A shared register turns per-project research into an asset — but a shared register with no re-verification date becomes a source of confidently wrong answers when a vendor ships a headless SDK, or removes one. If master ratifies a shared register, it needs an expiry field per entry.

---

## Ask to master

Ratify D-HL-APPS-01 rev 2, reserve the `HL-APPS-` prefix, and rule on the shared-register question.

---

Last reviewed: 2026-08-06
Next review due: 2026-11-06
