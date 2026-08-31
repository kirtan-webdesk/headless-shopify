---
tier: 2
load_when: ["misc"]
---

# Gate Protocol Specification

> Every transition between stages passes through a gate. Gates are the system's defense against compounding errors. This document defines the gate format, lifecycle, options, SLAs, and escalation paths. Every agent that opens a gate uses this exact format.

---

## The 7 Gates

| ID | Name | Type | Approver |
|----|------|------|----------|
| G0 | SOW Validation | Auto | system (blocks if SOW incomplete) |
| G1 | Plan + Estimate Approval | Human | PM lead |
| G2 | Design Approval (HTML mockup preview URL) | Human | Design lead + Client (via Internal PM) |
| G3 | Scaffold Verification | Auto + Spot-check | Tech lead |
| G4 | Sprint QA (repeats per sprint) | Hybrid | QA lead |
| G5 | Milestone Regression | Hybrid | Tech lead + PM |
| G6 | Pre-Launch | Human | Delivery head + Client |

---

## Gate Lifecycle

```
[Stage N work completes]
    ↓
[Validator skill runs] ────→ FAIL ──→ [Return to agent for fix, gate not opened]
    ↓ PASS
[Gate opened]
    ↓
[Notification sent to approver(s)]
    ↓
[SLA timer starts]
    ↓
    ├─ DECISION received within SLA → [Apply decision]
    │       ├─ CONFIRM → [Advance to stage N+1]
    │       ├─ REJECT → [Return to agent with reason]
    │       ├─ REVISE → [Targeted change request]
    │       └─ RENEGOTIATE → [Halt, escalate to scope review]
    │
    └─ NO DECISION at SLA → [Escalation]
            ├─ At 12h: Reminder to primary approver
            ├─ At 24h: Notification to backup approver
            ├─ At 48h: Status → BLOCKED, page PM lead
            └─ At 72h: Project goes to escalation review
```

---

## Standard Gate Format

Every gate opens with this exact structured block. The agent does not deviate from this format.

```markdown
═════════════════════════════════════════════════════════════════
GATE [ID]: [Name]
═════════════════════════════════════════════════════════════════

Project: [Project Name] ([Project ID])
Stage: [Current stage] → [Next stage]
Opened at: [ISO datetime]
SLA: [X hours]
Expires at: [ISO datetime]
Primary approver: [Name, role]
Backup approver: [Name, role]

─────────────────────────────────────────────────────────────────
WHAT WAS COMPLETED
─────────────────────────────────────────────────────────────────

[Concise description of work done in the prior stage. 3-5 bullet points max.]

─────────────────────────────────────────────────────────────────
ARTIFACTS TO REVIEW
─────────────────────────────────────────────────────────────────

[List of files/URLs the approver should look at. Each has a 1-line description.]

1. [artifact path] — [what it is]
2. [artifact path] — [what it is]
3. [URL] — [what to look for]

─────────────────────────────────────────────────────────────────
AUTOMATED CHECKS (if applicable)
─────────────────────────────────────────────────────────────────

[Results of validator skill. Pass/fail per check. Only shown for hybrid gates.]

✓ Theme check: PASS
✓ Lighthouse Performance: 94 (target ≥90)
✓ Lighthouse Accessibility: 98 (target ≥95)
✓ Visual regression: 0 unexpected changes
✓ Acceptance criteria: 8/8 verified
✗ axe-core: 2 contrast warnings (see report)

─────────────────────────────────────────────────────────────────
DECISION REQUIRED
─────────────────────────────────────────────────────────────────

[The specific question the approver is being asked. One sentence.]

Reply with one of:

  CONFIRM
      → Advance to [next stage]
      → [Brief description of what happens next]

  REJECT [reason]
      → Return all work in current stage to agent
      → Agent will redo from scratch (use this for fundamental issues)

  REVISE [specific change]
      → Targeted change without full redo
      → Agent will address the specific item and re-open this gate

  RENEGOTIATE [reason]  (only available at G1, G2)
      → Halt project
      → Escalate to scope review with client
      → Project status changes to ON-HOLD

─────────────────────────────────────────────────────────────────
WHAT'S BLOCKED
─────────────────────────────────────────────────────────────────

[List of subsequent stages that cannot start until this gate passes.]

─────────────────────────────────────────────────────────────────
NOTES
─────────────────────────────────────────────────────────────────

[Any context the approver needs. Risk flags. Cost flags. Anything anomalous.]

═════════════════════════════════════════════════════════════════
```

---

## SLA & Escalation per Gate

| Gate | Default SLA | At 12h | At 24h | At 48h | At 72h |
|------|-------------|--------|--------|--------|--------|
| G0 | Auto (no SLA) | — | — | — | — |
| G1 (Plan) | 48h | Reminder | Notify backup | Escalate | Review |
| G2 (Design) | 72h (client involved) | Reminder | Notify backup | Reminder again | Escalate |
| G3 (Scaffold) | 24h | Reminder | Notify backup | Escalate | Review |
| G4 (Sprint QA) | 24h | Reminder | Notify backup | Escalate | Review |
| G5 (Milestone) | 48h | Reminder | Notify backup | Escalate | Review |
| G6 (Pre-Launch) | 48h (client involved) | Reminder | Notify backup | Escalate | Review |

SLA starts when the gate is opened. Reminders are automated. Escalations are logged to `audit_log`.

---

## Decision Semantics

### CONFIRM

- Stage is approved as-is
- Agent advances to next stage
- Gate status: `passed`
- `decided_by`, `decided_at`, `decision: CONFIRM` recorded

### REJECT [reason]

- Work in current stage is invalidated
- Agent redoes the stage from scratch
- Gate status: `failed`, then re-opens after agent reworks
- Use for: fundamental misunderstanding, scope mismatch, wrong direction
- **Reason is required.** Empty REJECT is treated as REVISE with no detail.

### REVISE [specific change]

- Work is mostly correct, specific change needed
- Agent applies the change and re-opens the same gate
- Gate status: `pending` → re-opened after rework
- Use for: small fixes, copy changes, parameter adjustments
- **Specific change description is required.** Vague REVISE is rejected and approver must clarify.

### RENEGOTIATE [reason]

- Only available at G1 (Plan) and G2 (Design)
- Indicates: the SOW or plan needs to go back to scope review with the client
- Project status changes to `on-hold`
- PM lead is notified to coordinate scope review
- **Reason is required.** Logged for sales review.
- This is the "the SOW is wrong" option that previously didn't exist in your system

---

## Auto-Gate Behavior (G0, G3, parts of G4 and G5)

Some gates have an automated component. The validator skill runs and produces a pass/fail report:

- **G0 (Intake Validation):** Per v1.5.2 hard gate (see `_spine/pm-agent/knowledge/13-g0-intake-gate.md`). Required intake artifacts must be present (brand assets, social URLs, blocklist populated, etc.). < 80% complete halts; ≥ 80% allows progression with documented open items.
- **G3 (Scaffold):** Auto-validates that the scaffold builds, dev theme is reachable, CI runs. Then a tech lead does a 15-minute spot-check. Auto-pass if both succeed.
- **G4, G5:** Auto-checks (Lighthouse, theme check, axe, visual regression) must pass before the human review even opens. Failed auto-checks send the work back to dev without bothering the human.

---

## G2 — HTML mockup deliverable (v1.5.2)

Per D-DES-01 — G2 deliverable is an HTML/CSS/JS mockup served via the preview server. Figma frames, screenshots, and static design files are NOT acceptable G2 deliverables.

### What Designer Agent surfaces at G2

1. **Preview URL** — running mockup served by `tools/scripts/mockup-preview-server.sh` (local + optionally tunneled for client review via Internal PM)
2. **design-tokens.json** — authoritative token file
3. **section-map.json** — page composition map
4. **Mockup validation report** — output of `tools/scripts/validate-mockup.sh` showing all 8 checks pass
5. **Walkthrough notes** — what to look at on each mockup page, what interactions to test
6. **Accessibility report** — axe-core run results for each mockup page (zero violations expected)
7. **Performance report** — Lighthouse run against preview URL (Performance ≥ 90, Accessibility = 100, Best Practices ≥ 90)

### What the approver does at G2

- Open the preview URL on at least one desktop and one mobile viewport
- Tab through each page (no mouse) — verify keyboard navigation works
- Inspect interaction states (hover, focus, active, disabled)
- Resize viewport to verify responsive behavior at 375px, 768px, 1280px
- Review token decisions (colors, typography, spacing — does this match brand?)
- Review section composition (does each page contain the agreed sections?)
- Run their own quick Lighthouse / axe checks if desired

### G2 approval criteria

CONFIRM only if:
- Validation report shows all 8 checks pass
- Designer Agent's accessibility + performance reports meet thresholds
- Visual approval from Internal PM + Client (via Internal PM channel)
- No P1 mockup issues open (P2/P3 captured as open items, OK to proceed)

REVISE if:
- Visual changes requested (Designer Agent updates HTML/CSS)
- Token adjustments needed (Designer Agent regenerates tokens.css)
- Section reordering or swap (Designer Agent updates section-map + mockup)

REJECT if:
- Validation report shows failures and Designer Agent can't resolve in < 1 day
- Mockup uses Figma exports or static images (DES-001 violation — start over)
- Mockup code fails Code Review (inline styles, hardcoded colors, semantic HTML violations)

### After G2 CONFIRM

- Mockup version frozen (audit log entry)
- Mockup directory becomes read-only reference for Frontend Agent
- Frontend Agent's job: convert HTML mockup → Liquid/template engine, wire dynamic data, preserve design

If Frontend Agent finds mockup gaps post-G2: capture as FM-NNN, escalate to Designer Agent for revision. Do NOT silently rebuild structure.

---

## Required Fields per Decision

Every decision writes the following to `project.json.gates[]`:

```json
{
  "id": "G4-sprint-1.2",
  "type": "sprint-qa",
  "scope": "S1.2",
  "status": "passed",
  "opened_at": "2026-05-24T10:00:00Z",
  "expires_at": "2026-05-25T10:00:00Z",
  "decided_by": "john@webdesksolution.ca",
  "decided_at": "2026-05-24T14:32:00Z",
  "decision": "CONFIRM",
  "notes": "All AC met. Lighthouse 94/98/96.",
  "escalation_log": []
}
```

---

## Gate Override Protocol

Gates can be overridden in true emergencies (e.g., critical bug in production). Override requires:

1. **Override request** submitted via specific command: `OVERRIDE [gate_id] [reason]`
2. **Senior dev or owner** approval (named in `project.assigned_team`)
3. **Override is logged** to `audit_log` with full justification
4. **Override is reviewed** at next weekly delivery review

Overrides do NOT change the gate decision history. They create a `OVERRIDE` entry alongside the original `pending` gate.

Average overrides per project should be ZERO. > 1 override per project is a process failure signal.

---

## Gate Anti-Patterns (do not do these)

1. **Vague REVISE.** "Make it better" is not actionable. Agent should reject vague REVISE and re-ask.
2. **CONFIRM with notes that contradict CONFIRM.** "CONFIRM but the hero is wrong" — agent should treat as REVISE.
3. **Skipping G0.** Never run PM agent on an SOW that hasn't passed G0. This is the #1 source of downstream rework.
4. **Combining gate decisions across sprints.** Each sprint gets its own G4. No "approve sprints 1-3 together."
5. **Self-approval.** A human can never approve a gate on their own work. Designer cannot approve G2 design. Dev cannot approve G4 their own code. Approver must be different from doer.

---

## Gate Format in Different Contexts

### In Claude Code terminal

Gate appears as a formatted block in the terminal. User replies with the decision command.

### In project dashboard (if built)

Gate appears as a card with action buttons (CONFIRM / REJECT / REVISE / RENEGOTIATE).

### Via email/Slack notification

Notification contains: Project name, Gate ID, Summary, Link to full gate context, SLA countdown.

The format inside the gate block is identical across contexts. Only the delivery mechanism changes.

---

## Audit log requirement

Every gate event is logged to `project.json.audit_log`:

- `gate_opened` — when gate is created
- `gate_reminder_sent` — at 12h, 24h, etc.
- `gate_escalated` — when backup approver is notified
- `gate_decided` — when decision is made
- `gate_overridden` — when override is exercised
- `gate_expired` — when SLA elapses without decision

This log is the source of truth for SLA compliance reviews.

---

Last reviewed: 2026-05-24 by Claude (initial)
Next review due: 2026-08-24
