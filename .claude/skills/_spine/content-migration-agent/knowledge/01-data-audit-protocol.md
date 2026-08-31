---
tier: 2
load_when: ["agent-specific-detail"]
description: "Before any migration begins, audit the source. What's there, how much, in what condition. This audit informs scope, estimates, and risk."
---

# 01 — Data Audit Protocol

> Before any migration begins, audit the source. What's there, how much, in what condition. This audit informs scope, estimates, and risk.

---

## When the audit runs

- During discovery phase (G0.5) if migration is scoped
- Otherwise as the first step of migration project, before any field mapping work

---

## Audit inputs required

Before audit starts, you need:

```
[ ] Source platform identified (Shopify, Magento, WooCommerce, BigCommerce, custom, etc.)
[ ] Source platform read-only credentials (API key, admin access, or data export access)
[ ] Confirmation of data types in scope (from SOW Q15 if migration project)
[ ] Approximate record count expectations from client (sanity check)
```

If any blocker (no access, scope unclear), halt and surface.

---

## Step 1: Identify data types in scope

Per the SOW (especially Q15 for migrations), enumerate what's being migrated:

Common data types:
- Products
- Customers
- Orders (with history)
- Blog posts
- Reviews
- Categories / Collections / Tags
- Customer accounts (with passwords)
- Gift cards
- Store credit
- Subscription contracts
- Wishlists / saved carts
- Media (images, videos)
- Custom metafields / metadata
- Loyalty / rewards points
- Discount codes
- Pages (CMS pages)
- Menus / navigation

For each type:
- Confirm IN SCOPE (per spec) or OUT OF SCOPE (record it explicitly)
- Note any special handling needed

---

## Step 2: Get record counts per type

For each data type IN SCOPE, count records on source.

```
Source platform connection
↓
For each type:
  Query record count
  Note: total count, active vs inactive, date range
```

### Per-platform commands

#### Shopify (source)
```bash
# Using Shopify Admin API
curl -X GET "https://[shop].myshopify.com/admin/api/2025-10/products/count.json" \
  -H "X-Shopify-Access-Token: [token]"

curl -X GET "https://[shop].myshopify.com/admin/api/2025-10/customers/count.json" \
  -H "X-Shopify-Access-Token: [token]"

curl -X GET "https://[shop].myshopify.com/admin/api/2025-10/orders/count.json?status=any" \
  -H "X-Shopify-Access-Token: [token]"

# etc.
```

#### Magento (source)
```bash
# Using Magento REST API
GET /rest/V1/products?searchCriteria[currentPage]=1&searchCriteria[pageSize]=1
GET /rest/V1/customers/search?searchCriteria[currentPage]=1&searchCriteria[pageSize]=1
GET /rest/V1/orders?searchCriteria[currentPage]=1&searchCriteria[pageSize]=1

# Returns total_count in response
```

#### WooCommerce (source)
```bash
# Using WC REST API
GET /wp-json/wc/v3/products?per_page=1
# Returns X-WP-Total header with count

GET /wp-json/wc/v3/customers?per_page=1
GET /wp-json/wc/v3/orders?per_page=1
```

#### BigCommerce (source)
```bash
# Using BC API
GET /v3/catalog/products?limit=1
# Returns meta.pagination.total

GET /v2/customers?limit=1
GET /v2/orders?limit=1
```

#### Custom platform (source)
```
Use whatever API/access method the source provides.
Likely needs custom queries or DB access.
```

---

## Step 3: Sample data quality assessment

For each data type, pull a SAMPLE of records (10-25) and assess quality:

### What to look for

**Completeness:**
- Required fields populated?
- Common gaps (e.g., missing alt text on product images, missing customer phone numbers)

**Consistency:**
- Date formats consistent?
- Currency formats consistent?
- Locale/language consistent?
- Slugs/handles follow a convention?

**Accuracy:**
- Do prices look right (no $0 products that should have prices)?
- Do dates look reasonable (no 1970 epoch dates)?
- Do email addresses look valid?

**Edge cases:**
- Special characters in product titles (emoji, accented characters)?
- Very long fields (descriptions > 50KB)?
- Empty arrays where data expected?
- Null vs empty string vs missing key — what convention does source use?

**Relationships:**
- Do orders reference customers that exist?
- Do products reference categories that exist?
- Are images referenced from products actually accessible?
- Are variants properly linked to parent products?

### Per-type quality checks

**Products:**
- All products have title, handle/slug
- Prices are positive numbers
- Variants properly linked
- Images accessible (HTTP 200 on image URLs)
- SEO meta present (titles, descriptions)
- Inventory tracking accurate

**Customers:**
- Email addresses valid
- Email uniqueness (no duplicates)
- Names not "test test" or obviously fake
- Address fields properly structured
- GDPR-related fields handled (opt-ins, consent records)

**Orders:**
- All orders have at least 1 line item
- Order totals match line items + shipping + tax
- Customer references valid (customer exists)
- Dates reasonable
- Statuses use expected vocabulary (e.g., "completed", "fulfilled", "cancelled")

**Blog posts:**
- All posts have title, slug, content
- Author references valid
- Publish dates reasonable
- Categories/tags exist

**Reviews:**
- Product references valid
- Customer/author references valid
- Ratings in expected range (e.g., 1-5)
- Dates reasonable

---

## Step 4: Surface data quality issues

Anything found in Step 3 that's a problem:

```markdown
## Data Quality Issues Identified

### Critical (must address before migration)
- 47 orders reference customer IDs that don't exist → orphan orders, decide: skip, assign to guest, create placeholder customer
- 3 products have no images → blocks migration if target requires images
- 12 customer emails are duplicates → target platform likely rejects duplicates; need merge strategy

### Important (address during migration)
- 234 products have description > 50KB (Shopify Liquid limit) → truncate or migrate to metafield
- 89 product handles contain spaces or special characters → normalize to URL-safe slugs
- Customer phone numbers stored in 4 different formats → normalize to E.164

### Minor (note, may be acceptable)
- 1,200 customers haven't placed an order in 3+ years → consider segmenting in marketing tool but keep
- 50 reviews from before 2018 may have outdated product references → spot-check

### Out-of-scope but noted
- Source platform has 12,000 abandoned carts → SOW excludes carts, no migration needed
```

Each issue → resolution required before migration begins.

---

## Step 5: Estimate migration effort

Based on audit, estimate:

- Total records: [N]
- Estimated migration time (per type)
- Complexity (low/medium/high) based on:
  - Record count
  - Data quality issues
  - Field mapping complexity expected
  - Custom logic needed

This estimate feeds into PM Agent's overall project estimate.

---

## Step 6: Generate data audit report

`/projects/[client]/migration/data-audit-report.md`:

```markdown
# Data Audit Report — [Client / Project]

**Source platform:** Magento 2.4.5
**Target platform:** Shopify Plus
**Auditor:** Content & Migration Agent v1.0
**Date:** [date]

---

## Summary

[3-5 sentences covering total data scope, major findings, recommended approach]

## Records per data type

| Data type | Source count | In scope | Notes |
|-----------|-------------:|:--------:|-------|
| Products | 2,847 | ✓ | Includes 124 inactive products |
| Product variants | 8,329 | ✓ | Avg 2.9 variants/product |
| Categories | 47 | ✓ | 3-level hierarchy |
| Customers | 12,453 | ✓ | Includes 12 duplicates (see issues) |
| Orders (last 5 years) | 24,891 | ✓ | Per SOW: only last 5 years |
| Orders (older) | 8,247 | ✗ | Out of scope |
| Reviews | 4,892 | ✓ | Includes Yotpo-imported reviews |
| Blog posts | 124 | ✓ | All carry over |
| CMS pages | 18 | ✓ | All carry over |
| Subscription contracts | 245 | ✓ | Migrate to Recharge on target |
| Gift cards | 67 (active) | ✓ | Migrate balance only |

## Data quality issues

[Per Step 4 above]

## Recommended approach

[Per-type recommendation: direct migration, transformation needed, complex logic required]

## Estimated effort

| Phase | Hours |
|-------|------:|
| Field mapping | 16 |
| Sample migration + verification | 24 |
| Full migration | 40 |
| URL redirect mapping | 16 |
| Parity verification | 24 |
| Cutover + post-launch | 16 |
| **Total** | **136** |

Effort estimate fed to PM Agent for milestone planning.

## Risk flags

[Specific risks identified during audit]

## Approval requested

This audit recommends the following adjustments to SOW before proceeding:
1. [Adjustment 1 with rationale]
2. [Adjustment 2 with rationale]

Internal PM + Tech Lead review requested.
```

---

## Anti-patterns

1. **Skipping the audit.** "We'll figure it out during migration" → discover surprises mid-cutover. Don't.

2. **Trusting the SOW's record counts.** Clients often estimate wrong. Verify counts from source.

3. **Auditing only the data, not the schema.** Schema mismatches are where migrations fail. Audit both.

4. **No data quality surfacing.** Quality issues found later = rework. Surface during audit.

5. **No effort estimate from audit.** PM Agent's estimates are wrong without this input.

6. **Writing to source during audit.** Read-only. Always.

7. **Sample size too small.** 10-25 records is minimum. For very different data types, sample more. Don't audit 3 products and call it done.

---

Last reviewed: 2026-05-24 by Claude (initial)
Next review due: 2026-08-24
