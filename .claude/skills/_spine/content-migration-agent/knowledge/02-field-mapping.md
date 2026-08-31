---
tier: 2
load_when: ["agent-specific-detail"]
description: "After audit, before any migration: define how each source field maps to a target field. Approved by Internal PM + Tech Lead. Contract."
---

# 02 — Field Mapping

> After audit, before any migration: define how each source field maps to a target field. Approved by Internal PM + Tech Lead. Contract.

---

## What field mapping is

A document that says, for each data type:
- Each source field → which target field
- What transformation applies (if any)
- What happens if source field is empty/missing
- What's a hard requirement vs nice-to-have

Without this contract, migration is guesswork. With it, migration is mechanical.

---

## Field mapping document structure

CSV (per `templates/field-mapping.csv`) + companion .md for context.

### CSV columns

```
data_type, source_field, target_field, transformation, default_value, required, notes
```

### Example (Magento → Shopify products)

```csv
data_type,source_field,target_field,transformation,default_value,required,notes
product,sku,sku,direct,,YES,Used as unique identifier
product,name,title,direct,,YES,
product,url_key,handle,slugify_lowercase_hyphenated,,YES,Convert spaces to hyphens lowercase
product,description,body_html,html_pass_through,,YES,Sanitize via HTMLPurifier
product,short_description,seo_description,truncate_160_chars,,NO,Use as meta description fallback
product,price,variants[0].price,direct,,YES,Convert string to decimal
product,special_price,variants[0].compare_at_price,direct,,NO,Only if special_price exists
product,weight,variants[0].weight,direct_with_unit_conversion_kg,0,NO,Convert lbs->kg if applicable
product,manage_stock,variants[0].inventory_management,boolean_to_shopify_string,shopify,NO,true->shopify false->null
product,qty,variants[0].inventory_quantity,direct,0,NO,
product,images,images,custom_image_pipeline,,YES,See image pipeline notes
product,attribute_set_id,product_type,attribute_set_lookup,,NO,Map attribute set to Shopify product type
product,categories,collections,custom_collection_mapping,,NO,Many-to-many via collection mapping
product,visibility,published,visibility_to_published,true,YES,visibility=4 -> published true, other -> false
product,status,status,status_mapping,active,YES,enabled->active disabled->draft
product,meta_title,seo_title,direct,product.title,NO,Fallback to product title
product,meta_description,seo_description,direct,short_description_truncated,NO,Fallback to short description
product,meta_keywords,(SKIP),,,,Shopify doesn't use meta_keywords (deprecated SEO field)
product,tax_class_id,(SKIP),,,,Tax handled at Shopify level not per product
product,gallery_images,images[1..N],custom_image_pipeline,,NO,Append after primary image
```

---

## Transformation types

Standard transformations the agent recognizes:

### `direct`
Copy field value as-is. No transformation.

### `slugify_lowercase_hyphenated`
Convert to URL-safe slug: lowercase, replace spaces with hyphens, remove special characters.
"My Product Title" → "my-product-title"

### `truncate_N_chars`
Truncate to N characters max.

### `html_pass_through`
Keep HTML content but sanitize via HTML purifier (strip dangerous tags, inline scripts).

### `html_strip`
Strip all HTML, keep plain text.

### `boolean_to_shopify_string`
Convert true/false to Shopify-expected string ("shopify" / null for inventory_management).

### `direct_with_unit_conversion_kg`
Convert numeric value with unit conversion (e.g., pounds → kilograms).

### `status_mapping`
Map source status string to target status string.
- Magento "enabled" → Shopify "active"
- Magento "disabled" → Shopify "draft"

### `visibility_to_published`
Convert source visibility flag to boolean published.

### `attribute_set_lookup`
Look up source attribute set ID → target product type string. Mapping table required.

### `custom_collection_mapping`
Many-to-many: source product categories → target collection IDs. Mapping table required.

### `custom_image_pipeline`
Download image from source URL, optimize, upload to target.

### `email_normalize`
Lowercase, trim whitespace, validate format.

### `phone_normalize_e164`
Convert to E.164 format (+15551234567).

### `address_normalize`
Validate address components, normalize country codes (ISO 3166-1 alpha-2).

### `currency_convert`
If source and target use different currencies (rare). Apply current FX rate. Document the rate used.

### `date_format_iso8601`
Convert any date format to ISO 8601.

### `enum_mapping`
Map enum values (e.g., shipping methods, payment methods) per a mapping table.

### `custom`
Custom logic. Documented separately in the .md companion file.

### `(SKIP)`
Field intentionally not migrated. Reason documented in notes.

---

## Required vs Optional fields

### Required (YES)
Migration FAILS if source field is missing or invalid. Halt the record.

### Optional (NO)
If source field is missing:
- Use `default_value` if specified
- Leave empty in target if no default
- Continue migration

### Conditional (depends)
Required only if certain other field is present. Document in notes.

Example: `compare_at_price` is required IF `special_price` exists, otherwise optional.

---

## Field mapping by data type

### Products
```
Required: sku, title, handle, body_html, variants[0].price, images, published
Conditional: variants (if multiple), inventory tracking
Optional: seo_title, seo_description, product_type, vendor, tags
```

### Customers
```
Required: email, accepts_marketing (per GDPR), addresses
Optional: first_name, last_name, phone, notes, tags
Conditional: password (special handling — see below)
```

#### Customer password migration (special case)

Passwords cannot typically be migrated directly (they're hashed with platform-specific algorithms).

Options:
1. **Force password reset** at first login on new platform. Email all customers a reset link.
2. **Dual-hash period** (if target platform supports): keep old hash, on first successful login, re-hash with target's algorithm. Then phase out old hashes.
3. **Hash migration if compatible:** Some platforms can import hashes if format matches (rare).

Document choice in spec + admin guide + customer communication.

### Orders
```
Required: order_number, customer_email, line_items, total_price, currency, processed_at, financial_status, fulfillment_status
Optional: tags, notes, shipping_address, billing_address, discount_codes
```

#### Order migration notes
- Historical orders are typically **read-only**: imported as "complete" without triggering shipping/billing/email automations
- Order numbers: use source's order number to maintain customer reference, BUT some platforms auto-generate. Map source order number to a metafield.
- Refunds, returns, exchanges: complex. Often documented in metafields rather than fully migrated.

### Blog posts
```
Required: title, handle, body_html, author, published_at
Optional: tags, summary, image, seo_title, seo_description
```

### Reviews
```
Required: product_reference, author, rating, body, created_at
Optional: title, verified_purchase, helpful_count, response, response_date
```

### Categories / Collections
```
Required: title, handle
Optional: description, image, sort_order, conditions (for automated collections)
```

### Customer accounts (subscription contracts, gift cards, etc.)
Highly platform-specific. Generally:
- Map active subscription contracts to new platform's equivalent
- Migrate gift card balances (not the cards themselves — generate new codes, email customers)
- Loyalty points: migrate balances + transaction history

---

## Mapping document approval

The field mapping CSV + .md is presented to Internal PM + Tech Lead for approval.

Gate: cannot proceed to sample migration until approved.

Approval format (in spec or separate document):

```
Field Mapping Approval — [Project Name]

Reviewed by:
- Internal PM: [name] [date] [APPROVED / NEEDS CHANGES]
- Tech Lead: [name] [date] [APPROVED / NEEDS CHANGES]

Specific concerns addressed:
- [Concern 1]
- [Concern 2]

Approval to proceed: [GRANTED / WITHHELD]
```

---

## Multi-source mapping

Some migrations consolidate multiple sources (e.g., 3 stores → 1 store).

Each source has its own field mapping document. Plus a "consolidation rules" document for:
- How to merge customers across sources (by email? phone? other?)
- How to resolve product duplicates (same SKU on multiple sources)
- How to handle conflicting data (different prices for same SKU)

Multi-source is more complex. Engages Opus-level reasoning.

---

## Field mapping anti-patterns

1. **Mapping fields without seeing data.** Wait for audit to be complete. Sample data informs field decisions.

2. **One-size-fits-all transformation.** Different stores have different conventions. Tailor transformations to source.

3. **No default values.** Source has nulls. Target needs values. Define defaults.

4. **No (SKIP) entries.** Some source fields are intentionally not migrated. Document them.

5. **Custom transformations without documentation.** "custom_logic_1" with no explanation = unmaintainable.

6. **No required/optional flags.** All fields treated equally → unhelpful failure modes.

7. **No tax / regulatory considerations.** Different markets, different rules. GDPR for EU customers, etc.

---

## Field mapping verification

Before approval, verify:

```
[ ] Every required target field has a source mapping OR a default
[ ] Every source field is mapped (to target field OR (SKIP) with reason)
[ ] All transformations are listed in the recognized vocabulary OR custom with explanation
[ ] Edge cases documented (passwords, addresses, multi-source rules, etc.)
[ ] Special cases (subscriptions, gift cards) addressed
[ ] Approval signatures present
```

---

Last reviewed: 2026-05-24 by Claude (initial)
Next review due: 2026-08-24
