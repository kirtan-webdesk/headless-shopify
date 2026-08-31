---
tier: 2
load_when: ["agent-specific-detail"]
description: "Per F13: post-deploy health check + auto-rollback if failed. Manual rollback also available. Defined trigger conditions. Authorized approvers. Communication plan."
---

# 03 — Rollback Procedure

> Per F13: post-deploy health check + auto-rollback if failed. Manual rollback also available. Defined trigger conditions. Authorized approvers. Communication plan.

---

## Health check (runs T+5 to T+30 minutes post-publish)

### Critical checks

These must ALL pass within 5 minutes of publish completion:

```
1. Homepage responds with HTTP 200 (not 500, 502, 404)
2. Homepage has expected content (not maintenance page, not error page)
3. Homepage Time to First Byte < 2 seconds
4. Add-to-cart endpoint responds correctly (test product → cart)
5. Cart page loads with item added
6. Checkout link/button reaches checkout page
7. Checkout page loads payment options
8. Analytics events firing (verify in real-time dashboard within 5 minutes)
9. Critical integrations responding (Klaviyo webhook test, GA4 events, etc.)
10. No JavaScript console errors on homepage (P1 errors)
11. SSL certificate valid + HTTPS enforced
12. No mixed content warnings
```

### Health check execution

```python
def post_deploy_health_check():
    results = {
        "checks": [],
        "overall_status": "PASS"
    }

    # Run all 12 checks
    for check_name, check_function in HEALTH_CHECKS:
        result = check_function()
        results["checks"].append({
            "name": check_name,
            "status": "PASS" or "FAIL",
            "details": result.details,
            "checked_at": datetime.now()
        })
        if result.status == "FAIL":
            results["overall_status"] = "FAIL"

    # If ANY critical check fails, trigger rollback
    if results["overall_status"] == "FAIL":
        trigger_rollback(reason=f"Health check failed: {failed_check_names}")
    else:
        proceed_to_post_launch_monitoring()

    log_to_audit("health_check_completed", results)
    write_to_file(f"/projects/[client]/health-check-[YYYY-MM-DD].md", results)
```

### Health check report format

```markdown
# Post-Deploy Health Check — [Project Name]

**Project:** [Project Name]
**Launched at:** [timestamp]
**Health check started:** [timestamp]
**Health check completed:** [timestamp]
**Status:** PASS | FAIL

## Critical Checks

| # | Check | Status | Details |
|---|-------|:------:|---------|
| 1 | Homepage HTTP 200 | ✓ | Response time: 340ms |
| 2 | Homepage content correct | ✓ | Verified key text + images present |
| 3 | TTFB < 2s | ✓ | TTFB: 340ms |
| 4 | Add to cart works | ✓ | Test product added successfully |
| 5 | Cart page loads | ✓ | Cart displays added item |
| 6 | Checkout link works | ✓ | Reaches checkout |
| 7 | Checkout page loads | ✓ | Payment options visible |
| 8 | Analytics events firing | ✓ | GA4 received pageview within 2 min |
| 9 | Critical integrations | ✓ | Klaviyo, Judge.me, GA4 all responding |
| 10 | No console errors | ✓ | Zero P1 console errors |
| 11 | SSL valid | ✓ | A+ rating from SSL Labs |
| 12 | No mixed content | ✓ | All resources HTTPS |

## Overall: PASS

Health check passed. Proceeding to post-launch monitoring activation.

Next steps:
- [✓] Activate synthetic monitoring
- [✓] Activate RUM data collection
- [✓] Notify internal team of successful launch
- [✓] Communicate launch success to client (via Internal PM)
- [✓] Begin 24-hour stability watch
```

If FAIL:

```markdown
## Overall: FAIL

Health check FAILED. Initiating ROLLBACK.

Failed checks:
- Check #4 (Add to cart): Cart API returned 500. Investigation needed.

Rollback authority notified: [Name]
Rollback execution: [in progress]
```

---

## Automatic rollback (F13)

When health check fails, rollback runs automatically:

```python
def trigger_rollback(reason):
    log_to_audit("rollback_initiated", {"reason": reason})

    # Set project status
    update_project_json({
        "project.status": "launching",  # Paused mid-launch
        "active.blocked_on": f"Rollback in progress: {reason}"
    })

    # Notify rollback authority (do NOT auto-proceed; require human approval for actual rollback)
    notify_rollback_authority(reason)

    # Wait for explicit GO ROLLBACK command from authority
    # Do NOT auto-execute the actual rollback
```

**Important nuance:** Per the conservative approach in F13, automatic rollback IDENTIFIES the need + alerts. Actual rollback EXECUTION requires human GO command. This prevents false-positive rollbacks (e.g., a transient 500 from one slow request).

The human rollback authority has 10 minutes to decide:
- GO ROLLBACK → execute rollback procedure
- INVESTIGATE → pause, dig in, decide within 10 minutes
- ABORT ROLLBACK → false alarm, keep current version (must document why)

If no decision in 10 minutes, rollback is escalated to backup approver.

---

## Manual rollback procedure

If rollback is needed (auto-triggered or manually decided):

### Shopify rollback

```bash
# Identify the backup theme
shopify theme list --store [store-domain]
# Find the backup: "Aurora Skincare - Backup [YYYY-MM-DD]"
# Note the theme ID

# Publish the backup (makes it the live theme)
# Method A: via CLI
shopify theme publish --theme [backup-theme-id]

# Method B: via Admin
# Themes → Library → backup theme → Actions → Publish

# Verify
shopify theme list --store [store-domain]
# Backup should now have role: 'main'
# Previous "new" theme should now be unpublished

# Verify live site reverted
curl -I https://[store-domain]
# Check that response indicates backup version
```

### WordPress rollback

```bash
# Method varies by deployment approach

# A. If using staging/production sync:
# Restore from BlogVault/UpdraftPlus backup
# Or restore database + files from manual backup

# B. If code-only deployment:
git revert [commit-sha]
git push production main

# C. If complete restoration needed:
wp db import backup-pre-launch-[YYYY-MM-DD].sql
tar -xzf wp-backup-pre-launch-[YYYY-MM-DD].tar.gz -C /var/www/html/
wp cache flush
```

### Magento rollback

```bash
# Restore from backup
bin/magento setup:rollback --db-file=backup-[date].sql

# If code changes need rolling back:
git revert [commit-sha]
bin/magento setup:upgrade
bin/magento setup:di:compile
bin/magento setup:static-content:deploy
bin/magento cache:flush
```

### BigCommerce rollback

```bash
# Re-activate previous theme
stencil push -t [backup-theme-id] --activate

# Or via Admin: Themes → previous theme → Apply
```

### Node.js / Headless rollback

```bash
# Vercel: instant rollback to previous deployment
vercel rollback [previous-deployment-url]

# Cloudflare Pages: re-deploy from previous git tag
git checkout production-pre-launch-[YYYY-MM-DD]
wrangler pages deploy [dist-dir]
git checkout main

# Custom: re-deploy previous version from CI/CD
# Trigger CI/CD with explicit tag/commit
```

---

## Post-rollback verification

After rollback executed:

```
[ ] Live URL serves the BACKUP version (not the failed version)
[ ] CDN purged if applicable
[ ] Homepage loads correctly
[ ] Cart works
[ ] Checkout works
[ ] Analytics still firing (backup version's tracking)
[ ] No new console errors
[ ] All integrations working (per backup version's setup)
```

If post-rollback verification PASSES, system is in safe state.
If post-rollback verification FAILS, this is a major incident. Escalate to delivery lead + senior dev on-call.

---

## Rollback log

Generated at `/projects/[client]/rollback-log-[YYYY-MM-DD].md`:

```markdown
# Rollback Log — [Project Name]

**Project:** [Project Name]
**Launch attempt:** [YYYY-MM-DD HH:MM]
**Rollback initiated:** [timestamp]
**Rollback completed:** [timestamp]
**Duration:** [N] minutes
**Authorized by:** [name + role]

## Trigger
[What caused rollback - which health check failed, what symptoms observed]

## Rollback Actions
1. [Time] — Health check #N failed: [details]
2. [Time] — Rollback authority notified
3. [Time] — GO ROLLBACK command received from [name]
4. [Time] — Backup theme published (Shopify) / DB restored (WP) / etc.
5. [Time] — Post-rollback verification started
6. [Time] — Post-rollback verification passed

## Verification After Rollback
[ ] Live URL serves backup
[ ] All critical functions work
[ ] No new errors

## Root Cause Analysis (initial)
[Why did the launch fail? Initial hypothesis to be confirmed by investigation]

## Lessons Learned (post-incident)
[Updated after investigation completes]

## Communication
- Internal team notified: [time]
- Client notified: [time]
- Status page updated: [time]

## Next Steps
- [ ] Full root cause analysis
- [ ] Fix the issue in develop branch
- [ ] Re-run full QA
- [ ] Re-attempt launch (no earlier than [N] days later)
```

---

## When NOT to rollback

Rollback is the right call most of the time, but not always.

### Don't rollback when:
- **Transient issue:** 30-second blip in analytics → wait 5 minutes, re-check, likely resolves
- **Single-source error:** One slow page from one geographic region → investigate, may be CDN issue
- **Cosmetic issue:** Minor visual glitch → P3/P4, fix in next sprint, not rollback
- **Third-party temporary outage:** Klaviyo down for 10 minutes → not our deploy's fault, wait

### Do rollback when:
- **Site completely down or showing errors to all users**
- **Checkout broken (transactions can't complete)**
- **Major data integrity issue** (orders not saving, customer data exposed)
- **Critical SEO issue** (entire site noindexed accidentally)
- **Security vulnerability accidentally exposed**
- **Performance regression so severe site is effectively unusable**

When in doubt, lean toward rollback. The backup is there for a reason.

---

## Rollback authority

Who can authorize rollback (per project, named in `project.json.assigned_team`):

1. **Delivery Head** (primary) — designated for this project
2. **Tech Lead** (backup) — if Delivery Head unavailable
3. **PM Lead** (escalation) — if both above unavailable

Rollback authority is the human who says "GO ROLLBACK." Delivery Head Agent does not auto-execute rollback; it identifies the need and waits for human GO.

---

## Communication during rollback

While rollback executes, communicate:

### Internal team (first)
- Slack channel: announce rollback initiated
- Reason and ETA
- On-call confirmed engaged

### Client (within 30 minutes)
- Internal PM contacts client
- Plain language: "We detected an issue immediately after launch and have reverted to the previous version. The site is fully functional. We're investigating the cause and will be back with a launch plan within 24 hours."
- Don't blame anyone. Don't speculate. State facts.

### Status page (if applicable)
- If client has a status page (statuspage.io, etc.), update it
- "Site is operating normally on the previous version. We're investigating an issue that prevented the latest release."

### Post-rollback follow-up
- Internal team: post-mortem scheduled within 48 hours
- Client: detailed incident report within 24 hours
- Stakeholders informed of new launch plan

---

## Backup retention

Keep backups for:

```
Pre-launch backup: retain 90 days after launch
Per-sprint snapshots in project.json.versions/: retain entire project lifetime
Pre-rollback state: retain 90 days after rollback
Monthly backups (post-launch): retain 12 months
```

After retention period, can be moved to cold storage, not deleted.

---

## Anti-patterns

1. **No backup retained.** F12 hard rule violation. Re-verify backup before every launch.

2. **Automatic rollback without human approval.** False positives waste time + erode trust. Identify + alert + wait for human.

3. **Rollback without verification.** Restoring backup that's also broken = bigger problem. Verify backup works during pre-launch.

4. **Rollback authority unavailable.** Always have primary + backup. Both should be reachable for at least 4 hours post-launch.

5. **No communication plan.** Silence during incident = panic. Internal first, client within 30 min, status page if applicable.

6. **Skipping post-mortem.** Every rollback is a learning opportunity. Capture lessons in KB updates.

7. **Re-launching immediately after rollback.** Take a beat. 24 hours minimum. Identify root cause. Fix properly. Re-QA.

---

Last reviewed: 2026-05-24 by Claude (initial)
Next review due: 2026-08-24
