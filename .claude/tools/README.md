# WebDesk AI Delivery System — Tools

> Phase 5 deliverable. Wires the skills system to actual execution (CI/CD, linting, code review, cost tracking).

---

## What's in here

```
tools/
├── README.md                              ← you are here
├── github-actions/                        ← GitHub Actions workflows (copy to .github/workflows/)
│   ├── theme-push.yml                     ← Auto-push to dev theme on feature branch commits
│   ├── code-review.yml                    ← Claude API code review on every PR (per H4)
│   ├── lighthouse-ci.yml                  ← Lighthouse gate on PRs
│   ├── axe-ci.yml                         ← Accessibility gate on PRs
│   ├── staging-push.yml                   ← Push to staging on develop merge
│   ├── live-publish.yml                   ← Publish to live with approval gate
│   └── linters.yml                        ← Theme-check + linters
├── scripts/                               ← Reusable scripts
│   ├── run-code-review.py                 ← Claude API review (per H4)
│   ├── project-json-lock.sh               ← File locking for project.json
│   ├── milestone-token-report.py          ← Token usage report per milestone
│   └── verify-redirects.sh                ← Redirect verification
├── configs/                               ← Config files (copy to project root)
│   ├── .theme-check.yml                   ← Theme check baseline
│   ├── lhci-config.json                   ← Lighthouse CI config
│   ├── axe-config.json                    ← axe-core config
│   ├── .eslintrc.json                     ← ESLint baseline
│   └── CODEOWNERS-template                ← CODEOWNERS template
├── pre-commit/                            ← Pre-commit hooks
│   └── .pre-commit-config.yaml            ← Hooks setup
├── alerts/                                ← Monitoring + alerts setup
│   ├── anthropic-spending-alerts.md       ← API cost alert configuration
│   ├── synthetic-monitoring-setup.md      ← UptimeRobot setup
│   └── prompt-caching-setup.md            ← Anthropic prompt caching
└── docs/
    └── deployment-guide.md                ← How to install everything per project
```

---

## How to use

### Per-project setup (when starting a new Shopify project)

1. Clone the project repo
2. Copy relevant files from this `tools/` folder into the project:
   - `tools/github-actions/*.yml` → project's `.github/workflows/`
   - `tools/configs/.theme-check.yml` → project root
   - `tools/configs/lhci-config.json` → project root
   - `tools/configs/.eslintrc.json` → project root (if using JS)
   - `tools/configs/CODEOWNERS-template` → project's `.github/CODEOWNERS` (customize per project)
   - `tools/pre-commit/.pre-commit-config.yaml` → project root
   - `tools/scripts/run-code-review.py` → project's `.github/scripts/`
3. Set GitHub Secrets per `docs/deployment-guide.md`
4. Configure branch protection per `_spine/shared-knowledge/git-branch-strategy.md`

After setup, the project has:
- Auto-push to dev theme on feature branch commits
- Code Review Agent runs on every PR
- Lighthouse + axe gates on PRs
- Linters in CI
- Approval gate on live publish

### Workspace-level setup (one-time)

Per `_spine/shared-knowledge/dev-environment-setup.md`:
- Install Claude Code, VS Code, Shopify CLI
- Install Claude in Chrome extension
- Configure Anthropic API access + prompt caching
- Set up Anthropic spending alerts

---

## What this enables

After Phase 5 install, every Shopify project automatically:

1. **On commit to feature/* branch:**
   - Pre-commit: linter + unit tests (blocks commit on fail)

2. **On push to feature/* branch:**
   - GitHub Actions pushes to dev theme
   - Available at preview URL within ~90s

3. **On PR open:**
   - Theme check runs
   - Lighthouse CI runs on affected pages
   - axe-core scans for a11y violations
   - Code Review Agent reviews + posts comment
   - PR cannot merge if any P1/P2 issues found

4. **On merge to develop:**
   - GitHub Actions pushes to staging theme

5. **On merge to main:**
   - GitHub Actions requires required reviewer approval
   - On approval: pushes to live theme
   - Health check runs post-push

---

## Customization per project

Most files are ready-to-use templates. Project-specific customization needed:

- `.github/CODEOWNERS` — assign actual usernames to sensitive paths
- `GitHub Secrets`:
  - `SHOPIFY_CLI_THEME_TOKEN`
  - `SHOPIFY_STORE_URL`
  - `SHOPIFY_DEV_THEME_ID`
  - `SHOPIFY_STAGING_THEME_ID`
  - `SHOPIFY_LIVE_THEME_ID`
  - `ANTHROPIC_API_KEY` (for Code Review Agent)
  - `PROJECT_ID` (for cost tracking)
- Branch protection rules (per project's GitHub settings)

`docs/deployment-guide.md` walks through these steps in detail.

---

## Dependencies

These tools assume:
- GitHub repository (or compatible — adapt for GitLab/Bitbucket if needed)
- Shopify CLI installed locally for developers
- Node.js + npm (for some tooling)
- Python 3.9+ (for some scripts)
- Anthropic API access (for Code Review Agent)

Per-platform-arm tools may differ:
- WordPress arm would need WP-CLI workflows
- Magento arm would need Magento-specific deployment
- Etc.

Phase 5 (this folder) is **Shopify-specific** because that's our pilot platform. Other platform arms will add their own tools when those arms are built.

---

## Maintenance

- **Owner:** Tech Lead / DevOps lead
- **Review:** quarterly per K2
- Update workflows when GitHub Actions, Shopify CLI, or related tools update

---

Last reviewed: 2026-05-25 by Claude (initial)
Next review due: 2026-08-25
