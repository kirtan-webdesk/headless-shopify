---
tier: 2
load_when: ["agent-specific-detail"]
description: "Per I16 (redirect map required for redesigns + migrations) + I17 (single-hop only, no chains, developer approval if chain unavoidable). The plan for not destroying SEO during cutover."
---

# 04 — URL Redirect Strategy

> Per I16 (redirect map required for redesigns + migrations) + I17 (single-hop only, no chains, developer approval if chain unavoidable). The plan for not destroying SEO during cutover.

---

## Why this matters

When URLs change (or platform changes), search engines see the old URLs returning 404s or 301s. If 301s are clean and complete, SEO is preserved. If URLs 404, SEO is destroyed — sometimes permanently.

Search Console can take weeks to re-crawl. Lost traffic during that window is lost revenue.

---

## Step 1: URL inventory from source

Generate a complete list of indexable URLs from the source.

### Methods

#### A. Crawl the source site
Use Screaming Frog or similar to crawl up to all indexable pages.

```
Configuration:
- Set User-Agent to a real crawler (Googlebot-similar)
- Respect robots.txt
- Follow internal links to depth N
- Export URL list with status codes
```

#### B. Use source platform's sitemap
```bash
curl https://[source-domain]/sitemap.xml
# Parse, extract all URLs
```

#### C. Use Search Console URL inspection
For sites already indexed by Google:
- Export URLs from Search Console
- Includes URLs that may not be in sitemap

#### D. Database query (if accessible)
Query the source DB for all published content:
- Products with active status
- Categories
- Blog posts
- CMS pages
- Author pages
- Tag pages
- Filtered pages (e.g., /collection?color=red)

### Output: URL inventory CSV

`/projects/[client]/migration/url-inventory.csv`:

```csv
source_url,page_type,canonical,status,traffic_30d,backlinks_count,priority
https://store.com/,homepage,https://store.com/,200,12450,250,high
https://store.com/products/aurora-cleanser,product,canonical_same,200,847,15,high
https://store.com/products/aurora-cleanser?utm=email,product,canonical_to_main,200,234,0,low
https://store.com/collections/skincare,collection,canonical_same,200,1234,8,high
https://store.com/blog/article-1,blog,canonical_same,200,567,3,medium
https://store.com/category/skincare/page/2,collection_paged,canonical_to_page_1,200,12,0,low
https://store.com/old-promotion-page,landing,canonical_same,200,89,1,medium
https://store.com/legacy-product/discontinued,product,canonical_to_replacement,200,5,0,low
```

Columns:
- **source_url**: full URL
- **page_type**: classifies for redirect strategy
- **canonical**: canonical URL (some URLs are non-canonical variants)
- **status**: HTTP status from crawl (200, 301, 404, etc.)
- **traffic_30d**: organic sessions in last 30 days (from GA / Search Console)
- **backlinks_count**: external backlinks pointing to this URL (from Ahrefs / SEMrush if available)
- **priority**: high (frequently visited / many backlinks), medium, low

Priority informs how careful to be with each redirect.

---

## Step 2: Identify new URL structure on target

Per `_spine/pm-agent/knowledge/I17 URL structure rules`:

- New websites: define platform-specific URL structure (e.g., Shopify uses `/products/[handle]`)
- Migrations: define new URL structure
- Redesigns: PRESERVE existing URL structure

For migrations, document the new URL pattern per page type:

```
| Page Type | Source URL Pattern | Target URL Pattern |
|-----------|-------------------|-------------------|
| Homepage | / | / |
| Product | /products/[slug] | /products/[handle] |
| Collection | /category/[slug] | /collections/[handle] |
| Blog post | /blog/[slug] | /blogs/news/[handle] |
| Tag page | /tag/[slug] | /collections/[handle] (mapped to closest collection) |
| Author | /author/[slug] | (consolidated to /pages/about) |
| Search | /search?q= | /search?q= |
| Cart | /cart | /cart |
| Account | /account | /account |
| Static page | /[slug] | /pages/[handle] |
```

Document any URL structure changes per page type.

---

## Step 3: Generate redirect map (the core artifact)

For each URL in inventory, create a redirect entry.

`/projects/[client]/migration/redirect-map.csv`:

```csv
source_url,target_url,redirect_type,priority,reason
https://store.com/products/aurora-cleanser,/products/aurora-cleanser,301,high,direct_match
https://store.com/products/aurora-cleanser-100ml,/products/aurora-cleanser,301,high,merged_variants_into_parent
https://store.com/category/skincare,/collections/skincare,301,high,category_to_collection
https://store.com/blog/article-1,/blogs/news/article-1,301,medium,blog_path_change
https://store.com/old-promotion-page,/collections/sale,301,medium,outdated_landing_to_current
https://store.com/legacy-product/discontinued,/collections/skincare,301,low,discontinued_product_to_category
https://store.com/tag/sustainable,/collections/sustainable,301,medium,tag_to_collection
https://store.com/author/jane-smith,/pages/about,301,low,author_pages_consolidated
https://store.com/category/skincare/page/2,/collections/skincare?page=2,301,low,pagination_pattern_change
https://store.com/products/aurora-cleanser?utm=email,/products/aurora-cleanser,canonical,low,canonical_tag_handles_parameters
```

Columns:
- **source_url**: old URL
- **target_url**: new URL on target platform
- **redirect_type**: 301 (permanent), 302 (temporary, rare in migrations), canonical (handle via canonical tag)
- **priority**: high (must work day 1), medium, low (can be batched)
- **reason**: why this mapping

---

## Step 4: No redirect chains (per I17)

A redirect chain is:

```
URL A → 301 → URL B → 301 → URL C
```

Three hops. Bad. Each hop:
- Adds latency
- Reduces SEO link equity
- Risks breaking if any intermediate URL changes

### How to detect chains

For each row in redirect-map.csv:
1. Look up `target_url` — is it ALSO a source_url in another row?
2. If yes: that's a chain. Two redirect entries should be merged.

Example bad:
```csv
/old-product,/legacy-product/discontinued,301,...
/legacy-product/discontinued,/collections/skincare,301,...
```

Fix to:
```csv
/old-product,/collections/skincare,301,low,direct_to_final_destination
/legacy-product/discontinued,/collections/skincare,301,low,direct
```

Now both old URLs go directly to the final destination. Single hop.

### When chains are unavoidable (per I17)

Some chains exist on the source already. If we can't break them in our control:

```
URL A → 301 → URL B (on source, can't change)
       ↓
Now we redirect URL B → URL C on target
```

This creates a chain: A → B → C.

In this case (per I17), developer approval required + logged. Document in redirect-map.csv:

```csv
/legacy-url,/old-redirect-target,301,low,existing_chain_inherited_developer_approved_2026-05-15
```

Code Review Agent will flag chain creation but, with approval, allow.

---

## Step 5: Handle edge cases

### Parameter URLs (e.g., `?utm=email`)

Don't create redirects for every parameter combination. Instead:
- Set canonical tag on target page (handles parameters automatically)
- Search engines understand parameters via canonical

### Pagination

Source: `/collection?page=2` → Target: `/collections/skincare?page=2`

If pagination pattern changes, redirect:
- `/category/skincare/page/2` → `/collections/skincare?page=2`

### Search URLs

Usually not indexed and not crawled. Skip redirect mapping unless analytics shows significant traffic.

### Filtered URLs (faceted nav)

`/collection?color=red&size=large` → typically not indexed by Google (canonical tags handle).

Per platform conventions on faceted nav indexation (per I12 SEO checklist).

### Old promotion URLs

Decide per URL: redirect to active replacement or to broader page (sale page, homepage).

### Deleted / archived products

Redirect to closest replacement OR category page.

### Multi-language URLs

If multi-language source (e.g., /en/, /fr/) maps to multi-language target with different language code conventions:
```
/fr/products/cleanser → /products/cleanser?lang=fr (target uses parameters)
OR
/fr/products/cleanser → /fr/products/cleanser (preserve)
```

Use hreflang on target to communicate language alternates.

---

## Step 6: Implement redirects on target platform

### Shopify
- Admin → Online Store → Navigation → URL Redirects
- Bulk import via CSV
- Or via Shopify Admin API

```python
# Bulk redirect creation via Shopify Admin API
for row in redirect_map_csv:
    create_url_redirect(
        path=row.source_url_path,
        target=row.target_url,
        # Shopify auto-treats as 301
    )
```

### WordPress
- Use Redirection plugin (or Yoast Premium redirects)
- Bulk import via CSV or .htaccess

### Magento
- Catalog URL Rewrites (admin) or API
- Or via .htaccess on server

### BigCommerce
- Admin → Server Settings → 301 Redirects
- Bulk import via CSV

### Node.js / Headless
- Configure in CDN or routing layer (Vercel, Cloudflare, custom)
- Or in the Node.js application's middleware

---

## Step 7: Verify redirects pre-cutover

Before cutover, test redirects on staging:

```bash
# For each redirect in map, curl with -I to get headers
for row in redirect_map.csv:
    response = curl -I -L "https://staging.target.com{source_url_path}"
    # Verify: 301 status + Location header points to target_url
    if not_correct(response):
        log_failure(row)
```

Output: redirect-verification-report.md
```
Tested: 1,247 redirects
Pass: 1,245
Fail: 2
  - /products/aurora-cleanser?utm=email → expected canonical handling, got 404 (canonical tag missing)
  - /old-promotion → expected /collections/sale, got /pages/about (wrong target)
Fixes required before cutover.
```

After cutover, repeat against production with same script.

---

## Step 8: Post-cutover SEO recovery monitoring

After cutover, monitor:

### Google Search Console
- Submit new sitemap.xml
- Submit change of address (if domain didn't change but platform did)
- Watch "Pages indexed" metric
- Watch for crawl errors

### Bing Webmaster Tools
- Same as GSC

### Organic traffic (GA4)
- Watch sessions, conversions
- Compare week-over-week vs pre-launch baseline
- Expected: short dip (1-3 weeks), then recovery
- Concerning: dip > 4 weeks or > 30%

### Indexing status
For each high-priority URL:
- Query in GSC: "Pages > [URL] > View URL inspection"
- Verify: indexed on new platform
- If not: investigate

---

## Step 9: Maintain redirects post-launch

Redirects are FOREVER. Don't remove them after a year. Don't remove them ever (unless source URL has 0 traffic + 0 backlinks for years).

Backlinks are external links pointing to URLs. They can be very old (8-10 years for some sites). Removing redirects breaks those backlinks.

Plan: maintain redirect map indefinitely. Document it in handoff for client to maintain after warranty ends.

---

## Common redirect strategy mistakes

1. **Redirect everything to homepage.** SEO killer. Each URL should go to the most relevant replacement.

2. **No redirects (just let 404s happen).** SEO killer. Always have redirects.

3. **302 instead of 301.** 302 is temporary, doesn't pass link equity. Use 301 for permanent migrations.

4. **No verification.** Map exists but redirects don't actually work. Always test.

5. **Removing redirects too early.** "We don't need them anymore" — yes you do. Keep forever.

6. **Chains everywhere.** Source had chains, target inherits chains. Try to flatten. If can't, document.

7. **Ignoring parameter URLs.** Don't redirect every URL+param combo, but DO set canonical tags.

8. **Not submitting change of address.** Tell Google + Bing about the move. Both have tools.

---

## Final redirect map artifact

After all steps:

`/projects/[client]/migration/redirect-map.csv` — the source of truth.

Companion `redirect-map-notes.md` — explanations + decisions + edge cases.

Both delivered in handoff to client.

---

Last reviewed: 2026-05-24 by Claude (initial)
Next review due: 2026-08-24
