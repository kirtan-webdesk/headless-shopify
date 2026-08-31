---
tier: 2
load_when: ["agent-specific-detail"]
description: "How the PM Agent breaks an approved spec into milestones and sprints. Defines what \"good\" milestone structure looks like, payment-trigger logic, and structure rules."
---

# 03 — Milestone Framework

> How the PM Agent breaks an approved spec into milestones and sprints. Defines what "good" milestone structure looks like, payment-trigger logic, and structure rules.

---

## Definitions

- **Milestone:** A meaningful chunk of project delivery that has its own client-facing artifact and (usually) a payment trigger. Example: "Homepage + Navigation complete + design approved" or "Migration data parity verified."
- **Sprint:** A 3-5 day unit of focused work within a milestone, with defined scope and testable acceptance criteria. Example: "Build hero section + announcement bar + sticky header."
- **Sub-task:** Individual work items within a sprint. Lives in PM tool (Podio), not in milestones.json.

---

## Milestone structure rules

1. **Each milestone has a client-visible outcome.** Not "set up base theme" (that's internal). Yes "homepage reviewable on staging" (client-visible).

2. **Each milestone has a payment trigger (if project is milestone-billed).** Note in milestones.json which milestone releases which percentage of payment.

3. **Milestones group sprints by theme, not by phase.** Group sprints that deliver one outcome together. Example:
   - Good: "M2: Product experience" = Sprint(PDP template) + Sprint(Cart) + Sprint(Variant picker)
   - Bad: "M2: All Frontend" = Sprint(everything frontend)

4. **Milestones are sequential by default.** Each milestone gates the next. Parallel milestones only in parallel-tracks projects (migration, b2b).

5. **Milestone duration: typically 2-6 weeks.** Too short (< 1 week) = milestone overhead exceeds delivery value. Too long (> 8 weeks) = too much at stake at one gate.

---

## Typical milestone structures by project type

### New Build (ecommerce)

```
M1: Discovery + Design + Plan approval
M2: Foundation (theme scaffold + core layout + navigation + footer)
M3: Product experience (PDP + cart + variant logic)
M4: Collection + search (PLP + filters + sorting)
M5: Conversion flow (checkout + accounts + post-purchase)
M6: Content + integrations (blog + email + reviews + analytics)
M7: Pre-launch (SEO + performance + QA + handoff)
```

### Redesign (existing platform, new look)

```
M1: Design system audit + new design tokens approval
M2: Homepage + navigation redesign
M3: Product + collection page redesigns
M4: Cart + checkout polish + account pages
M5: Content + blog + utility pages
M6: SEO preservation + 301 redirects (if any) + analytics retest
M7: Pre-launch QA + handoff
```

### Migration (cross-platform)

Parallel tracks structure:

```
Pre-work: Discovery + spec approval + plan approval (G0.5 + G1)

Parallel tracks (run simultaneously):
  Track A — Design:
    M-A1: Design tokens approval
    M-A2: Homepage redesign on new platform
    M-A3: PDP + Collection redesigns
    M-A4: Cart + checkout

  Track B — Data Migration:
    M-B1: Data audit + field mapping approval
    M-B2: Sample data migration + parity check
    M-B3: Full data migration + verification

  Track C — URL/SEO:
    M-C1: URL inventory + redirect strategy approval
    M-C2: 301 redirect map generation
    M-C3: SEO preservation verification

Convergence:
  M-conv: Integration QA (all tracks merged on staging)
  M-launch: Pre-launch + cutover + post-launch monitoring
```

### Headless Build

```
M1: Architecture decision + tech stack approval (variant choice)
M2: API contract definition + design tokens
M3: SSR / SSG setup + critical pages (homepage + PDP)
M4: Collection + search + cart flow
M5: Checkout + integrations + API hardening
M6: Performance optimization + content
M7: Pre-launch + cutover
```

### B2B Commerce (when B2B is primary scope)

```
M1: Discovery + B2B requirements + plan approval
M2: Customer hierarchy + accounts (companies, users, roles)
M3: Catalog + custom pricing + NET terms setup
M4: Quote-to-cart workflow + approval flows
M5: B2B checkout + invoicing + integration with ERP
M6: Storefront design + UX
M7: Pre-launch + B2B-specific QA + handoff
```

### Version Upgrade Only (no redesign)

```
M1: Compatibility audit + deprecations inventory
M2: Staging clone + upgrade in staging
M3: Regression QA + fix list
M4: Production cutover + verification
```

(Shorter timeline. Often 2-4 weeks total.)

### Version Upgrade + Redesign (combined)

```
M1: Compatibility audit + design system audit + plan
M2: New design tokens approval
M3: Homepage + nav redesign on upgraded platform
M4: Product + collection redesigns
M5: Cart + checkout + integrations
M6: Regression QA + SEO preservation
M7: Pre-launch + cutover
```

---

## Sprint structure within milestones

See `06-sprint-rules.md` for sprint rules. Brief:

- Sprint = 3-5 working days
- Max 3 sections (Shopify), 3 templates (WP), 3 features (custom)
- Each sprint has 3-7 acceptance criteria
- Each sprint ends with QA gate (G4)
- Sprints within a milestone run sequentially (unless project type allows parallel)

Example milestone broken into sprints:

```
M2: Foundation (Shopify Redesign)
  S2.1: Theme scaffold + base layout settings + brand tokens applied
  S2.2: Header + sticky nav + mobile hamburger
  S2.3: Footer + newsletter signup + social links
  S2.4: Announcement bar + homepage hero
  S2.5: Foundation QA + responsive sweep (sprint-level QA)

Milestone QA (G5): Full M2 regression — all sprints integrated, no regressions
Milestone CONFIRM (G5 passed) → advance to M3
```

---

## Payment-trigger milestones

For milestone-billed projects, note payment release per milestone in milestones.json:

```json
{
  "milestones": [
    {
      "id": "M1",
      "name": "Discovery + Design Approval",
      "payment_trigger": {
        "percent": 25,
        "amount_usd": 5000,
        "released_on": "milestone_confirmed"
      }
    },
    {
      "id": "M2",
      "name": "Foundation",
      "payment_trigger": null
    },
    {
      "id": "M5",
      "name": "Conversion flow",
      "payment_trigger": {
        "percent": 25,
        "amount_usd": 5000,
        "released_on": "milestone_confirmed"
      }
    },
    {
      "id": "M7",
      "name": "Pre-launch + Handoff",
      "payment_trigger": {
        "percent": 50,
        "amount_usd": 10000,
        "released_on": "client_signoff_post_launch"
      }
    }
  ]
}
```

Typical payment patterns:
- 25% on signing
- 25-50% on design approval (M1 or M2)
- 25% at midpoint milestone
- 25-50% on launch

Adapt to client. Document in spec + milestones.json.

---

## Anti-patterns (don't do these)

1. **Milestones too small.** "M1: Setup git repo" is not a milestone. It's a sub-task.

2. **Milestones too large.** "M1: All design and development" — no client visibility, no accountability.

3. **Milestones not client-visible.** "M3: Refactor section schema" — client doesn't care, can't approve.

4. **Sprints inside milestones that span weeks.** Sprints are 3-5 days. If a "sprint" is 2 weeks, split it.

5. **Sprints without acceptance criteria.** "Build cart" is not enough. Acceptance criteria: "Cart updates without page reload, drawer opens with correct line items, mini-cart count updates on add."

6. **Mixing project types in one milestone.** Don't put migration data work + new design work in the same milestone unless tracks are explicit.

7. **No QA milestone.** Every project needs a pre-launch QA milestone. Skipping = bad launch.

---

## Milestone structure validation

Before writing milestones.json:

```
for each milestone:
    [ ] Has a client-visible name (not internal jargon)
    [ ] Has acceptance criteria at milestone level
    [ ] Contains 1-5 sprints
    [ ] Has payment trigger if project is milestone-billed
    [ ] Has estimated duration 2-6 weeks
    [ ] References specific deliverables from spec
    [ ] Has at least one human gate (sprint QA or milestone QA)
```

If any check fails, refine before writing.

---

## Output

`/projects/[client]/milestones.json`:

```json
{
  "milestones": [
    {
      "id": "M1",
      "name": "Discovery + Design Approval",
      "description": "...",
      "due_date": "2026-06-15",
      "spec_deliverables_covered": ["D1", "D2"],
      "sprints": [
        {
          "id": "S1.1",
          "name": "Discovery questionnaire + competitor audit",
          "scope": "...",
          "acceptance_criteria": [...]
        }
      ],
      "estimated_hours": 80,
      "payment_trigger": {...},
      "status": "pending"
    }
  ]
}
```

Also reflected in `project.json.milestones[]` (lighter version for orchestrator quick access).

---

Last reviewed: 2026-05-24 by Claude (initial)
Next review due: 2026-08-24
