---
tier: 2
load_when: ["agent-specific-detail"]
description: "Design mobile first, scale up. Mobile traffic dominates ecommerce now (60-80% of sessions for most clients). Mobile-first is not negotiable."
---

# 06 — Mobile-First Rules

> Design mobile first, scale up. Mobile traffic dominates ecommerce now (60-80% of sessions for most clients). Mobile-first is not negotiable.

---

## Why mobile-first

1. **Traffic data:** Most ecommerce clients have 60-80% mobile traffic. Designing desktop-first means optimizing for the minority.

2. **Constraint forcing function:** Mobile screen is small. Forces you to prioritize what matters. Easier to add things going larger than to remove going smaller.

3. **Performance:** Mobile devices are slower. Designing for mobile constraints means the desktop experience naturally performs well.

4. **Touch interactions:** Mobile interactions are fundamentally different (tap, swipe, scroll). Retrofitting touch onto desktop-designed pages produces awkward UX.

---

## Touch target rules

### Minimum size: 44px × 44px

Apple HIG, Material Design, and WCAG agree: 44×44 minimum tap target.

Designer Agent enforces:
- Buttons: 44×44 minimum (often larger)
- Links inline in text: at least 44px height with proper line-height + padding
- Form inputs: 44px height minimum
- Icon buttons: 44×44 padding even if icon is smaller

### Spacing between targets

Minimum 8px between adjacent tap targets. Prevents mis-taps.

If targets are stacked vertically (list items, menu items), 12px spacing is comfortable.

---

## Thumb zones

Mobile devices are held one-handed most of the time. Critical interactive elements should be in the **thumb-reachable zone** (lower 2/3 of screen).

```
┌─────────────────┐
│  HARD TO REACH  │  ← Top of screen (status bar, navigation)
│                 │     Avoid: primary CTAs, frequent actions
│                 │
│  MEDIUM REACH   │  ← Top half of content area
│                 │     OK for: page content, secondary actions
│                 │
│  EASY REACH     │  ← Bottom half (primary thumb zone)
│                 │     Best for: primary CTAs, key navigation
│  ↓ ↓ ↓ ↓ ↓ ↓ ↓  │     ← Sticky bottom nav lives here
└─────────────────┘
```

### Recommendations
- **Primary CTAs** on PDP: sticky "Add to Cart" at bottom of viewport
- **Cart/Checkout actions**: bottom of viewport, sticky if scrollable
- **Main navigation**: bottom-nav pattern is increasingly common (apps), or hamburger top-left (web standard)
- **Important controls**: avoid top corners on mobile

---

## Mobile navigation patterns

### Pattern 1: Hamburger menu (top-left or top-right)

Standard web pattern. Click hamburger → drawer slides in with all nav items.

Pros: Simple, well-understood.
Cons: Hidden navigation, requires extra tap to see options.

Use when: Site has many top-level categories (5+), or simple sites where nav isn't the primary engagement.

### Pattern 2: Bottom tab bar (app-style)

5 or fewer primary destinations as a fixed bottom bar.

Pros: Always visible, thumb-friendly, fast.
Cons: Limited to 5 items, can feel app-like (not always appropriate).

Use when: Site is primarily transactional with a few key destinations (Shop, Account, Cart, etc.).

### Pattern 3: Top-level horizontal scroll

Categories shown as horizontally-scrollable chips at top.

Pros: All categories visible, more discoverable than hamburger.
Cons: Can feel cluttered, swipe interaction not obvious to all users.

Use when: 6-15 categories that benefit from being visible.

### Pattern 4: Sticky compact header + full menu in drawer

Combination: top bar with logo + cart + hamburger, drawer with full nav.

Use when: Brand recognition matters (logo visible) AND lots of nav items.

---

## Mobile-first design process

### Step 1: Design at 375px (smallest common mobile width)

Start with iPhone SE / older Android sizes (375px width).

Apply:
- Single column
- Tap targets ≥ 44px
- Critical content above the fold
- Primary CTA reachable in thumb zone
- Hero text large enough to read without zooming

### Step 2: Scale to 768px (tablet)

What changes:
- Two-column layouts possible for some sections
- Slightly more navigation can be visible
- Larger touch targets / more spacing

### Step 3: Scale to 1024px+ (desktop)

What changes:
- Multi-column grids
- Mega menus possible
- Hover states active (now we have a mouse)
- More content above the fold
- Sidebar layouts viable

### Step 4: Adjust for 1440px+ (wide desktop)

What changes:
- Container max-width caps to prevent over-stretching (1440-1600px typically)
- More whitespace around content
- Larger typography for display elements

---

## Mobile-specific design rules

### Typography

- **Body text:** minimum 16px on mobile (smaller hurts readability + iOS zoom-on-focus)
- **Line length:** comfortable line length is 60-75 characters; on mobile this often means slightly larger font + tighter container
- **Heading hierarchy:** maintain semantic hierarchy but visual sizes may compress (h1 doesn't need to be 60px on mobile)

### Spacing

- Section padding can be smaller on mobile (40-60px vs 80-120px on desktop)
- Content padding minimum 16px from screen edge (don't run text to the very edge)
- Vertical rhythm: more breathing room between elements than desktop (small screen feels cramped)

### Images

- Hero images: critical, optimize aggressively
- Product images: at least 600x600px source, lazy-load below fold
- Avoid background-image CSS for important content (no lazy-load, no responsive serving)
- Use `<picture>` element with `srcset` for art direction (different crops at different sizes)

### Forms

- Inputs: 16px font size (prevents iOS zoom on focus)
- Labels visible (not just placeholders — placeholders disappear when typing)
- Use HTML5 input types: `tel`, `email`, `number`, `date` to trigger correct keyboards
- Autofill enabled where appropriate (`autocomplete="..."` attributes)
- Error messages clear, near the field
- Inline validation where possible (don't make user submit to see errors)

### Buttons

- Primary CTA: bold, brand color, full-width on mobile in most contexts
- Multiple CTAs stacked vertically on mobile (not side-by-side, hard to tap accurately)
- Loading states: button shows spinner when action is processing
- Disabled states: visually different but still readable (don't fade to 30%)

---

## Performance on mobile

Mobile has slower CPU, slower network, smaller battery. Designer Agent influences mobile performance by:

### Limiting heavy elements
- Video autoplay: prefer not. If used, muted + short + heavily optimized.
- Animations: subtle, GPU-accelerated (transform, opacity). No layout-thrashing animations.
- Parallax: usually hurts more than helps on mobile (CWV penalty)
- Decorative animations: respect `prefers-reduced-motion`

### Image strategy
- Mobile-specific sizes (smaller variants for mobile)
- WebP/AVIF formats
- Lazy load below-fold images
- Critical hero image: preload + fetchpriority="high"

### Font strategy
- font-display: swap (no FOIT)
- Preload critical fonts
- Self-host where possible (avoid third-party request)
- Subset fonts (Latin only if applicable)

### Third-party scripts
- Defer non-critical scripts
- Push back on heavy chat widgets, multiple analytics, ad scripts (Designer Agent flags to PM)
- Use `<script defer>` or `<script async>` appropriately

---

## Mobile-specific section patterns

### Mobile-friendly hero

Vertical layout: text top, image below, CTA at the bottom of viewport.
OR
Image-first with overlay text: image takes screen, text overlay, CTA at bottom.

### Mobile product card

Image (1:1 or 3:4) + title + price + rating + (optional) quick-add button.
Tap card → goes to PDP.

### Mobile filters

Hidden by default, accessed via "Filter" button. Drawer slides up or in.
Filters within drawer: collapsible groups (Size, Color, Price, etc.)
Apply button at bottom (sticky in drawer).

### Mobile cart

Slide-up drawer from bottom (modern pattern) or full-page (traditional).
Sticky checkout button at bottom.
Line items: image left, details + quantity + remove right.

### Mobile checkout

Single column. One section at a time (accordion or step-by-step).
Sticky "Continue" or "Place order" at bottom.

### Mobile-specific: sticky add-to-cart bar (PDP)

When user scrolls past the primary "Add to Cart" button, a thin bar appears at bottom of viewport with:
- Product thumbnail (small)
- Title (truncated)
- Price
- "Add to Cart" button (compact)

Keeps the conversion action always available.

---

## Tablet considerations

Tablet (768-1023px) is the awkward middle. Decisions:

- Two-column layouts emerge (product grid 2-up, content + sidebar)
- Navigation can still be hamburger OR start showing top-bar items
- Cart can be drawer (like mobile) or sidebar (like desktop)

Designer Agent tests at tablet specifically — many designs break here.

---

## Mobile testing checklist

Before declaring mobile design complete:

```
[ ] Designed at 375px (iPhone SE / older Android baseline)
[ ] Touch targets ≥ 44×44
[ ] Touch targets ≥ 8px apart
[ ] Primary CTA in thumb zone
[ ] Body text ≥ 16px
[ ] Form inputs ≥ 16px font (prevents iOS zoom)
[ ] No horizontal scrolling at 375px (unless intentional like horizontal carousel)
[ ] No text running to screen edge (≥ 16px container padding)
[ ] Hero usable on mobile (not just shrunk desktop)
[ ] Navigation accessible (hamburger or visible)
[ ] Cart accessible (icon visible, count visible)
[ ] Search accessible (icon visible, opens to keyboard-friendly input)
[ ] Loading states for primary actions
[ ] Error states visible and helpful
[ ] Tested at 375, 414 (iPhone Plus), 768 (tablet), 1024 (desktop), 1440 (wide)
[ ] Tested with thumb (one-handed) for thumb zone validation
```

---

## Anti-patterns

1. **Designing desktop first, then squeezing into mobile.** Always wrong outcome.

2. **Hover-dependent interactions.** Mobile has no hover. Tap-to-reveal or always-visible.

3. **Tiny touch targets.** "It looks cleaner with smaller buttons" → users miss them, conversion drops.

4. **Modal/popup on mobile that can't be dismissed.** Always have visible close button (44×44).

5. **Carousels as primary navigation.** Users miss content, hurts performance.

6. **Auto-play video on mobile.** Wastes battery, data, can autoplay sound (prohibited by browsers anyway). Use thumbnail + tap-to-play.

7. **Fixed positioning that traps scroll.** Mobile users need to scroll. Fixed elements (headers, modals) should never prevent scroll.

8. **Tooltip-only information.** Tooltips don't work well on touch. If info is important, put it in the page.

---

Last reviewed: 2026-05-24 by Claude (initial)
Next review due: 2026-08-24
