---
tier: 2
load_when: ["agent-specific-detail"]
description: "P1-P4 specific to code review findings. Distinct from QA Agent's bug severity (which is post-build user-facing). Code review severity is about code-level issues caught pre-merge."
---

# 02 — Severity Classification for Code Review

> P1-P4 specific to code review findings. Distinct from QA Agent's bug severity (which is post-build user-facing). Code review severity is about code-level issues caught pre-merge.

---

## Code review severity definitions

### P1 — Critical (auto-block merge, immediate fix required)

Code that WILL break in production OR poses immediate risk.

**Examples:**
- Hallucinated API call that will throw runtime error
- Exposed credential in code (API key, password, token)
- `eval()` or `Function()` with user-controlled input
- SQL injection vector (unprepared queries)
- XSS vector (innerHTML with user data, dangerouslySetInnerHTML without sanitization)
- Code that bypasses authentication
- Code that exposes PII
- Severe race condition or data loss vector
- Deployment configuration that would break production

**Action:** PR cannot merge. Code Review Agent sets status check FAIL. Comment flagged URGENT.

---

### P2 — Major (auto-block merge, fix required)

Significant code quality, security, or compliance issues.

**Examples:**
- Forbidden pattern violation (from platform's `forbidden.md`)
- Render-blocking script added to critical path
- Missing alt text on meaningful images
- `<div onClick>` instead of `<button>` (accessibility)
- Missing meta tags on new page template
- Missing schema markup where required (Product, Article)
- LCP image with `loading="lazy"` (delays critical render)
- Hardcoded values that should be tokens (colors, spacing — breaks design system)
- Insecure protocol (HTTP where HTTPS available)
- `target="_blank"` without `rel="noopener noreferrer"`
- Significant Lighthouse performance regression predicted (>10 points)
- Redirect chain created (per I17)

**Action:** PR cannot merge. Code Review Agent sets status check FAIL. Specific fix recommended in comment.

---

### P3 — Minor (warn but allow merge)

Best practice violations or optimization opportunities that don't break anything.

**Examples:**
- Missing `width`/`height` on images (CLS risk but minor)
- Below-fold image without `loading="lazy"`
- Heading hierarchy minor issue (skipped level)
- Missing OG / Twitter Card meta tags
- Redundant ARIA (e.g., `role="button"` on `<button>`)
- Non-optimal animation (layout vs transform)
- New dependency > 50KB (worth justifying)
- URL with underscores instead of hyphens
- Heavy synchronous JavaScript block
- Console.log or debug code left in
- TODO comments without context or assignee

**Action:** PR can merge. Code Review Agent flags but allows. Worth addressing soon.

---

### P4 — Info / Polish (no merge impact)

Style preferences, polish suggestions, or "could be better" observations.

**Examples:**
- Variable naming could be clearer
- Comment could be more descriptive
- Code could be DRYer (small duplication)
- Function could be split for readability
- Inconsistent spacing (linter usually catches)
- Slight code style variation
- Opportunity for documentation
- Test coverage could be expanded

**Action:** PR can merge freely. Code Review Agent notes for dev's consideration.

---

## Classification decision tree

```
Is this code WILL fail at runtime OR pose immediate security risk?
├── Yes → P1
└── No
    │
    Does this violate forbidden.md, fail accessibility, hurt performance significantly,
    OR break SEO compliance materially?
    ├── Yes → P2
    └── No
        │
        Does this miss a best practice or could be optimized?
        ├── Yes → P3
        └── No
            │
            Is this a style preference or polish opportunity?
            ├── Yes → P4
            └── No → don't flag (move on)
```

---

## Common severity mistakes (don't do these)

### Mistake 1: P1 for everything that looks bad
- "This code is messy" → P4 at most
- "I don't like this naming" → P4
- "This could be refactored" → P4

P1 is reserved for production-breaking or security-critical. Don't inflate.

### Mistake 2: P3 for actual P2 issues
- Missing alt text → P2 (not P3) for accessibility
- Forbidden pattern → P2 (it's in forbidden.md for a reason)
- Missing schema on PDP → P2 (SEO impact)

When forbidden.md or accessibility is involved, lean P2.

### Mistake 3: P4 for issues that affect users
- A small visual inconsistency that users see → P3, not P4
- A minor accessibility issue → P3, not P4
- Anything user-visible has at least P3 floor

### Mistake 4: Same severity for different impact
- One hallucinated API call → P1 (will crash)
- One unused variable → P4
- These are not equivalent. Severity reflects impact.

---

## Severity in PR comments

Each issue is tagged with severity:

```
**[P1] Hallucinated API call** — sections/aurora-cart.liquid:23
The code calls `cart.add_with_validation()` which is not a real Shopify Liquid filter.
This will throw a runtime error when the cart is accessed.

Suggestion: Use `cart.add({{ product_id }}, {{ quantity }})` from the Cart API.

**[P2] Inline script in section** — sections/aurora-hero.liquid:47
Project's forbidden.md (rule #3) prohibits inline `<script>` blocks.
Found: `<script>analytics.track('hero_view')</script>`

Suggestion: Move to `assets/aurora-analytics.js` and load via `<script src defer>` in head.

**[P3] Below-fold image with loading="eager"** — sections/aurora-product-grid.liquid:89
The product images are below the fold and load eagerly.
This wastes bandwidth on initial load.

Suggestion: Add `loading="lazy"` to these images.

**[P4] Variable name unclear** — sections/aurora-product-grid.liquid:104
The variable `x` is used for what appears to be a product index. Consider renaming for clarity.

Suggestion: Rename `x` to `product_index` or similar.
```

---

## Severity blocking behavior

Per PR check:

```
Total issues:
- P1: [count]
- P2: [count]
- P3: [count]
- P4: [count]

Block merge: [yes if P1 > 0 OR P2 > 0, no otherwise]
PR status: PASS | PASS_WITH_FLAGS | FAIL
```

```
P1 + P2 = 0  → PASS  → merge allowed
P1 + P2 = 0, but P3 or P4 present  → PASS_WITH_FLAGS  → merge allowed with notes
P2 ≥ 1, P1 = 0  → FAIL  → merge blocked
P1 ≥ 1  → FAIL (URGENT)  → merge blocked
```

---

## Severity vs. QA Agent bug severity

These are DIFFERENT severity scales:

| | Code Review Agent | QA Agent |
|--|-------------------|----------|
| Stage | Pre-merge (code level) | Post-build (user-facing) |
| Scope | Code quality, patterns, future risk | Functional, performance, UX |
| P1 | Will fail at runtime / security | Site down, checkout broken |
| P2 | Forbidden / a11y / perf regression | Feature broken with workaround |
| P3 | Best practice miss | Minor functional bug |
| P4 | Style / polish | Cosmetic |

Code Review Agent P2 (e.g., missing alt text) is something QA Agent might catch later as P2 also (alt text missing in production). The classification is per-context but often aligned.

---

## Anti-patterns

1. **Pad severity for attention.** "I really want them to fix this." Use specific recommendation instead.

2. **Underclassify to ship faster.** Don't make a P2 a P3 because deadline is tight.

3. **Same severity for all issues in a PR.** "All P2" — review each on its own merits.

4. **No severity at all.** Every flag needs severity. Otherwise dev doesn't know priority.

5. **Block PR on P3/P4.** Only P1 and P2 block. P3/P4 are advisory.

---

Last reviewed: 2026-05-24 by Claude (initial)
Next review due: 2026-08-24
