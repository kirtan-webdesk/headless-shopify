---
tier: 2
load_when: ["agent-specific-detail"]
description: "Three levels of regression testing: sprint, milestone, pre-launch. Each broader in scope than the last. Catches regressions before they compound."
---

# 05 — Regression Protocol

> Three levels of regression testing: sprint, milestone, pre-launch. Each broader in scope than the last. Catches regressions before they compound.

---

## What "regression" means

A regression = something that worked before now doesn't. New work has broken old work.

Common regression causes:
- Refactor that broke an unrelated section
- CSS specificity conflict (new styles overriding old)
- JavaScript variable name collision
- Schema change affecting other queries
- Cache invalidation issue
- Integration update affecting other integrations
- Library update with breaking changes

Regression testing exists because individual sprint QA can pass while the system breaks.

---

## Three regression levels

### Sprint regression (G4)

**Scope:** This sprint's work + the immediately related areas (sections this sprint touched, shared dependencies).

**What runs:**
- Module 1-8 QA on changed files
- Playwright tests for affected pages
- Lighthouse on affected pages
- Visual regression on changed sections + immediately adjacent

**Doesn't run:**
- Full site regression (too slow per-sprint)
- Cross-platform browser matrix (saved for milestone)
- Manual screen reader (saved for milestone or pre-launch)

**Duration:** Sprint regression should complete in < 30 minutes for a typical 3-5 day sprint.

### Milestone regression (G5)

**Scope:** All sprints in the milestone + integration across them.

**What runs:**
- Full Module 1-8 QA across all sprint outputs
- Playwright tests covering ALL pages built in this milestone (and earlier still-active pages)
- Full Lighthouse run on all milestone-scoped pages
- Cross-browser matrix (Chrome, Firefox, Safari, Edge)
- Visual regression vs. milestone baseline (NOT vs. sprint baselines)
- Cross-sprint integration tests:
  - Does new section conflict with header from S2.1?
  - Does new JS module break product page from S3.1?
  - Does new metafield affect data shown in other sections?

**Duration:** 1-3 hours depending on scope.

### Pre-launch regression (G6 contribution)

**Scope:** EVERY page, EVERY interaction, EVERY integration.

**What runs:**
- Full Module 1-8 QA across the entire site
- Playwright tests on EVERY page in the spec
- Lighthouse on every key page (mobile + desktop)
- Cross-browser matrix on real devices (BrowserStack or physical devices)
- Manual screen reader testing (NVDA + VoiceOver) on key flows
- Full Screaming Frog (or similar) crawl
- Production-like environment testing
- Synthetic monitoring smoke tests against staging

**Duration:** 1-2 days. Pre-launch QA is not rushed.

---

## Sprint regression workflow

```
1. Determine affected pages
   - Pages where sprint output appears (e.g., homepage if hero sprint)
   - Pages that share dependencies (e.g., header changes affect all pages)
   - Cart page (almost always — cart appears site-wide)

2. Run Module 1 (Code Validity) on changed files
   - All linters pass
   - No deprecated API usage introduced

3. Run Module 2 (Functional) on affected pages
   - Playwright tests for affected pages
   - Claude in Chrome exploratory on new section

4. Run Module 3 (Responsive) on affected pages at 5 breakpoints

5. Run Module 5 (Accessibility) — axe on affected pages

6. Run Module 6 (Performance) — Lighthouse on affected pages

7. Run Module 7 (SEO) — relevant schema/meta checks on affected pages

8. Compare against previous sprint baseline:
   - Did anything that previously worked break?
   - Did Lighthouse scores regress?
   - Did axe violations increase?

9. Produce sprint QA report
```

---

## Milestone regression workflow

```
1. Read all sprints in milestone
2. Determine the complete set of pages + features built or modified
3. Establish milestone baseline (snapshot of "everything in this milestone is stable")

4. Run full Module 1-8 across all pages

5. Run cross-sprint integration scenarios:
   - User journey: homepage → PLP → PDP → cart → checkout (full flow)
   - Search functionality across milestone
   - Account features across milestone
   - All integrations firing correctly (analytics, email, etc.)

6. Cross-browser matrix on full milestone scope

7. Compare to previous milestone baseline:
   - Performance trend per page
   - Accessibility violations trend
   - Bug discovery rate trend

8. Produce milestone QA report

9. Hand off to Delivery Head if milestone is the final one (pre-launch prep)
```

---

## Pre-launch regression workflow

```
1. Confirm project verification (PM Agent's adherence verification) passed
2. Run full Module 1-8 across entire site
3. Cross-browser matrix on REAL devices (not just emulated)
4. Manual screen reader testing on key flows:
   - Homepage navigation (NVDA + VoiceOver)
   - Adding product to cart
   - Completing checkout
   - Account login
   - Form submissions

5. Full SEO audit:
   - Screaming Frog crawl
   - Schema validation per page type
   - Sitemap verification
   - Redirect map verification (for redesigns/migrations)
   - llms.txt verification

6. Performance verification on production-like environment
   - Lighthouse + CrUX data check (if available)
   - Bundle analysis
   - Image optimization audit

7. Security final scan:
   - Dependencies audit
   - No exposed credentials
   - HTTPS everywhere
   - Security headers configured

8. Synthetic monitoring smoke test (before launch):
   - UptimeRobot or equivalent ping
   - Key page health check
   - Critical API endpoint verification

9. Document everything for handoff
10. Sign off contribution to G6
```

---

## Regression baseline management

Each level has its own baseline:

### Sprint baseline
- Captured at sprint START (before work begins)
- Used to detect what changed in this sprint
- Stored: `qa-reports/baselines/sprint-[id]-start/`

### Milestone baseline
- Captured at milestone START
- Used to detect what changed across milestone
- Stored: `qa-reports/baselines/milestone-[id]-start/`

### Production baseline (for redesigns/migrations)
- Captured BEFORE any work begins
- Used to compare new site against previous
- Stored: `qa-reports/baselines/production-baseline/`

---

## Visual regression specifics

Visual regression catches CSS conflicts and unintended visual changes.

Per page, capture screenshots at all breakpoints + key states:
- Default state
- Hover state (where applicable)
- Focus state
- Loading state (e.g., add-to-cart pending)
- Error state (e.g., form validation error)

Tools:
- Playwright `toMatchSnapshot()` (built-in)
- Percy or Chromatic (cloud, paid)
- BackstopJS (open source)

Threshold: typically 0.1% pixel diff. Below = pass. Above = flag for review.

Reviewer decision: accept new baseline (intentional change) or mark as regression (unintentional).

---

## Cross-sprint integration tests

These are tests that span multiple sprints. Examples:

### Test: "Add to cart from PDP, view cart, modify quantity, checkout"
Spans: S2.1 (header), S2.2 (cart drawer), S3.1 (PDP), S3.2 (variant picker), S4.1 (cart page), S4.2 (checkout link)

If ANY of these sprints regresses, this test fails. Milestone regression catches it.

### Test: "Search for product, filter, sort, view product"
Spans: S1.1 (header search), S5.1 (search results page), S5.2 (filters), S5.3 (sort), S3.1 (PDP)

### Test: "Customer signup, email verification, login, view account"
Spans: S4.3 (account pages), S6.1 (forms), email integration sprint, etc.

QA Agent maintains a library of integration scenarios. Runs them at every milestone regression.

---

## Regression bug detection patterns

When milestone QA finds a bug not present in previous milestone:

```
1. Identify when it was introduced (which sprint?)
2. Check git history for the affected file/area
3. Identify the responsible PR
4. Open bug entry with:
   - severity (P1-P4)
   - introduced_in: [sprint id]
   - root_cause: [analysis]
   - regression: true
   - tracking_to: [milestone id where caught]
```

Tracking regressions over time:
- Are regressions concentrated in certain sprint types?
- Are regressions concentrated in certain devs' work?
- Are integration tests missing for the regressed area?

Discussed at Monthly System Retro (per K5).

---

## When to expand regression scope

If a sprint:
- Touches site-wide CSS (e.g., updated tokens)
- Touches site-wide JS (e.g., updated cart logic)
- Updates shared snippets used everywhere
- Changes schema affecting other queries

→ Sprint regression should expand to ALL pages (not just immediately affected). This is "site-wide sprint regression" and takes longer (still under 1 hour ideally).

Decided by Frontend Agent + QA Agent when sprint scope includes site-wide changes.

---

## Anti-patterns

1. **No baseline.** Without baseline, "regression" is impossible to detect. Capture baseline before work begins.

2. **Sprint regression that takes 2 hours.** Sprint regression should be fast. If slow, scope is too broad.

3. **Skipping milestone regression because "sprints all passed."** Sprint QA can pass while system breaks. Milestone regression catches integration issues.

4. **Pre-launch regression skipped due to deadline pressure.** This is when launches fail spectacularly. Don't skip.

5. **Visual regression baseline never updated.** Designs evolve. Stale baselines = false regressions = baseline ignored. Update intentionally.

6. **No integration tests.** Without integration tests, milestone regression only checks individual sprints. Misses real bugs.

7. **Regression reports without root cause analysis.** "Test failed" is not enough. Identify the introducing sprint and PR.

---

Last reviewed: 2026-05-24 by Claude (initial)
Next review due: 2026-08-24
