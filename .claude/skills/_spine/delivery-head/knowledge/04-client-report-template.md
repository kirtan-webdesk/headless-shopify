---
tier: 2
load_when: ["agent-specific-detail"]
description: "Delivery Head generates this at launch. Goes to client (via Internal PM) summarizing the launch event. Distinct from PM Agent's ongoing milestone updates."
---

# 04 — Client Report Template

> Delivery Head generates this at launch. Goes to client (via Internal PM) summarizing the launch event. Distinct from PM Agent's ongoing milestone updates.

---

## When this report is generated

- **Pre-launch report:** 2-7 days before launch — readiness confirmation
- **Launch day report:** within 4 hours of launch — confirmation of success
- **Post-launch 7-day report:** 1 week post-launch — initial performance + stability summary
- **Post-launch 30-day report:** 30 days post-launch — full month review (warranty period mid-point)
- **End-of-warranty report:** at warranty end — what's covered, what to do next

PM Agent handles ongoing project updates (sprint, milestone). Delivery Head handles launch-event-specific reports.

---

## Pre-launch readiness report

Generated 2-7 days before launch. Client-facing.

```markdown
# Pre-Launch Readiness — [Project Name]

**Project:** [Project Name]
**Prepared for:** [Client Contact Name]
**Date:** [Date]
**Launch target:** [YYYY-MM-DD HH:MM Timezone]
**Status:** READY | FLAGS | NOT_READY

---

Hi [Client Name],

We're [X] days out from launching [Project Name]. This update covers
what's complete, what we're verifying, and what we need from you.

## What's complete

- [Plain-language summary of deliverables]
- [Major features built and verified]
- [Integrations configured and tested]

## What we're verifying this week

[Items still in pre-launch checklist execution]
- [Item 1]
- [Item 2]

## Performance + Quality Snapshot

- Lighthouse Performance: [X] (target: ≥[Y])
- Core Web Vitals: LCP [X]s, CLS [Y], INP [Z]ms — all within target
- Accessibility (WCAG 2.1 AA): verified, 0 violations
- SEO baseline: configured + verified
- Security: clean

## Launch Plan

### Launch window
[Specific date and time, with timezone]

### What happens during launch
1. [Step]
2. [Step]
3. [Step]
(Plain language, not technical jargon)

### Expected downtime
[None / X minutes]

### What we'll do immediately after launch
- Verify site is live and functioning
- Confirm analytics receiving events
- Monitor for the first 24-48 hours
- Send you the launch confirmation update

## What we need from you

- [ ] Final design approval (if not yet given): by [date]
- [ ] Final content approval: by [date]
- [ ] Sign-off on launch readiness: by [date]
- [ ] [Other items needing client action]

## Risks to be aware of

[List any concerns surfaced + mitigation]

## Warranty period reminder

After launch, your project enters a [N]-day warranty period. During this time:
- We monitor the site for any issues
- We fix any bugs in delivered functionality at no charge
- Bug severity SLAs apply (P1: 4 business hours, P2: 1 business day, etc.)

Post-warranty, ongoing support is via [separate agreement / ad-hoc requests / etc.].

---

Reply to this update with any questions or concerns. Otherwise, we'll
proceed with the launch on [date].

Best,
[Internal PM name, on behalf of Delivery Head Agent]
```

---

## Launch day report (post-launch, within 4 hours)

Generated immediately after launch + health check passes.

```markdown
# Launch Confirmed — [Project Name]

**Project:** [Project Name]
**Launched:** [YYYY-MM-DD HH:MM Timezone]
**Live URL:** [URL]
**Status:** ✓ LIVE

---

Hi [Client Name],

[Project Name] is now live at [URL].

## Launch Outcome

[1-2 sentences of plain language summary]

## Immediate Verification

We ran our standard post-launch health check at [time]. Results:

- ✓ Site loads on live URL
- ✓ Cart and checkout work end-to-end
- ✓ Analytics (GA4, Meta Pixel) receiving events
- ✓ All integrations (Klaviyo, Judge.me, etc.) responding
- ✓ Performance: Lighthouse [X], LCP [Y]s
- ✓ No critical errors

## What's Active Now

### Monitoring
- 24-hour synthetic monitoring active (UptimeRobot)
- Real user monitoring data being collected
- Our team is monitoring for the first 48 hours

### Warranty period
- Started: [date]
- Ends: [date]
- Coverage: bug fixes for delivered functionality
- SLAs:
  - P1 (site down, checkout broken): 4 business hours response
  - P2 (major feature broken with workaround): 1 business day
  - P3 (minor bug): 3 business days
  - P4 (cosmetic): best effort

## Your Handoff Package

You'll receive these within 24 hours:

- Admin user guide (how to edit content, add products, manage navigation)
- Training video walkthrough (~10 minutes)
- Credentials handover document (all third-party access)
- Technical reference document (for any future dev work)
- Warranty terms summary

## How to Report Issues

If you notice anything off:
1. Reply to this update with details + screenshot
2. We triage and respond per SLA

For URGENT issues (site down, transactions failing):
- Call: [Phone] (or contact Internal PM directly)

## What to Watch For (First 7 Days)

In the first week, here's what we'll be tracking:
- Site uptime + performance
- Conversion rate (should match or exceed pre-launch baseline)
- Customer service inquiries (in case anything is confusing)
- SEO traffic (should be stable or improving)

We'll send a 7-day report next [day of week] with full performance summary.

---

Congratulations on the launch! Reach out anytime with questions.

[Internal PM name + Delivery Head]
```

---

## 7-day post-launch report

Generated 7 days after launch.

```markdown
# 7-Day Post-Launch Report — [Project Name]

**Period:** [Launch date] to [7 days later]
**Status:** STABLE | FLAGS | ACTION_REQUIRED

---

## Stability Summary

- Uptime: [X]% ([N] alerts in 7 days)
- Average page load (homepage): [X]s
- Average Lighthouse Performance: [X]
- Errors logged: [N] (broken down by severity)

## Traffic + Performance

[If you have access to the client's analytics]

- Sessions: [N] (vs [pre-launch baseline if applicable])
- Conversion rate: [%]
- Bounce rate: [%]
- Average session duration: [time]
- Top pages by traffic
- Top exit pages
- Mobile vs desktop split

## SEO Status

- Pages indexed by Google: [N] (verified in GSC)
- Pages submitted (sitemap): [N]
- Any indexing issues: [list or "none"]
- Search Console performance: [vs baseline if applicable]

## Issues Identified

| ID | Severity | Description | Status |
|----|----------|-------------|--------|
| BUG-031 | P3 | [description] | Fixed [date] |
| BUG-032 | P4 | [description] | Documented as known limitation |

## Client Actions Needed (if any)

- [Action 1]
- [Action 2]

## What We're Doing

- Continued monitoring
- Working on any open warranty items
- [Specific upcoming work]

## Next Report

- 30-day report: [date]

---

Reach out anytime.

[Internal PM]
```

---

## 30-day post-launch report

Generated 30 days post-launch (mid-point of standard warranty period).

Same structure as 7-day report but covering 30 days.

Additional sections:
- Cumulative performance vs. business goals (per spec.goals)
- Recommendations for ongoing optimization
- Reminder of warranty end date
- Discussion of post-warranty options

---

## End-of-warranty report

Generated at warranty end (e.g., 30 days post-launch for standard).

```markdown
# Warranty Period Concluding — [Project Name]

**Project:** [Project Name]
**Warranty period:** [Start] to [End]
**Status:** Concluding

---

Hi [Client Name],

Your warranty period for [Project Name] ends [date]. Here's a summary
of what was covered and what comes next.

## Warranty Period Summary

- Total bugs reported: [N]
- Bugs fixed under warranty: [N]
- Bugs documented as known limitations: [N]
- Bugs out-of-scope (not covered): [N]

## Open Items at Warranty End

[List any open items + how they're being handled]

## What Was NOT Covered

Per warranty terms:
- New features (e.g., [examples])
- Content updates
- Third-party tool changes
- Issues caused by edits made to the site outside agency

## What Comes Next

After warranty:
- **Ad-hoc support:** Submit requests via [process], billed at [rate]
- **Maintenance retainer:** Optional monthly retainer at [rate] for ongoing support
- **Major changes:** Quoted separately as a new project

## Site Health Snapshot

[Final snapshot of performance, uptime, traffic, conversion]

## Recommendations

[Specific recommendations for next steps:]
- [Performance optimization opportunity]
- [Feature consideration]
- [Maintenance need]

## We're Available

Reach out for any of the above, or just to check in. We've enjoyed
working on [Project Name] and we're here for whatever comes next.

[Internal PM + Delivery Head]
```

---

## Tone notes

These reports go to clients. Tone is:
- Professional but warm (we worked together on this)
- Plain language (no jargon — translate technical things)
- Specific (real numbers, not "site is doing great")
- Honest about issues (don't hide flags)
- Action-oriented (clear what client should do, if anything)

Avoid:
- Bragging
- Technical jargon
- Vague platitudes
- Hiding problems
- Overpromising

---

## Generation flow

```
1. Delivery Head Agent generates report draft
2. PM Agent reviews for consistency with prior updates
3. Internal PM reviews + customizes (style, additions specific to client relationship)
4. Internal PM sends to client
5. Audit log entry: client_report_sent
```

Inspiration documents from you (PENDING) will tune the style. Until then, neutral professional.

---

Last reviewed: 2026-05-24 by Claude (initial)
Next review due: 2026-08-24
