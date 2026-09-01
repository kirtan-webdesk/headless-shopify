# Sprint Adherence Report — S2.2 (Design Fidelity Focus)

**Sprint:** S2.2 — Metaobject-driven dynamic homepage (Module 2, "Home Page Design Compatible")
**Related:** S3.1 (Collection listing), S3.2 (PDP) — same root cause applies
**Verified by:** PM Agent (per `_spine/pm-agent/knowledge/07-adherence-verification.md`)
**Trigger:** Client report — "what I built matches the reference design only ~30-40%"
**Status:** FAIL (design-fidelity acceptance criteria) — reopened for rework, not passed to G4

---

## 1. Was the design reference properly provided?

**Yes.** Checked against `sow-spec.md` frontmatter and the file system directly:

| Reference | Path | Present? |
|---|---|---|
| Homepage design detail spec | `car_brite_home_page_design_details.md` | ✓ 671 lines |
| Collection page design detail spec | `car_brite_collection_page_design_details.md` | ✓ 675 lines |
| Static pixel mockups | `Design/Design/.../Mockup/Pearls_HP.jpg`, `Pearls_CP.jpg` | ✓ present |
| Interactive HTML reference | `Design/` (path in `sow-spec.md.html_reference`) | ✓ present |

`sow-spec.md` line 136 explicitly instructs: *"Please use the provided Home Page and Collection Page `.md` files as design references only."*

**Conclusion: the discrepancy is not a missing-input problem. The client-side deliverable was complete and correctly pointed to.** Any explanation that blames unclear or missing design input would be false — logging it as such would violate PM Agent rule #1 (never invent a gap that isn't real) in the other direction: don't invent a *client-side* gap to excuse a build-side failure either.

---

## 2. Where the discrepancy actually came from

Root cause, per `project.json` risk log (R8, R9, R11 — all logged during this project, not reconstructed after the fact):

1. **R8 (mitigated):** The first build pass (S2.2, S3.1) checked only the interactive HTML's above-the-fold content. The static pixel mockups (`Pearls_HP.jpg`, `Pearls_CP.jpg`) — the actual visual authority — were not opened until the client flagged the build as wrong. Result: homepage shipped missing 6 of 7 real sections, one section built in the wrong place entirely (mega-menu content rendered as a permanent page section), plus a page-wide dark-text-on-dark-background bug.

2. **R9 (mitigated):** `Header.jsx` — visible on every page — was left as generic Hydrogen scaffold (store name instead of logo, dev-store's own nav menu instead of the mockup's nav) through *three separate build/fix passes* before it was caught.

3. **R11 (mitigated):** Even after a full section-by-section rebuild, a dedicated pixel-comparison pass against `Pearls_HP.jpg` still found 4 more gaps that earlier passes missed — because those earlier passes checked "is the section present and roughly right," not "does every value match the source pixel-for-pixel."

**The pattern across all three:** every verification round checked the build against a general impression of the mockup, not a literal field-by-field extraction. `car_brite_home_page_design_details.md` itself defines the correct process and was not followed:

> Line 28: *"Every field that must come directly from the HTML is explicitly marked `[EXTRACT FROM HTML]`."*
> Line 671: *"Do not claim design parity while any `[EXTRACT FROM HTML]` marker remains unresolved."*

That document contains ~60 unresolved `[EXTRACT FROM HTML]` markers — exact colors, spacing units, header height, button states, focus states, typography scale — none of which were ever individually resolved against the real HTML/CSS. Every round of fixes so far has been a visual "looks right now" pass, not the literal extraction the spec itself mandates. **That gap in process — not a gap in what the client gave us — is why sections keep surfacing as wrong on repeat review.**

---

## 3. Adherence status

Per `07-adherence-verification.md`, S2.2/S3.1/S3.2 have sat in `qa` status this entire time. They have never been through a formal PM Agent adherence check against an itemized AC list — every prior "fix" was an informal, client-triggered spot-check, not the structured verification the process defines. That is itself a process gap: **adherence verification should have run before these sprints were ever presented as done, using the design-details.md checklist as the AC source — not after three rounds of client-found errors.**

**Overall Status: FAIL.** Recommend: do not advance S2.2/S3.1/S3.2 to G4 until a literal `[EXTRACT FROM HTML]` resolution pass is completed and each value is checked, not eyeballed.

---

## 4. Recommendation

Run the extraction process the spec document already defines, in full, before the next client review:

1. Open the real `Design/` HTML + linked CSS (not the JPG by eye) for the homepage.
2. Resolve every `[EXTRACT FROM HTML]` marker in `car_brite_home_page_design_details.md` with the actual value (hex colors, px/rem spacing, font-family/weight/size, radii, shadows, breakpoints).
3. Diff those resolved values against the live `_index.jsx` / `app.css` field by field.
4. Fix every mismatch found.
5. Repeat steps 1–4 for `car_brite_collection_page_design_details.md` against `collections.$handle.jsx` / `collections.all.jsx`.
6. Only then re-present for client review, with the resolved spec file as evidence (not a screenshot comparison).

This is a bounded, mechanical task — not a redesign — and is what should have happened at S2.2/S3.1 close instead of the informal passes done so far.

---

*Filed by PM Agent. Status: FAIL, sprints reopened. Awaiting go-ahead to run the extraction pass above.*
