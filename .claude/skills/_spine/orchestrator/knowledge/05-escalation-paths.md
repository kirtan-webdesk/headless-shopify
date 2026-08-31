---
tier: 2
load_when: ["escalation-needed"]
description: "When things don't go to plan. The orchestrator's protocol for handling stalls, failures, overruns, and emergencies."
---

# 05 — Escalation Paths

> When things don't go to plan. The orchestrator's protocol for handling stalls, failures, overruns, and emergencies.

---

## Trigger conditions for escalation

| Trigger | What to do |
|---------|------------|
| Gate SLA expired (24h+ no decision) | See § Gate SLA expired |
| Validator fails 3 times in a row | See § Repeated validator failure |
| Token budget approaching cap | See § Budget alerts |
| Token budget exceeded | See § Budget exceeded |
| Schema validation fails | See § Schema validation failure |
| Lock cannot be acquired | See § Lock contention |
| Agent invocation fails (API error) | See § Agent invocation failure |
| Auto-rollback triggered post-launch | See § Post-launch failure |
| Override exercised | See § Override audit |
| Three or more bugs found in one sprint | See § Quality flag |
| Cost-per-PR exceeds threshold | See § Code review cost alert |

---

## Gate SLA expired

When gate has been `open` for > 24 hours without decision:

1. Append `audit_log` entry: `gate_escalated`
2. Update gate's `escalation_log`:
   ```json
   {
     "at": "[now]",
     "action": "sla_expired",
     "primary_approver_was": "[name]"
   }
   ```
3. Surface to developer in next session:
   > "⚠ Gate [G-id] expired 24h ago. Primary approver: [name]. Backup approver: [name]. Should I notify backup or escalate to delivery lead?"
4. Developer takes one of:
   - `NOTIFY_BACKUP` → log notification sent
   - `ESCALATE` → log escalation to delivery lead
   - `EXTEND [hours]` → push expires_at forward
   - `OVERRIDE` → senior dev overrides (see Override audit)

Per F3 (simplified SLA model), this is manual escalation — no automated email/Slack chain. The orchestrator surfaces in chat; developer chooses next step.

---

## Repeated validator failure

When the same validator fails 3+ times for the same artifact in a single sprint:

1. Halt automatic retry
2. Surface to developer:
   > "Validator [name] failed 3 times for [artifact]. Likely root cause needs human attention. Errors: [last 3 error messages]"
3. Suggest options:
   - `INSPECT` → orchestrator dumps full error context for human review
   - `OVERRIDE` → senior dev decides to ship despite validator failure (rare, logged)
   - `RETRY_DIFFERENT_AGENT` → invoke different agent (e.g., Sonnet → Opus for complex case)
   - `REOPEN_SPEC` → maybe the spec itself is wrong; back to PM Agent

Do not silently keep retrying. AI hallucinating "fixes" that don't fix anything is a known failure mode.

---

## Budget alerts

### Approaching cap (>80% used)

When `project.json.budget.token_used >= token_cap * 0.8`:

1. Append `audit_log` entry: `token_threshold_alert` with current usage
2. Surface to developer in NEXT session start:
   > "ℹ Token budget at [X%]. Estimated remaining stages will use [Y]. Continue?"
3. Developer choice:
   - `CONTINUE` → proceed, alert again at 90%
   - `INCREASE_CAP [amount]` → senior approval, update cap
   - `OPTIMIZE` → orchestrator switches expensive Sonnet calls to Haiku where allowed
   - `HALT` → stop work, escalate to delivery lead

### Approaching cap (>90% used)

Same as 80% but more urgent. Surface BEFORE invoking next agent:
> "⚠ Token budget at [X%]. Will exceed cap mid-stage. Approve increase, optimize, or halt?"

Do not silently proceed past 90% without explicit approval.

---

## Budget exceeded

When `token_used + estimated_next_invocation > token_cap`:

1. HALT — do not invoke next agent
2. Append `audit_log` entry: `budget_exceeded`
3. Surface to developer:
   > "🛑 Token budget exceeded. Used [X] / Cap [Y]. Cannot invoke [next agent] without increase. Options: INCREASE_CAP, HALT_PROJECT, OPTIMIZE."
4. Wait for human decision. Do not act unilaterally.

---

## Schema validation failure

When a write fails schema validation:

1. ABORT the write (do not corrupt state)
2. Append `audit_log` entry: `schema_validation_failed` with full error
3. Surface to developer:
   > "Write to [artifact] rejected by schema validator. Errors: [list]. Likely the producing agent has a bug or stale schema reference."
4. Suggest:
   - `INSPECT_OUTPUT` → dump what the agent tried to write
   - `RETRY_WITH_AGENT [name]` → try a different agent
   - `MANUAL_FIX` → developer fixes the artifact manually

State remains consistent because we aborted before write.

---

## Lock contention

When another actor holds the lock:

1. Wait 30 seconds, retry once
2. If still held:
   > "🔒 Project locked by [holder_id] until [expires_at]. Wait or contact holder."
3. Do NOT force-acquire (corruption risk)
4. If lock is past expiration (5 min), safe to take over with warning logged

---

## Agent invocation failure

When invoking a sub-agent fails (API error, timeout, rate limit):

1. Capture the error
2. Append `audit_log` entry: `agent_invocation_failed` with details
3. Retry once with backoff
4. If second attempt fails:
   > "Agent [name] failed twice with error [error]. Options: WAIT [minutes], RETRY_DIFFERENT_MODEL, ESCALATE."
5. Common errors and fixes:
   - Rate limit → suggest WAIT
   - Context too long → suggest the agent split the task
   - API key invalid → escalate to ops (this is a system issue, not a project issue)

---

## Post-launch failure

Triggered by F13 auto-rollback when post-deploy health check fails:

1. Auto-rollback executed by Delivery Head
2. Append `audit_log` entry: `auto_rollback_triggered` with failure details
3. Surface to developer immediately:
   > "🚨 ROLLBACK EXECUTED for [project]. Health check failed: [details]. Previous theme restored. Investigation needed."
4. Create P1 bug entry in `project.json.bugs[]`
5. Project status changes to `launching` (stays there pending fix)
6. Block any further deploy attempts until P1 resolved

---

## Override audit

Every override exercised is flagged for weekly review:

1. Override logged in `audit_log` with full justification
2. Project flagged for review at next Monthly System Retro (K5)
3. If a project has > 1 override, the orchestrator surfaces this proactively:
   > "ℹ This project has [N] overrides. Above typical (0-1). Worth retro discussion."

---

## Quality flag

When 3+ bugs are reported in a single sprint:

1. Append `audit_log` entry: `quality_flag_raised`
2. Surface to developer:
   > "⚠ Sprint [id] has [N] bugs (>3). Quality flag raised. Consider: REWORK_SPRINT, ADJUST_ESTIMATES, INSPECT_AGENT_OUTPUT."
3. This is a process signal, not auto-action. Developer decides next step.

---

## Code review cost alert

Per H4 cost guardrails:

### Per-PR alert
When estimated review cost > $2 for a single PR:

> "Code review cost estimate: $[X] for this PR ([Y] tokens). Approve or skip review?"

### Daily cap alert
When daily review spend hits 80% of $10 cap:

> "Daily code review budget at 80% ($[X] of $10). [Y] reviews today. Continue or defer remaining to launch?"

### Daily cap exceeded
When daily review spend reaches 100%:

1. Halt automatic review
2. Surface: "Daily code review budget exhausted. Reviews paused until tomorrow OR manual override."
3. Developer choice: `OVERRIDE_TODAY`, `DEFER_TO_LAUNCH`, `WAIT_TOMORROW`

### Per-project cap exceeded
When project review costs hit $20 cap:

1. Surface: "Project code review budget exhausted ($[X]). Options: INCREASE_CAP, DEFER_REMAINING_TO_LAUNCH, DISABLE_REVIEW."

---

## What the orchestrator NEVER does on its own

1. NEVER auto-approves a gate (always human or override)
2. NEVER skips a stage prerequisite silently
3. NEVER auto-fixes bugs (developer command required)
4. NEVER deletes audit_log entries (append-only)
5. NEVER decreases `project.version` (monotonic increment)
6. NEVER bypasses schema validation
7. NEVER force-acquires a lock (only safe takeover past expiration)
8. NEVER continues past budget cap without explicit approval

Every escalation surfaces to human. Human decides.

---

Last reviewed: 2026-05-24 by Claude (initial)
Next review due: 2026-08-24
