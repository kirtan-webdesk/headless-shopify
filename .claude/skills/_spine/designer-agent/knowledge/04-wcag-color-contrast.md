---
tier: 2
load_when: ["agent-specific-detail"]
description: "Validate color tokens against WCAG 2.1 AA at the token level — BEFORE any code is written. Bad contrast never makes it into the build."
---

# 04 — WCAG Color Contrast Validation

> Validate color tokens against WCAG 2.1 AA at the token level — BEFORE any code is written. Bad contrast never makes it into the build.

---

## WCAG 2.1 AA requirements

| Text type | Contrast ratio required |
|-----------|-------------------------|
| Normal text (< 18pt or < 14pt bold) | **4.5:1** |
| Large text (≥ 18pt or ≥ 14pt bold) | **3:1** |
| UI components (button borders, form inputs, etc.) | **3:1** |
| Decorative elements | No requirement |

WCAG 2.1 AAA (stricter, not required but better):
- Normal text: 7:1
- Large text: 4.5:1

WebDesk default: enforce **AA across the board, push for AAA where possible** (per I.3 — stricter where defined).

---

## Contrast ratio calculation

Standard luminance + ratio formula from WCAG:

```
1. Convert color hex → sRGB → relative luminance L
   For each channel (R, G, B):
     c = channel / 255
     If c <= 0.03928: linear = c / 12.92
     Else: linear = ((c + 0.055) / 1.055) ^ 2.4
   L = 0.2126 * linear_R + 0.7152 * linear_G + 0.0722 * linear_B

2. For two colors with luminances L1 (lighter) and L2 (darker):
   ratio = (L1 + 0.05) / (L2 + 0.05)

3. Compare ratio to threshold:
   - 4.5:1 for normal text
   - 3:1 for large text or UI
```

Designer Agent runs this for every color pair that will appear together in the design.

---

## Color pairs to validate

For every project's token set, validate these pairs (minimum):

### Text-on-background pairs
- `text.primary` on `surface.page`
- `text.primary` on `surface.card`
- `text.primary` on `surface.muted`
- `text.secondary` on `surface.page`
- `text.secondary` on `surface.card`
- `text.muted` on `surface.page` (must pass 3:1 for large text only)
- `text.inverse` on `surface.overlay` (modal text)
- `text.link` on `surface.page`
- `text.link` on `surface.card`

### Button color pairs
- `button.primary-text` on `button.primary-bg`
- `button.primary-text` on `button.primary-bg-hover`
- `button.secondary-text` on `surface.page` (transparent button)
- `button.ghost-text` on `surface.page`
- `button.ghost-text` on `button.ghost-bg-hover`

### Brand color combinations
- Brand primary on white (must pass 4.5:1)
- Brand primary on neutral.50, 100 (lighter backgrounds)
- Brand secondary on white
- White text on brand primary background

### Status colors
- `status.success` text on `status.success-bg`
- `status.warning` text on `status.warning-bg`
- `status.error` text on `status.error-bg`
- `status.info` text on `status.info-bg`

### Border / UI colors
- `border.default` on `surface.page` (3:1 minimum)
- `border.focus` on `surface.page` (3:1 minimum)

### Focus state
- `shadow.focus-visible` ring on every interactive element's background

---

## Validation algorithm

```python
def validate_tokens(design_tokens):
    failures = []

    pairs = get_required_pairs(design_tokens)
    for pair in pairs:
        fg = resolve_token(pair.foreground)
        bg = resolve_token(pair.background)
        ratio = calculate_contrast(fg, bg)
        threshold = pair.threshold  # 4.5, 3.0, etc.

        if ratio < threshold:
            failures.append({
                "pair": pair.name,
                "foreground": pair.foreground,
                "background": pair.background,
                "calculated_ratio": ratio,
                "required_ratio": threshold,
                "severity": "CRITICAL"
            })

    if failures:
        return REJECT, failures
    return PASS, None
```

If validation REJECTS, Designer Agent:
1. Does NOT output the tokens
2. Reports failures with specific recommendations
3. Suggests adjustments (darker primary, different accent, etc.)
4. Re-validates after adjustment
5. Only outputs when PASS

---

## Validation report format

When validation fails:

```markdown
# Color Contrast Validation — FAILED

## Failures

### CRITICAL — Required AA, calculated below threshold

**1. text.secondary on surface.page**
- Foreground: text.secondary = #A3A3A3 (resolved from neutral.400)
- Background: surface.page = #FFFFFF (resolved from neutral.0)
- Calculated ratio: 2.85:1
- Required: 4.5:1 (normal text AA)
- **Recommendation:** Darken text.secondary. Suggested: #737373 (neutral.500), ratio 4.83:1 ✓

**2. button.primary-text on button.primary-bg (hover state)**
- Foreground: button.primary-text = #FFFFFF
- Background: button.primary-bg-hover = #D4AF37 (brand.secondary-hover)
- Calculated ratio: 2.21:1
- Required: 4.5:1 (button text AA)
- **Recommendation:** Use darker hover (e.g., #8B7517). OR change button-primary-text on hover to dark color.

## Pass count: 12 / 14
## Fail count: 2 / 14

## Action
Designer Agent will not output tokens until failures are addressed.
Awaiting adjustment.
```

Surfaced to developer via orchestrator.

---

## Common contrast failures and fixes

### Failure: Light gray text on white
**Problem:** "Subtle" secondary text often fails contrast.
**Fix:** Darken to at least neutral.500 (#737373) for body text, neutral.600 (#525252) is safer.

### Failure: Brand color on white as text
**Problem:** Vibrant brand colors (yellows, light blues, light greens) often fail.
**Fix:**
- For text use: choose a darker brand primary (or define a separate `brand.primary-text` for text usage)
- For decorative use only: keep vibrant version

### Failure: White text on light-tinted brand background
**Problem:** Light pastel background with white text.
**Fix:** Use dark text on light backgrounds, white text on dark backgrounds. Don't mix.

### Failure: Disabled state too light
**Problem:** Disabled buttons / fields with light gray text fail contrast.
**Fix:** Use `aria-disabled` instead of literal gray fade. Provide visual disabled state that still meets 3:1.

### Failure: Focus ring on light background
**Problem:** Light focus ring on white background invisible.
**Fix:** Focus ring must contrast 3:1 with surface. Usually use brand primary or a dark accent.

---

## Special cases

### Decorative elements
Logos, decorative icons, separators with no semantic meaning — no contrast requirement. Designer Agent skips these from validation.

### Text on gradient or image backgrounds
Contrast can't be calculated against a single color. Recommendation:
- Add a solid color overlay (e.g., `rgba(0,0,0,0.4)`) with sufficient opacity to ensure text passes contrast against the OVERLAY color
- Or use solid color backgrounds for text-heavy regions

Designer Agent flags any hero/banner with text on image and recommends overlay.

### Custom text colors per page section
Some sections (dark hero, dark CTA) intentionally use different palettes. Validate within each context:
- Dark hero: text.inverse on dark background — validate ratio
- Dark CTA section: button colors on dark background — validate

---

## Validation output added to design-tokens.json

After validation passes, append a `_validation` block:

```json
{
  "colors": { ... },
  "typography": { ... },
  ...
  "_validation": {
    "wcag_level": "AA",
    "validation_date": "2026-05-24T14:32:00Z",
    "validator_version": "1.0.0",
    "pairs_validated": 14,
    "pairs_passed": 14,
    "lowest_ratio": {
      "pair": "text.muted on surface.page",
      "ratio": 4.62,
      "threshold": 4.5
    },
    "status": "PASS"
  }
}
```

Frontend Agent references this to confirm tokens were validated. If `_validation.status != "PASS"`, refuse to use the tokens.

---

## Beyond color contrast

### Other accessibility concerns at token level

- **Font sizes too small:** Don't define `font-size.xs` below 12px (small print is hard to read)
- **Line height too tight:** Body text line-height should be ≥ 1.4 for readability
- **Focus ring width:** Minimum 2px to be visible
- **Touch target spacing:** Spacing tokens must accommodate 44px minimum touch targets (with margin)

Designer Agent flags any token values that violate these.

---

## When AAA is required

For clients in regulated industries (government, education, healthcare with public-facing portals), WCAG AAA may be required:
- Normal text: 7:1
- Large text: 4.5:1

If client explicitly requires AAA (or `spec.accessibility.standard = "WCAG 2.1 AAA"`), Designer Agent uses AAA thresholds. Generates fewer compliant color combinations but ensures everything passes.

---

## Validation tooling

Designer Agent uses:
- Built-in contrast calculation (per WCAG formula above)
- Cross-reference to color science libraries for sanity checks
- Output validated against `templates/design-tokens.schema.json`

For manual verification, external tools:
- WebAIM Contrast Checker
- Stark (Figma/browser extension)
- Adobe Color Accessibility Tools

But Designer Agent's validation is the source of truth. External tools are for spot-checks.

---

## Anti-patterns

1. **Passing tokens without validation.** This is the entire point of this knowledge file. No exceptions.

2. **Validating only against white background.** Validate against ALL backgrounds the text appears on (white, card, muted, dark).

3. **Ignoring hover/active states.** Hover states often have different colors and may fail contrast.

4. **Treating decorative elements as required.** Don't waste validation cycles on decorative icons. Focus on functional text and UI.

5. **Accepting "close enough" failures.** 4.4:1 is not 4.5:1. Adjust the color.

6. **Skipping validation for AAA when client asked for AAA.** Match the client's standard.

---

Last reviewed: 2026-05-24 by Claude (initial)
Next review due: 2026-08-24
