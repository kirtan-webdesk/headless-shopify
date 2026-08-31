---
tier: 1
load_when: ["task-execution", "always"]
description: "v1.5.5 — enforces the output side of cost discipline. Tier F covers input via tiered KB loading; this file covers output via per-task caps."
---

# 09 — Per-Task Output Token Budgets

> v1.5.5 — enforces the output side of cost discipline. Tier F covers input via tiered KB loading; this file covers output via per-task caps.

---

## Why this exists

Kitchen Blockers pilot output tokens: 4.86M = $73 (31% of project cost).

Average per message: ~1,150 output tokens. Some single messages produced 5K+ tokens of prose preamble before the actual work. Persona forbids "glazing" — but without enforcement, the warm-up sentences crept back.

This file makes the cap explicit, enforceable, and auditable.

---

## The budgets

Hard caps by task type:

| Task type | Max output tokens | Rationale |
|-----------|-------------------|-----------|
| PM brief check | 200 | 5-line status, no more |
| Build plan preview | 100 | 4 lines per preview, no preamble |
| Single section build (Liquid) | 3,500 | One section file + minimal CSS |
| Single page build (Liquid/JSON template) | 5,000 | Page template + section refs |
| Full mockup page (HTML/CSS/JS) | 8,000 | One page worth of mockup |
| Code review on single PR | 1,500 | Per-finding terse output, max ~10 findings |
| Sprint retro report | 1,500 | Structured retro, no fluff |
| Milestone update document | 3,000 | Stakeholder-facing milestone summary |
| Audit report | 2,500 | Findings + recommendations |
| Bug log entry | 400 | Repro + expected + actual |
| Bug retest report | 300 | Pass/fail + notes |
| Generic chat reply | 600 | Discussion, clarification |
| Status report (full project) | 2,500 | Cross-milestone view |
| Handoff.md generation | 1,500 | Structured, not narrative |
| Token estimator output | 400 | Numbers + warnings |
| Failure mode capture | 500 | Brief, structured |

These are STARTING values calibrated from pilot data. Adjust during retros.

---

## Enforcement

### Step 1 — Orchestrator tags each invocation with task type

```json
{
  "task": {
    "type": "single_section_build",
    "output_budget": 3500,
    "started_at": "2026-05-28T14:00:00Z",
    "agent": "frontend-agent"
  }
}
```

### Step 2 — Agent receives task with budget in context

Agent's system prompt for that task includes:

> Your output budget for this task is X tokens. Stop before exceeding. If you need more, explicitly request via "I need ~Y additional tokens because [reason]" and wait for orchestrator approval.

### Step 3 — Orchestrator monitors output tokens

If agent's response approaches 90% of budget mid-stream, orchestrator emits a soft warning. If response exceeds 100%, orchestrator truncates AND logs an over-budget event.

### Step 4 — Audit log

Every over-budget event captured in `project.json.audit_log`:

```json
{
  "timestamp": "...",
  "action": "output_budget_exceeded",
  "task_type": "single_section_build",
  "budget": 3500,
  "actual": 4820,
  "ratio": 1.38,
  "agent": "frontend-agent"
}
```

3+ over-budget events for the same task type within a project → flag for budget recalibration at retro.

---

## Explicit increase requests

Agents are NOT prohibited from going over budget — they just need to ask first:

### Example: agent needs more for a complex section

Agent's first message:
> "Task: build kb-product-grid section.
> Budget: 3,500 tokens.
> Complexity: needs collection filtering + 8 variant types + AJAX pagination.
> Realistic cost: ~6,000 tokens.
>
> Request budget increase to 6,000. Reason: scope larger than typical section."

Orchestrator decides:
- If reason is legitimate (real scope) → approve with audit log entry
- If reason is verbose-as-usual (agent just being chatty) → deny, instruct terseness

This makes budget exceptions visible and intentional, not silent drift.

---

## Per-task implementation

For each task type, the orchestrator's routing logic (in `02-routing-table.md`) declares:

```yaml
- task_type: single_section_build
  agent: frontend-agent
  output_budget: 3500
  tier_load_tags: ["shopify-code-production", "section-build"]
  pre_task_check: validate-section-spec.sh

- task_type: pm_brief_check
  agent: pm-agent
  output_budget: 200
  tier_load_tags: ["pm-active"]
```

Budget travels with the task assignment.

---

## What's NOT counted in output budget

- Tool calls (file reads, bash commands) — they're not "output text"
- Audit log entries written by orchestrator
- Status messages from orchestrator itself (not from invoked agent)

What IS counted:
- All agent-produced prose
- All agent-produced code (in code blocks)
- All structured outputs (JSON, YAML, etc.)
- Agent's "I need to think about this..." preamble (which should be zero — persona forbids)

---

## Persona reinforcement

Every agent prompt prefix includes (from `_spine/persona.md` § "Tone"):

> Direct. No glazing. No "Great question!", no "Let me think through this carefully", no warm-up sentences. Skip to the work.

The token budget is the enforcement mechanism. Persona is the cultural mechanism. Both reinforce.

---

## Recalibration cadence

Budgets are reviewed:
- After every pilot project (post-pilot retro)
- Quarterly during system retros (per K2)

If a task type consistently runs 10%+ over budget, raise the budget. If consistently 20%+ under, lower it.

---

## Cost impact estimate

Kitchen Blockers output: 4.86M tokens = $73.

If output budgets are enforced and persona is followed:
- Average output per message drops from ~1,150 to ~750 tokens
- Project output total drops from 4.86M to ~3.2M
- Output cost drops from $73 to ~$48

Combined with Tier F (cache read reduction), target total cost: ~$130 (down from $232 — a 44% reduction).

---

## Anti-patterns

1. **Treating budgets as suggestions.** They're caps. Going over without explicit approval is a failure mode.

2. **Inflating budgets without retro evidence.** "This task feels hard, let's give it more." No — base on actual past task data.

3. **Agents that always request increases.** If an agent ALWAYS asks for 2x, the budget is wrong OR the agent is verbose. Investigate.

4. **No tracking.** Audit log captures over-budget events. If nothing's logged, enforcement isn't working.

5. **Treating budget warnings as failures.** Warnings are signal. Use them to refine.

6. **Single global budget.** Task types vary widely. A milestone update report shouldn't have the same cap as a 5-line PM brief.

7. **Budget for cost only, ignoring quality.** Sometimes a task NEEDS more output. Quality > under-budget.

---

## Integration

- `_spine/orchestrator/knowledge/02-routing-table.md` — declares budget per task type
- `_spine/orchestrator/knowledge/07-build-plan-preview.md` — preview includes "APPROX: X tokens" pulled from budget
- `_spine/shared-knowledge/tiered-kb-loading.md` — input-side companion
- `tools/scripts/token-estimator.py` — surfaces per-task token usage from JSONL
- `project.json.audit_log` — over-budget events recorded
- `tools/pilot/06-pilot-success-metrics.md` — Metric 7 (cost) influenced by budget adherence

---

Last reviewed: 2026-05-28 by Claude (v1.5.5 — token budget enforcement)
Next review due: After next pilot project
