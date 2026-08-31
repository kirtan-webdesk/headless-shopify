# WebDesk AI Delivery System — WordPress + Elementor Edition (v1.11.11)

> Spine + WordPress / WooCommerce platform skill only. Use for WordPress skill-development windows or client projects (Elementor Path B or ACF-based).

This is a WordPress-only edition, split technology-wise from the full release. It carries no Shopify, BigCommerce, or Magento content, and its decision inventory has been filtered to WP-relevant D-codes only.

For multi-platform teams or full canonical reference, install `webdesk-ai-delivery-system-v1.11.11.zip` instead.

---

## What's here

- `skills/_spine/` — Universal agents, persona, shared knowledge
- `skills/_contracts/` — JSON schemas + spec templates
- `skills/_decisions/decision-inventory.md` — **Filtered inventory** (WP-relevant D-codes + universals only; no D-NB / D-VU / D-B2B / D-MR)
- `skills/wordpress-woocommerce/` — WP + WooCommerce platform skill (platform arm + Redesign project skill + v1.11.3 Elementor / WC depth)
- `tools/scripts/` — validator, init-project, wp-safe-deploy, verify-edition-integrity (NEW), filter-inventory-for-edition (NEW)
- `docs/user-guide/QUICKSTART-PER-PROJECT.md` — read before starting

---

## Quick start for a WordPress project

```bash
# From this directory, init a new project:
tools/scripts/init-project.sh /path/to/new/project --platform wordpress-woocommerce --type redesign

# Or interactively:
tools/scripts/init-project.sh
```

Then open the project in Claude Code. `CLAUDE.md` at project root auto-loads.

For skill-development work (not a client project), see the WP skill-dev window prompt in the separate `v1.11.2-window-prompts-SKILLDEV.zip`.

---

## Why this WP-only edition exists

For a WP-only project or skill-dev window you only need the spine plus the WP arm. This edition keeps the context footprint small and excludes every other platform arm.

Per Option A (v1.11.11 decision), platform editions ship filtered decision inventories: this WP edition's `decision-inventory.md` excludes Shopify project D-codes (D-NB, D-VU, D-B2B, D-MR). D-WP codes and universals are present.

If the WP window needs to reference Shopify equivalents when building parallel WP project skills (e.g., WP Version Upgrade patterned after Shopify D-VU-*), request the specific Shopify file from the master window.

---

## WordPress project types available in this bundle

| Project type | Status | Location |
|--------------|--------|----------|
| `redesign` | Built (v1.10.0, refined v1.11.3) | `wordpress-woocommerce/projects/redesign/` |
| `new-build` | **Built (v1.0.0)** | `wordpress-woocommerce/projects/new-build/` |
| `migration` | Not yet built | Pending |
| `version-upgrade` | Not yet built | Pending |
| `b2b-wholesale-setup` | Not yet built | Pending |
| `multi-region-multi-store-setup` | Not yet built | Pending |

Building the pending 5 project types is the ongoing skill-dev work in the WP window.

---

## Knowledge files in wordpress-woocommerce/knowledge/

Full platform arm — 22 files:

| # | File | Purpose |
|---|------|---------|
| 00 | overview | Platform overview |
| 01 | coding-standards-php | PHP standards |
| 02 | naming-conventions | Naming |
| 03 | accessibility | A11Y |
| 04 | performance-budget | Perf |
| 05 | security-baseline | Security |
| 06 | theme-structure-patterns | Theme structure |
| 07 | classic-editor-and-acf | Classic + ACF |
| 08 | page-builders | D-WP-03 Path A vs B (updated v1.11.3) |
| 09 | forbidden | WP forbidden patterns |
| 10 | seo-baseline | SEO |
| 11 | woocommerce-architecture | WC core (updated v1.11.3 with content-product.php protocol) |
| 12 | woocommerce-checkout-cart | WC checkout |
| 13 | woocommerce-products | WC products |
| 14 | app-plugin-ecosystem | Plugin rubric |
| 15 | database-and-queries | DB + queries |
| 16 | hooks-actions-filters | WP hooks |
| 20 | elementor-architecture | Elementor Theme Builder + patterns (updated v1.11.3) |
| 21 | elementor-performance | Elementor perf |
| 22 | elementor-qa-checklist | Elementor QA (updated v1.11.3) |
| 23 | scss-architecture-wp | Tool-agnostic SCSS |
| 24 | woocommerce-css-conflicts | **NEW v1.11.3** — pilot-derived CSS conflict patterns |

---

## Changes in this build (v1.11.11 patch)

- **E1 addressed** — `tools/scripts/wp-safe-deploy.sh` retained in the WP bundle (that's where it belongs).
- **E2 addressed** — `skills/_decisions/decision-inventory.md` filtered to WP + universal codes. D-NB / D-VU / D-B2B / D-MR removed at packaging time.
- **E3 addressed** — D-VU-04 canonical pointer fix (`06-` → `07-parallel-theme-strategy.md`). Doesn't affect WP directly but shows in canonical inventory for any window that references it.
- **`init-project.sh` menu display** — hardened via `printf` for consistent terminal rendering.
- **NEW tools** — `verify-edition-integrity.sh` and `filter-inventory-for-edition.py`.

**No WP skill content changes.** All `skills/wordpress-woocommerce/*` files are byte-identical to v1.11.3.

---

Current version: 1.11.4
Release date: 2026-07-01
