---
tier: 2
load_when: ["outbound-comms"]
description: "v1.5.2 Tier A — enforces FLAG-004 (and equivalents) at the system level. Prevents agents from contacting client emails/numbers/handles directly."
---

# Outbound Communications Gate

> v1.5.2 Tier A — enforces FLAG-004 (and equivalents) at the system level. Prevents agents from contacting client emails/numbers/handles directly.

---

## Why this exists

The Kitchen Blockers pilot maintained FLAG-004 (do not contact `bamps@kitchenblockers.com` or `venussinson@gmail.com` directly) through manual discipline. That's not a system — that's luck.

This gate enforces the rule in code. Every agent that could emit outbound communication MUST consult the project's client-contact-blocklist before sending. Bypass requires explicit OVERRIDE in `project.json.audit_log`.

---

## What counts as "outbound communication"

Block ALL of:

1. **Email** sent to any address (transactional, notification, marketing, test, debug)
2. **SMS / WhatsApp** to any phone number
3. **Webhooks** firing to client-controlled URLs
4. **Slack / Teams / Discord** messages to channels containing client members
5. **Calendar invites** to client emails
6. **Auto-generated PRs / Issues** that @-mention client GitHub handles
7. **Third-party app callbacks** that route to client-known endpoints
8. **CRM / helpdesk** ticket creation under client email
9. **Marketing automation** triggers (Mailchimp, Klaviyo, etc.)
10. **Form submissions** to client-controlled endpoints

If the destination is the client OR any address the client owns/sees — it's outbound communication. Block by default; require explicit allowlist to send.

---

## Schema additions to project.json

Add to `project.json` root:

```json
{
  "client_contact_blocklist": {
    "emails": [
      "bamps@kitchenblockers.com",
      "venussinson@gmail.com"
    ],
    "phones": [
      "+1-555-555-5555"
    ],
    "handles": [
      "@kitchenblockers"
    ],
    "domains": [
      "kitchenblockers.com"
    ],
    "webhooks": [
      "https://kitchenblockers.com/api/*"
    ],
    "rationale": "FLAG-004 — Internal PM routing only. All client comms go through Internal PM at pm@webdesksolution.ca.",
    "enforced_since": "2026-05-25",
    "override_protocol": "Requires OVERRIDE entry in audit_log with explicit human approval. Self-approval prohibited."
  },
  "allowlist_internal_pm": {
    "emails": ["pm@webdesksolution.ca"],
    "rationale": "Internal PM is the only authorized client-facing contact channel."
  }
}
```

The `domains` field matches by suffix — `kitchenblockers.com` blocks `anyone@kitchenblockers.com`.

The `webhooks` field supports glob patterns.

---

## Pre-send check (every agent must perform)

Before any outbound send, the agent runs:

```pseudo
function check_outbound(destination, channel) {
  blocklist = read_project_json().client_contact_blocklist
  allowlist = read_project_json().allowlist_internal_pm

  if (destination in allowlist[channel]) {
    return ALLOW
  }

  if (destination matches blocklist[channel]) {
    log_event("OUTBOUND_BLOCKED", destination, channel)
    return BLOCK_HARD
  }

  if (destination domain in blocklist.domains) {
    log_event("OUTBOUND_BLOCKED_DOMAIN", destination, channel)
    return BLOCK_HARD
  }

  // Default for unknown destinations: warn, require explicit approval
  log_event("OUTBOUND_UNKNOWN", destination, channel)
  return REQUIRE_HUMAN_APPROVAL
}
```

**Default-deny for unknown destinations.** If the system doesn't know whether a destination is safe, it does NOT send. It pauses and asks.

---

## Per-agent enforcement responsibilities

| Agent | Outbound surfaces to guard |
|-------|---------------------------|
| **Orchestrator** | Coordination messages routed to any channel; sprint summaries; gate decisions if surfaced externally |
| **PM Agent** | Status reports, milestone updates, client communication drafts |
| **Designer Agent** | Design review invitations, preview URL distributions |
| **Frontend Agent** | None directly. Generated code that DOES emit comms (e.g., `mailto:` links, contact forms) must point to safe destinations only. |
| **Backend Agent** | Webhook configurations, app callbacks, third-party integrations |
| **QA Agent** | Bug report distributions, test data emails (NEVER use real client addresses for tests) |
| **Code Review Agent** | None — internal only |
| **Content & Migration Agent** | Test emails during template development must use test addresses, not client addresses |
| **Delivery Head** | Launch notifications, post-launch reports |

Every agent's SKILL.md must include a "Outbound comms check" section pointing at this gate.

---

## What "Frontend Agent" needs to enforce on generated code

This is subtle. Frontend Agent doesn't send emails itself — but the code it generates does. Examples:

### Bad — direct client email in generated code
```liquid
<a href="mailto:bamps@kitchenblockers.com">Contact us</a>
```

### Good — abstracted contact destination
```liquid
<a href="mailto:{{ settings.contact_email }}">Contact us</a>
```
Where `settings.contact_email` is configured by the client/PM, NOT hardcoded.

### Bad — form action posting to client domain
```html
<form action="https://kitchenblockers.com/contact-form" method="POST">
```

### Good — form action posting to neutral endpoint
```html
<form action="/contact" method="POST">
```

**Forbidden patterns to add to forbidden.md as `COMM-NNN` series:**

- `COMM-001` — Hardcoded client email addresses in generated source code
- `COMM-002` — Form actions pointing directly to client-controlled domains
- `COMM-003` — Webhook URLs hardcoded to client domains
- `COMM-004` — Test data using real client contact details

Code Review Agent must scan for these patterns.

---

## Override protocol

If a legitimate need to contact the client directly arises (extreme rare case):

1. Pilot lead or Tech Lead files explicit OVERRIDE request
2. Override logged in `project.json.audit_log` with:
   - Reason
   - Approver name
   - Timestamp
   - One-time or duration
3. Override is single-use unless duration specified
4. Cannot be approved by the same agent/person who requested it (self-approval prohibition)
5. Audit log entry visible at next retro

```json
{
  "audit_log": [
    {
      "timestamp": "2026-05-27T14:32:00Z",
      "action": "OUTBOUND_COMMS_OVERRIDE",
      "destination": "bamps@kitchenblockers.com",
      "channel": "email",
      "reason": "Emergency: Internal PM unreachable, client domain expiry imminent",
      "approver": "John (Tech Lead)",
      "requester": "PM Agent",
      "scope": "single-message",
      "expires_at": "2026-05-27T18:00:00Z"
    }
  ]
}
```

---

## Failure modes this prevents

From Kitchen Blockers pilot (and risk profile):

| Risk | What could happen without this gate | What this gate does |
|------|------------------------------------|---------------------|
| Agent sends well-meaning status update to client | "Hi Bamps, here's where we are on the project..." | Hard block — destination matches blocklist |
| Test email triggered to client address | Stripe test mode using `bamps@kitchenblockers.com` as test recipient | Hard block on domain match |
| Generated contact form posts to client server | Form action set to `kitchenblockers.com/api/contact` | Code Review catches COMM-002 |
| Calendar invite sent to client | Designer Agent invites client to design review | Hard block on email blocklist |
| Webhook configured against client URL | Custom app calls back to `kitchenblockers.com/webhook` | Hard block on webhook glob match |

---

## Implementation order (for v1.5.2 build)

1. Add `client_contact_blocklist` schema to `_contracts/project-json.schema.json` (next task in Tier A)
2. Add this gate doc to `_spine/orchestrator/knowledge/` (this file)
3. Add `COMM-001` through `COMM-004` to `<active-platform>/knowledge/09-forbidden.md` (Tier E task)
4. Update each agent's SKILL.md with "Outbound comms check" section pointing at this gate (Tier E task)
5. Add Code Review Agent check for COMM patterns in `code-review-agent/knowledge/01-review-checks.md` (Tier E task)
6. Update intake gate (G0) to require client_contact_blocklist to be populated before progression (Tier B task)

---

## Anti-patterns

1. **Treating blocklist as optional.** If `client_contact_blocklist` is empty, agents should warn LOUDLY at session start. Empty blocklist = no protection.

2. **Adding entries late.** New client contacts surfacing mid-project must be added to blocklist immediately, not "we'll add it at the retro."

3. **Allowing self-approval of overrides.** The agent that requests the override cannot be the agent that approves it.

4. **Silent fallback to "send anyway."** If the check fails for any reason (project.json corruption, missing field, etc.), the default behavior is BLOCK, not SEND.

5. **Not logging blocked attempts.** Every blocked attempt must be logged. If the same agent keeps trying to send to a blocked address, that's a failure mode worth investigating.

---

## Verification

Code Review Agent runs on every PR:

```bash
# Pseudocode
for file in changed_files:
  for pattern in [COMM-001, COMM-002, COMM-003, COMM-004]:
    if file matches pattern AND destination matches blocklist:
      reject_pr("Outbound comms violation: {file} contains direct client contact reference")
```

---

Last reviewed: 2026-05-27 by Claude (v1.5.2 Tier A)
Next review due: 2026-08-27
