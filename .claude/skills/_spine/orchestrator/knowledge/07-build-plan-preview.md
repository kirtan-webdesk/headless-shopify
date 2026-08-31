---
tier: 1
load_when: ["task-execution"]
description: "v1.5.2 — every task previews before it executes. Addresses Kitchen Blockers Gap 4 (one-word approvals without seeing the plan) and Gap 1 (sequential \"next\" prompts that approved blindly)."
---

# 07 — Build Plan Preview Pattern

> v1.5.2 — every task previews before it executes. Addresses Kitchen Blockers Gap 4 (one-word approvals without seeing the plan) and Gap 1 (sequential "next" prompts that approved blindly).

---

## Why this exists

Kitchen Blockers pilot:
- About Us page approved with "yes" — client never saw what would be built
- Homepage banners approved with "proceed" — no preview of what banners
- 6+ "next" prompts in a row — each one approving an unseen plan
- Mid-session: surprises (content sources mid-build, missing intake items)

The fix is NOT to remove auto-sequencing — that defeats the speed goal. The fix is **every task surfaces a 2-line plan first**, and the user can approve/modify/skip before code is written.

---

## The pattern

Before executing ANY task that produces files or changes state, the orchestrator emits a structured preview:

```
TASK [N/M]: <task name>
WHAT: <one line — what this task builds or changes>
FILES: <list of files this task will create/modify>
APPROX: <token cost estimate + time estimate>
PROCEED? [Y/edit/skip/explain]
```

User responses:
- `Y` (or `yes`, or just hit enter) → execute
- `edit <change>` → revise the plan based on the change, re-preview
- `skip` → skip this task, move to next
- `explain` → orchestrator expands the plan with more detail
- Silence for > 60s → orchestrator pauses, surfaces a reminder

---

## Example

```
TASK [3/12]: Build About Us page
WHAT: kb-page-about.liquid + page.about-us.json with hero, stats, mission, pillars, CTA sections
FILES: sections/kb-page-about.liquid, templates/page.about-us.json
APPROX: ~3K output tokens, ~2 min
PROCEED? [Y/edit/skip/explain]
```

User: `edit add team photos section before CTA`

```
TASK [3/12]: Build About Us page (revised)
WHAT: kb-page-about.liquid + page.about-us.json with hero, stats, mission, pillars, team-photos, CTA sections
FILES: sections/kb-page-about.liquid, templates/page.about-us.json
APPROX: ~3.5K output tokens, ~2.5 min
PROCEED? [Y/edit/skip/explain]
```

User: `Y`

→ executes.

---

## Auto-sequencing with preview

This pattern combines well with auto-chained task queues. The flow becomes:

1. Orchestrator gets approval on overall plan (per sprint or per milestone)
2. Orchestrator queues N tasks
3. For each task in queue:
   - Emit preview
   - Wait for confirm (Y / edit / skip)
   - Execute on confirm
   - Move to next
4. End of queue: summarize what was built

User reviews the plan ONCE per task instead of being asked "next?" repeatedly.

---

## Preview format requirements

- **One line for WHAT.** No paragraphs. If the task needs a paragraph, it's too big — split it.
- **Files list is exhaustive.** Every file this task touches must be listed. Surprises post-execution are unacceptable.
- **APPROX is real.** Token estimate based on similar past tasks (orchestrator tracks). Time estimate based on file count + complexity.
- **No prose preamble.** Don't write "I'm going to..." or "Let me now...". Just the structured fields.

---

## When NOT to preview

Some operations don't need a preview:

| Operation | Reason |
|-----------|--------|
| Reading files | No state change |
| Running validators | No state change |
| Status reports | Read-only |
| PM brief checks | Already in 5-line format |
| Gate decision logging | Triggered by explicit user decision |
| Internal token accounting | No user-facing change |

If the operation only consumes tokens (no file changes, no state mutations), preview is optional. Use judgment.

---

## When preview is MANDATORY

| Operation | Why mandatory |
|-----------|--------------|
| Any file create/modify/delete | Kitchen Blockers gap |
| Any push (dev/staging/live) | Destructive — needs explicit confirm |
| Any cost > $0.50 single operation | Budget visibility |
| Any change to gate state | High-impact |
| Any agent invocation > 10K tokens estimated | Cost discipline |
| Any external API call (besides Claude API) | Side effects |

---

## Token-cost estimation

Orchestrator maintains running estimates per task type:

```json
{
  "task_cost_estimates": {
    "create_liquid_section": {"avg_output_tokens": 2500, "samples": 47},
    "create_page_template_json": {"avg_output_tokens": 800, "samples": 32},
    "build_full_page": {"avg_output_tokens": 4500, "samples": 12},
    "pm_brief_check": {"avg_output_tokens": 200, "samples": 89},
    "...": "..."
  }
}
```

Estimates calibrate over time. Initial values use defaults until samples accumulate.

---

## Batch preview for known-safe sequences

For sequences where each task is small and well-understood (e.g., generating 10 similar product card variants), batch-preview:

```
TASKS [5-14/14]: Generate 10 product card variants for collection page
WHAT: Build product-card-variant-{1..10}.liquid (template + minimal styling)
FILES: sections/product-card-variant-1.liquid through -10.liquid
APPROX: ~8K output tokens total (~800 each), ~5 min
PROCEED? [Y/edit/skip/explain]
```

One confirm for the batch instead of 10. User can still `edit` to drop specific variants.

---

## Integration with shortcodes

- `/preview-mode on` — every task surfaces preview (default behavior)
- `/preview-mode off` — disables preview (NOT RECOMMENDED — only for batch automation)
- `/preview-mode batch` — batch-preview safe sequences

---

## State tracking

Orchestrator records in `project.json`:

```json
{
  "preview_state": {
    "previewed_tasks": 47,
    "auto_confirmed": 39,
    "edited": 5,
    "skipped": 3,
    "average_confirm_latency_seconds": 12
  }
}
```

If `auto_confirmed` ratio is > 95% AND `average_confirm_latency_seconds` is < 5s, the user is rubber-stamping. Surface a reminder: "You've auto-confirmed 39/47 previews in < 5s. Are you reading them?"

---

## Anti-patterns

1. **Preview that's actually 3 paragraphs.** Defeats the purpose. Keep it to 4 lines max.

2. **Preview missing files list.** User can't approve what they can't see.

3. **Auto-confirm without preview.** Even fast users want the option to glance.

4. **Preview emitted AFTER execution.** That's a summary, not a preview.

5. **Same preview for vastly different tasks.** Template the format but make WHAT specific.

6. **Token estimate is wildly wrong.** Calibrate. If your estimate is 1K but actual is 8K, you have a systematic bias.

7. **User says `edit X` but next preview ignores edit.** Read the user's intent and incorporate.

8. **No way to skip.** Sometimes user wants to defer a task. `skip` must work.

---

## Cost discipline

Preview itself costs tokens (orchestrator output). Estimate: ~100 output tokens per preview. For a 12-task milestone, that's 1.2K extra output tokens = ~$0.02. Negligible vs. the cost of executing a wrong task.

The 95% rubber-stamping detection adds a small additional cost when triggered. Acceptable.

---

Last reviewed: 2026-05-27 by Claude (v1.5.2 Phase 2)
Next review due: 2026-08-27
