---
tier: 1
load_when: ["platform-headless", "headless-platform-active", "code-production", "agent-code-review", "g2-design-stage", "g4-sprint-qa", "g6-prelaunch-stage"]
description: "Accessibility baseline for the Headless arm. What the theme's accessible components were providing and now are not, the commerce-specific surfaces that carry the most risk (cart drawer, variant selection, facets, live price and stock updates), focus and announcement rules for a client-rendered storefront, forms and errors, the checkout handoff boundary, and what is tested at which gate. Accessibility is a build item in headless because there is no theme supplying it."
applies_to: [headless]
decision_refs: [D-HL-STACK-01, D-HL-DISCOVERY-01, D-DES-01, D-KB-FIDELITY-01]
last_reviewed: 2026-08-06
next_review_due: 2026-11-06
---

# 03 — Accessibility (Headless)

> **In a theme, a competent theme supplied accessible components — skip links, focus management, announced cart updates, keyboard-operable menus. Headless supplies none of it.**
>
> That is the estimating point and the reason this file sits in the arm rather than deferring entirely to the global standard. Global accessibility rules still apply (`_spine/shared-knowledge/`); this file covers what is specific to a client-rendered commerce storefront.

---

## 1. What changed

| In a theme | In headless |
|---|---|
| Accessible patterns inherited from the theme's components | **Every interactive component is yours**, including its keyboard and screen-reader behaviour |
| Full page loads announced by the browser | **Client-side navigation announces nothing** unless you make it |
| Form errors rendered server-side, in the document | Rendered dynamically — invisible to assistive tech unless associated and announced |
| Theme vendor carried some of the remediation risk | **WebDesk carries it** |

**This is scoped work with hours, not a quality bar someone applies at the end.** Retrofitting focus management into a finished storefront costs multiples of building it in.

---

## 2. Client-side navigation

The single most commonly missed item in a headless build, because nothing appears broken to a sighted mouse user.

- **Move focus on route change.** Typically to the new page's main heading or a focus target at the top of main content. Without this, a screen-reader user stays where they were while the page changes underneath them.
- **Announce the change** via a live region, or by managing focus onto content that names the new page.
- Update the document title on every route change — it is the first thing many users hear.
- Provide a skip link, and make sure it works after client-side navigation, not just on first load.
- Do not trap focus in a component that has just been replaced by a route change.

---

## 3. Commerce surfaces that carry the risk

These are where accessibility failures concentrate in this arm, and they are all custom in headless.

**Cart drawer / mini-cart.** A dialog. It needs a role and label, focus moved in on open, focus **returned to the trigger** on close, `Escape` to close, focus trapped while open, and background content inert. It is the most-used interactive component on the site and it is entirely yours to build in every architecture — including A and B, where the cart *data* comes from the framework but the drawer does not.

**Variant selection.** Selecting a variant changes price, availability and images without a page load. That change must be **announced**. A swatch group is a real form control with a real label, not a row of clickable divs.

**Price and stock updates.** Any value that changes without navigation goes in a polite live region. Silent price changes are both an accessibility failure and a trust problem.

**Facets and filters.** Announce the result count after filtering. Do not move focus to the top of results on every keystroke. Make clearing filters reachable by keyboard.

**Infinite scroll / load-more.** Prefer an explicit control. If content loads automatically, announce it and keep a keyboard path to everything below it.

**Quantity steppers.** A labelled number input with real buttons. Not two divs and a value.

---

## 4. Forms and errors

- Every input has a programmatically associated label. Placeholder text is not a label.
- Errors are associated with their field, announced when they appear, and focus moves to the first error on submit failure.
- Error text says what is wrong and how to fix it.
- Required fields are marked programmatically, not only visually.
- The account and login surfaces are forms too — and in architectures using the legacy customer account flow (Multipass), **you are building those pages**, so they are yours to make accessible.

---

## 5. The basics that still apply

Stated briefly because they are not headless-specific, only headless-*owned* now:

- Semantic HTML first. A `<button>` before a div with a click handler.
- Keyboard operability for everything interactive, with a visible focus indicator that survives the design system.
- Colour contrast meeting the target level, including on hover and disabled states.
- Images have appropriate alternative text; decorative images are marked decorative. **Product images pulled from the platform need an alt strategy** — the platform's alt field is often empty, and that is a content decision, not a code one.
- Heading order reflects structure.
- Motion respects the reduced-motion preference.

---

## 6. The checkout handoff

**Checkout is the platform's, and so is its accessibility** (`07-cart-and-checkout.md`).

What is ours: the transition into it. Announce the handoff rather than silently relocating the user, and do not lose focus context on the way out.

What is not ours to fix: the checkout's own behaviour. If a client raises a checkout accessibility issue, it is a platform matter — **do not accept it as a storefront defect**, and do not attempt to work around it inside checkout, which is the boundary `HL-APPS-004` blocks.

---

## 7. Where it gets tested

| Gate | What happens |
|---|---|
| **G2 / design** | Contrast, focus indicators and keyboard paths reviewed at design time. Per `D-DES-01` the deliverable is an HTML mockup, so these are checkable *before* build rather than described in a static image. |
| **G4 / build** | Automated checks in CI, plus manual keyboard walkthrough of the commerce surfaces in §3. |
| **G6 / release** | Screen-reader pass on the critical path: browse → product → variant select → add to cart → cart drawer → checkout handoff. |

**Automated tooling catches a minority of real issues.** It will not tell you that focus stayed put on route change, that the cart drawer never announced itself, or that a variant change was silent. **The keyboard walkthrough is the test that matters**, and it takes minutes.

---

## Anti-patterns

1. Assuming accessible behaviour carries over from the theme. Nothing carries over.
2. Treating accessibility as a pre-launch remediation pass rather than scoped work with hours.
3. Client-side navigation that moves no focus and announces nothing.
4. A document title that never changes across routes.
5. A skip link that works on first load and breaks after client-side navigation.
6. A cart drawer with no dialog role, no focus trap, no `Escape`, or no focus return to the trigger.
7. Variant selection built from clickable divs instead of real form controls.
8. Price, stock or result-count changes that happen silently.
9. Moving focus to the top of results on every filter keystroke.
10. Infinite scroll with no keyboard path to content below it.
11. Placeholder text used as a label.
12. Error messages that appear visually but are never associated or announced, and no focus move to the first error.
13. Shipping product images with whatever alt text the platform had, with no alt strategy agreed as a content decision.
14. A focus indicator removed because it did not fit the design system.
15. Accepting a checkout accessibility issue as a storefront defect, or trying to fix it inside checkout.
16. Passing automated checks and calling it done without a keyboard walkthrough.

---

Last reviewed: 2026-08-06
Next review due: 2026-11-06
