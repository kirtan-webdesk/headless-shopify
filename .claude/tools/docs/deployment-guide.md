---
tier: 3
load_when: ["human-reference-only"]
---

# Deployment Guide — WebDesk AI Delivery System

> How to install all tooling for a new Shopify project. Step-by-step.

---

## Prerequisites

Before starting, ensure:
- [ ] You have repo access (GitHub)
- [ ] You have Shopify Partner account
- [ ] You have Anthropic API key
- [ ] Client has Shopify store (or you're creating one)
- [ ] Senior dev assigned as repo admin

---

## Step 1: Repository setup

### Create / clone repo
```bash
# Create new repo via GitHub UI or:
gh repo create webdesksolution/[project-slug] --private --clone

cd [project-slug]
```

### Initial structure
```bash
# Create branch structure
git checkout -b develop
git push -u origin develop

# Set develop as default branch in GitHub Settings → Default branch
```

### Branch protection
GitHub UI → Settings → Branches → Add rule:

For `main`:
- Require pull request before merging
- Require approvals: 2
- Require approvals from Code Owners: YES
- Require status checks: AI Code Review, theme-check, Lighthouse, axe-core
- Require linear history: YES
- Allow force pushes: NO

For `develop`:
- Require pull request before merging
- Require approvals: 1
- Require status checks: AI Code Review, theme-check
- Allow force pushes: NO

---

## Step 2: Configure GitHub Secrets

GitHub UI → Settings → Secrets and variables → Actions → New repository secret:

| Secret | Value | Source |
|--------|-------|--------|
| `SHOPIFY_CLI_THEME_TOKEN` | `shpat_xxx...` | Shopify Admin → Apps → Develop apps |
| `SHOPIFY_STORE_URL` | `[client].myshopify.com` | Without `https://` |
| `SHOPIFY_DEV_THEME_ID` | numeric ID | `shopify theme list` output |
| `SHOPIFY_STAGING_THEME_ID` | numeric ID | `shopify theme list` output |
| `SHOPIFY_LIVE_THEME_ID` | numeric ID | `shopify theme list` output |
| `ANTHROPIC_API_KEY` | `sk-ant-xxx...` | Anthropic Console → API Keys |
| `PROJECT_ID` | `WDS-2026-XXX` | Project ID from PM Agent |
| `LHCI_GITHUB_APP_TOKEN` | (optional) | Lighthouse CI GitHub App |

---

## Step 3: GitHub Environments

For protected workflows (live publish):

GitHub UI → Settings → Environments → New environment → name: `production`

Configure:
- **Required reviewers:** Add senior dev(s) who must approve before live publish
- **Environment secrets:** Same secrets above, BUT scoped to production environment (extra security)
- **Wait timer:** Optional (e.g., 5 min wait to allow last-minute cancellation)

---

## Step 4: Copy tools into repo

From the `tools/` folder of the WebDesk skills package:

```bash
# Workflows
mkdir -p .github/workflows
cp /path/to/tools/github-actions/*.yml .github/workflows/

# Scripts
mkdir -p .github/scripts
cp /path/to/tools/scripts/run-code-review.py .github/scripts/

# Configs
cp /path/to/tools/configs/.theme-check.yml .
cp /path/to/tools/configs/.eslintrc.json .
cp /path/to/tools/configs/lhci-config.json .
cp /path/to/tools/configs/CODEOWNERS-template .github/CODEOWNERS

# Pre-commit
cp /path/to/tools/pre-commit/.pre-commit-config.yaml .

# Project state utilities
mkdir -p scripts
cp /path/to/tools/scripts/project-json-lock.sh scripts/
cp /path/to/tools/scripts/milestone-token-report.py scripts/
cp /path/to/tools/scripts/verify-redirects.sh scripts/
chmod +x scripts/*.sh
```

---

## Step 5: Customize per project

### Update CODEOWNERS
Open `.github/CODEOWNERS`. Replace placeholder usernames:
```
* @your-senior-dev-1 @your-senior-dev-2
```
With actual usernames:
```
* @alice-senior @bob-senior
```

### Update lhci-config.json
Edit URLs to match the project's preview URL format:
```json
"url": [
  "https://[your-store].myshopify.com/?preview_theme_id=[your-dev-theme-id]",
  ...
]
```

### Update workflow URLs (axe-ci.yml, lighthouse-ci.yml, live-publish.yml)
Some workflows hardcode example URLs. Replace with project URLs:
- `example-product` → actual product handle
- `example.myshopify.com` → actual store

---

## Step 6: Initialize project workspace

Per `_spine/orchestrator/knowledge/04-state-management.md`:

```bash
# Create agency folder for project context
mkdir -p agency

# Initialize project.json (will be expanded by orchestrator on first session)
cat > agency/project.json <<EOF
{
  "project": {
    "id": "WDS-2026-XXX",
    "name": "[Project Name]",
    "schema_version": "1.0.0",
    "platform": "shopify",
    "project_type": "redesign",
    "status": "intake",
    "version": 1,
    "created_at": "$(date -u +'%Y-%m-%dT%H:%M:%SZ')"
  },
  "lock": {
    "locked": false
  },
  "sow": {},
  "scope": {},
  "milestones": [],
  "gates": [],
  "audit_log": [],
  "budget": {
    "token_cap": 5000000,
    "token_used": 0,
    "review_costs": []
  }
}
EOF

# Create versions directory
mkdir -p agency/project.json.versions

# Create subdirectories
mkdir -p agency/sprint-briefs
mkdir -p agency/qa-reports
mkdir -p agency/audit
mkdir -p agency/handoff-blocks
mkdir -p agency/updates
mkdir -p agency/mockups
```

Add agency folder to `.gitignore` if you don't want it in repo (recommended):
```
echo "agency/project.json.lock" >> .gitignore
# project.json itself stays in repo for shared state, but lock file does not
```

---

## Step 7: Install local tools (per dev)

Each developer on the project runs:

```bash
# Pre-commit hooks
pip install pre-commit
pre-commit install

# Shopify CLI (if not already)
npm install -g @shopify/cli@latest @shopify/theme@latest

# Node deps (for project)
npm install

# Set up .env (do NOT commit)
cp .env.example .env
# Edit .env with project-specific values
```

---

## Step 8: Set up Anthropic Console

One-time per workspace (not per project):

1. Go to https://console.anthropic.com
2. Settings → Limits:
   - Set monthly cap (e.g., $1,000)
   - Set daily cap (e.g., $50)
3. Settings → Notifications:
   - Add Tech Lead + Internal PM emails
   - Configure alerts at 80%, 95%, 100%
4. Verify prompt caching is enabled (default ON for Sonnet)

Per `tools/alerts/anthropic-spending-alerts.md`.

---

## Step 9: Set up UptimeRobot

For each project at launch (not during dev):

1. UptimeRobot Admin → Add Monitor
2. Configure per `tools/alerts/synthetic-monitoring-setup.md`

---

## Step 10: Test the setup

Verify everything works:

### Test 1: Push to dev theme
```bash
git checkout -b feature/test-setup
echo "<!-- test -->" >> sections/[any-existing-section].liquid
git add .
git commit -m "test: verify CI"
git push origin feature/test-setup
```

Check GitHub Actions tab. Should see:
- ✓ Theme push workflow runs (~2 min)
- ✓ Linters workflow runs

### Test 2: Open PR
Create PR from `feature/test-setup` → `develop`.

Verify on the PR:
- ✓ AI Code Review posts comment within ~3 min
- ✓ Lighthouse CI runs
- ✓ axe-core CI runs
- ✓ Theme-check passes
- ✓ PR status checks visible

If AI Code Review doesn't post:
- Check `ANTHROPIC_API_KEY` secret is set
- Check `.github/scripts/run-code-review.py` exists and is executable

### Test 3: Verify branch protection
Try to merge PR without all approvals → should be blocked.

### Test 4: Local hooks
```bash
git checkout -b test/hooks
# Commit something that would fail (e.g., trailing whitespace)
echo "test  " > test.txt
git add test.txt
git commit -m "test: verify hooks"
```

Should be blocked by pre-commit hook (trailing whitespace).

### Test 5: Project state
```bash
./scripts/project-json-lock.sh acquire agency/ "test-user"
./scripts/project-json-lock.sh release agency/
```

Should print successful lock + release messages.

---

## Step 11: Document setup in master doc

In `AGENCY-MASTER-DOC.md`:

```markdown
## Project Setup

### Repository
- URL: [URL]
- Default branch: develop
- Protected branches: main (2 approvals), develop (1 approval)
- CODEOWNERS: configured

### CI/CD
- Theme push: feature/* → dev theme (auto)
- Staging push: develop → staging theme (auto)
- Live publish: main → live theme (requires production env approval)
- AI Code Review: every PR
- Lighthouse CI: every PR
- axe-core CI: every PR
- Linters: every PR

### Monitoring (post-launch)
- UptimeRobot dashboard: [URL]
- Alert recipients: [emails]

### Anthropic API
- Workspace: [workspace name]
- Project token cap: [N] tokens
- Per-project review budget cap: $20

### Local dev
- Pre-commit hooks: active
- Shopify CLI: required
- Node: 20+
- Python: 3.11+ (for scripts)
```

---

## Step 12: Begin project work

The system is now ready. Start with:

```
Orchestrator skill activated.
Start project [client name].
Here is the SOW: [paste]
```

Orchestrator routes through:
1. G0 — SOW validation (auto)
2. G0.5 — Audit completion (for redesigns)
3. G1 — Plan approval (human)
4. G2 — Design approval (human)
5. ...

Per `_spine/orchestrator/knowledge/01-session-start-protocol.md`.

---

## Troubleshooting

### "AI Code Review" doesn't run
- Check `ANTHROPIC_API_KEY` secret
- Check workflow file is committed (`.github/workflows/code-review.yml`)
- Check workflow runs (Actions tab) for errors

### Theme push fails with "Invalid API key"
- Token may have expired or have wrong scopes
- Regenerate: Shopify Admin → Apps → Develop apps → your app → API credentials → Generate new token
- Update `SHOPIFY_CLI_THEME_TOKEN` secret

### Pre-commit hooks not running
- Did you run `pre-commit install`?
- Pre-commit installed: `pre-commit --version`
- Check `.pre-commit-config.yaml` is in repo root

### Lighthouse CI fails on URL
- Verify preview URL works manually
- Check `SHOPIFY_STORE_URL` doesn't have `https://` prefix
- Check `SHOPIFY_DEV_THEME_ID` is correct

### Live publish doesn't trigger
- Did you merge to main (not just push)?
- Is GitHub Environments configured for production?
- Are required reviewers added to the environment?

---

## Maintenance

Quarterly review (per K2):
- Update Shopify CLI version
- Update GitHub Actions versions (in workflow files)
- Update Anthropic SDK version
- Review and rotate API tokens
- Audit who has access to secrets

---

## Tools-related files reference

| File | Purpose |
|------|---------|
| `.github/workflows/theme-push.yml` | Auto-push on feature branch |
| `.github/workflows/code-review.yml` | AI code review on PR |
| `.github/workflows/lighthouse-ci.yml` | Performance gate |
| `.github/workflows/axe-ci.yml` | Accessibility gate |
| `.github/workflows/linters.yml` | theme-check + ESLint |
| `.github/workflows/staging-push.yml` | Push to staging on develop merge |
| `.github/workflows/live-publish.yml` | Live publish with approval gate |
| `.github/scripts/run-code-review.py` | Claude API review |
| `.github/CODEOWNERS` | Sensitive path reviewers |
| `.theme-check.yml` | Theme check config |
| `lhci-config.json` | Lighthouse CI config |
| `.eslintrc.json` | ESLint config |
| `.pre-commit-config.yaml` | Pre-commit hooks |
| `scripts/project-json-lock.sh` | State file locking |
| `scripts/milestone-token-report.py` | Per-milestone cost report |
| `scripts/verify-redirects.sh` | Redirect verification |

---

Last reviewed: 2026-05-25 by Claude (initial)
Next review due: 2026-08-25
