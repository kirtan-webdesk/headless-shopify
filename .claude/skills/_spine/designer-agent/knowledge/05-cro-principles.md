---
tier: 2
load_when: ["agent-specific-detail"]
description: "Conversion-aware design rules. Designer Agent applies these in every design path to maximize conversion without sacrificing brand."
---

# 05 — CRO Principles

> Conversion-aware design rules. Designer Agent applies these in every design path to maximize conversion without sacrificing brand.

---

## What CRO is (and isn't)

**Conversion Rate Optimization (CRO)** = designing pages so more visitors take the desired action (purchase, sign up, contact, etc.).

CRO IS:
- Reducing friction in the conversion flow
- Surfacing trust signals at decision moments
- Clear hierarchy that guides attention to action
- Mobile-optimized interactions

CRO is NOT:
- Manipulative dark patterns
- Misleading copy
- Hiding information
- Forcing decisions

WebDesk standard: ethical CRO. Help users do what they want to do. Don't trick them into things they don't want.

---

## The 8 CRO principles Designer Agent applies

### 1. Above-the-fold serves the primary goal

The first viewport (before scroll) must:
- Show what the site/product is (within 3 seconds)
- Show the primary CTA (per questionnaire Q17)
- Build credibility (trust signal visible)

Bad above-fold:
- Generic carousel that auto-rotates (hurts CWV, no clear message)
- Hero with no CTA
- Multiple competing CTAs

Good above-fold:
- Clear value proposition (headline + subhead)
- ONE primary CTA (big, contrasting)
- Visual that supports the message
- Trust signal nearby (reviews, press, customer count)

### 2. CTA hierarchy is clear

Every page has ONE primary CTA. Maybe a secondary action. Never 5 equal-weight options.

Hierarchy in design:
- **Primary CTA:** brand-color background, large, prominent placement
- **Secondary CTA:** outlined or text-link, smaller, secondary placement
- **Tertiary:** plain text links

Frontend Agent enforces via button styles (button.primary, button.secondary, button.ghost from tokens).

Anti-pattern: every section ending with "Learn More" button. Each section should have intent. Most sections shouldn't have CTAs at all — keep them for moments of decision.

### 3. Reduce friction at decision points

Friction at:
- **PDP:** variant selector should be obvious, in-stock status clear, shipping/returns visible before scrolling
- **Cart:** total price clear with shipping estimate, no surprise costs at checkout
- **Checkout:** minimum required fields, address autofill, guest checkout default (unless B2B)
- **Sign-up forms:** ask for minimum needed, defer everything else to post-signup

### 4. Trust signals near decision moments

Place trust signals where the user is about to decide:
- **Hero:** "1M+ customers" or press logos
- **PDP:** review stars + count near price, return/shipping policy visible
- **Cart:** secure checkout badges, payment methods accepted
- **Checkout:** security padlock, "your card won't be charged until shipped"
- **Footer:** payment methods, security badges, certifications

Pulled from questionnaire Q20 (which trust signals matter to this audience).

### 5. Social proof at scale-appropriate volume

If client has 50,000 customers: "Loved by 50,000+ customers" is powerful.
If client has 50 customers: don't lie. Use what they have: "Hand-crafted for our community" or feature specific customer quotes.

Match the social proof claim to the actual data. Lies erode trust over time.

### 6. Mobile thumb-zone awareness

On mobile, important interactive elements (primary CTAs, key navigation) should be in the **thumb zone** (lower 2/3 of screen, easy reach with one hand).

Designer Agent flags layouts with:
- Primary CTAs at top of mobile viewport (hard to tap one-handed)
- Important controls in top corners (top-right especially)
- Tiny touch targets (< 44px)

### 7. Speed is a conversion factor

Performance affects CRO directly. Per Google data:
- 1s → 3s page load: 32% bounce rate increase
- 1s → 5s: 90% bounce rate increase
- 1s → 6s: 106% bounce rate increase
- 1s → 10s: 123% bounce rate increase

Designer Agent influences performance by:
- Limiting hero video to ≤ 5 seconds, optimized (or recommending against)
- Avoiding heavy decorative animations
- Recommending image optimization (per `06-mobile-first-rules.md`)
- Pushing back on heavy third-party scripts (chat widgets, multiple analytics)

### 8. Decision support, not decision pressure

Help users decide by providing information. Don't pressure with manipulation.

Acceptable:
- "Only 3 left in stock" (if true)
- "23 customers viewed this in the last hour" (if true)
- Countdown timer for actual time-limited offer
- "Most popular" badge based on actual sales

Not acceptable:
- Fake scarcity ("Only 1 left!" when there are hundreds)
- Fake urgency ("Sale ends in 5 minutes!" then resets)
- Hidden fees revealed at checkout
- Pre-checked add-on boxes
- Confirm-shaming opt-outs ("No thanks, I don't want to save money")

---

## Section-by-section CRO patterns

### Homepage

**Above the fold:**
- Hero with clear value prop + primary CTA + trust signal
- One CTA, not multiple

**Below fold:**
- Featured collection / best sellers (decision support)
- Social proof (reviews, press, customer count)
- Differentiation (what makes you different)
- Secondary CTA (newsletter, story, etc.)

### Product Detail Page (PDP)

**Above fold (mobile):**
- Product image (1-2 visible)
- Title + price
- Star rating + review count
- Primary CTA: "Add to Cart"
- Variant selector

**Below fold:**
- Additional images / video
- Description
- Detailed features
- Shipping & returns
- Reviews
- Related / cross-sell

**Critical:** "Add to Cart" should always be reachable. Sticky add-to-cart bar on mobile is standard now.

### Collection Page (PLP)

**Top:**
- Collection title + count
- Filters (collapsible on mobile)
- Sort dropdown
- Active filters as removable chips

**Products grid:**
- Image + title + price + rating
- Quick-view or quick-add (if relevant)
- Quick filters visible / accessible

**Bottom:**
- Pagination or load-more
- Related collections

### Cart

**Top:**
- Number of items, subtotal
- Free shipping progress bar (if applicable)

**Per line item:**
- Image, title, variant, quantity controls, price, remove
- Substitute / size guide if applicable

**Bottom:**
- Promo code field (small, not loud)
- Shipping estimator
- Subtotal + estimated total
- Primary CTA: "Checkout"
- Continue shopping link
- Trust badges + payment methods

**Mobile:** sticky checkout button at bottom.

### Checkout

**Per platform's checkout flow** (limited customization in some platforms). Where customization is possible:

- Guest checkout default
- Email-first (so you can recover abandoned carts)
- Address autofill via Google Maps API or similar
- Clear shipping options + costs visible early
- Payment options clear (cards, Apple Pay, Shop Pay, etc.)
- Order summary visible at all times
- Trust signals: security badges, return policy, support contact

---

## CRO testing approach

Designer Agent cannot run A/B tests. But Designer Agent CAN design pages that are TESTABLE:

- Single variable changes possible (color, headline, CTA copy)
- Clear conversion event (defined per page)
- Components isolated for A/B test platforms (Optimizely, Convert, etc.)

In handoff, document which sections are "A/B test ready" (clear variant possible, conversion event clear).

---

## CRO anti-patterns

1. **Auto-rotating hero carousels.** Users miss messages, hurt performance. Use one strong hero or static rotation with manual controls.

2. **CTAs that don't say what they do.** "Click here" is bad. "Add to Cart" or "Get Free Shipping" is good.

3. **Pricing hidden behind clicks.** If user has to click to see price, you lose them.

4. **Too many fields in cart/signup forms.** Each field reduces completion. Ask only for what you need.

5. **Generic "Submit" buttons.** Replace with what happens. "Submit" → "Get my quote" → "Send my contact info to sales".

6. **Trust signals in the footer only.** Place them near decision moments, not just at the bottom.

7. **Designing for desktop, then "making it work" on mobile.** Mobile-first from the start (see `06-mobile-first-rules.md`).

8. **Sacrificing performance for visual flair.** Heavy animations / videos that hurt LCP hurt conversion more than they help engagement.

---

## CRO integration with brand

CRO is sometimes in tension with brand. A "loud" CTA may not feel premium. A countdown timer may feel pushy for a luxury brand.

Resolution: respect brand. CRO principles are GUIDELINES, not rules to override brand identity. Use:
- Premium brand: subtle but clear CTAs, generous whitespace, trust signals as quiet quality indicators (certifications, press logos)
- Mass-market brand: bold CTAs, social proof loud (customer count, reviews), more obvious urgency

Tune to the brand's voice while applying CRO fundamentals.

---

## Output

CRO recommendations are integrated into:
- `section-map.json` (which sections, in what order)
- Mockups (where trust signals appear, CTA hierarchy)
- Section pattern selections (CRO-tested patterns picked from library)

Not a separate artifact. CRO is baked into design decisions.

---

Last reviewed: 2026-05-24 by Claude (initial)
Next review due: 2026-08-24
