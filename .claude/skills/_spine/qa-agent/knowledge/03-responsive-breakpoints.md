---
tier: 2
load_when: ["agent-specific-detail"]
description: "Standard breakpoint matrix tested at every sprint and milestone QA."
---

# 03 — Responsive Breakpoints & Testing

> Standard breakpoint matrix tested at every sprint and milestone QA.

---

## Standard test breakpoints

QA Agent tests at these exact viewport widths:

| Breakpoint | Width | Device class | Required |
|------------|------:|--------------|:--------:|
| Small mobile | 375px | iPhone SE, older Android | ✓ |
| Standard mobile | 390px | iPhone 14/15, modern Android | ✓ |
| Large mobile | 414px | iPhone Pro Max, large Android | ✓ |
| Tablet portrait | 768px | iPad portrait | ✓ |
| Tablet landscape | 1024px | iPad landscape, small laptop | ✓ |
| Standard desktop | 1280px | Most laptop screens | optional |
| Wide desktop | 1440px | Standard external monitor | ✓ |
| Ultra-wide | 1920px | Wide monitor | optional |

**Required = always tested.** **Optional = tested at milestone level, skipped at sprint level if time constrained.**

---

## What to test at each breakpoint

### At every breakpoint

```
[ ] No horizontal scroll (unless intentional carousel)
[ ] All interactive elements visible
[ ] Touch/click targets accessible (≥44px on mobile/tablet)
[ ] Text readable without zoom
[ ] Images load and display correctly (correct srcset variant served)
[ ] No content cropping or overlap
[ ] Navigation accessible (visible or via hamburger/menu)
[ ] Cart icon accessible
[ ] Search accessible (if applicable)
[ ] Footer renders correctly
[ ] No layout breaks between key sections
[ ] Forms usable (input fields large enough, labels visible)
```

### Mobile-specific checks (375-414px)

```
[ ] Single-column layout (multi-column sections collapse)
[ ] Hamburger menu present and functional
[ ] Touch targets ≥ 44×44 with ≥ 8px spacing between
[ ] Primary CTAs in thumb zone (lower 2/3 of viewport)
[ ] Sticky add-to-cart appears on PDP scroll (where applicable)
[ ] Cart drawer/page mobile-optimized (full-width or near-full)
[ ] Forms: 16px font on inputs (prevents iOS zoom)
[ ] Forms: appropriate keyboard for input type (tel, email, number)
[ ] No tap-only-on-hover interactions (everything works on touch)
[ ] Media queries fire correctly (font sizes scale appropriately)
```

### Tablet-specific checks (768-1024px)

```
[ ] Multi-column layouts emerge where appropriate (e.g., product grid 2-up)
[ ] Navigation: hamburger or hybrid (some items visible + more in menu)
[ ] Cart accessible (drawer or sidebar appropriate)
[ ] Touch + cursor both work (tablets often support both)
[ ] Orientation handled (portrait + landscape both work)
```

### Desktop-specific checks (1024px+)

```
[ ] Multi-column layouts active
[ ] Hover states work
[ ] Mega menu functions (if applicable)
[ ] Cart can be drawer or sidebar (whichever spec specified)
[ ] Container max-width caps appropriately (no over-stretched content on wide displays)
[ ] All content scales to wide displays without breaking (1920px+)
```

---

## Orientation testing

Mobile and tablet support portrait AND landscape orientations. QA Agent tests both at:

- 375px wide portrait (iPhone portrait) AND
- 667-812px wide landscape (iPhone landscape)

For tablets:
- 768px portrait AND
- 1024px landscape

Check:
- Layout reflows correctly
- Sticky bottom bars don't take excessive vertical space in landscape
- Modals/drawers usable in both orientations
- No content cut off

---

## Testing method

### Playwright (scripted)

For each breakpoint, Playwright:
1. Sets viewport to exact pixel width
2. Loads the page (clean state, cache disabled)
3. Captures screenshot
4. Runs interaction tests (click hamburger, open cart, navigate to PDP, etc.)
5. Captures screenshot after interaction
6. Compares against baseline (visual regression)
7. Outputs pass/fail per check

Playwright config example:
```javascript
projects: [
  { name: 'mobile-375', use: { viewport: { width: 375, height: 667 } } },
  { name: 'mobile-390', use: { viewport: { width: 390, height: 844 } } },
  { name: 'mobile-414', use: { viewport: { width: 414, height: 896 } } },
  { name: 'tablet-768', use: { viewport: { width: 768, height: 1024 } } },
  { name: 'tablet-1024', use: { viewport: { width: 1024, height: 768 } } },
  { name: 'desktop-1440', use: { viewport: { width: 1440, height: 900 } } },
]
```

### Claude in Chrome (exploratory)

For each breakpoint, Claude in Chrome:
1. Navigates to live preview URL
2. Sets viewport (or uses real-device sizing)
3. Visually inspects the layout
4. Reports on visual hierarchy, touch target feel, thumb zone reachability
5. Tries common user flows
6. Reports on UX quality (subjective judgment)

This catches issues Playwright misses: "the heading feels too big relative to the body text on mobile" or "the hero CTA is hard to reach with my thumb."

See `07-claude-in-chrome-usage.md` for details.

---

## Visual regression

QA Agent maintains baseline screenshots in `qa-reports/visual-baseline/`. On each run:

1. Take current screenshot
2. Diff against baseline
3. If diff > threshold (typically 0.1%), flag for review
4. Reviewer decides: accept new baseline OR mark as regression

Tools:
- Playwright's built-in `toMatchSnapshot()`
- Percy (cloud-based visual diff, paid)
- Chromatic (cloud-based, Storybook integration)
- Reg-suit (open source)

Default: use Playwright's built-in screenshot comparison.

---

## Bug classification by breakpoint

| Issue type | Severity |
|------------|----------|
| Horizontal scroll on any breakpoint | P2 (breaks UX) |
| Content cropped at mobile (text/CTA cut off) | P2 |
| Touch target < 44px on mobile | P3 (accessibility concern) |
| Layout broken at one specific breakpoint (e.g., 414px only) | P2 if major, P3 if minor |
| Image wrong aspect ratio at breakpoint | P3 |
| Spacing slightly off at breakpoint | P4 |
| Hamburger not working | P1 (no mobile nav) |
| Cart inaccessible on mobile | P1 |
| Hover-only interaction with no touch alternative | P2 |

---

## Mobile testing tools beyond Playwright

For deeper mobile testing at milestone or pre-launch:

- **BrowserStack** or **Sauce Labs:** real device cloud testing
- **Chrome DevTools mobile emulation:** quick verification
- **Real devices:** at pre-launch, test on actual iPhone and Android
- **Lighthouse mobile mode:** performance + accessibility on mobile
- **iOS Simulator + Android Emulator:** for behavior verification

QA Agent flags when real-device testing is recommended (typically at milestone + pre-launch).

---

## Anti-patterns

1. **Testing only at desktop and "mobile" without specific breakpoint.** Test at exact widths. "Mobile" is multiple devices.

2. **Skipping landscape orientation.** Many users rotate. Layout must work both ways.

3. **Testing with cache enabled.** Mobile loads differ with cache. Always test cold (cleared cache) for first-impression accuracy.

4. **Visual regression baseline never updated.** Designs evolve. Update baseline when sprints intentionally change visuals.

5. **No real device testing.** Emulators / DevTools miss real-device quirks (iOS Safari especially). Test on physical devices at pre-launch.

6. **Testing only at one zoom level.** Some users use 125% / 150% browser zoom. At least spot-check 125% on desktop breakpoints.

---

## Output

`qa-reports/[stage]/module-3-responsive.md`:

```markdown
# Responsive Testing Report — [Sprint/Milestone ID]

**Tested:** [date]
**Breakpoints tested:** 375, 390, 414, 768, 1024, 1440

## Per-Breakpoint Results

### 375px (small mobile)
- ✓ Layout: clean, single column
- ✓ Navigation: hamburger functional
- ✓ Touch targets: all ≥ 44px
- ✓ Thumb zone: primary CTA reachable
- ✓ Visual regression: no unexpected diffs

### 390px (standard mobile)
[... etc ...]

## Cross-Breakpoint Issues

- BUG-021 (P3): Footer email signup overlaps social icons at 414-475px range
- BUG-022 (P4): Hero subtitle line-height tight at 375px (improves at 390+)

## Visual Regression

- 12 screenshots compared
- 0 unexpected diffs

## Orientation Testing (Mobile/Tablet)

- 375px portrait: ✓
- 667px landscape (iPhone landscape): ✓
- 768px portrait: ✓
- 1024px landscape: ✓

## Status: PASS_WITH_FLAGS

2 P3/P4 issues. No P1/P2.
```

---

Last reviewed: 2026-05-24 by Claude (initial)
Next review due: 2026-08-24
