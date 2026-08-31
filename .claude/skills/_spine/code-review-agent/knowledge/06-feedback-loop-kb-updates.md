---
tier: 2
load_when: ["agent-specific-detail"]
description: "Per H14 — when Code Review Agent catches a recurring AI mistake, the fix becomes an entry in the platform's `forbidden.md`. System gets smarter from real failures."
---

# 06 — Feedback Loop to KB Updates

> Per H14 — when Code Review Agent catches a recurring AI mistake, the fix becomes an entry in the platform's `forbidden.md`. System gets smarter from real failures.

---

## Why this exists

AI agents make the same mistakes repeatedly unless we update their knowledge base. Without a feedback loop, every project has to re-discover the same patterns.

Code Review Agent catches AI mistakes. The valuable ones become permanent rules in `forbidden.md` so AI agents stop making them.

This is what turns a one-time fix into a system-wide improvement.

---

## What qualifies as a KB-worthy finding

Not every code review finding becomes a KB entry. Criteria for inclusion:

### Must qualify (high signal)

- **Recurring:** Same pattern caught 3+ times across PRs or projects
- **AI-generated:** The issue came from AI agent output (not human error)
- **Catchable by rule:** The issue can be expressed as a clear "never do X" rule
- **Generalizable:** The rule applies broadly, not just to this specific project

### Doesn't qualify

- One-off bugs from human edge cases
- Project-specific quirks that don't generalize
- Style preferences (use linters for these)
- Issues that are already in linters (don't duplicate)
- Subjective judgment calls (depends on context)

---

## The feedback loop process

```
1. Code Review Agent catches an issue in a PR
2. Agent flags: "Is this recurring?" by checking history
3. If recurring: agent adds entry to /projects/[client]/qa-reports/code-reviews/kb-update-candidates.md
4. KB owner (per platform, per E5) reviews candidates monthly
5. For each candidate:
   - Approve → add to platform's forbidden.md
   - Reject → discard (with reason logged)
6. Updated forbidden.md propagates:
   - Code Review Agent reads new forbidden.md on next PR review
   - Other AI agents (Frontend, Backend) also read forbidden.md
   - System now prevents the same mistake
```

---

## Detecting recurring patterns

Code Review Agent tracks findings:

```json
// In a central location (or per-platform aggregation)
"code_review_finding_history": [
  {
    "pattern_signature": "below-fold-image-eager-loading",
    "first_seen": "2026-04-12",
    "last_seen": "2026-05-30",
    "occurrence_count": 7,
    "projects_affected": ["aurora-skincare", "bakery-co", "tech-startup-x"],
    "agents_responsible": ["frontend-agent-shopify"],
    "current_in_forbidden_md": false,
    "candidate_for_kb": true
  }
]
```

When a new finding matches an existing signature, increment count. When count ≥ 3, mark as KB candidate.

### Pattern signature generation

Each finding has a stable signature:

```python
def generate_signature(finding):
    return hashlib.md5(
        f"{finding['category']}-{finding['issue']}-{finding['platform']}"
        .encode()
    ).hexdigest()[:16]
```

Examples:
- `below-fold-image-eager-loading` — image below fold with `loading="eager"`
- `inline-script-in-section` — inline script in Shopify section
- `hardcoded-product-handle` — hardcoded product handle string
- `wp-direct-query-no-prepare` — `$wpdb->query()` without prepare
- `missing-cart-section-rendering-api` — direct DOM manipulation of cart

The signature should be specific enough to identify the exact pattern but general enough to match across projects.

---

## KB update candidate format

`/projects/[client]/qa-reports/code-reviews/kb-update-candidates.md`:

```markdown
# KB Update Candidates — [Client] / [Platform]

> Patterns Code Review Agent has caught multiple times. Review for inclusion in [platform]/knowledge/09-forbidden.md.

---

## Candidate: below-fold-image-eager-loading

**Platform:** Shopify
**First seen:** 2026-04-12 (PR #87)
**Last seen:** 2026-05-30 (PR #142)
**Occurrence count:** 7 (across 3 projects)
**Severity:** P3
**Status:** PROPOSED

### Pattern description
AI Frontend Agent generates Shopify section code with `<img loading="eager">` for images that are below the fold. This wastes initial bandwidth and hurts performance.

### Affected projects
- Aurora Skincare (3 occurrences)
- Bakery Co (2 occurrences)
- Tech Startup X (2 occurrences)

### Example occurrences

**PR #87 (Aurora Skincare):**
```liquid
{% comment %} Product grid below the fold {% endcomment %}
{% for product in collection.products limit: 12 %}
  <img src="{{ product.featured_image | image_url }}"
       loading="eager"  {# ← problem #}
       width="600" height="600"
       alt="{{ product.title }}">
{% endfor %}
```

**PR #112 (Bakery Co):**
[Similar pattern]

### Proposed `forbidden.md` entry

```markdown
### IMG-001: No eager loading below the fold

NEVER use `loading="eager"` on images that appear below the fold.

Below the fold = anything not visible in initial viewport on standard 1440×900 desktop or 375×667 mobile.

**Bad:**
```liquid
<img src="..." loading="eager">  {# below the fold #}
```

**Good:**
```liquid
<img src="..." loading="lazy">  {# below the fold #}
```

**Exception:** LCP image (typically hero) uses `loading="eager"` OR omits the attribute. Add `fetchpriority="high"` to LCP image specifically.

**Why:** Eager loading below-fold images wastes initial bandwidth and delays LCP for above-fold content. Lighthouse penalizes this.
```

### KB owner action
- [ ] Approve and add to forbidden.md
- [ ] Reject (with reason)
- [ ] Modify wording and approve

**Reviewed by:** _____________
**Decision:** _____________
**Date:** _____________

---

## Candidate: [next pattern]

[Same structure]

---
```

---

## Monthly KB review cycle (per K2 + K4)

Per quarter (or monthly if high volume), KB owner reviews candidates:

```
1. Read kb-update-candidates.md for owned platform
2. For each candidate:
   - Read example occurrences
   - Decide: approve / reject / modify
   - If approve:
     a. Add to /skills/[platform]/knowledge/09-forbidden.md
     b. Bump forbidden.md version
     c. Add to changelog
     d. Mark candidate "ACCEPTED" with date
   - If reject:
     - Mark candidate "REJECTED" with reason
     - Stop tracking this pattern
   - If modify:
     - Rewrite the proposed entry
     - Add modified version to forbidden.md
     - Mark candidate "ACCEPTED with modifications"
3. Commit changes to forbidden.md
4. Notify team of new rules (Slack announcement)
5. Update Code Review Agent's tracking (mark `current_in_forbidden_md: true`)
```

---

## How updates propagate

When `forbidden.md` is updated:

1. **Code Review Agent:** reads forbidden.md fresh on every PR review (no caching of forbidden.md specifically)
2. **Frontend Agent:** loads forbidden.md as part of its skill context (per `_spine/orchestrator/knowledge/06-agent-cascade.md`)
3. **Backend Agent:** same
4. **Other agents:** any agent that touches code reads forbidden.md

Within 24 hours of update, all agents are using the new rules.

---

## Tracking effectiveness

Metric: how often does Code Review Agent catch issues that are NOT in forbidden.md vs. that ARE in forbidden.md?

```
Healthy system:
- Old issues (in forbidden.md): rare, mostly when forbidden.md missed a nuance
- New issues (not yet in forbidden.md): captured, added to candidates

Concerning patterns:
- Same issue caught repeatedly in same project (forbidden.md not updated?)
- New AI agents making old mistakes (forbidden.md not loaded properly?)
- Forbidden.md entries ignored by agents (instructions not followed?)
```

Monthly system retro (K5) reviews these metrics.

---

## When to remove from forbidden.md

Rules can be removed too. When:
- Underlying platform deprecates the issue (e.g., HTTP/2 makes some perf rules less relevant)
- Better solution emerges (e.g., new Shopify feature replaces old pattern)
- Rule never seems to apply (low value)

Removal process:
1. KB owner identifies removal candidate
2. Discuss at monthly retro
3. Move entry to `/skills/[platform]/knowledge/deprecations.md` (with date deprecated + reason)
4. Bump forbidden.md version
5. Update changelog

---

## Edge cases

### Same pattern, different platforms
A pattern might exist on both Shopify and WordPress (e.g., "no inline scripts"). The rule is added to BOTH platforms' forbidden.md, with platform-specific examples.

### Project-specific rule
Sometimes a rule only applies to one project (e.g., "Aurora Skincare specifically forbids X for brand reasons"). In this case, the rule goes in the project's spec or a project-specific forbidden.md addendum — NOT in the platform's forbidden.md (which is shared across all projects on that platform).

### Conflicting rules
If a new rule would conflict with an existing one, KB owner discusses:
- Is the old rule still valid?
- Should the new rule be a clarification of the old?
- Or is one rule wrong?

Resolution documented in changelog.

---

## Quarterly health metrics

Track these for the KB feedback loop's health:

```
Quarter Q2 2026:
- New rules added: 8
- Rules deprecated: 1
- Rules modified: 3

Top recurring patterns caught:
1. below-fold-image-eager-loading (12 occurrences before adding rule)
2. inline-script-in-section (8 occurrences)
3. ...

Top new rules' effectiveness:
- "No eager loading below fold" → 90% reduction in occurrences after rule added
- "Section Rendering API for cart" → 75% reduction

Patterns that didn't qualify:
- 23 candidates rejected (project-specific or one-off)
```

This proves the feedback loop works.

---

## Anti-patterns

1. **Adding every pattern to forbidden.md.** Filter for the high-value ones. Otherwise forbidden.md becomes too long and AI ignores parts.

2. **No review cycle.** Candidates accumulate, never become rules. Feedback loop dies.

3. **No tracking of effectiveness.** Adding rules without measuring whether they reduce occurrences = unclear value.

4. **Adding project-specific rules to platform forbidden.md.** Pollutes the shared KB. Keep project-specific rules separate.

5. **Removing rules without recording.** Devs assume the old rule still applies. Always document removals.

6. **Owner not engaged.** KB owner must do quarterly reviews. Without it, KB rots (per E5/K2).

---

Last reviewed: 2026-05-24 by Claude (initial)
Next review due: 2026-08-24
