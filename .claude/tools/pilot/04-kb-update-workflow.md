---
tier: 3
load_when: ["human-reference-only"]
---

# 04 — KB Update Workflow

> How to turn pilot failures into KB improvements. The feedback loop that makes the system smarter over time.

---

## When to update KB

Three trigger types:

### Trigger 1: Recurring failure (3+ occurrences)
Per K4 — when Code Review Agent or pilot capture identifies the same failure 3+ times → KB candidate.

### Trigger 2: Single high-impact failure (P1)
A single failure that caused real damage warrants immediate KB update, even without recurrence.

### Trigger 3: Pilot retro identifies pattern
Post-pilot retro identifies patterns (per `05-post-pilot-retro-template.md`) → KB updates planned.

---

## The KB update process

```
1. Identify candidate (from capture or retro)
2. Determine which file(s) need updating
3. Draft the change
4. KB owner reviews
5. Apply update
6. Bump version + changelog
7. Communicate to team
8. Verify behavior improved on next project
```

---

## Step 1: Identify candidate

For each failure mode in the pilot capture, ask:

- Could a KB update have prevented this?
- If so, which KB file?
- What specifically should be added/changed?

If yes to first question: it's a candidate.

If no (e.g., it's a tooling bug, not a knowledge gap): not a KB candidate. Fix the tool instead.

---

## Step 2: Determine which file(s)

Map failure types to typical KB files:

| Failure type | Likely KB file |
|--------------|----------------|
| Hallucinated API call | `shopify/knowledge/09-forbidden.md` (add the specific bad pattern) |
| Forbidden pattern violated | `shopify/knowledge/09-forbidden.md` (strengthen wording or add example) |
| Naming inconsistency | `shopify/knowledge/02-naming-conventions.md` |
| Accessibility regression | `shopify/knowledge/03-accessibility.md` + `09-forbidden.md` |
| Performance regression | `shopify/knowledge/04-performance-budget.md` + `09-forbidden.md` |
| Wrong section pattern | `shopify/knowledge/06-section-patterns.md` |
| Cart/checkout issue | `shopify/knowledge/07-cart-and-checkout.md` |
| App integration problem | `shopify/knowledge/08-app-integrations/[app-name].md` |
| SEO regression | `shopify/knowledge/10-seo-baseline.md` |
| Web component issue | `shopify/knowledge/11-web-components.md` |
| Persona violation | `_spine/persona.md` (rare — persona changes infrequent) |
| Agent workflow issue | The specific agent's SKILL.md |
| Cross-agent issue | `_spine/orchestrator/knowledge/06-agent-cascade.md` |
| Tooling / CI issue | `tools/` (not KB) |
| Setup issue | `docs/user-guide/SETUP-INSTRUCTIONS.md` or `tools/docs/deployment-guide.md` |

---

## Step 3: Draft the change

### For forbidden.md additions (most common):

Add a new rule following the existing format:

```markdown
### XXX-NNN — [Brief rule name]
**Severity:** P1 / P2 / P3

**Bad:**
```code
[example of forbidden pattern, ideally from the actual failure]
```

**Good:**
```code
[example of correct pattern]
```

**Why:** [Why this matters — context the agent needs]

**Exception (if any):** [When this rule doesn't apply]
```

Where XXX = category prefix (LIQ, JS, PERF, A11Y, SEO, SEC, INT, TEAM) and NNN = next sequential number.

### For knowledge file additions:

Identify the right section. Add as new subsection or strengthen existing wording.

### For SKILL.md additions:

Usually add to "Critical rules" section or "Workflow at [stage]" section.

---

## Step 4: KB owner reviews

Per E5 — each platform arm + spine has a designated owner.

Owner reviews:
- Is the rule clearly worded?
- Does it have a specific example?
- Is the severity appropriate?
- Does it conflict with any existing rule?
- Is it generalizable (applies broadly) or project-specific (don't add to platform KB)?

Owner approves or requests changes.

---

## Step 5: Apply update

```bash
# In the central skills repo
cd ~/webdesk-skills
git checkout -b kb-update/post-pilot-aurora

# Edit the file
vim skills/shopify/knowledge/09-forbidden.md
# Add the new rule

# Update changelog
vim skills/shopify/knowledge/changelog.md
# Add entry per the template

# Bump version
vim skills/shopify/knowledge/version.md
# Increment per semantic versioning

# Commit
git add .
git commit -m "kb(shopify): add forbidden rule LIQ-024 - learned from Aurora pilot

- Catches the pattern that caused FM-007 in pilot
- Per K4 feedback loop
- Reviewed by [owner]

Refs: pilot/failure-modes.md FM-007"

# Push + PR
git push -u origin kb-update/post-pilot-aurora
gh pr create --title "KB update: forbidden rule LIQ-024" --body "..."
```

PR reviewed by 1+ senior dev. Merged when approved.

---

## Step 6: Bump version + changelog

In `skills/shopify/knowledge/version.md`:

```diff
- Version: 1.1.0
+ Version: 1.1.1
- Last reviewed: 2026-05-25
+ Last reviewed: 2026-07-08
```

In `skills/shopify/knowledge/changelog.md`:

```markdown
## 2026-07-08 — Post-pilot Aurora updates

**Version:** 1.1.1
**Author:** Bob (Shopify KB owner)

### Added
- forbidden.md rule LIQ-024 — caught in Aurora pilot (FM-007). Prevents hallucinated `cart.bulk_add()` filter.

### Changed
- naming-conventions.md — clarified that project prefix applies to JS variable names too (was ambiguous).

### Notes
- Both changes driven by pilot retro on 2026-07-05
- Communicated to team in pilot wrap-up email
```

Bumps per semver:
- MAJOR (1.0.0 → 2.0.0): breaking changes to KB structure
- MINOR (1.1.0 → 1.2.0): new files, new major rules
- PATCH (1.1.0 → 1.1.1): small additions, clarifications, corrections

---

## Step 7: Communicate to team

Update notification:
- Slack message in skills-updates channel: "Skills v1.1.1: added LIQ-024 + clarified naming rules"
- Email summary to team
- Link to changelog
- Pull instructions: "Pull from main to get updates"

---

## Step 8: Verify on next project

Track:
- Does the same failure occur again on the next project? Should not.
- Does Code Review Agent now catch this pattern? Should.
- Are devs aware of the new rule? Check via spot-check.

If failure recurs: the KB update wasn't strong enough. Refine.

---

## Bulk KB updates (post-pilot)

After pilot retro, you may have many candidates. Batch them:

1. Create one PR with multiple KB updates
2. Group by file (one section of the PR per file)
3. Owner reviews holistically
4. Single bump in version + changelog
5. Communicate batch update

Don't do 20 separate PRs for 20 small additions. Batch.

---

## Categorizing KB updates by priority

Not all updates have the same urgency:

### Urgent (apply within 1 week of identification)
- P1 failures that could cause client damage
- Security gaps
- Anything related to checkout/payment paths

### Important (apply within 1 month)
- P2 failures that caused notable rework
- Quality gaps that recurred 3+ times
- Workflow issues

### Routine (apply at quarterly review)
- P3 polish improvements
- Minor wording clarifications
- New examples to add

---

## When KB updates conflict

Sometimes a new rule conflicts with an existing one. Process:

1. Identify the conflict explicitly
2. Discuss at monthly retro (K5)
3. Decide which rule wins (or merge into one)
4. Update + remove the obsoleted one (move to deprecations.md)

Conflicts are healthy signals — the system is being thought through.

---

## What NOT to update KB for

Some failures don't warrant KB updates:

- **One-off mistakes** that won't recur (e.g., dev typo)
- **Tool bugs** (fix the tool, not KB)
- **Misunderstandings** that don't generalize (project-specific quirk)
- **Aspirational improvements** without evidence the current state is broken

KB bloat = harder to maintain. Be selective.

---

## Effectiveness measurement

Track:
- KB updates per quarter (should be steady, not zero)
- Recurrence of "fixed" patterns (should drop after KB update)
- Code Review Agent's catch rate (should improve over time)
- Failure modes captured per pilot (should decrease across pilots)

If KB updates aren't reducing failures over time: the updates aren't strong enough. Refine the process.

---

## Anti-patterns

1. **Capturing failures but not updating KB.** Capture is wasted.

2. **Updating KB without testing.** Make sure the rule is correctly worded by walking through the original failure scenario.

3. **Adding rules to every failure.** Bloat. Be selective.

4. **No version bumps.** Can't tell which projects use which KB version.

5. **Owner not engaged.** KB updates need senior review. Don't let them sit unreviewed.

6. **Updates not communicated.** Team doesn't know about new rules → doesn't follow them.

7. **Updates only at quarterly review.** Urgent failures wait too long. Apply urgent KB updates ASAP.

---

Last reviewed: 2026-05-25 by Claude (initial)
Next review due: 2026-08-25
