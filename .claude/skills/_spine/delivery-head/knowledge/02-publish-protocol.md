---
tier: 2
load_when: ["agent-specific-detail"]
description: "How to push code to live. Backup is mandatory (F12). No exceptions."
---

# 02 — Publish Protocol

> How to push code to live. Backup is mandatory (F12). No exceptions.

---

## Pre-publish requirements (all must be true)

```
[X] G6 (pre-launch gate) confirmed by human (Delivery Head + Client via Internal PM)
[X] Pre-launch checklist 100% verified or explicitly N/A
[X] Zero P1/P2 bugs open
[X] Project verification PASS (READY_FOR_LAUNCH from PM Agent)
[X] Backup procedure ready
[X] Rollback procedure ready (per `03-rollback-procedure.md`)
[X] Launch window scheduled (per `06-launch-day-runbook.md`)
[X] All approvers + on-call personnel notified
[X] Synthetic monitoring configured (will activate post-launch)
[X] Post-launch communication plan ready
```

If any item fails, **publish does NOT execute.** Delivery Head halts and surfaces.

---

## Step 1: Create live theme backup (MANDATORY)

Per F12, this is non-skippable. Agent will refuse to publish without this.

### Shopify
```bash
# Identify current live theme
shopify theme list --store [store-domain]
# Find the role: 'main'

# Duplicate the live theme as backup
# (Done via Shopify Admin → Themes → Actions → Duplicate)
# Naming convention: "[Original Name] - Backup [YYYY-MM-DD]"

# Alternative via CLI (newer Shopify CLI versions):
shopify theme duplicate --store [store-domain] --theme [live-theme-id] \
  --name "[Original Name] - Backup [YYYY-MM-DD]"

# Verify backup exists
shopify theme list --store [store-domain]
# Confirm new backup theme is listed with role: 'unpublished'
```

### WordPress (via WP-CLI or backup plugin)
```bash
# Backup database
wp db export backup-pre-launch-[YYYY-MM-DD].sql

# Backup files
tar -czf wp-backup-pre-launch-[YYYY-MM-DD].tar.gz wp-content/ wp-config.php

# Store backups in secure location
# (Backup plugin like UpdraftPlus can automate this)
```

### Magento
```bash
# Backup database
bin/magento setup:backup --db

# Backup files (Magento 2 supports both)
bin/magento setup:backup --code --media

# Backup files stored in var/backups/
ls -la var/backups/
```

### BigCommerce
```bash
# Use BC Stencil CLI to download current theme
stencil pull -t [theme-id]

# OR use BC Admin to download theme as ZIP
# Store in version control + secure cloud storage
```

### Node.js / Headless
```bash
# For Vercel deployments
vercel deploy --prebuilt  # Note current deployment URL

# Or maintain git tags for production deployments
git tag production-pre-launch-[YYYY-MM-DD] [commit-sha]
git push origin production-pre-launch-[YYYY-MM-DD]
```

### Backup verification

After backup created, Delivery Head verifies:

```
[ ] Backup file/theme exists at expected location
[ ] Backup is accessible (not corrupted)
[ ] Backup size is reasonable (not 0 bytes)
[ ] Backup name follows convention: "[Project] Backup [YYYY-MM-DD]"
[ ] Backup naming includes date for rollback identification
[ ] Backup access permissions correct (only authorized personnel can restore)
```

Backup record written to `/projects/[client]/backup-record-[YYYY-MM-DD].md`:

```markdown
# Backup Record — Pre-Launch [Date]

**Project:** [Project Name]
**Date:** [YYYY-MM-DD HH:MM Timezone]
**Created by:** [Delivery Head Agent + Internal PM]
**Trigger:** Pre-publish protocol

## Backup Details

- **Platform:** Shopify
- **Backup type:** Theme duplication
- **Original theme:** Aurora Skincare (ID 111111111, role: main)
- **Backup theme name:** Aurora Skincare - Backup 2026-06-20
- **Backup theme ID:** 222222222
- **Backup role:** unpublished
- **Verified at:** [timestamp]

## Backup Verification
- [✓] Backup exists in theme list
- [✓] Backup size matches (verified via theme assets count)
- [✓] Backup accessible via admin
- [✓] Restoration tested (loaded backup theme in dev preview)

## Rollback Window
- **Backup retained until:** [Date + 90 days from launch]
- **Rollback authority:** [Internal PM name + backup approver]

## Audit log entry
- Logged: 2026-06-20T14:32:00Z — backup_created
```

---

## Step 2: Final sanity checks

Before publish, run these:

```
[ ] Develop branch is at the commit you intend to publish (no drift)
[ ] Staging theme reflects the intended state (visual + functional check)
[ ] Production environment ready (DNS, SSL, hosting all healthy)
[ ] No active maintenance windows on platform side
   (e.g., Shopify scheduled maintenance)
[ ] Team is available for next 4 hours (in case of issues)
[ ] Communication channels open (Slack, phone)
```

Surface any concerns. Halt if any are uncertain.

---

## Step 3: Execute publish

### Shopify
```bash
# Option A: Push from local to live theme + publish
shopify theme push \
  --store [store-domain] \
  --theme [live-theme-id] \
  --path . \
  --nodelete  # Don't delete files not in local

# Then publish (if previously unpublished theme)
shopify theme publish --theme [theme-id]

# Option B: Via GitHub Actions (preferred — auditable)
# Merge to main branch with required reviewer approval
# .github/workflows/live-publish.yml handles push + publish
# Triggered by tag: production-launch-[YYYY-MM-DD]
```

### WordPress
```bash
# Method varies by deployment approach:

# A. If staging → production sync:
# Use migration plugin (BlogVault, WP Migrate DB Pro)

# B. If deploying code only (DB stays):
git push production main  # Push code to production server
# Run any DB migrations needed (be careful)
wp cache flush
```

### Magento
```bash
# In production, after staging is verified:
# Pull code on production server
git pull origin main

# Compile + deploy
bin/magento maintenance:enable
bin/magento setup:upgrade
bin/magento setup:di:compile
bin/magento setup:static-content:deploy
bin/magento cache:flush
bin/magento indexer:reindex
bin/magento maintenance:disable
```

### BigCommerce
```bash
# Upload theme via Stencil CLI
stencil push -t [target-theme-id] --activate

# Or via admin: Themes → Upload → Apply
```

### Node.js / Headless
```bash
# Deploy via platform-specific method

# Vercel
vercel deploy --prod

# Cloudflare Pages
wrangler pages deploy [dist-dir]

# AWS / Custom
# Follow your deployment pipeline (CI/CD trigger)
```

---

## Step 4: Verify publish succeeded

Immediately after publish command completes:

```
[ ] Publish command exited without error
[ ] Live URL responds (HTTP 200)
[ ] Live URL serves new version (not cached old version)
[ ] CDN purged (if applicable, to ensure new version served)
[ ] DNS unchanged (or if changed, new DNS resolves correctly)
```

If any check fails, immediately move to rollback (per `03-rollback-procedure.md`).

---

## Step 5: Run post-deploy health check

Per F13. Within 5 minutes of publish.

See `03-rollback-procedure.md` § Health Check for full protocol.

Critical checks:
- Homepage loads with correct content
- Cart adds product successfully
- Checkout reaches payment step
- Analytics receiving events
- Critical integrations responding

If health check passes → proceed to post-launch monitoring activation.
If health check fails → automatic rollback.

---

## Step 6: Activate monitoring

Per `07-post-launch-monitoring.md`. After health check passes.

- Synthetic monitoring active (UptimeRobot or similar)
- Real user monitoring data collection begins
- On-call personnel notified that launch is complete
- Continuous monitoring for first 24-48 hours

---

## Step 7: Notify stakeholders

After successful publish + health check:

1. Update audit log: `launch_completed`
2. Update project.json: `project.status = "delivered"`
3. Generate post-launch Go-Live update (PM Agent J3 template #7)
4. Internal PM notifies client of successful launch
5. Internal team notified via standard channels

---

## Publish runbook (per project)

Generated per launch at `/projects/[client]/launch-runbook.md`:

```markdown
# Launch Runbook — [Project Name]

**Launch target:** [YYYY-MM-DD HH:MM Timezone]
**Launch lead:** [Name]
**On-call dev:** [Name]
**On-call QA:** [Name]
**Rollback authority:** [Name + backup]

## Pre-launch (T-24 hours)

- [ ] Pre-launch checklist 100% verified
- [ ] G6 confirmed by Delivery Head + Client
- [ ] Backup created and verified
- [ ] Rollback procedure documented and ready
- [ ] Launch window confirmed (no platform maintenance)
- [ ] Team notified, all on-call

## Launch sequence (T-0)

### T-30: Final sanity checks
- [ ] Develop branch at intended commit
- [ ] Staging matches production-ready state
- [ ] No P1/P2 bugs open

### T-15: Final pre-publish
- [ ] Backup re-verified (still accessible)
- [ ] On-call team confirmed ready
- [ ] Communication channels open

### T-0: Execute publish
- [ ] Run publish command per platform
- [ ] Verify command success
- [ ] Verify live URL responds

### T+5: Post-deploy health check
- [ ] Homepage loads
- [ ] Cart functions
- [ ] Checkout reaches payment
- [ ] Analytics receiving events
- [ ] Integrations responding
- [ ] No console errors

### T+10: Activate monitoring
- [ ] Synthetic monitoring active
- [ ] RUM data collection begins
- [ ] On-call notification of launch complete

### T+15: Post-launch verification
- [ ] Spot-check 5 key pages (manual)
- [ ] Verify analytics in dashboards
- [ ] Verify integrations in dashboards
- [ ] Generate Go-Live update

### T+30: All-clear
- [ ] No alerts in monitoring
- [ ] No reports from on-call
- [ ] Internal PM communicates success to client
- [ ] Stand-down on-call team after 24h

## Rollback triggers

If ANY of these occur within first 30 minutes:
- Site down (HTTP 500) for > 5 minutes
- Checkout broken (no test transaction can complete)
- Critical SEO issue (entire site noindexed)
- Analytics not receiving events 15+ minutes after publish
- Multiple integration failures
- > 5 P1 bugs reported by users

→ Rollback executed by [Rollback authority] per `03-rollback-procedure.md`
```

---

## Anti-patterns

1. **Publishing without backup.** Hard rule. Refused by Delivery Head Agent.

2. **Publishing during peak hours.** Schedule launches during low-traffic windows (overnight in main market, weekday morning for B2B).

3. **Publishing on Friday.** No launches Friday afternoon. If something breaks, weekend recovery is harder.

4. **Publishing without on-call coverage.** If everyone is in a meeting or on vacation, who responds to alerts?

5. **Publishing immediately after G6 sign-off.** Take 30 minutes for sanity checks first. G6 confirms scope. Final checks confirm operational readiness.

6. **Skipping the health check.** Health check catches the "passes G6 but breaks in production" scenarios.

7. **Manual publish from local instead of CI/CD.** CI/CD provides audit trail + required reviewer enforcement. Use it.

---

Last reviewed: 2026-05-24 by Claude (initial)
Next review due: 2026-08-24
