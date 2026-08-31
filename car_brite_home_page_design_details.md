---
name: car-brite-home-page-design-spec
page: home_page
project: Car Brite - Second Storefront
platform: Shopify Hydrogen
purpose: design-reference-and-implementation-contract
primary_consumer: Claude / shopify-headless SKILL
functional_authority: 1DA __ Car Brite - Second Storefront.docx
visual_authority: supplied Home Page HTML in Design folder
status: SOW-corrected; exact HTML values require direct extraction from source HTML
---

# Car Brite — Home Page Design Specification

## Purpose

This document is the implementation reference for rebuilding the **Car Brite Home Page** as part of the second Shopify storefront built with **Shopify Hydrogen**.

It is intended to be consumed alongside the project's `shopify-headless` SKILL.

The two authorities have different responsibilities:

- **Supplied Home Page HTML** = visual and interaction authority.
- **Car Brite SOW** = functional, Shopify architecture, data-source, integration, and scope authority.

Do not redesign the supplied HTML. Do not allow Hydrogen implementation convenience to change the approved visual design.

> **Extraction status:** the SOW is available and has been incorporated. The `Design.zip` archive is not readable by the current file-analysis runtime, so exact HTML/CSS values are not fabricated in this revision. Every field that must come directly from the HTML is explicitly marked `[EXTRACT FROM HTML]`.

---

# Non-Negotiable Project Rules

1. Build a **second storefront** using Shopify Hydrogen.
2. The existing Shopify storefront must remain live and operational during development.
3. **Do not modify the active Dawn theme.**
4. Use Shopify's **Storefront API** and, where required, **Admin API**.
5. The homepage must be implemented using reusable Hydrogen components.
6. Homepage content must be merchant-manageable through **Shopify Metaobjects** where required by the SOW.
7. Banners, featured collections, promotional sections, and other configurable homepage blocks must not require code changes for ordinary content updates.
8. Navigation and mega-menu behavior must be compatible with Hydrogen.
9. Preserve the supplied HTML's exact visual composition.
10. Responsive behavior must support desktop, tablet, and mobile.
11. Google Analytics integration must not alter the page design.
12. Recharge/subscription UI is implemented only where the approved design and product/business requirements expose subscription purchasing.
13. Do not transfer implementation assumptions from another Shopify project or theme.
14. Do not use Dawn as the rendering layer for the new storefront.
15. Do not change the live Dawn storefront to achieve visual parity.

---

# Source Authority

Use the following priority when implementing the page.

## Visual decisions

1. Supplied Home Page HTML.
2. Supplied CSS, inline styles, linked design assets, and rendered states belonging to that HTML.
3. This specification after HTML values have been extracted.

Visual decisions include:

- section order
- text hierarchy
- visible copy
- images
- iconography
- header geometry
- mega-menu appearance
- container widths
- backgrounds
- colors
- borders
- shadows
- radii
- typography
- spacing
- alignment
- grids
- image ratios
- button styles
- hover states
- open states
- responsive transformations

## Functional decisions

1. Car Brite SOW.
2. Shopify/Hydrogen platform constraints.
3. Project SKILL.
4. This specification.

Functional decisions include:

- source of product/collection data
- Metaobjects
- Storefront API
- Admin API
- customer/cart behavior
- dynamic navigation
- Recharge
- analytics
- deployment architecture
- merchant editability

## Conflict rule

If HTML and SOW appear to disagree:

- **appearance/layout** -> HTML controls
- **data source/functionality/platform** -> SOW controls
- do not delete a SOW-required function merely because static HTML contains mock data
- do not redesign an HTML component merely because a generic Hydrogen component looks different

---

# Page Identity

| Field | Requirement |
|---|---|
| Project | Car Brite - Second Storefront |
| Page | Home Page |
| Storefront type | Headless Shopify storefront |
| Framework | Shopify Hydrogen |
| Hosting | Oxygen or approved equivalent |
| Commerce source | Existing Shopify store |
| Existing theme | Dawn; remains unchanged |
| Homepage content model | Shopify Metaobjects |
| Commerce API | Storefront API |
| Additional management API | Admin API where required |
| Design authority | Supplied HTML |
| Responsive targets | Desktop, tablet, mobile |

---

# HTML Extraction Ledger

Before Claude implements the page, it must inspect the Home Page HTML and populate every item below.

## Document and asset inventory

- HTML filename: `[EXTRACT FROM HTML]`
- page `<title>`: `[EXTRACT FROM HTML]`
- linked stylesheets: `[EXTRACT FROM HTML]`
- inline `<style>` blocks: `[EXTRACT FROM HTML]`
- linked scripts: `[EXTRACT FROM HTML]`
- image asset paths: `[EXTRACT FROM HTML]`
- SVG/icon sources: `[EXTRACT FROM HTML]`
- web-font imports: `[EXTRACT FROM HTML]`
- CSS custom properties: `[EXTRACT FROM HTML]`
- media queries: `[EXTRACT FROM HTML]`
- animation/keyframe declarations: `[EXTRACT FROM HTML]`

## Global layout values

- body background: `[EXTRACT FROM HTML]`
- body text color: `[EXTRACT FROM HTML]`
- body font family: `[EXTRACT FROM HTML]`
- body font size: `[EXTRACT FROM HTML]`
- base line height: `[EXTRACT FROM HTML]`
- max page/container width: `[EXTRACT FROM HTML]`
- desktop horizontal gutters: `[EXTRACT FROM HTML]`
- tablet horizontal gutters: `[EXTRACT FROM HTML]`
- mobile horizontal gutters: `[EXTRACT FROM HTML]`
- global section vertical spacing: `[EXTRACT FROM HTML]`

## Breakpoints

Record each CSS breakpoint exactly rather than translating it into generic framework breakpoints.

| Breakpoint | Source rule | Visible layout change |
|---|---|---|
| `[EXTRACT]` | `[EXTRACT]` | `[EXTRACT]` |
| `[EXTRACT]` | `[EXTRACT]` | `[EXTRACT]` |
| `[EXTRACT]` | `[EXTRACT]` | `[EXTRACT]` |

---

# Global Design Tokens

Populate directly from the source HTML/CSS.

## Colors

| Token role | Exact source value |
|---|---|
| Page background | `[EXTRACT FROM HTML]` |
| Surface background | `[EXTRACT FROM HTML]` |
| Primary text | `[EXTRACT FROM HTML]` |
| Secondary text | `[EXTRACT FROM HTML]` |
| Muted text | `[EXTRACT FROM HTML]` |
| Primary brand/accent | `[EXTRACT FROM HTML]` |
| Secondary accent | `[EXTRACT FROM HTML]` |
| Border | `[EXTRACT FROM HTML]` |
| Button background | `[EXTRACT FROM HTML]` |
| Button text | `[EXTRACT FROM HTML]` |
| Button hover background | `[EXTRACT FROM HTML]` |
| Button hover text | `[EXTRACT FROM HTML]` |
| Header background | `[EXTRACT FROM HTML]` |
| Footer background | `[EXTRACT FROM HTML]` |
| Focus color | `[EXTRACT FROM HTML]` |

Do not approximate HEX values from screenshots if CSS contains the exact declaration.

## Typography

| Role | Family | Size | Weight | Line height | Letter spacing | Transform |
|---|---|---:|---:|---:|---:|---|
| Body | `[EXTRACT]` | `[EXTRACT]` | `[EXTRACT]` | `[EXTRACT]` | `[EXTRACT]` | `[EXTRACT]` |
| H1 | `[EXTRACT]` | `[EXTRACT]` | `[EXTRACT]` | `[EXTRACT]` | `[EXTRACT]` | `[EXTRACT]` |
| H2 | `[EXTRACT]` | `[EXTRACT]` | `[EXTRACT]` | `[EXTRACT]` | `[EXTRACT]` | `[EXTRACT]` |
| H3 | `[EXTRACT]` | `[EXTRACT]` | `[EXTRACT]` | `[EXTRACT]` | `[EXTRACT]` | `[EXTRACT]` |
| Nav | `[EXTRACT]` | `[EXTRACT]` | `[EXTRACT]` | `[EXTRACT]` | `[EXTRACT]` | `[EXTRACT]` |
| Button | `[EXTRACT]` | `[EXTRACT]` | `[EXTRACT]` | `[EXTRACT]` | `[EXTRACT]` | `[EXTRACT]` |
| Product title | `[EXTRACT]` | `[EXTRACT]` | `[EXTRACT]` | `[EXTRACT]` | `[EXTRACT]` | `[EXTRACT]` |
| Price | `[EXTRACT]` | `[EXTRACT]` | `[EXTRACT]` | `[EXTRACT]` | `[EXTRACT]` | `[EXTRACT]` |

---

# Global Header

The SOW explicitly requires navigation and the mega menu to work in the Hydrogen architecture.

## Extract exact visible structure

Record from HTML:

- announcement/top bar presence: `[EXTRACT FROM HTML]`
- announcement text: `[EXTRACT FROM HTML]`
- header row count: `[EXTRACT FROM HTML]`
- logo source: `[EXTRACT FROM HTML]`
- logo dimensions: `[EXTRACT FROM HTML]`
- primary navigation labels in order: `[EXTRACT FROM HTML]`
- navigation destinations represented in HTML: `[EXTRACT FROM HTML]`
- utility controls: `[EXTRACT FROM HTML]`
- search control appearance: `[EXTRACT FROM HTML]`
- account control appearance: `[EXTRACT FROM HTML]`
- cart control appearance: `[EXTRACT FROM HTML]`
- cart count badge appearance: `[EXTRACT FROM HTML]`
- sticky/fixed behavior: `[EXTRACT FROM HTML]`
- header height: `[EXTRACT FROM HTML]`
- horizontal padding: `[EXTRACT FROM HTML]`
- border/shadow: `[EXTRACT FROM HTML]`

## Mega menu

For every top-level item that exposes a mega menu, record:

- trigger label
- trigger event: hover/click/focus
- panel width
- panel position
- number of columns
- heading hierarchy
- nested link groups
- promotional image/card
- featured product/category blocks
- typography
- padding
- background
- separators
- hover treatment
- open/close transitions
- click-outside behavior
- Escape behavior
- mobile conversion

All values: `[EXTRACT FROM HTML]`.

## Hydrogen behavior

- Navigation data should come from Shopify navigation/menu data or approved API-managed source rather than duplicated hardcoded routes.
- Preserve the HTML hierarchy while using accessible React/Hydrogen interactions.
- Menu buttons must expose correct `aria-expanded` and `aria-controls`.
- Keyboard users must be able to enter, traverse, and leave the mega menu.
- Mobile menu behavior must preserve the source hierarchy.

---

# Home Page Section Inventory

The exact section list and order must be extracted from the supplied HTML.

Do not assume generic ecommerce sections.

Create an inventory in this format after inspection:

| Order | HTML section selector/ID | Visible section name | Full width / contained | Main components | Dynamic source |
|---:|---|---|---|---|---|
| 1 | `[EXTRACT]` | `[EXTRACT]` | `[EXTRACT]` | `[EXTRACT]` | Metaobject/static/navigation/Shopify |
| 2 | `[EXTRACT]` | `[EXTRACT]` | `[EXTRACT]` | `[EXTRACT]` | `[MAP]` |
| 3 | `[EXTRACT]` | `[EXTRACT]` | `[EXTRACT]` | `[EXTRACT]` | `[MAP]` |

The SOW confirms that the homepage architecture must be capable of managing:

- banners
- featured collections
- promotional sections
- other configurable content blocks

Do not interpret that list as permission to add sections absent from the approved HTML.

---

# Per-Section Extraction Contract

For **every** visible section in the HTML, add a section-specific specification containing all of the following.

## Identity

- section order
- HTML selector / ID
- visible section name
- purpose
- exact visible copy
- exact CTA labels
- link targets represented by source

## Geometry

- section width
- max-width
- min-height/height
- top padding
- right padding
- bottom padding
- left padding
- content gap
- column count
- column widths/fractions
- alignment
- overflow behavior

## Typography

Record every unique text style with exact CSS values.

## Colors and surfaces

Record:

- background
- foreground
- border
- overlay
- gradient only if actually present
- opacity
- blend mode if present

## Media

For every image/video:

- source filename/path
- rendered width/height
- aspect ratio
- object-fit
- object-position
- radius
- border
- lazy/eager status in source
- desktop/tablet/mobile replacement behavior

## CTA/button

Record:

- label
- element type
- dimensions
- padding
- border
- radius
- background
- text style
- icon
- hover
- focus
- active
- disabled if present

## Responsive behavior

For each source breakpoint, document exactly:

- stacking order
- hidden/shown elements
- column changes
- font changes
- spacing changes
- image crop changes
- alignment changes
- control changes

Do not invent an independent mobile design.

---

# Shopify Metaobject Mapping

The SOW requires the homepage to be dynamically managed from Shopify Admin.

The final Metaobject design should be derived from the actual HTML sections.

## Recommended pattern

Use one page-level configuration containing ordered references to section-specific Metaobjects, or an equivalent maintainable Shopify structure.

Possible section models are listed below only as implementation patterns; create only those corresponding to actual HTML sections.

### Banner/Hero Metaobject

Potential fields:

- internal name
- eyebrow
- heading
- body/rich text
- desktop image
- mobile image if source design has a separate asset
- CTA label
- CTA URL
- text alignment
- optional theme/style identifier where source design has real variants

### Featured Collection Metaobject

Potential fields:

- internal name
- collection reference
- heading override
- body copy
- CTA label
- CTA URL
- optional supporting image if source design uses one

### Promotional Section Metaobject

Potential fields:

- internal name
- heading
- copy
- image
- link label
- link URL

## Metaobject guardrails

- Do not expose arbitrary spacing/color controls merely because Metaobjects are flexible.
- Merchant controls should change content, references, and approved variants without allowing accidental redesign.
- Keep section order editable only if the approved project workflow requires it.
- Preserve content fallback rules.
- Validate missing media/link states.

---

# Product and Collection Data

Where the HTML shows products or collections:

- Replace mock product content with Shopify Storefront API data.
- Use Shopify image transformations rather than fixed local product assets.
- Use Shopify money formatting.
- Respect product availability.
- Preserve exact product-card visual design.
- Preserve exact collection-card visual design.
- Do not add ratings, quick add, compare, badges, subscriptions, or swatches unless the source design includes them or scope explicitly requires them.

---

# Recharge / Subscription Surfaces

The SOW includes Recharge app installation and selling-plan configuration for the Hydrogen storefront.

Homepage rule:

- Do not add a subscription selector to the homepage unless the approved HTML shows one.
- If the HTML contains a subscription promotion, preserve its exact appearance and CTA.
- Selling-plan data must be sourced from the configured Shopify/Recharge integration, not hardcoded.
- The final checkout flow must remain Shopify-compatible.

---

# Analytics

Google Analytics is required when the client supplies the required tracking code.

Design rule:

- Analytics must not create visible layout changes.
- Avoid duplicate page-view events during Hydrogen client navigation.
- Track meaningful homepage interactions only after analytics requirements are confirmed.

---

# Footer

Extract the footer directly from HTML.

Record:

- number of rows/regions
- logo
- descriptive copy
- navigation group headings
- links in exact order
- newsletter form if present
- social icons
- payment icons
- legal text
- copyright
- country/currency selector if present
- background and foreground colors
- spacing
- borders
- desktop grid
- tablet/mobile stacking
- accordion behavior on mobile if present

All exact values: `[EXTRACT FROM HTML]`.

Do not replace the source footer with a generic Hydrogen starter footer.

---

# Responsive Requirements

The SOW requires desktop, tablet, and mobile support.

## Validation viewports

Use the actual HTML media-query thresholds as authority. At minimum visually QA:

- large desktop: 1440px
- desktop: 1280px
- tablet landscape: 1024px
- tablet portrait: 768px
- mobile: 390px
- small mobile: 360px

## Required checks

- no page-level horizontal overflow
- no clipped header controls
- mega menu usable on keyboard and touch
- mobile navigation usable
- source section order preserved
- text does not overlap media
- CTA targets remain tappable
- product grids reflow exactly as source rules dictate
- images retain intended focal points
- footer remains usable

---

# Accessibility

Preserve the design while implementing:

- semantic landmarks
- logical heading hierarchy
- real links for navigation
- real buttons for state-changing controls
- visible focus states
- keyboard-capable mega menu
- alt text for meaningful images
- empty alt for decorative images
- accessible form labels
- `aria-expanded` for menus/drawers
- Escape to close overlays/drawers
- focus management
- reduced-motion support where animation exists

Do not add visual accessibility treatments that materially redesign the approved page unless needed for compliance.

---

# Performance

Hydrogen implementation should preserve fidelity while optimizing:

- responsive Shopify images
- width/height attributes
- LCP image priority
- lazy loading below fold
- route-level code splitting
- no duplicate third-party libraries
- minimal client JavaScript for static sections
- no layout shift from fonts/media
- cache storefront queries appropriately
- avoid unnecessary Admin API calls on public request paths

---

# Explicit Do-Not-Do Rules

- Do not modify the live Dawn theme.
- Do not build this as a Dawn theme customization.
- Do not hardcode final merchant-editable homepage copy into components.
- Do not use generic Hydrogen starter styling as the visual baseline.
- Do not add sections absent from the HTML.
- Do not remove sections present in the HTML.
- Do not rearrange source sections.
- Do not invent breakpoints.
- Do not invent colors or fonts.
- Do not invent animation.
- Do not add subscription widgets where the design has none.
- Do not add generic recommendations.
- Do not change visible copy without instruction.
- Do not flatten the mega-menu hierarchy.

---

# Home Page Acceptance Checklist

## Design fidelity

- [ ] Exact source HTML section order documented and reproduced.
- [ ] Every visible source section is represented.
- [ ] All exact source copy is preserved.
- [ ] Header matches HTML.
- [ ] Mega menu matches HTML.
- [ ] Footer matches HTML.
- [ ] Exact fonts extracted.
- [ ] Exact font sizes/weights/line heights extracted.
- [ ] Exact colors extracted.
- [ ] Exact spacing/padding/gaps extracted.
- [ ] Exact button states extracted.
- [ ] Exact image ratios/crops extracted.
- [ ] Exact hover/open states extracted.
- [ ] Exact source breakpoints extracted.
- [ ] Desktop/tablet/mobile results match source behavior.

## SOW compliance

- [ ] Hydrogen second storefront used.
- [ ] Dawn remains untouched.
- [ ] Storefront API supplies storefront commerce data.
- [ ] Admin API used only where required.
- [ ] Homepage merchant content mapped to Metaobjects.
- [ ] Banners are manageable without code changes.
- [ ] Featured collections are manageable without code changes.
- [ ] Promotional sections are manageable without code changes.
- [ ] Navigation/mega menu is Hydrogen-compatible.
- [ ] GA integration does not alter layout.
- [ ] Recharge behavior is added only where applicable.
- [ ] Storefront works across desktop/tablet/mobile.

---

# Final Instruction to Claude

Treat the **supplied Home Page HTML as the visual contract** and the **Car Brite SOW as the functional contract**.

Before writing production Hydrogen UI:

1. parse the complete HTML;
2. inspect every linked and inline CSS rule;
3. extract all tokens and breakpoints;
4. record the exact DOM-visible section order;
5. record all visible text and CTAs;
6. record all images/icons and their treatment;
7. record hover, focus, open, active, and responsive states;
8. populate this specification with the extracted values;
9. then map the design to reusable Hydrogen components and Shopify Metaobjects;
10. verify that no change has been made to the active Dawn theme.

Do not claim design parity while any `[EXTRACT FROM HTML]` marker remains unresolved.
