---
tier: 1
load_when: ["code-review"]
description: "Every check Code Review Agent performs on a PR. Maps to H5-H11 from the locked inventory."
---

# 01 — Review Checks

> Every check Code Review Agent performs on a PR. Maps to H5-H11 from the locked inventory.

---

## Check categories

The agent runs 6 categories of checks per PR, then classifies findings by severity (per `02-severity-classification.md`).

```
1. Hallucinated APIs / imports     (H6)
2. Forbidden patterns               (H7)
3. Security                         (H8)
4. Performance impact               (H9)
5. Accessibility regressions       (H10)
6. SEO compliance                   (H11)
```

Plus, related deterministic checks run via linters / Lighthouse / axe-core:
- Code style (linter — not Code Review Agent's job)
- Schema validation (linter)
- Standard accessibility violations (axe-core)
- Performance scores (Lighthouse CI)

Code Review Agent focuses on what these tools miss — semantic understanding, pattern recognition, judgment.

---

## Check 1: Hallucinated APIs / Imports (H6)

### What to look for

AI agents (Frontend, Backend) sometimes invent functions, methods, or imports that don't actually exist. Most common in:
- Shopify Liquid filters (e.g., made-up filter names)
- WordPress hook names (invented WP filters/actions)
- Magento method names
- Third-party app API methods
- JavaScript library functions

### How to check

For each function call / import / API method in the diff:

```
1. Identify the call: e.g., {{ product | format_handle: 'reverse' }}
2. Check if 'format_handle' is a real Shopify Liquid filter
   - Cross-reference Shopify docs (anchored in /skills/shopify/pointers/shopify-docs.md)
   - Cross-reference platform reference materials in KB
3. If not found:
   - Flag as P1 (will fail at runtime)
   - Suggest correct function/filter if known
```

### Examples to catch

**Shopify Liquid:**
```liquid
{# This filter doesn't exist - hallucinated #}
{{ collection | sort_by: 'price' }}

{# Correct version #}
{% assign sorted_products = collection.products | sort: 'price' %}
```

**WordPress:**
```php
// This hook doesn't exist - hallucinated
add_action('wp_before_render_block', 'my_callback');

// Correct hook name
add_filter('render_block', 'my_callback', 10, 2);
```

**JavaScript:**
```javascript
// This Array method doesn't exist - hallucinated
products.findFirstByPrice(20);

// Correct version
products.find(p => p.price === 20);
```

### Confidence calibration

If unsure whether something is hallucinated:
- Flag as P3 with note "Verify this function exists in [API/library] [version]"
- Don't block PR for uncertainty — but bring it to dev's attention

---

## Check 2: Forbidden patterns (H7)

### What to look for

**v1.5.4 — TWO files load on every PR (D-PLAT-01):**

1. **`_spine/shared-knowledge/forbidden-global.md`** — cross-platform rules (SEC, COMM, A11Y, SEO, JS, PERF, DES, INT families)
2. **`{platform}/knowledge/09-forbidden.md`** — platform-specific rules (LIQ, MAG, ADC, WP, WC, BC families)

Where `{platform}` is read from `project.json.platform` (one of: `shopify`, `shopify-plus`, `bigcommerce`, `magento`, `adobe-commerce`, `wordpress`, `woocommerce`).

Platform mapping for forbidden file location:

The platform's forbidden file lives at the pattern:

```
skills/<active-platform>/knowledge/09-forbidden.md
```

Where `<active-platform>` is derived from `project.json.platform` (or `CLAUDE.md.platform_config.platform`). Each platform arm publishes its own 09-forbidden.md file. Only the ACTIVE platform's file is loaded during review — the routing is per-project, not multi-platform per session.

Both files contribute checks. Every entry in EITHER becomes a check.

### How to check

```
1. Load forbidden-global.md (always; Tier 1)
2. Read project.json.platform to determine platform
3. Load the corresponding platform's 09-forbidden.md
4. For each forbidden pattern across BOTH files:
   a. Scan the diff for the pattern
   b. If found:
      - Reference the specific rule ID (e.g., LIQ-001, SEC-004, COMM-002)
      - Quote the relevant code line
      - Suggest the approved alternative
   c. Severity per the rule's declared severity (P1 / P2 / P3)
```

### Examples from forbidden-global.md (apply to all platforms)

- **SEC-004** "Never push without --nodelete" → flag any direct `shopify theme push` (without wrapper) or equivalent for other platforms
- **COMM-001** "No hardcoded client emails" → flag any literal email matching `client_contact_blocklist`
- **A11Y-001** "Never use `<div>` as a button" → flag `<div onclick>` patterns
- **DES-003** "No inline `<style>` in templates" → flag `<style>` blocks in template files
- **JS-001** "Never use jQuery" → flag `$()` syntax or `import jquery`

### Where platform-specific rules live

Actual platform-specific rule sets are defined in each platform arm's `09-forbidden.md`:

- Universal / cross-platform rules → `_spine/shared-knowledge/forbidden-global.md`
- Per-platform rules → `skills/<platform>/knowledge/09-forbidden.md`

Rule IDs are namespaced by platform (per D-PLAT-01):

| Platform | Rule ID prefixes | Typical categories |
|----------|-------------------|---------------------|
| Universal | SEC, COMM, DES, INT, A11Y, SEO, JS, PERF | Cross-platform safety + hygiene |
| Shopify | LIQ, plus Shopify-scoped SEC | Liquid + Shopify-specific patterns |
| WordPress + WooCommerce | WP, WC, PB | PHP + WP-specific + page-builder patterns |
| BigCommerce | BC | (populated post-pilot) |
| Magento + Adobe Commerce | MAG, ADC | (populated post-pilot) |

For the illustrative example content behind each prefix, read the corresponding platform arm's `09-forbidden.md` in the active edition. Code Review Agent loads BOTH the global file AND the active platform's file at review time.

### Behavior when platform's 09-forbidden.md has no rules yet (scaffold only)

For platforms not yet piloted (BigCommerce, Magento, Adobe Commerce, WordPress, WooCommerce in v1.5.4):

- Code Review Agent still loads the scaffold file (zero rules)
- All checks come from `forbidden-global.md` only
- This is intentional — covers safety + general best practices
- Platform-specific rules accumulate post-pilot via K4 feedback loop

### Mockup file scanning (v1.5.5 — DES-002 enforcement)

Per D-DES-01: mockups ARE production scaffold. DES-002: mockup code must meet production quality bar.

**Mockup file paths the scanner must cover:**

```
/projects/*/mockups/**/*.html
/projects/*/mockups/**/*.css
/projects/*/mockups/**/*.js
/projects/*/mockups/**/*.scss
/projects/*/mockups/assets/**/*
```

**Rules applied to mockup files:**

All rules from `forbidden-global.md` apply directly:
- DES-001 / DES-002 / DES-003 (mockup workflow + quality bar + no inline style)
- A11Y-001 through A11Y-005 (semantic HTML, alt text, focus, hierarchy)
- SEO-001 (meta), SEO-003 (canonical) — mockup HTML must include
- JS-001 (no jQuery), JS-002 (web components), JS-003 (no eval), JS-005 (defer)
- PERF-001 (image dimensions), PERF-003 (lazy load below fold)
- SEC-008 (no hardcoded client contacts)
- COMM-001 / COMM-002 (no hardcoded emails, no client-domain form actions)

Platform-specific rules from active platform's `09-forbidden.md` are ALSO applied to mockup files when:
- Mockup is in a Liquid-compatible structure → apply LIQ-009 (no inline `<style>` blocks)
- Mockup is for a Shopify project → apply SH section pattern rules

**Mockup-specific additional checks (run only on `/mockups/` paths):**

```
M1 — Every page mockup file has <header>, <main>, <footer> landmarks (per 09-html-mockup-standards.md H1)
M2 — Exactly one <h1> per mockup page (H2)
M3 — All <img> have width AND height attributes (H7)
M4 — No inline <style> blocks in HTML (DES-003 / LIQ-009)
M5 — No inline <script> blocks without src (LIQ-001 / J2)
M6 — All section CSS files use var(--*) tokens, not hardcoded hex (per 09-html-mockup-standards.md C2)
M7 — Media queries present in CSS (responsive demonstrated, per H8)
M8 — focus-visible styles present (A11Y-004 enforcement)
M9 — Mockup README.md present in /mockups/ directory
```

**How the scan runs:**

```bash
# Triggered by:
# 1. PR that touches /mockups/**
# 2. Manual: /review --mockup-only [client-slug]
# 3. Designer Agent's G2 pre-flight via tools/scripts/validate-mockup.sh

./tools/scripts/validate-mockup.sh --client kitchen-blockers
# Returns 0 if all M1-M9 + forbidden-global + platform-forbidden rules pass

# Then Code Review Agent runs its own pass against the mockup files
```

**Severity differentiation:**

Mockup violations are NOT downgraded just because "it's only a mockup":
- DES-002 explicitly says quality bar = production quality
- A P1 violation in mockup is still P1
- The mockup IS the production scaffold; Frontend Agent inherits its bugs

**Code Review Agent comments on mockup PRs:**

```
[Forbidden pattern detected — mockup file:line]
Rule: A11Y-001 (forbidden-global.md) — "Never use `<div>` as a button"
Location: projects/kitchen-blockers/mockups/index.html:142
Found: <div class="cta" onclick="window.location='/products'">Shop now</div>
Recommended: <button type="button" class="cta" onclick="...">Shop now</button>
Severity: P2
Note: This is mockup code but inherits production quality bar per DES-002.
       Fix here saves Frontend Agent the same fix in production.
```

### Format

```
[Forbidden pattern detected — file:line]
Rule: LIQ-001 (shopify/09-forbidden.md) — "Never use inline `<script>` blocks in sections"
Location: sections/aurora-hero.liquid:47
Found: <script>console.log('analytics')</script>
Recommended: Move script to assets/section-aurora-hero.js, load via <script src=... defer>
Severity: P2
```

Cite the file AND rule ID so developers can find the source rule quickly:
- `LIQ-NNN`, `SEC-001/002/003`, `PERF-002`, `SEO-002` → `shopify/09-forbidden.md`
- Platform-prefixed codes → `<active-platform>/09-forbidden.md`
- All others (`SEC-004+`, `COMM-*`, `A11Y-*`, `SEO-001/003/004`, `JS-*`, `PERF-001/003/004`, `DES-*`, `INT-*`) → `forbidden-global.md`

---

## Check 3: Security (H8)

### What to look for

Security issues that linters / static analysis tools miss.

### Specific checks

#### 3a. No inline scripts (where forbidden)

```html
<!-- BAD -->
<script>document.cookie = 'something'</script>

<!-- GOOD -->
<script src="/assets/scripts.js" defer></script>
```

Severity: P2 (XSS risk, CSP violation)

#### 3b. No eval / Function constructor

```javascript
// BAD
eval(userInput);
new Function(userInput);

// GOOD
// Refactor to not need dynamic code execution
```

Severity: P1 (severe security risk)

#### 3c. No exposed credentials

Search diff for patterns like:
```
sk_live_[a-zA-Z0-9]+   (Stripe live keys)
shpat_[a-zA-Z0-9]+     (Shopify Admin tokens)
AIza[a-zA-Z0-9]+       (Google API keys)
[pP]assword.*=.*['"]\w+ (hardcoded passwords)
api_key:\s*['"]\w+      (hardcoded API keys)
```

If any matched: P1 (credential leak), block merge immediately.

#### 3d. No XSS vectors

Look for:
- `innerHTML = userControlledData` (no escaping)
- Template strings interpolating untrusted data without escaping
- Server-side rendering of user content without escaping
- `dangerouslySetInnerHTML` in React without sanitization

Severity: P1 if user-controlled, P2 if uncertain origin

#### 3e. No insecure protocols

- HTTP URLs where HTTPS available
- Mixed content (HTTP resources on HTTPS page)
- `target="_blank"` without `rel="noopener noreferrer"` (tabnabbing risk)

Severity: P2 or P3

#### 3f. No SQL injection vectors (WordPress, Magento)

```php
// BAD
$wpdb->query("SELECT * FROM users WHERE id = $user_id");

// GOOD
$wpdb->prepare("SELECT * FROM users WHERE id = %d", $user_id);
```

Severity: P1

#### 3g. No CSRF token bypass

For forms, check that CSRF protection is present per platform convention.

---

## Check 4: Performance impact (H9)

### What to look for

Changes that could regress Lighthouse Performance score or Core Web Vitals.

### Specific checks

#### 4a. Image attributes

```html
<!-- BAD -->
<img src="hero.jpg">

<!-- GOOD -->
<img src="hero.jpg" width="1200" height="800"
     loading="lazy" decoding="async"
     srcset="hero-400.jpg 400w, hero-800.jpg 800w, hero-1200.jpg 1200w"
     sizes="(max-width: 768px) 100vw, 1200px"
     alt="Aurora skincare hero">
```

Missing attributes → P3.
Below-fold image with `loading="eager"` → P3.
Above-fold (LCP) image with `loading="lazy"` → P2 (delays LCP).

#### 4b. Render-blocking scripts

```html
<!-- BAD -->
<head>
  <script src="analytics.js"></script>
</head>

<!-- GOOD -->
<head>
  <script src="analytics.js" defer></script>
</head>
```

Render-blocking scripts in head → P2 (delays LCP, hurts performance).

#### 4c. Heavy synchronous JavaScript

Large blocks of synchronous JS, especially with loops or DOM manipulation → P3.

#### 4d. New large dependencies

Adding a new npm package that's > 50KB minified → flag for review:
> "This PR adds [package-name] (X KB). Justify the size, OR find a lighter alternative."

P3 (worth discussing, not blocking).

#### 4e. Layout-thrashing animations

Animating `width`, `height`, `top`, `left` instead of `transform` and `opacity`:

```css
/* BAD - causes layout */
@keyframes slide {
  from { left: 0; }
  to { left: 100%; }
}

/* GOOD - GPU accelerated */
@keyframes slide {
  from { transform: translateX(0); }
  to { transform: translateX(100%); }
}
```

P3.

#### 4f. Excess third-party scripts

If PR adds another tracking pixel, chat widget, or analytics tool, flag for review:
> "This PR adds [third-party] which loads X KB and Y network requests. Confirmed approved by stakeholders?"

P3.

### Performance review summary

```
Performance Impact Summary
- Bundle size delta: +12KB (was 245KB, now 257KB)
- New dependencies: 0
- Render-blocking changes: 0
- Image optimization: 3 new images, 2 missing width/height (flagged)
- LCP risk: low (no critical-path changes)

Overall: PASS_WITH_FLAGS (2 P3 image attribute issues)
```

---

## Check 5: Accessibility regressions (H10)

### What to look for

Accessibility issues that axe-core might miss OR that need contextual judgment.

### Specific checks

#### 5a. Missing alt text

```html
<!-- BAD -->
<img src="product.jpg">

<!-- GOOD - decorative -->
<img src="decorative-bg.jpg" alt="">

<!-- GOOD - meaningful -->
<img src="product.jpg" alt="Aurora Cleanser product on white background">
```

P2 if image is meaningful, P3 if decorative.

#### 5b. Non-semantic interactive elements

```html
<!-- BAD - div as button -->
<div onclick="handleClick()" class="button">Click me</div>

<!-- GOOD -->
<button type="button" onclick="handleClick()">Click me</button>
```

P2 (keyboard inaccessible, screen reader unfriendly).

#### 5c. Missing form labels

```html
<!-- BAD -->
<input type="email" placeholder="Email">

<!-- GOOD -->
<label for="email">Email</label>
<input type="email" id="email" name="email">

<!-- GOOD (alternative with aria-label) -->
<input type="email" aria-label="Email" placeholder="Enter email">
```

P2 (screen reader users miss context).

#### 5d. Heading hierarchy violations

```html
<!-- BAD -->
<h1>Page title</h1>
<h3>Subsection</h3>  <!-- skipped h2 -->

<!-- GOOD -->
<h1>Page title</h1>
<h2>Section</h2>
<h3>Subsection</h3>
```

P3 (semantic HTML rule).

#### 5e. Missing focus indicators

CSS that hides focus indicators:
```css
/* BAD */
button:focus {
  outline: none;
}

/* GOOD */
button:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 2px;
}
```

P2 (keyboard users can't see what's focused).

#### 5f. Improper ARIA usage

```html
<!-- BAD - redundant ARIA -->
<button role="button">Click</button>

<!-- BAD - wrong ARIA -->
<div role="button" tabindex="0">Click</div>  <!-- Just use <button> -->

<!-- BAD - missing required ARIA -->
<button aria-controls="dropdown-1">Toggle</button>  <!-- aria-expanded missing -->
```

P3 (ARIA misuse can be worse than no ARIA).

#### 5g. Color contrast violations

If new colors introduced via inline styles (not tokens), validate:

```css
/* BAD - inline hardcoded colors that may fail contrast */
.button {
  background: #ccc;  /* On white = 1.6:1, fails WCAG */
  color: white;
}
```

Use design tokens (which have been WCAG-validated):
```css
.button {
  background: var(--color-button-primary-bg);
  color: var(--color-button-primary-text);
}
```

P2 if obvious violation.

---

## Check 6: SEO compliance (H11)

### What to look for

SEO regressions or missing best practices.

### Specific checks

#### 6a. Missing meta tags

For new page templates or major page changes:

```html
<!-- Required -->
<title>{page_title}</title>
<meta name="description" content="{page_description}">
<link rel="canonical" href="{canonical_url}">

<!-- Recommended -->
<meta property="og:title" content="{og_title}">
<meta property="og:description" content="{og_description}">
<meta property="og:image" content="{og_image}">
<meta property="og:type" content="website|article|product">
<meta name="twitter:card" content="summary_large_image">
```

Missing required = P2, missing recommended = P3.

#### 6b. Heading hierarchy (overlap with accessibility)

One H1 per page. No skipped levels.

#### 6c. Schema markup validation

For pages that should have schema (Product PDP, Article posts, Organization homepage):

```html
<!-- Verify schema present -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "{product_name}",
  "image": "{image_url}",
  "description": "{description}",
  "offers": {
    "@type": "Offer",
    "price": "{price}",
    "priceCurrency": "{currency}",
    "availability": "https://schema.org/InStock"
  }
}
</script>
```

Missing schema where expected → P2.
Schema with errors (per Google Rich Results Test) → P2.

#### 6d. Image alt text (SEO overlap)

Missing alt text affects both SEO and accessibility. Double penalty.

#### 6e. URL structure (for new routes)

New URL routes should follow project conventions:
- Lowercase
- Hyphens, not underscores
- No URL parameters where avoidable
- Per platform conventions

URL violations → P3.

#### 6f. Internal links

If PR adds links to other pages, verify they're not broken (404).

P3 if broken.

#### 6g. Redirect chains (per I17)

Per I17 — no redirect chains. If PR adds a redirect that creates a chain:
> "This redirect creates a chain: A → B → C. Single-hop required. Either redirect A → C directly OR justify and seek approval."

P2 (per I17 rule).

---

## Severity quick reference

Per `02-severity-classification.md`:

```
P1: Auto-block merge. Critical (security, data loss, hallucinated API that will fail at runtime)
P2: Auto-block merge. Major (forbidden pattern, security risk, accessibility violation, render-blocking, missing schema where required)
P3: Warn but allow merge. Minor (best practice violation, optimization opportunity)
P4: Info-only (style preference, polish suggestion)
```

PR cannot merge with any P1 or P2 unresolved.

---

## Output to PR

Code Review Agent posts ONE consolidated comment per review (not many small comments). Per `templates/review-comment.md`.

Comment structure:
1. Summary (PASS / PASS_WITH_FLAGS / FAIL)
2. Issues by severity (P1, P2, P3, P4)
3. Each issue with: file:line, description, suggestion, severity
4. Cost summary (tokens used, dollar cost)
5. Next steps

---

## Anti-patterns

1. **Flagging style issues as P1.** Style is P4 at most. Don't pad severity.

2. **Missing the obvious because focused on the subtle.** Hallucinated APIs are critical. Don't miss them while nitpicking spacing.

3. **Vague suggestions.** "Improve this" is useless. Give specific recommended code.

4. **Reviewing only what's changed, not the surrounding context.** Sometimes a change is fine in isolation but breaks something else nearby.

5. **Ignoring KB feedback opportunity.** When you catch the same mistake 3 times, flag for KB update.

6. **No cost awareness.** A 50-file PR can be expensive to review. Estimate first.

---

Last reviewed: 2026-05-24 by Claude (initial)
Next review due: 2026-08-24
