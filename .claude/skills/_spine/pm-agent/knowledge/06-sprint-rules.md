---
tier: 2
load_when: ["agent-specific-detail"]
description: "What makes a good sprint. Rules to keep sprints focused, achievable, and verifiable."
---

# 06 — Sprint Rules

> What makes a good sprint. Rules to keep sprints focused, achievable, and verifiable.

---

## Hard sprint rules (do not violate)

1. **Duration: 3-5 working days.** Not 1 day. Not 2 weeks. If a unit of work doesn't fit, split or merge.

2. **Maximum 3 distinct outputs per sprint:**
   - Shopify/BC: max 3 sections OR 1 page template
   - WordPress: max 3 templates OR 5 blocks
   - Custom/headless: max 3 features
   - Migration: max 1 data type per sprint (e.g., "Sprint: products migration")
   - B2B: max 2 B2B flows (e.g., "Sprint: company switcher + quote creation")

3. **Each sprint has 3-7 acceptance criteria.** Less than 3 = too vague. More than 7 = scope too large, split sprint.

4. **Acceptance criteria are testable.** Every AC must be verifiable by reading code, clicking through, or running a test. "Looks good" is not testable. "Hero section displays on desktop ≥1024px with title left-aligned, image right-aligned, CTA button centered below on mobile <768px" is testable.

5. **Each sprint maps to specific spec deliverables.** If a sprint doesn't trace back to a deliverable in spec.md, it's scope creep.

6. **Each sprint has a sprint QA gate (G4).** No exceptions. Even small sprints get QA.

---

## Sprint ID convention

Format: `S{milestone}.{sprint_within_milestone}`

Examples:
- `S1.1` = First sprint of milestone 1
- `S2.3` = Third sprint of milestone 2
- `S-A.1` = First sprint in track A (parallel-tracks projects)

This ID appears in:
- `project.json.milestones[].sprints[].id`
- `milestones.json`
- Git branch names: `feature/S1.1-hero-section`
- PR titles: `[S1.1] Build hero section`
- Bug reports: `Found in S1.2`

---

## Sprint brief format

When a sprint begins, PM Agent generates `/projects/[client]/sprint-briefs/[sprint-id].md`:

```markdown
# Sprint S2.1 — Theme scaffold + base layout

**Milestone:** M2 — Foundation
**Duration:** 4 working days (May 27 - May 30)
**Assigned:** Frontend Dev (primary), Designer (consult), QA (sprint close)
**Estimated hours:** 22

## Scope
[2-3 sentences describing what gets built]

## Outputs
1. [Output 1 — specific deliverable]
2. [Output 2 — specific deliverable]
3. [Output 3 — specific deliverable, max 3 outputs]

## Acceptance Criteria
- [ ] AC1: [Testable criterion]
- [ ] AC2: [Testable criterion]
- [ ] AC3: [Testable criterion]
- [ ] AC4: [Testable criterion]
- [ ] AC5: [Testable criterion]

## Inputs (what the agent reads before starting)
- spec.md sections: [list specific sections]
- design-tokens.json
- section-map.json sections: [specific section IDs]
- KB knowledge files: [specific files]
- Reference examples: [specific example files]

## Dependencies
- Sprint depends on: [previous sprints or external inputs]
- Sprint blocks: [next sprints that wait on this]

## QA expectations
- Module 1: Theme Check passes
- Module 2: Functional checks for [specific flows]
- Module 3: Responsive at 5 breakpoints
- Module 4: Cross-browser (Chrome, Safari, Firefox, Edge)
- Module 5: axe-core zero violations
- Module 6: Lighthouse Performance ≥80 (normal) or ≥90 (headless)
- Module 7: SEO baseline checks
- Module 8: Security baseline checks

## Git
- Branch: feature/S2.1-theme-scaffold
- PR target: develop
- Required reviewers: 1 senior dev

## Done definition
Sprint is DONE when:
1. All AC checked off
2. All 8 QA modules pass
3. Code Review Agent review passes
4. Senior dev approves PR
5. Sprint QA gate (G4) confirmed by QA lead
```

---

## Acceptance criteria patterns

### Functional AC
"User can add product to cart from PDP without page reload, cart drawer opens, count updates"

### Visual AC
"Hero section matches Figma frame [URL] at desktop 1440px, tablet 768px, mobile 375px"

### Performance AC
"Lighthouse Performance ≥ 80 (normal) or ≥ 90 (headless) on homepage"

### Accessibility AC
"axe-core scan returns 0 violations on the built sections"

### Code quality AC
"Theme check passes (Shopify) / PHPCS passes (WordPress) / ESLint passes (JS) — no errors, ≤ 3 warnings"

### Integration AC
"Klaviyo webhook fires on cart abandonment (test by manually triggering, verify in Klaviyo dashboard)"

### SEO AC
"All product pages have unique meta titles, descriptions, canonical tags, and Product schema (validate with Rich Results Test)"

---

## Sprint size guidance

Estimating sprint size is a balance. Some patterns:

### Too small (< 12 hours)
Probably should merge with adjacent sprint OR isn't really a sprint (it's a sub-task).

### Just right (16-32 hours)
Most sprints fall here. 3-5 days × 4-6 effective hours/day.

### Too large (> 40 hours)
Split. Common splits:
- "Header + Nav + Footer" → "Header + Nav" + "Footer"
- "Cart + Checkout + Accounts" → "Cart" + "Checkout" + "Accounts"
- "PDP + variants + reviews" → "PDP + variants" + "Reviews integration"

If a sprint estimates > 40 hours, PM Agent should automatically suggest the split.

---

## Sprint sequencing within milestones

Rules:
1. Sprints sequence by dependency, not just chronology
2. Independent sprints can run in parallel IF team capacity allows
3. Dependencies are explicit in sprint brief
4. QA sprints come at end of milestone (not interleaved)

Example (M2: Foundation):
```
S2.1 (Theme scaffold) → blocks S2.2, S2.3, S2.4
S2.2 (Header + Nav) → independent of S2.3, S2.4
S2.3 (Footer) → independent of S2.2, S2.4
S2.4 (Announcement bar + Homepage hero) → depends on S2.1, not on S2.2/S2.3
S2.5 (Milestone QA) → depends on S2.2, S2.3, S2.4
```

If team has capacity, S2.2, S2.3, S2.4 can run in parallel after S2.1.

---

## Sprint outputs (artifacts)

Each sprint produces:

| Artifact | Path |
|----------|------|
| Sprint brief (input) | `/projects/[client]/sprint-briefs/[sprint-id].md` |
| Code (output) | Git: `feature/[sprint-id]-[short-name]` branch |
| PR (output) | GitHub PR |
| Code review (review) | PR comments from Code Review Agent |
| Sprint QA report (review) | `/projects/[client]/qa-reports/sprint-[sprint-id]-qa.md` |
| Sprint update doc (output) | `/projects/[client]/updates/sprint-[sprint-id]-update.md` (chunk 2: J3 template) |
| Bug entries (review) | `project.json.bugs[]` |

---

## Sprint anti-patterns

1. **Sprint without acceptance criteria.** Refuse to start. AC must be in brief before work begins.

2. **AC that's not testable.** "Site is responsive" — how do you verify? "Site renders correctly at 375/768/1024/1440/wide breakpoints with no overflow or broken layouts" — testable.

3. **Open-ended sprints ("everything frontend").** Refuse. Split.

4. **Skipping sprint QA.** No exceptions. Even small sprints.

5. **Combining unrelated outputs in one sprint.** "Build cart + setup analytics" — different agents, different acceptance criteria. Split.

6. **Sprint depending on undefined inputs.** If sprint says "use design tokens" but tokens aren't approved yet, sprint can't start.

7. **Estimating sprint as "few days" without committing to a number.** Pick 3, 4, or 5 days. Be specific.

---

## Sprint completion validation

Before declaring a sprint DONE (gate G4):

```
[ ] All acceptance criteria checked off
[ ] All 8 QA modules ran and reported (with results, even if pass)
[ ] Code Review Agent ran on the PR and posted result
[ ] No P1 or P2 bugs open against this sprint
[ ] PR merged to develop (or feature still open with reason)
[ ] Sprint QA gate (G4) confirmed by QA lead (NOT the dev who built)
[ ] actual_hours recorded in project.json
[ ] Sprint update document generated (chunk 2)
```

If any item unchecked, sprint is NOT done.

---

## Sprint failure modes

### Sprint estimate exceeded by > 25%
Likely root cause: missed complexity, hidden requirements, or AI hallucination loop.
Action: PM Agent surfaces overrun. Developer decides whether to extend sprint or split off remaining work into a follow-up sprint.

### Multiple P1/P2 bugs in sprint QA
Likely root cause: AI generated bad code, KB gap, or unclear acceptance criteria.
Action: Sprint reopens. Frontend/Backend Agent revises. Code Review Agent reviews. Bug fixes don't get a new sprint.

### Acceptance criterion can't be tested
Likely root cause: vague AC, missing test infrastructure.
Action: Sprint pauses. PM Agent revises AC. Sprint resumes.

---

Last reviewed: 2026-05-24 by Claude (initial)
Next review due: 2026-08-24
