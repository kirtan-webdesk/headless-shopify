# Synthetic Monitoring Setup (UptimeRobot)

> Configure UptimeRobot (free tier) for post-launch monitoring.
> Per B8 + `_spine/delivery-head/knowledge/07-post-launch-monitoring.md`

---

## Why UptimeRobot

- Free tier: 50 monitors, 5-minute intervals
- Sufficient for most agency projects
- Email + SMS + Slack alerts
- Status pages built-in (free)
- API for automation

Alternatives (paid):
- Better Stack (better logs integration)
- Checkly (better for SaaS / API monitoring)
- Pingdom (mature, well-known)

For most WebDesk projects: UptimeRobot free tier is fine.

---

## Per-project setup

### Step 1: Create UptimeRobot account

If client doesn't already have one:
1. Sign up at https://uptimerobot.com (free)
2. Verify email

If client wants their own account:
- Set up monitoring in their account
- Add agency to alert contacts (optional)
- They retain access after warranty ends

If using agency's account:
- All client projects in one place
- Document this in client memory file

### Step 2: Add monitors per project

For each project at launch, add these monitors:

#### Monitor 1: Homepage
- Type: HTTP(S)
- URL: `https://aurora-skincare.com/`
- Friendly name: `Aurora — Homepage`
- Interval: 5 minutes
- Timeout: 30 seconds
- Alert contacts: [Internal PM email, Tech Lead email]
- Keyword check (optional): verify expected text in response

#### Monitor 2: Cart page
- Type: HTTP(S)
- URL: `https://aurora-skincare.com/cart`
- Same config

#### Monitor 3: Cart API endpoint
- Type: HTTP(S)
- URL: `https://aurora-skincare.com/cart.js`
- Same config

#### Monitor 4: Critical API endpoint (headless projects)
- Type: HTTP(S)
- URL: project-specific API endpoint
- Check response code: 200

### Step 3: Configure alerts

- First alert: after 2 consecutive failed checks (= 10 min downtime)
- Re-alert: every 30 minutes while down
- Recovery alert: on return to healthy

### Step 4: (Optional) Set up status page

Free with UptimeRobot:
- URL like `stats.uptimerobot.com/abc123`
- Public or private
- Add to handoff documentation if client wants

### Step 5: Document in master doc

In project's `AGENCY-MASTER-DOC.md`:

```markdown
## Monitoring

### Synthetic monitoring
- Service: UptimeRobot
- Account: [agency or client]
- Dashboard URL: [UR dashboard link]
- Monitors:
  - Homepage: 5-min interval
  - Cart page: 5-min interval
  - Cart API: 5-min interval
- Alert recipients: [emails]
- Status page (if public): [URL]
```

---

## Automated setup (advanced)

If you have many projects, use UptimeRobot API to automate:

```python
import requests
import os

API_KEY = os.environ['UPTIMEROBOT_API_KEY']
BASE = 'https://api.uptimerobot.com/v2'

def create_monitor(name, url, alert_contacts):
    response = requests.post(f'{BASE}/newMonitor', data={
        'api_key': API_KEY,
        'format': 'json',
        'type': 1,  # HTTP(S)
        'url': url,
        'friendly_name': name,
        'interval': 300,  # 5 minutes
        'timeout': 30,
        'alert_contacts': '_'.join(alert_contacts),
    })
    return response.json()

# Per-project at launch
project_name = 'Aurora Skincare'
domain = 'aurora-skincare.com'
contacts = ['1234567', '7654321']  # contact IDs from UptimeRobot

create_monitor(f'{project_name} — Homepage', f'https://{domain}/', contacts)
create_monitor(f'{project_name} — Cart', f'https://{domain}/cart', contacts)
create_monitor(f'{project_name} — Cart API', f'https://{domain}/cart.js', contacts)
```

Run this as part of Delivery Head's launch protocol (per `_spine/delivery-head/knowledge/07-post-launch-monitoring.md`).

---

## Alternatives if UptimeRobot doesn't fit

### Better Stack (paid, ~$30/month)
- Includes log management
- Better for SaaS/API monitoring
- More detailed metrics
- Use case: clients with significant backend custom code

### Checkly (paid)
- API + browser monitoring
- Synthetic user flows (Playwright-based)
- Use case: SPA / headless projects where you need to verify dynamic content

### Cloudflare Monitoring (free for some)
- Built into Cloudflare if you use them
- Less feature-rich than dedicated tools
- Use case: clients already on Cloudflare

### Native Shopify monitoring
- Shopify has internal monitoring (their store status page)
- Doesn't substitute for your monitoring (it's only for Shopify-side outages)

---

## Post-launch monitoring lifecycle

### Day 1-7
- Daily check dashboard
- Investigate any alerts
- Verify alert delivery (test that alerts reach right people)

### Week 2-4
- Weekly review
- Identify trends (any pattern of intermittent failures?)
- Tune alert thresholds if too noisy

### Month 2+
- Monthly review
- Compare uptime vs. SLA targets (if any)
- Generate monthly uptime report for client (optional)

### Warranty end / project handoff
- If client managing monitoring: transfer ownership
- If continuing as maintenance: keep ownership
- Update master doc

---

## When alerts fire

Per `_spine/delivery-head/knowledge/07-post-launch-monitoring.md`:

1. Verify alert is real (sometimes false positive)
2. Check Shopify status page (platform-wide outage?)
3. Check our recent deploys (anything new?)
4. Diagnose + fix or rollback
5. Communicate to client within 30 minutes of confirmed downtime
6. Document in incident log

---

## Anti-patterns

1. **Setting up monitors but not testing alerts.** Find out alerts don't work when incident happens. Test by triggering a known failure.

2. **Too many monitors.** Costs (if paid) + noise. Focus on critical: homepage, cart, checkout. Skip every minor page.

3. **All alerts to one person.** That person's out → no response. Distribute.

4. **No status page communication.** Customers panic during outage if no info. Free UptimeRobot status page solves this.

5. **Letting alerts go to spam.** Whitelist UptimeRobot email domain.

6. **Forgetting to remove monitoring after engagement ends.** Pile up on the account. Quarterly review + clean up.

---

Last reviewed: 2026-05-25 by Claude (initial)
Next review due: 2026-08-25
