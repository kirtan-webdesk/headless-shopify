---
tier: 1
load_when: ["agent-routing"]
description: "Maps stages → agents and tasks → skills. The orchestrator uses this to decide which specialist to invoke."
---

# 02 — Routing Table

> Maps stages → agents and tasks → skills. The orchestrator uses this to decide which specialist to invoke.

---

## Stage → Agent mapping (universal flow)

| Stage | Primary Agent | Supporting | Output Artifact | Next Gate |
|-------|---------------|------------|------------------|-----------|
| intake | PM Agent | validate-sow | SOW completeness report | G0 |
| discovery (optional) | PM Agent | Designer Agent (research) | Discovery report | G0.5 |
| spec generation | PM Agent | — | spec.md | (no gate) |
| planning | PM Agent | — | milestones.json + estimates | G1 |
| design | Designer Agent | (Frontend Agent for early section sketches) | design-tokens.json + section-map.json + visual mockups | G2 |
| scaffolding | Platform Frontend Agent | Backend Agent (repo + CI setup) | scaffolded repo + theme | G3 |
| development | Frontend Agent + Backend Agent | Code Review Agent (per PR) | Liquid/PHP/JS code + integrations | (per sprint: G4) |
| sprint QA | QA Agent | — | QA report per sprint | G4 |
| milestone regression | QA Agent | — | regression report | G5 |
| pre-launch | Delivery Head | QA Agent (final pass) | pre-launch checklist + backup | G6 |
| launch | Delivery Head | — | live theme + launch confirmation | (no gate, health check follows) |
| handoff | Delivery Head + PM Agent | — | handoff guide + master doc + client memory .md | (no gate, project closes) |

---

## Project-type-specific routing variations

### Migration project
After spec generation (G1 approved), routing differs:

```
Spec → [Design track || Data Migration track || URL Strategy track] → Parity → QA → Launch
                       ↓                          ↓
                  Content & Migration         (URL planning sits in
                  Agent owns data work        PM + SEO Agent)
```

These tracks run in PARALLEL where the project-type's dependency graph allows (see `04-state-management.md` § Project-type Dependency Graphs).

### Headless project
Includes additional sub-stages:
- After design approval (G2), routing adds:
  - Architecture decision (which headless variant) → PM Agent + Designer Agent
  - API contract definition → Backend Agent
  - SSR/SSG strategy → Frontend Agent

### B2B modifier active
When `_b2b-modifier` is loaded:
- Designer Agent adds B2B-specific section research (company switcher, NET terms UI, custom catalogs)
- Backend Agent adds B2B integration work (NET terms config, customer hierarchy, B2B app config)
- QA Agent adds B2B test scenarios to module 2 (Functional)

### Discovery scoped
When `sow.deliverables` includes "Discovery" line item:
- Insert Discovery stage between intake and spec generation
- Discovery skill (within PM Agent) runs deep research
- Output: discovery report (feeds into spec)
- Gate G0.5 sign-off before spec generation begins

---

## Task → Skill mapping

When the developer issues a specific task, route to the right specialist:

| Task pattern | Skill to invoke |
|--------------|-----------------|
| "Generate spec from SOW" | PM Agent |
| "Generate plan / milestones" | PM Agent |
| "Generate sprint update doc" | PM Agent |
| "Verify sprint vs scope" | PM Agent (adherence verification) |
| "Run discovery questionnaire" | PM Agent (discovery sub-skill) |
| "Research design trends for [industry]" | Designer Agent |
| "Generate design tokens" | Designer Agent |
| "Pick design path" | Designer Agent |
| "Build section [name]" | Platform Frontend Agent (Shopify/WP/etc.) |
| "Configure metafields" | Platform Backend Agent |
| "Setup webhook for [event]" | Platform Backend Agent |
| "Run sprint QA" | QA Agent |
| "Run milestone regression" | QA Agent |
| "Review this PR / code" | Code Review Agent |
| "Generate pre-launch checklist" | Delivery Head |
| "Backup theme" | Delivery Head |
| "Publish theme" | Delivery Head (requires G6 passed) |
| "Generate handoff docs" | Delivery Head |
| "Generate master doc" | PM Agent |
| "Generate client memory" | PM Agent |
| "Map redirects for migration" | Content & Migration Agent |
| "Import products" | Content & Migration Agent |
| "Verify data parity" | Content & Migration Agent |
| "Setup analytics" | Backend Agent (with Delivery Head verifying at G6) |
| "Setup payment integration" | Backend Agent provides INSTRUCTIONS to dev; does NOT auto-config |
| "Setup shipping" | Backend Agent provides INSTRUCTIONS; manual |

---

## Special routing rules

### Bug fix routing

When a bug is identified by QA Agent:

1. QA Agent writes bug report entry to `project.json.bugs[]`
2. Orchestrator does NOT auto-route to dev agent
3. Orchestrator surfaces to developer: "Bug [ID] reported. Severity [P1/P2/P3/P4]. Want me to invoke [Frontend/Backend] Agent to fix?"
4. Developer issues command: "Fix bug [ID]"
5. Orchestrator routes to appropriate dev agent
6. Dev agent produces fix
7. Code Review Agent reviews the fix
8. Developer manually merges (no auto-merge)

This is the **NO AUTO-FIX** rule from B11. Strict.

### Code review routing

Triggered by:
- Pull request opened on any `feature/*` or `fix/*` branch
- GitHub Action workflow invokes Code Review Agent automatically

Orchestrator does NOT route code reviews — the GitHub Action does. But orchestrator records the review result in `audit_log` when notified by the Action.

### Cost-aware routing

Before routing to any agent:
1. Read skill config for that agent's average token cost per invocation
2. Check `project.json.budget.token_used + estimate < token_cap * 0.9`
3. If would exceed cap: halt, surface to developer, request approval to continue
4. Log estimated and actual costs to `audit_log`

If exceeding daily workspace cap (set in Anthropic API console), expect API errors. Surface cleanly.

---

## Budget Check

```
def check_budget(estimated_cost):
    project = read_project_json()
    used = project.budget.token_used
    cap = project.budget.token_cap
    threshold = cap * 0.9

    if used + estimated_cost > cap:
        halt("Token cap exceeded. Approve increase or stop.")

    if used + estimated_cost > threshold:
        warn("Approaching token cap (>90%). Continue?")

    return True
```

Same logic for hours budget (`hours_burned` vs `hours_budget`).

---

## Agent NOT to route to

Some requests should NOT be routed to agents — they're orchestrator-only:

| Request | Why | Orchestrator action |
|---------|-----|---------------------|
| "Skip this gate" | Gates non-skippable | Refuse + explain |
| "Approve all gates" | Gate decisions are per-gate | Refuse + list pending gates individually |
| "Have the designer approve their own design" | Self-approval forbidden | Refuse + explain |
| "Change project.json directly" | Schema-validated writes only | Refuse + route through proper write protocol |
| "Make this faster" (vague) | Vague | Ask specifics |

---

## Routing audit

Every routing decision is logged:

```json
{
  "timestamp": "2026-05-24T14:32:00Z",
  "actor": "orchestrator",
  "actor_type": "agent",
  "action": "route",
  "details": {
    "request": "Generate spec from SOW",
    "routed_to": "pm-agent",
    "stage": "intake",
    "estimated_tokens": 8000,
    "reason": "User requested spec generation; PM Agent owns spec output"
  }
}
```

This creates an audit trail for routing decisions. Useful for retros.

---

Last reviewed: 2026-05-24 by Claude (initial)
Next review due: 2026-08-24
