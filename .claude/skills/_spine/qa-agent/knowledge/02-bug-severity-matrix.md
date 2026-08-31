---
tier: 2
load_when: ["agent-specific-detail"]
description: "P1-P4 classification. NO time SLAs during development (per B10). SLAs apply during warranty period (per J8)."
---

# 02 — Bug Severity Matrix

> P1-P4 classification. NO time SLAs during development (per B10). SLAs apply during warranty period (per J8).

---

## Severity definitions

### P1 — Critical (showstopper)

**Definition:** Site is broken in a way that prevents core business function.

**Examples:**
- Site unreachable (500 error, DNS issue, hosting down)
- Checkout completely broken (no transactions can complete)
- Cart unable to add products
- Payment integration failing
- Customer data exposed (PII leak, security vulnerability)
- Login broken for all users
- Critical SEO issue (entire site noindexed accidentally, all canonicals broken)
- Search broken (zero results returned)
- Cart loses contents between pages
- Database errors causing page failures

**During development:**
- Sprint cannot pass G4 with open P1
- Milestone cannot pass G5 with open P1
- Launch cannot proceed with open P1
- Triggers immediate dev escalation

**During warranty period (per J8 SLA):**
- Response: 4 business hours

---

### P2 — Major (significant impact, workaround exists)

**Definition:** Major feature is broken or significantly degraded, but a workaround exists.

**Examples:**
- One payment method broken (others work)
- Variant picker broken on one product type (most work)
- Filter broken on collection pages (sort still works)
- Newsletter signup fails silently (other forms work)
- Mobile menu broken (desktop nav works)
- Specific cross-browser bug breaking a major feature on Safari (Chrome works)
- Customer account features partially broken
- Important page slow (LCP > 4s on a key page)
- Important schema markup missing
- Important integration not sending events (e.g., GA4 not tracking purchases)

**During development:**
- Sprint cannot pass G4 with open P2
- Milestone cannot pass G5 with open P2
- Launch cannot proceed with open P2

**During warranty period (per J8 SLA):**
- Response: 1 business day

---

### P3 — Minor (small impact, edge case)

**Definition:** Minor functional issue, affects edge cases or small subset of users, doesn't prevent core flows.

**Examples:**
- Visual glitch on hover state in a non-critical section
- Tooltip cut off on one specific browser
- Edge case in form validation (rare input combination)
- Slow load on a non-critical page (about page LCP > 3s but homepage fine)
- Minor accessibility issue not blocking flow (e.g., decorative element missing label)
- Search results pagination minor bug
- Cosmetic issue affecting a small section
- One missing alt text on a decorative image

**During development:**
- Sprint can pass G4 with documented P3 (PASS_WITH_FLAGS)
- Milestone can pass G5 with documented P3 (with mitigation plan)
- Should be fixed before final launch if possible
- Documented if deferred

**During warranty period (per J8 SLA):**
- Response: 3 business days

---

### P4 — Cosmetic / Polish

**Definition:** Visual polish issues, minor copy issues, very edge-case behaviors.

**Examples:**
- 1-2 pixel spacing inconsistency
- Slight color variation between browsers (within tolerance)
- Minor copy typo
- Animation timing slightly off
- Icon alignment 1px off
- Font weight slightly different than intended
- Footer divider color slightly off
- Hover state animation could be smoother

**During development:**
- Sprint passes with P4 documented
- Milestone passes with P4 documented
- May be deferred to post-launch polish phase
- May be marked "wontfix" if not worth time

**During warranty period (per J8 SLA):**
- Response: Best effort (no commitment)
- Often batched for post-warranty polish work

---

## Classification decision tree

```
Is the site reachable and functional for ALL users?
├── No → P1
└── Yes
    │
    Does this break a major feature with no workaround?
    ├── Yes → P1
    └── No
        │
        Does this break a major feature WITH workaround?
        ├── Yes → P2
        └── No
            │
            Does this affect a noticeable subset of users / edge case?
            ├── Yes → P3
            └── No
                │
                Is this visual polish / minor copy?
                └── Yes → P4
```

---

## How to NOT misclassify

### Avoid "P2 just to be safe"
P2 blocks sprint pass. Don't call something P2 unless it genuinely blocks. Otherwise sprints take longer than they should.

### Avoid "P3 to defer"
Don't downgrade P2 to P3 just to ship faster. If checkout works on iOS but breaks on Android, that's P1 (Android users can't purchase) regardless of "iOS workaround exists for iOS users."

### Avoid "P4 wontfix" for things that matter
If a 4px spacing issue is in the hero of the homepage, it's not P4. It's a P3 visible to every user.

### Consider impact, not effort
A 5-second fix that affects nobody = P4.
A 5-second fix that affects every user = P3 minimum.
Severity is about USER IMPACT, not about how easy/hard to fix.

---

## Severity examples per bug type

### Performance issues
- Homepage LCP > 5s: **P2** (major user impact)
- Homepage LCP > 3s but < 4s: **P3** (below target, not critical)
- Specific page LCP > 4s: **P3** (page-specific issue)
- Lighthouse Performance drops from 85 to 75 with no functional break: **P3**
- Specific bundle 50KB over budget but page still loads fine: **P4**

### Accessibility issues
- axe violation breaking a critical flow: **P2**
- axe violation that doesn't break flow: **P3** (but must fix for WCAG compliance)
- Color contrast 4.3:1 (just below 4.5:1 threshold): **P3**
- Missing alt text on critical image: **P2** (screen reader users miss content)
- Missing alt text on decorative image (should be empty alt): **P3**
- Focus ring slightly less visible than ideal: **P4**

### SEO issues
- Entire site noindexed: **P1**
- Specific section missing canonical tag: **P3**
- Schema markup has minor error (rich result still shows): **P3**
- Schema markup completely broken: **P2**
- Sitemap has minor formatting issue: **P3**
- Sitemap missing entirely: **P2**
- Meta description slightly long (165 chars vs 160 target): **P4**

### Cross-browser issues
- Cart broken on Safari: **P1** (major mobile/Mac user base)
- Cart broken on IE11 (no longer supported): **N/A** (not in support matrix)
- Layout 2px off on Firefox: **P4**
- Animation choppy on Safari but functional: **P3**
- One Safari-specific JS error breaking variant picker: **P2**

### Visual issues
- Hero image not loading on homepage: **P1**
- Hero image wrong aspect ratio on mobile: **P2**
- Section padding inconsistent across page: **P3**
- One icon 1px misaligned: **P4**

---

## Bug entry format

In `project.json.bugs[]`:

```json
{
  "id": "BUG-014",
  "severity": "P3",
  "title": "Cart drawer animation jumps on Safari iOS 17",
  "description": "When opening cart drawer with multiple items, animation skips first 100ms, appearing to 'jump' into open state. Other browsers smooth.",
  "steps_to_reproduce": [
    "Open Safari iOS 17 on iPhone 13+",
    "Add 3+ products to cart",
    "Tap cart icon",
    "Observe drawer slide-in animation"
  ],
  "expected": "Drawer slides in smoothly over 250ms (matches Chrome behavior)",
  "actual": "Drawer appears to jump from closed to partially-open, then animates final 50% smoothly",
  "found_in_sprint": "S2.4",
  "found_at": "2026-05-30T14:32:00Z",
  "found_by": "qa-agent v1.0",
  "assigned_to": null,
  "status": "open",
  "evidence_path": "qa-reports/evidence/BUG-014-cart-safari.mp4",
  "browser": "Safari iOS 17.4",
  "device": "iPhone 14 Pro",
  "url": "/cart-test",
  "resolved_at": null
}
```

---

## Bug spreadsheet export

QA Agent generates `qa-reports/bugs.csv` with all bug entries flattened to spreadsheet rows. Per B11, team can review manually in spreadsheet format.

Columns:
- ID, Severity, Title, Description, Steps to Reproduce, Expected, Actual, Found in Sprint, Found At, Found By, Assigned To, Status, Evidence Path, Browser, Device, URL, Resolved At

CSV auto-regenerates whenever bugs[] changes in project.json.

---

## Anti-patterns

1. **Downgrading severity to ship.** P2 doesn't become P3 because the deadline is tight. Severity reflects user impact, not project pressure.

2. **Upgrading severity to get attention.** P4 polish is not P2. Don't over-classify.

3. **Vague bug reports.** "Cart is buggy" is not a bug report. Specific repro steps required.

4. **No evidence.** Every bug needs a screenshot, video, or specific log. Otherwise it's a complaint, not a bug.

5. **"Cannot reproduce" without trying multiple browsers/devices.** If a tester can repro on Safari iOS 17 and dev can't repro on Chrome desktop, that's not "cannot reproduce" — that's a Safari-specific bug.

6. **Closing bugs as "wontfix" without justification.** Every wontfix needs a reason logged + senior dev sign-off.

---

Last reviewed: 2026-05-24 by Claude (initial)
Next review due: 2026-08-24
