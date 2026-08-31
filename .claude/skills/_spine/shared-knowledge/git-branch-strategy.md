---
tier: 2
load_when: ["git-decision"]
---

# Git Branch Strategy (Universal)

> Per A5. The branching model every project uses. Same across platforms.

---

## Branch model

```
main
  ↑ (merge ONLY from develop, with required reviewer + G6 approval)
develop
  ↑ (merge from feature/* and fix/* after PR review)
feature/[sprint-id]-[short-name]
fix/[bug-id]-[short-name]
hotfix/[urgent-description]
release/[version]    (optional, for projects using release branches)
```

---

## Branch purposes

### `main`
- **Always reflects production.** What's on `main` is what's live.
- **Protected.** Cannot push directly. Cannot force-push.
- **Merges from develop only.** Via PR with required reviewer.
- **Tagged for releases.** Each launch tags the commit (`v1.0.0-launch`, `v1.1.0-feature-x`).

### `develop`
- **Integration branch.** Where work-in-progress integrates.
- **Always deployable to staging.** Should always pass tests.
- **Merges from feature/fix branches** via PRs.
- **Cleaned periodically** to keep history readable.

### `feature/[sprint-id]-[short-name]`
- **Per-sprint work.**
- **Naming:** `feature/S2.1-theme-scaffold`
- **Forks from develop.**
- **Merges back to develop** via PR.
- **Deleted after merge** (auto-cleanup recommended).

### `fix/[bug-id]-[short-name]`
- **Bug fix branches.**
- **Naming:** `fix/BUG-014-cart-safari`
- **Forks from develop** (not main — fix in develop first, then it flows to main on next deploy).
- **Merges back to develop** via PR.

### `hotfix/[urgent-description]`
- **Urgent production fix bypassing develop.**
- **Used rarely** (true production emergencies only).
- **Naming:** `hotfix/checkout-payment-broken`
- **Forks from main** (since this fixes production immediately).
- **Merges back to BOTH main AND develop** to prevent regression.
- **Requires senior approval** + audit log entry.

### `release/[version]` (optional)
- **Used by projects with formal release cycles.**
- **Naming:** `release/v2.1.0`
- **Forks from develop** when preparing a release.
- **Stabilizes for release.**
- **Merges to main** when ready.
- **Skipped for most projects** (we deploy from main directly).

---

## Branch naming rules

### Required format
```
[type]/[identifier]-[short-description]
```

### Type prefixes
- `feature/` — new functionality
- `fix/` — bug fixes
- `hotfix/` — urgent production fixes
- `release/` — release prep (optional)
- `chore/` — maintenance work (deps, docs, refactor without behavior change)

### Identifier rules
- For features: sprint ID (e.g., `S2.1`, `S3.2`)
- For fixes: bug ID (e.g., `BUG-014`)
- For chores: short topic (e.g., `update-deps`, `refactor-cart-utils`)
- For hotfixes: brief crisis description

### Short description rules
- Lowercase, hyphens, alphanumeric
- 3-5 words max
- Descriptive of the change

### Examples
```
feature/S1.1-theme-scaffold
feature/S2.2-mobile-nav
fix/BUG-014-cart-safari-animation
fix/BUG-023-pdp-variant-stock
hotfix/checkout-payment-broken
chore/update-shopify-cli
chore/refactor-cart-utils
```

---

## Branch protection rules

### `main` branch
- ✅ Require pull request before merging
- ✅ Require approvals: 2 (1 senior + 1 any dev)
- ✅ Require status checks to pass (CI must pass)
- ✅ Require approval from Code Owners (CODEOWNERS file)
- ✅ Require branches to be up to date before merging
- ✅ Require linear history (no merge commits — squash or rebase only)
- ❌ Allow force pushes: NO
- ❌ Allow deletions: NO

### `develop` branch
- ✅ Require pull request before merging
- ✅ Require approvals: 1
- ✅ Require status checks to pass (CI must pass)
- ✅ Require branches to be up to date before merging
- ❌ Allow force pushes: NO
- ❌ Allow deletions: NO

### Feature/fix branches
- No protection (developer's working space)

---

## PR workflow

### 1. Branch creation
```bash
# Start from latest develop
git checkout develop
git pull
git checkout -b feature/S2.1-theme-scaffold
```

### 2. Commit work
- Small, atomic commits
- Each commit message describes one logical change
- Commit message format: see § Commit messages below

### 3. Push and open PR
```bash
git push -u origin feature/S2.1-theme-scaffold
# Open PR via GitHub UI or CLI: gh pr create
```

### 4. PR review
- Code Review Agent reviews automatically (per `_spine/code-review-agent/knowledge/05-github-action-workflow.md`)
- Required human reviewers per branch protection + CODEOWNERS
- Address review feedback
- Re-request review after changes

### 5. Merge
- Merge method: **squash and merge** (preferred — keeps develop history clean)
- OR rebase and merge (preserves individual commits, more linear history)
- NOT merge commit (avoid messy merge commits in main/develop history)

### 6. Cleanup
- Delete feature branch after merge (GitHub can auto-delete)

---

## Commit messages

Format:
```
type(scope): brief description

Longer description if needed. Explains WHY, not just WHAT.
Can be multiple lines.

Refs: #PR-number, #BUG-id
```

### Types
- `feat` — new feature
- `fix` — bug fix
- `chore` — maintenance, deps, formatting
- `docs` — documentation only
- `style` — code style/formatting (no logic change)
- `refactor` — refactor with no behavior change
- `test` — adding/updating tests
- `perf` — performance improvement
- `ci` — CI/CD configuration changes

### Scope
- Brief identifier of the area affected: `cart`, `pdp`, `header`, `auth`, `checkout`, etc.

### Examples
```
feat(hero): add aurora-themed hero section with video background

Implements the hero section per S2.4 spec. Video plays muted with poster
fallback for browsers that don't support autoplay. Lighthouse Performance
remains above 84.

Refs: #142, S2.4
```

```
fix(cart): prevent drawer animation jump on Safari iOS

Safari iOS was skipping first 100ms of slide-in animation due to
transition-origin inconsistency. Changed to transform-based animation
which is GPU-accelerated and consistent across browsers.

Refs: #143, BUG-014
```

```
chore(deps): update Shopify CLI to 3.62.0

Picks up security fix for vulnerability disclosed 2026-05-15.

Refs: dependabot-145
```

---

## Releasing

### Standard release (deploy to production)

1. develop is stable (all milestone QA passes)
2. Open PR: develop → main
3. PR title: `Release: [Project Name] [version or milestone]`
4. Required reviewers approve
5. Required CI/CD passes
6. G6 (pre-launch gate) confirmed by Delivery Head + Client (per `_spine/delivery-head/`)
7. Merge to main
8. Tag the merge commit: `git tag -a v1.0.0-launch -m "Initial launch"`
9. Push tag: `git push origin v1.0.0-launch`
10. GitHub Actions deploys to live theme (per A4)

### Hotfix release (urgent production fix)

1. Fork hotfix branch from main: `git checkout -b hotfix/checkout-payment-broken main`
2. Make the fix (minimal scope)
3. PR to main, require 2 approvals + senior sign-off
4. Tag commit
5. Deploy to live
6. Open PR: hotfix → develop to back-port the fix
7. Merge to develop

Hotfixes should be < 1% of production deploys. If > 1%, develop branch isn't stable enough — investigate process.

---

## Tags

Tag format: `v[major].[minor].[patch]-[label]`

Examples:
- `v1.0.0-launch` — initial launch
- `v1.0.1-hotfix` — first hotfix
- `v1.1.0-feature-x` — feature release
- `v2.0.0-rebuild` — major version (significant change)

Semantic versioning approach (flexible for agency projects).

---

## Cleanup and hygiene

### Quarterly:
- Delete merged branches (if not auto-deleted)
- Squash stale branches (open > 60 days with no activity)
- Review CODEOWNERS for accuracy

### Per project close:
- Tag final commit: `v1.0.0-launch`
- Archive any orphaned branches
- Verify main and develop are in sync

---

## Anti-patterns

1. **Force-pushing to main or develop.** Never. Disabled by branch protection.
2. **Long-lived feature branches.** > 1 sprint = merge conflicts pile up. Keep branches short.
3. **Direct commits to main.** Bypasses review. Forbidden.
4. **Vague branch names.** `feature/stuff` tells you nothing. Use sprint ID + descriptive.
5. **Merging without review.** Skip review = bypassing safety net. Even small PRs get review.
6. **No squash on merge.** Develop becomes spaghetti history with merge commits.
7. **Mixing concerns in one PR.** Bug fix + new feature + refactor = unreviewable. Split.

---

Last reviewed: 2026-05-24 by Claude (initial)
Next review due: 2026-08-24
