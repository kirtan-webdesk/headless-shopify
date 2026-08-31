---
tier: 2
load_when: ["session-boundary"]
---

# Session Handoff Protocol

> v1.5.2 — auto-generate HANDOFF.md at session end. Auto-read at session start. Replaces the lossy "context compaction" pattern that lost state in Kitchen Blockers session 2.

---

## Why this exists

Kitchen Blockers pilot: Session 1 ran to context limit. Resume via "compaction summary" lost meaningful state. Session 2 started with partial context — required developer to re-explain things.

The fix: structured, persistent handoff file written automatically at session end, read first at session start. Resume becomes 30 seconds, not 5 minutes.

---

## What HANDOFF.md captures

Required fields:

```markdown
# HANDOFF — [project slug]

**Last session:** YYYY-MM-DD HH:MM UTC
**Session ID:** <session-id>
**Last active agent:** <agent-name>
**Active milestone:** M3
**Active sprint:** M3-S2
**Gate state:** G3 confirmed, G4 pending sprint completion

## Where we left off

[1-2 sentences — what was the LAST thing being worked on]

## Files pushed this session

| File | Status | Notes |
|------|--------|-------|
| sections/kb-page-about.liquid | Pushed to dev theme | M3 deliverable, awaiting client visual review |
| templates/page.about-us.json | Pushed | Linked to about.liquid |
| ... | | |

## Files pending push

| File | Status | Blocker |
|------|--------|---------|
| sections/kb-banner-b03.liquid | Built, not pushed | Waiting on logo SVG (OI-07b) |
| ... | | |

## Next 3 tasks (queued)

1. **[priority]** [task name] — [files] — [blocker if any]
2. [task name] — [files]
3. [task name] — [files]

## Client blockers (waiting on)

| Item | Owner (client side) | Due | Days open |
|------|---------------------|-----|-----------|
| Logo SVG (OI-07b) | Client | 2026-06-07 | 5 |
| Langify confirmation (M4) | Client | 2026-06-30 | 12 |
| ... | | | |

## Open failure modes captured this session

- [FM-007] [brief]
- [FM-008] [brief]

## Token usage this session

- Input: ~852K
- Output: ~190K
- Cache reads: ~334M (high — investigate for v1.5.2 Tier F)
- Cost: ~$103.55

## Decisions made this session (additions to client-memory)

- [decision 1]
- [decision 2]

## What NOT to do on resume

[Anything that should be avoided. E.g., "Do not run shopify theme push manually — use safe-push.sh per v1.5.2."]

## Session links

- JSONL transcript: <path>
- project.json: <path>
- audit_log entries this session: <count>

---

Generated automatically by orchestrator at session close.
Format version: 1.0.0
```

---

## Auto-generation trigger

HANDOFF.md is regenerated:

1. **Every 30 minutes during active session** (lightweight update — just current state)
2. **On every sprint completion** (full update)
3. **On milestone transition** (full update + milestone summary)
4. **On session end** — explicitly triggered or detected via inactivity > 5 min
5. **On context-limit warning** (when orchestrator senses context window nearing limit) — write full state IMMEDIATELY

The 5th trigger is the critical one. Don't wait for context compaction to start losing state — write the handoff first.

---

## Auto-read at session start (v1.11.0 load order)

Orchestrator's `01-session-start-protocol.md` Step 0 (after env check) reads files in THIS ORDER:

```
Step 0a: Run check-env.sh
Step 0b: Read CLAUDE.md at project root (D-MEMORY-01). 
        → Provides project identity, current gate, recent decisions, blockers, team.
Step 0c: Read sow-spec.md at outputs/<client_slug>/sow-spec.md if present (D-PM-04).
        → Provides intake fields, FLAG-004 blocklist, design tool lock, validation history.
Step 0d: Read HANDOFF.md at project root if present.
        → Provides last-session working state, queued tasks, open blockers.
Step 0e: Cascade-load platform + project-type skills based on CLAUDE.md `platform` + `project_type`.
Step 0f: Surface to developer:

> Resuming [project] from [last session date].
> Platform: [platform] / Plan: [tier] / Type: [project type]
> Current gate: [G-N] (entered [date])
> Last task: [last task description]
> [N] tasks queued. [N] client blockers open. [N] decisions in last 7 days.
> 
> Resume from queued task 1? [Y/show full handoff/different task]
```

User can `Y` to proceed, `show full handoff` to read all, or specify a different task.

### Why this load order

- **CLAUDE.md first** — universal project context, smallest file, fastest to read.
- **sow-spec.md second** — formal contract; SOW Builder's output; ground truth for intake.
- **HANDOFF.md third** — most volatile; what the LAST session was doing right before it ended.

If any of the three files is missing:
- CLAUDE.md missing → PM Agent's first task is to generate it from sow-spec.md + git history.
- sow-spec.md missing → assume SOW Builder wasn't used; PM Agent runs full 100+ question intake at G0.
- HANDOFF.md missing → start fresh from current gate (assumed first session).

---

## File location

```
/projects/[client-slug]/HANDOFF.md
```

Single file per project. Overwrites on regeneration. Previous versions archived to `HANDOFF.versions/` (last 10 retained).

---

## What HANDOFF.md is NOT

- **Not a status report.** Status reports are for humans reading. HANDOFF.md is for the NEXT session to bootstrap.
- **Not a full audit log.** audit_log is the comprehensive record. HANDOFF.md is a working snapshot.
- **Not a SOW.** SOW is the project specification. HANDOFF.md is "where we are right now."
- **Not optional.** If HANDOFF.md doesn't exist when a session ends, the orchestrator failed.

---

## Pattern for "where we left off"

This 1-2 sentence summary is the most-read field. Examples:

GOOD:
> "Building M3 deliverables. Just finished kb-page-about.liquid (pushed). Next: wire banner b01 and b02 to index.json (3 lines change). Then PM check for M3 completion."

GOOD:
> "Blocked on G2 approval. Mockup preview URL shared with Internal PM. Awaiting client feedback by 2026-06-01."

BAD:
> "Working on the project." (uninformative)

BAD:
> "Last session built the About Us page, the Contact page, the Wholesale section, fixed broken links per D14, updated the schema for footer columns, generated tokens.css from design-tokens.json, ran validate-mockup, ran axe checks..." (too much — that's the audit log)

The "where we left off" summary should be the answer to "what would the next session do FIRST if it had no other context?"

---

## Validation

A valid HANDOFF.md has:
- Header with timestamp and IDs
- "Where we left off" populated (not empty)
- Files pushed / files pending tables (can be empty if applicable)
- Next 3 tasks queued
- Client blockers list

Empty / placeholder HANDOFF.md is treated as missing.

Orchestrator runs `validate-handoff.sh` at session start to verify integrity.

---

## Cost discipline

HANDOFF.md regeneration costs orchestrator output tokens. Estimates:
- Lightweight update (every 30 min): ~500 tokens
- Full update (sprint completion): ~2K tokens
- Milestone transition: ~3K tokens

Total per 12-hour session: ~10K tokens output = ~$0.15. Tiny vs. the cost of lost state.

---

## Next-tasks staleness — reconciliation at session end (v1.11.11+)

The `HANDOFF.md` "Next 3 tasks (queued)" field commonly drifts stale — items get done during the session but the queued list is only ever appended to. Result: next session opens, reads a queued list containing already-done work, and either (a) redoes it or (b) wastes cycles figuring out what's actually pending.

Rule:

- **At session end** (BEFORE writing HANDOFF.md), diff the queued list against work actually completed during the session
- Items that got completed → DELETE from queue (don't just leave them)
- Items that got partially done → REWRITE with remaining scope (don't leave the original entry)
- Genuinely new items surfaced during the session → APPEND

Empty is a valid state. An empty "Next tasks" list is better than a list of already-done items.

Trigger for #17 escalation (platform pilot, 2026-07-14): the queued task list listed done work as pending after a session-end handoff auto-write. The next session's operator wasted 15+ minutes reconciling.

Enforcement:
- HANDOFF template now contains the reconciliation rule in-line (`handoff-template.md`)
- If HANDOFF auto-generation is used, the auto-gen script SHOULD implement diff-based reconciliation, not append-only

## Presentational-only components — convention (v1.11.11+)

When a component is built to the design spec but is NOT yet wired to a functional backend (pre-order button before the pre-order plugin is installed; wishlist before the wishlist module; region switchers before the multi-region backend is provisioned), render it as an explicit non-functional placeholder rather than as a broken interactive control.

Rule:

- The presentational component MUST render `disabled` on interactive elements (`<button>`, `<a>` as button, form controls)
- Include `aria-disabled="true"` for assistive tech
- Include a machine-readable data attribute: `data-wds-presentational="true"` with `data-wds-activation="{plugin-or-module-name}"` naming what would activate it
- Note in HANDOFF.md under a new "Presentational-only components" section: which components, what activates them, what the wiring cost estimate is

Rationale (pilot-derived, 2026-07-14): components built pixel-perfect but silently non-functional look "done" in visual QA but produce client confusion at UAT ("why doesn't this button do anything?"). Explicit disabled state + HANDOFF entry prevents the confusion and makes the "not-yet-wired" state a visible project state, not a hidden defect.

The HANDOFF.md template should include a "Presentational-only components" section (see `handoff-template.md`). Convention applies across every platform arm — spine capability, not per-arm invention.

## Anti-patterns

1. **HANDOFF.md not generated at session end.** Defeats the entire purpose.

2. **HANDOFF.md exists but is empty placeholders.** Useless.

3. **"Where we left off" is a paragraph.** Compress to 1-2 sentences.

4. **Next 3 tasks ignored on resume.** Developer types "next" — orchestrator should propose the queued task, not ask "what next?"

5. **HANDOFF.md auto-deletes on context limit.** Never delete. Append-only behavior — overwrite to update, archive old versions.

6. **HANDOFF.md contains sensitive data (tokens, passwords).** Never. Even file paths to credentials should be referenced, not embedded.

7. **HANDOFF.md becomes the master log.** It's a snapshot. project.json and audit_log are the master record.

---

## Integration with v1.5.2 pieces

- **Build plan preview** — "Next 3 tasks" populates from the preview queue
- **PM auto-trigger** — every PM brief check writes to HANDOFF.md
- **G0 intake gate** — open intake items appear in "Client blockers"
- **Token tracking** — HANDOFF.md surfaces session token usage from `project.json.token_used`
- **Outbound comms blocklist** — referenced in "What NOT to do" if blocked attempts happened

---

Last reviewed: 2026-05-27 by Claude (v1.5.2 Phase 2)
Next review due: 2026-08-27
