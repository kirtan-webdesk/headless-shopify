---
tier: 2
load_when: ["agent-specific-detail"]
description: "The hour-by-hour playbook for launch day. Roles, timings, communication, contingencies."
---

# 06 — Launch Day Runbook

> The hour-by-hour playbook for launch day. Roles, timings, communication, contingencies.

---

## Launch day overview

A launch is a focused 2-4 hour event with preparation before and monitoring after. Treat it like a flight: pre-flight checks, takeoff, climb, cruise. Methodical.

```
T-7 days: Pre-launch readiness report sent to client
T-3 days: Final QA pass, backup created
T-1 day:  Launch dry-run on staging, communication scheduled
T-0:      Launch executes
T+24h:    Stability confirmed
T+7d:     7-day report
```

---

## Who's involved on launch day

### Required roles (named in `project.json.assigned_team`)

| Role | Responsibility on launch day |
|------|------------------------------|
| **Launch lead** (Delivery Head) | Orchestrates the launch, runs checklist, decides go/no-go |
| **On-call dev** | Available to fix issues that come up during launch window |
| **On-call QA** | Verifies post-launch, runs spot checks |
| **Internal PM** | Client-facing communication, decision authority on rollback |
| **Tech Lead (backup)** | Senior dev, backup for on-call dev, escalation point |

All five MUST be available for the launch window + 4 hours after.

### Notified roles

| Role | Notified pre-launch |
|------|---------------------|
| Designer | Aware, on call only for visual issues |
| Backend Lead | Aware, on call for integration issues |
| Sales / Account | Aware of launch + ready to receive feedback |

---

## Launch window selection

Default: avoid these times:

- **Friday afternoon** — weekend recovery is hard
- **Monday morning** — week starts with stress
- **Holiday eve** — same as Friday afternoon
- **Major platform maintenance window** — check Shopify/etc. status pages
- **Client's business peak** — don't launch retail on Black Friday morning, B2B on month-end, etc.

Good launch windows:

- **Tuesday or Wednesday morning** in client's primary timezone
- **Low-traffic window** for the client (use their analytics to find)
- **When all team members are available** (not vacation week)
- **Day with no other launches** for the agency (one at a time)

Specific timing varies by project type:
- **Ecommerce:** before peak buying hours (e.g., 9am EST for a US store)
- **B2B:** weekday morning, after coffee, before lunch
- **Content sites:** mid-morning weekday
- **High-traffic media:** lowest traffic hour (often 4-6am)

---

## T-7 days: Final approach

```
[ ] Send pre-launch readiness report to client
[ ] Confirm launch window with client
[ ] Confirm all team availability for launch window + 4h after
[ ] Finalize launch communication plan (Slack channels, status page if applicable)
[ ] Identify any blockers (open P1/P2, missing approvals)
```

---

## T-3 days: Final preparation

```
[ ] Final QA pass on staging (full module 1-8 sweep)
[ ] All P1/P2 bugs closed
[ ] All P3/P4 documented (resolved / known limitation / deferred)
[ ] Backup of current live theme created
[ ] Backup verified accessible
[ ] Synthetic monitoring configured (will activate post-launch)
[ ] Rollback procedure rehearsed (mental walkthrough by Delivery Head + Rollback Authority)
[ ] Launch runbook updated with final times
```

---

## T-1 day: Dry run

The launch dry-run is a real walkthrough of every step EXCEPT the actual publish command.

```
[ ] Verify pre-launch checklist 100% complete
[ ] Walk through publish protocol step-by-step (without executing)
[ ] Verify each team member knows their role
[ ] Confirm communication channels work (Slack, phone)
[ ] Confirm rollback authority + backup approver available
[ ] Re-verify backup still exists + accessible
[ ] Re-run health check on staging (to confirm it would work on live)
[ ] G6 status: confirmed
[ ] Internal PM: client confirmed launch time
```

If anything is uncertain at T-1 day, surface it. Don't push to launch with open questions.

---

## T-0 (launch hour): execute

### T-30 minutes: Pre-flight

```
[ ] All team on Slack channel + ready
[ ] On-call confirmed engaged
[ ] Backup re-verified (final check)
[ ] No active platform maintenance (Shopify status page, etc.)
[ ] No unexpected blockers
[ ] Communication channels open
```

If any check fails, halt and surface. Push launch by 24 hours if needed.

### T-15 minutes: Final go/no-go

Delivery Head announces in Slack:

```
═══════════════════════════════════════════════════════════
LAUNCH READINESS — T-15 MINUTES

Project: [Project Name]
Launch target: [time]

Status checks:
[✓] Pre-launch checklist: 100% verified
[✓] Backup: confirmed at [location]
[✓] On-call: [name], [name], [name]
[✓] Rollback authority: [name], available
[✓] Communication: this channel + [phone] for urgent

Final go/no-go decision:
GO from [Internal PM]
GO from [Tech Lead]
GO from [Delivery Head]

LAUNCH PROCEEDING.
═══════════════════════════════════════════════════════════
```

If any voice says NO-GO, halt. Reschedule.

### T-0: Execute publish

Per `02-publish-protocol.md` § Step 3.

Delivery Head:
1. Runs the publish command (Shopify theme publish, WP deploy, etc.)
2. Verifies command completion
3. Verifies live URL responds correctly
4. Announces in Slack: "Live theme published. URL: [URL]"

### T+1 to T+5 minutes: Initial verification

```
[ ] Live URL responds with HTTP 200
[ ] Live URL serves NEW version (not cached old version)
[ ] CDN purge complete (if applicable)
[ ] Homepage loads with new design
```

### T+5 to T+15 minutes: Health check

Per `03-rollback-procedure.md` § Health check.

Delivery Head runs the 12 critical checks. Announces results in Slack:

```
Health check complete. Status: PASS

All 12 critical checks passed:
✓ Homepage loads
✓ Cart adds product
✓ Checkout reaches payment
✓ Analytics receiving events
... etc

Proceeding to monitoring activation.
```

If FAIL → rollback procedure (per `03-rollback-procedure.md`).

### T+15 to T+30 minutes: Activate monitoring + initial communication

```
[ ] Synthetic monitoring active (UptimeRobot or similar)
[ ] RUM data collection started
[ ] Internal team notified of successful launch
[ ] Client notified via Internal PM
[ ] Launch day report drafted (per `04-client-report-template.md`)
[ ] Audit log entry: launch_completed
[ ] project.json.status = "delivered"
```

### T+30 minutes to T+4 hours: Active watch

Team stays available. Monitor for:
- Synthetic monitoring alerts
- Customer service inquiries
- Unexpected error rates
- Performance anomalies

Spot-check key flows manually every hour. Document anything notable.

---

## T+4 hours: Stand down on-call (if all clear)

If no alerts, no anomalies, no client concerns:

```
[ ] Stand down on-call team (back to normal availability)
[ ] Continue passive monitoring (synthetic + RUM)
[ ] 24-hour stability watch continues
[ ] Document any minor observations
```

---

## T+24 hours: First daily check-in

```
[ ] Review synthetic monitoring data (any alerts?)
[ ] Review RUM data (any patterns?)
[ ] Spot-check key pages (manual smoke test)
[ ] Check client communication channel for any reports
[ ] Send T+24 informal update to internal team
```

---

## T+7 days: 7-day report

Generated per `04-client-report-template.md` § 7-day post-launch report. Sent to client.

---

## Communication during launch

### Slack channel

Dedicated launch Slack channel. All status updates posted there in real-time.

Format:
```
[T-N] STATUS: [What just happened or check completed]
[T-N] ACTION: [What we're doing next]
[T-N] ALERT: [Anything unexpected]
```

### Phone

Phone number for urgent issues:
- Internal PM (primary)
- Tech Lead (backup)

Used only for:
- Site down
- Critical bug being missed
- Communication channels down

### Status page (optional)

If client maintains a status page:
- Pre-launch: "Scheduled maintenance" notice
- During launch: "In progress" update
- Post-launch: "Operational" status

### Client communication

Internal PM handles all client-facing communication.

- T-7 days: pre-launch readiness report
- T-1 day: confirmation message ("Launch tomorrow at [time]")
- T+0: launch announcement ("Live! Verification in progress")
- T+1 hour: confirmation of all clear ("All systems verified")
- T+24h: stability check-in
- T+7d: 7-day report

---

## Contingencies

### Scenario: Health check fails

→ Rollback per `03-rollback-procedure.md`. Document in rollback-log.md. Reschedule launch (minimum 24h later, after root cause + fix).

### Scenario: Platform issue (Shopify down, etc.)

→ Halt launch. Reschedule. Communicate to client.

### Scenario: Open P1/P2 discovered at T-15 min

→ Halt launch. Investigate. Fix or push launch.

### Scenario: Communication failure (Slack down, etc.)

→ Switch to phone. Internal PM and Tech Lead coordinate via call. Reschedule if extended.

### Scenario: Backup verification fails at T-30 min

→ HALT IMMEDIATELY. Recreate backup. Verify. Then proceed only when backup confirmed.

### Scenario: One team member unavailable (sick, emergency)

→ Tech Lead steps in for any role. If two roles uncovered, postpone.

### Scenario: Client requests last-minute changes at T-15 min

→ HALT. Discuss. Either incorporate (push launch) or defer to post-launch (proceed with original).

---

## Anti-patterns

1. **Launching when team is incomplete.** Roles matter. If anyone is missing, postpone.

2. **Skipping the dry run.** First time walking through is during the actual launch = mistakes.

3. **Launching with open P1/P2.** Hard rule. Refuse.

4. **No clear go/no-go.** Implicit "we're launching now" without explicit GO from key voices.

5. **Communicating outcomes after the fact.** Real-time updates in Slack during launch. Don't go silent.

6. **Standing down too early.** First 4 hours matter most. Stay engaged.

7. **No daily check-ins for first week.** Issues often surface day 2-3 (after initial traffic ramps up). Stay watching.

---

Last reviewed: 2026-05-24 by Claude (initial)
Next review due: 2026-08-24
