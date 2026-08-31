---
tier: 3
load_when: ["human-reference-only"]
---

# Setup Instructions — WebDesk AI Delivery System

> How to install + configure the system. Three-tier setup: workspace, per-developer, per-project. Read `WALKTHROUGH.md` first if you haven't.

---

## The three-tier setup model

The system installs in three layers. Each developer doesn't install everything — they install what they need.

### Layer 1: Workspace-level (one-time, agency-wide)

Set up once for the entire agency:
- Central skills repo (version-controlled)
- Anthropic workspace + spending alerts
- Quarterly review schedule

### Layer 2: Per-developer (one-time per person)

Each developer installs once:
- Claude Code
- VS Code + extensions
- Platform CLIs (Shopify CLI, WP-CLI, etc. — only the platforms they work on)
- Claude in Chrome extension
- Clone the central skills repo
- Configure Claude Code to read the skills

### Layer 3: Per-project (every new client project)

For each new project:
- Use the deployment guide in `tools/docs/deployment-guide.md`
- Configure GitHub Actions, secrets, branch protection
- Set up project workspace

---

## Layer 1: Workspace setup (one-time, agency-wide)

### Step 1.1: Decide where the skills live

The skills folder (`skills/`) needs to live in a central location that every developer can access.

Recommended approach: **private GitHub repo**.

```bash
# Create the central repo
gh repo create webdesksolution/webdesk-skills --private --clone
cd webdesk-skills

# Unzip the delivery system into this repo (everything except the zip itself)
# Place skills/, tools/, README.md, WALKTHROUGH.md, SETUP-INSTRUCTIONS.md here

git add .
git commit -m "Initial: WebDesk AI Delivery System v1.3.0"
git push -u origin main
```

This becomes the canonical source of truth. All developers clone from here.

Alternative approach: shared cloud drive (Dropbox, Google Drive, etc.). Less ideal because version control is harder.

### Step 1.2: Assign ownership

Per E5 (locked decision):
- One senior dev owns the spine
- One senior dev per platform arm owns that arm
- Quarterly review by each owner is mandatory

Document owners in `skills/_spine/SHOPIFY-OWNER.md` (or similar) or in your team handbook:

```
Spine owner: Alice (alice@webdesksolution.ca)
Shopify arm owner: Bob (bob@webdesksolution.ca)
WordPress arm owner: (TBD when WP arm is built)
Magento arm owner: (TBD)
```

Owners are responsible for:
- Quarterly KB review (per K2)
- Approving KB updates from the feedback loop (per K4)
- Maintaining version anchors (Shopify API version, etc.)

### Step 1.3: Set up Anthropic Console

One workspace, multiple developers, multiple projects:

1. Anthropic Console → Organization settings
2. Create workspace if not exists
3. Add each developer's email as a team member
4. Set workspace-level spending limit:
   - Suggested starting: **$1,000/month**
   - Adjust based on actual usage after 1-2 months
5. Set daily spend cap: **$50/day**
6. Configure alerts:
   - 80% of monthly cap → email to Tech Lead + Internal PM
   - 95% → email + Slack (if integrated)
   - 100% → emergency alert
7. Generate API keys (one per developer ideally, for tracking)

Per `tools/alerts/anthropic-spending-alerts.md` for full configuration.

### Step 1.4: Configure Anthropic prompt caching

Per `tools/alerts/prompt-caching-setup.md`:
- Caching is enabled by default for Sonnet
- No console configuration needed
- Verified in Anthropic Console → Usage → Cache hit rate

The `run-code-review.py` script uses caching automatically.

### Step 1.5: Schedule quarterly KB review

Calendar event: every 3 months, KB owners review their arms.

Agenda:
- Are rules still current?
- Are examples stale?
- New patterns to add?
- KB update candidates from feedback loop?
- Update version + changelog

Per `_spine/shared-knowledge/code-review-standards.md` § Maintenance + each platform arm's `version.md`.

### Step 1.6: Set up monthly system retro

Calendar event: every month, ~30 minutes:
- What did the system catch this month? (review code review reports)
- What did it miss?
- New shortcodes needed?
- Process improvements?
- Update KB if patterns emerge

Per K5 (locked decision). Without this, the system stagnates.

---

## Layer 2: Per-developer setup (one-time per person)

Each developer follows this checklist on their machine. Estimated time: 30-45 minutes.

### Step 2.1: Install Claude Code

Per Anthropic's installation docs. After install:

```bash
claude --version
claude auth
```

### Step 2.2: Install VS Code

Download from code.visualstudio.com.

Install recommended extensions:
- Shopify Liquid
- ESLint
- Prettier
- Playwright Test for VS Code
- GitLens
- Error Lens
- markdownlint

For platform-specific work, also:
- (WordPress devs) PHPCS / PHP Intelephense
- (Magento devs) PHP Tools, Magento extension

### Step 2.3: Install Node.js LTS

From nodejs.org. Currently v22.x.

```bash
node --version
npm --version
```

### Step 2.4: Install Git + SSH setup

```bash
git --version
git config --global user.name "Your Name"
git config --global user.email "you@webdesksolution.ca"
```

Generate SSH key for GitHub:
```bash
ssh-keygen -t ed25519 -C "you@webdesksolution.ca"
# Add to GitHub → Settings → SSH and GPG keys
ssh -T git@github.com  # verify
```

### Step 2.5: Install platform CLIs (only for platforms you work on)

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

#### Magento (typically Docker)
Per Magento docs.

#### BigCommerce Stencil (if you work on BC)
```bash
npm install -g @bigcommerce/stencil-cli
stencil --version
```

### Step 2.6: Install Chrome + Claude in Chrome extension

1. Install Chrome from google.com/chrome
2. Install Claude in Chrome extension from Chrome Web Store
3. Sign in with your Anthropic account
4. Verify it loads in any tab

This is mandatory per the user's QA requirement. Claude in Chrome supplements Playwright for exploratory testing per `_spine/qa-agent/knowledge/07-claude-in-chrome-usage.md`.

### Step 2.7: Install testing tools

```bash
# Playwright (for QA Agent + manual testing)
npm install -g playwright
npx playwright install

# Lighthouse CI
npm install -g @lhci/cli
lhci --version

# Python (for some scripts)
python3 --version  # Should be 3.9+

# Pre-commit (Python-based)
pip install pre-commit
pre-commit --version
```

### Step 2.8: Clone the central skills repo

```bash
cd ~  # Or your preferred location
git clone git@github.com:webdesksolution/webdesk-skills.git
cd webdesk-skills
ls
# Should see: skills/, tools/, README.md, WALKTHROUGH.md, etc.
```

### Step 2.9: Configure Claude Code to read the skills

Path depends on your Claude Code version. Typical:

```bash
# Option A: Symlink (if Claude Code reads from ~/.claude/skills/)
ln -s ~/webdesk-skills/skills ~/.claude/skills

# Option B: Configure Claude Code to point to the skills directory
# (Check Claude Code settings for "skills directory" configuration)
```

Verify: in any Claude Code session, type:
```
Read the file at ~/webdesk-skills/skills/_spine/persona.md and confirm.
```

Claude should read it and confirm.

### Step 2.10: Set up Anthropic API key

Get your API key from Anthropic Console → API Keys.

```bash
# In ~/.zshrc or ~/.bashrc:
export ANTHROPIC_API_KEY="sk-ant-your-key-here"

source ~/.zshrc
echo $ANTHROPIC_API_KEY  # verify
```

Don't commit your key. Don't share it. If exposed, revoke + regenerate immediately.

### Step 2.11: Verify everything works

```bash
# Test Claude Code
claude  # Should start a session

# Test Shopify CLI
shopify version

# Test Lighthouse
lhci --version

# Test Playwright
npx playwright --version

# Test Python
python3 --version

# Test pre-commit
pre-commit --version
```

All should print versions without errors. If any fail, troubleshoot before moving on.

### Step 2.12: Done with per-developer setup

You're ready to work on projects.

For each new project, follow Layer 3 below.

---

## Layer 3: Per-project setup (every new project)

When starting a new client project:

### Step 3.1: Use the deployment guide

Follow `tools/docs/deployment-guide.md` step-by-step. 12 steps. Estimated time: 30-60 minutes per project.

Key milestones in that guide:
- Create / clone repo
- Configure branch protection
- Set up GitHub Secrets
- Configure GitHub Environments (for production approval)
- Copy GitHub Actions workflows
- Copy configs
- Initialize project workspace (`agency/project.json`)
- Set up local dev (Shopify CLI configured for this project)
- Test the setup

### Step 3.2: Begin project work

Open Claude Code. Type:

```
/start shopify redesign Aurora Skincare
```

Or for resuming:

```
/resume Aurora Skincare
```

The orchestrator takes over from there.

---

## Per-platform-specialist workflow

Per our locked decision: each developer specializes by platform. They install the SPINE plus their platform's skills.

### Shopify-specialist developer

Their `~/webdesk-skills/skills/` setup:
- `_contracts/` (always)
- `_spine/` (always)
- `shopify/` (their specialty)

They don't load `wordpress/`, `magento/`, etc. — those aren't needed for their work.

### WordPress-specialist developer (future when WP arm is built)

Same pattern:
- `_contracts/`
- `_spine/`
- `wordpress/`

### Cross-platform developers

If a developer works on multiple platforms, they have all relevant arms cloned. Claude Code loads only what's needed per project.

### Why this matters

Smaller context loaded = faster + cheaper. Shopify dev doesn't need WordPress knowledge in context.

The `skills/` folder structure makes this clean. Devs can ignore folders not relevant to them.

---

## Adding a new platform later

When you're ready to add WordPress (or any other platform):

1. The Phase 3 + 4 pattern is replicated for the new platform
2. Each platform has its own arm (`skills/wordpress/`)
3. Spine doesn't change
4. New platform arm gets its own owner (per E5)
5. Update the central skills repo

Estimated effort per new platform arm:
- Knowledge files: ~20-30 hours of writing + curation
- Real examples (3 reference sections): ~10-20 hours
- Per-platform configs: ~5-10 hours

Done by the platform's senior dev with Claude Code support.

---

## Maintenance + updates

### When skills update (central repo gets new commits)

Developers pull updates:

```bash
cd ~/webdesk-skills
git pull
```

Claude Code automatically picks up the new files on next session.

For significant updates (new platform arm, major version bump), broadcast to team:
> "Skills update: new WordPress arm added. Pull from main to get it. Changes documented in CHANGELOG."

### When project-specific knowledge emerges

If a project surfaces knowledge that's useful agency-wide:
1. Document in the project repo first
2. After project closes, distill the pattern
3. Propose addition to central skills repo
4. KB owner reviews + merges

Pattern feedback loop per K4.

### When platforms ship updates

Shopify ships new Online Store features every quarter. WordPress updates monthly. Etc.

KB owners track:
- Shopify changelog: https://shopify.dev/changelog
- WordPress release notes
- Magento release notes
- BigCommerce release notes

Quarterly review per K2 incorporates platform updates into KB.

---

## Cost expectations

Initial setup costs (one-time):
- Anthropic API setup: $0 (just configuration)
- Claude Code: subscription per developer (per Anthropic pricing)
- Claude in Chrome: free with Claude account
- VS Code: free
- Shopify CLI: free
- Other tools: free

Ongoing costs (per month):
- Anthropic API: $500-2,000/month depending on project volume
  - Per `tools/alerts/anthropic-spending-alerts.md` budget defaults
- Claude Code subscriptions: per Anthropic pricing per developer
- Optional: paid CI services (most free tiers sufficient)

Per project: $20-260 in API costs (small to large/complex).

For a 6-15 person team running 30-50 projects/year:
- Annual API spend: roughly $5,000-15,000
- Compared to project values: marginal (typically <2% of project value)

---

## Troubleshooting common setup issues

### "Claude Code can't read the skills folder"

Check:
- Path is correct (`~/webdesk-skills/skills/` or wherever you cloned)
- Symlink is correct (`ls -la ~/.claude/skills` should show the symlink)
- Claude Code settings configured correctly
- File permissions allow Claude Code to read

### "Shopify CLI says 'invalid token'"

Token expired or wrong scopes:
- Shopify Admin → Apps → Develop apps → your app → Uninstall + Reinstall
- Generate new theme access token
- Update `SHOPIFY_CLI_THEME_TOKEN` in your `.env`

### "GitHub Actions don't run"

- Verify workflow files are in `.github/workflows/` (not `.github/workflow/` — common typo)
- Verify secrets are configured
- Verify branch protection allows workflow to run

### "Code Review Agent doesn't post on PR"

- Verify `ANTHROPIC_API_KEY` secret is set in GitHub
- Check `.github/scripts/run-code-review.py` exists and is executable
- Check GitHub Actions logs for the code-review workflow run

### "Pre-commit hooks aren't running"

- Did you run `pre-commit install` in the repo?
- Verify `.pre-commit-config.yaml` exists in repo root
- Verify `pre-commit --version` works

### "Lighthouse CI fails"

- Verify preview URL works manually (open in browser)
- Verify `SHOPIFY_STORE_URL` doesn't include `https://`
- Verify `SHOPIFY_DEV_THEME_ID` is correct (from `shopify theme list`)

### "Claude in Chrome not loading"

- Check extension is installed AND signed in
- Try refreshing the tab
- Some restricted URLs are blocked by Chrome (e.g., chrome:// pages)

For more detailed troubleshooting per tool: see the tool's own documentation.

---

## Validation checklist

Before declaring setup complete:

### Workspace-level
- [ ] Central skills repo created + pushed to GitHub
- [ ] Anthropic workspace configured with spending alerts
- [ ] Owners assigned for spine + each platform arm
- [ ] Quarterly KB review scheduled
- [ ] Monthly system retro scheduled

### Per-developer
- [ ] Claude Code installed + authenticated
- [ ] VS Code installed with recommended extensions
- [ ] Node.js LTS installed
- [ ] Git configured
- [ ] Platform CLIs installed (only the ones you work on)
- [ ] Chrome + Claude in Chrome extension installed
- [ ] Playwright + Lighthouse CI installed
- [ ] Pre-commit installed
- [ ] Skills repo cloned
- [ ] Claude Code can read the skills folder
- [ ] Anthropic API key configured in environment

### Per-project (per the deployment guide)
- [ ] Repo created with branch protection
- [ ] GitHub Secrets configured
- [ ] GitHub Environments configured (for production)
- [ ] Workflows copied to `.github/workflows/`
- [ ] Configs copied to project root
- [ ] CODEOWNERS file customized with real usernames
- [ ] Pre-commit hooks installed
- [ ] agency/ workspace initialized
- [ ] Test PR workflow verified (theme push + code review + Lighthouse + axe all run)

---

## You're done. Now what?

Once everything's set up:

1. Read `WALKTHROUGH.md` if you haven't (covers how the system works conceptually)
2. Read `tools/docs/shortcodes.md` (commands you'll use day-to-day)
3. Skim `_spine/persona.md` (operating contract — read this in full when you have time)
4. Start your first project: `/start shopify redesign [Client Name]`
5. The orchestrator guides from there

---

## Questions during setup

If something doesn't work as documented:
1. Check the troubleshooting section above
2. Check the relevant tool's documentation
3. Ask the spine owner (per E5)
4. Surface at next Monthly System Retro for documentation update

The setup instructions should be accurate. If they're not, that's a documentation bug — fix it in the central repo so the next person doesn't hit the same issue.

---

Last reviewed: 2026-05-25 by Claude (initial)
Next review due: 2026-08-25
