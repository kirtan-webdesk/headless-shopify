---
tier: 3
load_when: ["human-reference-only"]
description: Per-project memory file. Lives at the root of every client project repository. Claude Code auto-loads CLAUDE.md from the project root on every session start. This file is the canonical place for project-level memory and the bridge to sow-spec.md.
applies_to: ["all"]
decision_refs: ["D-MEMORY-01"]
---

# CLAUDE.md Template — v1.11.0

> Copy this file to the root of every project repository as `CLAUDE.md`. Claude Code auto-loads it on session start. Replace `{{...}}` placeholders with real values during G0 setup.

---

## How to use this file

1. PM Agent generates this file at G0 from the intake / spec data.
2. Updated at every gate transition (G0, G0.5, G1, G2, G3, G4, G5, G6).
3. Updated when a major decision is made (recorded as a new entry under "Recent decisions").
4. Updated when a blocker is opened or resolved.
5. Read by EVERY agent at the start of EVERY session.

The file MUST stay under 300 lines. If it grows beyond that, split older entries into `docs/handoff-log-<date>.md` and keep only the current state here.

---

## Project identity

- **Client:** {{client_legal_name}}
- **DBA:** {{client_dba}}
- **Slug:** {{client_slug}}
- **Current website:** {{current_website}}
- **Project type:** {{project_type}}    <!-- redesign / new-build / version-upgrade / migration / b2b-wholesale-setup / multi-region-multi-store-setup -->
- **Platform:** {{platform}}              <!-- shopify / shopify-plus / wordpress / woocommerce / bigcommerce / magento / adobe-commerce -->
- **Plan tier:** {{plan_tier}}
- **Target launch date:** {{target_launch_date}}
- **Hard deadlines:** {{hard_deadlines}}   <!-- list, or "none" -->

---

## SOW + Spec references

- **SOW client doc:** `outputs/{{client_slug}}/sow-client.md`
- **SOW spec (AI-facing):** `outputs/{{client_slug}}/sow-spec.md`
- **Intake YAML:** `outputs/{{client_slug}}/inputs/intake.yaml`
- **Estimation spreadsheet:** `outputs/{{client_slug}}/inputs/estimation.csv`

PM Agent reads `sow-spec.md` at G0 Step 0 — frontmatter pre-fills ~85% of intake fields.

---

## Team

- **Internal PM:** {{internal_pm_name}} <{{internal_pm_email}}>
- **WebDesk Designer:** {{webdesk_designer}}
- **WebDesk Dev Lead:** {{webdesk_dev_lead}}
- **WebDesk QA Lead:** {{webdesk_qa_lead}}

**Client primary contact:** see `flag_004_blocklist` in `sow-spec.md`. NEVER contact directly — route all comms through Internal PM (FLAG-004, COMM-005).

---

## Current gate state

- **Current gate:** {{current_gate}}    <!-- G0 / G0.5 / G1 / G2 / G3 / G4 / G5 / G6 / post-launch -->
- **Gate entered at:** {{current_gate_started}}
- **Next gate target:** {{next_gate_target_date}}
- **Last completed gate:** {{last_completed_gate}} at {{last_completed_gate_date}}

### Gate completion log

| Gate | Status | Completed | Sign-off |
|------|--------|-----------|----------|
| G0 — Intake | {{g0_status}} | {{g0_date}} | {{g0_signoff}} |
| G0.5 — Audit | {{g0_5_status}} | {{g0_5_date}} | {{g0_5_signoff}} |
| G1 — Plan | {{g1_status}} | {{g1_date}} | {{g1_signoff}} |
| G2 — Design (HTML mockups) | {{g2_status}} | {{g2_date}} | {{g2_signoff}} |
| G3 — Scaffold | {{g3_status}} | {{g3_date}} | {{g3_signoff}} |
| G4 — Sprint QA | {{g4_status}} | {{g4_date}} | {{g4_signoff}} |
| G5 — Milestone | {{g5_status}} | {{g5_date}} | {{g5_signoff}} |
| G6 — Pre-launch | {{g6_status}} | {{g6_date}} | {{g6_signoff}} |

---

## Recent decisions (most recent first)

Format: `[YYYY-MM-DD] [Decision code if applicable] — one-line summary. Source: who/where.`

- _(empty at G0; PM Agent appends each decision as it's locked)_
- {{decision_3}}
- {{decision_2}}
- {{decision_1}}

For full decision history beyond the last 5-10, see `docs/decision-log.md`.

---

## Open blockers

Format: `[priority] [opened-date] — description. Owner: who. Target unblock: date.`

- _(empty if none)_
- {{blocker_1}}
- {{blocker_2}}

PM Agent reviews this list at every G4 sprint review and surfaces stale blockers (open >7 days).

---

## Required-from-client (status)

| Item | Due | Status |
|------|-----|--------|
| Logo (vector + raster) | {{logo_due}} | {{logo_status}} |
| Brand color palette | {{brand_colors_due}} | {{brand_colors_status}} |
| Product photography | {{photography_due}} | {{photography_status}} |
| Page content / copy | {{copy_due}} | {{copy_status}} |
| Hosting credentials | {{hosting_due}} | {{hosting_status}} |
| DNS access | {{dns_due}} | {{dns_status}} |
| Existing site admin access | {{existing_admin_due}} | {{existing_admin_status}} |

Status legend: `pending` / `received` / `partial` / `overdue`.

---

## Design tool

- **Tool:** HTML
- **Rationale:** D-DES-01 — HTML mockups only. No Adobe XD / Figma / Sketch / PSD as deliverable.
- **Homepage revisions allowed:** {{mockup_revisions_homepage}}
- **Other-page revisions allowed:** {{mockup_revisions_other_pages}}
- **Mockup files location:** `mockups/` in this repo

---

## Platform configuration

- **Platform:** {{platform}}
- **Plan tier:** {{plan_tier}}
- **Hosting:** {{hosting_provider}}
- **Theme baseline:** {{theme_baseline}}                <!-- e.g., vanilla-wp+custom (D-WP-01), Underscores (_s), Dawn, etc. -->
- **Repo URL:** {{repo_url}}
- **Branch strategy:** main + per-milestone branches (see `git-branch-strategy.md`)
- **Local dev URL:** {{local_dev_url}}
- **Staging URL:** {{staging_url}}
- **Production URL (not yet live for new-builds):** {{production_url}}

---

## Apps / plugins installed

| App / plugin | Version | License | Notes |
|--------------|---------|---------|-------|
| {{app_1}} | {{ver_1}} | {{license_1}} | {{notes_1}} |
| {{app_2}} | {{ver_2}} | {{license_2}} | {{notes_2}} |

INT-002 applies: shipping / payment / tax configuration is ALWAYS manual. AI does not auto-configure.

---

## Active tasks (this sprint)

Format: brief description, owner, due date.

- {{task_1}}
- {{task_2}}
- {{task_3}}

Detail in `tasks/` directory or external PM tool (Linear / Asana / etc. per project).

---

## Session log pointer

Last session ended at: {{last_session_end_timestamp}}
Last session summary: `docs/session-handoffs/{{last_session_handoff_filename}}`

Per `session-handoff-protocol.md`, every session ends with a HANDOFF.md update. Read the latest handoff before starting work.

---

## What this file does NOT contain

- Client emails / phones / handles → those live in `sow-spec.md` `flag_004_blocklist` only
- Code or full design specs → those live in their respective directories
- Long decision rationale → only one-line summaries here; full rationale in `docs/decision-log.md`
- Sprint-level tasks → those live in your PM tool
- Test results → those live in `docs/qa-reports/`

This file is INDEX + LATEST STATE only. Keep it under 300 lines.

---

Last touched: {{last_touched_timestamp}}
Touched by: {{last_touched_by}}
