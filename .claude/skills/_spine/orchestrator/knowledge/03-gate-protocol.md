---
tier: 1
load_when: ["gate-decision"]
description: "Full gate specification lives in `/_contracts/gate-format.md`. This file is the orchestrator's specific responsibilities for enforcing gates."
---

# 03 — Gate Protocol (Orchestrator's enforcement view)

> Full gate specification lives in `/_contracts/gate-format.md`. This file is the orchestrator's specific responsibilities for enforcing gates.

---

## What the orchestrator does at each gate

### When a gate OPENS

Triggered when:
- A stage completes and produces required artifacts
- All automated validators (skills ending in `validate-*`) have run and passed
- All prerequisites in the stage dependency graph are met

Orchestrator action:
1. Acquire lock on `project.json`
2. Create new entry in `project.json.gates[]`:
   ```json
   {
     "id": "G[N]-[project-slug]-[scope]",
     "type": "[gate type]",
     "scope": "[sprint id | milestone id | project]",
     "status": "open",
     "opened_at": "[ISO datetime]",
     "sla_hours": 24,
     "expires_at": "[ISO datetime, +24h]",
     "primary_approver": "[role: e.g., PM lead]",
     "backup_approver": "[role]",
     "escalation_log": []
   }
   ```
3. Set `project.json.active.blocked_on` to gate ID
4. Append `audit_log` entry: `gate_opened`
5. Release lock
6. Notify human approver:
   - Output formatted gate block (see `/_contracts/gate-format.md` § Standard Gate Format)
   - In production, this could trigger Slack/email — for now, presented in chat

### While a gate is OPEN

Track SLA timer. At intervals:
- **+12 hours after opened_at**: append `audit_log` entry `gate_reminder_sent` and surface reminder in next session
- **+24 hours**: SLA expired. Append `gate_escalated`. Surface to backup approver (manual ping per F3 simplified model).

If user takes no action past expiration: mark `active.blocked_on` clearly. Do not auto-decide. Orchestrator never auto-approves.

### When a gate DECISION is received

Trigger: user types one of:
- `CONFIRM [gate_id]`
- `REJECT [gate_id] [reason]`
- `REVISE [gate_id] [specific change]`
- `RENEGOTIATE [gate_id] [reason]` (only G1, G2)

Orchestrator action:
1. Verify gate exists and is `status: open`
2. Verify decider is NOT the doer (self-approval check):
   - If decider == agent that did the work: REFUSE. "Self-approval forbidden. Get [other role] approval."
3. Verify reason/change is present where required:
   - REJECT requires non-empty reason
   - REVISE requires specific change description
   - RENEGOTIATE requires reason
4. Acquire lock
5. Update gate entry:
   ```json
   {
     "status": "passed" | "failed",
     "decided_by": "[user id/email]",
     "decided_at": "[ISO datetime]",
     "decision": "CONFIRM | REJECT | REVISE | RENEGOTIATE",
     "notes": "[reason or change]"
   }
   ```
6. Append `audit_log` entry: `gate_decided`
7. Clear `active.blocked_on`
8. Release lock
9. Take next action based on decision (see below)

---

## Decision → Next action mapping

### CONFIRM
- Advance `active.stage` to next stage per dependency graph
- Invoke the next agent per `02-routing-table.md`
- For parallel-tracks projects: advance ALL tracks that were waiting on this gate

### REJECT
- Mark current stage's artifacts as invalidated (move to `project.json.versions/rejected/`)
- Set `active.stage` back to start of current stage
- Re-invoke the agent that produced the rejected work
- Pass the rejection reason as context to the re-invoked agent
- Do NOT advance until new work produced and gate re-opens

### REVISE
- Keep most of the stage's work intact
- Pass specific change description to the agent that produced the work
- Agent applies targeted change, re-opens same gate
- Gate is the SAME gate, status changes from `passed` → `pending` until new approval

### RENEGOTIATE
- Halt all stage progression
- Set `project.status` to `on-hold`
- Append `audit_log` entry `renegotiation_requested`
- Surface to developer: "Project on hold for scope renegotiation. Internal PM should coordinate with client. Resume with `RESUME [project] AFTER_RENEGOTIATION` once new scope is agreed."

---

## Self-approval prohibition (hard enforcement)

Each agent that creates artifacts is tagged in `audit_log`. When a gate decision arrives, orchestrator checks:

```
agent_that_did_work = audit_log.find(gate.scope, action="artifact_created").actor
if gate.decided_by == agent_that_did_work:
    REFUSE: "Self-approval forbidden. [Other role] must approve."
```

For each gate, valid approver roles:

| Gate | Cannot approve | Must approve |
|------|----------------|--------------|
| G0 | (auto) | (auto by validator) |
| G0.5 (discovery) | The agent that produced discovery report | PM lead or Internal PM |
| G1 (plan) | PM Agent | Internal PM or senior PM |
| G2 (design) | Designer Agent | Designer lead OR client (via Internal PM proxy) |
| G3 (scaffold) | Frontend Agent | Senior dev or tech lead |
| G4 (sprint QA) | The dev who built the sprint | QA lead or other senior dev |
| G5 (milestone) | The dev who built milestone | Tech lead + PM |
| G6 (pre-launch) | Delivery Head | Delivery head + Client (via Internal PM proxy) |

---

## Override protocol (rare, audited)

Triggered by: `OVERRIDE [gate_id] [reason]`

Orchestrator action:
1. Verify override request has both gate_id and reason (else refuse)
2. Verify requester is a named senior dev or owner in `project.assigned_team`
3. Acquire lock
4. Append to `gate.escalation_log`:
   ```json
   {
     "at": "[ISO datetime]",
     "action": "override",
     "by": "[user id]",
     "reason": "[reason]"
   }
   ```
5. Also append `audit_log` entry `gate_overridden` with full context
6. Mark gate as `status: passed` with note: "OVERRIDE — [reason] — by [user]"
7. Release lock
8. Proceed as if CONFIRM, but flag for weekly delivery review

Overrides per project should be **ZERO**. > 1 in a single project = process failure signal, surface this in monthly retro (K5).

---

## Gate validators

Some gates are partially or fully automated. The orchestrator invokes validators BEFORE opening the gate to human. If validators fail, gate doesn't open — agent gets the work back.

| Gate | Validator skills run automatically | What they check |
|------|-----------------------------------|------------------|
| G0 | `validate-sow` | SOW completeness ≥ 60 |
| G0.5 | `validate-discovery-report` | Required sections present |
| G1 | `validate-spec`, `validate-milestones` | Schema, completeness, estimates vs SOW |
| G2 | `validate-design-tokens`, `validate-section-map` | Schema, contrast, accessibility |
| G3 | `validate-scaffold` | Build passes, CLI connects, CI runs |
| G4 | `theme-check`, `lighthouse-ci`, `axe-core`, `visual-regression`, `unit-tests` | Per-sprint full pyramid |
| G5 | Full regression suite (all G4 validators across all sprints) | Cross-sprint regression |
| G6 | `prelaunch-checklist-runner` | All checklist items present + verified |

If validator fails:
- Gate does NOT open to human
- Bug entry created in `project.json.bugs[]`
- Orchestrator routes back to producer agent with failure details
- Producer agent fixes, validators re-run
- Cycle until validators pass, THEN human gate opens

This is the **"don't bother humans with auto-detectable failures"** rule.

---

## Conditional gates

Gate G0.5 (Discovery) only opens if the SOW includes discovery as a scoped line item. Otherwise skip directly from G0 to spec generation.

Gate G6 (Pre-Launch) requires client sign-off via Internal PM proxy. Orchestrator notes this in the gate block — the Internal PM provides confirmation evidence (Podio ID, email subject, meeting timestamp) which is recorded in `gate.notes`.

---

Last reviewed: 2026-05-24 by Claude (initial)
Next review due: 2026-08-24
