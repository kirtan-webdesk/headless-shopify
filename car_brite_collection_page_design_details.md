---
name: car-brite-collection-page-design-spec
page: collection_page
project: Car Brite - Second Storefront
platform: Shopify Hydrogen
purpose: design-reference-and-implementation-contract
primary_consumer: Claude / shopify-headless SKILL
functional_authority: 1DA __ Car Brite - Second Storefront.docx
visual_authority: supplied Collection Page HTML in Design folder
status: SOW-corrected; exact HTML values require direct extraction from source HTML
---

# Car Brite — Collection Page Design Specification

## Purpose

This document defines the design and implementation contract for the **Car Brite Collection Page** in the second Shopify storefront built with **Shopify Hydrogen**.

It must be used with the project's `shopify-headless` SKILL.

Authority split:

- **Collection Page HTML** controls exact visible design and interaction.
- **Car Brite SOW** controls required collection functionality, Shopify architecture, data retrieval, and scope.

> **Extraction status:** the SOW is available and incorporated below. The `Design.zip` archive is not readable by the current file-analysis runtime, so no exact HTML-derived visual value is guessed. HTML-dependent fields are marked `[EXTRACT FROM HTML]`.

---

# Non-Negotiable Project Rules

1. The collection page belongs to the new Shopify Hydrogen storefront.
2. The current Dawn storefront remains live and unchanged.
3. Use Shopify Storefront API for dynamic collection/product data.
4. The SOW explicitly requires:
   - collection information
   - product listings
   - pagination
   - filtering
   - sorting
   - dynamic Storefront API retrieval
5. Do not remove filtering, sorting, or pagination from scope.
6. Do not convert the page into a static collection mockup.
7. Preserve the exact HTML product-card design.
8. Preserve the exact HTML filter/sort/pagination appearance once extracted.
9. Responsive implementation must support desktop, tablet, and mobile.
10. Collection and product data must not be duplicated as static source-of-truth content in JSX.
11. Recharge/selling-plan behavior should not be injected into collection cards unless the approved design and business requirements expose it there.
12. Google Analytics must not change the design.

---

# Source Authority

## Visual authority

The supplied Collection Page HTML controls:

- section order
- collection heading layout
- breadcrumbs
- description placement
- filter layout
- filter labels
- filter controls
- active-filter states
- result count
- sorting placement
- product grid
- card dimensions
- product metadata hierarchy
- buttons/icons
- pagination appearance
- empty states if included
- hover states
- responsive layout
- footer/header design

## Functional authority

The Car Brite SOW controls:

- Hydrogen implementation
- Shopify data retrieval
- product listings
- collection data
- pagination
- filtering
- sorting
- Storefront API
- responsive support
- storefront isolation from Dawn

## Conflict rule

- appearance -> HTML
- functionality/data source -> SOW
- static mock values in HTML must become real Shopify data without changing their visual placement

---

# Page Identity

| Field | Requirement |
|---|---|
| Project | Car Brite - Second Storefront |
| Page | Collection Page |
| Framework | Shopify Hydrogen |
| Store data | Existing Shopify store |
| Primary data API | Storefront API |
| Existing theme | Dawn; unchanged |
| Required commerce features | Product listing, filtering, sorting, pagination |
| Design source | Supplied Collection Page HTML |
| Responsive | Desktop, tablet, mobile |

---

# HTML Extraction Ledger

Before implementation, extract the following directly from the collection HTML and CSS.

## Document

- HTML filename: `[EXTRACT FROM HTML]`
- `<title>`: `[EXTRACT FROM HTML]`
- stylesheets: `[EXTRACT FROM HTML]`
- scripts: `[EXTRACT FROM HTML]`
- CSS variables: `[EXTRACT FROM HTML]`
- media queries: `[EXTRACT FROM HTML]`
- icons/SVGs: `[EXTRACT FROM HTML]`
- product image assets used by mockup: `[EXTRACT FROM HTML]`

## Global geometry

- max content width: `[EXTRACT FROM HTML]`
- desktop gutters: `[EXTRACT FROM HTML]`
- tablet gutters: `[EXTRACT FROM HTML]`
- mobile gutters: `[EXTRACT FROM HTML]`
- page background: `[EXTRACT FROM HTML]`
- primary text: `[EXTRACT FROM HTML]`
- border color: `[EXTRACT FROM HTML]`
- global radius: `[EXTRACT FROM HTML]`
- global shadow style: `[EXTRACT FROM HTML]`

---

# Header and Mega Menu

The collection page must use the same shared Hydrogen header system as the homepage unless the supplied collection HTML deliberately differs.

Extract:

- announcement bar
- logo
- nav order
- mega-menu triggers
- search
- account
- cart
- badge
- header height
- sticky behavior
- desktop/menu transitions
- mobile drawer/accordion

Exact values: `[EXTRACT FROM HTML]`.

The shared implementation must avoid duplicating header logic per route.

---

# Collection Page Structural Inventory

The exact top-to-bottom order must come from the source HTML.

Populate:

| Order | Region | Source selector | Visible copy | Layout role |
|---:|---|---|---|---|
| 1 | `[EXTRACT]` | `[EXTRACT]` | `[EXTRACT]` | `[EXTRACT]` |
| 2 | `[EXTRACT]` | `[EXTRACT]` | `[EXTRACT]` | `[EXTRACT]` |
| 3 | `[EXTRACT]` | `[EXTRACT]` | `[EXTRACT]` | `[EXTRACT]` |

Possible regions should only be kept if they actually exist in the HTML:

- breadcrumb
- collection hero/header
- collection title
- collection description
- collection image/banner
- filter controls
- active-filter summary
- results count
- sorting
- product grid
- pagination
- no-results state
- loading/skeleton state
- footer

Do not invent a hero or merchandising block if absent.

---

# Collection Header / Hero

Extract exact design:

- breadcrumb presence: `[EXTRACT FROM HTML]`
- breadcrumb typography: `[EXTRACT FROM HTML]`
- H1 text: `[EXTRACT FROM HTML]`
- H1 font/style: `[EXTRACT FROM HTML]`
- description: `[EXTRACT FROM HTML]`
- description width: `[EXTRACT FROM HTML]`
- hero/banner media: `[EXTRACT FROM HTML]`
- media ratio: `[EXTRACT FROM HTML]`
- text alignment: `[EXTRACT FROM HTML]`
- section background: `[EXTRACT FROM HTML]`
- top/bottom spacing: `[EXTRACT FROM HTML]`

## Shopify mapping

- collection title -> Shopify collection title
- collection description -> Shopify collection description unless approved override exists
- collection image -> Shopify collection image where source design uses it
- URL/handle -> Shopify collection route

Do not hardcode collection titles/descriptions into the route component.

---

# Catalog Control Layout

The SOW requires filtering and sorting. Their **visual structure** must match the HTML exactly.

## Filter area

Extract:

- sidebar vs toolbar vs drawer: `[EXTRACT FROM HTML]`
- desktop position: `[EXTRACT FROM HTML]`
- tablet position: `[EXTRACT FROM HTML]`
- mobile position: `[EXTRACT FROM HTML]`
- filter heading/trigger label: `[EXTRACT FROM HTML]`
- filter group labels: `[EXTRACT FROM HTML]`
- checkbox/radio/button/chip treatment: `[EXTRACT FROM HTML]`
- group expand/collapse behavior: `[EXTRACT FROM HTML]`
- selected state: `[EXTRACT FROM HTML]`
- item count display: `[EXTRACT FROM HTML]`
- clear group control: `[EXTRACT FROM HTML]`
- clear-all control: `[EXTRACT FROM HTML]`
- apply button if present: `[EXTRACT FROM HTML]`
- drawer backdrop if present: `[EXTRACT FROM HTML]`
- close control if present: `[EXTRACT FROM HTML]`
- borders/radii/shadows: `[EXTRACT FROM HTML]`

## Hydrogen filter behavior

- Map visible filters to supported Shopify collection/product filters.
- Preserve query parameters so filtered state is shareable where feasible.
- Server-side or loader-level data retrieval should reflect filters.
- Active filters must stay synchronized with the URL/state.
- Do not create filter values that are not supported by Shopify data.
- Do not silently hide SOW-required filtering because the mockup data is static.
- If the HTML exposes a filter not available from current Shopify data, flag it as a data-model requirement rather than faking results.

---

# Sorting

Extract:

- label: `[EXTRACT FROM HTML]`
- select/button style: `[EXTRACT FROM HTML]`
- position relative to results count: `[EXTRACT FROM HTML]`
- dropdown menu style: `[EXTRACT FROM HTML]`
- icon: `[EXTRACT FROM HTML]`
- open state: `[EXTRACT FROM HTML]`
- mobile treatment: `[EXTRACT FROM HTML]`

## Data behavior

Map the visible sort options to supported Shopify Storefront API sort keys/directions.

Do not expose a sort option that cannot be implemented correctly.

Preserve selected sort state during pagination and filter changes.

---

# Results Count / Catalog Summary

Extract exact text format and typography:

- example source format: `[EXTRACT FROM HTML]`
- location: `[EXTRACT FROM HTML]`
- font: `[EXTRACT FROM HTML]`
- color: `[EXTRACT FROM HTML]`
- relationship to sort/filter controls: `[EXTRACT FROM HTML]`

Dynamic count must use actual Shopify query results.

---

# Product Grid

The product grid must reproduce the source HTML's exact geometry.

## Extract

| Property | Desktop | Tablet | Mobile |
|---|---|---|---|
| Columns | `[EXTRACT]` | `[EXTRACT]` | `[EXTRACT]` |
| Horizontal gap | `[EXTRACT]` | `[EXTRACT]` | `[EXTRACT]` |
| Vertical gap | `[EXTRACT]` | `[EXTRACT]` | `[EXTRACT]` |
| Card width | `[EXTRACT]` | `[EXTRACT]` | `[EXTRACT]` |
| Image ratio | `[EXTRACT]` | `[EXTRACT]` | `[EXTRACT]` |

Also extract:

- grid/list toggle if present
- masonry behavior if present
- container width
- alignment
- card equal-height behavior
- lazy-load behavior suggested by source

Do not change the number of columns to generic Tailwind/Bootstrap conventions.

---

# Product Card Design

Document every visible field exactly.

## Card structure

Extract order:

1. `[EXTRACT FROM HTML]`
2. `[EXTRACT FROM HTML]`
3. `[EXTRACT FROM HTML]`

Possible elements include only those visible in source:

- product image
- secondary hover image
- badge
- vendor
- title
- rating
- regular price
- compare-at price
- unit price
- subscription note
- color swatches
- quick-add
- product-view CTA
- wishlist
- availability

Do not add any absent element.

## Product image

- aspect ratio: `[EXTRACT FROM HTML]`
- object-fit: `[EXTRACT FROM HTML]`
- object-position: `[EXTRACT FROM HTML]`
- border/radius: `[EXTRACT FROM HTML]`
- background: `[EXTRACT FROM HTML]`
- hover swap/zoom: `[EXTRACT FROM HTML]`
- badge positioning: `[EXTRACT FROM HTML]`

## Product title

- exact font: `[EXTRACT FROM HTML]`
- size: `[EXTRACT FROM HTML]`
- weight: `[EXTRACT FROM HTML]`
- line height: `[EXTRACT FROM HTML]`
- line clamp: `[EXTRACT FROM HTML]`
- color: `[EXTRACT FROM HTML]`

## Price

- exact hierarchy: `[EXTRACT FROM HTML]`
- sale/compare formatting: `[EXTRACT FROM HTML]`
- currency formatting placement: `[EXTRACT FROM HTML]`

Price must come from Shopify product/variant data.

## Hover/focus

Extract:

- card hover: `[EXTRACT FROM HTML]`
- image hover: `[EXTRACT FROM HTML]`
- title hover: `[EXTRACT FROM HTML]`
- quick action reveal: `[EXTRACT FROM HTML]`
- keyboard focus: `[EXTRACT FROM HTML]`

Touch devices must not depend on hover for essential actions.

---

# Pagination

The SOW explicitly requires pagination.

Extract:

- pagination location: `[EXTRACT FROM HTML]`
- numeric pages: `[EXTRACT FROM HTML]`
- previous control: `[EXTRACT FROM HTML]`
- next control: `[EXTRACT FROM HTML]`
- active page state: `[EXTRACT FROM HTML]`
- disabled state: `[EXTRACT FROM HTML]`
- button/link size: `[EXTRACT FROM HTML]`
- spacing: `[EXTRACT FROM HTML]`
- border/radius: `[EXTRACT FROM HTML]`
- mobile wrapping/condensing: `[EXTRACT FROM HTML]`

## Hydrogen behavior

- Pagination must query Shopify rather than slicing an already-fetched mock array.
- Preserve filters and sorting between pages.
- Use cursor-based Storefront API pagination while presenting the approved visual pagination model.
- If the HTML displays numbered pages but the underlying API is cursor-based, derive the UI carefully without changing the design contract.
- Keep canonical route/query behavior SEO-safe.

Do not replace source pagination with infinite scroll unless the approved HTML itself uses infinite loading and the SOW is formally revised.

---

# Loading, Empty, No-Results, and Error States

If source HTML includes explicit states, copy them exactly.

If source does not include them, implementation still needs production-safe states but they should use the established design system rather than inventing a new visual language.

Required functional states:

- initial loading / streaming
- filter update loading
- pagination loading
- empty collection
- no filter results
- recoverable Storefront API error

Do not display fake products when data is unavailable.

---

# Shopify Storefront API Mapping

## Collection route

Query should support:

- collection by handle
- collection title
- description
- image where needed
- products
- product media
- pricing
- availability
- filter definitions/values where supported
- pagination cursors
- sort parameters

## Product-card data

Use the minimum fields required by the HTML.

Do not overfetch all variants/metafields if the card does not display them.

## URL state

Where feasible preserve:

- active filters
- sort
- page/cursor representation

This supports back/forward navigation and shareable catalog states.

---

# Recharge / Selling Plans

Collection-page rule:

- Do not add subscription controls to product cards unless the approved HTML contains them.
- If the design displays subscription-eligible messaging, it must use real configured selling-plan eligibility.
- Full subscription selection belongs on the appropriate approved buying surface, typically PDP/cart, unless the source design says otherwise.

---

# Header/Footer Consistency

The collection route must use the same shared shell components as the homepage.

Do not create a second independent header or footer implementation just to match the collection mockup.

If the collection HTML differs from homepage shell, determine whether the difference is:
- intentional route-specific design, or
- static mockup inconsistency.

Visual conflicts must be resolved against the approved project design source, not by guessing.

---

# Responsive Requirements

The SOW requires desktop, tablet, and mobile.

## Validate at minimum

- 1440px
- 1280px
- 1024px
- 768px
- 390px
- 360px

Use source media-query breakpoints as the exact implementation authority.

## Mobile collection requirements

- filter UI must be touch-usable
- filter drawer/modal focus must be managed
- sort remains reachable
- result count remains understandable
- cards remain readable
- product images are not clipped
- pagination is operable
- no horizontal page overflow
- header/mobile navigation remains accessible

---

# Accessibility

Implement:

- semantic collection heading
- accessible breadcrumb if present
- proper labels for sort/select controls
- fieldset/legend or equivalent semantics for grouped filters
- accessible selected/expanded states
- keyboard filter drawer
- Escape to close
- focus return to trigger
- product-card links with meaningful names
- visible focus
- alt text from Shopify product media
- screen-reader announcement when results update where appropriate

---

# Performance

- fetch only required Storefront API fields
- optimize product images via Shopify CDN
- lazy-load below-fold images
- prioritize only visible LCP asset
- keep filter/sort state transitions efficient
- avoid full page reload where Hydrogen routing can update smoothly
- prevent cumulative layout shift
- cache collection queries appropriately
- avoid Admin API for public collection data unless there is a specific justified requirement

---

# SEO / Semantic Requirements

Without redesigning:

- one primary H1 for collection identity
- product links crawlable
- pagination links/routes crawlable where implementation permits
- collection description available semantically
- canonical URL handling
- filter combinations managed to avoid uncontrolled duplicate indexable URLs as appropriate to project SEO rules
- product images have useful alt text

Do not hide primary collection content behind client-only JavaScript when server rendering can expose it.

---

# Explicit Do-Not-Do Rules

- Do not change Dawn.
- Do not build collection behavior in Dawn.
- Do not remove filters.
- Do not remove sorting.
- Do not remove pagination.
- Do not implement static fake product arrays as production data.
- Do not add infinite scrolling without approved design/scope revision.
- Do not invent quick-add.
- Do not invent badges.
- Do not invent ratings.
- Do not invent swatches.
- Do not invent filter groups.
- Do not invent sort options.
- Do not change product-card hierarchy.
- Do not alter visible HTML copy without approval.
- Do not use generic Hydrogen starter collection styling.

---

# Collection Page Acceptance Checklist

## Design fidelity

- [ ] Exact HTML structural order extracted.
- [ ] Collection header/hero matches source.
- [ ] Filter layout matches source.
- [ ] Filter states match source.
- [ ] Sort control matches source.
- [ ] Results-count placement matches source.
- [ ] Product grid columns/gaps match source.
- [ ] Product-card hierarchy matches source.
- [ ] Product image crop/ratio matches source.
- [ ] Price styling matches source.
- [ ] Hover/focus behavior matches source.
- [ ] Pagination matches source.
- [ ] Header/footer match shared approved shell.
- [ ] Exact CSS breakpoints extracted.
- [ ] Desktop/tablet/mobile behavior matches source.

## SOW compliance

- [ ] Implemented in Hydrogen.
- [ ] Dawn untouched.
- [ ] Collection information comes dynamically from Shopify.
- [ ] Product listings come from Storefront API.
- [ ] Filtering is functional.
- [ ] Sorting is functional.
- [ ] Pagination is functional.
- [ ] Filter/sort/page states persist correctly during navigation.
- [ ] Responsive desktop/tablet/mobile behavior is validated.
- [ ] Analytics integration does not alter layout.
- [ ] Recharge is not injected into unapproved card surfaces.

## Production behavior

- [ ] Empty collection handled.
- [ ] No-results state handled.
- [ ] API errors handled.
- [ ] Keyboard filtering works.
- [ ] Mobile filter controls work.
- [ ] Product links are valid.
- [ ] No mock catalog data remains.

---

# Final Instruction to Claude

Treat the **Collection Page HTML as the exact visual contract** and the **Car Brite SOW as the functional/data contract**.

Before production implementation:

1. parse the complete collection HTML;
2. inspect all CSS and media queries;
3. extract the exact header, collection header, catalog controls, product grid, card, pagination, and footer values;
4. document every visible state;
5. populate all `[EXTRACT FROM HTML]` fields;
6. preserve source DOM-visible hierarchy while replacing mock content with Storefront API data;
7. implement working filtering, sorting, and pagination;
8. validate all responsive states;
9. reuse shared Hydrogen shell components;
10. verify that the live Dawn storefront has not been changed.

Do not mark the collection page design specification complete while any source-derived `[EXTRACT FROM HTML]` field remains unresolved.
