---
tier: 2
load_when: ["agent-specific-detail"]
description: "After data is migrated, verify it. Three levels: counts match, sample matches, full audit. Catches data loss + transformation errors."
---

# 03 — Parity Verification

> After data is migrated, verify it. Three levels: counts match, sample matches, full audit. Catches data loss + transformation errors.

---

## Why parity verification matters

Data migration without verification = data loss without knowing it. Customers notice when their orders are missing. SEO suffers when content doesn't transfer. Operations break when products fail to import.

Parity verification is the safety net. Run it. Document it. Fix what fails before proceeding.

---

## Three levels of verification

### Level 1: Counts match (fast, but shallow)

Compare record counts between source and target.

```python
def verify_counts(source, target, data_type):
    source_count = source.count(data_type)
    target_count = target.count(data_type)

    parity = {
        "data_type": data_type,
        "source_count": source_count,
        "target_count": target_count,
        "delta": target_count - source_count,
        "delta_percent": (target_count - source_count) / source_count * 100,
        "status": "PASS" if abs(delta_percent) < 1 else "FAIL"
    }

    return parity
```

Acceptable variance: < 1% (some records may be filtered intentionally — e.g., spam reviews).

If variance > 1%, investigate. Maybe:
- Filtered records (note in notes)
- Failed imports (need to retry)
- Source has duplicates that target deduped (acceptable)
- Source filtering at API level (off-by-one in pagination)

### Level 2: Sample matches (slower, deeper)

Compare a representative sample of records between source and target field-by-field.

```python
def verify_sample(source, target, data_type, sample_size=25):
    # Random sample from source
    sample_records = source.random_sample(data_type, sample_size)

    discrepancies = []
    for source_record in sample_records:
        target_record = target.find_by_sku(source_record.sku)  # or other unique ID

        if not target_record:
            discrepancies.append({
                "issue": "missing_in_target",
                "source_id": source_record.id,
                "source_sku": source_record.sku
            })
            continue

        # Compare each field per field mapping
        for source_field, target_field, transformation in field_mapping:
            source_value = source_record[source_field]
            target_value = target_record[target_field]
            expected_target_value = apply_transformation(source_value, transformation)

            if target_value != expected_target_value:
                discrepancies.append({
                    "issue": "field_mismatch",
                    "source_id": source_record.id,
                    "field": target_field,
                    "expected": expected_target_value,
                    "actual": target_value
                })

    return {
        "sample_size": sample_size,
        "discrepancies": discrepancies,
        "discrepancy_rate": len(discrepancies) / sample_size,
        "status": "PASS" if len(discrepancies) < sample_size * 0.05 else "FAIL"
    }
```

Acceptable discrepancy rate: < 5% in sample. Above that, halt and investigate.

### Level 3: Full audit (slowest, deepest)

For critical data (customers with PII, orders with money), audit ALL records.

```python
def verify_full(source, target, data_type):
    source_records = source.all(data_type)
    target_records = target.all(data_type)

    # Index by unique ID for fast lookup
    target_by_id = {r.unique_id: r for r in target_records}

    discrepancies = []
    for source_record in source_records:
        target_record = target_by_id.get(source_record.unique_id)

        if not target_record:
            discrepancies.append({
                "issue": "missing_in_target",
                "source_id": source_record.id
            })
            continue

        # Compare critical fields (not necessarily every field — too expensive)
        critical_fields = get_critical_fields(data_type)
        for field in critical_fields:
            if source_record[field] != apply_transformation(target_record[field]):
                discrepancies.append({
                    "issue": "critical_field_mismatch",
                    "source_id": source_record.id,
                    "field": field
                })

    return {
        "total_audited": len(source_records),
        "discrepancies": discrepancies,
        "discrepancy_rate": len(discrepancies) / len(source_records),
        "status": "PASS" if len(discrepancies) == 0 else "INVESTIGATE"
    }
```

For critical data (orders, customers), TARGET 0 discrepancies. Anything else needs explanation.

---

## When each level runs

```
Sample migration (small batch, 10-25 records)
  → Level 1 (counts)
  → Level 2 (sample audit, 100% since sample is small)

Full migration (all records)
  → Level 1 (counts) after each batch
  → Level 2 (random sample, 25-100 records) after full migration
  → Level 3 (full audit) for critical data types: orders, customers

Pre-cutover sync (new records since last sync)
  → Level 1 (counts of new records)
  → Level 2 (sample of new records)

Post-cutover verification
  → Level 3 (full audit) for orders, customers
  → Level 2 (sample) for products, reviews, blog
  → Spot-check by client for confidence
```

---

## Critical fields per data type

For full audits, focus on critical fields (not every field — too expensive).

### Products — critical fields
- SKU (unique identifier)
- title
- price
- inventory_quantity
- handle/slug
- published status

### Customers — critical fields
- email (unique identifier)
- first_name
- last_name
- accepts_marketing (GDPR-critical)
- default_address (if migrated)

### Orders — critical fields
- order_number (unique identifier)
- customer_email
- total_price
- currency
- line_items count (sum of quantities)
- financial_status
- created_at date

### Reviews — critical fields
- product_reference (unique pairing)
- author
- rating
- body (first 100 chars for comparison)

### Blog posts — critical fields
- handle/slug (unique identifier)
- title
- published_at date

---

## Parity verification report format

`/projects/[client]/migration/parity-[stage].md`:

```markdown
# Parity Verification — [Stage] — [Project Name]

**Stage:** Sample migration / Full migration / Pre-cutover sync / Post-cutover
**Date:** [date]
**Source:** [source platform]
**Target:** [target platform]
**Verifier:** Content & Migration Agent v1.0

---

## Summary

[1-2 sentences of overall status]

## Level 1: Counts

| Data type | Source | Target | Delta | Δ% | Status |
|-----------|-------:|-------:|------:|----:|:------:|
| Products | 2,847 | 2,847 | 0 | 0.0% | ✓ |
| Variants | 8,329 | 8,329 | 0 | 0.0% | ✓ |
| Categories | 47 | 47 | 0 | 0.0% | ✓ |
| Customers | 12,453 | 12,441 | -12 | -0.10% | ✓ (duplicates merged, expected) |
| Orders | 24,891 | 24,889 | -2 | -0.01% | ⚠ |
| Reviews | 4,892 | 4,892 | 0 | 0.0% | ✓ |
| Blog posts | 124 | 124 | 0 | 0.0% | ✓ |
| Subscription contracts | 245 | 245 | 0 | 0.0% | ✓ |

### Variance investigations

- **Customers -12:** 12 duplicates merged per field-mapping rule. Documented in customer-merge-log.csv. ✓
- **Orders -2:** Investigate. See discrepancy log below.

## Level 2: Sample audit

### Products (sample 25 of 2,847)
- Discrepancies: 0
- Status: ✓ PASS

### Customers (sample 25 of 12,441)
- Discrepancies: 1
  - Customer ID 4827: address.country_code mismatch
    Source: "US"
    Expected (after transformation): "US"
    Actual: "USA" (target didn't apply transformation correctly)
  - Severity: P2, investigate transformation logic
- Status: ⚠ INVESTIGATE

### Orders (sample 50 of 24,889)
- Discrepancies: 0
- Status: ✓ PASS

[Etc per data type]

## Level 3: Full audit (critical data only)

### Orders (full audit — 24,889 records)
- Missing in target: 2 orders
  - Source order #M-15234: not present in target
  - Source order #M-15891: not present in target
- Investigation:
  - #M-15234: source has data quality issue (no line items) → expected to be excluded per field mapping
  - #M-15891: import error, need to retry
- Status: ⚠ ONE REQUIRES RETRY

### Customers (full audit — 12,441 records)
- Discrepancies: 0 (after Level 2 transformation fix)
- Status: ✓ PASS

## Action items

1. **P1: Retry import for order #M-15891**
   - Investigate failure cause
   - Re-import single record
   - Re-verify

2. **P2: Investigate country_code transformation**
   - Why did some customers get "USA" instead of "US"?
   - Fix transformation logic
   - Re-migrate affected customers
   - Re-verify sample

3. **Documentation: Note 1 expected exclusion (order #M-15234)**

## Verification status

- Level 1 (counts): ✓ PASS (with documented variances)
- Level 2 (sample): ⚠ INVESTIGATE (1 transformation issue)
- Level 3 (full): ⚠ ONE RETRY NEEDED

**Overall: NOT READY for cutover.** Action items above must complete.

---

Next verification after fixes: re-run all levels.
```

---

## Edge cases

### Filtered records
Some records are intentionally not migrated (e.g., "spam" customer accounts, deleted products). These cause expected variance in counts.

Field mapping CSV should mark such records' filters (e.g., `WHERE NOT spam = true`). Parity report notes the expected exclusion.

### Duplicate merging
Customers with duplicate emails may merge in target. Count delta is expected. Maintain a merge log.

### Source platform pagination quirks
Sometimes APIs return slightly different counts on different paginated requests (live data changes). Run audit + re-query if delta is suspicious.

### Transformations that change record uniqueness
If source has compound key (e.g., order + line item) and target uses single key, counts may differ. Document the relationship.

### Currency conversion
If currency is converted, prices won't match source exactly. Document the FX rate used + verify the conversion was correctly applied.

---

## Parity verification anti-patterns

1. **Counts only.** Counts match but actual data is corrupted. Run sample + full audits too.

2. **Sample of 5.** Too small. Minimum 25.

3. **No tracking of discrepancies.** Verification finds issues, doesn't document them, issues forgotten → cutover with bad data.

4. **Trusting "the import said it worked."** Import success ≠ data parity. Verify.

5. **Skipping critical data audits.** Customers + orders need full audits. Don't sample these.

6. **Manual spot-check by humans only.** Programmatic verification catches more, faster. Manual is a supplement, not the primary.

7. **No retry mechanism.** Discrepancies found, no plan to fix. Issues compound.

---

## Verification tooling

For most data types, simple scripts work:
- CSV comparison via Python + pandas
- API queries + diff

For critical data, consider:
- Dedicated parity tools (some platforms have them)
- Custom comparison scripts in repo (per-project)
- Database direct comparison if both platforms expose DBs

Content & Migration Agent invokes whichever tool is appropriate. Scripts live in `/projects/[client]/migration/scripts/`.

---

## Verification effort estimate

Roughly:
- Level 1: 30 minutes - 2 hours
- Level 2: 2-8 hours (depending on sample size + data types)
- Level 3: 8-24 hours (depending on data volume)

Build into PM Agent's effort estimate for migration projects.

---

Last reviewed: 2026-05-24 by Claude (initial)
Next review due: 2026-08-24
