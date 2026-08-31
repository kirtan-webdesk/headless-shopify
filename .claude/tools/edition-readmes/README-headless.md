# WebDesk AI Delivery System — Headless Edition (v1.11.11)

> Spine + Headless platform skill (minimal scaffold). Use for Headless skill-development windows OR client project windows.

**Headless arm is minimal scaffold** — 3 files created v1.11.11 to reserve arm structure. Headless has fundamentally different architecture than monolithic platforms (per C-HEADLESS-01). The Headless skill-dev window defines the stack-selection framework FIRST, then builds arm content.

---

## What's here

- `skills/_spine/` — universal agents, persona, shared knowledge
- `skills/_contracts/` — JSON schemas + spec templates
- `skills/_decisions/decision-inventory.md` — filtered (Headless + universal codes only)
- `skills/headless/` — arm scaffold (SKILL.md + 00-overview.md + 09-forbidden.md placeholders)
- `tools/` — validator, ship-bundle gate, integrity checker, filter script, init-project
- `docs/user-guide/` + `docs/release-notes/`

NOT included: shopify/, wordpress-woocommerce/, bigcommerce/, magento-adobe-commerce/

---

## First job for Headless window

Answer the stack-selection question. WebDesk's headless offering could support:

- Hydrogen (Shopify-backed)
- Next.js Commerce + Shopify
- Next.js Commerce + BigCommerce
- Saleor (GraphQL-first backend)
- Vendure (Node/TS backend)
- Medusa (Node.js backend)
- Custom composable (headless WP + Contentful + Next.js, etc.)

Not all of these should be WebDesk-supported. Master ratifies the shortlist as decisions (D-HL-STACK-01 or similar) once the window proposes them.

---

## Pending arm buildout (as of v1.11.11)

- Populate `knowledge/00-overview.md` with stack-selection framework
- Populate `09-forbidden.md` post-first-pilot
- Formalize headless project-type taxonomy (New Build, Migration to headless, Framework upgrade)
- Cascade tag registration (following v1.11.6+ pattern in shopify/wordpress-woocommerce arm 00-overview files)
- CRITICAL QA codes for headless

Register decisions via HANDOFF to master.

Current version: 1.11.8
Headless arm version: 0.1.0 (scaffold)
