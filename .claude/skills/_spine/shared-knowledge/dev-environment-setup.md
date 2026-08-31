---
tier: 2
load_when: ["env-issue"]
---

# Dev Environment Setup (Universal)

> Common dev environment setup for every dev across all platforms. Per A1-A11 decisions.

---

## What gets set up

Per A1-A11:

```
[X] A1.  Claude Code installed (primary AI coding tool)
[X] A2.  VS Code installed (IDE)
[X] A3.  Test pyramid configured (Playwright, Lighthouse CI, axe, etc.)
[X] A4.  Per-platform CLI + GitHub Actions integration
[X] A5.  Git branch strategy understood (per `git-branch-strategy.md`)
[X] A6.  .env management + .gitignore practices
[X] A7.  GitHub branch protection understood
[X] A8.  Anthropic prompt caching enabled
[X] A9.  Anthropic Batch API access (for non-urgent work)
[X] A10. Hard spend cap configured per project
[X] A11. Per-project token budget tracking
[X] Claude in Chrome extension installed (per QA Agent's needs)
```

This file is the dev's setup checklist.

---

## One-time machine setup (new dev onboarding)

### Step 1: Install Claude Code

Get Claude Code from Anthropic. Sign in with your team Anthropic account.

```bash
# After install
claude --version
# Verify installed
```

Authenticate:
```bash
claude auth
```

### Step 2: Install VS Code

Download from code.visualstudio.com.

Recommended extensions:
- Shopify Liquid
- WordPress Snippets (if doing WP)
- PHPCS / PHP Intelephense (if doing WP/Magento)
- ESLint
- Prettier
- Playwright Test for VS Code
- GitLens
- Error Lens
- markdownlint

Settings (per `.vscode/settings.json` in each project repo):
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true,
  "files.eol": "\n"
}
```

### Step 3: Install Node.js (LTS)

From nodejs.org. LTS version (currently v22.x).

```bash
node --version  # Should show v22.x or later
npm --version
```

### Step 4: Install Git

If not already installed.

```bash
git --version
git config --global user.name "Your Name"
git config --global user.email "you@webdesksolution.ca"
```

### Step 5: Install platform CLIs (per platform you work on)

#### Shopify CLI (if you work on Shopify)
```bash
npm install -g @shopify/cli@latest @shopify/theme@latest
shopify version
```

#### WP-CLI (if you work on WordPress)
```bash
curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
chmod +x wp-cli.phar
sudo mv wp-cli.phar /usr/local/bin/wp
wp --info
```

#### Magento CLI (if you work on Magento — usually via Docker/Composer)
```bash
# Typically via Composer or Docker per Magento setup
# See Magento docs for current best practices
```

#### BigCommerce Stencil (if you work on BC)
```bash
npm install -g @bigcommerce/stencil-cli
stencil --version
```

### Step 6: Install Chrome + Claude in Chrome extension

Chrome browser: from google.com/chrome.

Claude in Chrome extension: install from Chrome Web Store. Sign in with your Anthropic account.

This is mandatory per the user's QA requirement — Claude in Chrome supplements Playwright for exploratory testing.

### Step 7: Configure SSH for GitHub

Generate SSH key:
```bash
ssh-keygen -t ed25519 -C "you@webdesksolution.ca"
```

Add to GitHub:
- Copy public key: `pbcopy < ~/.ssh/id_ed25519.pub` (macOS) or `cat ~/.ssh/id_ed25519.pub` (then copy)
- GitHub → Settings → SSH and GPG keys → New SSH key
- Paste and save

Test:
```bash
ssh -T git@github.com
# Should respond with "Hi [username]!"
```

### Step 8: Install testing tools

```bash
# Playwright (browser automation for testing)
npm install -g playwright
npx playwright install  # Downloads browser binaries

# Lighthouse CI
npm install -g @lhci/cli
lhci --version
```

### Step 9: Configure Anthropic API access

Get API key from Anthropic console. Add to env:

```bash
# In ~/.zshrc or ~/.bashrc
export ANTHROPIC_API_KEY="sk-ant-your-key-here"
```

Reload: `source ~/.zshrc`.

Test:
```bash
echo $ANTHROPIC_API_KEY
# Should print your key (be careful — don't share!)
```

---

## Per-project setup

When you join a new project, repeat this checklist:

### Step 1: Clone repo
```bash
git clone git@github.com:webdesksolution/[project-name].git
cd [project-name]
git checkout develop  # Default working branch
```

### Step 2: Read the project's master doc
```bash
cat AGENCY-MASTER-DOC.md  # If exists (created at project close, but may exist mid-project)

# Otherwise read:
cat README.md
cat agency/spec.md
```

Understand:
- Platform + version
- Project type (redesign, migration, etc.)
- Active sprint
- Sensitive paths (per CODEOWNERS)

### Step 3: Set up .env

```bash
cp .env.example .env
# Edit .env with project-specific values:
# - SHOPIFY_STORE_URL (or platform equivalent)
# - SHOPIFY_CLI_THEME_TOKEN (or platform token)
# - Theme IDs / project IDs
```

Per A6: NEVER commit .env. Verify `.env` is in `.gitignore`.

### Step 4: Install project dependencies

```bash
# JavaScript / Node
npm install

# PHP / Composer
composer install

# Python (rare for web projects)
pip install -r requirements.txt
```

### Step 5: Verify local dev runs

```bash
# Shopify
shopify theme dev --store [store].myshopify.com

# WordPress (depends on local setup — Local by Flywheel, DDEV, Docker, etc.)

# Magento
# Usually via Docker
docker-compose up

# Node.js
npm run dev
```

Open preview URL, verify it loads.

### Step 6: Run tests

```bash
# Playwright
npx playwright test

# Lighthouse CI (against staging or local)
lhci collect --url=[local-url]

# Linter
shopify theme check  # or platform equivalent

# Unit tests
npm test
```

All should pass before you start working.

### Step 7: Verify GitHub Actions are working

Make a test commit + push to a test branch:
```bash
git checkout -b test/verify-ci
echo "# test" >> README.md
git commit -am "test: verify CI"
git push -u origin test/verify-ci
```

Check GitHub → Actions tab. CI should run.

If working, delete the test branch:
```bash
git checkout develop
git branch -D test/verify-ci
git push origin --delete test/verify-ci
```

---

## Daily workflow

### Start of day

```bash
# Update develop
git checkout develop
git pull

# Start your sprint branch (if continuing existing sprint)
git checkout feature/S2.4-hero-section

# OR start a new sprint branch
git checkout -b feature/S2.4-hero-section

# Run local dev
shopify theme dev  # (or platform equivalent)
```

### During work

- Read sprint brief: `cat agency/sprint-briefs/S2.4-hero-section.md`
- Reference KB: `cat .claude-rules/<active-platform>/knowledge/09-forbidden.md` (or wherever KB is mounted)
- Commit often, push regularly

### End of day

- Push current work: `git push`
- If sprint complete: open PR
- If sprint incomplete: note progress in commit message

---

## Working with Claude Code

### Sprint-based work
Claude Code reads sprint briefs and produces code per the brief.

Standard prompt:
> "Read agency/sprint-briefs/S2.4-hero-section.md. Build the hero section per the spec. Apply tokens from design-tokens.json. Reference <active-platform>/examples/sections/<example> as pattern. Apply <active-platform>/knowledge/09-forbidden.md rules. Self-check at completion per the agent cascade."

### Code review with Claude Code

When reviewing AI-generated code:
> "Review this section against <active-platform>/knowledge/09-forbidden.md and <active-platform>/knowledge/03-accessibility.md. Flag any violations."

### Bug fixing
> "Fix BUG-014 (cart drawer animation on Safari iOS). Read the bug report at agency/bugs/BUG-014.md for details. Don't change anything outside the cart drawer files."

### Self-verification
Always ask Claude Code to self-check:
> "After completing the task, state which KB files you consulted and which acceptance criteria you verified."

If Claude Code doesn't include self-check, ask explicitly.

---

## Working with Claude in Chrome

Use for exploratory QA per `_spine/qa-agent/knowledge/07-claude-in-chrome-usage.md`.

Typical sprint workflow:
1. Sprint development complete
2. Run Playwright tests locally (scripted regression)
3. Open Chrome with preview URL
4. Open Claude in Chrome panel
5. Instruct: "Walk through the hero section flow on this page. Try [specific scenarios]. Report findings with severity."
6. Review findings
7. Address bugs found
8. If clean, mark sprint QA complete

Don't use Claude in Chrome for things Playwright already covers. Save for exploratory + UX judgment.

---

## Prompt caching (per A8)

Anthropic prompt caching gives 90% discount on cached content.

When using Claude Code or Claude API:
- KB files (forbidden.md, coding-standards.md, etc.) cache automatically with proper config
- Don't worry about cache management — it's handled by the agent's setup

If you see unusually high API costs, check if caching is enabled (Anthropic console shows cache hit rates).

---

## Spending cap (per A10)

Each project has a spending cap in `project.json.budget.token_cap`.

You'll see warnings when approaching cap (per `_spine/orchestrator/knowledge/05-escalation-paths.md`).

If you exceed cap, work pauses for senior approval. Don't take this personally — it's a guardrail, not a judgment.

---

## Token report (per A11)

After each milestone, you'll receive a token report:
- How many tokens used
- Cost
- Where they were spent (per agent, per stage)

Review for patterns:
- Did one agent use disproportionate tokens? (suggests inefficiency)
- Were retries common? (suggests AI was struggling — KB gap?)
- Within budget? (good signal)

Used to refine future estimates.

---

## Troubleshooting

### Claude Code can't authenticate
```bash
claude logout
claude auth
```

### Shopify CLI errors
```bash
# Try latest version
npm uninstall -g @shopify/cli @shopify/theme
npm install -g @shopify/cli@latest @shopify/theme@latest
```

### Playwright tests fail with "browser not found"
```bash
npx playwright install
```

### GitHub Actions not running
- Check workflow file is committed (`.github/workflows/`)
- Check branch protection isn't blocking
- Check repository → Actions tab for errors

### Local dev server won't start
- Check port not in use: `lsof -i :9292` (kill if needed)
- Check .env has correct values
- Try fresh: `shopify theme dev --reset`

### Out of API quota
- Check Anthropic console for rate limits
- Check daily spend cap (per A10)
- Wait or request increase via senior dev

### Claude in Chrome not loading
- Check extension is installed + signed in
- Check tab URL is reachable from extension (some restricted URLs blocked)
- Try refreshing page

---

## Updating your environment

Quarterly:
- Update Claude Code, platform CLIs, Playwright
- Review recommended VS Code extensions
- Update Chrome + Claude in Chrome extension

When new tools / features added (per K8 training):
- Read the announcement
- Run the upgrade
- Update local config if needed

---

## Anti-patterns

1. **Skipping the onboarding checklist.** "I'll set it up as I go" → constant friction. Set up properly once.

2. **Working without .env.** Hardcoded values in code = leaked secrets eventually. Always use .env.

3. **Committing without running tests locally.** CI catches but slower. Run locally first.

4. **Using outdated CLI versions.** Bugs are fixed in newer versions. Update regularly.

5. **Ignoring API budget warnings.** Surprises at month-end. Pay attention.

6. **Not using Claude in Chrome.** Playwright + manual review only = missing exploratory layer.

7. **Direct commits to develop.** Always via PR. Even small changes.

---

Last reviewed: 2026-05-24 by Claude (initial)
Next review due: 2026-08-24
