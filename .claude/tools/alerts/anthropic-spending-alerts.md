# Anthropic API Spending Alerts

> Configure spending alerts + caps in the Anthropic API console.
> Per A10 (hard spend cap), G3 (daily workspace cap), and H4 (code review cost guardrails).

---

## Why this matters

Without spend caps, AI costs can spike unexpectedly (e.g., runaway loops, large unexpected PR reviews, accidental over-use).

Setting hard caps + alerts protects against bill shock.

---

## Configuration steps

### Step 1: Set workspace-level spend limit

1. Go to Anthropic Console: https://console.anthropic.com/
2. Settings → Limits
3. Set **Monthly spend limit** for your workspace
   - Suggested for small agency: $500-1,000/month initial
   - Adjust up after measuring actual usage

### Step 2: Set daily spend cap

1. Settings → Limits → Daily spend limit
2. Set daily cap based on workspace cap / 30
   - Example: $750/month → ~$25/day
3. When daily cap reached, API requests fail with rate limit error (rest of day)

### Step 3: Configure usage alerts

1. Settings → Notifications
2. Add email recipients for usage alerts
   - Recommended: Tech Lead + Internal PM
3. Configure alert thresholds:
   - **80% of monthly cap** — warning
   - **95% of monthly cap** — critical
   - **100% (hit cap)** — emergency

### Step 4: Configure per-project tracking (within projects)

Each project's `project.json` includes:

```json
{
  "budget": {
    "token_cap": 5000000,           // 5M tokens for this project
    "token_used": 0,
    "token_alert_threshold": 4000000, // alert at 80%
    "cost_estimate_usd": 50,
    "alerts_sent": []
  }
}
```

Orchestrator (per `_spine/orchestrator/knowledge/05-escalation-paths.md`) checks before invoking expensive sub-agents.

### Step 5: Monitor monthly

At the end of each month:

1. Check actual spend vs. cap
2. Compare to estimated cost from each project's `budget.review_costs[]`
3. Identify any anomalies (one project significantly over estimate)
4. Adjust caps for next month if needed

---

## Cost-saving strategies

### Strategy 1: Prompt caching (per A8)

Anthropic offers 90% discount on cached prompt content. The KB files don't change per project — cache them.

Enabled automatically when using `cache_control: {"type": "ephemeral"}` in Messages API.

The `run-code-review.py` script in `tools/scripts/` does this automatically.

### Strategy 2: Model selection per task (per G4)

- Haiku for validators, classifiers, simple lookups
- Sonnet for default workhorse
- Opus only for complex reasoning

Don't default to Opus.

### Strategy 3: Batch API for non-urgent work (per A9)

Anthropic Batch API offers 50% discount for batched async processing.

Use for:
- End-of-day milestone reports
- Bulk content generation
- Cross-project analysis

NOT for:
- Real-time agent invocations
- Per-PR code reviews

### Strategy 4: Daily review budget cap (per H4)

Default: $10/day for code reviews across all projects.

Enforce in `run-code-review.py`:
- Read cumulative day spend
- Block if exceeded
- Senior dev override available

### Strategy 5: Defer expensive operations

For projects approaching budget cap, defer to launch:
- Skip per-PR code reviews
- Run one comprehensive review at pre-launch

---

## Per-project cost estimation

When PM Agent estimates a project, it includes API cost estimates:

```
Typical project costs:

Small redesign (4-6 weeks):
- PM Agent invocations: ~$3-5
- Designer Agent invocations: ~$2-4
- Frontend Agent invocations: ~$5-10
- QA Agent invocations: ~$3-5
- Code review (per PR): ~$0.20-0.50 (10-30 PRs = $5-15 total)
- Delivery Head: ~$1-2

Project total: $20-40 in API costs
```

```
Medium redesign or new build (8-12 weeks):
- All agents: $30-60
- Code review: $15-30
Project total: $45-90
```

```
Large or complex (15+ weeks, headless, multi-platform):
- All agents: $100-200
- Code review: $30-60
Project total: $130-260
```

Build into project quote — usually negligible vs. project value, but track.

---

## Cost overage protocol

If a project approaches budget cap:

### At 80% spend
Orchestrator surfaces:
```
⚠ Project Aurora Skincare has used 80% of token budget ($X of $Y).
   At current pace, will exhaust within ~5 sprints.
   
   Options:
   1. INCREASE_CAP $Z (senior approval + log)
   2. OPTIMIZE — switch agents to lighter models where possible
   3. DEFER reviews to milestone-level batches
   4. ACCEPT — continue and re-evaluate next milestone
```

### At 95% spend
Orchestrator pauses new agent invocations:
```
🛑 Project approaching budget cap. Cannot invoke new agents until:
   - Cap increased (senior approval)
   - OR critical work only
   
   Current burn rate: $X/day. Days remaining: Y.
```

### At 100% (cap reached)
Orchestrator stops invocations.
- Senior dev decides: cap increase, optimize, OR halt work
- All decisions logged in audit_log
- Reported at monthly retro

---

## Anthropic billing details

Pricing as of 2026-05-25 (verify current):

### Claude Sonnet 4.6
- Input: $3 per 1M tokens
- Output: $15 per 1M tokens
- Cached input: $0.30 per 1M tokens (90% off)

### Claude Haiku 4.5
- Input: $0.80 per 1M tokens
- Output: $4 per 1M tokens

### Claude Opus 4.6
- Input: $15 per 1M tokens
- Output: $75 per 1M tokens

### Batch API
- 50% discount on input + output
- Async processing (results in hours, not seconds)

Verify current pricing at: https://www.anthropic.com/pricing

---

## Monthly review

At each Monthly System Retro (K5), review:

1. Total API spend (vs. cap)
2. Per-project spend variance
3. Most expensive operations (per agent, per project)
4. Cost-per-project trend (should be flat or decreasing with KB improvements)
5. Token caching hit rate
6. Optimization opportunities

Update caps, alert thresholds, and per-project budgets based on data.

---

## Anti-patterns

1. **No spending cap.** Bills can spiral. Always set a cap.

2. **Alerts going to noreply email.** Make sure someone actually monitors alert emails.

3. **Setting cap too low.** Forces overrides on every project. Calibrate to actual usage.

4. **Ignoring 80% alerts.** Surprise hit at 100%. Investigate at 80%.

5. **No per-project tracking.** Can't identify which project is expensive.

6. **No prompt caching.** Paying full price for content that should be 90% off.

7. **No model selection discipline.** Defaulting everything to Sonnet (or worse, Opus).

---

Last reviewed: 2026-05-25 by Claude (initial)
Next review due: 2026-08-25
