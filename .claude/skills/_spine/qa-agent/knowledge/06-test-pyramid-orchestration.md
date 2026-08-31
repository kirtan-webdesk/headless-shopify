---
tier: 2
load_when: ["agent-specific-detail"]
description: "Which tests run at which stage. Per A3 + B1-B12 decisions, this is the full test pyramid orchestrated across stages."
---

# 06 — Test Pyramid Orchestration

> Which tests run at which stage. Per A3 + B1-B12 decisions, this is the full test pyramid orchestrated across stages.

---

## The test pyramid

```
                    ╱╲
                   ╱  ╲
                  ╱ ME ╲          Manual / Exploratory (slowest, most expensive)
                 ╱──────╲          - Claude in Chrome
                ╱   E2E   ╲        - Screen reader testing
               ╱  Playwright╲      - Real device testing
              ╱──────────────╲
             ╱  Integration   ╲   Playwright (fewer, broader)
            ╱     Tests        ╲
           ╱──────────────────────╲
          ╱  Component / Visual    ╲ axe-core, Lighthouse, visual regression
         ╱      Regression          ╲
        ╱──────────────────────────────╲
       ╱       Unit Tests               ╲ Fast feedback per function/module
      ╱──────────────────────────────────╲
     ╱     Static Analysis / Linters       ╲ Catches issues before tests run
    ╱────────────────────────────────────────╲
```

Bottom layers (unit, static) run frequently and fast. Top layers (exploratory, manual) run less frequently but catch what's missed below.

---

## Per-stage test orchestration

### Pre-commit (developer's local machine)

Triggered by git commit. Must pass before commit succeeds.

```
1. Linters (Module 1)
   - Theme-check, PHPCS, ESLint per platform
2. Unit tests for changed files
   - Run only tests touching modified files (fast)
3. Type checks (if TypeScript)
```

**Duration target: < 30 seconds**

Implemented via git hooks (Husky or platform-equivalent).

### Pre-PR (developer opens pull request)

Triggered by `git push` on feature branch. Runs in GitHub Actions.

```
1. Full lint pass (Module 1)
2. Unit tests (full suite for the project)
3. Playwright tests (sprint-relevant subset)
4. axe-core on affected pages (Module 5)
5. Code Review Agent reviews PR (per H1-H15)
```

**Duration target: < 5 minutes**

Reports surface on PR. PR cannot merge if any fail.

### Pre-merge (PR ready to merge)

Required before merging to develop branch:

```
1. All Pre-PR checks pass
2. Lighthouse CI on affected pages (Module 6)
   - Performance, Accessibility, SEO, Best Practices
3. Visual regression on affected sections (Module 3 visual)
4. Code Review Agent: no P1 or P2 unresolved
5. Senior dev human review (1 reviewer minimum)
6. CODEOWNERS file enforces senior review for sensitive paths
```

**Duration target: < 15 minutes for automated + however long human review takes**

### Pre-staging (merge to develop branch)

Triggered when feature merges to develop. Auto-deploys to staging theme:

```
1. Full Playwright suite (not just sprint-relevant)
2. Lighthouse CI on all affected pages
3. axe-core full pass on all pages
4. Security scan (Module 8)
5. Visual regression: full milestone comparison
```

**Duration target: 30-60 minutes**

### Sprint QA (G4)

Per sprint, after sprint work merges to develop:

```
1. Full QA module 1-8 (per `01-qa-modules.md`)
   - Including: Playwright sprint tests, Claude in Chrome exploratory,
     Lighthouse on all sprint-affected pages, axe full, etc.
2. Sprint adherence verification (PM Agent)
3. Bug triage + classification
4. Generate sprint QA report
```

**Duration target: 30-90 minutes (depending on sprint size)**

### Milestone regression (G5)

After all sprints in milestone close:

```
1. Full QA module 1-8 across all milestone-scoped pages
2. Cross-browser matrix (Chrome, Firefox, Safari, Edge)
3. Integration scenarios (cross-sprint user journeys)
4. Full Lighthouse run on milestone pages
5. Visual regression against milestone baseline
6. Bug detection: anything new since milestone start?
7. Generate milestone QA report
```

**Duration target: 1-3 hours**

### Pre-launch (contributes to G6)

Final comprehensive QA:

```
1. Everything from milestone regression
2. Manual screen reader testing (NVDA + VoiceOver)
3. Real device testing (iOS Safari, Android Chrome, etc.)
4. Production-like environment testing (staging)
5. Full SEO audit (Screaming Frog or equivalent)
6. Synthetic monitoring smoke test
7. Generate pre-launch QA report
8. Hand off to Delivery Head's pre-launch checklist
```

**Duration target: 1-2 days (not hours)**

### Post-launch (within 24 hours)

After launch executes:

```
1. Synthetic monitoring active (UptimeRobot or equivalent — per B8)
2. Lighthouse on live production
3. Smoke test critical flows on live (cart, checkout, signup)
4. Analytics receiving events (verify in GA4 / Meta / etc.)
5. Real user monitoring (RUM) data collection begins
```

**Duration target: ongoing for first 24 hours**

---

## Tool orchestration

### Playwright (scripted)

Used in:
- Pre-PR (sprint-relevant subset)
- Pre-staging (full suite)
- Sprint QA (Module 2 Functional, Module 3 Responsive, Module 4 Cross-browser)
- Milestone regression
- Pre-launch

Maintained as a growing test library per platform:
- `tests/playwright/critical-flows/` — checkout, cart, signup
- `tests/playwright/responsive/` — breakpoint coverage
- `tests/playwright/visual/` — screenshot comparison
- `tests/playwright/integration/` — cross-feature scenarios
- `tests/playwright/accessibility/` — axe wrappers

### Claude in Chrome (exploratory)

Used in:
- Sprint QA (Module 2 exploratory, Module 3 mobile UX judgment, Module 7 SEO content verification)
- Milestone regression (exploratory of new flows)
- Pre-launch (final exploratory pass)

See `07-claude-in-chrome-usage.md` for specifics.

NOT used in:
- Pre-commit (too slow, too expensive)
- Pre-PR (too slow, too expensive)
- Anywhere requiring sub-30-second feedback

### Lighthouse CI

Used in:
- Pre-merge (sprint-affected pages)
- Pre-staging (milestone-affected pages)
- Sprint QA (full module 6)
- Milestone regression (full)
- Pre-launch (full)
- Post-launch monitoring

Always 3 runs per page, median taken.

### axe-core

Used in:
- Pre-PR (affected pages)
- Pre-staging (full)
- Sprint QA (Module 5)
- Milestone regression
- Pre-launch

Zero violations gate per I3.

### Visual regression

Used in:
- Pre-merge (affected sections)
- Pre-staging (milestone scope)
- Sprint QA (sprint scope)
- Milestone regression (full milestone)
- Pre-launch (full site)

### Linters (Module 1)

Used in:
- Pre-commit (changed files)
- Pre-PR (full)
- Every CI run

### Security scanning

Used in:
- Pre-PR (npm audit on dependency changes)
- Pre-staging (full)
- Sprint QA (Module 8)
- Milestone regression
- Pre-launch (final scan)
- Post-launch monitoring (Dependabot)

### Screen reader testing

Used in:
- Milestone regression (key flows manual)
- Pre-launch (key flows full)

NOT automated (too dependent on assistive tech behavior). Manual is required.

---

## Test execution speed targets

Per-stage execution time matters. Slow CI demotivates devs.

```
Pre-commit:       < 30 sec
Pre-PR:           < 5 min
Pre-merge:        < 15 min  (excluding human review)
Pre-staging:      < 60 min
Sprint QA:        < 90 min
Milestone:        < 3 hours
Pre-launch:       1-2 days
```

If any stage consistently exceeds target by 50%+, investigate and optimize. Common causes:
- Tests not parallelized
- Tests testing too much (split into smaller specs)
- Network/API calls in tests (mock these)
- Visual regression with too many comparison points (focus on critical sections)

---

## Test failure → action mapping

| Stage failure | Action |
|---------------|--------|
| Pre-commit | Block commit. Dev fixes locally. |
| Pre-PR | Block PR open. Fix and push again. |
| Pre-merge | Block merge. Dev addresses. Code Review Agent re-runs. |
| Pre-staging | Block staging deploy. Dev addresses. |
| Sprint QA | Sprint cannot pass G4. Dev fixes. QA reruns. |
| Milestone regression | Milestone cannot pass G5. Dev addresses. QA reruns. |
| Pre-launch | Launch delayed. Cannot proceed to G6. |
| Post-launch | Rollback if health check fails. Otherwise log + fix in next sprint. |

NO stage failure is acceptable to "ship anyway." Override requires senior dev approval + audit log.

---

## Test maintenance

Tests rot. Old tests break. New features need new tests.

QA Agent's responsibility:
- After each sprint: identify test coverage gaps (new section without Playwright test, new flow without integration test)
- Add tests as part of sprint work, not as afterthought
- Remove obsolete tests (test for feature that was deprecated)
- Update visual regression baselines when designs change intentionally

Quarterly: review test suite health (per K5):
- Are tests still relevant?
- Are tests catching real issues?
- Are there flaky tests to fix?
- Is coverage improving?

---

## Anti-patterns

1. **Running all tests at every stage.** Too slow. Stage-appropriate scope is required.

2. **Skipping pre-merge tests "because they take too long."** They take that long for a reason. Optimize or accept the time.

3. **Disabling flaky tests instead of fixing them.** Flaky tests indicate real instability. Fix root cause.

4. **No test for new features.** If you ship without a test, you've shipped a regression-waiting-to-happen.

5. **Visual regression with too many comparison points.** Focus on critical sections. Diff-everything-everywhere = noise.

6. **Tests that hit production APIs.** Mock external services. Tests should be hermetic.

7. **No integration tests across sprints.** Sprint tests pass, integration fails. Cross-sprint scenarios catch this.

---

Last reviewed: 2026-05-24 by Claude (initial)
Next review due: 2026-08-24
