---
tier: 2
load_when: ["agent-specific-detail"]
description: "Per B8, synthetic monitoring is set up at launch and runs continuously. Per F13, post-deploy health checks and auto-rollback. This file covers ongoing monitoring after launch."
---

# 07 — Post-Launch Monitoring

> Per B8, synthetic monitoring is set up at launch and runs continuously. Per F13, post-deploy health checks and auto-rollback. This file covers ongoing monitoring after launch.

---

## Three monitoring layers

| Layer | What | When |
|-------|------|------|
| **Synthetic monitoring** | Scripted external checks of live URL | Continuous, 5-min intervals |
| **Real user monitoring (RUM)** | Data from actual user sessions | Continuous, real users |
| **Periodic deep checks** | Manual + Lighthouse | Daily for first week, weekly thereafter |

---

## Synthetic monitoring (B8 implementation)

### Tool selection

Default: **UptimeRobot free tier** (50 monitors, 5-min checks, free).

Alternatives if more features needed:
- **Checkly** ($40/mo): better for SaaS, multiple regions, more advanced
- **Better Stack** (free tier exists): includes log management
- **Pingdom** ($15+/mo): mature, well-known
- **StatusCake** (free tier): straightforward

For most agency projects, UptimeRobot free is sufficient.

### What to monitor

Per project, set up these monitors:

```
1. Homepage HTTP status (live URL)
   - Check: HTTP 200
   - Frequency: every 5 minutes
   - Alert if: down for 2 consecutive checks (10 min downtime)

2. Cart page HTTP status (live URL/cart)
   - Same config

3. Critical API endpoint (if applicable)
   - E.g., for headless: API health endpoint
   - Check: HTTP 200 + response time < threshold

4. Form submission test (advanced — Checkly or similar)
   - Submit test newsletter / contact form
   - Verify submission succeeds
   - Frequency: hourly
   - Optional, costs more (paid tier)

5. Full purchase flow (advanced — only for high-revenue clients)
   - End-to-end test cart → checkout → test payment
   - Frequency: daily
   - Most expensive monitor type
```

### Alert configuration

For each monitor, configure alerts:

```
Alert recipients:
  - Internal PM (primary)
  - Tech Lead (backup)
  - Client (if they want — sometimes overwhelming for non-technical clients)

Alert channels:
  - Email (always)
  - SMS / phone (for P1 monitors — homepage, cart, checkout)
  - Slack (#alerts channel)

Alert thresholds:
  - First alert: after 2 consecutive failed checks (10 minutes)
  - Re-alert: every 30 minutes while down
  - Recovery alert: when monitor returns to healthy
```

### Setting up UptimeRobot

```
1. Create account at https://uptimerobot.com (free)
2. Add monitor:
   - Type: HTTP(S)
   - URL: [live URL]
   - Friendly name: "[Project Name] - Homepage"
   - Monitoring interval: 5 minutes
   - Alert contacts: add email + (paid) SMS
3. Repeat for each page to monitor
4. Add to status page (UptimeRobot offers free status page)
```

Delivery Head documents the setup in `/projects/[client]/monitoring-config.md`.

---

## Real user monitoring (RUM)

### What it is

Data from actual users browsing the site. Tracks:
- Real-world performance (LCP, CLS, INP from real devices/networks)
- Real-world error rates (JS errors users actually hit)
- Real-world conversion funnels

### Tool selection

Default: **web-vitals library** + GA4 + custom events. Free.

Alternatives:
- **Vercel Analytics** (if hosted on Vercel)
- **Cloudflare Web Analytics** (free, privacy-focused)
- **Sentry** (paid, comprehensive error tracking)
- **Datadog RUM** (paid, comprehensive)

For most projects: web-vitals.js sending to GA4 as custom events is sufficient.

### Implementation

In code (Frontend Agent's responsibility during dev):

```javascript
// In the site's main JS
import {onCLS, onINP, onLCP, onFCP, onTTFB} from 'web-vitals';

function sendToAnalytics(metric) {
  // Send to GA4 as custom event
  gtag('event', 'web_vital', {
    metric_name: metric.name,
    metric_value: metric.value,
    metric_rating: metric.rating, // good / needs-improvement / poor
    metric_delta: metric.delta,
    metric_id: metric.id,
    page_path: window.location.pathname
  });
}

onLCP(sendToAnalytics);
onCLS(sendToAnalytics);
onINP(sendToAnalytics);
onFCP(sendToAnalytics);
onTTFB(sendToAnalytics);
```

In GA4, create exploration / dashboard for these custom events. Track over time.

### Comparing RUM vs synthetic

- **Synthetic Lighthouse:** consistent measurement, doesn't reflect real users
- **RUM (web-vitals):** real users, but variable network/device

Both are useful. RUM is more trustworthy for "is the site actually fast for users" but synthetic is better for regression detection.

Use synthetic for CI gating. Use RUM for ongoing reality check.

---

## Daily monitoring (first week)

Delivery Head's responsibility for the first 7 days post-launch:

```
Day 1 (T+24h):
[ ] Review UptimeRobot dashboard — any alerts?
[ ] Check GA4 — events received correctly? Traffic patterns normal?
[ ] Check integrations dashboards — Klaviyo, Meta Pixel, etc.
[ ] Manual smoke test (3-5 key pages)
[ ] Check for any client reports

Day 2 (T+48h):
[ ] Same as Day 1
[ ] Compare metrics to Day 1 (any regressions?)

Day 3 (T+72h):
[ ] Same as Day 2
[ ] Initial 3-day stability summary (internal note)

Day 7 (T+1 week):
[ ] Full review
[ ] Compare to pre-launch baseline (if redesign/migration)
[ ] Generate 7-day post-launch report per `04-client-report-template.md`
[ ] Send to client
```

---

## Weekly monitoring (weeks 2-4 of warranty)

```
Each week:
[ ] Review monitoring dashboards
[ ] Review GA4 traffic + behavior
[ ] Lighthouse spot-check (one key page, mobile + desktop)
[ ] Review any bug reports from client
[ ] Update bug status in project.json
[ ] Generate weekly internal status note
```

At day 30 (warranty mid-point): full report per `04-client-report-template.md` § 30-day post-launch.

---

## What to escalate

### Immediate escalation (page on-call)

- Site down (any HTTP 5xx or persistent timeout)
- Cart broken (checkout flow non-functional)
- Payment integration failing (no transactions can complete)
- Customer data exposure suspected
- Major security alert (CVE in dependencies)

### Same-day escalation (notify team)

- Significant performance regression (Lighthouse drops > 10 points)
- Specific integration not firing for several hours
- Customer support reports spike in confusion / errors
- SEO indexing issue (pages dropping out of index)

### Next business day escalation

- Minor performance drift
- Single-source integration failures (one tool, others fine)
- P3/P4 bug reports from client
- Analytics anomalies

---

## What to do when alerts fire

### Synthetic monitoring alert (site down)

```
1. Verify alert is real (manually check the URL — sometimes false positives)
2. If real:
   - Check platform status page (Shopify status, WordPress hosting, etc.)
   - Check own monitoring (other sites we host — is this platform-wide?)
   - Check recent deploys (anything just shipped?)
3. If platform issue: wait it out, communicate to client
4. If our code: identify cause, decide rollback vs forward-fix
5. Communicate to client within 30 minutes of confirmed downtime
6. Document in incident log
```

### Performance alert (Lighthouse regression)

```
1. Verify with multiple runs (Lighthouse has variance)
2. Compare to pre-launch baseline
3. If significant (>10 points drop):
   - Investigate cause (recent change? new app installed? CDN issue?)
   - Document
   - Fix in next sprint OR immediately if severe
4. If client noticed: communicate findings
```

### Analytics gap (events not received)

```
1. Verify in GA4 Real-Time dashboard
2. If truly broken:
   - Check GA4 measurement ID
   - Check GTM if applicable
   - Check Consent Management blocking
   - Check ad blockers (may affect synthetic but not real users)
3. Fix quickly — analytics gaps lose data permanently
```

---

## Incident log

For any incident (alert that required action):

```markdown
# Incident — [Date] — [Brief description]

**Project:** [Project Name]
**Incident date:** [date + time]
**Detected by:** [synthetic monitoring / client report / etc.]
**Severity:** [P1 / P2 / P3]
**Duration:** [start - end]
**Resolution time:** [duration]

## What happened
[Timeline of events]

## Impact
[Users affected, duration, business impact]

## Root cause
[Why this happened]

## Resolution
[What we did to fix]

## Prevention
[How we'll prevent recurrence]

## Communication
- Internal: [timestamps]
- Client: [timestamps]

## Lessons learned
[Items to update in KB or process]
```

Incidents reviewed at next Monthly System Retro (per K5).

---

## After warranty period

When warranty ends:

```
[ ] End-of-warranty report sent to client (per `04-client-report-template.md`)
[ ] Synthetic monitoring: stay active OR transfer to client
   - If client wants continued monitoring: continue with their account, or hand off setup
   - If not: deactivate
[ ] RUM (web-vitals): stays in code, client continues to receive in GA4
[ ] Backups: retain 90 days post-warranty per `03-rollback-procedure.md`
[ ] Incident log: archived with project
```

---

## Anti-patterns

1. **No synthetic monitoring at launch.** Site goes down, you find out from angry client tweets. Don't do this.

2. **All alerts to one person.** That person's out sick → no one notices. Distribute alerts.

3. **Too many alerts → alert fatigue.** Tune thresholds. Don't alert on transient blips.

4. **Monitoring just the homepage.** Cart, checkout, key integrations all matter.

5. **No RUM data.** Synthetic data alone isn't enough. Real users are the truth.

6. **No incident documentation.** Repeating same mistakes = no learning.

7. **Monitoring ends at warranty.** If client doesn't continue with us, hand off the monitoring setup so they don't lose visibility.

---

Last reviewed: 2026-05-24 by Claude (initial)
Next review due: 2026-08-24
