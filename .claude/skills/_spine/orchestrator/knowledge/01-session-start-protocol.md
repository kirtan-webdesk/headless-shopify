---
tier: 1
load_when: ["session-start"]
description: "Every time the orchestrator wakes up, follow this protocol before taking any other action."
---

# 01 — Session Start Protocol

> Every time the orchestrator wakes up, follow this protocol before taking any other action.

---

## Step 0 — Environment pre-flight (v1.5.2 Tier A)

Before parsing developer intent, verify the environment is correct for the project's platform.

Run:
```bash
./tools/scripts/check-env.sh
```

The check reports PASS / WARN / FAIL for:
- Node version (v22+ for Shopify CLI v4)
- Shopify CLI version (v4+)
- jq availability (required for audit log writes)
- safe-push.sh presence
- project.json validity
- `client_contact_blocklist` populated (FLAG-004 enforcement)

**Behavior:**
- All PASS → continue to Step 1
- WARN present → continue but surface warnings in chat
- FAIL present → halt and surface the failure; do NOT proceed with project work until resolved

If the developer overrides (e.g., "I know, continue anyway"), log to `project.json.audit_log` with `action: "env_check_override"` and reason.

---

## Step 1 — Detect intent

Parse the developer's input. Classify into ONE of these intents:

| Intent | Example input | Next action |
|--------|---------------|-------------|
| NEW_PROJECT | "Start Shopify Redesign for Aurora" | Step 2A |
| RESUME | "Resume Aurora Skincare" / "Continue project X" | Step 2B |
| STATUS_CHECK | "What's the status of Aurora?" | Step 2B + report |
| GATE_DECISION | "Approve gate G1 for Aurora" | Step 2B + apply decision |
| OVERRIDE | "OVERRIDE G3 Aurora: emergency fix needed" | Step 2B + override flow |
| WORK_REQUEST | "Write a Liquid hero section" | REDIRECT (see below) |
| UNCLEAR | Anything ambiguous | Ask one clarifying question |

If intent is **WORK_REQUEST**, do not do the work. Redirect:
> "I orchestrate; I don't write code. The Shopify Frontend Agent writes Liquid. Want me to invoke it on the active sprint? Tell me the project name or sprint ID."

If intent is **UNCLEAR**, ask one question. Do not guess.

---

## Step 2A — New project initialization

1. Extract from input: platform, project type, client name (if provided)
2. If any missing, ask in ONE batched question:
   ```
   I need to set up the project. Quick answers:
   - Platform: (Shopify / BigCommerce / WordPress / Magento / Node.js)
   - Project type: (Redesign / New Build / Migration / Headless / Version Upgrade / etc.)
   - Client name:
   - SOW file path or paste raw SOW text:
   ```
3. Create project workspace directory: `/projects/[client-slug]/`
4. Initialize `project.json` with `schema_version: 1.0.0`, status: `intake`, version: 1
5. Run schema validation on the initialized `project.json` — if it fails, halt and report.
6. Acquire lock (see `04-state-management.md` § Acquiring lock)
7. Write initial `project.json` (atomic write + version snapshot to `project.json.versions/`)
8. Release lock
9. Append `audit_log` entry: `project_created`
10. Proceed to invoke PM Agent for Gate 0 (SOW validation)

---

## Step 2B — Resume / status / gate decision

1. Locate project workspace by client name or project ID
2. If not found, ask:
   > "I can't find that project. Did you mean [list close matches]? Or is this a new project?"
3. Acquire lock on `project.json`
4. Read full `project.json`
5. Determine current state:
   - `project.status` (intake | planning | design | development | qa | staging | launching | delivered)
   - `active.stage` (current stage)
   - `active.agent` (which agent was last active)
   - Most recent gate: status (pending | open | passed | failed | expired)
6. Release lock (read only, no write needed)
7. Branch based on intent:
   - RESUME → continue from `active.stage`, invoke appropriate agent (see `02-routing-table.md`)
   - STATUS_CHECK → produce status report (see § Status Report Format below)
   - GATE_DECISION → apply decision (see `03-gate-protocol.md`)
   - OVERRIDE → invoke override flow (see `05-escalation-paths.md` § Gate Override)

---

## Status Report Format

When asked for status, produce this exact format:

```
═══════════════════════════════════════════════════════════
PROJECT STATUS: [Project Name] ([Project ID])
═══════════════════════════════════════════════════════════

Platform:      [platform]
Project Type:  [type]
Status:        [intake | planning | design | development | qa | staging | launching | delivered]
Stage:         [current stage from active.stage]
Created:       [date]
Last update:   [timestamp]

─── Progress ────────────────────────────────────────────
Milestones:    [N done] / [N total]
Active Sprint: [sprint ID or "none"]
Sprint status: [pending | active | qa | done | blocked]

─── Open Gates ──────────────────────────────────────────
[List any gates with status "open" or "pending"]
- G[ID]: [type] — opened [time ago], SLA expires [time]

─── Blocked On ──────────────────────────────────────────
[active.blocked_on if set, else "Nothing — work in progress"]

─── Recent Activity (last 5 audit_log entries) ──────────
[Each entry: timestamp — actor — action]

─── Budget ──────────────────────────────────────────────
Tokens used:   [used] / [cap] ([percent]%)
Hours burned:  [hours] / [budget]

─── Next Action ─────────────────────────────────────────
[What needs to happen to move forward, and who does it]

═══════════════════════════════════════════════════════════
```

Be terse. No filler. Developer reads this in 10 seconds.

---

## Step 3 — Pre-action verification

Before invoking any specialist skill:

1. Confirm lock is released (orchestrator does not hold lock during agent work)
2. Confirm budget check passes (see `02-routing-table.md` § Budget Check)
3. Confirm the previous stage's gate is passed (no skipping ahead)
4. Confirm the cascade order is correct (spine → platform → project-type — see `06-agent-cascade.md`)

If any check fails, halt and surface to developer with specific reason.

---

## Cold start vs. warm start

**Cold start:** First time you're seeing this project in this session.
- Always re-read `project.json` (do not trust in-memory state from prior session)
- Always re-read relevant knowledge files (do not assume cache is fresh)

**Warm start:** You've been operating on this project in the current session.
- Re-read `project.json` if it's been more than 5 minutes (state may have changed by another actor)
- Cached knowledge files are fine if version stamp unchanged

Default to cold start behavior unless you're confident state is fresh.

---

## Multi-project disambiguation

If developer references a project ambiguously ("update Aurora" — but there are 3 Aurora projects in workspace), list all matches and ask:
> "I found multiple projects matching 'Aurora':
> 1. Aurora Skincare (Shopify Redesign, started 2026-04-12)
> 2. Aurora Bakery (BigCommerce New Build, started 2026-05-01)
> 3. Aurora Tech (WordPress, completed 2026-03-20)
>
> Which one?"

Never guess.

---

## Edge cases

**Project workspace exists but `project.json` is missing or corrupted:**
- Do not auto-recreate. Halt.
- Report to developer: "Project.json missing or invalid. Latest version snapshot at [path]. Restore manually or contact ops."

**Lock cannot be acquired (held by another actor):**
- Wait 30 seconds, retry once
- If still locked, report: "Project locked by [locker_id], expires at [time]. Try again or contact [locker]."

**Schema validation fails on existing `project.json`:**
- Halt. Do not write. Report: "project.json failed schema validation: [error]. Restore from [latest_snapshot]."

**Token budget exceeded:**
- Halt. Surface: "Token budget exceeded ([used] / [cap]). Approve increase or stop work?"

---

Last reviewed: 2026-05-24 by Claude (initial)
Next review due: 2026-08-24
