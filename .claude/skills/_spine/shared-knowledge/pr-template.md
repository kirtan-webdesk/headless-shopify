---
tier: 2
load_when: ["pr-creation"]
---

# Pull Request Template

> Standard PR template every project uses. Lives at `.github/PULL_REQUEST_TEMPLATE.md` in each project repo. Frontend Agent's scaffolding (Phase 3) deploys this.

---

## The template

```markdown
## Sprint / Issue
<!-- Reference the sprint ID and/or bug ID this PR addresses -->
- Sprint: S[X.Y]
- Issue / Bug: #[issue-number] OR BUG-[id]

## Summary
<!-- Brief 1-3 sentence summary of what this PR does -->


## What changed
<!-- Bullet list of changes. Reviewer should be able to skim and understand scope -->
- [ ] Change 1
- [ ] Change 2
- [ ] Change 3

## Why this approach
<!-- Briefly explain key decisions. What alternatives did you consider? Why this one? -->


## Files affected
<!-- High-level list of file types changed -->
- Sections: [list]
- Snippets: [list]
- Assets (CSS/JS): [list]
- Templates: [list]
- Other: [list]

## Testing performed
<!-- What testing did you do beyond CI? -->
- [ ] Local theme dev preview
- [ ] Tested on 5 breakpoints: 375 / 414 / 768 / 1024 / 1440
- [ ] Tested in: Chrome / Firefox / Safari / Edge
- [ ] Lighthouse run on affected pages (results below)
- [ ] axe-core scan (results below)
- [ ] Tested keyboard navigation
- [ ] Tested with screen reader (NVDA / VoiceOver)
- [ ] Other: [specify]

## Lighthouse results (if performance-affecting)
| Page | Mobile Perf | Mobile A11y | Desktop Perf | LCP | CLS |
|------|------------:|------------:|-------------:|----:|----:|
| Homepage | XX | XX | XX | X.Xs | 0.0X |
| PDP | XX | XX | XX | X.Xs | 0.0X |
| Cart | XX | XX | XX | X.Xs | 0.0X |

## Screenshots
<!-- Add screenshots showing the changes. Before/after preferred. Mobile + desktop. -->


## Acceptance criteria
<!-- Per sprint brief — check off as completed -->
- [ ] AC1: [criterion]
- [ ] AC2: [criterion]
- [ ] AC3: [criterion]

## Checklist (you must complete before merge)
- [ ] Code follows project's coding standards (see _spine/shared-knowledge/code-review-standards.md)
- [ ] All linters pass locally (theme-check / ESLint / PHPCS etc.)
- [ ] No `console.log()` or debug code left in
- [ ] No hardcoded secrets or credentials
- [ ] No commented-out code (use git history instead)
- [ ] All TODO comments have context (or removed)
- [ ] Sensitive paths (checkout / payment / auth) — senior reviewer requested per CODEOWNERS
- [ ] If introduced new dependencies: justified above
- [ ] Documentation updated if needed (master doc, admin guide)
- [ ] Tests added/updated for new functionality
- [ ] Cross-browser tested
- [ ] Mobile tested (5 breakpoints)
- [ ] Accessibility tested (keyboard + axe + visual)

## Reviewer notes
<!-- Anything reviewers should focus on or be aware of? -->


## Related links
<!-- Links to relevant docs, designs, issues, slack threads -->
- Design: [Figma link or section-map.json reference]
- Spec: [link]
- Related PRs: [#PR-number]
```

---

## Why this template

### Forces self-review
The checklist makes the dev pause before opening the PR. Many issues caught here, not by reviewers.

### Gives reviewers context fast
Summary + screenshots + Lighthouse data = reviewer can decide in 30 seconds whether to dig deep.

### Documents decisions
"Why this approach" captures rationale that's invisible in the code. Useful months later.

### Sets a quality bar
The checklist IS the quality bar. If you can't check the boxes, the PR isn't ready.

---

## Template variations per project type

### Migration PRs

Add:
```markdown
## Migration data
- Data types affected: [products / customers / orders / ...]
- Records affected: [N]
- Parity verification result: [link]
- Field mapping reference: [link]
```

### Hotfix PRs

Add:
```markdown
## Incident context
- Incident: [link to incident log]
- Severity: P1 / P2
- Root cause: [brief]
- Fix scope: [brief — should be minimal]
- Risk of side effects: [low / medium / high]
- Senior approval: [@user]
```

### Headless / Node.js PRs

Add:
```markdown
## Bundle impact
- JS bundle delta: [+/- X KB]
- New dependencies: [list]
- Removed dependencies: [list]
- Lighthouse vs main branch:
  - Performance: [XX → XX]
  - LCP: [X.Xs → X.Xs]
```

---

## How Code Review Agent uses the template

When Code Review Agent posts its review comment (per `_spine/code-review-agent/templates/review-comment.md`), it references the template:

- Verifies acceptance criteria boxes checked
- Verifies testing performed boxes checked
- Cross-references Lighthouse results to its own findings
- Flags incomplete checklist items as P3/P4

If template sections are blank or sparse, Code Review Agent flags:
> "PR description missing testing details. Please complete the 'Testing performed' section before merge."

---

## Senior reviewer's eye

When a senior dev reviews a PR, they read the template first. Specifically:

1. **What changed:** verifies scope matches sprint brief
2. **Why this approach:** evaluates the decision-making
3. **Testing performed:** trusts but verifies (spot-check)
4. **Acceptance criteria:** matches against sprint definition
5. **Sensitive paths:** decides if their specific approval is needed

If template is well-filled, review is faster. If template is sparse, reviewer asks for clarification before approving.

---

## Anti-patterns

1. **Empty PR description.** "Updated stuff" tells nobody anything. Refuse to review.
2. **Skipping screenshots.** Visual changes without screenshots = reviewer has to clone and run locally. Inefficient.
3. **Lying on the checklist.** Checking boxes without doing the work = trust erosion. Reviewers verify.
4. **No "Why this approach".** Code shows what; description should show why.
5. **Combining unrelated changes.** "Bug fix + new feature" = unreviewable. Split.
6. **No testing details.** "It works on my machine" is not a test report.

---

Last reviewed: 2026-05-24 by Claude (initial)
Next review due: 2026-08-24
