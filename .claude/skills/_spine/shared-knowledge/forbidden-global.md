---
tier: 1
load_when: ["code-production", "code-review", "any-platform-task"]
---

# Forbidden Patterns — Global (Cross-Platform)

> **v1.5.4 — Tier 1.** Rules that apply across every commerce platform (Shopify, BigCommerce, Magento/Adobe Commerce, WordPress/WooCommerce).
>
> Each platform also has its own `09-forbidden.md` for platform-specific rules. Code Review Agent loads BOTH on every PR (this file + active platform's file).

---

## How this file works

Each rule has:
- **ID** — stable identifier (referenced by Code Review Agent in PR comments)
- **Severity** — P1 (must fix) / P2 (must fix) / P3 (warn)
- **Bad pattern** — what NOT to do, with example
- **Good pattern** — what to do instead, with example
- **Why** — rationale

If a rule is platform-specific (uses Liquid filter, WP hook, BC API, etc.), it lives in the platform's own forbidden.md, not here.

---

## Rule ID convention

| Family | Scope |
|--------|-------|
| `SEC-NNN` (004+) | Security — destructive ops, force-push, hardcoded contacts, backups |
| `COMM-NNN` | Outbound communications — FLAG-004 enforcement family |
| `DES-NNN` | Design / mockup workflow (D-DES-01) |
| `INT-NNN` | Sensitive integrations — manual config items |
| `A11Y-NNN` | Accessibility — WCAG-rooted, platform-agnostic |
| `SEO-NNN` (general) | SEO baseline rules with no platform syntax |
| `JS-NNN` | JavaScript hygiene that applies to any HTML storefront |
| `PERF-NNN` (general) | Performance baseline that applies to any web platform |

Platform-specific rules use the same prefix family BUT have IDs that do NOT exist here. Example: Shopify keeps `SEC-001`/`002`/`003` because they reference Liquid syntax specifically.

---

## Section 1: Security (SEC-004 through SEC-008)

Operational security — backups, push commands, force-pushes, client contact handling.

### SEC-004 — Never run `[platform] theme push` (or equivalent) without snapshot + no-delete flag
**Severity:** P1

Applies to: Shopify (`shopify theme push --nodelete`), Magento (`bin/magento deploy:mode` + backup), WordPress (`wp-cli theme install --force` with backup), BigCommerce (Stencil push — always includes upload, but requires backup).

**Bad:**
```bash
# Shopify
shopify theme push --store mystore.myshopify.com --theme 12345

# Magento
bin/magento setup:upgrade  # without DB backup

# WordPress
wp theme install custom.zip --force  # overwrites existing
```

**Good:**
```bash
# Always use the platform's safe-push wrapper that snapshots first
./tools/scripts/safe-push.sh --platform shopify --store ... --theme ...
./tools/scripts/safe-push.sh --platform magento --backup-db ...
./tools/scripts/safe-push.sh --platform wordpress --backup-content ...
```

**Why:** Theme/code pushes without explicit no-delete behavior wipe remote files not in the local push. The Kitchen Blockers pilot lost non-protected files this way (Shopify). Same risk exists for all platforms.

---

### SEC-005 — Never run destructive operations without snapshot + audit log
**Severity:** P1

See `_spine/shared-knowledge/destructive-ops-protocol.md` for the full list of destructive operations.

**Bad:**
- Any theme push without prior snapshot
- `git push --force` without backup branch
- `DROP TABLE` / `TRUNCATE` without `pg_dump` / `mysqldump`
- Bulk metafield/post-meta delete without export
- App / plugin uninstall without configuration export
- CDN cache purge without verifying the cache will rebuild

**Good:**
- Use platform-appropriate safe-push wrapper (snapshots + logs automatically)
- Pre-commit hook prevents `--force` on protected branches
- DB ops require backup file path logged to `audit_log`
- All destructive ops route through orchestrator with project.json audit entry

**Why:** Destructive ops without snapshots have no rollback path. Snapshots are cheap insurance.

---

### SEC-006 — Never delete snapshots less than 30 days old
**Severity:** P2

**Bad:**
```bash
rm -rf .theme-snapshots/
rm -rf .db-backups/
rm -rf .wp-content-backups/
```

**Good:**
```bash
# Auto-prune handled by safe-push.sh removes only > 30 days
find .theme-snapshots -maxdepth 1 -type d -mtime +30 -exec rm -rf {} \;
```

**Why:** Recent snapshots are the rollback path. Deleting them defeats the safety mechanism.

---

### SEC-007 — Never `git push --force` on protected branches
**Severity:** P1

**Bad:**
```bash
git push --force origin main
git push --force origin develop
git push --force origin release/*
```

**Good:**
```bash
git push --force-with-lease origin feature/my-branch  # feature branches only
git revert <bad-sha>  # to undo on main
git push origin main
```

**Why:** Force-push on `main`/`develop`/`release/*` rewrites shared history, invalidates everyone's clones, loses commits permanently.

**Exception:** None. Escalate to Tech Lead if you think you need this.

---

### SEC-008 — Never hardcode client contact details in source
**Severity:** P1

See `_spine/orchestrator/knowledge/outbound-comms-gate.md` for the enforcement model.

**Bad:**
```liquid
<!-- Shopify Liquid -->
<a href="mailto:bamps@kitchenblockers.com">Contact</a>
```
```php
// WordPress
<a href="mailto:client@example.com">Contact</a>
```
```html
<!-- Any platform -->
<form action="https://client-domain.com/contact" method="POST">
```

**Good:**
```liquid
<a href="mailto:{{ settings.contact_email }}">Contact</a>  <!-- Shopify -->
```
```php
<a href="mailto:<?php echo get_option('contact_email'); ?>">Contact</a>  <!-- WordPress -->
```
```html
<form action="/contact" method="POST">  <!-- any platform — routes via your own backend -->
```

**Why:** Hardcoded client contacts make FLAG-004 impossible to enforce. Use platform settings always.

See also `COMM-001` through `COMM-004`.

---

## Section 2: Communications (COMM family)

Per `_spine/orchestrator/knowledge/outbound-comms-gate.md`. Code Review Agent scans generated code for these patterns.

### COMM-001 — No hardcoded client email addresses in generated code
**Severity:** P1

Same as SEC-008 but expressed at the codepath level. Use platform settings (Shopify theme settings, WordPress options, BigCommerce store settings, Magento config) — never inline literal addresses.

---

### COMM-002 — No form actions to client-controlled domains
**Severity:** P1

**Bad:**
```html
<form action="https://kitchenblockers.com/api/contact">
```

**Good:**
```html
<form action="/contact">
```

**Why:** Client server outages or DNS changes break your forms. Stay sovereign.

---

### COMM-003 — No webhook URLs hardcoded to client domains
**Severity:** P1

**Bad:**
```javascript
const webhook = "https://kitchenblockers.com/api/webhook";
```

**Good:**
```javascript
const webhook = process.env.CLIENT_WEBHOOK_URL;
```

---

### COMM-004 — No real client contact data used as test data
**Severity:** P1

**Bad:**
```javascript
const testCustomer = { email: "bamps@kitchenblockers.com" };
```

**Good:**
```javascript
const testCustomer = { email: "test+1@webdesksolution.ca" };
```

**Why:** Test runs trigger emails, SMS, push notifications. Real client addresses = FLAG-004 breach.

---

### COMM-005 — FLAG-004: All outbound client communications route through Internal PM only
**Severity:** P0 (highest)

**Rule:** No agent in the WebDesk system directly contacts the client. All outbound communications (emails, SMS, calls, social DMs, contact-form submissions, Slack DMs, Teams messages, Calendly invites, etc.) route through the Internal PM at `pm@webdesksolution.ca` (or the assigned project PM). The Internal PM is the ONLY authorized comms channel between WebDesk's AI agents and the client.

**Bad:**
- PM Agent emails the client directly because intake is late
- Designer Agent submits the client's Contact Us form to "test" it
- QA Agent emails the client's `info@` address to confirm credentials
- Dev Agent DMs the client on Slack to ask about hosting access

**Good:**
- PM Agent emails `pm@webdesksolution.ca` flagging the intake delay; Internal PM relays to client
- Designer Agent leaves a note in `HANDOFF.md` for Internal PM to ask the client
- QA Agent surfaces missing credentials in the QA report; Internal PM follows up with client
- All client touchpoints logged through PM channel only

**Enforcement points:**
- FLAG-004 blocklist captured at SOW stage (D-SOW-02), passed via `flag_004_blocklist` in spec frontmatter
- `_spine/orchestrator/knowledge/outbound-comms-gate.md` runs the pre-send check
- Every agent's outbound-action tool call checks the blocklist before sending
- Internal PM email must match `*@webdesksolution.ca` (D-SOW intake validation)

**Why:** Direct client contact from AI agents is unrecoverable. One mistaken DM and the client relationship is damaged. The PM channel is the gate.

---

## Section 3: Design / Mockup (DES family)

Per D-DES-01 — mockups ARE production scaffold. Designer Agent writes near-production HTML/CSS/JS.

### DES-001 — HTML mockups only. No design-tool files as deliverables (D-DES-01)
**Severity:** P1

**Bad:**
- Calling Figma MCP tools to generate or present mockup designs
- Producing Figma frames, Adobe XD files, Sketch files, PSD comps, InVision prototypes, or Marvel prototypes as the deliverable to the client at G2
- Producing static PNG / JPG comps as the primary design deliverable
- Routing Frontend Agent input through any design-tool export (Figma, XD, Sketch, etc.)
- A SOW listing "Adobe XD comp" or "Figma file delivery" as a line item

**Good:**
- Designer Agent produces HTML/CSS/JS mockup files directly
- Stakeholders review via in-browser preview URL (`mockup-preview-server.sh`)
- Frontend Agent refines Designer's HTML output (does not rebuild)
- SOW Builder enforces `design_tool: HTML` at SOW stage (D-SOW-01)

**Why:** HTML mockups eliminate the translation gap, demonstrate real interactions/responsive behavior, and become the production scaffold. Designers may still use Figma / XD / Sketch internally as scratch/wireframing tools, but those are NEVER the system deliverable or Frontend Agent input. Two deliverables (HTML + Figma) creates two sources of truth and guarantees drift.

**Enforcement points:**
- SOW Builder: `design_tool: HTML` is locked (D-SOW-01). Agent refuses Adobe XD / Figma / Sketch / PSD / InVision / Marvel as values.
- Designer Agent: produces HTML mockups only.
- Code Review Agent: scans `/mockups/**` for non-HTML deliverables and flags.

---

### DES-002 — Mockup code must meet production quality bar
**Severity:** P1

Since mockups ARE production scaffold (D-DES-01), they're subject to the same review as production code:

- Semantic HTML (no `<div>` soup)
- WCAG-compliant from the start
- Performance-aware (lazy load, image sizing, no render-blocking)
- Responsive demonstrated in the mockup itself
- No inline `<style>` or `<script>` blocks (except platform exceptions)
- Code Review Agent applies all forbidden patterns to mockup files

---

### DES-003 — No inline `<style>` blocks in template files (any platform)
**Severity:** P2

Applies to Shopify Liquid (`*.liquid`), WordPress PHP templates (`*.php`), BigCommerce Handlebars (`*.html`), Magento PHTML (`*.phtml`), and ANY mockup HTML.

**Bad:**
```liquid
<section class="hero">
  <style>
    .hero { background: gold; padding: 80px; }
  </style>
</section>
```
```php
<section class="hero">
  <style>
    .hero { background: gold; padding: 80px; }
  </style>
</section>
```

**Good:**
```liquid
<!-- Styles in assets/section-hero.css -->
<section class="hero">...</section>
```

**Why:** Inline `<style>` duplicates per section instance, breaks theme settings overrides, bypasses CSS bundling, violates separation of concerns.

**Platform exception:** Some platforms support scoped style blocks (Shopify `{% style %}`, WordPress `wp_add_inline_style()`) — use those if dynamic per-instance CSS is genuinely needed. NEVER use raw `<style>` in templates.

---

## Section 4: Sensitive integrations (INT family)

### INT-001 — Backend Agent provides INSTRUCTIONS for payment/shipping/tax, doesn't auto-configure
**Severity:** P2

Backend Agent code should:
- NOT auto-configure: Payment methods, shipping carriers, tax rates, fulfillment integrations
- DOES auto-configure: Metafield definitions, webhooks with sandbox tokens, app/plugin metadata
- VERIFIES at pre-launch: Are payment / shipping / tax set up correctly?

**Why:** Sensitive integrations require client-side action and credentials. AI configuring these is high-risk.

---

### INT-002 — Shipping + payment configuration always manual (v1.5.2)
**Severity:** P1

Strengthens INT-001 from "shouldn't" to "MUST NOT".

The system NEVER attempts to:
- Configure shipping rates, zones, carriers, or rules
- Configure payment gateways, providers, or methods
- Modify tax settings beyond what's in code metafields
- Edit checkout configuration that affects payment flow

These are always handled by a human developer manually through the platform's admin UI (Shopify Admin, WordPress wp-admin, BigCommerce control panel, Magento admin).

The AI/system MAY:
- Document required setup in `setup-notes/`
- Generate checklists for the manual config work
- Verify at pre-launch that config is in place (read-only)
- Surface gaps to PM Agent

**Why:** Misconfigured shipping = customers can't check out OR get free shipping by accident. Misconfigured payments = lost money or duplicate charges.

---

## Section 5: Accessibility (A11Y family)

WCAG 2.1 AA baseline. Applies to any HTML-rendering platform.

### A11Y-001 — Never use `<div>` (or `<span>`) as a button
**Severity:** P2

**Bad:**
```html
<div class="btn" onclick="addToCart()">Add to cart</div>
```

**Good:**
```html
<button type="button" class="btn" onclick="addToCart()">Add to cart</button>
```

**Why:**
1. Screen readers don't announce `<div>` as interactive
2. No keyboard focus or Enter/Space handling
3. No semantic HTML — bad for SEO too

**Exception:** Visually styled containers that happen to be clickable for analytics/tracking (not the primary action). Document why.

---

### A11Y-002 — Always provide alt text for content images
**Severity:** P2

**Bad:**
```html
<img src="hero.jpg">
<img src="hero.jpg" alt="">  <!-- empty alt OK only if decorative -->
```

**Good:**
```html
<img src="hero.jpg" alt="Hand-painted ceramic mug on wooden shelf">

<!-- Decorative image (explicitly marked) -->
<img src="divider.svg" alt="" role="presentation">
```

**Why:** Screen reader users can't see your images. Alt text is the description.

---

### A11Y-003 — Always associate form labels
**Severity:** P2

**Bad:**
```html
<input type="email" placeholder="Email">
```

**Good:**
```html
<label for="email">Email address</label>
<input id="email" type="email" name="email" autocomplete="email">

<!-- OR -->
<label>
  Email address
  <input type="email" name="email">
</label>
```

**Why:** Placeholders disappear on focus. Labels persist + screen readers announce them.

---

### A11Y-004 — Always provide visible focus indicators
**Severity:** P2

**Bad:**
```css
button:focus { outline: none; }
*:focus { outline: 0; }
```

**Good:**
```css
button:focus-visible,
a:focus-visible,
input:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}
```

**Why:** Keyboard users navigate by focus. Removing the indicator destroys keyboard accessibility.

---

### A11Y-005 — One H1 per page, logical heading hierarchy
**Severity:** P2

**Bad:**
```html
<h1>Welcome</h1>
<h3>Subheading</h3>  <!-- skips h2 -->
<h1>Featured products</h1>  <!-- second h1 -->
```

**Good:**
```html
<h1>Welcome</h1>
<h2>Subheading</h2>
<h2>Featured products</h2>
<h3>Best sellers</h3>
```

**Why:** Screen readers navigate by heading hierarchy. Skipped levels = lost context. Multiple H1s = confusing structure.

---

## Section 6: SEO (general SEO family)

### SEO-001 — Always set meta title and description on page templates
**Severity:** P2

Every page template must produce a unique, content-driven `<title>` and `<meta name="description">`.

**Platform examples:**
- Shopify: `{% render 'meta-tags' %}` in `<head>`
- WordPress: Theme uses `wp_title()` + Yoast/Rank Math integration
- BigCommerce: Page Builder meta fields + `{{head}}` helper
- Magento: Magento SEO module + `getPageTitle()`

---

### SEO-003 — Canonical tags on every page
**Severity:** P2

**Bad:** No canonical tag (or wrong URL).

**Good:**
```html
<link rel="canonical" href="https://example.com/products/featured">
```

Platform-specific helpers:
- Shopify: `{{ canonical_url }}`
- WordPress: `rel_canonical()` (built-in) or SEO plugin
- BigCommerce: theme's `<head>` partial
- Magento: SEO config

---

### SEO-004 — Submit sitemap to GSC + Bing
**Severity:** P3 (post-launch task)

At launch, Delivery Head verifies:
- `/sitemap.xml` exists and is reachable
- Submitted to Google Search Console
- Submitted to Bing Webmaster Tools

---

## Section 7: JavaScript hygiene (JS family)

### JS-001 — Never use jQuery (unless required by a legacy theme)
**Severity:** P3

**Bad:**
```javascript
$(document).ready(function() {
  $('.hero-cta').on('click', handleClick);
});
```

**Good:**
```javascript
document.querySelector('.hero-cta').addEventListener('click', handleClick);
```

**Why:** jQuery is a 30KB+ dependency for what's now native browser API. Slower, more code, no benefit.

**Exception:** Working in an existing WordPress theme that already includes jQuery and removing it would break other plugins. Document the exception.

---

### JS-002 — Use Web Components for interactive elements (modern pattern)
**Severity:** P3

Modern HTML platforms support `customElements.define()`. Use for:
- Cart drawer
- Product variant selectors
- Modal dialogs
- Tabs
- Accordions

```javascript
class CartDrawer extends HTMLElement {
  connectedCallback() {
    this.toggle = this.querySelector('[data-toggle]');
    this.toggle.addEventListener('click', () => this.open());
  }
  open() {
    this.setAttribute('open', '');
  }
}
customElements.define('cart-drawer', CartDrawer);
```

```html
<cart-drawer>
  <button data-toggle>Cart</button>
  <aside data-content tabindex="-1">...</aside>
</cart-drawer>
```

**Why:** Encapsulated, framework-agnostic, no bundler required, works on every platform from Shopify to WordPress to BigCommerce to Magento.

---

### JS-003 — Never `eval()`, `Function()`, or dynamic code execution
**Severity:** P1

**Bad:**
```javascript
eval(userInput);
new Function(codeString)();
setTimeout(stringOfCode, 1000);  // string form invokes eval
```

**Good:**
```javascript
// Use proper parsers, deserializers, or explicit handlers
const data = JSON.parse(trustedInput);
const result = handlers[action](data);
```

**Why:** Arbitrary code execution = XSS surface. Even from trusted sources, eval defeats CSP.

---

### JS-004 — Never store sensitive data in localStorage
**Severity:** P1

**Bad:**
```javascript
localStorage.setItem('customerToken', token);
localStorage.setItem('apiKey', key);
localStorage.setItem('paymentMethod', cardData);
```

**Good:**
```javascript
// Use httpOnly cookies for session data
// Use sessionStorage for non-sensitive UI state only
sessionStorage.setItem('cartIsOpen', '1');
```

**Why:** localStorage is accessible to any script on the origin. XSS = full data exfiltration. httpOnly cookies aren't.

---

### JS-005 — Defer non-critical scripts
**Severity:** P3

**Bad:**
```html
<script src="cart-drawer.js"></script>  <!-- blocks parsing -->
```

**Good:**
```html
<script src="cart-drawer.js" defer></script>
<script src="analytics.js" async></script>
```

**Why:** Render-blocking JS delays first paint. Defer or async unless the script MUST run before HTML continues parsing.

---

## Section 8: Performance (general PERF family)

### PERF-001 — Always specify image `width` and `height` (CLS prevention)
**Severity:** P2

**Bad:**
```html
<img src="hero.jpg">
```

**Good:**
```html
<img src="hero.jpg" width="1600" height="900" alt="...">
```

**Why:** Without dimensions, browser reflows layout when image loads = Cumulative Layout Shift hit (Core Web Vitals).

---

### PERF-003 — Lazy-load images below the fold
**Severity:** P2

**Bad:**
```html
<img src="product.jpg">  <!-- all images load eagerly -->
```

**Good:**
```html
<img src="hero.jpg" loading="eager" fetchpriority="high">  <!-- above fold -->
<img src="product.jpg" loading="lazy">  <!-- below fold -->
```

**Why:** Eager loading every image = slow initial paint. Lazy loading defers off-screen images.

---

### PERF-004 — Never include large unminified asset bundles
**Severity:** P2

**Bad:**
- `bootstrap.css` (full, ~150KB) when you use 5 utilities
- `lodash.js` (full bundle) when you use `debounce`
- Unminified production JS

**Good:**
- Tree-shake / import specific functions
- Minify production assets
- Use platform-native CSS where possible (no Bootstrap if you're not using its grid system)

---

## How agents use this file

1. **Tier 1 load** — Every agent that produces code loads this file alongside `_spine/persona.md`.
2. **Code Review Agent** — Scans every PR against rules here PLUS the active platform's `09-forbidden.md`. Two checks, not one.
3. **Designer Agent** — Mockup output is reviewed against DES-NNN and A11Y-NNN rules.
4. **Frontend / Backend Agents** — Generated code is reviewed against all applicable rules.

---

## How to propose a new global rule

A rule belongs in THIS file (not a platform's file) if:
- It applies to 2+ platforms in scope
- It uses platform-agnostic syntax in examples (or shows platform variants)
- It expresses a principle, not a syntax detail

If a rule is one platform only (e.g., Liquid `{% assign %}` mutation, or WordPress hook misuse), it goes in that platform's `09-forbidden.md`.

When proposing:
1. Surface candidate at Monthly System Retro (K5)
2. Decide: global vs platform-specific
3. Quarterly KB review approves
4. Add to this file (or platform file)

---

## Quarterly review

- **Owner:** Spine KB owner (per E5 — TBD, assign at first project)
- **Cadence:** Quarterly (next due 2026-08-28)
- **Version tracking:** `version.md` in `_spine/shared-knowledge/`
- **Changelog:** `changelog.md` in `_spine/shared-knowledge/`

---

Last reviewed: 2026-05-28 by Claude (v1.5.4 — platform extraction)
Next review due: 2026-08-28
