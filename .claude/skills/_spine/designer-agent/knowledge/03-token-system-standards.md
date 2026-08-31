---
tier: 2
load_when: ["agent-specific-detail"]
description: "What makes a good design token system. Designer Agent generates `design-tokens.json` following these standards."
---

# 03 — Token System Standards

> What makes a good design token system. Designer Agent generates `design-tokens.json` following these standards.

---

## What design tokens are

Design tokens are named, structured values that define visual design decisions. Tokens are the source of truth — code references token names, not raw values. Update the token → update everywhere it's referenced.

```
Bad (no tokens):
.button { background: #2E4A1F; padding: 12px 24px; }
.link  { color: #2E4A1F; }

Good (token-driven):
.button { background: var(--color-brand-primary); padding: var(--space-3) var(--space-5); }
.link  { color: var(--color-brand-primary); }
```

Change the brand color in tokens → button and link both update.

---

## Token categories (the standard set)

A complete token system covers:

1. **Colors** — brand, semantic, surface, text, button, status
2. **Typography** — families, sizes, weights, line heights, letter spacing
3. **Spacing** — scale (4px or 8px-based usually)
4. **Breakpoints** — mobile, tablet, desktop, wide
5. **Borders** — radius, width, color
6. **Shadows** — elevation scale
7. **Animations** — durations, easings
8. **Z-index** — stacking scale

Designer Agent generates ALL of these. Missing categories = incomplete token system = Frontend Agent has to invent decisions = inconsistency.

---

## 1. Color tokens

### Structure

```json
{
  "colors": {
    "brand": {
      "primary": "#2E4A1F",
      "primary-hover": "#243A18",
      "primary-active": "#1A2A11",
      "secondary": "#D4AF37",
      "secondary-hover": "#C4A02E",
      "accent": "#F5F1E8"
    },
    "neutral": {
      "0": "#FFFFFF",
      "50": "#FAFAFA",
      "100": "#F5F5F5",
      "200": "#E5E5E5",
      "300": "#D4D4D4",
      "400": "#A3A3A3",
      "500": "#737373",
      "600": "#525252",
      "700": "#404040",
      "800": "#262626",
      "900": "#171717",
      "950": "#0A0A0A"
    },
    "text": {
      "primary": "{colors.neutral.900}",
      "secondary": "{colors.neutral.600}",
      "muted": "{colors.neutral.400}",
      "inverse": "{colors.neutral.0}",
      "link": "{colors.brand.primary}",
      "link-hover": "{colors.brand.primary-hover}"
    },
    "surface": {
      "page": "{colors.neutral.0}",
      "card": "{colors.neutral.0}",
      "card-hover": "{colors.neutral.50}",
      "muted": "{colors.neutral.100}",
      "overlay": "rgba(0, 0, 0, 0.5)"
    },
    "button": {
      "primary-bg": "{colors.brand.primary}",
      "primary-text": "{colors.text.inverse}",
      "primary-bg-hover": "{colors.brand.primary-hover}",
      "secondary-bg": "transparent",
      "secondary-text": "{colors.brand.primary}",
      "secondary-border": "{colors.brand.primary}",
      "ghost-bg": "transparent",
      "ghost-text": "{colors.text.primary}",
      "ghost-bg-hover": "{colors.surface.muted}"
    },
    "border": {
      "default": "{colors.neutral.200}",
      "muted": "{colors.neutral.100}",
      "strong": "{colors.neutral.400}",
      "focus": "{colors.brand.primary}"
    },
    "status": {
      "success": "#10B981",
      "success-bg": "#D1FAE5",
      "warning": "#F59E0B",
      "warning-bg": "#FEF3C7",
      "error": "#EF4444",
      "error-bg": "#FEE2E2",
      "info": "#3B82F6",
      "info-bg": "#DBEAFE"
    }
  }
}
```

### Token references
Use `{path.to.token}` syntax to reference other tokens. Frontend Agent resolves these at build time.

### Color naming rules
- Use semantic names where possible (`text.primary` not `text.black`)
- Reserve scale numbers (50-950) for neutral palettes only
- Brand colors use descriptive names (`primary`, `secondary`, `accent`)
- All interactive colors need hover/active states defined

### Validation
Every color combination used together MUST pass WCAG (per `04-wcag-color-contrast.md`). Designer Agent rejects token sets that fail.

---

## 2. Typography tokens

### Structure

```json
{
  "typography": {
    "font-family": {
      "heading": "Playfair Display, Georgia, serif",
      "body": "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
      "mono": "JetBrains Mono, Menlo, Consolas, monospace"
    },
    "font-size": {
      "xs":    "0.75rem",
      "sm":    "0.875rem",
      "base":  "1rem",
      "lg":    "1.125rem",
      "xl":    "1.25rem",
      "2xl":   "1.5rem",
      "3xl":   "1.875rem",
      "4xl":   "2.25rem",
      "5xl":   "3rem",
      "6xl":   "3.75rem",
      "7xl":   "4.5rem",
      "display": "5.625rem"
    },
    "font-weight": {
      "thin":      "100",
      "light":     "300",
      "regular":   "400",
      "medium":    "500",
      "semibold":  "600",
      "bold":      "700",
      "extrabold": "800",
      "black":     "900"
    },
    "line-height": {
      "tight":   "1.1",
      "snug":    "1.25",
      "normal":  "1.5",
      "relaxed": "1.625",
      "loose":   "2"
    },
    "letter-spacing": {
      "tighter": "-0.05em",
      "tight":   "-0.025em",
      "normal":  "0",
      "wide":    "0.025em",
      "wider":   "0.05em",
      "widest":  "0.1em"
    },
    "preset": {
      "display": {
        "font-family": "{typography.font-family.heading}",
        "font-size":   "{typography.font-size.display}",
        "font-weight": "{typography.font-weight.bold}",
        "line-height": "{typography.line-height.tight}",
        "letter-spacing": "{typography.letter-spacing.tight}"
      },
      "h1": {
        "font-family": "{typography.font-family.heading}",
        "font-size":   "{typography.font-size.5xl}",
        "font-weight": "{typography.font-weight.bold}",
        "line-height": "{typography.line-height.tight}"
      },
      "h2": { /* ... */ },
      "h3": { /* ... */ },
      "h4": { /* ... */ },
      "body": {
        "font-family": "{typography.font-family.body}",
        "font-size":   "{typography.font-size.base}",
        "font-weight": "{typography.font-weight.regular}",
        "line-height": "{typography.line-height.normal}"
      },
      "small": {
        "font-family": "{typography.font-family.body}",
        "font-size":   "{typography.font-size.sm}",
        "line-height": "{typography.line-height.normal}"
      },
      "button": {
        "font-family": "{typography.font-family.body}",
        "font-size":   "{typography.font-size.base}",
        "font-weight": "{typography.font-weight.medium}",
        "letter-spacing": "{typography.letter-spacing.wide}"
      }
    }
  }
}
```

### Typography rules
- Define families, sizes, weights, line heights as primitives
- Compose semantic presets (`h1`, `body`, `button`) from primitives
- Frontend Agent uses presets, not primitives directly (with rare exceptions)
- Always include `display`, `h1`-`h4`, `body`, `small`, `button` presets minimum

### Font loading consideration
- Self-host fonts where licensing allows (Google Fonts can be downloaded and self-hosted)
- Use `font-display: swap` to prevent FOIT
- Preload critical fonts (the ones used in LCP element)
- Subset fonts if possible (Latin-only) to reduce file size

---

## 3. Spacing tokens

### Structure

```json
{
  "spacing": {
    "0":   "0",
    "1":   "0.25rem",  /* 4px */
    "2":   "0.5rem",   /* 8px */
    "3":   "0.75rem",  /* 12px */
    "4":   "1rem",     /* 16px */
    "5":   "1.25rem",  /* 20px */
    "6":   "1.5rem",   /* 24px */
    "8":   "2rem",     /* 32px */
    "10":  "2.5rem",   /* 40px */
    "12":  "3rem",     /* 48px */
    "16":  "4rem",     /* 64px */
    "20":  "5rem",     /* 80px */
    "24":  "6rem",     /* 96px */
    "32":  "8rem",     /* 128px */
    "40":  "10rem",    /* 160px */
    "48":  "12rem",    /* 192px */
    "56":  "14rem",    /* 224px */
    "64":  "16rem"     /* 256px */
  },
  "section-padding": {
    "mobile":   "{spacing.10}",
    "tablet":   "{spacing.16}",
    "desktop":  "{spacing.20}",
    "wide":     "{spacing.24}"
  },
  "container": {
    "max-width": "1440px",
    "padding-mobile": "{spacing.4}",
    "padding-tablet": "{spacing.6}",
    "padding-desktop": "{spacing.8}"
  },
  "grid": {
    "gap-mobile":  "{spacing.4}",
    "gap-tablet":  "{spacing.6}",
    "gap-desktop": "{spacing.8}"
  }
}
```

### Spacing rules
- Base unit: 4px or 8px (4px is more flexible)
- Use scale, not arbitrary values (no `padding: 13px`)
- Section padding, container, grid have their own tokens (composed from spacing scale)

---

## 4. Breakpoint tokens

### Structure

```json
{
  "breakpoints": {
    "mobile":  "375px",
    "tablet":  "768px",
    "desktop": "1024px",
    "wide":    "1440px",
    "ultrawide": "1920px"
  }
}
```

### Breakpoint rules
- Mobile-first: defaults are mobile, media queries scale up
- Use min-width queries (mobile → tablet → desktop)
- Test at exact breakpoint AND between (e.g., 1023px just below desktop)
- 5 breakpoints is enough; more = complexity for marginal benefit

---

## 5. Border tokens

### Structure

```json
{
  "border": {
    "width": {
      "0":  "0",
      "1":  "1px",
      "2":  "2px",
      "4":  "4px",
      "8":  "8px"
    },
    "radius": {
      "none":  "0",
      "sm":    "0.125rem", /* 2px */
      "md":    "0.25rem",  /* 4px */
      "lg":    "0.5rem",   /* 8px */
      "xl":    "0.75rem",  /* 12px */
      "2xl":   "1rem",     /* 16px */
      "3xl":   "1.5rem",   /* 24px */
      "full":  "9999px"
    }
  }
}
```

---

## 6. Shadow tokens

### Structure

```json
{
  "shadow": {
    "sm":   "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    "md":   "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    "lg":   "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    "xl":   "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    "2xl":  "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    "inner": "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
    "focus":  "0 0 0 3px {colors.brand.primary}",
    "focus-visible": "0 0 0 3px {colors.brand.primary}"
  }
}
```

---

## 7. Animation tokens

### Structure

```json
{
  "animation": {
    "duration": {
      "instant":  "0ms",
      "fast":     "150ms",
      "normal":   "250ms",
      "slow":     "400ms",
      "slower":   "600ms"
    },
    "easing": {
      "linear":     "linear",
      "ease-in":    "cubic-bezier(0.4, 0, 1, 1)",
      "ease-out":   "cubic-bezier(0, 0, 0.2, 1)",
      "ease-in-out": "cubic-bezier(0.4, 0, 0.2, 1)",
      "ease-spring": "cubic-bezier(0.34, 1.56, 0.64, 1)"
    }
  }
}
```

### Animation rules
- Prefer `transform` and `opacity` (GPU-accelerated)
- Avoid `width`, `height`, `top`, `left` animations (layout thrash)
- Respect `prefers-reduced-motion`
- Most UI animations: 150-250ms
- Large transitions (page-level): 400-600ms

---

## 8. Z-index tokens

### Structure

```json
{
  "z-index": {
    "auto":     "auto",
    "0":        "0",
    "10":       "10",
    "20":       "20",
    "30":       "30",
    "40":       "40",
    "50":       "50",
    "dropdown": "1000",
    "sticky":   "1020",
    "fixed":    "1030",
    "drawer":   "1040",
    "modal":    "1050",
    "popover":  "1060",
    "tooltip":  "1070",
    "toast":    "1080"
  }
}
```

### Z-index rules
- Use semantic names for elevated UI (modal, drawer, etc.)
- Reserve specific ranges for specific UI types
- Never hardcode z-index in component code

---

## Token system completeness checklist

Before declaring tokens complete:

```
[ ] Colors: brand, neutral scale, text, surface, button, border, status — ALL filled
[ ] Typography: families, sizes (12+ levels), weights, line heights, letter spacing, 5+ presets
[ ] Spacing: 12+ scale values, section padding (4 breakpoints), container, grid
[ ] Breakpoints: 5 defined (mobile, tablet, desktop, wide, ultrawide)
[ ] Borders: width scale, radius scale (8 levels), focus border defined
[ ] Shadows: elevation scale (sm-2xl), inner, focus, focus-visible
[ ] Animations: 5 durations, 5 easings
[ ] Z-index: numeric scale + semantic UI levels
[ ] All cross-references use {path.to.token} syntax
[ ] Token validation passes (per templates/design-tokens.schema.json)
[ ] WCAG contrast validation passes for all color combinations
```

If any category incomplete, Designer Agent does NOT output. Fill gaps first.

---

## Brand customization workflow

For each project, Designer Agent:

1. Starts from a baseline token system (this file as template)
2. Overrides brand-specific values:
   - `colors.brand.*` from questionnaire Q9, Q10
   - `typography.font-family.*` from Q11
   - Adjusts typography presets to match Q12 preference
   - Tunes spacing scale if needed (e.g., spacious brands use larger scale)
   - Adjusts border radius (sharp vs soft brands)
3. Keeps everything else baseline
4. Validates: WCAG contrast, completeness, schema

Result: tokens that are brand-specific without re-inventing the wheel.

---

## Anti-patterns

1. **One-off values in code instead of tokens.** Frontend Agent should use `var(--color-brand-primary)`, never hardcoded `#2E4A1F`.

2. **Inconsistent naming.** "primary" and "main" both used for the same brand color — pick one.

3. **Missing categories.** Tokens without breakpoints, without animations, etc. — Frontend Agent invents these, inconsistent results.

4. **Tokens without semantic layer.** Only having primitives (`color-1`, `color-2`) without semantic mappings (`text.primary`, `button.bg`) — devs don't know which primitive to use where.

5. **Tokens that pass WCAG individually but not in combination.** Token system validation must check actual usage combinations.

6. **Generating tokens without questionnaire input.** Result: generic. Always run questionnaire first.

---

Last reviewed: 2026-05-24 by Claude (initial)
Next review due: 2026-08-24
