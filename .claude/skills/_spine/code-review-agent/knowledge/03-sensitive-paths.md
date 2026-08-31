---
tier: 2
load_when: ["agent-specific-detail"]
description: "Per H13, certain file paths require human senior dev review regardless of automated findings. Auto-detected via CODEOWNERS file."
---

# 03 — Sensitive Paths

> Per H13, certain file paths require human senior dev review regardless of automated findings. Auto-detected via CODEOWNERS file.

---

## What counts as a sensitive path

Files that, if broken, have:
- Direct financial impact (payments, checkout)
- Customer data exposure risk (PII, auth)
- Security implications (authentication, authorization)
- Compliance implications (GDPR, PCI, accessibility regulations)

These are higher-stakes than general code. Need human senior eyes.

---

## Sensitive paths by platform

### Shopify

```
checkout.liquid           → checkout customization (Shopify Plus only)
sections/aurora-cart-*    → cart logic
sections/aurora-checkout-*→ checkout customization
snippets/*payment*        → payment-related code
snippets/*cart*           → cart logic
snippets/*price*          → price calculations
assets/*cart*.js          → cart JS logic
assets/*checkout*.js      → checkout JS
templates/customers/*     → customer account templates
config/settings_schema.json → theme settings (limited risk but global impact)
```

### WordPress

```
wp-content/themes/*/woocommerce/   → WooCommerce template overrides
wp-content/plugins/*/             → plugin code (if custom plugin)
wp-content/themes/*/functions.php → theme functions
wp-config.php                     → core config (should never be in repo)
*payment*                         → any file with "payment" in name
*checkout*                        → any file with "checkout" in name
*user*                            → customer/user related
*login*                           → authentication
```

### Magento

```
app/code/*/etc/di.xml             → dependency injection
app/code/*/etc/events.xml         → event subscribers
app/code/*/Controller/*           → controllers (route handlers)
app/code/*/Plugin/*               → plugins (interceptors)
app/code/*/Setup/*                → schema and data setup
app/code/*/Block/Customer/*       → customer block
app/code/*/Block/Checkout/*       → checkout block
app/code/*/Model/Customer/*       → customer model
app/code/*/Model/Order/*          → order model
```

### BigCommerce

```
templates/components/checkout/*   → checkout templates
templates/components/cart/*       → cart templates
assets/js/cart.js                → cart JS
assets/js/checkout.js            → checkout JS
config.json                      → store config
schema.json                      → schema definitions
```

### Node.js / Headless

```
/auth/*                          → authentication
/api/checkout/*                  → checkout endpoints
/api/payment/*                   → payment endpoints
/api/customer/*                  → customer endpoints
/api/user/*                      → user endpoints
middleware/auth.*                → auth middleware
.env*                            → environment config (should NEVER be in repo)
config/*                         → configuration files
prisma/*                         → database schema (if applicable)
db/migrations/*                  → DB migrations
```

---

## CODEOWNERS file enforcement

GitHub's CODEOWNERS file makes this enforcement automatic.

Located at: `.github/CODEOWNERS` (or `CODEOWNERS` in repo root)

```
# CODEOWNERS for [Project Name]

# Default - any senior dev can approve
* @your-senior-dev-1 @your-senior-dev-2

# Sensitive paths require specific senior approval

# Shopify checkout
/checkout.liquid                                @your-senior-dev-2 @your-tech-lead
/sections/*cart*                                @your-senior-dev-2 @your-tech-lead
/sections/*checkout*                            @your-senior-dev-2 @your-tech-lead
/snippets/*payment*                             @your-senior-dev-2 @your-tech-lead
/snippets/*cart*                                @your-senior-dev-2 @your-tech-lead
/snippets/*price*                               @your-senior-dev-2 @your-tech-lead
/assets/*cart*.js                               @your-senior-dev-2 @your-tech-lead
/assets/*checkout*.js                           @your-senior-dev-2 @your-tech-lead
/templates/customers/                           @your-senior-dev-2 @your-tech-lead

# Anything involving payments
**/*payment*                                    @your-senior-dev-2 @your-tech-lead
**/*Payment*                                    @your-senior-dev-2 @your-tech-lead

# Security-sensitive
**/*auth*                                       @your-senior-dev-2 @your-tech-lead
**/*login*                                      @your-senior-dev-2 @your-tech-lead

# Configuration
/config/                                        @your-tech-lead
/.env*                                          @your-tech-lead
```

When a PR touches a path matching CODEOWNERS rule, GitHub requires reviewers from the specified team/individuals. Branch protection rules enforce this — PR cannot merge without their approval.

---

## How Code Review Agent uses CODEOWNERS

When reviewing a PR:

```
1. Read .github/CODEOWNERS (active project's repo)
2. For each file changed in PR:
   - Check if path matches any CODEOWNERS rule
   - If yes, mark as "requires senior review"
3. Post comment noting sensitive paths:
   "This PR touches sensitive paths (checkout, payment). Senior dev review required per CODEOWNERS:
   - sections/aurora-cart-drawer.liquid
   - snippets/aurora-price.liquid"
4. PR cannot merge until specified senior approves (enforced by GitHub branch protection)
```

Code Review Agent does NOT bypass CODEOWNERS — it complements it. The agent's automated review + the human senior's review are both required.

---

## Additional considerations for sensitive paths

### Extra scrutiny in Code Review Agent

When reviewing sensitive paths, Code Review Agent applies extra checks:

1. **Authentication flow integrity:** Are auth checks in place where expected?
2. **Authorization boundaries:** Does the code respect role/permission boundaries?
3. **Sensitive data handling:** Is PII handled appropriately (not logged, not exposed in URLs)?
4. **Payment flow correctness:** Does the code maintain payment flow security?
5. **CSRF protection:** Are forms CSRF-protected per platform convention?
6. **Rate limiting:** Are endpoints that could be abused rate-limited?

If any of these raise concerns, severity is at least P2.

### Examples of sensitive-path-specific issues

#### Shopify checkout customization
- Bypassing built-in Shopify checkout validations → P1
- Inline JS in checkout.liquid → P1 (CSP violation in checkout)
- Logging customer PII to console → P2

#### Cart logic
- Direct DOM manipulation bypassing Section Rendering API → P2
- Race condition in add-to-cart → P2
- Cart state stored insecurely (localStorage with PII) → P2

#### Auth code
- Password handling in plaintext → P1
- Session token exposed in URL → P1
- Missing CSRF tokens on auth forms → P1

#### Payment code
- Hardcoded API keys → P1 (already P1 by credential exposure rule)
- Disabled payment validation → P1
- Card data touching server inappropriately (PCI scope expansion) → P1

---

## Documentation in handoff

Master doc (per `_spine/pm-agent/knowledge/09-master-doc-template.md`) includes a section on sensitive paths so future devs know.

Example:
```markdown
## Sensitive Path Locations

The following files require senior dev review per CODEOWNERS:
- sections/aurora-cart-drawer.liquid — cart logic
- snippets/aurora-price.liquid — price calculations
- assets/aurora-cart.js — cart AJAX

When modifying these:
- Senior dev review required (enforced by branch protection)
- Code Review Agent applies extra scrutiny
- Manual testing required pre-merge (not just automated tests)
```

---

## When CODEOWNERS doesn't catch something

The CODEOWNERS file is a starting point. Some files may not match patterns. Code Review Agent should also detect sensitive paths semantically:

- File content references payment processing → flag for senior review even if path doesn't match
- File content references customer auth → flag
- File modifies admin permissions → flag
- File touches database schema → flag

Use judgment beyond just pattern matching.

---

## Anti-patterns

1. **CODEOWNERS not maintained.** Stale CODEOWNERS = bypassed reviews. Update as project evolves.

2. **Single senior owner.** If only one person can approve, they become a bottleneck. Always 2+.

3. **Overly broad CODEOWNERS rules.** `*` requiring senior review = senior reviews every PR = burnout. Be specific.

4. **Skipping senior review for "small" changes.** Even a 1-line change to checkout can break payments. Senior review applies to sensitive paths regardless of size.

5. **Code Review Agent silently approves sensitive paths.** Agent should explicitly note "senior review required" and reference CODEOWNERS.

6. **No documentation of which paths are sensitive.** Devs find out by failing to merge. Document in repo README.

---

Last reviewed: 2026-05-24 by Claude (initial)
Next review due: 2026-08-24
