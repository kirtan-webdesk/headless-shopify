---
template_type: bug-report
applies_to: [all]
last_reviewed: 2026-06-03
---
# Bug Report Template

> Standardized format for every bug. Stored in `project.json.bugs[]` (structured) and exported to `qa-reports/bugs.csv` (spreadsheet) per B11.

---

## Bug entry structure (JSON)

```json
{
  "id": "BUG-014",
  "severity": "P3",
  "title": "Brief title — what is broken",
  "description": "Detailed explanation of the issue",
  "expected": "What should happen",
  "actual": "What actually happens",
  "steps_to_reproduce": [
    "Step 1",
    "Step 2",
    "Step 3"
  ],
  "category": "functional" | "responsive" | "cross-browser" | "accessibility" | "performance" | "seo" | "security" | "visual",
  "module_caught_in": 1-8,
  "found_in_sprint": "S2.4",
  "found_in_milestone": "M2",
  "found_at": "2026-05-30T14:32:00Z",
  "found_by": "qa-agent v1.0",
  "found_via": "playwright" | "claude-in-chrome" | "lighthouse" | "axe" | "manual",
  "assigned_to": null,
  "assigned_at": null,
  "status": "open" | "in-progress" | "fixed" | "verified" | "wontfix" | "duplicate",
  "evidence_path": "qa-reports/evidence/BUG-014-screenshot.png",
  "evidence_type": "screenshot" | "video" | "console-log" | "network-log",
  "environment": {
    "browser": "Safari iOS 17.4",
    "device": "iPhone 14 Pro",
    "viewport": "390x844",
    "url": "/products/aurora-cleanser",
    "user_agent": "Mozilla/5.0..."
  },
  "regression": false,
  "introduced_in_sprint": null,
  "root_cause": null,
  "fix_pr": null,
  "fix_commit": null,
  "verified_by": null,
  "verified_at": null,
  "resolved_at": null,
  "resolution_notes": null,
  "warranty_eligible": true
}
```

---

## Bug ID convention

Format: `BUG-[3-digit incrementing number]`

Examples: `BUG-001`, `BUG-002`, ... `BUG-014`, ... `BUG-127`

ID is assigned at creation, never reused, never deleted (even if bug is dismissed).

---

## Required fields

These fields MUST be populated when bug is created:

```
[X] id
[X] severity
[X] title (concise, < 80 chars)
[X] description
[X] expected
[X] actual
[X] steps_to_reproduce (at least 2 steps)
[X] category
[X] module_caught_in (which of the 8 QA modules)
[X] found_in_sprint
[X] found_at
[X] found_by
[X] found_via
[X] environment (browser, device, viewport, URL)
[X] evidence_path (screenshot or video)
[X] status (default: "open")
```

Optional fields filled in as bug progresses:
- assigned_to, assigned_at
- regression analysis (introduced_in_sprint, root_cause)
- fix_pr, fix_commit
- verified_by, verified_at, resolved_at, resolution_notes

---

## Title conventions

Good titles:
- "Cart drawer animation skips first 100ms on Safari iOS 17"
- "Hero CTA button color contrast 2.8:1 on mobile (fails AA)"
- "Lighthouse Performance regresses from 87 to 78 on homepage"
- "Search filter pagination breaks on Firefox at 414px"

Bad titles:
- "Cart broken" (too vague)
- "Bug" (useless)
- "Doesn't work on mobile" (too vague, what doesn't work?)
- "Issue with the thing" (totally vague)

Title should be specific enough that someone can identify the bug without reading the description.

---

## Description conventions

Description elaborates on the title with full context:
- What's happening
- When it happens (timing, conditions)
- What's affected (which users, which scenarios)
- Why this matters (impact)
- Any context about the area of code involved

Example:
```
Description: On Safari iOS 17 (verified on iPhone 14 Pro and iPhone 15),
when the user adds 3 or more items to cart and opens the cart drawer,
the slide-in animation has a visual artifact: the first ~100ms of the
animation is skipped, making the drawer appear to "jump" from closed to
about 30% open, then animate smoothly the remaining 70%.

This affects: ~25% of users (Safari iOS users with multi-item carts)
Impact: Visual jarring, but doesn't block functionality. Drawer still
works.
Suspected cause: CSS transition timing function inconsistency between
WebKit and other browsers, possibly aggravated by transform-origin.
```

---

## Steps to reproduce

Numbered steps, specific enough to follow exactly:

```json
"steps_to_reproduce": [
  "Open Safari on iPhone (verified iOS 17.4 on iPhone 14 Pro)",
  "Navigate to https://aurora-preview.myshopify.com",
  "Add product 'Aurora Cleanser' (size 100ml) to cart",
  "Add product 'Aurora Serum' (size 30ml) to cart",
  "Add product 'Aurora Moisturizer' (size 50ml) to cart",
  "Tap the cart icon in the top-right of the header",
  "Observe the cart drawer slide-in animation"
]
```

Avoid:
- "Add some products and open the cart" (which products? how many?)
- "It happens sometimes" (when? what triggers it?)

---

## Expected vs actual

```json
"expected": "Drawer slides smoothly from right edge of viewport to fully open over ~250ms, with constant easing (ease-out cubic-bezier). Animation should match the behavior verified on Chrome mobile.",

"actual": "Drawer appears to skip the first ~30% of its slide-in motion. It pops in already partially open, then smoothly animates the remaining 70% of the slide over ~175ms. Net effect is a visual 'jump' at the start of the animation."
```

Both fields should be specific. Don't say "it's wrong" — say what specifically differs from expected.

---

## Severity assignment

Per `02-bug-severity-matrix.md`. Quick reference:

- **P1:** Site broken for all users / data loss / security
- **P2:** Major feature broken with workaround
- **P3:** Minor functional issue / edge case
- **P4:** Visual polish / minor copy

Don't pad severity to get attention. Don't downgrade severity to ship faster.

---

## Evidence requirements

Every bug requires evidence:

| Bug type | Required evidence |
|----------|-------------------|
| Functional | Video of repro OR screenshot + console log |
| Visual | Screenshot showing the issue + comparison to expected |
| Performance | Lighthouse report + diff vs. previous |
| Accessibility | axe report + screenshot if visible |
| Responsive | Screenshots at multiple breakpoints |
| Cross-browser | Screenshots from affected + working browsers |
| SEO | Tool output (e.g., schema validator error) + screenshot |
| Security | Tool output (npm audit, Snyk) + affected code reference |

Evidence stored in `qa-reports/evidence/[BUG-id]-[description].[ext]`.

Without evidence, bug cannot be triaged. Reject the bug entry.

---

## Category classification

Map bug to ONE primary category:

- **functional:** something doesn't work as specified
- **responsive:** layout/UX issue at specific breakpoint
- **cross-browser:** works in one browser, not another
- **accessibility:** WCAG violation or accessibility issue
- **performance:** speed / Core Web Vitals issue
- **seo:** schema, meta, sitemap, etc.
- **security:** vulnerability, exposed credential, security header
- **visual:** spacing, color, alignment polish issues

If a bug spans categories (e.g., a CSS issue is both responsive AND visual), pick the most impactful one.

---

## Regression detection

When a new bug is identified in milestone QA that wasn't present in previous milestone:

```json
"regression": true,
"introduced_in_sprint": "S3.2",
"root_cause": "JS variable rename in cart.js conflicts with hero.js — both used the same name in global scope"
```

Regressions are tracked separately for Monthly System Retro (K5).

---

## Status lifecycle

```
open      → Bug filed, not yet assigned
in-progress → Dev working on fix
fixed      → Dev says fix is ready, awaiting QA verification
verified   → QA verified fix works + no regression
wontfix    → Decision made not to fix (requires senior approval + reason in resolution_notes)
duplicate  → Same as existing bug (link in resolution_notes)
```

Bugs in `wontfix` status MUST have:
- Senior dev approval logged
- Justification in `resolution_notes`
- Communicated to client (if warranty-eligible)

---

## Warranty eligibility

`warranty_eligible: true | false`

True (default):
- Bugs found pre-launch that are deferred
- Bugs introduced by agency work

False:
- Bugs caused by client edits post-launch
- Bugs in third-party tools we don't control
- Bugs in functionality explicitly out-of-scope

Important for warranty SLA application (J8). False = client may need to pay for fixes.

---

## Spreadsheet export

CSV columns (per B11 — team verifies in spreadsheet):

```
ID,Severity,Title,Category,Module,Sprint,Found At,Found By,Found Via,Status,Browser,Device,Viewport,URL,Evidence Path,Regression,Resolved At,Notes
BUG-001,P3,"Cart drawer animation skips on Safari iOS",functional,2,S2.4,2026-05-30,qa-agent,playwright,open,Safari iOS 17,iPhone 14 Pro,390x844,/products/aurora-cleanser,qa-reports/evidence/BUG-001.mp4,false,,
BUG-002,...
```

Auto-regenerated whenever `project.json.bugs[]` changes.

---

## Anti-patterns

1. **Vague titles.** "Bug in cart" tells you nothing. Be specific.

2. **No steps to reproduce.** If dev can't reproduce, they can't fix.

3. **No evidence.** Reject the bug. Evidence is mandatory.

4. **Severity inflation.** Calling P3 a P1 to get attention erodes trust in severity classification.

5. **Severity deflation.** Calling P2 a P3 to ship faster causes regressions and tech debt.

6. **No environment data.** Browser/device/viewport matter. Without them, can't reproduce.

7. **Multiple unrelated bugs in one entry.** One bug per entry. Split if you found multiple issues.

8. **Closing bugs without verification.** Dev says "fixed" — QA verifies. Then closes.

---

Last reviewed: 2026-05-24 by Claude (initial)
Next review due: 2026-08-24
