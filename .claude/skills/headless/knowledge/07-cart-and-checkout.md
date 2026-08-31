---
tier: 1
load_when: ["platform-headless", "headless-platform-active", "code-production", "agent-code-review", "g4-sprint-qa", "g0.5-audit-stage"]
description: "Cart ownership and the checkout boundary across all four architectures. The cart ID as a bearer capability, cart lifecycle and persistence, the money-integrity rules, what crosses into checkout and what cannot, the auth-continuity consequence of Multipass, discount and gift-card handling, and cart caching. Enforces HL-CART-001/002/003, HL-APPS-004 and HL-CACHE-001. Checkout belongs to the platform in every architecture — that boundary is not a design decision."
applies_to: [headless]
decision_refs: [D-HL-SEC-01, D-HL-APPS-01, D-HL-DISCOVERY-01, D-HL-STACK-01, D-QA-GATE-BLOCK]
last_reviewed: 2026-08-06
next_review_due: 2026-11-06
---

# 07 — Cart and Checkout (Headless)

> **Checkout belongs to the platform. Always. In all four architectures.**
>
> That sentence is the whole file's premise and it is not a design decision to revisit per project. A requirement that appears to need otherwise is an **escalation at discovery** (`HL-APPS-004`), not an implementation task.

---

## 1. Who owns what

| | Cart owner | Checkout owner |
|---|---|---|
| **A / B** — Hydrogen | Hydrogen cart, backed by the Storefront API cart | **Shopify** |
| **C** — Headless channel + Next.js | **Your code**, backed by the Storefront API cart | **Shopify** |
| **D** — Catalyst | Catalyst cart, backed by BigCommerce | **BigCommerce** |

**The C row is the one that costs money.** In A and B, cart handling ships with the framework. In C you build it — session wiring, line-item mutations, optimistic state, error recovery — and maintain it for the life of the engagement. That is one of the three items `D-HL-STACK-01` names as C's give-up list, alongside analytics/consent components and Customer Account API wiring, and it is the item most often dropped from a C estimate.

**The cart is the platform's in all four.** Your application holds a reference to it and a cache of its contents. It does not hold the cart.

---

## 2. The cart ID is a bearer capability

**Anyone holding the cart ID can read and modify that cart.** No further authentication is required. That single fact generates most of this section.

It is not a secret in the token sense — it lives in a cookie the browser holds and it is not a credential you rotate. It is also **not public data**. Treating it as public is how it ends up somewhere shareable.

**Forbidden, all `HL-CART-001`:**

- In a URL — query string, path, anywhere. URLs get shared, screenshotted, pasted into support tickets and indexed.
- In `localStorage` or `sessionStorage`.
- In an analytics payload, however useful the funnel attribution would be.
- In a log line, an error report, or an APM trace.
- In a client-side error boundary's captured state.

**Correct storage:** a server-set cookie — `Secure`, `HttpOnly` where client JS does not need to read it, `SameSite` chosen deliberately with the checkout return path in mind, and a documented expiry.

**The check that catches this:** grep every logging and analytics call site, then load a real session and inspect every outbound third-party request for the ID. It leaks through third-party SDKs more often than through your own code.

---

## 3. Lifecycle and persistence

- **Create lazily.** A cart is created on the first line-item add, not on first page view. Creating a cart for every visitor generates a large volume of empty carts and, on D, spends quota you did not need to spend.
- **The cart survives the client.** Kill client state mid-session and reload: the cart must come back, because the platform holds it (`HL-CART-003`). If it does not, the app is treating client state as the source of truth.
- **Carts expire, and the expiry is the platform's.** Handle an expired or invalid cart ID as a normal path, not an exception — issue a new cart, tell the customer plainly what happened. A crash on an expired cart ID is a guaranteed defect, because expiry is guaranteed.
- **Multi-tab is normal.** Two tabs, two adds, one cart. Reconcile against the mutation response rather than merging two client states.
- **Login merge is a decision, not a default.** When an anonymous cart meets a logged-in customer's existing cart, the choices are merge, replace or keep-both-and-ask. Pick one per engagement, write it down, and confirm it with the client — every option surprises someone, and the surprise is worse when nobody chose.

---

## 4. Money integrity

**Prices, discounts and totals are authoritative from the commerce API only.**

- Send **identifiers and quantities** to the platform. Read money **back** from the response.
- Never send a price, a discount amount or a line total from the client (`HL-CART-002`). There is no shortcut here worth its failure mode, and the failure always resolves in the customer's favour.
- Any client-computed subtotal is **display-only**, and is re-derived server-side before it influences anything a customer pays.
- **Re-read totals after every mutation.** Quantity changes can cross volume-break thresholds, discount eligibility and shipping-threshold logic. A locally incremented total is wrong at exactly the moment it matters.
- Inventory and price can change between render and checkout. The customer seeing a stale price is a real scenario, not a hypothetical (`HL-ISR-001`), and the platform's checkout will use the real one — so the storefront must not promise otherwise.

---

## 5. The checkout boundary

**What crosses:** the cart, via the platform's checkout URL. That is the interface.

**What does not cross, and must not be built:**

| Requirement heard at discovery | What it actually is |
|---|---|
| "Proxy checkout through our domain" | Not available. Escalate. |
| "Rebuild checkout in the storefront for a seamless look" | Reimplementing checkout. Escalate. |
| "Just a small custom step before payment" | Checkout extensibility — a **different mechanism** from storefront rendering, with its own capabilities and its own plan question. |
| "Keep the customer logged in through to checkout" | An **auth-continuity** question, and the answer depends on §6. |

**Checkout branding and checkout UI extensions: the plan gating is unverified.** Register open item 2 asks *whether* they are plan-gated — the question is the existence of the gate, not its detail. Per `D-HL-APPS-01` gate question 3, verbatim: *"Do not assert checkout capability until that item is verified."* You may name it as an open question. You may not price it, quote it, or promise it in either direction.

**Why the boundary is absolute rather than strongly-preferred:** checkout is where money moves, where PCI scope lives, and where the platform's own fraud, tax and payment logic runs. Nothing built in the storefront layer inherits those, and a "small" custom step is the thin end of a compliance conversation nobody scoped.

---

## 6. Auth continuity into checkout

This is the question clients actually mean when they ask about SSO, and the answer is architecture-dependent:

| Account model | Continuity into checkout |
|---|---|
| **New** customer accounts + Customer Account API | Supported. The intended path. |
| **Legacy** customer accounts (required by Multipass) | **Not maintained.** Quoted: *"This legacy authentication strategy will not maintain authentication between your Hydrogen storefront and checkout."* |

**A Multipass requirement therefore costs storefront→checkout auth continuity**, and that cost is signed for at discovery (`12-discovery-audit.md` §2a), not discovered at UAT. Whatever the client expects at checkout — saved addresses, saved payment methods, order-history continuity — is re-confirmed against that in writing **before** pricing.

The two account models are mutually exclusive. Choosing Multipass closes the Customer Account API for that store, for the whole engagement.

---

## 7. Discounts, gift cards and B2B

- **Discount codes are applied through the cart, by the platform.** The storefront submits a code and reads the result; it does not compute eligibility or amount.
- **A rejected code is a normal response, not an error.** Show the platform's reason rather than a generic failure — "this code has expired" prevents a support ticket that "something went wrong" guarantees.
- **Automatic discounts apply platform-side** and may change totals without any storefront action. Another reason totals are always re-read rather than tracked.
- **Gift cards** are a checkout-surface concern more often than a cart one. Confirm which before scoping, and do not assume the storefront can apply one.
- **B2B** carts carry their own rules — company location, catalogue, payment terms — and B2B works only with customer accounts. Whether a given B2B capability is available headless is a per-capability question, not a single yes.

---

## 8. Caching

**The cart is never shared-cached.** Not the cart query, not any response derived from it, not "just the line count for the header badge."

- Cart responses are per-session by definition. A shared cache entry keyed without the session serves one customer's cart to another — a privacy incident, not a stale page (`HL-CACHE-001`).
- The header cart badge is the specific trap: it looks like chrome, it renders on every page, and it is per-customer data. Render it client-side from a per-session fetch, or exclude it from any cached shell.
- Product and collection data around the cart **can** be cached. The boundary is the cart itself and anything computed from it.

---

## 9. What to check before shipping

| Check | Pass condition |
|---|---|
| Cart ID exposure | Not in URLs, storage, logs, analytics or traces. Verified against a real session's network activity, not just a code read. |
| Cart survives client state loss | Clear client state, reload, cart returns. |
| Expired cart ID | Handled as a normal path with a new cart, not a crash. |
| Money origin | No price, discount or total originates in the client. Traced per request body. |
| Totals after mutation | Re-read from the response, not incremented locally. |
| Checkout boundary | No route in the app owns checkout. |
| Cart caching | No cart-derived response in a shared cache. Two sessions diffed. |
| Login merge behaviour | Chosen, documented, client-confirmed. |

---

## Anti-patterns

1. Designing around the checkout boundary — proxying, reimplementing, or "just a small custom step." Escalate at discovery instead.
2. Promising checkout branding or checkout UI extensions while their plan gating is an unverified open question.
3. Putting the cart ID in a URL, `localStorage`, a log line, an APM trace, or an analytics event.
4. Treating the cart ID as a secret to be rotated, or as public data to be freely passed around — it is neither.
5. Creating a cart on first page view rather than first add.
6. Treating client cart state as the source of truth and the platform as a sync target.
7. Crashing on an expired cart ID, when expiry is guaranteed to happen.
8. Merging an anonymous cart into a customer cart on login with no chosen, documented, client-confirmed behaviour.
9. Accepting a price, discount amount or line total from the client.
10. Incrementing a total locally after a quantity change instead of re-reading it, and missing a volume break or a shipping threshold.
11. Computing discount eligibility in the storefront instead of submitting the code and reading the platform's answer.
12. Showing a generic error for a rejected discount code instead of the platform's reason.
13. Shared-caching a cart response, or the header cart badge, because it renders on every page.
14. Scoping a Multipass engagement without the client signing that storefront login does not carry into checkout.
15. Estimating architecture C as if cart handling came with the framework. In C it is yours to build and maintain.

---

Last reviewed: 2026-08-06
Next review due: 2026-11-06
