---
tier: 3
load_when: ["human-reference-only"]
description: "Template for the spec-conformance ledger required by D-HL-SPEC-01. Built at G1 from the signed SOW, walked at G4 at every sprint exit. Every SOW requirement becomes one or more rows with an observable acceptance test. A row with no test, a failing test, or an unverified assertion blocks sprint exit under D-QA-GATE-BLOCK. Carries HL-SPEC-001..004."
applies_to: [headless]
decision_refs: [D-HL-SPEC-01, D-DES-01, D-QA-GATE-BLOCK]
doc_type: template
last_reviewed: 2026-08-27
next_review_due: 2026-11-27
---

# Spec Conformance Ledger — `<CLIENT>` / `<ENGAGEMENT>`

> **Built at G1 from the signed SOW. Walked at G4, every sprint exit.**
> Rules: `knowledge/13-spec-conformance.md`. Blocking semantics: `D-QA-GATE-BLOCK`.
>
> **Built from K4 pilot feedback.** The pilot shipped a static homepage against a SOW that required a Metaobject-driven dynamic one, and passed every other gate in the arm on the way.

| | |
|---|---|
| Engagement type / architecture | |
| SOW version + date | |
| Ledger built by / date | |
| Sprints walked | |

---

## The ledger

**Quote the requirement verbatim. A paraphrased requirement is a re-negotiated one.**
**One requirement, one row.** A compound SOW sentence becomes several rows.

| # | Requirement *(verbatim from SOW)* | Observable acceptance test | Route / component | Verified by | Date | Status |
|---|---|---|---|---|---|---|
| 1 | | | | | | ☐ pass ☐ fail ☐ **no test** |
| 2 | | | | | | ☐ pass ☐ fail ☐ **no test** |
| 3 | | | | | | ☐ pass ☐ fail ☐ **no test** |

### Is the test observable?

**The question: would an incorrect implementation also pass this test?** If yes, it is not a test.

| Not observable | Observable |
|---|---|
| "Homepage is dynamic" | "Editing a Metaobject entry in admin changes the rendered homepage with **no deploy and no code change**; banners, featured collections, promotional sections and configurable blocks are each independently editable" |
| "Matches the design" | "Built route diffed against the approved mockup at each declared viewport; no unexplained divergence in typography, colour, spacing or section order" |
| "Responsive" | "The mockup comparison passes at **each** declared breakpoint, listed here: ___" |
| "Navigation works" | "Nav and mega-menu regression suite passes; re-walked at **every** sprint exit, not only the sprint that built it" |

---

## Shared-surface rows — re-walked every sprint

**Breakage here is invisible to whoever caused it.** These rows do not retire.

| Surface | Acceptance test | Last walked | Status |
|---|---|---|---|
| Navigation / mega-menu | | | |
| Header / footer | | | |
| Page shell / shared layout | | | |
| Design tokens | | | |

---

## Design-fidelity comparison — `D-DES-01` mockup

Per route with an approved mockup. **Run at every declared viewport, not the widest only.**

| Route | Typography | Colour | Spacing | Section order + presence | Breakpoints run | Unexplained divergence? |
|---|---|---|---|---|---|---|
| | | | | | | |

**A missing section is a missing requirement, not a styling difference.**

Accepted deviations — **each needs a name against it. Unexplained drift is the failure:**

| Route | Deviation | Accepted by | Date |
|---|---|---|---|

---

## Staged dynamic requirements

Static now, dynamic later is **a dated decision recorded here**, never an implementation detail. An undated "wire it up later" is `HL-SPEC-003`.

| Requirement | Static until | Agreed by | Date recorded |
|---|---|---|---|

---

## Sprint-exit walk

| Sprint | Rows walked | Passing | Failing | No test | Exit |
|---|---|---|---|---|---|
| | | | | | ☐ EXIT ☐ **BLOCKED** |

**Blocking conditions — any one halts sprint exit:**

- A row with a **failing** test — `HL-SPEC-001`
- A row with **no test**, or an unobservable one — `HL-SPEC-002`
- A dynamic requirement satisfied **statically** with no dated staging decision — `HL-SPEC-003`
- A route with an approved mockup and **no recorded comparison** — `HL-SPEC-004`
- A row marked complete by the person who built it, **with no independent verification**

**A percentage is not a pass.** If a requirement genuinely has degrees, the threshold was written into the acceptance test before build, by someone with authority to accept the remainder. *"70% match"* is what appears when nobody set a pass condition.

**A blocked row halts. It does not become a backlog ticket so the sprint can close.**
