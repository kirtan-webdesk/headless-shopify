---
tier: 3
load_when: ["human-reference-only"]
---

# 06 — Pilot Success Metrics

> How to measure if the pilot worked. Set these targets UPFRONT (before starting), not in retrospect.

---

## Why set metrics upfront

If you decide success criteria after the project, bias creeps in:
- "Well, that one issue wasn't really that bad..."
- "I think we mostly succeeded..."
- "Let's just say we passed..."

Upfront criteria = honest evaluation.

Set these during `02-pilot-kickoff-checklist.md` prep, sign off, then evaluate post-launch.

---

## The 7 success criteria

### Metric 1: Project shipped on acceptable timeline
**Target:** Launched within 30% of estimated timeline.

Example: estimated 8 weeks, acceptable launch is by week 10.5.

**Why this matters:** If the system slows projects down by > 30%, it's not worth the quality benefits.

**Acceptable variance:** Pilots typically run 10-20% over estimate due to learning curve. > 30% indicates real friction.

**Measure:** project actual weeks / project estimated weeks

**Pass:** ≤ 1.30
**Partial:** 1.30 – 1.50
**Fail:** > 1.50

---

### Metric 2: Client satisfied with delivery
**Target:** Client expresses satisfaction OR NPS score ≥ 8/10.

**Why this matters:** No matter how well the system worked internally, if client is unhappy, pilot failed.

**Measure:** subjective + NPS if collected

**Sources:**
- Client feedback during project
- Post-launch survey (if your agency does NPS)
- Client communication tone
- Whether they would refer you to others

**Pass:** Clear satisfaction
**Partial:** Mixed feedback
**Fail:** Clear dissatisfaction

---

### Metric 3: Gates passed without major override
**Target:** ≤ 1 override across all gates.

**Why this matters:** Overrides indicate the system is too strict OR team isn't engaging properly. Either is a problem.

**Measure:** Count of `OVERRIDE` decisions in `project.json.audit_log`.

**Pass:** 0-1 overrides
**Partial:** 2-3 overrides
**Fail:** 4+ overrides

If many overrides: examine. Were the gates wrong? Or was the team rushing?

---

### Metric 4: P1 bugs caught post-launch
**Target:** ≤ 3 P1 bugs in first 30 days post-launch.

**Why this matters:** P1 bugs (site down, checkout broken, etc.) = real client impact. If many slip through the system's QA layers, the system isn't catching enough.

**Measure:** Count of P1 bugs reported in first 30 days.

**Pass:** 0-3 P1 bugs
**Partial:** 4-7 P1 bugs
**Fail:** 8+ P1 bugs

Caveat: some P1s are unavoidable (third-party app changes, etc.). Filter for "system should have caught."

---

### Metric 5: Team confidence to run another project
**Target:** Team confident they can run the next project this way.

**Why this matters:** If team is exhausted/frustrated, adoption fails regardless of objective success.

**Measure:** Subjective assessment at retro. Ask each team member:
- "On a scale of 1-10, how confident are you running the next project this way?"
- Average score ≥ 7 = HIGH confidence

**Pass:** Avg ≥ 7
**Partial:** Avg 5-6
**Fail:** Avg ≤ 4

If team confidence is low: rollout will fail regardless of other metrics. Pause and address.

---

### Metric 6: KB updated with learnings
**Target:** All P1 + recurring P2 failures translated into KB updates.

**Why this matters:** Without KB updates, the next project repeats the same failures. The system doesn't learn.

**Measure:** Count P1 + recurring (3+ occurrences) P2 failures from `failure-modes.md`. Verify each has either:
- A KB update PR opened
- A tool/process fix in progress
- A documented decision NOT to update (with reasoning)

**Pass:** ≥ 90% addressed
**Partial:** 50-89% addressed
**Fail:** < 50% addressed

---

### Metric 7: Cost within budget
**Target:** Anthropic API cost ≤ 2x estimated.

**Why this matters:** Pilots cost more than normal projects (learning curve). But > 2x indicates wasteful usage.

**Measure:** Actual API spend / estimated API spend for this project type.

Reference: typical project cost from `tools/alerts/anthropic-spending-alerts.md`. For redesign: $25-50 typical.

**Pass:** ≤ 2x typical
**Partial:** 2-3x typical
**Fail:** > 3x typical

---

## Aggregate scoring

Each metric scores: 1 (pass) / 0.5 (partial) / 0 (fail).

**Pilot SUCCEEDED:** Total ≥ 5.5 / 7
- Proceed to Path A (roll out)

**Pilot PARTIAL:** Total 3.5 – 5.0 / 7
- Proceed to Path C (specific fixes, then use)

**Pilot FAILED:** Total < 3.5 / 7
- Proceed to Path B (significant refinement + repilot)

---

## Additional metrics to track (not pass/fail)

These don't determine pilot success/failure but inform learnings:

### A1: Time spent on system overhead
How much time did pilot lead + team spend on "doing system things" vs "doing project work"?

Estimate during pilot:
- Pilot lead: typically 10-20% of their pilot time
- Other devs: typically 5-10% of their pilot time

Track for future planning.

### A2: Code Review Agent effectiveness
- How many issues did Code Review Agent catch?
- How many did it miss (caught by humans afterward)?
- What's the catch rate? Ideal: > 70% of issues caught by Code Review before merge.

### A3: Time saved vs lost
Net time impact of the system on project delivery:
- Hours saved by AI doing scaffold work
- Hours lost to system overhead (KB reading, agent management, etc.)
- Net: positive or negative?

Pilot 1: likely slightly negative (learning curve)
Pilot 5+: should be clearly positive

### A4: API cost vs project value
- Total API cost for the pilot
- Project value (revenue from client)
- Cost as % of revenue: ideal < 1%

### A5: Reuse of generated artifacts
Did artifacts from agents (spec, design tokens, sections) get used "as-is" by humans?
- > 70% as-is = system is generating quality output
- < 50% as-is = system needs work

### A6: Customer effects
- Post-launch organic traffic vs baseline (for redesigns/migrations)
- Conversion rate change
- Customer support ticket volume

These take longer to measure (need 30+ days post-launch).

---

## Setting targets per pilot

Use this template at pilot kickoff:

```markdown
# Pilot Success Criteria — Aurora Skincare

**Set:** [date — at pilot kickoff]
**Pilot lead:** [name]
**Sign-off:** Tech Lead [name + date]

## Quantitative targets (the 7 criteria)

| Metric | Target | Actual (filled at retro) |
|--------|--------|--------------------------|
| 1. Timeline variance | ≤ 1.30x estimate | [TBD] |
| 2. Client satisfaction | Clearly satisfied | [TBD] |
| 3. Gate overrides | ≤ 1 | [TBD] |
| 4. P1 bugs post-launch | ≤ 3 in 30 days | [TBD] |
| 5. Team confidence | Avg ≥ 7/10 | [TBD] |
| 6. KB updates committed | ≥ 90% | [TBD] |
| 7. API cost variance | ≤ 2x typical | [TBD] |

## Additional metrics (not pass/fail)
- Code Review Agent catch rate (track)
- Net time impact (track)
- API cost as % of project value (track)

## What we expect
[3-5 sentences of upfront hypothesis]

## Signed
- Pilot lead: [name + date]
- Tech lead: [name + date]
```

Save at `/projects/[client]/pilot/success-criteria.md`.

---

## Updating metrics over time

After pilot 1: review the metrics. Are they still right? Adjust for pilot 2.

After pilot 5+: metrics should be calibrated to your actual pattern. Refine.

After 1 year: have aggregate data. Review what success actually looks like.

---

## What NOT to optimize for

Tempting metrics that don't actually matter:

### "Lines of code generated"
More code ≠ better. Don't measure this.

### "Number of agent invocations"
More agent calls ≠ better. Could indicate inefficiency.

### "Speed of generation"
Generated fast but wrong = worse than slow + right.

### "Number of KB rules"
Quality over quantity. Adding rules just to add them = bloat.

### "How much the AI 'did' vs the human"
AI augments the team, not replaces. Measure outcomes, not AI share.

---

## Honest evaluation

When scoring at retro:

- Don't inflate scores to feel good
- Don't deflate scores to be modest
- Be honest about what worked and what didn't
- Numbers don't lie if you measured honestly

The point of success metrics is **honest decision-making about rollout**. Inflated scores → bad rollout decision → bigger problems later.

---

## Tracking metrics during pilot

Don't wait until retro to calculate. Track weekly:

```markdown
# Pilot Weekly Metric Check — Week [N]

**Pilot:** Aurora Skincare
**Week:** [N] of [total]

## Current week
- Estimated burn: [hours]
- Actual burn: [hours]
- Variance: [%]
- API cost this week: $[N]
- New failure modes: [N]
- KB updates committed: [N]

## Cumulative
- Total estimated burn: [hours]
- Total actual burn: [hours]
- Total variance: [%]
- Total API cost: $[N]
- Total failure modes: [N]
- Team confidence (informal pulse): [HIGH/MED/LOW]

## On track for:
- Metric 1 (timeline): [TRACK / FLAG]
- Metric 7 (cost): [TRACK / FLAG]

## Flags this week
[Anything concerning]
```

Pilot lead 15 min per week. Surface issues early.

---

## Anti-patterns

1. **Setting metrics after the pilot.** Biased.

2. **Setting unrealistic targets.** "0 P1 bugs" — impossible. Set achievable targets.

3. **Not tracking weekly.** Surprises at retro.

4. **Skipping subjective metrics (client satisfaction, team confidence).** Numbers without context.

5. **Hiding bad metrics.** "Let's not show the cost overrun." Honest data drives honest decisions.

6. **One metric trumps all.** Some teams obsess over a single metric. Use all 7.

7. **Comparing to perfection.** "We hit 5/7" can feel like failure. It's actually success per the framework.

---

Last reviewed: 2026-05-25 by Claude (initial)
Next review due: 2026-08-25
