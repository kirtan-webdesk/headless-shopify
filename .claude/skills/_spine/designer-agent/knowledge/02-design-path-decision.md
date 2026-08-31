---
tier: 2
load_when: ["agent-specific-detail"]
description: "Six design paths. Designer Agent recommends ONE based on project type, budget, timeline, brand maturity, and client preference. Path determines downstream work approach."
---

# 02 — Design Path Decision

> Six design paths. Designer Agent recommends ONE based on project type, budget, timeline, brand maturity, and client preference. Path determines downstream work approach.

---

## The 6 design paths

| # | Path | When to use |
|---|------|-------------|
| 1 | Custom-over-default-theme | Most ecommerce projects with brand customization on budget |
| 2 | Inspired-by-predefined-template | Client purchased a marketplace theme they like |
| 3 | Fully custom from scratch | High-budget, brand differentiation critical |
| 4 | Headless | Project type is Headless Build (decided upstream) |
| 5 | Figma import | Client provides Figma file, agency translates to code |
| 6 | Page builder driven | WordPress/Elementor or BigCommerce/Makeswift projects |

### Numbering convention — arm files MUST cite, not restate (v1.11.13+)

**This file is the single source of truth for design-path numbering and labels.** Arm files (`shopify/**`, `wordpress-woocommerce/**`, `bigcommerce/**`, `headless/**`) that discuss design paths MUST cite these numbers and labels, not restate them with local names. Restating creates semantic drift that no text scanner will catch — an arm labelling "Path 2 = pattern-driven" when this file says "Path 2 = Inspired-by-predefined-template" is invisible to `verify-edition-integrity.sh` and misroutes agents to the wrong approach.

**Rule:** arm files that reference a path MUST use the exact label from the table above and the same number. Adding a WP- or Shopify-specific interpretation column is fine; renaming or renumbering is not. If an arm needs a concept the taxonomy lacks, escalate a spine change to master rather than inventing a local Path N.

Recorded semantic-drift incident: v1.11.13 — Shopify arm files (`00-overview.md`, `redesign/SKILL.md`, `new-build/knowledge/02-design-path-decisions.md`) had drifted for months to a "theme-driven / pattern-driven / component-custom / brand-defining custom / multi-store / headless" local taxonomy. WP arm (`projects/new-build/knowledge/04-design-system-setup.md`, `projects/redesign/knowledge/03-design-system-evolution.md`) had invented a "Path 5 = page-builder-led" that conflicted with this file's Path 5 (Figma import) and duplicated Path 6 (Page builder driven). All realigned to cite this file directly. Convention added here to prevent recurrence.

Designer Agent picks one path. Once chosen, the path determines:
- Token system scope (light customization vs full system)
- Section composition approach (extend defaults vs build from scratch)
- AI vs human design effort
- Mockup approach
- Frontend Agent workflow downstream

---

## Path 1 — Custom-over-default-theme

### When to use
- Platform has good default theme (Shopify Dawn, BigCommerce Cornerstone, WooCommerce Storefront)
- Client wants brand customization but not extreme differentiation
- Budget is mid-tier
- Timeline is standard (8-12 weeks)
- Default theme features cover 80%+ of needs

### What this means
- Start with the default theme as foundation
- Apply brand tokens (colors, fonts, spacing) via theme settings + CSS overrides
- Customize existing sections with brand styling
- Add 3-7 custom sections where defaults don't fit
- Keep merchant-editable patterns intact (default theme's strength)

### Trade-offs
- ✓ Fast delivery
- ✓ Cheaper (40-60% less dev hours than fully custom)
- ✓ Platform updates apply smoothly
- ✓ Merchant editability stays high
- ✗ Visual differentiation limited
- ✗ "Looks like other Shopify stores" risk

### Designer Agent's work
- Pick base theme version (e.g., Dawn 14.0.0)
- Generate full token system over default
- Identify sections that need replacement vs customization
- Visual mockups: 3-5 key sections showing brand applied

### Estimated design time
8-16 hours

---

## Path 2 — Inspired-by-predefined-template

### When to use
- Client already purchased a marketplace theme (Prestige, Impulse, Symmetry, etc.)
- Client likes the template's layout/structure
- Want it customized to their brand
- Don't want to invest in fully custom

### What this means
- Use the purchased theme as the structural foundation
- Apply brand tokens over the theme's design system
- Adjust sections that don't quite fit
- Add 2-5 custom sections where template gaps exist
- Respect template's update path (don't fork it heavily)

### Trade-offs
- ✓ Premium features of paid theme included
- ✓ Faster than custom from scratch
- ✓ Support from theme author (in addition to agency)
- ✗ Locked into template author's update cadence
- ✗ Some customizations may conflict with future template updates
- ✗ Less control than fully custom

### Designer Agent's work
- Review the purchased template thoroughly
- Identify template's design system (its tokens)
- Generate brand-aligned tokens that override template
- Flag where template needs custom sections
- Visual mockups: 3-5 sections showing brand applied to template

### Estimated design time
12-24 hours

### Notes
PageFly / Replo / GemPages are exceptions — see Path 6 (page builder driven).

---

## Path 3 — Fully custom from scratch

### When to use
- Brand differentiation is critical (luxury, distinctive aesthetic)
- High budget (typically $40K+ for design alone)
- Long timeline (12-20 weeks)
- Client has strong brand identity that doesn't fit default themes
- Agency reputation/portfolio benefits from showcasing

### What this means
- No theme starting point
- Build the design system from first principles
- Every section custom-designed
- Maximum brand expression
- Maximum dev hours

### Trade-offs
- ✓ Maximum brand differentiation
- ✓ Optimized code (no theme bloat)
- ✓ Highest design control
- ✗ Most expensive
- ✗ Longest timeline
- ✗ More risk (no tested foundation)
- ✗ Higher maintenance burden

### Designer Agent's work
- This is where Designer Agent's honest limit shows
- AI generates token system, accessibility validation, section composition
- But true visual creativity needs human designer
- Designer Agent runs heavy research + token system + section library composition
- Human designer (recommended) finalizes hero moments + key brand expressions
- AI image gen handles non-hero imagery

### Estimated design time
24-60 hours from Designer Agent + 40-80 hours from human designer (recommended)

### Important
Designer Agent should explicitly tell the developer: "Fully custom path benefits from a human designer for hero moments. I can do tokens + sections + research, but for the differentiating visual creativity, recommend [human designer name or external]."

---

## Path 4 — Headless

### When to use
- Project type is Headless Build (decided in spec, not by Designer Agent)
- Platforms: Shopify Hydrogen/Oxygen, BigCommerce Catalyst, Magento Hyva, WordPress custom React, etc.

### What this means
- Frontend is a React/Next.js (or framework) application
- Backend is the ecommerce platform's API
- Designer Agent works similar to fully custom (path 3)
- Additional considerations: SSR/SSG strategy, performance budget tighter

### Trade-offs
- ✓ Maximum performance possible
- ✓ Maximum customization possible
- ✗ Highest cost
- ✗ Highest maintenance burden
- ✗ Future-platform-update risk
- ✗ Requires Node.js / React expertise

### Designer Agent's work
- Same as fully custom (Path 3)
- Additional: design tokens must work with React component system (CSS-in-JS, design tokens to Tailwind/Stitches/etc.)
- Performance-driven design decisions (no heavy hero animations, etc.)

### Estimated design time
Same as Path 3 (30-60 hours), plus 5-10 hours for headless-specific architectural decisions

---

## Path 5 — Figma import

### When to use
- Client provides finished Figma file
- Client has external designer who delivered designs
- Agency role is translation (Figma to code), not design

### What this means
- Designer Agent's role becomes audit + token extraction
- Reads Figma file (via Figma MCP if available, otherwise visual inspection)
- Extracts design tokens from the Figma file
- Maps Figma frames to section structure
- Validates accessibility (Figma designs often fail WCAG without designer knowing)
- Flags any inconsistencies in the Figma file

### Trade-offs
- ✓ Client gets exactly what they designed
- ✓ Faster design phase (no brand questionnaire / research)
- ✗ Figma file quality determines outcome
- ✗ If Figma fails accessibility, need to push back to designer
- ✗ Agency limited in design decisions

### Designer Agent's work
- Read Figma file
- Audit for accessibility issues (flag to designer for fixes)
- Extract tokens (colors, typography, spacing)
- Map frames to sections
- Visual mockups: the Figma frames themselves (or extracted as PNGs for non-Figma-using stakeholders)
- Tag inconsistencies (same component with different spacing in different frames, etc.)

### Estimated design time
8-16 hours (audit + extraction)

### Important
If Figma file has major accessibility issues (text contrast failures, missing focus states, etc.), Designer Agent MUST flag this back to client/designer for fixes BEFORE Frontend Agent starts building. Otherwise we build to spec but ship inaccessible code.

---

## Path 6 — Page builder driven

### When to use
- WordPress projects using Elementor (your standard per C6)
- BigCommerce projects using Makeswift or native page builder
- Shopify projects where merchant editability via sections is the priority

### What this means
- Design system delivered as page builder components/templates
- Merchant edits via the builder UI post-launch
- Tokens applied as builder global styles
- Sections built as builder templates

### Trade-offs
- ✓ Maximum merchant editability post-launch
- ✓ Standard for WordPress/Elementor and BigCommerce/Makeswift
- ✓ Faster post-launch iteration
- ✗ Performance can suffer if builder is heavy
- ✗ Customization within builder constraints

### Designer Agent's work
- Generate tokens that fit the page builder's system
- Design sections within the builder's capabilities
- Document which builder components map to which design sections
- Visual mockups: builder-rendered previews

### Estimated design time
10-20 hours

### Notes
For WordPress projects, almost always Path 6 with Elementor.
For BigCommerce, Path 6 with Makeswift or native builder.
For Shopify, this isn't typically Path 6 — Shopify's native sections handle this without separate "page builder" software.

---

## Decision algorithm

Designer Agent picks a path based on these inputs from spec + questionnaire:

```
def recommend_design_path():
    project_type = spec.project.project_type
    platform = spec.project.platform
    budget = spec.budget.envelope
    timeline_weeks = spec.timeline_weeks
    brand_maturity = questionnaire.brand_maturity  # high / medium / low
    client_provided_figma = spec.assets.figma_url is not None
    client_provided_theme = spec.platform.purchased_theme is not None

    # Hard constraints first
    if project_type == "headless-build":
        return Path 4  # Headless

    if client_provided_figma:
        return Path 5  # Figma import

    if client_provided_theme:
        return Path 2  # Inspired by predefined template

    if platform == "wordpress" or platform == "bigcommerce_with_makeswift":
        return Path 6  # Page builder driven

    # Now decide between Path 1, 2, 3 for ecommerce
    if budget > 40000 and brand_maturity == "high" and timeline_weeks >= 12:
        return Path 3  # Fully custom

    if budget < 25000 or timeline_weeks < 8:
        return Path 1  # Custom-over-default

    # Default
    return Path 1  # Safest middle ground
```

This is a starting recommendation. Designer Agent then surfaces with reasoning + alternatives.

---

## Path recommendation format

```markdown
# Design Path Recommendation — [Project Name]

## Recommended path: [Path N — Name]

## Reasoning
[Why this path fits this project's constraints]

## Trade-offs accepted
- [Trade-off 1]
- [Trade-off 2]

## Alternative paths considered
- **Path X:** [why not this]
- **Path Y:** [why not this]

## What this means for the project

### Design phase work
- Designer Agent: [estimated hours, what they'll produce]
- Human designer required: [yes / no / optional]
- AI image gen used: [yes / no, for what]

### Dev phase implications
- Frontend Agent: [how much they build vs customize defaults]
- Estimated dev hours impact: [vs baseline]

### Timeline implications
- Design phase duration: [N] weeks

## Confirmation needed
Internal PM: confirm this path? CONFIRM / REVISE / ALTERNATIVE

═════════════════════════════════════════════════════════════════
```

Surfaced to orchestrator for G2 process (specifically, before design work begins in earnest).

---

## Anti-patterns

1. **Recommending Path 3 (fully custom) because client asked for "premium."** Premium can be achieved on Path 1 with smart customization. Path 3 is for true brand differentiation needs.

2. **Recommending Path 1 when client has a purchased theme.** That's Path 2 territory. Use the asset they paid for.

3. **Choosing path without considering budget.** Path 3 on a $15K budget = either over-budget or compromised quality.

4. **Locking the path before client confirms.** Surface recommendation + alternatives. Wait for confirmation.

5. **Headless path for non-Headless projects.** If project type isn't Headless Build, this path doesn't apply.

6. **Figma import path when Figma file is incomplete or low-quality.** Honest pushback needed: "The Figma file is missing several states (hover, focus, error) and has inconsistent spacing. Recommend designer completes file OR switch to Path 1/3 where we make those decisions."

---

Last reviewed: 2026-05-24 by Claude (initial)
Next review due: 2026-08-24
