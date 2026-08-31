---
tier: 2
load_when: ["agent-specific-detail"]
description: "PM Agent verifies the team is delivering what was promised. Three verification points: sprint close, milestone close, project close. Detects scope drift, missing deliverables, and acceptance criteria gaps."
---

# 07 — Adherence Verification

> PM Agent verifies the team is delivering what was promised. Three verification points: sprint close, milestone close, project close. Detects scope drift, missing deliverables, and acceptance criteria gaps.

---

## Why this exists

Without explicit verification, projects drift. Developers build what's interesting instead of what's specified. Acceptance criteria get fuzzy. Deliverables get quietly dropped. Final delivery doesn't match the spec the client signed.

PM Agent's job at each verification point: read the spec, read what was actually built, compare them, report.

---

## Three verification points

| Point | When it runs | Scope of check | Output |
|-------|--------------|----------------|--------|
| Sprint adherence | At sprint QA close (before G4 opens) | Single sprint vs. sprint brief | Sprint adherence report |
| Milestone adherence | At milestone close (before G5 opens) | All sprints in milestone vs. milestone spec | Milestone adherence report |
| Project adherence | At project close (before G6 final sign-off) | Full deliverables vs. original spec | Project verification report |

---

## 1. Sprint Adherence Verification

### When it runs
After all 8 QA modules pass for a sprint. Before G4 (Sprint QA gate) opens to the human approver. Auto-triggered by QA Agent completing its work.

### What it checks

For the active sprint, verify:

```
[ ] All sprint scope items (from sprint brief) are present in the merged code
[ ] All acceptance criteria from sprint brief are met (with evidence)
[ ] No additional out-of-scope features were added without CR approval
[ ] Sprint outputs match section-map.json (if applicable)
[ ] Files modified are in expected paths (no rogue file changes)
[ ] Sprint estimated_hours vs. actual_hours variance reported (>25% triggers flag)
[ ] No spec.md sections were modified during this sprint without CR
[ ] All sprint dependencies (from sprint brief) were available before sprint started
```

### How to check

For each item:

1. **Scope items present:** Read sprint brief's `## Outputs`. For each listed output, verify it exists in code (e.g., `sections/[name].liquid` exists, has correct schema).

2. **Acceptance criteria met:** Read sprint brief's `## Acceptance Criteria`. For each AC:
   - If functional AC → look for test evidence (Playwright test pass, manual smoke test note in QA report)
   - If visual AC → look for visual regression screenshot reference
   - If performance AC → check Lighthouse CI report for the relevant page
   - If accessibility AC → check axe-core report
   - If code quality AC → check linter output
   Mark each AC as: VERIFIED / NOT VERIFIED / NOT TESTABLE

3. **No out-of-scope additions:** Compare PR file changes to sprint brief outputs. If files modified that aren't in the scope (e.g., new section added that wasn't in brief), flag.

4. **Estimated vs. actual:**
   ```
   variance = (actual_hours - estimated_hours) / estimated_hours
   if variance > 0.25:
       flag "Sprint overran estimate by [X]%. Root cause investigation needed."
   if variance < -0.25:
       flag "Sprint underran estimate by [X]%. Was scope properly understood?"
   ```

5. **Spec integrity:** Check `audit_log` for any spec.md modifications during this sprint's date range. Any spec changes must trace to an approved Change Request (CR). If not, flag scope drift.

### Sprint adherence report

`/projects/[client]/adherence-reports/sprint-[sprint-id]-adherence.md`:

```markdown
# Sprint Adherence Report — S2.1

**Sprint:** S2.1 — Theme scaffold + base layout
**Milestone:** M2 — Foundation
**Closed:** 2026-05-30
**Verified by:** PM Agent v1.0
**Status:** PASS | PASS_WITH_FLAGS | FAIL

## Scope Coverage
- [✓] Output 1: Theme scaffold — Present (sections/scaffold.liquid)
- [✓] Output 2: Base layout settings — Present (config/settings_schema.json)
- [✓] Output 3: Brand tokens applied — Present (assets/tokens.css)

## Acceptance Criteria
- [✓] AC1: Theme renders in dev environment — VERIFIED (Playwright homepage test pass)
- [✓] AC2: settings_schema.json validates — VERIFIED (theme-check)
- [⚠] AC3: Brand tokens cover 100% of design system — PARTIAL (3/10 token categories missing)
- [✓] AC4: No theme-check errors — VERIFIED
- [✓] AC5: Lighthouse Performance ≥ 80 on dev — VERIFIED (84)

## Scope Drift Check
- Files modified outside sprint scope: NONE
- Spec changes during sprint: NONE
- Unauthorized out-of-scope additions: NONE

## Estimation Variance
- Estimated: 22 hours
- Actual: 26 hours
- Variance: +18% (within tolerance)

## Flags
- ⚠ AC3 partial — 3 token categories missing (typography modifiers, animation, shadows).
  Recommendation: extend S2.1 by 4 hours OR roll into S2.2.

## Overall Status: PASS_WITH_FLAGS
Sprint mostly delivered. AC3 needs resolution before milestone QA.
```

### What happens with the report

- PASS → G4 opens to human approver with report attached
- PASS_WITH_FLAGS → G4 opens, but flags are visible; approver decides
- FAIL → G4 does NOT open. Sprint must be reworked first. Frontend/Backend Agent re-invoked.

---

## 2. Milestone Adherence Verification

### When it runs
After all sprints in a milestone have completed their G4 gates. Before G5 (Milestone Regression) opens.

### What it checks

```
[ ] All milestone deliverables (from milestones.json) are present
[ ] Milestone-level acceptance criteria met
[ ] All sprints in milestone passed their G4
[ ] No bugs P1/P2 still open across milestone
[ ] Estimated milestone hours vs. actual within 20%
[ ] No spec.md changes during milestone without CR
[ ] Cross-sprint integration works (regression test pass)
[ ] Milestone payment trigger conditions met (if billable milestone)
```

### Cross-sprint integration check

When a milestone closes, sprints have been merged together. PM Agent verifies:

- Sprints don't conflict (e.g., S2.2 doesn't break S2.1)
- The milestone as a whole satisfies its broader acceptance criteria (not just the sum of sprint ACs)
- Regression QA from QA Agent reports zero new bugs

### Milestone adherence report

`/projects/[client]/adherence-reports/milestone-[m-id]-adherence.md`:

```markdown
# Milestone Adherence Report — M2

**Milestone:** M2 — Foundation
**Closed:** 2026-06-08
**Sprints completed:** S2.1, S2.2, S2.3, S2.4, S2.5 (QA)
**Verified by:** PM Agent v1.0
**Status:** PASS | PASS_WITH_FLAGS | FAIL

## Deliverable Coverage (from spec)
- [✓] Theme scaffold + base layout (D1, D2)
- [✓] Header + Nav (D3)
- [✓] Footer (D4)
- [✓] Announcement bar (D5)
- [✓] Homepage hero (D6)

## Milestone Acceptance Criteria
- [✓] All foundation sections render correctly
- [✓] Responsive across 5 breakpoints
- [✓] No P1/P2 bugs open
- [✓] Lighthouse Performance ≥ 80 across all 4 templates
- [✓] axe-core: 0 violations
- [⚠] Brand token coverage incomplete (carried over from S2.1)

## Cross-Sprint Integration
- ✓ Regression suite: 0 new bugs across sprints
- ✓ Header + Hero interaction: tested, working
- ✓ Mobile menu + Cart drawer: no z-index conflicts

## Estimation Variance
- Estimated: 80 hours
- Actual: 96 hours
- Variance: +20% (at tolerance threshold)

## Scope Drift Check
- Out-of-scope features added: NONE
- Spec changes during milestone: NONE

## Payment Trigger
Milestone billable: YES (25% release)
Triggered: ON_MILESTONE_CONFIRMED

## Open Items Carried Forward
- Brand token coverage gap (3 categories) → assign to M3 first sprint

## Overall Status: PASS_WITH_FLAGS
Milestone delivered. One item carried forward. Payment release triggered.
```

### What happens with the report

- PASS → G5 opens to human approver
- PASS_WITH_FLAGS → G5 opens with flags visible
- FAIL → G5 does NOT open. Failed deliverables must be addressed. May require new sprint.

---

## 3. Project Adherence Verification

### When it runs
At project close, before G6 (Pre-Launch) final sign-off OR as part of Delivery Head's pre-launch checklist.

### What it checks

Final reckoning. Compares delivered work against the ORIGINAL APPROVED SPEC (with all CRs integrated).

```
[ ] All spec.deliverables[] are present in the final build
[ ] All deliverable acceptance criteria met
[ ] All integrations from spec.scope.integrations[] are configured (or marked manual per D5)
[ ] All milestones closed with confirmed status
[ ] Total estimated vs actual hours reported
[ ] All CRs integrated and approved
[ ] Out-of-scope items in spec.scope.out_of_scope[] are CONFIRMED NOT built
[ ] Risks identified at planning: status closed or mitigated
[ ] All P1/P2 bugs from project history: resolved
[ ] All P3/P4 bugs: documented + assigned (resolve, defer, or wontfix)
```

### Project verification report

`/projects/[client]/adherence-reports/project-final-verification.md`:

```markdown
# Project Final Verification — Aurora Skincare Redesign

**Project:** Aurora Skincare Redesign (WDS-2026-047)
**Started:** 2026-04-12
**Closed:** 2026-06-20
**Total duration:** 9.5 weeks (vs 8 weeks SOW; +18% variance)
**Verified by:** PM Agent v1.0
**Status:** READY_FOR_LAUNCH | FLAGS_REQUIRE_REVIEW | NOT_READY

## Deliverables Audit
| ID | Deliverable | Status | Evidence |
|----|-------------|--------|----------|
| D1 | Homepage redesign | ✓ Complete | section-map M1, all ACs met |
| D2 | PDP template | ✓ Complete | M3, all ACs met |
| D3 | PLP template | ✓ Complete | M3, all ACs met |
| D4 | Cart redesign | ✓ Complete | M4, all ACs met |
| ... | ... | ... | ... |
| D12 | Customer accounts | ⚠ Modified scope | CR-3 reduced to "basic accounts only" |

## Integration Audit
| Integration | Status | Notes |
|-------------|--------|-------|
| Klaviyo | ✓ Configured + tested | Agency configured |
| Judge.me | ✓ Configured + tested | Client owns account |
| Shopify Payments | ⚠ Manual confirm pending | Client to verify final settings |
| GA4 | ✓ Configured + tested | Agency configured |
| Meta Pixel | ✓ Configured + tested | Agency configured |

## Milestones Audit
| Milestone | Sprints | Status | Variance |
|-----------|---------|--------|----------|
| M1 | 3 | ✓ Confirmed | +5% |
| M2 | 5 | ✓ Confirmed | +20% |
| M3 | 4 | ✓ Confirmed | +12% |
| M4 | 4 | ✓ Confirmed | +25% |
| M5 | 3 | ✓ Confirmed | +15% |
| M6 | 3 | ✓ Confirmed | +10% |
| M7 | 2 | ✓ Confirmed | +8% |

## Effort Summary
- Estimated total: 480 hours
- Actual total: 542 hours
- Variance: +13%

## Change Requests
- CR-1: Add subscription product support (M3) — approved, integrated
- CR-2: Reduce blog migration scope (M5) — approved, scope reduced
- CR-3: Reduce custom accounts to basic (M5) — approved, scope reduced
- Total CR impact: +20 hours / -32 hours = -12 net hours

## Risks Final Status
- R1 (content delays): MITIGATED — content delivered 4 days late, recovered
- R2 (Klaviyo API): CLOSED — no API changes during project
- R3 (custom workflows): REALIZED — required 8 extra hours (rolled into CR-1)

## Bug Status
- P1 found during project: 2 (both resolved)
- P2 found: 7 (all resolved)
- P3 found: 14 (12 resolved, 2 deferred to warranty period)
- P4 found: 23 (18 resolved, 5 documented as known limitations)

## Out-of-Scope Confirmation
- ✓ Custom checkout extensions (not built)
- ✓ Blog content writing (not done — client provided)
- ✓ Paid media setup (not done)
- ✓ Photography (not done — client provided)

## Overall Status: READY_FOR_LAUNCH
All deliverables present. Integrations verified. 5 P4 documented limitations.
Recommend proceeding to G6 final sign-off.
```

### What happens with the report

- READY_FOR_LAUNCH → G6 can proceed
- FLAGS_REQUIRE_REVIEW → G6 paused, developer/Internal PM reviews flags before proceeding
- NOT_READY → G6 cannot open. Missing deliverables or unresolved P1/P2 must be addressed.

---

## How to detect drift

PM Agent uses the `audit_log` to detect drift:

```
For each sprint/milestone/project being verified:
    1. List all spec.md modifications in the date range
    2. For each modification, check if there's a corresponding CR entry in audit_log
    3. If spec changed without CR → DRIFT FLAG
    4. List all files modified in the date range (from git history)
    5. For each file, check if it's expected per sprint brief / section-map.json
    6. If file modified that's not expected → DRIFT FLAG
    7. List all bugs that arose in the date range
    8. For each bug, check if its root cause is hallucinated AI code OR genuine spec gap
    9. If hallucinated → KB update flag (per K4 feedback loop)
    10. If spec gap → CR retroactively needed
```

Drift flags surface in adherence reports with severity:
- Minor drift: 1-2 lines of unexpected code → note, not blocking
- Moderate drift: An unexpected feature shipped → require CR retroactively
- Major drift: Multiple unauthorized additions → halt milestone, investigate

---

## Adherence verification anti-patterns

1. **Marking as PASS when AC are PARTIAL.** Don't fudge. Partial = PASS_WITH_FLAGS.

2. **Skipping verification if QA passed.** QA tests code quality. Adherence verifies SCOPE. Different concerns.

3. **Not surfacing variance.** A 30% sprint overrun is a process signal — surface it. Don't silently accept.

4. **Auto-creating CRs to cover drift.** CRs come from client requests, not from PM Agent retroactively justifying scope drift. If drift happened, the human creates the CR.

5. **Adherence report that doesn't reference specific evidence.** "AC2 verified" with no link to test/QA report = useless. Include evidence pointers.

---

## When verification reveals systemic issues

If multiple sprints in a row show:
- Estimation variance > 25%
- Scope drift flags
- AC unverifiable due to vague criteria

→ This is a process signal. Surface in next milestone retro (which is a chunk-2 update doc).

Recommend: PM Agent should produce smaller sprints, tighter ACs, or both. The team should review their estimation patterns.

---

Last reviewed: 2026-05-24 by Claude (initial)
Next review due: 2026-08-24
