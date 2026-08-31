---
tier: 3
load_when: ["human-reference-only"]
---

# Shortcodes — Developer Quick Reference

> Short commands instead of long prompts. Type these in Claude Code; the orchestrator routes to the right action. Reduces drift, ensures consistent behavior, saves typing.

---

## How to use

In any Claude Code session, type the shortcode after the orchestrator is loaded. The orchestrator detects the shortcode and runs the matching protocol.

Example:

```
/start shopify redesign Aurora Skincare
```

vs the long-form equivalent:

```
Hi, can you help me start a new Shopify redesign project for a client called Aurora Skincare. I want to use the standard process...
```

Short commands = consistent behavior. Long prompts = drift.

---

## Project lifecycle commands

### `/start [platform] [type] [client-name]`
Start a new project. Initializes project workspace, project.json, and routes to PM Agent for SOW intake.

**Examples:**
```
/start shopify redesign Aurora Skincare
/start shopify new-build Bakery Co
/start shopify migration Tech Startup X
/start shopify headless-build Modern Brand
```

**Platforms:** `shopify` | `bigcommerce` | `wordpress` | `magento` | `nodejs` (future)
**Types:** `redesign` | `new-build` | `migration` | `headless-build` | `b2b-commerce` | `version-upgrade-only` | `version-upgrade-with-redesign`

---

### `/resume [client-name-or-id]`
Resume an existing project. Loads project.json, reports current stage, suggests next action.

**Example:**
```
/resume Aurora Skincare
/resume WDS-2026-047
```

---

### `/status [client-name-or-id]`
Show structured status report for a project. Read-only — does not change state.

**Example:**
```
/status Aurora Skincare
```

Returns:
- Current stage + active sprint
- Open gates + SLA countdown
- Recent activity (last 5 audit log entries)
- Budget status
- Next action needed

---

### `/help`
Show all available shortcodes + descriptions.

---

## Stage-specific commands

### `/audit`
For redesign + migration projects only. Runs the existing site audit per `shopify/projects/redesign/knowledge/01-existing-site-audit.md`.

**Produces:**
- SEO baseline snapshot
- Performance baseline
- Content inventory CSV
- Functionality inventory
- Design system inventory
- Combined audit report

**Gate:** G0.5 (Audit Completion)

---

### `/clarify`
Generate clarification questions for incomplete SOW. PM Agent identifies gaps and batches questions.

Use when: SOW is incomplete and orchestrator stalls at G0 (SOW Validation gate).

---

### `/spec`
Generate spec.md from SOW + clarification responses. PM Agent produces structured spec.

**Gate:** Output goes to G1 (Plan Approval) after estimation.

---

### `/plan`
Generate milestones + sprints + estimates from approved spec. PM Agent produces milestones.json.

**Gate:** G1 (Plan Approval)

---

### `/design-path`
Run design path decision per `_spine/designer-agent/knowledge/02-design-path-decision.md`. Designer Agent picks one of 6 paths based on project type, budget, brand maturity.

---

### `/questionnaire`
Run brand questionnaire (22 questions) per `_spine/designer-agent/knowledge/01-brand-questionnaire.md`. Designer Agent batches questions for client.

---

### `/design`
Generate design tokens + section map after questionnaire + audit complete.

**Gate:** G2 (Design Approval)

---

### `/scaffold`
Initialize repo + theme scaffold per design tokens. Frontend Agent sets up project structure.

**Gate:** G3 (Scaffold Verification)

---

### `/sprint [sprint-id]`
Start a sprint. Frontend Agent + Backend Agent read sprint brief, build per acceptance criteria.

**Example:**
```
/sprint S2.1
```

---

### `/qa [sprint-id]`
Run sprint QA. QA Agent runs 8 modules + verifies acceptance criteria.

**Gate:** G4 (Sprint QA) per sprint.

---

### `/regression [milestone-id]`
Run milestone regression. QA Agent does full regression vs prior milestones.

**Gate:** G5 (Milestone Regression).

---

### `/prelaunch`
Run pre-launch checklist composition + verification per `_spine/delivery-head/knowledge/01-prelaunch-checklist-composition.md`. Delivery Head produces dynamic checklist.

**Gate:** G6 (Pre-Launch).

---

### `/launch`
Execute the live publish workflow. Delivery Head runs backup → publish → health check.

**Requires:** G6 confirmed.

---

### `/rollback`
Trigger rollback per `_spine/delivery-head/knowledge/03-rollback-procedure.md`. Reverts to backup theme.

**Requires:** Rollback authority approval.

---

### `/handoff`
Generate handoff package (admin guide, training video script, credentials, warranty terms, master doc, client memory). Delivery Head + PM Agent.

---

## Gate commands

### `/confirm [gate-id]`
Confirm a gate. Advance to next stage.

**Example:**
```
/confirm G1-aurora-skincare
```

---

### `/reject [gate-id] [reason]`
Reject a gate. Returns work to agent for rebuild.

**Example:**
```
/reject G2-aurora-skincare The hero design doesn't match the brand direction
```

---

### `/revise [gate-id] [specific-change]`
Revise (not full rebuild). Agent applies targeted change.

**Example:**
```
/revise G2-aurora-skincare Change the primary brand color from #2E4A1F to #1A2A11
```

---

### `/renegotiate [gate-id] [reason]`
Available at G1 and G2 only. Halt project for scope renegotiation with client.

**Example:**
```
/renegotiate G1-aurora-skincare Estimate is 14 weeks vs 8 week SOW timeline
```

---

### `/override [gate-id] [reason]`
Emergency override. Requires senior dev approval. Logged in audit_log for weekly review.

**Example:**
```
/override G4-S2.4 Hotfix for production checkout bug, accepting P3 deferred
```

---

## State + budget commands

### `/cost`
Show project cost so far (tokens used, dollar cost, vs budget).

---

### `/budget`
Show budget status (token cap, used, remaining, alert thresholds).

---

### `/audit-log [limit]`
Show recent audit log entries.

**Example:**
```
/audit-log 20
```

---

### `/bugs`
Show open bugs by severity.

---

## Update document commands

### `/update sprint [sprint-id]`
Generate sprint update document. PM Agent produces per `_spine/pm-agent/knowledge/08-update-document-templates.md`.

### `/update milestone [milestone-id]`
Generate milestone update document.

### `/update data-migration [checkpoint]`
For migration projects only.

### `/update desktop-preview`
When desktop UX is reviewable.

### `/update responsive-preview`
When mobile/tablet is reviewable.

### `/update seo`
SEO milestone update.

### `/update go-live`
Pre-launch or post-launch update.

---

## Specific work commands

### `/review`
Trigger AI code review on the current PR (manual trigger). Useful when GitHub Actions failed and you want to retry.

### `/fix [bug-id]`
Route a bug fix to the appropriate dev agent. Per B11 — no auto-fix, this is the explicit command.

**Example:**
```
/fix BUG-014
```

### `/verify-redirects`
Run the redirect verification script against staging.

### `/lighthouse [url]`
Run Lighthouse against a specific URL on the dev/staging preview.

---

## Discovery / agent invocation

### `/agent [agent-name] [task]`
Invoke a specific agent directly for a one-off task.

**Example:**
```
/agent pm-agent Estimate effort for adding wishlist feature to Aurora project
/agent code-review-agent Review the current uncommitted changes
/agent qa-agent Run accessibility check on the cart drawer
```

---

## Project closure

### `/master-doc`
Generate the project master doc (technical reference for future devs).

### `/client-memory`
Generate the client memory file (cross-project context for the next engagement).

### `/close`
Mark project as closed. Updates project.json status, archives state.

---

## Workspace-level commands

### `/list-projects`
List all active projects in this workspace.

### `/switch [client-name]`
Switch active project context.

### `/health`
Check that all skills load correctly + spine is healthy.

---

## Safety + environment commands (v1.5.2)

### `/check-env`
Runs `tools/scripts/check-env.sh`. Verifies Node version, Shopify CLI version, project.json validity, and `client_contact_blocklist` population (FLAG-004 enforcement). Orchestrator runs this automatically at session start (per `_spine/orchestrator/knowledge/01-session-start-protocol.md` Step 0).

Manual invocation when troubleshooting:
```
/check-env --platform shopify --strict
```

---

### `/safe-push [--theme dev|staging|live]`
Wraps `shopify theme push` via `tools/scripts/safe-push.sh`. ALWAYS uses `--nodelete` and snapshots remote theme before pushing. Logs to `project.json.audit_log`.

```
/safe-push --theme dev      # push to dev theme
/safe-push --theme staging  # push to staging
/safe-push --theme live     # push to live (requires extra confirmation)
```

Refuses to run without `--nodelete` — see SEC-004.

---

### `/snapshot`
Pulls current remote theme to `.theme-snapshots/snapshot-<TIMESTAMP>/` without pushing. Useful before manual changes.

---

### `/rollback [snapshot-name]`
Lists available snapshots and pushes the chosen one back to the original theme. Reads `audit_log` entries with `rollback_command` field.

---

### `/blocklist [add|show|remove] [email|phone|domain]`
Manages `client_contact_blocklist` in project.json per `outbound-comms-gate.md`. Populating this makes FLAG-004 enforceable by Code Review Agent + at runtime.

```
/blocklist show
/blocklist add bamps@kitchenblockers.com
/blocklist add kitchenblockers.com domain
```

---

## When NOT to use shortcodes

Shortcodes work best for routine operations. For these, use long-form prompts instead:

- **Ad-hoc questions** ("how does Shopify handle multi-currency?")
- **Discussion** ("I'm thinking about whether to use Path 1 or Path 3 — thoughts?")
- **Investigation** ("Why is the Lighthouse score dropping?")
- **Custom requests not in the shortcode list**

Shortcodes are for repeatable workflow steps. Discussion is for thinking.

---

## How shortcodes interact with the gate model

Most shortcodes produce artifacts that go to gates:

```
/spec   → produces spec.md → contributes to G1
/plan   → produces milestones.json → completes G1 prep
/audit  → produces audit report → contributes to G0.5
/design → produces design-tokens.json + section-map.json → contributes to G2
/qa     → produces QA report → contributes to G4
...
```

The orchestrator handles gate transitions. You confirm with `/confirm [gate-id]`.

---

## Cheat sheet (print this)

```
PROJECT LIFECYCLE
/start [platform] [type] [client]    Start new project
/resume [client]                      Resume existing
/status [client]                      Show status
/help                                 Show all commands

WORKFLOW STAGES
/audit                                Run audit (redesign/migration)
/clarify                              Request SOW clarification
/spec                                 Generate spec
/plan                                 Generate plan + milestones
/design-path                          Pick design path
/questionnaire                        Run brand questionnaire
/design                               Generate design system
/scaffold                             Initialize repo
/sprint [id]                          Start sprint
/qa [sprint-id]                       Run sprint QA
/regression [milestone-id]            Run milestone regression
/prelaunch                            Run pre-launch checks
/launch                               Execute launch
/handoff                              Generate handoff docs
/rollback                             Emergency rollback

GATES
/confirm [gate-id]                    Approve gate
/reject [gate-id] [reason]            Reject gate
/revise [gate-id] [change]            Revise gate
/renegotiate [gate-id] [reason]       Renegotiate (G1, G2 only)
/override [gate-id] [reason]          Emergency override

STATE + BUDGET
/cost                                 Project cost
/budget                               Budget status
/audit-log [limit]                    Show audit log
/bugs                                 Show open bugs

UPDATES (PM AGENT)
/update sprint [id]                   Sprint update
/update milestone [id]                Milestone update
/update [type]                        Other update types

SPECIFIC WORK
/review                               Manual code review trigger
/fix [bug-id]                         Route bug fix to dev agent
/verify-redirects                     Verify redirect map
/lighthouse [url]                     Lighthouse on URL

DIRECT AGENT INVOCATION
/agent [name] [task]                  Direct agent call

CLOSURE
/master-doc                           Generate master doc
/client-memory                        Generate client memory
/close                                Close project

WORKSPACE
/list-projects                        List active projects
/switch [client]                      Switch active project
/health                               System health check
```

---

## Tips

1. **Tab-complete works in many Claude Code setups.** Type `/` and pause — completions may show.

2. **Combine commands.** After `/start`, the orchestrator naturally guides you to `/spec` → `/plan` → etc. You don't always need to issue every command — orchestrator suggests the next.

3. **Shortcodes don't bypass gates.** `/launch` won't run if G6 isn't confirmed. The shortcode is sugar — the gate model is the constraint.

4. **When in doubt, `/status`.** It tells you what to do next.

5. **`/help` is real.** It lists available shortcodes inline.

---

## Adding new shortcodes

If your team needs additional shortcodes:

1. Identify the repeatable workflow
2. Add to this file
3. Add to orchestrator's session-start protocol (`_spine/orchestrator/knowledge/01-session-start-protocol.md`)
4. Bump tools version + changelog

Don't proliferate shortcodes for one-off operations. Keep the list manageable.

---

Last reviewed: 2026-05-25 by Claude (initial)
Next review due: 2026-08-25
