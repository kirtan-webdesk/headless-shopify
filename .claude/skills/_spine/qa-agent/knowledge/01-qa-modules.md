---
tier: 2
load_when: ["agent-specific-detail"]
description: "Every sprint and milestone QA runs ALL 8 modules. Each module has defined inputs, tools, pass criteria, and outputs."
---

# 01 — The 8 QA Modules

> Every sprint and milestone QA runs ALL 8 modules. Each module has defined inputs, tools, pass criteria, and outputs.

---

## Module 1 — Code Validity

### What it checks
Static analysis of the codebase. Catches syntax errors, deprecated APIs, security anti-patterns, code style violations.

### Tools
- **Shopify projects:** `shopify theme check` + `theme-check` ESLint rules
- **WordPress projects:** `PHPCS` with WordPress Coding Standards ruleset
- **Magento projects:** `bin/magento dev:tests` + Magento Code Sniffer
- **BigCommerce projects:** Stencil CLI built-in linting
- **Node.js / headless:** ESLint + Prettier + TypeScript compiler (if applicable)
- **All:** language-specific linters (CSS Stylelint, etc.)

### Pass criteria
- Zero errors
- Warnings ≤ 3 per file (and reviewed)
- No deprecated API usage
- No `// TODO` or `// FIXME` in critical paths

### Output
- `qa-reports/[stage]/module-1-code-validity.md`
- Pass/fail summary + specific errors/warnings with file paths and line numbers

### When this fails
Sprint cannot pass G4. Frontend/Backend Agent must fix linter errors before re-running QA.

---

## Module 2 — Functional Testing

### What it checks
Does the site work as specified? Cart, checkout, forms, navigation, account flows, search, filters, integrations.

### Tools

**Scripted (Playwright):**
- E2E tests for critical flows:
  - Add to cart → cart drawer opens → cart count updates
  - Cart → checkout → order placed (test mode)
  - Customer signup → email verification → login
  - Search → filter → product detail
  - Newsletter signup → confirmation
- Form submissions (validation, error states, success states)

**Exploratory (Claude in Chrome — per `07-claude-in-chrome-usage.md`):**
- Edge cases not covered by scripted tests
- Novel user paths
- UX quality judgment ("does this feel right?")
- Dynamic content rendering verification
- JavaScript-heavy interaction testing

### Pass criteria
- All Playwright critical-path tests pass
- All acceptance criteria from sprint brief functionally verified
- Claude in Chrome exploration finds no P1/P2 issues
- Forms submit + validate + error correctly
- Integrations fire correctly (Klaviyo webhooks, GA4 events, etc. — verified via Network tab + dashboard)

### Output
- `qa-reports/[stage]/module-2-functional.md`
- Playwright HTML report (link)
- Claude in Chrome session log
- Bug entries for any P1/P2/P3 found

### When this fails
Critical flow broken = P1, must fix.
Edge case broken = P2 or P3 depending on impact.

---

## Module 3 — Responsive Testing

### What it checks
Layout, interactions, and content rendering across 5+ breakpoints.

### Tools

**Playwright at fixed viewports:**
- 375px (iPhone SE / older Android baseline)
- 414px (iPhone Pro Max / Plus)
- 768px (iPad portrait)
- 1024px (iPad landscape / small desktop)
- 1440px (standard desktop)
- 1920px (optional, wide desktop)

Tests per breakpoint:
- Screenshot capture (visual regression base)
- No horizontal scroll
- All interactive elements visible
- Navigation accessible
- Cart accessible
- Search accessible

**Claude in Chrome:**
- Actual responsive interaction (not just screenshot)
- Touch target verification (Claude reports if elements feel small)
- Thumb zone check (primary CTAs in reachable area on mobile)
- Visual hierarchy verification (is what should be prominent actually prominent?)

### Pass criteria
- No horizontal scroll at any breakpoint (unless intentional carousel)
- All primary CTAs visible and tappable at all breakpoints
- Navigation works at mobile (hamburger or bottom-nav)
- Cart accessible at mobile
- No content overflow / cropping
- Touch targets ≥ 44×44 at mobile/tablet

### Output
- `qa-reports/[stage]/module-3-responsive.md`
- Screenshots per breakpoint (in `evidence/responsive/`)
- Visual regression report (vs. previous version if available)

---

## Module 4 — Cross-Browser Testing

### What it checks
Site works across major browsers.

### Tools

**Playwright browser matrix:**
- Chromium (Chrome, Edge)
- Firefox
- WebKit (Safari)

Tests per browser:
- Homepage renders
- PDP renders
- Cart functions
- Checkout reaches payment step
- Forms submit
- Key interactions work (variant picker, cart drawer, etc.)

**Real device verification (manual or BrowserStack):**
- iOS Safari (latest 2 versions)
- Android Chrome (latest)
- Desktop Chrome (latest)
- Desktop Safari (latest)
- Desktop Firefox (latest)
- Desktop Edge (latest)

### Pass criteria
- No browser-specific layout breaks
- No browser-specific JS errors (check DevTools console)
- All interactions work consistently
- Performance acceptable on each browser

### Output
- `qa-reports/[stage]/module-4-cross-browser.md`
- Per-browser issues list (if any)
- Browser versions tested

### When this fails
Browser-specific P1/P2 = fix before sprint passes.
Browser-specific edge case (e.g., Safari 16 minor visual quirk) = P3, deferrable.

---

## Module 5 — Accessibility

### What it checks
WCAG 2.1 AA compliance + agency-stricter rules per I.3.

### Tools

**Automated (Playwright + axe-core):**
- Run axe-core on every page tested
- Catches 30-40% of accessibility issues

axe checks include:
- Color contrast (validates against tokens)
- ARIA usage
- Form labels
- Heading hierarchy
- Image alt text
- Keyboard accessibility
- Landmark regions

**Manual (at milestone level):**
- Keyboard navigation: Tab through every interactive element
- Focus indicators visible
- Skip links work
- ARIA live regions announce dynamic content
- Form errors announced

**Screen reader (at pre-launch only):**
- NVDA on Windows
- VoiceOver on Mac
- Spot-check key flows (homepage scan, PDP variant picker, cart, checkout)

### Pass criteria
- **axe-core: 0 violations** (hard gate)
- Keyboard navigation: every interactive element reachable + operable
- Focus indicators visible on all interactive elements
- All forms accessible (labels, error announcements)
- Heading hierarchy correct (one H1, no skipped levels)
- All images have alt text (decorative = empty alt explicitly)

### Output
- `qa-reports/[stage]/module-5-accessibility.md`
- axe-core JSON report
- Manual review notes
- Screen reader testing report (pre-launch only)

### When this fails
Any axe violation = must fix. WCAG AA is a hard requirement.

---

## Module 6 — Performance

### What it checks
Core Web Vitals + Lighthouse scores per `04-lighthouse-thresholds.md`.

### Tools

**Lighthouse CI:**
- Run on every page in the sprint scope
- Mobile + desktop modes
- Core Web Vitals: LCP, CLS, INP, TBT, FCP, TTFB

**WebPageTest (optional, deeper diagnostics):**
- For projects where performance is critical
- Real device + network throttling

**Bundle size analysis:**
- JS bundle size (initial + lazy-loaded)
- CSS bundle size
- Image sizes

### Pass criteria
Per `04-lighthouse-thresholds.md`:
- **Normal projects:** LCP ≤ 3.0s, Lighthouse Performance ≥ 80
- **Headless projects:** LCP ≤ 2.0s, Lighthouse Performance ≥ 90
- **All projects:** Lighthouse Accessibility ≥ 95
- **All projects:** Lighthouse SEO ≥ 95
- **All projects:** Lighthouse Best Practices ≥ 90
- **All projects:** CLS ≤ 0.05
- **All projects:** INP ≤ 200ms
- Bundle size within performance budget (per template, from spec)

### Output
- `qa-reports/[stage]/module-6-performance.md`
- Lighthouse CI HTML reports (link)
- Bundle analysis report
- Performance trend chart (vs. previous milestone)

### When this fails
Performance below threshold = P2 (won't crash but affects users). Must investigate before milestone close.

---

## Module 7 — SEO

### What it checks
SEO baseline per `_spine/pm-agent/knowledge/[seo-baseline].md` and project's spec.

### Tools

**Automated checks:**
- Lighthouse SEO category
- Custom programmatic checks:
  - Meta title length (50-60 chars)
  - Meta description length (150-160 chars)
  - Canonical tags present
  - One H1 per page, no skipped levels
  - Image alt text present
  - Schema markup validates (Google Rich Results Test API)
  - Sitemap.xml exists + validates
  - robots.txt valid
  - llms.txt present
  - Internal links not broken
  - 301 redirects (for redesigns/migrations) — no chains

**Claude in Chrome:**
- Verify dynamic content renders for crawlers (SSR/SSG verification on headless)
- Check that schema appears in rendered HTML, not just JSON-LD that may not be rendered

**Pre-launch only:**
- Full crawl with Screaming Frog or similar
- Audit existing site (for redesigns) and verify URL preservation

### Pass criteria
- All title tags + meta descriptions present and within length
- Schema markup validates (no errors)
- Heading hierarchy correct
- All images have alt
- Sitemap.xml valid + submitted to GSC + Bing Webmaster
- robots.txt valid
- llms.txt present (per I15)
- No broken internal links
- No redirect chains (for redesigns/migrations)
- Lighthouse SEO ≥ 95

### Output
- `qa-reports/[stage]/module-7-seo.md`
- Schema validation reports
- Sitemap audit report
- Redirect map verification (for redesigns/migrations)

---

## Module 8 — Security

### What it checks
Security baseline + no exposed credentials + dependencies up to date.

### Tools

**Automated:**
- `npm audit` (for JS dependencies)
- Snyk or Dependabot (for vulnerability scanning)
- Custom credential scanner (regex for exposed API keys in code)
- Security headers check (CSP, HSTS, X-Frame-Options, X-Content-Type-Options)

**Manual review:**
- No `eval()`, `Function()`, or dynamic code execution
- No inline scripts (unless explicitly approved)
- Form CSRF tokens present
- No SQL injection vectors (parameterized queries)
- No XSS vectors (proper escaping of user content)
- Third-party scripts vetted (source + purpose documented)

### Pass criteria
- Zero high-severity dependency vulnerabilities (medium can be deferred with mitigation)
- No exposed credentials in repo
- Security headers configured
- No `eval()` or dynamic code execution in custom code
- Input sanitization on all user inputs
- Output escaping on all user content
- HTTPS enforced (no mixed content)

### Output
- `qa-reports/[stage]/module-8-security.md`
- npm audit / Snyk report
- Security headers verification
- Credential scan results

### When this fails
Any high-severity vulnerability or exposed credential = P1 (data risk). Must fix before any progression.

---

## Module result summary format

After running all 8 modules:

```markdown
# Sprint QA Report — [Sprint ID]

**Sprint:** S2.1
**Tested:** 2026-05-30
**Tester:** QA Agent v1.0
**Status:** PASS | PASS_WITH_FLAGS | FAIL

## Module Results

| Module | Status | Bugs Found | Notes |
|--------|--------|-----------:|-------|
| 1. Code Validity | PASS | 0 | All linters pass |
| 2. Functional | PASS | 1 (P3) | Edge case in cart drawer animation |
| 3. Responsive | PASS | 0 | All 5 breakpoints clean |
| 4. Cross-Browser | PASS_WITH_FLAGS | 0 | Safari minor: focus ring 1px off |
| 5. Accessibility | PASS | 0 | axe: 0 violations |
| 6. Performance | PASS | 0 | Lighthouse 84 / LCP 2.4s |
| 7. SEO | PASS | 0 | Schema validates, meta tags present |
| 8. Security | PASS | 0 | No vulnerabilities, no exposed credentials |

## Acceptance Criteria
- [✓] AC1: [criterion] — VERIFIED
- [✓] AC2: [criterion] — VERIFIED
- [✓] AC3: [criterion] — VERIFIED

## Bugs Found
- BUG-014 (P3): Cart drawer animation jumps on Safari iOS 17. See bug-014.md.

## Overall Status: PASS_WITH_FLAGS
1 P3 bug found (non-blocking). Acceptance criteria all verified.
Recommend G4 opens for human approval.
```

---

## Anti-patterns

1. **Skipping a module because "it's not relevant this sprint".** Run it anyway, report "N/A" if truly not changed.

2. **Combining module results into vague summary.** Be specific per module.

3. **Downgrading severity to make report look better.** P2 is P2. Don't call it P3.

4. **Running axe but not interpreting results.** axe reports false positives sometimes. Investigate each, don't blanket fail or blanket pass.

5. **Pre-launch QA that skips manual screen reader.** axe catches 30-40%. Manual is the other 60-70%.

6. **No bug evidence (screenshots, video, repro steps).** Every bug needs reproducible evidence. Otherwise it's a vague complaint.

---

Last reviewed: 2026-05-24 by Claude (initial)
Next review due: 2026-08-24
