---
tier: 2
load_when: ["agent-specific-detail"]
description: "How the PM Agent estimates effort and flags scope vs. timeline mismatches. Estimates are draft inputs for human review, not final word."
---

# 04 — Estimation Framework

> How the PM Agent estimates effort and flags scope vs. timeline mismatches. Estimates are draft inputs for human review, not final word.

---

## What the PM Agent estimates

For each sprint and milestone:
- **Effort in hours** (total)
- **Confidence level** (low / medium / high)
- **Breakdown by role** (frontend / backend / design / QA / PM)

For the project total:
- **Total estimated weeks** (assuming team capacity)
- **vs. SOW timeline** (on-track / tight / overrun)
- **Renegotiation flag** if overrun > 10%

---

## Estimation method

The PM Agent does NOT predict actual effort. It produces a **best-guess based on standard patterns**, with explicit confidence level. Final estimates are calibrated by the human PM against actual team velocity.

### Step 1 — Identify task patterns

Each deliverable or sprint maps to a known pattern. Standard patterns:

| Pattern | Description | Typical hours |
|---------|-------------|---------------|
| Section build (standard) | Hero, product grid, FAQ, testimonial | 4-8 |
| Section build (complex) | Configurator, mega-menu, dynamic filter | 12-24 |
| Page template (new) | Homepage, PDP, PLP, account | 16-32 |
| App integration (standard) | Klaviyo, Judge.me, Google Analytics | 4-8 |
| App integration (complex) | Recharge subscription, custom ERP, B2B platform | 16-40 |
| Webhook + custom logic | Auto-tagging, custom workflows | 8-16 |
| Migration script (per data type) | Products, customers, orders, blog | 4-16 |
| URL redirect map | Per 100 URLs | 2-4 |
| SEO baseline setup | Schema, meta, sitemap, GSC | 6-12 |
| Performance optimization pass | Image, JS, CSS, fonts | 8-16 |
| Accessibility audit + fixes | Per page | 4-8 |
| QA cycle (per sprint) | All 8 modules | 4-8 |
| Discovery (full) | Research, audit, stakeholder interviews | 24-48 |
| Design system token generation | Colors, type, spacing, breakpoints | 8-16 |
| Section visual mockup | Per section | 4-12 |
| Code review (per PR) | AI + human | 1-3 |

These are baseline patterns. Adjust based on:
- Platform complexity (Shopify standard < Magento custom < headless from scratch)
- Designer involvement (token-driven vs. custom Figma per section)
- Integration depth (out-of-box vs. custom)

### Step 2 — Sum sprint estimates

For each sprint, identify the patterns and sum hours. Add buffers:
- 15% for sprint coordination overhead
- 10% for QA cycles within sprint
- 5% for revision rounds

### Step 3 — Sum milestone estimates

Total milestone hours = sum of sprint hours + milestone-level overhead (PM coordination, gate reviews, regression QA at milestone close).

Add 10% milestone overhead.

### Step 4 — Convert to weeks

Use team capacity model:

```
Effective capacity per dev per week = 28 hours
(40 hours nominal - 6 hours meetings/admin - 6 hours context-switching/learning)

Project capacity per week = num_devs_allocated × 28
```

For a project with 2 devs allocated:
- Project capacity = 56 hours/week
- 200 estimated hours → 200 / 56 = 3.6 weeks

Always round UP. (3.6 weeks → 4 weeks.)

### Step 5 — Compare to SOW timeline

```
sow_weeks = spec.timeline_weeks
estimated_weeks = calculated above
ratio = estimated_weeks / sow_weeks

if ratio <= 0.9:        vs_sow_timeline = "on-track" (room to spare)
if 0.9 < ratio <= 1.1:  vs_sow_timeline = "tight"
if ratio > 1.1:         vs_sow_timeline = "overrun"
    renegotiation_flagged = true
    renegotiation_reason = "Estimated [N] weeks vs SOW [M] weeks (variance [X]%)"
```

If overrun > 1.5x: HALT. Surface to developer: "SOW timeline is fundamentally unrealistic. Need renegotiation before proceeding."

---

## Confidence levels

Every estimate has a confidence rating.

### High confidence
- Project pattern matches a previous WebDesk project closely
- All scope dimensions clear
- Team has done this exact work before
- No major unknowns

### Medium confidence
- Project pattern is familiar but some specifics differ
- Some scope dimensions still being clarified
- 1-2 medium unknowns (integration not used before, design style new)

### Low confidence
- Novel project type or platform combination
- Major unknowns (custom integration with no docs, undefined custom feature)
- Multiple SOW gaps still open
- Migration with large data volumes from unfamiliar source

**When confidence is low, do not produce point estimates. Produce ranges.**

Example:
- High confidence: "M1: 80 hours"
- Medium confidence: "M1: 80-110 hours"
- Low confidence: "M1: 60-150 hours, recommend discovery to narrow"

---

## What estimates DON'T account for

Be honest in the estimate output:

```
NOT INCLUDED in this estimate:
- Client-side delays (content delivery, review turnaround)
- Holidays or team PTO
- Scope creep (handled via change requests)
- Bugs discovered post-launch (covered by warranty period)
- Onboarding new team members mid-project
- External dependencies (third-party API changes, vendor delays)
```

Include this disclaimer in the estimate output.

---

## Effort distribution by role

For each milestone, break down hours by role:

```json
{
  "estimated_hours_total": 80,
  "by_role": {
    "frontend_dev": 40,
    "backend_dev": 16,
    "designer": 12,
    "qa": 8,
    "pm": 4
  },
  "confidence": "medium"
}
```

This helps PM identify resource conflicts ("we don't have 40 designer hours available this milestone").

---

## Output to project.json

```json
"estimates": {
  "total_hours": 480,
  "total_weeks": 8,
  "by_milestone": [
    {
      "milestone_id": "M1",
      "estimated_hours": 80,
      "by_role": {...},
      "confidence": "medium"
    }
  ],
  "confidence": "medium",
  "sow_timeline_weeks": 8,
  "vs_sow_timeline": "tight",
  "renegotiation_flagged": false,
  "renegotiation_reason": null
}
```

If `renegotiation_flagged: true`, the developer MUST address before G1 (plan approval) can proceed.

---

## Adjustment after actuals

When sprints close, the QA Agent records `actual_hours` for each sprint. PM Agent reads these to improve estimates for future sprints in the same project, and for future projects.

After project closes, the master doc (chunk 2) includes estimation accuracy:
```
Estimated total: 480 hours
Actual total:    540 hours
Variance:        +12.5%
```

This feeds back to future estimates.

---

## Estimation anti-patterns

1. **Single-number estimates for low-confidence work.** Use ranges.

2. **Padding estimates without showing the buffer.** Estimate honestly + add transparent buffer.

3. **Estimating in days when sprints are days.** Estimate in hours. Convert to days/weeks at the end.

4. **Ignoring role distribution.** "200 hours" is meaningless without knowing who does what.

5. **Not flagging overrun.** Hoping the team "makes it work" is how projects fail.

6. **Estimating without a confidence level.** Confidence is the most important field.

7. **Not learning from actuals.** After 3-5 projects, calibrate patterns based on actual data.

---

## Special cases

### Migrations
Add 30-50% on top of new-build estimates for migrations of the same scope. Migration verification (parity, redirect QA) is intensive.

### Headless
Add 40-60% on top of standard ecommerce builds. Architecture decisions + API contracts + SSR/SSG add real time.

### Magento
Add 30% on top of equivalent Shopify estimates. Platform overhead is real (module compilation, DI, layout XML).

### B2B
Add 30-50% on top of equivalent B2C estimates. B2B has more flows, more roles, more edge cases.

These adjustments are platform/type-specific multipliers applied AFTER base pattern estimation.

---

## Renegotiation surface format

When `renegotiation_flagged: true`, PM Agent surfaces to developer:

```
═════════════════════════════════════════════════════════════════
ESTIMATION FLAG — Scope vs Timeline Mismatch
═════════════════════════════════════════════════════════════════

Project: [name]
SOW timeline:       [X] weeks
Estimated timeline: [Y] weeks
Variance:           +[Z]% ([Y-X] weeks over)
Confidence:         [medium/high]

Driving the overrun:
- [Specific milestone/scope item]: estimated [N] hours, SOW implies [M]
- [Another item]: ...

Recommended action:
A. RENEGOTIATE timeline (push launch by [Z] weeks)
B. RENEGOTIATE scope (remove [specific items] to fit timeline)
C. INCREASE team capacity (add [X] devs to maintain timeline)
D. ACCEPT TIGHT (sign off knowing it's tight; risk shown)

═════════════════════════════════════════════════════════════════
```

Decision is human's. PM Agent presents, doesn't decide.

---

Last reviewed: 2026-05-24 by Claude (initial)
Next review due: 2026-08-24
