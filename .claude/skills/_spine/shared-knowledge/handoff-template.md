---
template_type: handoff
applies_to: ["all"]
last_reviewed: 2026-06-03
---

# HANDOFF.md Template — v1.11.2

> Copy this file to the root of your project repository as `HANDOFF.md`. Updated at the end of every session by whoever closes the session. Read FIRST by whoever opens the next session.

---

## Purpose

Capture working state at session end. Resume in 30 seconds, not 5 minutes.

Read order at session start: `CLAUDE.md` (project memory) → `outputs/<slug>/sow-spec.md` (intake) → `HANDOFF.md` (this file).

**Hard cap: 200 lines.** If it grows, archive to `docs/session-handoffs/<date>-<slug>.md` and reset.

---

## Last session

- **Session ended:** {{YYYY-MM-DD HH:MM TZ}}
- **Session ID:** {{session-id-if-tracked}}
- **Last active agent:** {{pm-agent / designer-agent / dev-engineer / qa-agent / etc.}}
- **Active milestone:** {{M0 / M1 / M2 / M3 / M4 / M5}}
- **Active sprint:** {{S1 / S2 / ...}}
- **Active gate:** {{G0 / G0.5 / G1 / G2 / G3 / G4 / G5 / G6}}

---

## Where we left off

Single short paragraph. What was the LAST concrete thing being done? At what exact point did we stop?

Example:
> Was building the hero section for the homepage. Hero markup complete, mobile responsive styles pending. Next action: write mobile styles for hero, then re-check preview. No blockers.

If the session ended because of a context limit / error / interruption, say so:
> Session hit 200K context error after extensive template work. Resume by reloading minimal context (CLAUDE.md + HANDOFF.md only) and continuing the remaining 2 template files.

---

## Files pushed this session

Files committed to git in this session:

- `<active-platform-path>/sections/hero.<ext>` — new file, hero section
- `<active-platform-path>/styles/hero.<ext>` — new file, hero section styles
- (etc.)

---

## Files pending push

Files edited but NOT yet committed (work in progress):

- `<active-platform-path>/<component-name>.<ext>` — 60% complete, structure in place, logic pending
- (etc.)

These should be committed (or stashed) before the next session unless intentionally left dirty.

---

## Next 3 tasks (queued)

Concrete, actionable. The next session resumes from here.

**RECONCILIATION RULE (v1.11.11+):** At session end, reconcile this list against work actually completed during the session. Remove items that got done. Append genuinely new items. Do NOT just append — that grows staleness. If a queued task was completed, delete the row; if partially completed, rewrite with the remaining scope. Empty is a valid state — better than stale.

1. {{Task 1 — specific. Example: "Finish render logic for the industry-picker widget/component per architecture doc reference."}}
2. {{Task 2}}
3. {{Task 3}}

After these 3, see CLAUDE.md "Active tasks (this sprint)" for the broader backlog.

---

## Client blockers (waiting on)

Format: `[opened-date] — what we're waiting on. Owner: Internal PM / client / vendor. Target unblock date.`

- [2026-06-03] — Brand color palette finalization. Owner: Internal PM (Daniel D.) following up with client. Target unblock: 2026-06-05.
- {{Other blockers}}

If empty: `_(none)_`

PM Agent reviews staleness (open >7 days) at every G4 sprint review.

---

## Open failure modes captured this session

Anything that surprised us or revealed a gap. Per K4 — feeds back into KB updates.

- {{Example: "Platform admin operation paused for 45s during a global style/theme regeneration. Mid-project regenerations need an off-peak window. Captured for KB update."}}
- (etc.)

If empty: `_(none — clean session)_`

---

## Decisions made this session

One line per locked decision. Format: `[YYYY-MM-DD] [D-CODE if applicable] — summary.`

These should also be appended to `CLAUDE.md` "Recent decisions" section.

- {{Example: "[2026-06-03] <D-CODE> — <one-line summary of decision locked this session>."}}
- (etc.)

---

## Token usage this session (optional)

If tracking:

- Input tokens: {{N}}
- Output tokens: {{N}}
- Estimated cost: ${{N}}
- Cumulative project cost: ${{N}} / ${{budget}}

Per `tools/scripts/token-estimator.py`. Skip if not tracking.

---

## What NOT to do on resume

If we discovered something to avoid, note it here. Example:

- Do NOT enable the caching plugin's "Combine JS" option — broke the site's mobile menu. Confirmed via test, reverted, left disabled.
- Do NOT update `<app-or-plugin>` to `<version>` yet — known regression with our custom `<widget/section/module>`. Stay on the prior version until resolved.
- (etc.)

If empty: `_(no specific cautions)_`

---

## Session links

- Last commit: `{{commit-hash}}` on branch `{{branch-name}}`
- Latest staging URL: {{url}}
- Latest mockup preview URL (if active): {{url}}
- Open PRs: {{list with URLs}}
- Open issues: {{list with URLs}}

---

## Presentational-only components (v1.11.11+)

Components built to spec but not yet wired to a functional backend. Rendered as visually-disabled placeholders per session-handoff-protocol.md convention. Client sees "not yet activated" — not "broken."

Format per row: `component-name — activated by {plugin-or-module} — wiring estimate {hours}`.

- {{Example: `pre-order-button — activated by <pre-order plugin/app/module> — wiring estimate ~3h`}}
- {{Example: `wishlist-icon — activated by <wishlist plugin/app/module> — wiring estimate ~4h`}}

If empty: `_(none — every rendered component is functional)_`

---

## Notes for next session

Anything else the next session needs to know. Optional. Keep brief.

- {{Example: "Client confirmed they want the FAQ accordion to auto-close other items when one opens. Update widget config when resuming."}}
- (etc.)

---

Last touched: {{timestamp}}
Touched by: {{name-or-agent}}
