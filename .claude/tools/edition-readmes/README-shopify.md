# WebDesk AI Delivery System — Shopify Edition (v1.11.11)

> Spine + Shopify platform skill only. Use for Shopify / Shopify Plus skill-development windows or client projects.

This is a Shopify-only edition, split technology-wise from the full release. It carries no WooCommerce, BigCommerce, or Magento content, and its decision inventory has been filtered to Shopify-relevant D-codes only.

For multi-platform teams or full canonical reference, install `webdesk-ai-delivery-system-v1.11.11.zip` instead.

---

## What's here

- `skills/_spine/` — Universal agents, persona, shared knowledge
- `skills/_contracts/` — JSON schemas + spec templates
- `skills/_decisions/decision-inventory.md` — **Filtered inventory** (Shopify-relevant D-codes + universals only; no D-WP)
- `skills/shopify/` — Shopify platform skill (5 project types: redesign, new-build, version-upgrade, b2b-wholesale-setup, multi-region-multi-store-setup)
- `tools/scripts/` — validator, init-project, safe-push, verify-edition-integrity (NEW), filter-inventory-for-edition (NEW)
- `docs/user-guide/QUICKSTART-PER-PROJECT.md` — read before starting

---

## Quick start for a Shopify project

```bash
# From this directory, init a new project:
tools/scripts/init-project.sh /path/to/new/project --platform shopify --type new-build

# Or interactively:
tools/scripts/init-project.sh
```

Platform options at the prompt:
- `shopify` — basic / standard / advanced plans
- `shopify-plus` — Plus plan (B2B native, expansion stores, etc.)

Then open the project in Claude Code. `CLAUDE.md` at project root auto-loads.

See `docs/user-guide/QUICKSTART-PER-PROJECT.md` for full setup instructions.

---

## Why this Shopify-only edition exists

For a Shopify-only project you only need the spine plus the Shopify arm. This edition keeps the context footprint small and excludes every other platform arm so a Shopify window never loads content it can't use.

Per Option A (v1.11.11 decision), platform editions ship filtered decision inventories: this Shopify edition's `decision-inventory.md` excludes all D-WP-* codes.  For the full canonical inventory (all platforms), use the full release.

---

## Shopify project types available

| Project type | Skill location | Use when |
|--------------|----------------|----------|
| `redesign` | `shopify/projects/redesign/` | Existing-store redesigns |
| `new-build` | `shopify/projects/new-build/` | From-scratch store builds |
| `version-upgrade` | `shopify/projects/version-upgrade/` | 1.0 → 2.0, theme upgrades, major refactors |
| `b2b-wholesale-setup` | `shopify/projects/b2b-wholesale-setup/` | B2B / wholesale features (Plus native or hybrid) |
| `multi-region-multi-store-setup` | `shopify/projects/multi-region-multi-store-setup/` | Markets, expansion stores, international |

Each project type has its own SKILL.md + knowledge files + templates.

---

## Changes in this build (v1.11.11 patch)

All 4 escalations from the Shopify window's v1.11.3 audit are now baked into the official release:

- **E1 addressed** — `tools/scripts/wp-safe-deploy.sh` no longer ships in the Shopify bundle (WP-only tooling belongs in WP edition).
- **E2 addressed** — `skills/_decisions/decision-inventory.md` filtered to Shopify + universal codes only. D-WP-* codes removed at packaging time.
- **E3 addressed** — D-VU-04 file pointer corrected in canonical inventory (`06-` → `07-parallel-theme-strategy.md`).
- **E4 addressed** — Shopify edition README restored to full documentation (this file).

Plus:
- **`init-project.sh` menu display** — hardened via `printf` instead of `echo` for consistent rendering across terminals.
- **NEW tool** `tools/scripts/verify-edition-integrity.sh` — automated test that catches cross-platform contamination in future editions.
- **NEW tool** `tools/scripts/filter-inventory-for-edition.py` — filters canonical inventory per edition at packaging time.

**No Shopify skill content changes.** All `skills/shopify/*` files are byte-identical to v1.11.3.

---

Current version: 1.11.4
Release date: 2026-07-01
