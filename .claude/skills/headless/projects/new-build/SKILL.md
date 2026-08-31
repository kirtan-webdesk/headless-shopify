---
name: new-build
description: Project type 1 — New Build. No existing store, or an existing store from which nothing carries over. The only headless type where the discovery audit does not block pricing, because there is nothing to audit. Still requires architecture selection, environment preflight, the app qualification gate for every proposed app, and the build-it-yourself inventory if the architecture is C. Estimated against the design surface and the commerce feature list, never against a theme benchmark.
version: 0.1.0
tier: 1
load_when: ["headless-new-build-active", "project-new-build", "platform-headless", "headless-platform-active"]
tools: [Read, Write, Edit, Glob, Grep, Bash]
model: sonnet
applies_to: [headless]
decision_refs: [D-HL-TYPES-01, D-HL-STACK-01, D-HL-ENV-01, D-HL-APPS-01, D-HL-DISCOVERY-01, D-KB-FIDELITY-01]
last_reviewed: 2026-08-11
next_review_due: 2026-11-11
---

# Type 1 — New Build

> `D-HL-TYPES-01` §1. **No existing store, or an existing store from which nothing carries over.**
>
> Discriminator: *"Is anything live today?"* → **No.**

---

## What is absent

- No data migration.
- No app inventory.
- No URL parity.
- No functional parity audit.

**This is the only type where the discovery audit does not block pricing** (`D-HL-DISCOVERY-01`) — **there is nothing to audit.**

**"Nothing carries over" is a finding, not an assumption.** A client with a live store who says "we're starting fresh" is describing an intention. If any URL, app, customer record or piece of content is expected to survive, this is not a New Build — it is type 2 or 3, and the audit blocks pricing.

---

## What still applies

| Requirement | Why it survives the absence of an audit |
|---|---|
| **Architecture selection** (`D-HL-STACK-01`) | Declared or derived, one of A/B/C/D, locked at signature |
| **Environment preflight** (`D-HL-ENV-01`) | Nothing to audit does not mean nothing to verify. Includes check **1b** if the machine serves more than one architecture. |
| **App qualification gate** (`D-HL-APPS-01`) | Asked of every app **proposed for the new build**, not just existing ones. All five questions. Default bucket 4. |
| **The build-it-yourself inventory, if architecture C** | Cart handlers, analytics and consent components, Customer Account API wiring — plus routes, caching, redirects and SEO. **This is the pricing basis for C.** |
| **B1 deploy spike, if architecture B** | Before signature. A greenfield build does not make a self-host path less unproven. |

---

## Estimating basis

**The design surface and the commerce feature list. Not a theme benchmark.**

`D-HL-DISCOVERY-01`, verbatim: *"Do not estimate a Hydrogen project as a normal theme redevelopment."* A New Build is the type where this rule is easiest to break, because with no legacy site to point at, a theme project is the only comparable anyone has.

Everything the theme layer would have supplied is a line item here: analytics events, consent enforcement, SEO metadata and structured data, accessibility behaviour, cart UI, account pages.

---

## Anti-patterns

1. Accepting "we're starting fresh" as fact when a live store exists, and skipping the audit that would have caught the carryover.
2. Estimating against a theme build because there is no legacy site to compare against.
3. Skipping the app qualification gate because the apps are new — the five questions apply to proposed apps too.
4. Skipping preflight because there is nothing to migrate.
5. Pricing architecture C without the build-it-yourself inventory.
6. Signing a B engagement without the deploy spike, on the reasoning that greenfield is lower risk.
7. Deriving an architecture and building on it without human confirmation.
8. Treating analytics, consent, SEO or accessibility as inherited defaults rather than build items.
9. Ending the engagement with no retainer decision, and letting the storefront go stale by default.
10. Letting a "new build" quietly acquire URL-parity obligations mid-project without re-pricing.

---

Last reviewed: 2026-08-11
Next review due: 2026-11-11
