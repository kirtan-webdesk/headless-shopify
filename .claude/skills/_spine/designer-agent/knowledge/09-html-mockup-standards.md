---
tier: 1
load_when: ["mockup-production"]
description: "v1.5.2 — production-quality bar for Designer Agent HTML/CSS/JS output. Mockups ARE the production scaffold (D-DES-01); Frontend Agent refines, doesn't rebuild."
---

# 09 — HTML Mockup Standards

> v1.5.2 — production-quality bar for Designer Agent HTML/CSS/JS output. Mockups ARE the production scaffold (D-DES-01); Frontend Agent refines, doesn't rebuild.

---

## Core principle

The Designer Agent emits HTML/CSS/JS that:

1. Looks like the final design (because it IS the final design, just without dynamic data wiring)
2. Behaves like the final UI (responsive, accessible, interactive)
3. Reads like production code (semantic, scoped, maintainable)

If a mockup file would fail Code Review Agent on a feature branch, it fails Designer Agent's quality bar too.

---

## HTML rules

### H1 — Use semantic landmarks
Every page mockup includes proper landmark structure:

```html
<header>...</header>           <!-- site-wide header -->
<nav aria-label="Primary">...</nav>
<main>
  <section aria-labelledby="hero-heading">
    <h1 id="hero-heading">...</h1>
    ...
  </section>
  <section aria-labelledby="features-heading">
    <h2 id="features-heading">Features</h2>
    ...
  </section>
</main>
<footer>...</footer>
```

NOT:
```html
<div class="header">...</div>
<div class="hero">...</div>
<div class="footer">...</div>
```

### H2 — Heading hierarchy
- Exactly one `<h1>` per page
- Heading levels nest properly (no h1 → h3 skip)
- Hierarchy reflects content structure, not styling intent

### H3 — Accessible interactive elements
- `<button>` for actions (not `<div onclick>`)
- `<a href="...">` for navigation (not `<button>` that pushes URL)
- `<label for="...">` paired with every form input
- Visible focus ring on all interactive elements
- Keyboard navigation works (Tab order matches visual order)

### H4 — Alt text on every image
- Decorative images: `alt=""` (empty, not missing)
- Content images: descriptive alt
- Hero images that overlay text: `alt=""` if text duplicates content; otherwise meaningful

### H5 — ARIA where semantics fall short
- `aria-label`, `aria-labelledby`, `aria-describedby` on custom controls
- `role="dialog"` + focus trap on modals
- `aria-current="page"` on active nav item
- `aria-expanded` on collapsibles

### H6 — Form structure
```html
<form action="/contact" method="POST" novalidate>
  <fieldset>
    <legend>Contact us</legend>
    <div class="field">
      <label for="email">Email address</label>
      <input id="email" name="email" type="email" required autocomplete="email">
    </div>
    ...
  </fieldset>
  <button type="submit">Send</button>
</form>
```

NOT loose `<input>` + `<div>` button.

### H7 — Image dimensions explicit
Every `<img>` has `width` and `height` attributes (prevents CLS):

```html
<img src="/assets/images/hero.webp" width="1600" height="900" alt="..." loading="lazy">
```

`loading="lazy"` on below-fold; `loading="eager"` only on above-fold critical images.

---

## CSS rules

### C1 — No inline `<style>` blocks
Per LIQ-009 and DES-003. Styles in `.css` files, served from `/mockups/assets/`.

### C2 — Use CSS custom properties from design tokens
All colors, spacing, typography come from `tokens.css`:

```css
/* sections/hero.css */
.hero {
  background: var(--color-primary);
  color: var(--color-on-primary);
  padding: var(--space-xl) var(--space-md);
}

.hero h1 {
  font-family: var(--font-heading);
  font-size: var(--font-size-display);
  line-height: var(--line-height-tight);
}
```

NOT:
```css
.hero {
  background: #b4975a;  /* ❌ hardcoded — fails C2 */
  padding: 80px 24px;   /* ❌ hardcoded spacing */
}
```

### C3 — Section-scoped class names
Use BEM or section-prefix to prevent collisions:

```css
.hero { ... }              /* OK if section is unique on page */
.hero__title { ... }       /* BEM */
.hero__cta { ... }
.kb-hero__title { ... }    /* Project prefix */
```

NOT:
```css
.title { ... }    /* ❌ collides across sections */
.cta { ... }      /* ❌ collides */
```

### C4 — Mobile-first media queries
Default styles for mobile; media queries widen up:

```css
.hero {
  padding: var(--space-md);
}

@media (min-width: 768px) {
  .hero { padding: var(--space-lg); }
}

@media (min-width: 1280px) {
  .hero { padding: var(--space-xl); }
}
```

NOT:
```css
.hero { padding: 80px; }
@media (max-width: 768px) { .hero { padding: 24px; } }  /* ❌ desktop-first */
```

### C5 — Responsive units
- `rem` for font-size and spacing (root-relative)
- `%` or `fr` for fluid layouts
- `vh`/`vw` only when intentional (hero heights, full-bleed)
- `px` only for borders, hairlines, fixed-asset dimensions

### C6 — Prefers-reduced-motion respected
```css
@media (prefers-reduced-motion: reduce) {
  .hero-animation {
    animation: none;
  }
}
```

### C7 — Visible focus indicator
```css
button:focus-visible,
a:focus-visible,
input:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}
```

NEVER:
```css
*:focus { outline: none; }  /* ❌ destroys keyboard accessibility */
```

### C8 — Logical properties
Use `padding-inline`, `padding-block`, `margin-inline-start` over `padding-left/right/top/bottom` for RTL/i18n readiness.

```css
.hero {
  padding-inline: var(--space-md);
  padding-block: var(--space-xl);
}
```

---

## JavaScript rules

### J1 — Vanilla JS, no jQuery
Per JS-001 (forbidden.md).

```javascript
// Good
document.querySelector('.cart-toggle').addEventListener('click', toggleCart);

// Bad
$('.cart-toggle').on('click', toggleCart);
```

### J2 — No inline `<script>` blocks
Per LIQ-001. JS goes in `/mockups/assets/js/`.

```html
<!-- Good -->
<script src="/mockups/assets/js/cart-drawer.js" defer></script>

<!-- Bad -->
<script>
  document.querySelector('.cta').onclick = () => alert('Hi');
</script>
```

### J3 — Defer non-critical scripts
```html
<script src="/mockups/assets/js/main.js" defer></script>
<script src="/mockups/assets/js/analytics.js" defer></script>
```

Only inline-load scripts that MUST run before paint (rare).

### J4 — Custom elements for interactive widgets
Per JS-002 — modern pattern for cart drawer, product info, variant selectors, etc.

```javascript
// /mockups/assets/js/cart-drawer.js
class CartDrawer extends HTMLElement {
  connectedCallback() {
    this.toggle = this.querySelector('[data-toggle]');
    this.toggle.addEventListener('click', () => this.open());
  }

  open() {
    this.setAttribute('open', '');
    this.querySelector('[data-content]').focus();
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

### J5 — Event delegation for repeating elements
```javascript
document.querySelector('.product-grid').addEventListener('click', (e) => {
  const button = e.target.closest('.product-card__cta');
  if (!button) return;
  // handle
});
```

### J6 — No `eval()`, `new Function()`, or string-based JS
Per JS-003.

### J7 — Errors handled, never silently swallowed
```javascript
try {
  await fetch('/api/cart');
} catch (err) {
  console.error('Cart fetch failed:', err);
  showError('Cart unavailable. Please refresh.');
}
```

NOT:
```javascript
try { await fetch('/api/cart'); } catch {}  // ❌ swallows
```

---

## Mockup file structure (canonical)

```
/projects/[client]/mockups/
├── README.md                      ← how to preview, what's in here
├── index.html                     ← homepage
├── product.html                   ← product detail
├── collection.html                ← collection listing
├── cart.html
├── about.html
├── contact.html
├── faq.html
├── 404.html
└── assets/
    ├── tokens.css                 ← from design-tokens.json (CSS custom properties)
    ├── base.css                   ← reset, typography, utilities
    ├── sections/
    │   ├── hero.css
    │   ├── product-card.css
    │   ├── header.css
    │   ├── footer.css
    │   ├── cart-drawer.css
    │   └── ...
    ├── js/
    │   ├── cart-drawer.js
    │   ├── mobile-drawer.js
    │   ├── product-form.js
    │   └── ...
    └── images/
        ├── hero-1.webp
        ├── logo.svg
        └── ...
```

`tokens.css` is generated from `design-tokens.json` by Designer Agent. Keep them in sync; if JSON changes, regenerate CSS.

---

## Preview server

Mockups are served via `tools/scripts/mockup-preview-server.sh` for stakeholder review. The server is a simple HTTP server (Python `http.server` or `vite` if hot reload needed) that serves `/projects/[client]/mockups/` at a local port AND can optionally tunnel via ngrok / Cloudflare Tunnel for client review.

Output is a preview URL that goes into the G2 gate decision artifact.

---

## What goes in mockup vs. what stays for Frontend Agent

| Item | Designer Agent (mockup) | Frontend Agent (production) |
|------|-------------------------|-----------------------------|
| HTML structure | ✓ Final | (preserves) |
| CSS | ✓ Final | (may extend for state) |
| Vanilla JS interactions | ✓ Final | (may swap for framework primitive) |
| Static content | ✓ Realistic placeholder content | Replaces with `{{ product.title }}` etc. |
| Images | ✓ AI-generated or stock | Replaces with real assets |
| Dynamic data wiring | ✗ Not yet | ✓ Adds Liquid / template engine |
| Cart state | ✗ Mockup uses fake data | ✓ Wires real cart API |
| Section settings | ✗ Hardcoded in HTML | ✓ Converts to schema |
| Cross-section coordination | ✗ Static | ✓ Pub/sub events, web components |

The handoff is clean if both agents follow this division.

---

## Required validations before Designer Agent surfaces mockup at G2

1. **Semantic HTML check** — proper landmarks, heading hierarchy, no `<div>` buttons
2. **axe-core run** — zero violations on each mockup page (run via `tools/scripts/run-axe-mockup.sh`)
3. **Mobile responsive check** — render at 375px, 768px, 1280px; no overflow, readable text, tappable targets
4. **Lighthouse mockup score** — preview server allows a Lighthouse run; target Performance ≥ 90, Accessibility 100, Best Practices ≥ 90
5. **Token-only colors check** — grep for hardcoded hex/rgb in section CSS files; should be empty
6. **No inline style/script check** — grep for `<style>` and inline `<script>` in HTML files; should be empty (except `<style>{% style %}` exception)
7. **Link integrity check** — every `<a href>` resolves to a page in the mockup or an external valid URL
8. **Image dimensions check** — every `<img>` has explicit `width` and `height`

Designer Agent runs these via `tools/scripts/validate-mockup.sh` before G2 surface. Code Review Agent re-runs on PR submission.

---

## What success looks like

Frontend Agent's transformation of mockup → production should be:
- Mostly mechanical (swap content for Liquid, wire schema, add metafield bindings)
- Visually identical to mockup (visual diff tolerance < 5%)
- Lighthouse + axe scores preserved or improved
- No structural HTML changes
- No CSS rewrites (only additions for state variants)

If Frontend Agent is rewriting the HTML or restructuring the CSS, the mockup wasn't production-grade. That's a Designer Agent failure → KB candidate.

---

## Anti-patterns

1. **Mockup as "high-fidelity wireframe" with throwaway code.** Per D-DES-01 — mockup IS production. Treat code quality accordingly.

2. **Hard-coded styling that breaks when tokens change.** Use CSS custom properties always.

3. **Static screenshots as G2 deliverable.** Forbidden. Client sees the real HTML in a browser.

4. **No keyboard navigation tested.** Test every interactive mockup with Tab + Enter only — no mouse.

5. **Pretty desktop, broken mobile.** Build mobile first. Verify on real device width.

6. **No interaction states.** Static-only mockup fails DES-002. Wire hover, focus, active, disabled.

7. **Mockup uses Lorem ipsum.** Use realistic content. Lorem looks unprofessional and obscures readability issues.

8. **Mockup ignores brand tokens and uses generic Tailwind defaults.** Every visible color, spacing, and typeface must trace to `design-tokens.json`.

9. **"We'll fix accessibility in production."** Fix at mockup. Cheaper, faster, structurally enforced.

10. **Designer Agent uses Figma anyway because "the human designer prefers it."** Allowed offline for sketching. NOT allowed as input to Frontend Agent or as G2 deliverable.

---

Last reviewed: 2026-05-27 by Claude (v1.5.2 Phase 2 — D-DES-01 implementation)
Next review due: 2026-08-27
