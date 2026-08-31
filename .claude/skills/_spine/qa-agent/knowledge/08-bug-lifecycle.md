---
tier: 1
load_when: ["qa-active", "bug-management"]
description: "v1.5.2 — formal bug lifecycle from log to verified close. Replaces ad-hoc bug tracking with a structured schema (per `_contracts/bug-tracker.schema.json`)."
---

# QA Bug Lifecycle Protocol

> v1.5.2 — formal bug lifecycle from log to verified close. Replaces ad-hoc bug tracking with a structured schema (per `_contracts/bug-tracker.schema.json`).

---

## The lifecycle

```
LOGGED → FIXED → RETESTING → VERIFIED → CLOSED
   ↓
   WONT_FIX (terminal, with rationale)
   ↓
   DUPLICATE (terminal, points at canonical bug)
```

Every transition is recorded in `history[]` with who + when + notes.

---

## Step 1 — LOGGED

QA Agent (or any human) logs a bug. Required fields:

- `id`: auto-incremented (BUG-0001, BUG-0002, ...)
- `title`: short, specific (not "thing broken")
- `severity`: P1 / P2 / P3 / P4
- `category`: functional, visual, performance, accessibility, seo, security, content, integration, responsive, browser-compat, other
- `description`: markdown — repro steps, expected, actual
- `affected_paths`: which files/URLs are affected
- `affected_viewports`: which viewports (if visual/responsive)
- `affected_browsers`: which browsers (if compat issue)
- `screenshots`: paths to screenshot files
- `logged_by`: name
- `logged_at`: timestamp
- `milestone`: which milestone
- `sprint`: which sprint
- `found_at_gate`: G2 / G3 / G4 / G5 / G6 / post-launch

Status transitions to **LOGGED**.

### Severity guide

| Severity | Definition | Examples |
|----------|------------|----------|
| **P1** | Blocks launch. Critical functionality broken. | Add to cart fails, checkout breaks, site down, security hole, FLAG-004 violation |
| **P2** | Significant impact. Must fix before launch but not blocking dev. | Wrong product price displayed, mobile nav broken on iOS, accessibility violation |
| **P3** | Polish / minor issue. Can fix post-launch if time-bound. | Padding off by 2px, slight color inconsistency, minor copy edit |
| **P4** | Nice-to-have. Not required for launch. | Animation tweak, design improvement idea |

P1 found at any gate = HALT until fixed. P2 found at G6 = HALT. P3/P4 = surface but don't block.

---

## Step 2 — FIXED

Developer fixes the bug. Updates:

- `status`: FIXED
- `fixed_by`: developer name
- `fixed_at`: timestamp
- `fix_commit_sha`: commit that contains the fix
- `fix_pr_url`: PR if applicable

Auto-detected if commit message references `Fixes BUG-NNNN` or `Closes BUG-NNNN`.

History append: `from_status: LOGGED → to_status: FIXED`.

---

## Step 3 — RETESTING

After developer marks FIXED, QA Agent moves to RETESTING:

- `status`: RETESTING
- `retest_by`: QA agent/person retesting
- `retest_started_at`: timestamp

QA reproduces the original repro steps on the fixed build. Checks:
- Original issue resolved
- No new issues introduced
- Related areas still work

---

## Step 4 — VERIFIED

If retest passes:

- `status`: VERIFIED
- `verified_by`: QA name
- `verified_at`: timestamp

If retest FAILS:

- `status`: LOGGED (back to start)
- History captures "Retest failed: [reason]"
- Notify the original `fixed_by` developer

---

## Step 5 — CLOSED

After VERIFIED, bug is CLOSED when:
- Fix is deployed to the relevant environment (dev → staging → live)
- Stakeholder review confirmed if required

Updates:
- `status`: CLOSED
- `closed_at`: timestamp

CLOSED bugs are read-only. To reopen: create a new bug referencing the closed one.

---

## Alternative terminal states

### WONT_FIX

Decision: bug exists but won't be fixed. Common reasons:
- Out of scope (post-launch backlog)
- Cost > benefit
- Edge case affecting < N% users
- Browser bug, not our code

Required:
- `status`: WONT_FIX
- `wont_fix_reason`: rationale

Cannot self-approve WONT_FIX for own bug. Approver must be different from logger.

### DUPLICATE

Bug is a duplicate of an existing one.

Required:
- `status`: DUPLICATE
- `duplicate_of`: canonical BUG-NNNN ID

History captures the dedupe decision. Original bug stays open.

---

## KB candidate flag

If a bug pattern is likely to recur on future projects, mark it as a KB candidate:

```json
{
  "kb_candidate": true,
  "kb_candidate_notes": "Hardcoded client email in generated mailto link. Should be caught by COMM-001 check."
}
```

KB candidates feed K4 feedback loop:
- 3+ occurrences across projects → forbidden.md rule
- Single P1 → immediate forbidden.md rule

Code Review Agent's `06-feedback-loop-kb-updates.md` consumes KB candidates from bug trackers across projects.

---

## QA Agent's auto-checks (run before manual review)

Before a human QA opens a bug as LOGGED, QA Agent runs:

1. **De-dupe check** — compare title + affected_paths against existing open bugs. If similar, suggest duplicate before creating.
2. **Severity sanity check** — P1 needs at least 1 of: functional break, security, data loss, FLAG-004. If P1 with no critical category, downgrade to P2 with note.
3. **Repro completeness check** — repro_steps array has >= 3 steps; expected and actual fields populated.
4. **Screenshot/recording attached** — for visual / responsive / browser-compat categories, screenshot required.

Bugs failing auto-checks are returned to the logger for refinement.

---

## Bug tracker file location

```
/projects/[client-slug]/qa-reports/bugs.json
```

Validated against `_contracts/bug-tracker.schema.json` on every write.

Atomic write protocol applies (per `04-state-management.md`).

---

## Stats roll-up

On every write, `stats` field is recomputed:

```json
{
  "stats": {
    "total": 47,
    "by_status": {
      "LOGGED": 3,
      "FIXED": 5,
      "RETESTING": 2,
      "VERIFIED": 4,
      "CLOSED": 31,
      "WONT_FIX": 1,
      "DUPLICATE": 1
    },
    "by_severity": {
      "P1": 2,
      "P2": 15,
      "P3": 25,
      "P4": 5
    },
    "open_by_severity": {
      "P1": 0,
      "P2": 3,
      "P3": 7,
      "P4": 4
    }
  }
}
```

Used by:
- PM brief checks (surface open P1/P2 counts)
- Delivery Head pre-launch verification (must show 0 open P1, 0 open P2)
- Client report templates (transparency on quality)
- Metric tracking (per `06-pilot-success-metrics.md` Metric 4)

---

## Shortcodes

- `/bug log "[title]" [severity] [category]` — start a LOGGED bug interactively
- `/bug fix BUG-NNNN [commit-sha]` — mark FIXED
- `/bug retest BUG-NNNN` — start RETESTING
- `/bug verify BUG-NNNN` — mark VERIFIED
- `/bug close BUG-NNNN` — close after verified
- `/bug list [status] [severity]` — filter bugs
- `/bug stats` — show stats roll-up
- `/bug history BUG-NNNN` — show transition history

---

## Pre-launch gate (G6) bug requirements

G6 cannot pass unless:
- `stats.open_by_severity.P1 === 0`
- `stats.open_by_severity.P2 === 0`
- Any open P3 has WONT_FIX or post-launch-backlog status
- No bug in LOGGED or FIXED state for > 7 days (must move forward or be closed)

Delivery Head's `01-prelaunch-checklist-composition.md` references this.

---

## Anti-patterns

1. **P1 inflation.** Everything gets marked P1 → severity loses meaning. Be strict.

2. **Skipping FIXED → RETESTING.** Developer fixes, marks VERIFIED themselves. Self-approval prohibition — different person must verify.

3. **Bugs sit in LOGGED for weeks.** Stale bugs are signal of broken process. Surface in PM brief check.

4. **No screenshot for visual bug.** Title says "header looks weird on mobile" with no screenshot. Impossible to verify. Auto-check catches.

5. **CLOSED bugs reopened in-place.** Don't reopen — create new bug, reference the closed one in description.

6. **Bug tracker not in git.** It's project state. Commit it (without sensitive screenshots if needed).

7. **No KB candidate review.** Bugs surface patterns. Patterns become rules. If your team never reviews KB candidates, the system never gets smarter.

---

## Integration with v1.5.2 pieces

- **PM auto-trigger** — brief checks include open P1/P2 counts
- **HANDOFF.md** — "Open failure modes" mirrors high-severity open bugs
- **Code Review Agent** — references bug tracker when flagging KB patterns
- **G4/G5/G6 gates** — enforce open-bug thresholds
- **K4 feedback loop** — KB candidates from bug tracker → forbidden.md

---

Last reviewed: 2026-05-27 by Claude (v1.5.2 Phase 2)
Next review due: 2026-08-27
