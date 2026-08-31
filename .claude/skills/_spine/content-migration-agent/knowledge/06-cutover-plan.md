---
tier: 2
load_when: ["agent-specific-detail"]
description: "The runbook for moving from source platform to target platform. Sequenced. Communicated. Rollback-ready."
---

# 06 — Cutover Plan

> The runbook for moving from source platform to target platform. Sequenced. Communicated. Rollback-ready.

---

## What cutover is

The moment the target platform becomes the live, customer-facing system. Source platform either:
- Stays read-only for reference (typical)
- Decommissioned (after a retention period)
- Continues for a parallel period (rare, for high-risk migrations)

Cutover is high-risk. Plan carefully. Rehearse. Communicate.

---

## Cutover phases

```
T-30 days  → Pre-cutover preparation
T-7 days   → Final data sync
T-2 days   → Final verification + rehearsal
T-0        → Cutover execution
T+1 hour   → Verification
T+24 hours → Stability watch
T+7 days   → Post-cutover SEO + tracking review
T+30 days  → Source decommission decision
```

---

## T-30 days: Pre-cutover preparation

```
[ ] Migration largely complete (initial full migration done)
[ ] Field mapping approved + parity verification passing on sample + initial full audit
[ ] Redirect map generated + verified on staging
[ ] Customer communication strategy approved
   - Password reset email drafted
   - Migration announcement drafted (if customer-facing)
   - Subscription re-authorization flow (if applicable)
[ ] DNS strategy decided
   - Same domain (most common — DNS doesn't change)
   - New domain (rare, requires DNS update + change of address in GSC)
[ ] Cutover window scheduled
   - Lowest-traffic time for client's market
   - Confirmed with Internal PM + Client
[ ] On-call team confirmed
[ ] Rollback plan documented
[ ] Source platform retention plan decided
   - Read-only for N months (typical 3-6 months)
   - Decommission after that
```

---

## T-7 days: Final data sync

Source data continues to change between initial migration and cutover. The sync catches up.

```
[ ] Sync any new/updated data since initial migration:
   - New customers
   - New orders
   - New reviews
   - Customer profile updates
   - Inventory updates
[ ] Re-run parity verification on synced data
[ ] Verify no data drift in already-migrated records
   - If source records have changed: decide overwrite vs leave as-is
   - Typical: overwrite if source change is post-migration but pre-cutover
[ ] Generate "delta migration report"
```

---

## T-2 days: Final verification + rehearsal

```
[ ] Final parity verification (Level 1, 2, 3 per `03-parity-verification.md`)
[ ] All redirects verified on staging environment
[ ] Cutover runbook reviewed by team
[ ] Cutover REHEARSAL on staging
   - Walk through every step (without executing on live)
   - Identify any gaps
[ ] Communication ready to send
   - To customers (announcement)
   - To internal team (cutover notice)
[ ] Status page configured (if applicable)
   - "Scheduled maintenance" notice if downtime expected
```

---

## T-0 (cutover): Execution

### T-30 minutes: Pre-cutover checks

```
[ ] All team on Slack channel, ready
[ ] Source platform put into READ-ONLY mode (no new data accepted)
[ ] Final delta sync executed
[ ] Final parity verification (Level 1 + critical Level 3)
[ ] All redirects ready on target
[ ] DNS TTL lowered 24-48h ago (so DNS changes propagate fast if needed)
```

### T-0: Execute cutover

For same-domain cutover (DNS doesn't change):
```
1. Switch target platform to "production" mode (if it was staging)
2. Update DNS to point to target platform (if applicable)
3. Activate redirects on target platform
4. Customer-facing message: "We're live!" (or whatever planned)
```

For new-domain cutover (rare):
```
1. Activate target on its new domain
2. DNS for OLD domain redirects to NEW domain (301 entire domain)
3. Submit Change of Address in Google Search Console
4. Submit Change of Address in Bing Webmaster Tools
5. Update all marketing/social links to new domain
```

### T+1 to T+15 minutes: Initial verification

```
[ ] Target live URL responds correctly
[ ] Homepage loads
[ ] Cart functions
[ ] Checkout reaches payment step
[ ] Test order placed successfully
[ ] Test customer login works (or password reset triggered)
[ ] Critical pages load (PDP, PLP, category, blog)
[ ] Spot-check redirects: 10 random source URLs
[ ] Analytics receiving events
[ ] Integrations responding (Klaviyo, etc.)
```

### T+15 to T+60 minutes: Active monitoring

```
[ ] Monitor synthetic monitoring (UptimeRobot or similar)
[ ] Monitor error rates
[ ] Customer service standing by for inquiries
[ ] Status page updated to "operational"
[ ] Send customer notification (if planned)
   - Migration announcement
   - Password reset email (timed to allow time to read announcement first)
```

### Cutover communication

```
Internal Slack (real-time):
- T-30: "Pre-cutover checks starting"
- T-15: "Going ahead with cutover"
- T-0: "Cutover executed"
- T+5: "Initial verification: PASS"
- T+15: "Active monitoring engaged"
- T+30: "All systems verified"

Customer-facing (timed):
- T+30 minutes: "We've upgraded!" announcement email
- T+1 hour: Password reset email (separate, with reset link)
- T+24 hours: Follow-up email if any issues reported
```

---

## T+24 hours: Stability watch

```
[ ] Synthetic monitoring: any alerts?
[ ] Customer service: spike in tickets?
[ ] Analytics: traffic patterns normal? (factoring in time-of-day)
[ ] Conversion rate: in expected range?
[ ] Lighthouse on key pages: scores acceptable?
[ ] Search Console: any crawl errors?
[ ] Integrations: all firing correctly?
[ ] Password reset emails: open rate, click rate (early signal)
```

If anomalies: investigate. If no anomalies: stand down on-call.

---

## T+7 days: Post-cutover SEO + tracking review

```
[ ] Google Search Console:
   - Crawl errors trending toward 0?
   - Pages indexed: growing?
   - Old sitemap removed, new sitemap submitted?
   - Change of address (if applicable) processed?
[ ] Bing Webmaster Tools: same checks
[ ] Organic traffic vs pre-launch baseline:
   - Expected: short dip
   - Recovery trajectory
[ ] Direct + paid traffic: stable (these shouldn't be affected by migration)
[ ] Subscription re-authorization rate (if subs migrated):
   - X% of customers re-authorized
   - Plan follow-up for non-converters
[ ] Customer service ticket trends
   - Spike in week 1 expected (some confusion)
   - Should taper toward baseline by week 2-3
```

---

## T+30 days: Source decommission decision

After 30 days of stability:

```
[ ] Source platform: all data migrated and verified?
[ ] No outstanding customer questions about old data?
[ ] All subscriptions re-authorized?
[ ] All redirects working?
[ ] SEO recovery on track?

If YES to all:
- Source can be moved to read-only / archive mode
- Keep accessible for reference for 6-12 months

If NO:
- Address open items
- Decision deferred 30 days
```

---

## Rollback plan (per F13)

If cutover fails:

### Decision criteria (when to roll back)

Trigger rollback if:
- Target platform completely broken (site down)
- Critical functionality failed (checkout broken with no fix)
- Data integrity issue discovered (large-scale data loss)
- Performance catastrophic (site unusable)

Do NOT roll back for:
- Minor visual issues (P3/P4)
- Single integration not firing (most can be re-fixed)
- Slight performance regression
- Customer service confusion (expected)

### Rollback execution

```
1. Revert DNS to source platform (if DNS changed)
2. Mark target platform "in maintenance"
3. Source platform: re-enable write mode
4. Customer message: "We've reverted while we investigate"
5. Investigate, fix, plan re-cutover (minimum 7 days later)
```

Rollback authority: per `_spine/delivery-head/knowledge/03-rollback-procedure.md`.

---

## Migration log (final)

After cutover stable for 30 days, Content & Migration Agent generates final migration log:

`/projects/[client]/migration/migration-log.md`:

```markdown
# Migration Log — [Client Name]

**Source platform:** [name + version]
**Target platform:** [name + version]
**Migration started:** [date]
**Cutover executed:** [date]
**Stability confirmed:** [cutover + 30 days]

## Summary

[2-3 sentences of the migration outcome]

## Data Migrated

| Data type | Source count | Target count | Variance | Status |
|-----------|-------------:|-------------:|---------:|:------:|
| Products | 2,847 | 2,847 | 0% | ✓ |
| Customers | 12,453 | 12,441 | -0.10% | ✓ (duplicates merged) |
| Orders | 24,891 | 24,891 | 0% | ✓ |
| Reviews | 4,892 | 4,892 | 0% | ✓ |
| Blog posts | 124 | 124 | 0% | ✓ |
| Subscriptions | 245 | 245 (re-auth rate 82%) | -- | ⚠ ongoing |

## URL Redirects

- Total redirects: 1,247
- All single-hop ✓
- Tested + verified pre-cutover
- Post-cutover crawl: 100% resolve correctly

## SEO Impact (30-day post-cutover)

- Pages indexed: 1,180 / 1,247 (95%) — expected, some will index slower
- Organic traffic: 92% of pre-launch baseline (recovering, +10% week-over-week)
- Search Console: 0 critical errors
- Change of Address: not applicable (same domain)

## Customer Impact

- Password reset emails sent: 12,441
- Reset completed within 30 days: 9,234 (74%)
- Customer service tickets related to migration: 387 (week 1), 89 (week 2), 23 (week 3), 12 (week 4)

## Issues Encountered + Resolutions

[List any issues + how resolved]

## Lessons Learned

[Specific takeaways for future migrations]

## Source Decommission Plan

- Source platform retained read-only for 12 months from cutover
- Final decommission: [date + 12 months]
- Data archive stored at: [secure location]

---

Migration confirmed complete.
```

---

## Cutover anti-patterns

1. **Cutover on Friday afternoon.** Weekend chaos if anything breaks.

2. **No rehearsal.** First time walking through = mistakes.

3. **No rollback plan.** "It'll work" → it doesn't → no plan B.

4. **DNS TTL still high.** Changes take hours to propagate. Lower TTL 24-48 hours BEFORE cutover.

5. **No source read-only mode.** New data written to source during cutover = data loss.

6. **Customer communication missing or late.** Customers confused → angry → leave.

7. **No subscription migration plan.** Active recurring revenue customers don't re-authorize → revenue loss.

8. **Source decommissioned too early.** Reference data lost. Wait minimum 6-12 months.

9. **No SEO monitoring post-cutover.** Don't notice traffic decline until it's a big problem.

---

Last reviewed: 2026-05-24 by Claude (initial)
Next review due: 2026-08-24
