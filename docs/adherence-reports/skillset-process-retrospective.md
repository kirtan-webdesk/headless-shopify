# PM Agent Retrospective — Why the Skillset Didn't Produce Mockup-Accurate Output

**Requested by:** Client, via full-thread review request
**Scope:** Every prompt/decision in this engagement, not just a single build pass
**Verified by:** PM Agent (per `_spine/pm-agent/knowledge/07-adherence-verification.md`)
**Status:** Two separate, real causes found. One is a disclosed scope decision. One is a genuine execution failure. Neither is fixed by pretending the other doesn't exist.

---

## 0. First, a factual correction

Before anything else: **no Product Page mockup has ever existed in this project.**

Checked directly, again, right now:

```
Design/
└── Design/
    ├── Collection page Design/   (Images, Mockups, PEARLS Collections HTML)
    └── Homepage Design/          (Fonts, Mockup, PEARLS Assets, PEARLS-Homepage HTML)
```

Two folders. No `Product Page Design/`, no PDP HTML, no PDP JPG, anywhere. This has been checked and re-confirmed at least four times across this engagement (`HANDOFF.md`, `project.json.sow.gaps`, multiple session summaries). If a Product Page mockup exists on your side, it was not placed in `Design/` and was never received here — send it and I'll run the same literal-extraction process against it that Home and Collection just got. Until then, the PDP was built "consistent with the system" (same tokens, same component patterns) because there was nothing to match it against — that is a missing-input gap, not a skillset failure, and it's been logged as one since early in this project (`sow.gaps`).

Home and Collection pages **did** have real mockups, and those are the ones this retrospective is about.

---

## 1. The real, structural answer: the skillset's own fidelity guarantee was turned off, on the record, in week one

This skillset has a built-in mechanism specifically designed to make "the build doesn't match the mockup" close to impossible: `_spine/designer-agent/knowledge/09-html-mockup-standards.md`. Under the normal process:

1. Designer Agent *builds* the mockup itself, token-by-token, from `design-tokens.json` — no hardcoded colors, no hardcoded spacing, everything traced to a token file.
2. Before that mockup is even shown at G2, it runs through 8 automated checks: axe-core, Lighthouse, token-only-colors grep, mobile responsive render, link integrity, image dimensions, semantic HTML, no-inline-styles.
3. Frontend Agent's job is then, by the skillset's own definition, **"mostly mechanical"** — swap static content for real data — because the scaffold is already correct. The standard explicitly states the target: **"visually identical to mockup (visual diff tolerance < 5%)."**

That pipeline is what's supposed to make fidelity a non-issue. **It did not run on this project.** From `project.json.design.reference_verification`, written and approved on 2026-08-31:

> "validate-mockup.sh's 8 checks (token-only colors, section-scoped CSS, image dimensions, etc.) deliberately NOT run — not applicable, this isn't a coded mockup deliverable per the path deviation above."

And from `project.json.design.path_deviation`:

> "Standard Path 4 design effort is 30-60h... more than this entire project's 45h build budget. Per user decision 2026-08-31, deviating from the standard Designer Agent production process: treating the client-provided reference HTML as REFERENCE-ONLY (visual/UX reference), not as a coded G2 deliverable. Frontend Agent builds Hydrogen components directly against these references... skipping a separate formal HTML-mockup production stage."

In plain terms: the skillset looked at the reference HTML you supplied, correctly calculated that properly productionizing it through Designer Agent would cost 30-60 hours — more than the entire 45-hour budget for the whole project — flagged that mismatch, and a decision was made (by Internal PM, on the record, G2 gate `CONFIRM`ed 2026-08-31T13:45:00Z) to skip that stage and have Frontend Agent build directly against your reference files by eye instead.

**That is the root cause.** Not a bug, not the skillset malfunctioning — a disclosed, approved, budget-driven scope decision that turned off the specific mechanism designed to guarantee fidelity. Once that stage is skipped, nothing in the skillset automatically catches a color that's off by a few hex digits or a heading that's 40% too small — because the thing that normally catches those (Designer Agent's own token pipeline + its 8 validation checks) never ran.

---

## 2. Given that the guarantee was off, what filled the gap — and where it *also* failed

Skipping Designer Agent's pipeline doesn't make fidelity impossible, it just means a human/agent has to get every value right by eye, from an externally-built reference, with no systematic check. That's exactly what should have happened carefully and didn't, across several real, avoidable execution failures this session found and fixed:

| # | What went wrong | Where it's logged |
|---|---|---|
| 1 | First build pass checked only the interactive HTML's above-fold content, never opened the actual static JPG mockups | `risks[R8]` |
| 2 | Header left as generic scaffold through three separate "fix" passes | `risks[R9]` |
| 3 | Even a full section rebuild still missed specific values (colors, stat formatting) — caught only on a dedicated pixel recheck | `risks[R11]` |
| 4 | The reference `.md` spec files are literal `[EXTRACT FROM HTML]` checklists (~60 placeholders each) — never actually resolved against the real source; every round matched "by eye," not by value | `risks[R12]` — filed as a formal adherence FAIL |
| 5 | Verification was done at the browser pane's narrow default width (~580-800px), where responsive `clamp()` typography sits near its minimum and hides real bugs at the max/desktop end. This is how a sitewide bug — every button on every page was a full pill shape instead of the mockup's barely-rounded rectangle — survived two "complete" fidelity passes | `risks[R13]`/`R14` |
| 6 | Collection page: a page-wide approximated background color plus an explicit override were silently defeating an otherwise-correct CSS fix through selector specificity — a real, hidden bug, not a fidelity miss | audit_log, `collection_page_literal_extraction_pass_1` |

None of these are mysterious. They're all things a systematic, token-driven Designer Agent pipeline (per §1) would have structurally prevented, and that ad-hoc "build directly against the reference by eye" work is exactly the kind of process that produces them.

---

## 3. What actually fixed it (this session)

Once the reference HTML was properly decompressed to its real source (both files are self-unpacking React/CSS bundles, not plain HTML — required writing a one-off extraction script per page) and every visual value was checked literally against that source rather than approximated, both Home and Collection pages were brought substantially closer to the mockup — see `sprint-S2.2-design-adherence.md` and the `homepage_literal_extraction_pass_1/2/3` and `collection_page_literal_extraction_pass_1` audit log entries for the itemized fix lists.

That's the manual version of what Designer Agent's pipeline does automatically. It works, but it's slower and it's exactly why it took multiple rounds instead of one.

---

## 4. Bottom line

- **Product Page:** no mockup was ever supplied. Not a skillset failure — a missing input, logged since early in the project.
- **Home and Collection:** the skillset's own fidelity-guarantee mechanism was knowingly turned off in week one because running it properly would have cost more than the entire project budget — a decision made and approved on the record, not hidden. Given that, the manual process that replaced it was executed with real, avoidable gaps (narrow-viewport testing, unresolved extraction placeholders, approximated values) that have now been found and fixed through a literal, value-by-value pass.

If 100% pixel fidelity on Home/Collection going forward, plus real PDP fidelity once a mockup exists, is the bar — the durable fix is either: (a) budget for the standard Designer Agent path properly (30-60h, per `02-design-path-decision.md`), or (b) keep the current "reference-only, Frontend Agent builds by eye" approach but require the literal-extraction method used this session as a mandatory step before any page is presented as done, not an after-the-fact recovery when it's flagged as wrong.

---

*Filed by PM Agent. No further changes made based on this review — it's a retrospective, not a build task.*
