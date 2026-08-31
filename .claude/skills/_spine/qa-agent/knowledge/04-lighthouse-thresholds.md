---
tier: 2
load_when: ["agent-specific-detail"]
description: "Per I2 decisions: differentiated thresholds for normal projects vs headless projects. Lighthouse CI as hard pre-merge gate."
---

# 04 — Lighthouse Thresholds

> Per I2 decisions: differentiated thresholds for normal projects vs headless projects. Lighthouse CI as hard pre-merge gate.

---

## Threshold matrix

### Normal projects (Shopify standard themes, WordPress, BigCommerce non-headless, Magento non-Hyva)

| Metric | Threshold | Source |
|--------|----------:|--------|
| Lighthouse Performance | ≥ 80 | I2 Option A |
| Lighthouse Accessibility | ≥ 95 | I3 (all projects) |
| Lighthouse SEO | ≥ 95 | I2 SEO best practice |
| Lighthouse Best Practices | ≥ 90 | Recommended |
| LCP (Largest Contentful Paint) | ≤ 3.0s | I2 Option A |
| CLS (Cumulative Layout Shift) | ≤ 0.05 | Stricter than Google's 0.1 |
| INP (Interaction to Next Paint) | ≤ 200ms | Google "good" threshold |
| TBT (Total Blocking Time) | ≤ 200ms | Google "good" threshold |
| FCP (First Contentful Paint) | ≤ 1.8s | Recommended |
| TTFB (Time to First Byte) | ≤ 0.8s | Recommended |

### Headless projects (Shopify Hydrogen/Oxygen, BC Catalyst, Magento Hyva, custom React)

| Metric | Threshold | Source |
|--------|----------:|--------|
| Lighthouse Performance | ≥ 90 | I2 Option A (headless) |
| Lighthouse Accessibility | ≥ 95 | I3 (all projects) |
| Lighthouse SEO | ≥ 95 | I2 SEO best practice |
| Lighthouse Best Practices | ≥ 95 | Stricter for headless |
| LCP (Largest Contentful Paint) | ≤ 2.0s | I2 Option A (headless) |
| CLS (Cumulative Layout Shift) | ≤ 0.05 | Stricter than Google's 0.1 |
| INP (Interaction to Next Paint) | ≤ 200ms | Google "good" threshold |
| TBT (Total Blocking Time) | ≤ 150ms | Stricter for headless |
| FCP (First Contentful Paint) | ≤ 1.2s | Stricter for headless |
| TTFB (Time to First Byte) | ≤ 0.4s | SSR/SSG should be fast |

---

## When to upgrade to Google "Good" thresholds (I2 Option B)

These are stricter targets. Use when:
- Client has explicitly contracted for "Google Good" performance
- Project is high-performance critical (e.g., conversion optimization focus)
- Client is paying for performance optimization addon
- Headless projects often hit these naturally

Google "Good" thresholds:
- LCP ≤ 2.5s
- CLS ≤ 0.1
- INP ≤ 200ms
- FCP ≤ 1.8s
- Lighthouse Performance ≥ 90

If a project is contracted at these thresholds, QA Agent uses these instead of normal thresholds. Documented in spec.

---

## Pages to test

QA Agent runs Lighthouse on these pages minimum (per sprint, where applicable):

1. **Homepage** (always)
2. **Featured PDP** (a representative product detail page)
3. **PDP variant** (test variant switching performance)
4. **Featured PLP** (collection / category page)
5. **Cart page**
6. **Account page** (if customized)
7. **Search results page** (if customized)
8. **404 page**

At milestone level, expand to:
9. **Blog post** (if applicable)
10. **About / contact / utility pages**
11. **Checkout** (if customizable — Shopify standard checkout not testable)

Per-page thresholds may differ. Cart can be faster than homepage. Homepage may need to allow more weight because of marketing demands.

---

## Mobile vs Desktop testing

Lighthouse tests at TWO modes:

- **Mobile:** Throttled 4G, Moto G Power simulation (default Lighthouse mobile)
- **Desktop:** Standard desktop, no throttling

Both modes must pass threshold. Mobile is harder.

QA Agent runs both. Reports per-page-per-mode results.

---

## Per-template performance budgets (from spec)

Beyond Lighthouse, each template has a performance budget per `_spine/designer-agent/03-token-system-standards.md` and spec:

| Template | Total page weight |
|----------|------------------:|
| Homepage | ≤ 1.5MB |
| PDP | ≤ 1.2MB |
| PLP / Collection | ≤ 1.2MB |
| Cart | ≤ 600KB |
| Checkout (where editable) | ≤ 500KB |
| Account / utility | ≤ 400KB |

If a page exceeds its budget, QA Agent flags even if Lighthouse passes.

---

## How Lighthouse CI runs

QA Agent invokes Lighthouse CI:

```bash
# Per page, per mode
lhci autorun \
  --collect.url=[page URL] \
  --collect.numberOfRuns=3 \
  --assert.preset=lighthouse:recommended \
  --assert.assertions.performance=warn:[threshold] \
  --assert.assertions.accessibility=warn:95 \
  --assert.assertions.seo=warn:95 \
  --assert.assertions.best-practices=warn:90
```

3 runs per page (Lighthouse can have variance) — use median or worst result.

---

## Threshold failure handling

When a page fails threshold:

1. QA Agent identifies the failing metric(s)
2. Reads Lighthouse report for specific diagnostics
3. Surfaces issues to developer:

```
Performance failure — Homepage Mobile

Lighthouse Performance: 72 (target: ≥80)

Specific issues from Lighthouse:
- Largest Contentful Paint: 3.8s (target: ≤3.0s)
  - LCP element: <img class="hero__bg">
  - Cause: image not optimized, no preload
  - Recommended: convert to WebP, add fetchpriority="high", preload in <head>
- Cumulative Layout Shift: 0.18 (target: ≤0.05)
  - Cause: hero image has no width/height attributes
  - Recommended: add explicit dimensions
- Total Blocking Time: 540ms (target: ≤200ms)
  - Cause: third-party Klaviyo script blocking main thread
  - Recommended: defer script, or load only on relevant pages

Severity: P2 (significant performance regression)
Action: Frontend Agent to address. Re-run after fix.
```

QA Agent does NOT fix. Reports + waits for fix command.

---

## Trend tracking

Lighthouse scores are tracked over time. QA Agent maintains:

`qa-reports/lighthouse-trend.csv`:
```
Date, Sprint, Page, Mode, Performance, Accessibility, SEO, LCP, CLS, INP
2026-05-15, S1.3, Homepage, Mobile, 87, 98, 96, 2.4s, 0.02, 145ms
2026-05-22, S2.1, Homepage, Mobile, 84, 98, 96, 2.6s, 0.02, 150ms
2026-05-29, S2.4, Homepage, Mobile, 78, 97, 96, 3.1s, 0.04, 180ms ← regression
```

Regressions across sprints flagged at milestone QA:
> "Performance regressed by 9 points across M2. Specifically: LCP grew from 2.4s to 3.1s. Investigation needed before milestone closes."

---

## Common performance issues & fixes

### LCP too slow
- Hero image not optimized → convert to WebP/AVIF, add srcset
- LCP image not preloaded → add `<link rel="preload" as="image">`
- Hero image loaded lazy → remove `loading="lazy"` from above-fold image
- LCP element is web font text → use `font-display: swap` + preload

### CLS too high
- Images without dimensions → add `width` and `height` attributes
- Ads / embeds loading dynamically → reserve space with placeholder
- Late-loading fonts shifting text → preload critical fonts
- Late-loaded section pushing content → reserve container height

### INP / TBT too high
- Long-running JavaScript on main thread → split bundles, defer non-critical
- Third-party scripts blocking → defer or async-load
- Heavy event handlers → debounce/throttle, optimize handlers
- Layout thrash in animations → use transform/opacity only

### Best Practices score low
- HTTP instead of HTTPS resources → migrate all to HTTPS
- Deprecated APIs → update
- Console errors → fix
- Browser errors → fix

### SEO score low
- Missing meta description → add
- Missing alt text → add
- Heading hierarchy issues → fix
- Slow page (affects SEO via CWV) → improve performance

---

## Mobile-specific performance considerations

Lighthouse mobile is throttled (4G, slower CPU). Mobile failures often stem from:

- Too much JavaScript (parse + execute time matters)
- Heavy hero images (large file sizes hurt mobile)
- Many third-party scripts (each adds latency)
- Render-blocking resources (defer everything non-critical)
- Web fonts (multiple weights / styles = multiple requests)

Mobile-first design (per `_spine/designer-agent/06-mobile-first-rules.md`) helps. Designer Agent's performance-aware decisions matter here.

---

## When Lighthouse can't be trusted

Lighthouse is a synthetic test on a single device + network condition. Real-world performance varies.

Use Lighthouse for:
- Trend tracking
- Regression detection
- Threshold gating

Don't use Lighthouse for:
- Replacing real user monitoring (RUM data is more accurate)
- Final word on "is this fast enough" — Google's actual CrUX data (Chrome User Experience Report) is what affects SEO ranking

Recommendation: in addition to Lighthouse CI, integrate web-vitals.js in production code to gather RUM data. Report monthly.

---

## Anti-patterns

1. **Setting thresholds at exactly Lighthouse "passing" (50-90).** Too lenient. WebDesk standard is "good" range. Headless: "excellent" range.

2. **Running Lighthouse once and trusting result.** Lighthouse has variance. Run 3+ times, use median.

3. **Testing only homepage.** Cart, PDP, PLP, checkout all matter. Test all.

4. **Ignoring CLS.** Layout shifts hurt UX badly. CLS ≤ 0.05 is non-negotiable.

5. **Letting performance degrade incrementally.** Each sprint loses 2-3 points "to fit features." After 5 sprints, scores are 15 points lower. Set hard gates, enforce.

6. **Throwing performance at the end.** Performance must be considered every sprint, not "we'll optimize before launch."

---

Last reviewed: 2026-05-24 by Claude (initial)
Next review due: 2026-08-24
