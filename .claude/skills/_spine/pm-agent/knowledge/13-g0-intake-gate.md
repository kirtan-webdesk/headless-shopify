---
tier: 1
load_when: ["intake", "g0-stage"]
description: "v1.5.2 Phase 2 — converts intake from \"checklist we hope gets filled\" to \"hard gate that blocks G1 progression\". Addresses Kitchen Blockers Gap 3 (social links mid-session, mid-project re-push)."
---

# 13 — G0 Intake Gate (Hard Gate)

> v1.5.2 Phase 2 — converts intake from "checklist we hope gets filled" to "hard gate that blocks G1 progression". Addresses Kitchen Blockers Gap 3 (social links mid-session, mid-project re-push).

---

## Why this exists

Kitchen Blockers pilot: Facebook/Instagram/TikTok URLs landed as a standalone message halfway through. Required a re-push to integrate. Same pattern for logo SVG (OI-07b) — open from kickoff, still pending at session end.

These items should have been captured at G0 and the project should NOT have progressed past G1 without them. The system didn't enforce — it relied on goodwill.

**G0 is now a hard gate. No G1 plan, no design path decision, no sprint scaffold until G0 artifacts are complete.**

---

## Required intake artifacts (must be in project workspace before G0 closes)

### Category 1 — Identity + brand
- [ ] Client legal name
- [ ] Client contact details (Internal PM only — populated into `client_contact_blocklist`)
- [ ] Brand guidelines (PDF or doc, even rough)
- [ ] Logo files (SVG primary, PNG fallback at min 2 sizes)
- [ ] Color palette (hex codes; primary, secondary, neutral)
- [ ] Typography (font names, weights, sources — Google Fonts / Adobe Fonts / custom)
- [ ] Taglines / brand voice samples

### Category 2 — Digital presence
- [ ] Live domain URL
- [ ] Staging URL (if exists)
- [ ] Social media URLs (Facebook, Instagram, TikTok, X, YouTube, LinkedIn — whichever apply)
- [ ] Existing email domain (for contact form routing)
- [ ] Existing analytics IDs (GA4, GTM, Meta Pixel, TikTok Pixel, etc.)
- [ ] Existing app integrations (list every app currently installed)

### Category 3 — Content references
- [ ] Aspirational sites (3-5 sites client likes; URLs only)
- [ ] Sites to avoid (1-3 sites client dislikes; helpful for tone)
- [ ] Existing brand assets the client wants to preserve
- [ ] Content sources for migration (CMS pages list, blog count, product count)

### Category 4 — Operational
- [ ] Internal PM contact (the only authorized client-facing channel)
- [ ] Project budget
- [ ] Target launch date
- [ ] Acceptable launch date range
- [ ] Hard deadlines (events, marketing campaigns, etc.)
- [ ] Geographic markets served (currency, languages, shipping zones)

### Category 5 — Technical access (when ready)
- [ ] Shopify store URL
- [ ] Shopify CLI theme token (or PM-mediated access plan)
- [ ] GitHub repo access plan
- [ ] Domain registrar access plan
- [ ] DNS access plan
- [ ] Existing analytics platform access plan

Category 5 can be partial at G0 — but the plan for getting access must exist.

### Category 6 — Required compliance / restrictions
- [ ] `client_contact_blocklist` populated in project.json (FLAG-004 enforcement)
- [ ] Manual config items identified (shipping, payments, tax — per INT-002)
- [ ] Sensitive paths flagged for senior dev review (per SEC-003)
- [ ] Any client-specific "do not" rules surfaced and documented

---

## Hard gate behavior

When orchestrator attempts to transition project from `intake` → `planning` (i.e., propose G0 confirmation):

```pseudo
function check_g0() {
  artifacts = read_intake_artifacts(project)
  missing = []

  for category in [Identity, DigitalPresence, ContentReferences, Operational, TechnicalAccess, ComplianceRestrictions]:
    for required_item in category.required:
      if not artifacts.has(required_item):
        missing.append(required_item)

  if missing:
    return BLOCK("G0 cannot close. Missing: " + missing)
  return ALLOW
}
```

**No bypass via "we'll get it later". Bypass requires explicit OVERRIDE in audit_log with:**
- Reason (e.g., "Client travel — committed to provide by [date]")
- Approver (Tech Lead or Pilot Lead, not the requester)
- Expiration (when the missing item MUST be provided)
- Risk acknowledgment

The override is auto-revoked at expiration. If item still missing → project halts.

---

## Intake artifact storage

All intake artifacts live in:

```
/projects/[client-slug]/intake/
  identity/
    brand-guidelines.pdf
    logo.svg
    logo-512.png
    logo-1024.png
    color-palette.json
    typography.json
  digital-presence/
    social-urls.json
    analytics-ids.json
    existing-apps.json
  content/
    aspirational-sites.md
    content-migration-plan.md
  operational/
    pm-contact.json
    budget-and-timeline.json
  technical-access/
    access-plan.md
  compliance/
    blocklist.json (mirrors project.json.client_contact_blocklist)
    manual-config-items.md
    sensitive-paths.md
  intake-completion-checklist.md
```

PM Agent populates the checklist file and updates it as items arrive.

---

## Step 0 — Read `sow-spec.md` first (D-PM-04, v1.11.0)

> Before running the discovery interview, check whether the SOW Builder has already produced a spec file. If yes, most intake fields are pre-filled.

### Procedure

1. Check for `outputs/<client_slug>/sow-spec.md` at session start.
2. If present:
   - Read the YAML frontmatter and ingest the structured fields.
   - Read the body sections (project summary, module-by-module scope, required-from-client, out-of-scope, risks-and-assumptions, rewrites-applied).
   - Map fields to the 6 G0 intake categories below.
3. If NOT present:
   - Fall back to the full 100+ question intake (legacy behavior, see "Discovery protocol" below).

### Fields the spec file provides (skip these in the interview)

Pre-filled by SOW Builder — DO NOT re-ask:

| Spec frontmatter field | Maps to G0 category |
|------------------------|---------------------|
| `client_legal_name`, `client_dba`, `client_slug` | Identity + brand (partial) |
| `current_website` | Digital presence (partial) |
| `platform`, `plan_tier`, `project_type` | Operational (partial) |
| `target_launch_date`, `hard_deadlines` | Operational (partial) |
| `total_hours`, `total_cost_usd`, `payment_terms_template` | Operational (partial) |
| `internal_pm_name`, `internal_pm_email` | Operational (partial) |
| `design.tool` (locked to HTML) | Compliance (D-DES-01) |
| `design.mockup_revisions_homepage`, `design.mockup_revisions_other_pages` | Compliance |
| `flag_004_blocklist` (full block) | Compliance (FLAG-004) |
| Module-by-module scope | Project scope (replaces "what are we building?") |
| Out-of-scope list | Project scope |
| Required-from-client list | Replaces ad-hoc asset request |

### Fields the spec file does NOT provide (ASK these in the abbreviated interview)

These are not part of the SOW; ask the sales person OR Internal PM:

1. **Hosting provider + plan confirmation.** SOW recommends; client confirms at G0.
2. **GitHub repo URL.** WebDesk creates; check if client has existing repo.
3. **Credentials handoff protocol.** 1Password / Vault / secure email — confirm secure channel.
4. **Exact app/plugin list with versions + plan tiers.** SOW lists apps; G0 confirms versions.
5. **Brand assets locations.** Dropbox / Drive / email — where the actual SVG/PNG/copy files live.
6. **Third-party integrations list.** Zapier / CRM / email tool / analytics IDs — beyond what SOW captured.

That's ~6 questions, not 100+.

### Surface to developer at session start

```
SOW spec detected at outputs/{{slug}}/sow-spec.md.
Pre-filled from spec: 85% of intake.

Outstanding (6 items):
  1. Hosting provider confirmed?
  2. GitHub repo URL?
  3. Credentials handoff protocol?
  4. App versions + plan tiers?
  5. Brand assets locations?
  6. Third-party integrations + analytics IDs?

Proceed with abbreviated intake? [Y/full intake/cancel]
```

User picks `Y` → ask only the 6 remaining.
User picks `full intake` → run the legacy 100+ question interview anyway.

### Validation on spec ingestion

Before trusting the spec, run these checks:

1. `design.tool == "HTML"` (else hard refuse — D-DES-01 violation in the SOW)
2. `flag_004_blocklist.emails` has ≥ 1 entry (else surface as missing — FLAG-004 not operational)
3. `internal_pm_email` matches `*@webdesksolution.ca` (else flag — internal PM must be WebDesk)
4. `platform` matches the project repo's expected platform
5. `total_hours` matches `spreadsheet.total_hours_declared` (validation flag in spec)
6. `validation.status == "passed"` (if not, surface the failed checks before proceeding)

If any check fails: halt, surface to developer, do NOT proceed to discovery.

### Audit trail

When Step 0 ingests a spec successfully, log to `intake/spec-ingestion.log`:

```
2026-08-15T10:30:00Z — Ingested sow-spec.md (sow-builder@1.0, spec_version 1.0)
  Pre-filled fields: 28
  Outstanding fields: 6
  Validation status: passed
  Rewrites in spec: 2 (audited)
```

---

## Discovery protocol (refined)

> **v1.11.0 note:** If Step 0 (above) successfully ingested a `sow-spec.md`, skip the bulk of this interview and ask only the 6 outstanding fields. The full interview below is the legacy fallback used when no SOW spec exists.

PM Agent runs intake interview, asks questions in one batched session at G0 kickoff:

```
WebDesk Solution — Project Intake — [Client Name]
Internal PM: [name]
Date: [date]

I need these artifacts before we can plan the project. Provide what you have now; flag what's pending.

IDENTITY + BRAND
  - Client legal name?
  - Brand guidelines doc/PDF? [attach]
  - Logo files (SVG + 2 PNG sizes)? [attach]
  - Color palette (hex codes)?
  - Typography (font names + sources)?
  - Tagline / brand voice samples?

DIGITAL PRESENCE
  - Live domain?
  - Social URLs (FB, IG, TikTok, X, YT, LinkedIn — list all that apply)?
  - Analytics IDs (GA4, GTM, Meta Pixel, TikTok Pixel)?
  - Existing apps installed on the store?

CONTENT REFERENCES
  - 3-5 aspirational sites client admires?
  - 1-3 sites to avoid?
  - Existing assets to preserve?
  - Content to migrate (blog count, CMS pages list, product count)?

OPERATIONAL
  - Internal PM contact (the only client-facing channel)?
  - Project budget?
  - Target launch date + acceptable range?
  - Hard deadlines?
  - Markets served?

TECHNICAL ACCESS PLAN
  - Shopify store URL?
  - Plan for getting CLI theme token?
  - GitHub repo plan?
  - Domain registrar access plan?
  - DNS access plan?

COMPLIANCE
  - Client emails to add to client_contact_blocklist (FLAG-004)?
  - Manual config items (shipping/payments/tax)?
  - Sensitive paths needing senior review?
  - Any "do not" rules specific to this client?
```

Saved as `/projects/[client-slug]/intake/intake-interview-completed.md`.

---

## Behavior when intake is partial

If 80%+ artifacts present, G0 can close with:
- Open Items log capturing the rest
- Each open item has owner + due date
- Auto-escalates to Internal PM if due date passes

If <80% present, G0 stays open — no G1 progression.

The 80% threshold is approximate; PM Agent uses judgment on which items are critical (Category 1, 2, 6 are usually hard requirements; Category 5 can lag).

---

## Surfaces the gate prevents

Patterns this gate would have prevented in Kitchen Blockers:

| Gap | Prevented by category |
|-----|----------------------|
| Social URLs mid-session re-push | Category 2 — Social URLs required at G0 |
| Logo SVG outstanding to launch | Category 1 — Logo files required at G0 |
| Mid-project FLAG-004 enforcement manual | Category 6 — blocklist required at G0 |
| Content migration reactive | Category 3 — Content migration plan required at G0 |
| Shipping config surprise | Category 6 — Manual config items required at G0 |
| Mid-project Node version errors | Tier A `check-env.sh` covers this — pre-flight before any G1 work |

---

## Milestone-wise (NOT sprint-wise) documentation (v1.5.2 decision)

Reinforcement of the user's decision from pilot review:

- **Sprint documentation:** maintained internally as working memory, NOT distributed externally
- **Milestone documentation:** the deliverable. Internal PM presents this to client. Format per `08-update-document-templates.md`

Delivery Head's update document templates reflect this — milestone updates are formal deliverables, sprint updates are working state.

Per K4 / v1.5.2 — `08-update-document-templates.md` to be revised in this phase to remove sprint-update template and strengthen milestone-update template.

---

## Integration points

- Orchestrator's `01-session-start-protocol.md` — Step 2A (new project init) routes to G0 intake; cannot bypass.
- PM Agent's `11-discovery-protocol.md` — uses this gate as the spec.
- `04-gate-format.md` in `_contracts/` — G0 gate decision format updated to reference this file.
- `docs/planning/pm-clarification-questions.md` — feeds the intake interview content.

---

## Anti-patterns

1. **"Let's start building, we'll get the assets later."** This is exactly what Kitchen Blockers did. Cost was real even if not fatal. Don't.

2. **Filling in fake/placeholder values to pass the gate.** PM Agent should detect obviously-placeholder values (lorem ipsum, "TBD", empty objects) and reject.

3. **Internal PM doesn't actually know the answers.** That's not a gate failure — that's an Internal PM training gap. PM Agent surfaces; doesn't fix.

4. **Overriding the gate "just this once" repeatedly.** Track override frequency. If > 1 override per pilot, the gate is too strict (refine criteria) OR the team isn't doing intake (cultural fix).

5. **Treating Category 5 as optional forever.** Technical access can lag G0 but must arrive before G3 (scaffold) at the latest. Otherwise build can't proceed.

---

Last reviewed: 2026-05-27 by Claude (v1.5.2 Phase 2)
Next review due: 2026-08-27
