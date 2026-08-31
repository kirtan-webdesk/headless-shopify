---
tier: 2
load_when: ["third-party-app-flow"]
description: "v1.5.2 — handles the case where a third-party app must be installed on a live store by a human (sandbox/staging not supported by the app). Project pauses with structured state, resumes when human confirms install complete."
---

# Third-Party App Pause-Resume Workflow

> v1.5.2 — handles the case where a third-party app must be installed on a live store by a human (sandbox/staging not supported by the app). Project pauses with structured state, resumes when human confirms install complete.

---

## Why this exists

User requirement (post-pilot review):
> "Some third-party app providers do not allow installation or testing in sandbox/staging environments. The system must support a workflow where a human developer installs the app directly on the live store when required. After installation confirmation, the AI/system proceeds with frontend customization and integration tasks."

Without a structured pause-resume:
- Agent waits indefinitely with no clear state
- Subsequent tasks get blocked silently
- Resume requires re-establishing context

---

## When this triggers

Backend Agent or Orchestrator detects an app integration that requires:
- Manual install on live store
- Manual configuration via app dashboard
- Manual approval from app vendor (e.g., approval to access certain APIs)
- Any step the AI cannot perform autonomously

Examples of apps with this pattern:
- Payment gateways (Klarna, Afterpay — require merchant verification)
- ERP/CRM connectors (NetSuite, Salesforce — require account-level auth)
- Subscription apps (Recharge, Bold Subscriptions — require Shopify app review)
- Loyalty programs (Smile.io, LoyaltyLion — require store config)
- Some review apps (Yotpo, Stamped — require manual review of historical data)

---

## State machine

```
[Detect manual install needed]
     ↓
Set project state: WAITING_ON_HUMAN_INSTALL
     ↓
Log to audit_log with: app_name, install_requirements, blocking_tasks
     ↓
Surface to developer + Internal PM with clear instructions
     ↓
Move blocked tasks to BLOCKED queue
     ↓
Continue with non-blocked tasks (if any)
     ↓
[Human confirms install complete via /resume-app <app-name>]
     ↓
Validate install (Backend Agent checks app presence in store)
     ↓
If validated: clear state, re-queue blocked tasks
If not validated: surface gap, request re-confirmation
```

---

## Project.json schema additions

```json
{
  "third_party_apps_waiting": [
    {
      "app_name": "Recharge Subscriptions",
      "vendor": "Recharge",
      "shopify_app_store_url": "https://apps.shopify.com/recharge",
      "install_requirements": [
        "Merchant must have payment gateway approval for subscription billing",
        "Manual install on live store (sandbox not supported)",
        "API key generation in Recharge dashboard"
      ],
      "human_installer": "Daniel (Tech Lead)",
      "expected_install_date": "2026-06-15",
      "actually_installed_date": null,
      "blocking_tasks": [
        "Build subscription product template",
        "Wire subscription cart drawer",
        "Add subscription metafields"
      ],
      "validation_check": "shopify app list --store ${SHOPIFY_STORE_URL} | grep recharge",
      "status": "WAITING_ON_HUMAN_INSTALL"
    }
  ]
}
```

---

## Pause behavior

When orchestrator (or Backend Agent) hits a task that requires an unconfirmed third-party app:

1. **Pause the dependent task** — do NOT attempt to build against an absent app
2. **Update project.json** — add entry to `third_party_apps_waiting`
3. **Update HANDOFF.md** — surface in "Client blockers" section
4. **Surface to developer** in chat:

```
⚠ TASK PAUSED — third-party app required

App: Recharge Subscriptions
Why: Sandbox install not supported; merchant must install on live store
Requirements:
  - Merchant has payment gateway approval
  - Manual install via Shopify App Store
  - Generate API key in Recharge dashboard, add to project secrets

Blocking 3 tasks (queued for resume after install).
4 unrelated tasks can proceed — continuing those.

Once installed, run: /resume-app recharge
```

5. **Continue with non-blocked work** — orchestrator picks the next task in queue that doesn't depend on this app
6. **PM Agent flags this at the next brief check** — proactive nudge

---

## Resume behavior

When developer runs `/resume-app <app-name>`:

1. **Validate install** — run the `validation_check` command from project.json. For Shopify apps, typically `shopify app list` to confirm presence.
2. **If validation passes:**
   - Update `actually_installed_date` in project.json
   - Move app entry from `third_party_apps_waiting` → `third_party_apps_installed`
   - Re-queue blocking tasks
   - Surface confirmation to developer:
     ```
     ✓ Recharge install confirmed (validated against store API).
     Re-queuing 3 blocked tasks.
     Next: Build subscription product template.
     PROCEED? [Y/preview/skip]
     ```
3. **If validation fails:**
   - Surface error:
     ```
     ✗ Install validation FAILED.
     Expected: recharge app present in store
     Got: not found in `shopify app list` output
     
     Either install incomplete OR validation_check is wrong.
     Re-check the install, then run /resume-app recharge again.
     ```

---

## Handling apps that can't be validated automatically

Some apps don't expose a clean validation check (no API, or check requires logging into vendor dashboard). For these:

```json
{
  "validation_check": "manual",
  "validation_instructions": "Verify in Recharge dashboard that store is connected. Check at dashboard.rechargeapps.com → Stores → look for [store name]."
}
```

When `validation_check === "manual"`:
- Orchestrator displays the instructions
- Developer runs the check manually
- Confirms with `/resume-app <app-name> --validated-manually`
- audit_log captures `validation_method: manual`

---

## Multiple apps waiting simultaneously

Common scenario: M4 (third-party integrations milestone) requires 5-15 app installs.

- All apps go into `third_party_apps_waiting` array
- Each has its own `blocking_tasks` list
- Developer can install in any order
- `/resume-app` works per-app
- `/list-waiting-apps` shows all currently waiting

```
$ /list-waiting-apps

WAITING ON HUMAN INSTALL (5 apps):
  1. Recharge Subscriptions — blocking 3 tasks — installer: Daniel
  2. Klaviyo — blocking 2 tasks — installer: John
  3. Yotpo Reviews — blocking 4 tasks — installer: John
  4. Tapcart Mobile — blocking 7 tasks — installer: Daniel
  5. Loop Returns — blocking 2 tasks — installer: John

INSTALLED (8 apps):
  [list]

Total tasks blocked: 18
Total tasks unblocked + queued: 23
```

---

## Time tracking

Track:
- `expected_install_date` — when human committed to install
- `actually_installed_date` — when confirmed
- Drift between expected and actual

If `expected_install_date` passes without install:
- PM Agent surfaces at next brief check
- After 2x expected delay, escalate to Internal PM
- After 3x, surface as project risk in milestone review

---

## Sensitive credentials handling

App installs often generate API keys / tokens. NEVER:
- Store keys in project.json directly
- Commit keys to git
- Pass keys via chat messages

Always:
- Store in environment variables (`.env.local`, GitHub Secrets, etc.)
- Reference by name in project.json: `"api_key_env_var": "RECHARGE_API_KEY"`
- Verify presence at install validation (env var set, not the value)

---

## Anti-patterns

1. **Agent tries to install the app autonomously.** Forbidden. Apps requiring human install require human install.

2. **Orchestrator silently skips blocked tasks.** Must surface clearly.

3. **Resume without validation.** Validation prevents false positives ("yes I installed it" but actually didn't).

4. **Validation check uses brittle approach** (e.g., scraping HTML). Use APIs where possible; fall back to manual where not.

5. **Hardcoding `expected_install_date` to today.** Use realistic dates with buffer.

6. **Treating manual install as a separate workflow.** It's the same workflow with `validation_check: manual`. Don't fork the code path.

7. **No PM Agent visibility on waiting apps.** PM must include in brief checks — they are project risks.

---

## Integration

- **PM auto-trigger** — brief checks include `third_party_apps_waiting` summary
- **HANDOFF.md** — "Client blockers" section pulls from this list
- **Build plan preview** — paused tasks marked clearly with "(waiting on [app-name])" suffix
- **G6 pre-launch** — verifies ALL apps in `third_party_apps_installed` (not `waiting`)
- **Failure modes** — apps that exceed 3x expected install time become FM-NNN candidates

---

Last reviewed: 2026-05-27 by Claude (v1.5.2 Phase 2)
Next review due: 2026-08-27
