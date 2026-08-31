---
template_type: data-audit-report
applies_to: [all]
last_reviewed: 2026-06-03
---
# Data Audit Report — [Project Name]

**Source platform:** [name + version]
**Target platform:** [name + version]
**Auditor:** Content & Migration Agent v1.0
**Audit date:** [date]
**Project ID:** [project-id]

---

## Executive Summary

[3-5 sentences covering: total data scope, major findings, recommended approach, key risks]

---

## Scope

### Data types in scope (per SOW Q15)

- [ ] Products
- [ ] Variants
- [ ] Categories / Collections
- [ ] Customers
- [ ] Orders (date range: [start - end])
- [ ] Reviews
- [ ] Blog posts
- [ ] CMS pages
- [ ] Subscription contracts
- [ ] Gift cards
- [ ] Customer accounts (passwords)
- [ ] Loyalty / rewards
- [ ] Other: [specify]

### Data types out of scope (explicitly excluded)

- [ ] [Type 1]: reason
- [ ] [Type 2]: reason

---

## Source Platform Inventory

### Record counts

| Data type | Source count | Active | Inactive | Notes |
|-----------|-------------:|-------:|---------:|-------|
| Products | [N] | [N] | [N] | |
| Variants | [N] | [N] | [N] | |
| Categories | [N] | [N] | [N] | hierarchy depth: [N] |
| Customers | [N] | [N] | [N] | duplicates: [N] |
| Orders | [N] | [N] | [N] | date range: [start - end] |
| Reviews | [N] | [N] | [N] | |
| Blog posts | [N] | [N] | [N] | |
| CMS pages | [N] | [N] | [N] | |
| Subscription contracts | [N] | [N] | [N] | active: [N] |

### Volume considerations

- Total records: [N]
- Estimated migration time: [N] hours (per platform API quotas)
- Estimated parity verification time: [N] hours

---

## Data Quality Assessment

### Sample size

- Products: [N] sampled
- Customers: [N] sampled
- Orders: [N] sampled
- Reviews: [N] sampled

### Quality issues identified

#### Critical (must address before migration)

1. **[Issue 1]:** [Description + count of affected records]
   - **Impact:** [What happens if not addressed]
   - **Resolution:** [Recommended approach]

2. **[Issue 2]:** ...

#### Important (address during migration)

1. **[Issue 1]:** ...

2. **[Issue 2]:** ...

#### Minor (note, may be acceptable)

1. **[Issue 1]:** ...

#### Out-of-scope but observed

1. **[Observation 1]:** ...

---

## Schema Analysis

### Source schema notes

- **Products:** [observations about source product structure]
- **Customers:** [observations about customer fields]
- **Orders:** [order data structure]
- **Custom attributes / metafields used:** [list]

### Target schema notes

- **Compatibility:** [How source maps to target — easy / moderate / complex]
- **Required transformations:** [list]
- **Custom fields needed on target:** [list metafield definitions needed]

---

## Edge Cases Identified

[Specific edge cases that need special handling]

1. **[Edge case 1]:** [Description + recommended approach]
2. **[Edge case 2]:** ...

---

## Special Migration Considerations

### Password migration

- **Decision:** [Force reset / Dual hashing / Skip]
- **Communication plan:** [Customer email template]

### Subscription migration (if applicable)

- **Active subscriptions:** [N]
- **Approach:** [Re-authorization / Token migration / Other]
- **Communication plan:** [Email + deadline]

### GDPR / Privacy

- **Consent records present:** [Y/N]
- **Marketing opt-in count:** [N] of [total]
- **GDPR-compliant migration approach:** [described]

### Multi-store / Multi-source (if applicable)

- **Sources to consolidate:** [list]
- **Merge strategy:** [described]
- **Conflict resolution rules:** [described]

---

## URL Inventory Summary

### Crawl results

- Total indexable URLs: [N]
- High-traffic URLs (>100 sessions/30d): [N]
- URLs with backlinks: [N]
- Existing redirects on source: [N]
- 404 / broken URLs: [N]

Detailed inventory: `/projects/[client]/migration/url-inventory.csv`

---

## Estimated Effort

| Phase | Hours |
|-------|------:|
| Field mapping document | [N] |
| Sample migration + verification | [N] |
| Full migration | [N] |
| URL redirect mapping | [N] |
| Parity verification | [N] |
| Pre-cutover sync | [N] |
| Cutover execution | [N] |
| Post-cutover monitoring | [N] |
| **Total** | **[N]** |

Notes on estimate:
- [Caveat 1]
- [Caveat 2]

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|:-----------:|:------:|------------|
| Source data quality issues blocking migration | [L/M/H] | [L/M/H] | [Plan] |
| Customer password reset adoption | [L/M/H] | [L/M/H] | [Plan] |
| Subscription re-authorization rate | [L/M/H] | [L/M/H] | [Plan] |
| SEO traffic loss | [L/M/H] | [L/M/H] | [Plan] |
| API rate limits stretching timeline | [L/M/H] | [L/M/H] | [Plan] |
| Order history SKU drift | [L/M/H] | [L/M/H] | [Plan] |
| Image migration failures | [L/M/H] | [L/M/H] | [Plan] |

---

## Recommended Adjustments to SOW

Based on audit findings:

1. **[Adjustment 1]:** [Recommendation + rationale + scope/cost impact]
2. **[Adjustment 2]:** ...

These adjustments require client + Internal PM approval before proceeding with field mapping.

---

## Approval Requested

- [ ] Internal PM review: [name] [date] [APPROVED / NEEDS CHANGES]
- [ ] Tech Lead review: [name] [date] [APPROVED / NEEDS CHANGES]
- [ ] Client review (recommended adjustments only): [name] [date] [APPROVED / NEEDS CHANGES]

Approval to proceed to field mapping phase: [GRANTED / WITHHELD]

---

Last reviewed: [date] by [auditor]
