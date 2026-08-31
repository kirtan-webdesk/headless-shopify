---
tier: 2
load_when: ["agent-specific-detail"]
description: "How Designer Agent uses your agency's curated section pattern library to compose pages. The pattern library is the SECRET SAUCE — not the AI."
---

# 08 — Section Pattern Library

> How Designer Agent uses your agency's curated section pattern library to compose pages. The pattern library is the SECRET SAUCE — not the AI.

---

## Why a pattern library exists

Designer Agent picks sections from a curated library rather than generating them from scratch. Reasons:

1. **Quality control:** Library sections are pre-vetted for accessibility, performance, conversion.
2. **Consistency:** Across projects, similar section types use proven patterns.
3. **Speed:** No "design from scratch" loop.
4. **AI strength:** Selecting + composing is easier than generating.
5. **Agency differentiation:** YOUR library reflects YOUR best work. AI alone can't replicate this.

---

## Library structure (to be built)

The library lives at `/skills/[platform]/examples/sections/` and `/skills/_shared/section-patterns/`.

### Per platform (technology-specific)

```
/skills/<active-platform>/examples/sections/
├── hero/
│   ├── hero-video-overlay/
│   │   ├── README.md            (when to use, characteristics)
│   │   ├── pattern.liquid       (the actual code)
│   │   ├── schema.json          (Shopify section settings)
│   │   └── preview.png          (visual mockup)
│   ├── hero-split/
│   ├── hero-fullbleed-image/
│   └── hero-minimal/
├── product-grid/
│   ├── grid-2up/
│   ├── grid-3up/
│   ├── grid-4up/
│   └── grid-masonry/
├── product-card/
│   ├── card-standard/
│   ├── card-quick-add/
│   ├── card-compare/
│   └── card-minimal/
├── header/
│   ├── header-sticky/
│   ├── header-transparent/
│   └── header-mega-menu/
├── footer/
├── cart-drawer/
├── pdp-gallery/
├── pdp-variant-picker/
├── pdp-reviews/
├── plp-filters/
├── newsletter-signup/
├── testimonials/
├── press-logos/
├── faq-accordion/
├── feature-blocks/
└── ...
```

### Cross-platform agnostic (concept patterns)

```
/skills/_shared/section-patterns/
├── concept-patterns/
│   ├── hero-video-overlay.md       (description, when to use, regardless of platform)
│   ├── hero-split.md
│   ├── ...
└── ...
```

The concept patterns describe what the section IS and what problem it solves. The platform-specific implementations show how to BUILD it.

---

## Industry-specific section sub-libraries

Within each section category, organize by industry where useful:

```
/skills/<active-platform>/examples/sections/hero/
├── _all/                          (industry-agnostic patterns)
├── beauty-skincare/               (industry-specific patterns)
├── fashion-apparel/
├── home-decor/
├── food-beverage/
├── electronics/
├── b2b/
└── ...
```

Industry libraries are smaller (5-10 patterns per category per industry) but tuned to that industry's conventions.

---

## How Designer Agent picks sections

### Step 1 — Determine page composition

For each page in the spec (homepage, PDP, collection, etc.), Designer Agent decides what sections it needs.

Standard page compositions:

**Homepage (ecommerce):**
1. Header
2. Hero
3. Featured collection / best sellers
4. Social proof / press logos
5. Brand story / differentiation
6. Newsletter signup OR secondary CTA
7. Footer

**Product Detail Page (PDP):**
1. Header
2. Breadcrumbs
3. Product gallery
4. Product info + variant picker + add-to-cart
5. Product description (tabs or accordion)
6. Reviews
7. Cross-sell / related products
8. Footer

**Collection / PLP:**
1. Header
2. Collection title + filters + sort
3. Product grid
4. Pagination / load-more
5. Footer

(Customize based on spec, especially for unusual project types.)

### Step 2 — Pick patterns from library

For each section slot, pick a pattern based on:
- **Brand fit** (from questionnaire — does this pattern feel right for this brand?)
- **Industry fit** (from research — does this match industry conventions?)
- **CRO fit** (per `05-cro-principles.md` — does this pattern serve conversion?)
- **Performance fit** (does this pattern hit performance budget?)
- **Custom requirements** (does this pattern support all features in spec?)

If multiple patterns fit, present options:

> "For homepage hero, three patterns fit this brand:
> 1. **hero-fullbleed-image** — strong visual impact, premium feel; works well for [Client] aesthetic
> 2. **hero-split** — clearer messaging hierarchy; good if copy is the priority
> 3. **hero-video-overlay** — distinctive but adds 200-400KB; only if video content is ready
>
> Recommend #1 for this project. CONFIRM or pick alternative."

### Step 3 — Customize the pattern

Each pattern is a starting point. Customize:
- Apply brand tokens (colors, fonts, spacing)
- Adjust imagery direction
- Tune copy placeholders to spec
- Match section settings to merchant needs

Customization does NOT include:
- Major structural changes (if so, pick a different pattern)
- Performance-degrading additions
- Accessibility regressions

If a pattern needs major changes, it's the wrong pattern. Pick again.

### Step 4 — Document selection

In `section-map.json`, record which pattern was used for each section:

```json
{
  "pages": {
    "homepage": {
      "sections": [
        {
          "id": "homepage-hero",
          "pattern_source": "<active-platform>/examples/sections/hero/hero-fullbleed-image",
          "pattern_version": "1.2.0",
          "customizations": [
            "Brand tokens applied",
            "Headline copy from spec D1",
            "CTA copy: 'Shop Aurora' (from questionnaire Q17)"
          ],
          "sprint_assignment": "S2.4"
        },
        {
          "id": "homepage-featured-collection",
          "pattern_source": "<active-platform>/examples/sections/product-grid/grid-3up",
          "pattern_version": "1.0.0",
          "customizations": [...]
        }
      ]
    }
  }
}
```

This documents pedigree. Frontend Agent reads the pattern source as reference + customizations as adjustments.

---

## When library is missing a pattern

Sometimes a section is needed that doesn't exist in the library yet. Options:

### Option A — Build new section, contribute back to library

If the section is novel and likely to be reused:
1. Designer Agent designs it within this project
2. Frontend Agent builds it
3. After project: senior dev cleans it up, adds documentation, contributes to library
4. Future projects can reuse

### Option B — Build one-off, no contribution

If the section is project-specific (very unusual requirement, unlikely to recur):
1. Designer Agent designs it
2. Frontend Agent builds it
3. Stays in project repo, not added to library

### Option C — Recommend scope adjustment

If the section is novel AND not budget-justified:
1. Designer Agent surfaces: "This requires a custom section we don't have a pattern for. Adds ~[N] hours. Options: build it, simplify scope, defer to v2."

Internal PM decides.

---

## Pattern library quality bar

For a pattern to be in the library, it must:

```
[ ] WCAG 2.1 AA validated (accessibility tested)
[ ] Mobile-first responsive (375px → 1440px+ tested)
[ ] Performance impact documented (LCP contribution, JS weight)
[ ] Section schema clean (merchant settings appropriate)
[ ] Brand-token-driven (no hardcoded colors)
[ ] README explains: when to use, when NOT to use, customization notes
[ ] Preview image included (PNG mockup)
[ ] Version stamp (v1.0.0)
[ ] Owner identified
```

A pattern that doesn't meet these isn't ready for the library.

---

## Library maintenance

### Quarterly review
Library owner (designated senior dev per platform) reviews all patterns:
- Are any patterns deprecated (used outdated APIs, accessibility issues)?
- Are any patterns no longer matching current industry trends?
- Are there new patterns from recent projects worth adding?

### Per-project contribution
After each project closes, master doc identifies any new patterns that could be added to the library. Senior reviews + contributes.

### Versioning
Each pattern has a version. Breaking changes (incompatible schema, new required tokens) get major version bumps. Minor improvements: minor versions.

Patterns referenced in projects use the version snapshot — projects don't auto-upgrade when library changes.

---

## Starting state (Phase 3)

At Phase 3 (Shopify platform arm), the library starts with the 3 reference implementations you'll provide for E4. These become the seed.

Over time, the library grows as projects contribute patterns back.

For Phase 2 (current — spine), the library doesn't exist yet. Designer Agent will work without a library for the first few projects, generating patterns "from scratch" within the project (Frontend Agent builds them). Those patterns then become library candidates.

---

## Designer Agent's pattern selection workflow

```
1. Read section-map slots needed (from page composition)
2. For each slot:
   a. Determine section category (hero, product-grid, etc.)
   b. Check library: /skills/[platform]/examples/sections/[category]/
   c. Filter patterns by brand fit (industry sub-library if exists, else _all)
   d. For each candidate pattern, score:
      - Brand fit: high / medium / low
      - Industry fit: high / medium / low
      - CRO fit: high / medium / low
      - Performance fit: pass / fail
      - Feature coverage: complete / partial / insufficient
   e. Pick top 1-3 candidates
   f. If only 1 strong fit: use it
   g. If multiple: present options + recommendation, wait for confirmation
   h. If none fit: escalate (build custom or scope adjustment)
3. Document selection in section-map.json
4. Continue to next slot
```

---

## Anti-patterns

1. **Building every section from scratch.** Library exists to be used. Use it.

2. **Using a pattern that doesn't fit because it's available.** Wrong pattern is worse than no pattern. Push back if nothing fits.

3. **Patterns without documentation.** Future devs (and Designer Agent) can't pick from undocumented patterns. Every library entry needs README.

4. **Not contributing back to the library.** If you build a novel section that solved a real problem, add it to the library. Otherwise the library stagnates.

5. **Library only has 5 patterns.** Library should grow to 100+ patterns over time. If after a year it has 10, contributions aren't happening.

6. **Mixing platform code in library structure.** Each platform has its own library. Shopify Liquid doesn't belong in WordPress library.

---

Last reviewed: 2026-05-24 by Claude (initial)
Next review due: 2026-08-24
