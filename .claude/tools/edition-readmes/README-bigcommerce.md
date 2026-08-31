# WebDesk AI Delivery System — BigCommerce Edition (v1.11.11)

> Spine + BigCommerce platform skill (scaffold). Use for BigCommerce skill-development windows OR client project windows.

**BC arm is currently scaffold only** — 3 placeholder files from v1.5.4. The BigCommerce skill-dev window's first job is building out the platform arm (patterned after WP v1.10.0 buildout).

---

## What's here

- `skills/_spine/` — universal agents, persona, shared knowledge
- `skills/_contracts/` — JSON schemas + spec templates
- `skills/_decisions/decision-inventory.md` — filtered (BC + universal codes only)
- `skills/bigcommerce/` — platform arm scaffold (SKILL.md + 00-overview.md + 09-forbidden.md placeholders)
- `tools/` — validator, ship-bundle gate, integrity checker, filter script, init-project
- `docs/user-guide/` + `docs/release-notes/`

NOT included: shopify/, wordpress-woocommerce/, magento-adobe-commerce/, headless/

---

## Quick start

For a BC skill-dev window:
```
1. Install this bundle in a new Cowork window
2. Paste WINDOW-PROMPT-bigcommerce.md as first message
3. Follow the pending-work brief
```

For a BC client project:
```
tools/scripts/init-project.sh /path/to/new/project --platform bigcommerce --type <type>
```

---

## Pending arm buildout (as of v1.11.11)

- Full knowledge base (00-16 range — coding standards, security, accessibility, performance, Stencil architecture, apps ecosystem, DB patterns, etc.)
- 09-forbidden.md rules (populate post-first-pilot)
- At least 1 project skill (Redesign is the reference; New Build second)
- Templates + examples

Follow the WP v1.10.0 model. Register decisions via HANDOFF to master.

Current version: 1.11.8
BC arm version: 0.1.0 (scaffold)
