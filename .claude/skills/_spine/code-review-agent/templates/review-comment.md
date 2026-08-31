---
template_type: review-comment
applies_to: [all]
last_reviewed: 2026-06-03
---
# Review Comment Template

> Format Code Review Agent uses to post PR comments. Single consolidated comment per review (not many small ones).

---

## Comment structure

```markdown
# 🤖 AI Code Review — [PASS | PASS_WITH_FLAGS | FAIL]

**PR:** #[number] — [PR title]
**Reviewed:** [timestamp]
**Cost:** $[X.XX]
**Findings:** [N]

---

## Summary

[1-3 sentence summary of what was reviewed and overall finding]

---

## Issues by Severity

### P1 Issues ([count])
[Each P1 — must fix before merge]

### P2 Issues ([count])
[Each P2 — must fix before merge]

### P3 Issues ([count])
[Each P3 — recommend fixing, doesn't block merge]

### P4 Issues ([count])
[Each P4 — polish notes, informational]

---

## Sensitive Paths Touched (if any)

[List of files matching CODEOWNERS rules — senior review required]

---

## Verification

- [ ] axe-core ran in CI: [link to result]
- [ ] Lighthouse CI ran: [link to result]
- [ ] Linters passed: [link to result]
- [ ] Unit tests passed: [link to result]

---

## Next Steps

[Specific actions based on findings]

---

🤖 Reviewed by Code Review Agent v1.0
[Help](link to agent docs) · [Override](link to override docs) · [Cost details](link to cost guardrails)
```

---

## Individual finding format

Each finding within the comment uses this format:

```markdown
### [Severity] [Brief title] — [Category]

**File:** `path/to/file.liquid:LINE`

**Issue:**
[Specific description of the problem]

**Code:**
```liquid
[The problematic code snippet]
```

**Recommendation:**
[Specific suggested fix, with code if possible]

```liquid
[Suggested correct code]
```

**Reference:**
[Link to forbidden.md rule, or platform doc, or KB file]
```

---

## Example full comment — PASS_WITH_FLAGS

```markdown
# 🤖 AI Code Review — PASS_WITH_FLAGS

**PR:** #142 — feat: add hero section + product grid
**Reviewed:** 2026-05-30T14:32:00Z
**Cost:** $0.18
**Findings:** 3

---

## Summary

Reviewed 4 files (2 new, 2 modified) totaling 287 lines of Liquid + CSS. No P1 or P2 issues found. 2 P3 and 1 P4 issue worth addressing.

---

## Issues by Severity

### P3 Issues (2)

#### [P3] Image below fold using `loading="eager"` — performance

**File:** `sections/aurora-product-grid.liquid:47`

**Issue:**
Product images in the grid are below the fold but loaded eagerly. This wastes initial bandwidth and could delay LCP for above-fold content.

**Code:**
```liquid
{% for product in collection.products limit: 12 %}
  <img src="{{ product.featured_image | image_url: width: 600 }}"
       loading="eager"
       width="600" height="600"
       alt="{{ product.title }}">
{% endfor %}
```

**Recommendation:**
Use `loading="lazy"` for below-fold images:

```liquid
{% for product in collection.products limit: 12 %}
  <img src="{{ product.featured_image | image_url: width: 600 }}"
       loading="lazy"
       width="600" height="600"
       alt="{{ product.title }}">
{% endfor %}
```

**Reference:** [Shopify forbidden.md rule IMG-001](link)

---

#### [P3] Missing srcset for responsive images — performance

**File:** `sections/aurora-product-grid.liquid:47`

**Issue:**
Image only loads a single 600px width. Mobile devices (375px) get unnecessarily large images. Wider devices (1440px+ HiDPI) get insufficient resolution.

**Recommendation:**
Add `srcset` for responsive image serving:

```liquid
<img src="{{ product.featured_image | image_url: width: 600 }}"
     srcset="{{ product.featured_image | image_url: width: 300 }} 300w,
             {{ product.featured_image | image_url: width: 600 }} 600w,
             {{ product.featured_image | image_url: width: 900 }} 900w,
             {{ product.featured_image | image_url: width: 1200 }} 1200w"
     sizes="(max-width: 768px) 50vw, (max-width: 1440px) 33vw, 25vw"
     loading="lazy"
     width="600" height="600"
     alt="{{ product.title }}">
```

**Reference:** [Performance budget standards](link)

---

### P4 Issues (1)

#### [P4] Variable naming could be clearer — code quality

**File:** `sections/aurora-hero.liquid:23`

**Issue:**
Variable `x` is used to hold the section's content URL. Single-letter variable is unclear.

**Code:**
```liquid
{% assign x = section.settings.cta_url %}
```

**Recommendation:**
Use descriptive variable name:

```liquid
{% assign cta_url = section.settings.cta_url %}
```

This is a minor polish item, not blocking.

---

## Sensitive Paths Touched

None.

---

## Verification

- [✓] axe-core ran in CI: [PASS — 0 violations](link)
- [✓] Lighthouse CI ran: [Performance 84 / Acc 98 / SEO 96 / BP 92](link)
- [✓] Linters passed: [theme-check PASS](link)
- [✓] Unit tests: N/A (no JS in this PR)

---

## Next Steps

- Address P3 issues for better performance (recommended before merge, not required)
- P4 is informational — fix at your convenience

---

🤖 Reviewed by Code Review Agent v1.0
[Help](link) · [Override](link) · [Cost details](link)
```

---

## Example full comment — FAIL

```markdown
# 🤖 AI Code Review — FAIL

**PR:** #143 — refactor: cart drawer animation
**Reviewed:** 2026-05-30T15:12:00Z
**Cost:** $0.21
**Findings:** 3

---

## Summary

Reviewed cart drawer refactor. Found 2 blocking issues that must be fixed before merge. P1 issue is a forbidden pattern violation that could break in production. P2 issue is an accessibility regression.

---

## Issues by Severity

### P1 Issues (1)

#### [P1] Inline script in section file — security

**File:** `sections/aurora-cart-drawer.liquid:89`

**Issue:**
Project's `forbidden.md` rule SCRIPT-001 explicitly prohibits inline `<script>` blocks in Liquid section files. Inline scripts violate Content Security Policy and pose XSS risk.

**Code:**
```liquid
<script>
  document.querySelector('.cart-toggle').addEventListener('click', () => {
    document.querySelector('.cart-drawer').classList.toggle('open');
  });
</script>
```

**Recommendation:**
Move script to an asset file and load it properly:

1. Create `assets/aurora-cart.js` with the script content
2. In `layout/theme.liquid` head:
   ```liquid
   <script src="{{ 'aurora-cart.js' | asset_url }}" defer></script>
   ```
3. Remove the inline `<script>` from the section

**Reference:** [Shopify forbidden.md rule SCRIPT-001](link)

---

### P2 Issues (2)

#### [P2] Cart toggle is a `<div>`, not a `<button>` — accessibility

**File:** `sections/aurora-cart-drawer.liquid:42`

**Issue:**
Cart toggle is implemented as a `<div>` with `onclick`. Not keyboard accessible (can't Tab to it, can't activate with Enter/Space). Screen readers won't announce it as a button.

**Code:**
```liquid
<div class="cart-toggle" onclick="toggleCart()">
  <svg>...</svg>
  <span class="cart-count">{{ cart.item_count }}</span>
</div>
```

**Recommendation:**
Use a proper `<button>` element:

```liquid
<button type="button" class="cart-toggle" aria-label="Open cart" aria-controls="cart-drawer">
  <svg aria-hidden="true">...</svg>
  <span class="cart-count" aria-live="polite">{{ cart.item_count }}</span>
</button>
```

Note: `aria-live="polite"` makes the cart count announce changes for screen reader users.

**Reference:** [Accessibility KB](link)

---

#### [P2] Animation uses `width`/`height` (layout thrashing) — performance

**File:** `assets/aurora-cart-drawer.css:34`

**Issue:**
Cart drawer animation animates `width` properties. This causes browser layout recalculation on every frame, hurting performance.

**Code:**
```css
.cart-drawer {
  width: 0;
  transition: width 300ms ease-out;
}
.cart-drawer.open {
  width: 400px;
}
```

**Recommendation:**
Use `transform` for GPU-accelerated animation:

```css
.cart-drawer {
  width: 400px;
  transform: translateX(100%);
  transition: transform 300ms ease-out;
}
.cart-drawer.open {
  transform: translateX(0);
}
```

This animates on the GPU compositor, doesn't trigger layout, and feels smoother.

**Reference:** [Performance KB — animations](link)

---

## Sensitive Paths Touched

- `sections/aurora-cart-drawer.liquid` — cart logic (per CODEOWNERS)

Senior dev review required per CODEOWNERS:
- @your-senior-dev-2
- @your-tech-lead

---

## Verification

- [✗] axe-core: 1 violation (related to non-button toggle)
- [✓] Lighthouse CI: pending (will run after fixes)
- [✓] Linters passed
- [✓] Unit tests passed

---

## Next Steps

This PR cannot merge until:
1. P1 inline script fix
2. P2 button semantics fix
3. P2 animation fix
4. Senior dev review for cart drawer changes
5. Re-run review after fixes

---

🤖 Reviewed by Code Review Agent v1.0
[Help](link) · [Override](link) · [Cost details](link)
```

---

## Comment update strategy

When PR receives new commits:
- Update the same comment (don't create new ones)
- Mark previous findings as ✓ resolved or still open
- Show what's new since last review

Example update:

```markdown
# 🤖 AI Code Review — PASS (after revisions)

**PR:** #143 — refactor: cart drawer animation
**Reviewed:** 2026-05-30T15:12:00Z (initial), 2026-05-30T16:45:00Z (re-review)
**Cost:** $0.21 + $0.08 = $0.29 total

---

## Status: PASS

All issues from previous review have been resolved.

## Resolved Issues
- [✓] P1: Inline script — fixed by moving to aurora-cart.js
- [✓] P2: Button semantics — converted to <button>
- [✓] P2: Animation — converted to transform

## New Findings
None.

## Ready to Merge
Once senior dev approval is in place (CODEOWNERS requires).
```

---

## Tone in comments

- Direct ("Use loading=lazy") not deferential ("Maybe consider...")
- Specific (file:line, code samples) not vague
- Constructive (here's the fix) not just critical (this is wrong)
- Educational (here's why) where helpful
- Brief (don't pad)

---

## Anti-patterns

1. **Many small comments.** One consolidated comment. Easier to track, less notification noise.

2. **No severity tags.** Dev doesn't know what to prioritize.

3. **No code samples.** "Fix this" without showing what "fix" looks like = useless.

4. **No file:line.** "Somewhere in this file" = dev hunts.

5. **No references.** Just stating opinions ≠ referenced rules.

6. **Padding/buttering.** "Hi! Just a small thought!" — be direct.

7. **No re-review update.** Old findings stay flagged after they're fixed.

---

Last reviewed: 2026-05-24 by Claude (initial)
Next review due: 2026-08-24
