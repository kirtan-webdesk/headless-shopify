---
tier: 2
load_when: ["agent-specific-detail"]
description: "Per D7, the checklist is NOT a fixed 40 items. It's composed dynamically per project from baseline + spec-driven + platform-specific + project-type-specific items."
---

# 01 — Pre-Launch Checklist Composition

> Per D7, the checklist is NOT a fixed 40 items. It's composed dynamically per project from baseline + spec-driven + platform-specific + project-type-specific items.

---

## How the checklist is built

```
Standard baseline (every project: ~15 items)
  +
Spec-driven (from this project's scope: variable items)
  +
Platform-specific (from active platform: variable items)
  +
Project-type-specific (new build / redesign / migration / etc.: variable items)
  =
Final pre-launch checklist (typically 25-60 items)
```

Each item has:
- Description (what's being verified)
- Verification method (programmatic / manual / N/A with reason)
- Owner (Delivery Head / Frontend Agent / Backend Agent / Internal PM / Client)
- Status (pending / verified / failed / N/A)
- Evidence (link or note)

---

## Standard baseline (~15 items, every project)

### Code & deployment
1. **Final code merged to develop branch** — all sprints merged, no orphan branches
2. **Develop branch deployed to staging theme** — staging matches production-ready code
3. **Backup of current live theme created** (CRITICAL — mandatory per F12)
4. **Rollback procedure documented and ready** (per `03-rollback-procedure.md`)

### Quality gates
5. **All milestone QA passed (G5 confirmed for each milestone)** — verify in audit_log
6. **Project verification PASS (from PM Agent)** — READY_FOR_LAUNCH status
7. **Zero P1 bugs open** — verify in `project.json.bugs[]`
8. **Zero P2 bugs open** — verify in `project.json.bugs[]`
9. **P3/P4 bugs documented (resolved, deferred to warranty, or known limitation)** — accounted for

### Performance
10. **Lighthouse Performance ≥ threshold on production-like environment** — per `04-lighthouse-thresholds.md`
11. **Core Web Vitals pass on key pages** — LCP / CLS / INP all green

### Accessibility
12. **WCAG 2.1 AA verified** — axe-core 0 violations on key pages
13. **Manual screen reader testing complete** — key flows verified (per `_spine/qa-agent/knowledge/05-regression-protocol.md` § Pre-launch)

### Security
14. **No exposed credentials in code** — credential scan clean
15. **HTTPS enforced** — no mixed content warnings

This baseline is the floor. Every project gets these.

---

## Spec-driven items

For each item in `spec.scope.deliverables[]` and `spec.scope.integrations[]`, add checklist items.

### Per integration in spec
For each integration:
- **[Integration name] configured and tested** — verify each integration works end-to-end
  - Klaviyo: test webhook fires, list subscription works, transactional emails received
  - Judge.me: review submission works, reviews display correctly
  - GA4: events received in dashboard, conversion tracking works
  - Meta Pixel: events received in Events Manager
  - Shopify Payments: test transaction completes (in test mode)
  - ShipStation: order syncs to ShipStation
  - Custom apps: install verified, functioning per spec

### Per deliverable in spec
For each major deliverable:
- **[Deliverable name] meets acceptance criteria** — verify each AC checked off

### Per content responsibility
For each content type the agency owns:
- **[Content type] delivered and integrated** — meta titles/descriptions written, alt text added, etc.

### Per feature in spec
- **[Feature name] functional in production** — quizzes, configurators, etc.

---

## Platform-specific items

Different platforms have different launch requirements.

### Shopify-specific items
- **Theme published from staging to live** (via Shopify CLI or admin)
- **Theme settings verified** (brand colors, fonts, contact info correct)
- **Navigation menus configured** (main nav, footer nav)
- **Product collections set up** (auto-generated or manual)
- **Shipping zones configured** — Backend Agent verified (manual setup per D5)
- **Payment methods enabled** — Backend Agent verified (manual setup per D5)
- **Tax configuration** — Backend Agent verified (manual setup per D5)
- **Shopify Markets configured** (if multi-region)
- **Robots.txt liquid override applied** (if needed)
- **App permissions verified** (apps have correct scopes)
- **Shopify Plus B2B Companies set up** (if B2B Plus)
- **Discount codes configured** (if applicable)
- **Gift cards enabled** (if applicable)
- **Customer accounts set up** (legacy or new customer accounts)
- **Email templates customized** (Shopify transactional emails)
- **Theme protection enabled** (prevent accidental edits via theme editor)

### WordPress-specific items
- **WordPress permalinks configured** (Settings → Permalinks)
- **WordPress version updated to target** (per spec)
- **PHP version verified** (matches spec)
- **WordPress core security headers configured**
- **Plugin licenses activated** (Yoast, Rank Math, etc.)
- **WooCommerce settings verified** (if WooCommerce)
- **Caching plugin configured** (WP Rocket, W3 Total Cache, etc.)
- **Backup plugin configured** (UpdraftPlus, etc.)
- **Security plugin configured** (Wordfence, Sucuri, etc.)
- **Spam protection configured** (Akismet, etc.)
- **Database optimized**
- **wp-admin protected from indexing**
- **Database backup automated**

### Magento-specific items
- **Cache cleared and warmed** (`bin/magento cache:flush`)
- **Reindex run** (`bin/magento indexer:reindex`)
- **Static content deployed** (`bin/magento setup:static-content:deploy`)
- **DI compiled** (`bin/magento setup:di:compile`)
- **Production mode set** (`bin/magento deploy:mode:set production`)
- **Admin URL randomized** (security)
- **Store views configured** (if multi-store)
- **Tax rules configured**
- **Customer groups set up** (if B2B)

### BigCommerce-specific items
- **Stencil theme uploaded and published** (or via Page Builder)
- **Store settings verified** (currency, tax)
- **Shipping zones configured**
- **Payment gateway connected**
- **Tax configuration verified**
- **B2B Edition configured** (if applicable)
- **Apps installed and configured**

### Node.js / Headless-specific items
- **SSR/SSG configuration verified** (no client-side-only rendering of critical content)
- **Deployment target configured** (Vercel, Cloudflare, AWS, etc.)
- **Environment variables set on production**
- **Build process verified** (production build succeeds, no warnings)
- **CDN configured** (cache headers, image optimization)
- **API rate limits verified**
- **Hydration verified** (no mismatches between SSR and client)

---

## Project-type-specific items

### New Build
Standard items only (covered in baseline + spec-driven + platform).

### Redesign
- **URL preservation verified** — all existing URLs still resolve (per I17)
- **SEO baseline preserved or improved** — meta titles, descriptions, schemas migrated correctly
- **Existing content carried over** — products, blog posts, pages all present with original URLs
- **301 redirects mapped if URLs DID change** — per I16
- **GSC indexed URLs vs new sitemap match (or have redirects)**
- **Comparison with pre-launch baseline performance** — new site meets or exceeds previous Lighthouse scores

### Migration / Replatforming
- **Data parity verified** (product count, customer count, order count, blog post count match source)
- **Sample data audit** (10+ random records compared between source and target)
- **301 redirect map fully tested** (every source URL → correct target URL, no chains)
- **GSC change of address submitted** (if domain didn't change but platform did)
- **SEO metadata transferred** (titles, descriptions, schemas)
- **Customer notification sent** (if applicable — "We've moved to a new platform!")
- **Order history accessible to customers** (if migrated)
- **Email transactional templates working on new platform** (test order confirms, ships, etc.)
- **Cutover plan documented** (timing, DNS changes, downtime expected)

### Version Upgrade Only
- **All custom code compatible with new version**
- **All apps/plugins compatible with new version**
- **Theme/plugin updates applied**
- **Cache cleared after upgrade**
- **Reindex / rebuild completed (if applicable)**
- **Regression QA passed** (existing functionality unbroken)

### Headless Build
- **SSR/SSG works on every key page**
- **JavaScript-disabled fallback acceptable**
- **API contracts documented**
- **Backend platform's storefront API verified** (Storefront API for Shopify, GraphQL API for BC, etc.)
- **Cache invalidation strategy tested**
- **Deployment pipeline tested end-to-end**
- **Domain DNS configured** (if new domain or subdomain)

### B2B
- **Customer accounts with company hierarchy work**
- **NET terms configured per customer (if B2B Plus)**
- **Custom catalogs assigned correctly**
- **Wholesale pricing tested**
- **Quote-to-cart flow tested (if applicable)**
- **Approval workflows tested (if applicable)**
- **ERP integration tested** (orders sync, inventory updates)

---

## SEO checklist (always for projects with public site)

Beyond baseline performance/accessibility:
- **Sitemap.xml present and valid** — submitted to GSC + Bing Webmaster
- **robots.txt configured correctly** — allows desired pages, blocks admin
- **llms.txt present** (per I15)
- **Canonical tags on all pages**
- **Open Graph + Twitter Card meta tags present** (with appropriate images)
- **Schema markup validates** (Rich Results Test passes)
- **No accidental noindex tags on important pages**
- **GSC verified for production domain**
- **Bing Webmaster Tools verified**
- **GA4 configured and receiving events**
- **Meta Pixel configured (if applicable)**
- **Server-side tracking configured (if scoped — e.g., Stape/Elevar)**
- **Consent management configured** (if GDPR/CCPA applicable)

---

## Analytics checklist (when scoped)

- **GA4 property created and connected** — events firing correctly
- **GA4 conversion events configured** — purchase, add-to-cart, sign-up, etc.
- **Meta Pixel configured** (if applicable) — events visible in Events Manager
- **TikTok Pixel configured** (if applicable)
- **Server-side tracking configured** (if applicable — Stape, Elevar, etc.)
- **Consent management connected to analytics** (Cookiebot, OneTrust, etc.)
- **Tag Manager configured** (if applicable)
- **Microsoft Clarity or Hotjar configured** (if applicable)
- **Custom event tracking verified** (per spec)

---

## Item composition algorithm

```python
def compose_prelaunch_checklist():
    items = []

    # Step 1: Add baseline (always)
    items.extend(BASELINE_ITEMS)  # 15 items

    # Step 2: Spec-driven items
    for deliverable in spec.scope.deliverables:
        items.append(f"Deliverable [{deliverable.id}] {deliverable.name} verified against AC")

    for integration in spec.scope.integrations:
        items.append(f"Integration [{integration.name}] configured and tested")

    for content_owner_item in spec.scope.content_responsibility:
        if content_owner_item.owner == "agency":
            items.append(f"[{content_owner_item.type}] delivered and integrated")

    # Step 3: Platform-specific
    items.extend(get_platform_items(spec.project.platform))

    # Step 4: Project-type-specific
    items.extend(get_project_type_items(spec.project.project_type))

    # Step 5: SEO + Analytics (when applicable)
    if spec.includes_seo:
        items.extend(SEO_CHECKLIST)
    if spec.includes_analytics:
        items.extend(ANALYTICS_CHECKLIST)

    # Step 6: Conditional based on B2B modifier
    if "_b2b-modifier" in spec.modifiers:
        items.extend(B2B_CHECKLIST)

    # Step 7: Conditional based on discovery findings
    if spec.discovery_recommendations:
        items.extend(spec.discovery_specific_checklist_items)

    return items
```

Result: typically 25-60 items, all relevant to this specific project.

---

## Verification method per item

Each item is verified by:

### Programmatic (preferred)
- Automated check via Playwright, Lighthouse, axe, npm audit, custom scripts
- Output captured as evidence

### Manual (when no automation possible)
- Human verifies (Delivery Head requests human verification when needed)
- Evidence: screenshot, log, signed confirmation

### N/A (when not applicable)
- Explicitly marked N/A with reason
- Example: "Tax configuration N/A — client uses tax-exempt B2B only"
- Reason logged

NO checklist item is silently skipped. If not applicable, mark N/A. If applicable but unverifiable, halt.

---

## Pre-launch verification report format

```markdown
# Pre-Launch Verification Report — [Project Name]

**Project:** [Project Name] ([Project ID])
**Date:** [date]
**Verified by:** Delivery Head Agent v1.0
**Status:** READY_FOR_G6 | FAILED | INCOMPLETE

## Checklist Summary

- Total items: [N]
- Verified: [N]
- Failed: [N]
- N/A: [N]
- Pending: [N]

## Items by category

### Code & Deployment
- [✓] Final code merged to develop — Verified: PR #142 merged 2026-06-15
- [✓] Develop deployed to staging — Verified: staging theme ID 987654321 active
- [✓] Live theme backup created — Verified: backup theme "Aurora Skincare Backup 2026-06-20" created
- [✓] Rollback procedure documented — Verified: launch-runbook.md updated

### Quality Gates
- [✓] All milestones G5 confirmed — Verified: M1-M7 all confirmed in audit_log
- [✓] Project verification PASS — Verified: READY_FOR_LAUNCH from PM Agent
- [✓] Zero P1 bugs — Verified: bugs.csv shows 0 open P1
- [✓] Zero P2 bugs — Verified: bugs.csv shows 0 open P2
- [✓] P3/P4 documented — Verified: 5 documented as known limitations, 2 deferred to warranty

### Performance
- [✓] Lighthouse Performance ≥ 80 — Verified: Homepage 84, PDP 86, PLP 82
- [✓] Core Web Vitals pass — Verified: LCP 2.4s, CLS 0.02, INP 145ms

### Accessibility
- [✓] axe-core 0 violations — Verified: full scan report
- [✓] Manual screen reader complete — Verified: NVDA + VoiceOver tested 2026-06-18

### Security
- [✓] No exposed credentials — Verified: credential scan clean
- [✓] HTTPS enforced — Verified: SSL Labs A+ rating

### Spec-driven Items
- [✓] Deliverable D1 Homepage redesign — Verified: ACs met
- [✓] Deliverable D2 PDP template — Verified: ACs met
- [✓] Integration Klaviyo — Verified: test webhook + email received
- [✓] Integration Judge.me — Verified: review submission test passed
- [✓] Integration Shopify Payments — Verified: test transaction completed
- [✓] Integration GA4 — Verified: events in GA4 dashboard
- [✓] Integration Meta Pixel — Verified: events in Events Manager

### Platform-specific (Shopify)
- [✓] Theme settings verified
- [✓] Navigation menus configured
- [✓] Product collections set up
- [✓] Shipping zones configured (manual setup by client per D5)
- [✓] Payment methods enabled (manual setup by client)
- [✓] Tax configuration (manual setup by client)
- [N/A] Shopify Markets — Single market, not applicable

### Project-type (Redesign)
- [✓] URL preservation — All existing URLs resolve correctly
- [✓] SEO baseline preserved — Meta tags, schemas carried over
- [✓] Content migration complete — 47 products, 12 blog posts, all pages
- [N/A] 301 redirect map — Not needed, URLs preserved

### SEO
- [✓] Sitemap.xml — Submitted to GSC + Bing
- [✓] robots.txt — Verified
- [✓] llms.txt — Generated and verified
- [✓] Canonical tags — Audited
- [✓] OG + Twitter Card meta — Verified
- [✓] Schema markup — Rich Results Test passes
- [✓] No accidental noindex — Verified
- [✓] GSC verified for production
- [✓] Bing Webmaster verified
- [✓] GA4 receiving events
- [✓] Meta Pixel configured
- [N/A] Server-side tracking — Not in scope
- [N/A] Consent management — Not required (no EU traffic per spec)

## Pending items
None

## Failed items
None

## Recommendation
**READY for G6 approval.**

All 47 applicable items verified. 5 N/A items documented with reasons.
Awaiting human Delivery Head + Client sign-off via Internal PM.
```

---

## Anti-patterns

1. **Fixed 40-item checklist applied to every project.** Misses spec-specific items, includes irrelevant items.

2. **Marking items "verified" without evidence.** Every "verified" needs a link/log/screenshot.

3. **Silently skipping items.** Must explicitly N/A with reason.

4. **Composing checklist at the last minute.** Compose at milestone close (when entering pre-launch stage). Gives team time to address gaps.

5. **No project-type-specific items.** Migration without parity verification = data loss risk.

6. **No integration-specific verification.** "Klaviyo set up" is not enough. Test the actual integration end-to-end.

7. **Trusting client to verify their own scope.** Agency verifies. Client signs off. Both required.

---

Last reviewed: 2026-05-24 by Claude (initial)
Next review due: 2026-08-24
