---
tier: 2
load_when: ["agent-specific-detail"]
description: "Standard patterns for the 7 most common data types. Each has its own quirks. Each requires its own approach."
---

# 05 — Content Import Patterns

> Standard patterns for the 7 most common data types. Each has its own quirks. Each requires its own approach.

---

## How to use this file

When migrating a data type, find its section below. Use the pattern as a starting point. Adjust per the field mapping document for the specific project.

If migrating a data type not covered here, add it to the file after the project completes (feedback loop, per K4).

---

## 1. Products

### Common challenges
- Variants (single product, multiple SKUs/sizes/colors)
- Images (must be downloaded and re-uploaded to target's storage)
- Categories/collections (many-to-many relationship)
- Custom metadata (metafields, custom attributes)
- SEO fields (titles, descriptions, schema)
- Inventory tracking

### Standard pattern

```
1. Audit source products
   - Total count
   - Variant distribution (avg variants per product)
   - Image count per product (avg, max)
   - Custom attribute fields used

2. Identify target product model
   - How variants are structured on target
   - How categories/collections work
   - Where custom metadata goes (metafields, custom fields, etc.)

3. Build field mapping (per `02-field-mapping.md`)
   - Standard fields: sku, title, handle, description, price, weight, etc.
   - Custom fields: map to metafields on target
   - Categories: map to collections (handle many-to-many)

4. Image pipeline
   - Download from source URL
   - Optimize: WebP/AVIF conversion, compression
   - Upload to target's storage
   - Re-link to product

5. Sample migration (10-25 products)
   - Verify variants imported correctly
   - Verify images accessible on target
   - Verify SEO fields present
   - Spot-check 5 products manually

6. Full migration (batched, e.g., 100 products at a time)
   - Rate-limit per platform's API quota
   - Track progress (X of N migrated)
   - Pause on errors, retry, log

7. Parity verification
   - Counts match
   - Sample audit (25 products field-by-field)
   - Image accessibility audit (every product has at least 1 working image)

8. Post-migration
   - Re-run search indexing on target
   - Verify product schema markup on PDPs
```

### Per-platform specifics

#### Shopify (target)
- Use Admin API for bulk import
- Products are 1:N variants
- Images: upload via image_url (Shopify fetches) or direct upload
- Collections: separate import after products exist
- Metafields: define metafield definitions first

#### WooCommerce (target)
- Use WC REST API or WP-CLI
- Product types: simple, variable, grouped, external, virtual, downloadable
- Categories + tags are separate
- Images: upload to WP media library, link via product

#### Magento (target)
- Use REST API or import via CSV (deprecated but works for one-time)
- Attribute sets must exist before products
- Categories must exist before products
- Images: via media gallery API
- Stock items linked via separate API

#### BigCommerce (target)
- Use BC API v3
- Products have multiple custom fields available
- Image upload via /products/{id}/images
- Categories assigned via API

---

## 2. Customers

### Common challenges
- Passwords (cannot migrate directly, see field mapping § Password migration)
- PII handling (GDPR, CCPA — must respect consent)
- Email duplicates
- Address validation
- Customer metadata (lifetime value, tier, custom fields)

### Standard pattern

```
1. Audit source customers
   - Total count, including inactive
   - Email duplicates count
   - Consent status (marketing opt-in) — GDPR-critical
   - Address structure consistency

2. Build field mapping
   - email → email (lowercase, trim)
   - first_name, last_name → first_name, last_name
   - phone → normalize to E.164
   - accepts_marketing → maintain consent state
   - addresses → array of address objects
   - tags → tags (or metafield)
   - notes → notes (or metafield)
   - lifetime value, segments → metafields on target

3. Decide password strategy
   - Option A: force reset (recommended)
   - Option B: dual hashing (if target supports)
   - Option C: skip migration, customers re-register

4. Handle duplicates
   - Strategy per field mapping:
     - Most recent record wins
     - Merge data (keep latest values per field)
     - Email + name match → merge

5. Sample migration (25 customers)
   - Verify all fields imported
   - Verify addresses normalized
   - Spot-check 5 customers

6. Full migration (batched)
   - Don't trigger welcome emails on import
   - Mark as "imported" in audit log

7. Send password reset email
   - Customer communication: "We've moved to a new platform. Please reset your password."
   - Provide reset link
   - Set a deadline (e.g., 30 days) before disabling old accounts

8. Parity verification
   - Email count matches (minus duplicates)
   - Sample audit of 25 customers field-by-field
   - Full audit of customers (critical data type)
```

### GDPR / Privacy considerations

- Consent records must transfer with the customer
- If a customer hasn't consented to marketing, don't migrate them as "subscribed"
- Right to erasure: maintain audit trail for any customer who has requested deletion
- Document GDPR-compliance approach in migration log

---

## 3. Orders

### Common challenges
- Historical orders (often massive volume)
- Line items reference products that may have changed SKU
- Order status vocabularies differ between platforms
- Refunds, returns, exchanges complexity
- Order numbers (preserve customer reference)

### Standard pattern

```
1. Audit source orders
   - Total count by status
   - Date range (oldest to newest)
   - Per-status counts (complete, cancelled, refunded, partial-refund)
   - Average line items per order
   - Edge cases: orders without line items, orders with negative totals (refund-only)

2. Decide migration scope
   - Last X years (typical: 3-5)
   - All time (rare, expensive)
   - Active orders only (rare)

3. Build field mapping
   - order_number → maintain reference (in metafield if target generates new)
   - customer reference → via email (since customer IDs change)
   - line_items → preserve SKU + price + quantity
   - financial_status → map source statuses to target vocab
   - fulfillment_status → map source statuses to target vocab
   - dates → ISO 8601
   - tax + shipping → preserve as totals (not recalculate)

4. Handle SKU drift
   - Orders reference SKUs that may not exist on new platform
   - Strategy: import order with original SKU as line item title even if product not found
   - Note: customer can see history but can't re-order if product doesn't exist

5. Mark imported orders as historical
   - Don't trigger fulfillment automations
   - Don't send order confirmation emails
   - Set as "imported" status if platform supports

6. Sample migration (50 orders, varied: recent, old, cancelled, refunded)
   - Verify line items correct
   - Verify totals match source
   - Verify customer link works

7. Full migration (batched, can take hours for high-volume)
   - Rate-limit per API quota
   - Log every batch result

8. Parity verification
   - Full audit (orders are critical)
   - Total dollar amount per status matches (e.g., total of completed orders = same on source and target within rounding)
```

### Order migration risks

- API rate limits can stretch migration to days
- Some target platforms have hard limits on historical order import
- Customer-visible order history must work post-cutover

---

## 4. Categories / Collections

### Common challenges
- Hierarchical structure (sub-categories)
- Many-to-many product relationships
- Automated vs manual category rules
- Image/banner assets

### Standard pattern

```
1. Audit source categories
   - Total count
   - Hierarchy depth
   - Products per category (avg, max)

2. Migrate FIRST (before products)
   - Categories need to exist for products to be assigned

3. Build field mapping
   - Source: hierarchical tree
   - Target: depends on platform (Shopify uses collections, others have tree-like categories)
   - Map automation rules if applicable (Shopify automated collections)

4. Migrate
   - Top-level first, then nested
   - Preserve URL handles for SEO

5. Re-assign products after products migration
   - Many-to-many via API
   - Verify each product's collections match source categories

6. Parity verification
   - Category count matches
   - Per-category product count matches (or accounts for filtering)
```

---

## 5. Blog Posts

### Common challenges
- Author references
- Categories / tags
- Featured images
- Internal links within post content (may need rewriting)
- Comments (often not migrated)

### Standard pattern

```
1. Audit source blog
   - Post count
   - Author distribution
   - Comments count (decide: migrate or skip)
   - Internal link audit (links to other source URLs)

2. Build field mapping
   - title → title
   - slug → handle
   - body_html → body_html (with internal link rewriting)
   - author → author (or attribution string if author identities don't migrate)
   - published_at → maintain
   - tags / categories → maintain

3. Handle internal links
   - Source blog post #1 may link to source blog post #2
   - On target, those links should resolve via 301 redirects
   - Optional: rewrite links in body_html to use new target URLs directly (cleaner)

4. Comments
   - Most migrations skip comments (low value, complex to migrate)
   - Document decision in field mapping

5. Sample migration (5-10 posts)
   - Verify content renders correctly
   - Verify images load
   - Verify links work (via redirects)

6. Full migration

7. Parity verification
   - Post count matches
   - Sample audit (10 posts)
```

---

## 6. Reviews

### Common challenges
- Reviews link to products (need product migration first)
- Author identity (may be customer, may be anonymous)
- Multiple review platforms (Yotpo, Judge.me, Trustpilot, native)
- Star ratings differ in scale

### Standard pattern

```
1. Audit source reviews
   - Total count
   - Reviews per product (avg, max)
   - Anonymous vs identified
   - Star rating scale (1-5? 1-10?)
   - Verified purchase flag

2. Migrate AFTER products
   - Reviews reference product SKUs/handles

3. Build field mapping
   - product_reference → match by SKU
   - author → email if identified, "Anonymous" if not
   - rating → normalize to target's scale (typically 1-5)
   - body → body
   - title → title (if applicable)
   - created_at → maintain
   - verified_purchase → maintain if data exists

4. Choose target review system
   - Same platform as source (e.g., Judge.me on both)?
   - Different platform on target (e.g., Yotpo → Judge.me)?
   - Each has different import APIs

5. Sample migration (25 reviews)

6. Full migration

7. Parity verification
   - Per-product review count matches
   - Average rating per product matches (within rounding)
   - Sample audit
```

---

## 7. Subscription Contracts / Recurring Orders

### Common challenges
- Active subscriptions must continue uninterrupted
- Payment method tokens cannot transfer (security)
- Billing cycle preservation
- Customer must authorize new platform payment

### Standard pattern (Recharge as target — common Shopify subscription tool)

```
1. Audit source subscriptions
   - Active count, paused count, cancelled count
   - Plan / interval distribution
   - Average customer count

2. Decide migration approach
   - Most common: notify customers to re-authorize on new platform
   - Less common: secure token migration if both platforms use compatible payment processor
   - Rare: automatic migration (only if specific tool support exists)

3. Build field mapping
   - customer reference → match by email
   - product reference → match by SKU
   - billing interval → maintain
   - next charge date → maintain
   - billing address → migrate
   - payment method → REQUIRE CUSTOMER RE-AUTHORIZATION (typical)

4. Communicate to customers
   - Email explaining migration
   - Reset their subscription with new payment method on new platform
   - Provide deadline (e.g., 30 days before old subscriptions end)

5. Migrate subscription records (read-only, payment requires re-auth)

6. Monitor: how many customers re-authorize?
   - Track conversion of subscription migration
   - Follow up with non-converters
```

Subscription migration is high-risk. Plan carefully. Customer communication is critical.

---

## Standard error handling

For all data types, error handling:

```
1. Import attempt
2. If success: log, increment counter
3. If failure:
   a. Capture error
   b. Add to retry queue
4. After all records attempted:
   a. Retry failures (up to 3 times)
   b. After 3 failures: add to "manual investigation" list
5. Surface failures in parity report
```

---

## Per-platform import tools

Specific tools that can speed up migration:

### To Shopify
- Matrixify (paid, very capable, all data types)
- Excelify (legacy, less maintained)
- Shopify's bulk operations API (free, but you write the scripts)
- LitExtension (paid migration service)
- Native Shopify imports (CSV for products + customers)

### To WooCommerce
- WP All Import (paid, very flexible)
- WooCommerce native CSV import
- LitExtension

### To Magento
- Magento built-in import (Magmi, dataflow)
- API-based custom scripts

### To BigCommerce
- BC API + custom scripts
- BC's native imports

Choice depends on data complexity, budget, and timeline. Content & Migration Agent recommends per project.

---

## Anti-patterns

1. **Migrating without sampling.** Always sample first. Always.

2. **No customer communication for password reset.** Customers can't log in after cutover → tickets pile up.

3. **Triggering emails on import.** Customers receive welcome emails years after they signed up. Disable.

4. **Ignoring SKU drift in orders.** Old orders point to products that don't exist → customer can't see what they bought.

5. **Migrating duplicates without merging strategy.** Target rejects, partial data, broken state.

6. **Not handling GDPR consent.** Customers wake up subscribed to a list they unsubscribed from years ago. Lawsuit risk.

7. **Image pipeline fails silently.** Migration "succeeds" but half the products have broken images.

---

Last reviewed: 2026-05-24 by Claude (initial)
Next review due: 2026-08-24
