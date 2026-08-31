---
tier: 1
load_when: ["pm-active"]
description: "v1.5.2 Phase 2 — PM Agent runs on a schedule, not just when asked. Addresses Kitchen Blockers pilot Gap 2 (manual PM invocation)."
---

# 12 — PM Agent Auto-Trigger Protocol

> v1.5.2 Phase 2 — PM Agent runs on a schedule, not just when asked. Addresses Kitchen Blockers pilot Gap 2 (manual PM invocation).

---

## Why this exists

Kitchen Blockers pilot: PM Agent was invoked manually twice ("pm agent please check progress", "pm agent what next"). Between those invocations, the project drifted — content migration needs surfaced reactively, not proactively. Social URLs landed mid-session instead of at kickoff. About Us page, homepage banners, order confirmation were identified as M3 gaps only when PM was asked.

The pattern: **PM is silent unless invoked → drift accumulates → drift caught late → rework.**

This protocol makes PM Agent self-scheduling.

---

## Trigger conditions (any one is sufficient)

PM Agent activates automatically when ANY of these are true:

### Trigger 1 — Task count threshold
**Every 5 completed tasks** within a sprint, PM Agent runs a brief check.

Counting: a "task" is a completion entry in `project.json.sprints[].tasks_completed[]`. Threshold counter resets per sprint.

### Trigger 2 — Time elapsed since last PM activity
**Every 90 minutes** of active session time without PM Agent activity, PM runs a check.

Active session time = orchestrator-tracked working time; excludes idle gaps > 5 min.

### Trigger 3 — Sprint completion
At the end of every sprint (when `sprints[N].status` transitions to `completed`), PM Agent runs a full sprint review.

### Trigger 4 — Milestone transition
When `active.milestone` changes (e.g., M2 → M3), PM Agent runs a milestone-wise review.

### Trigger 5 — Gate decision pending
When a gate is awaiting confirmation for > 60 min, PM Agent surfaces a reminder.

### Trigger 6 — New artifact surfaced mid-session
When the client/developer adds new content (social URLs, brand assets, content for new pages) mid-session, PM Agent runs an intake re-validation.

### Trigger 7 — Explicit invocation
Developer types `/pm` or "pm agent please check" — runs immediately.

---

## What runs at each trigger

### Brief check (Triggers 1, 2, 5)
**Output: 5-line status ping**

```markdown
## PM Brief — [client] — [timestamp]
- **Current:** [milestone] / [sprint] — [task count]/[planned]
- **Drift:** [None | Mild | Significant — explanation]
- **Blockers:** [None | List]
- **Next 3:** [task1, task2, task3]
- **Surface:** [Nothing | Any items needing attention from team/client]
```

Not a full report. Not a discussion. Just a checkpoint.

### Sprint review (Trigger 3)
**Output: structured sprint retro**

- Tasks completed vs planned
- Tasks slipped to next sprint
- Quality assessment (any P1/P2 issues caught)
- Estimate accuracy
- KB candidates from this sprint
- Next sprint priorities

### Milestone review (Trigger 4)
**Output: milestone-wise document (NOT sprint-wise)**

Per v1.5.2 decision — documentation is milestone-wise, not sprint-wise. At milestone transition:

- What shipped in this milestone (cross-sprint summary)
- Gaps identified at PM review
- Client-blocking items
- Next milestone scope
- Per `08-update-document-templates.md` → milestone update template

### Intake re-validation (Trigger 6)
When new artifacts surface mid-session, PM checks:
- Is this an intake item that should have been captured at G0?
- If yes: flag it as an intake gap (FM-NNN candidate)
- Update intake artifacts in project workspace
- Determine if the new info changes existing decisions
- If yes: surface the conflict to orchestrator

---

## Proactive content migration scan (NEW for v1.5.2)

At Trigger 3 (sprint completion) AND Trigger 4 (milestone transition), PM Agent additionally runs a **content migration scan**:

### Scan procedure

1. Read SOW (cached) — extract all content references
2. Identify content types mentioned:
   - Blog posts / articles
   - CMS pages (About, Contact, FAQ, Policies, etc.)
   - Product copy
   - Customer accounts / orders (data migration)
   - Reviews / testimonials
   - Email templates
   - Custom metafields
3. For each content type, check status:
   - [ ] Identified in SOW
   - [ ] Migration plan exists in project workspace
   - [ ] Client has been asked to confirm/provide content
   - [ ] Migration sprint(s) scheduled
   - [ ] Migration executed
4. Surface gaps:
   - Content types in SOW that have NO migration plan → flag at NEXT PM brief
   - Content types with "ask client to confirm" status > 7 days → escalate to Internal PM
   - App-rendered content detected → flag immediately as "requires client content"

### App-rendered page detection (v1.5.5 — explicit pattern list)

When scanning a live site for migration, PM Agent looks for HTML signatures of these common page-builder apps. If detected, flag the affected pages as "requires client content" — the AI cannot scrape the rendered output and reproduce it.

**Shopify page-builder apps:**
- **PageFly** — `data-pagefly`, `pf-*` class names, `pagefly-app.com` script tags
- **EComposer** — `data-ecom`, `ec-*` class names, `ecomposer.io` script tags
- **GemPages** — `data-gem`, `gp-*` class names, `gempages.net` script tags
- **Shogun** — `data-shogun`, `sg-*` class names, `getshogun.com` script tags
- **PageBuilder by Buildify** — `data-buildify`, `bf-*` class names
- **Replo** — `data-replo`, `replo-*` class names, `replo.app` script tags
- **Foxify Page Builder** — `data-foxify`, `fox-builder-*` class names

**Shopify product-bundle apps (rendered content):**
- **Frequently Bought Together by Code Black Belt** — script src includes `cbbapp.com`
- **Bold Bundles** — script src includes `boldcommerce.com`

**Shopify subscription/membership apps (cart customization):**
- **Recharge** — script src includes `rechargecdn.com` OR `recharge-payments.com`
- **Bold Subscriptions** — script src includes `boldcommerce.com`
- **Skio** — script src includes `skio.com`

**WordPress page-builder apps:**
- **Elementor** — `data-elementor` attributes, `elementor-*` class names
- **Divi** — `et_pb_*` class names, `et-builder` markers
- **WPBakery (Visual Composer)** — `vc_*` class names, `vc_row` shortcodes
- **Beaver Builder** — `fl-*` class names, `fl-builder` markers
- **Bricks** — `brxe-*` class names, `data-brxe-*` attributes

**Detection workflow:**

1. PM Agent fetches the live page HTML (when migration plan calls for live scrape)
2. Runs detection regex against the HTML
3. If app signature found:
   - Add to `/projects/[client]/content-migration/app-rendered-pages.md`
   - Format:
     ```
     | URL | Detected app | Confidence | Migration approach |
     |-----|--------------|------------|--------------------|
     | /pages/about | PageFly | high | Request raw content from client (text + image assets) |
     ```
   - Surface at next PM brief check
   - Block migration sprint for that page until client provides raw content
4. Avoid scraping the rendered HTML and re-coding — it's brittle and misses the app's interactive layer

### Pattern from Kitchen Blockers pilot

The Kitchen Blockers SOW referenced blog migration and CMS page migration. Both were triggered reactively when the developer asked "can you migrate blog from live" and "please migrate cms pages from live as client want it same". This protocol surfaces those needs PROACTIVELY at the first milestone PM review, so client content gathering happens in parallel with build work, not in series.

App-rendered detection avoids the additional failure mode of "scraped a PageFly page, rebuilt it in pure Liquid, but the interactive parts (forms, sliders, etc.) don't work" — the only correct fix is to ask the client for raw content.

---

## Implementation in orchestrator

Orchestrator maintains state in `project.json`:

```json
{
  "pm_auto_trigger_state": {
    "last_pm_activity": "2026-05-27T14:32:00Z",
    "tasks_since_last_pm_check": 3,
    "current_sprint_id": "M2-S3",
    "current_milestone": "M2",
    "pending_gates": [],
    "last_milestone_transition": "2026-05-26T10:00:00Z"
  }
}
```

After every task completion, orchestrator runs:

```pseudo
if (tasks_since_last_pm_check >= 5) {
  invoke_pm("brief_check")
  reset_counter()
}

if (minutes_since_last_pm_activity >= 90) {
  invoke_pm("brief_check")
}

if (sprint_status_changed_to_completed) {
  invoke_pm("sprint_review")
}

if (milestone_changed) {
  invoke_pm("milestone_review")
  invoke_pm("content_migration_scan")
}

if (gate_pending_minutes >= 60) {
  invoke_pm("gate_reminder")
}

if (new_artifact_received_mid_session) {
  invoke_pm("intake_re_validation")
}
```

---

## What PM Agent does NOT do automatically

- **Send messages to client** — blocked by outbound-comms-gate
- **Modify project scope** — surfaces scope drift but doesn't change scope without approval
- **Override gates** — surfaces stuck gates but doesn't approve
- **Reschedule** — surfaces timeline risk but doesn't change estimates without sign-off
- **Spend API budget on long-form reports** — brief checks are intentionally 5 lines, not a 2000-token wall

---

## Brief check token budget

Per Tier F (cost optimization), PM brief checks have hard caps:

- Input: load only persona + pm-agent SKILL + project.json snapshot (cached)
- Output: ≤ 200 tokens for brief check, ≤ 800 for sprint review, ≤ 1500 for milestone review
- No long-form prose, no "let me think through this..." chains

If PM thinks it needs more, it explicitly requests: "I need to do deeper analysis on X — costs roughly $Y. Approve?"

---

## Anti-patterns

1. **PM brief becomes a wall of text.** Defeats the purpose. Keep to 5 lines.

2. **PM checks fire constantly.** If triggers are too frequent, devs ignore them. Tune cadence.

3. **PM reports drift but no one acts.** Brief check should suggest one concrete next action per drift item.

4. **Content migration scan finds nothing because SOW wasn't parsed.** Run on full SOW text, not summary.

5. **PM Agent runs but doesn't write to project.json.** Every PM activation must update `pm_auto_trigger_state.last_pm_activity`.

6. **PM Agent self-approves its own findings.** Self-approval prohibition applies — PM surfaces, humans decide.

---

## Cost discipline

PM Agent auto-triggers cost API tokens. Estimate:
- Brief check: ~$0.05 (200 in / 200 out, mostly cached)
- Sprint review: ~$0.15
- Milestone review: ~$0.30
- Content migration scan: ~$0.20 (one-time per milestone)

Over a 6-8 week project with 4 milestones and ~30 sprints, total auto-trigger cost ~ $5-8. Negligible vs. the rework cost of drift.

If costs spike unexpectedly, check `pm_auto_trigger_state` for excessive firing — likely a misconfigured trigger.

---

Last reviewed: 2026-05-27 by Claude (v1.5.2 Phase 2)
Next review due: 2026-08-27
