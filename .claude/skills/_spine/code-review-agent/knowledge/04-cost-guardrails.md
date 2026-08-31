---
tier: 2
load_when: ["agent-specific-detail"]
description: "Per H4 decisions: per-PR cost estimate, daily review budget cap, per-project review budget cap, \"defer to launch\" mode option, toggle per project. Prevents runaway API costs from automated reviews."
---

# 04 — Cost Guardrails

> Per H4 decisions: per-PR cost estimate, daily review budget cap, per-project review budget cap, "defer to launch" mode option, toggle per project. Prevents runaway API costs from automated reviews.

---

## Why cost guardrails matter

Custom Claude review (via H4 GitHub Action) costs Claude API tokens per PR. Without guardrails:
- One PR with 2000 lines of code = could cost $1-3 to review
- 20 PRs per project = $20-60 in review costs alone
- Across 50 projects per year = $1000-3000 in review API costs

Manageable. But without limits, costs can spike unexpectedly (e.g., AI agent stuck in loop opens 50 PRs).

---

## The 5 cost guardrails

### Guardrail 1: Per-PR cost estimate

Before running a review, estimate the cost.

```python
def estimate_review_cost(pr_diff):
    # Token estimate based on diff size + context loaded
    diff_tokens = estimate_tokens(pr_diff)
    context_tokens = estimate_context_tokens()  # KB files, etc.
    total_input_tokens = diff_tokens + context_tokens

    # Estimated output tokens (review comments + analysis)
    estimated_output_tokens = min(total_input_tokens * 0.3, 4000)

    # Cost calculation (Sonnet rates as of build date)
    input_cost = total_input_tokens * 0.000003   # $3/M tokens
    output_cost = estimated_output_tokens * 0.000015  # $15/M tokens

    # With prompt caching: ~70% input cost reduction on cached content
    cached_input = context_tokens * 0.000003 * 0.10  # 90% discount
    fresh_input = diff_tokens * 0.000003
    input_cost_with_cache = cached_input + fresh_input

    total_estimated = input_cost_with_cache + output_cost
    return total_estimated
```

### Guardrail 2: Per-PR cost threshold

If estimated cost > $2 for a single PR, require approval before running.

```python
def should_review(pr):
    estimated_cost = estimate_review_cost(pr.diff)

    if estimated_cost > 2.00:
        post_comment(pr, f"""
        ⚠ Large PR detected ({pr.lines_changed} lines)
        Estimated review cost: ${estimated_cost:.2f}

        Choose:
        - `/review approve` → proceed with full review
        - `/review summary-only` → run lightweight review (cheaper, less thorough)
        - `/review skip` → skip AI review (rely on linters + human review)
        - `/review defer` → defer to pre-launch comprehensive review
        """)
        return WAIT_FOR_APPROVAL

    return PROCEED
```

### Guardrail 3: Daily review budget cap

Default: **$10/day per workspace** (across all projects).

Alert at 80% ($8). Hard stop at 100% ($10).

```python
def check_daily_budget():
    today_spend = get_today_review_spend()
    daily_cap = 10.00  # configurable

    if today_spend >= daily_cap:
        return BLOCKED, f"Daily review budget exhausted (${today_spend:.2f})"

    if today_spend >= daily_cap * 0.8:
        return WARNING, f"Daily budget at {today_spend/daily_cap*100:.0f}%"

    return OK, None
```

When BLOCKED:
- New PRs don't get auto-reviewed
- Devs notified: "AI review paused. Use linters + human review today. Resumes tomorrow OR ask senior to override."
- Override available via: `/review override` (logged)

### Guardrail 4: Per-project review budget cap

Default: **$20/project** across the entire project's PR lifecycle.

Alert at 80% ($16). Soft stop at 100% ($20) with senior approval option.

```python
def check_project_budget(project_id):
    spend = get_project_review_spend(project_id)
    cap = get_project_review_cap(project_id)  # default 20

    if spend >= cap:
        return OVER_BUDGET, f"Project budget exceeded: ${spend:.2f} / ${cap:.2f}"

    if spend >= cap * 0.8:
        return WARNING, f"Project budget at {spend/cap*100:.0f}%"

    return OK, None
```

When OVER_BUDGET:
- New PRs in this project don't get auto-reviewed
- Internal PM notified
- Options:
  - Senior dev approves cap increase
  - Switch to "defer to launch" mode for remaining work
  - Disable AI review for this project (linters + human review only)

### Guardrail 5: "Defer to launch" mode

Optional per project. When enabled:
- Skip per-PR reviews entirely
- Run ONE comprehensive review at pre-launch (across all changes from develop to main)
- Cheaper for small projects, but loses per-PR feedback loop

```python
def is_defer_mode(project_id):
    return read_project_json()["code_review"]["mode"] == "defer-to-launch"

def review_workflow():
    if is_defer_mode():
        # Don't review per-PR
        return SKIP_PR_REVIEW

    # Normal per-PR review
    return RUN_REVIEW
```

When to enable defer mode:
- Small project (< 10 PRs expected)
- Tight budget
- Highly experienced team that doesn't need per-PR AI guidance
- Project with strong linter coverage that catches most issues

When NOT to enable:
- Large project (20+ PRs)
- Junior developers on team
- Sensitive scope (payment, auth — needs per-PR scrutiny)

---

## Project-level toggle

Each project has its own configuration in `project.json`:

```json
"code_review": {
  "enabled": true,
  "mode": "per-pr" | "defer-to-launch" | "disabled",
  "budget": {
    "per_project_cap_usd": 20,
    "spent_usd": 0
  },
  "rules": {
    "skip_for_small_prs": false,        // skip review if < 50 lines changed
    "human_only_for_sensitive": true     // sensitive paths: human only, no AI
  }
}
```

Default: enabled, per-pr mode, $20 cap.

Override per project at intake (PM Agent asks: "Enable AI code review for this project? Default yes.").

---

## Cost tracking + reporting

Every review logs its cost:

```json
// In project.json
"budget": {
  "review_costs": [
    {
      "pr_number": 142,
      "pr_title": "feat: add hero section",
      "input_tokens": 12000,
      "output_tokens": 2400,
      "input_cost_usd": 0.036,
      "output_cost_usd": 0.036,
      "total_cost_usd": 0.072,
      "reviewed_at": "2026-05-30T14:32:00Z"
    }
  ],
  "review_total_spent_usd": 0.072
}
```

PM Agent's milestone update (per `_spine/pm-agent/knowledge/08-update-document-templates.md`) includes review costs as a line item:

```
Sprint S2.4 — AI code review costs:
- 3 PRs reviewed
- Total cost: $0.43
- Average per PR: $0.14
```

Internal-facing only (not in client reports).

---

## Cost-aware review strategies

### Strategy 1: Cached context (default)

Use prompt caching (per A8) to reduce input costs.
- KB files (`forbidden.md`, etc.) cached → 90% discount on repeated access
- Schema definitions cached
- Project conventions cached

This is the default. Designed into the GitHub Action workflow.

### Strategy 2: Lightweight review for small PRs

For PRs < 50 lines changed, run lighter review:
- Skip cost-heavy checks (performance impact estimation requires running Lighthouse)
- Focus on: hallucinated APIs, forbidden patterns, security
- Cost: ~$0.02-0.05 per PR

### Strategy 3: Diff-only review for large PRs

For PRs > 2000 lines changed:
- Review only the diff (not full file context)
- Focus on the changes, not the surrounding code
- Cost: ~$0.50-1.00 per PR (vs. $2-3 with full context)

Trade-off: misses some cross-file pattern detection. Acceptable for large PRs.

### Strategy 4: Sample review for repetitive PRs

If PR has many similar changes (e.g., 20 product imports), review a sample:
- Review first 3 examples thoroughly
- Flag if patterns hold across all
- Estimate cost based on sample

### Strategy 5: Skip purely cosmetic PRs

PRs that only change docs, comments, or formatting (no functional code):
- Skip AI review entirely
- Linters handle these
- Cost: $0

Detect via diff analysis (no functional code paths touched).

---

## Cost optimization tips

For low-cost-per-project:

1. **Enable prompt caching** (A8) — biggest single optimization
2. **Use Haiku for simple checks** — pattern matching, lookup checks
3. **Use Sonnet only for analysis** — semantic understanding
4. **Skip review for safe path changes** — docs, comments, tests
5. **Batch PRs from same dev session** — review multiple together where possible
6. **Defer comprehensive review to milestone** — instead of pre-PR for low-risk changes

---

## Override mechanism

When cost guardrails block a review, senior dev can override:

```
/review override [reason]
```

Logged to audit_log:
```json
{
  "timestamp": "2026-05-30T14:32:00Z",
  "actor": "senior-dev-email@webdesksolution.ca",
  "actor_type": "human",
  "action": "review_cost_override",
  "details": {
    "pr_number": 142,
    "reason": "Critical sprint deadline; reviewer accepting cost",
    "approved_cost_usd": 3.50,
    "actual_cost_usd": null  // updated after review runs
  }
}
```

Reviewed at Monthly System Retro (K5). If frequent, increase cap or restructure.

---

## Monthly cost review

At month end (K5 retro):

```
Review cost summary (last 30 days):

Total review API spend: $87.50
- Across 12 projects
- Average per project: $7.29
- Average per PR: $0.18

Per-project breakdown:
1. Aurora Skincare Redesign: $14.32 (45 PRs)
2. Bakery Co New Build: $11.20 (38 PRs)
... etc

Cost trends:
- vs. prior month: -12% (caching adoption improved)
- vs. budget ($150/mo): 58% utilized

Projects at or near cap:
- Migration Project X: $18.50 / $20 (92%)
- Complex Headless Y: $19.00 / $20 (95%)

Action items:
- Increase Migration Project X cap by senior approval
- Investigate why Headless Y has more PRs than typical
```

---

## Default budgets summary

```
Per-PR threshold:           $2.00  (above = request approval)
Daily workspace cap:        $10.00 (across all projects)
Per-project cap:            $20.00 (default; can be raised per project)
Daily warning at:            80% of cap
Project warning at:          80% of cap
Override path:               Senior dev approval, logged
Monthly workspace budget:   ~$150 (informational, not enforced)
```

These are starting defaults. Adjust based on actual usage patterns after 3 months.

---

## Anti-patterns

1. **No cost guardrails.** Costs spike unexpectedly. Always set caps.

2. **Cap too low.** Forces overrides on every PR. Calibrate to actual usage.

3. **Cap too high.** Wastes money on marginal reviews. Calibrate.

4. **No tracking.** "How much did we spend?" → "Don't know." Track every review.

5. **Override fatigue.** If senior approves every override, the cap is wrong.

6. **No alerts.** Surprises at month-end. Alert at 80%.

---

Last reviewed: 2026-05-24 by Claude (initial)
Next review due: 2026-08-24
