---
tier: 3
load_when: ["human-reference-only"]
---

# 05 — Post-Pilot Retro Template

> Structured retro after pilot project. Captures learnings, decides on rollout, updates KB.

---

## When the retro happens

**1-2 weeks after launch.** Not the day after — give the team time to see initial post-launch outcomes.

Not later than 2 weeks — memory fades.

Duration: **2-3 hours** for the full team. Don't rush.

---

## Who attends

Required:
- Pilot lead
- Internal PM
- All devs who worked on the pilot
- QA lead
- Tech lead (if different from pilot lead)
- KB owner(s) for the platform(s) involved

Optional:
- Client-facing account team (sometimes useful for "what client said")
- Junior devs (to learn from the discussion)

---

## Pre-retro prep (pilot lead does this, 2-3 hours)

### 24-48 hours before retro

1. Review the entire `failure-modes.md` file
2. Categorize all entries (by agent, by severity, by category)
3. Identify top 5 most-impactful failures
4. Identify top 5 most-frequent failures
5. Calculate metrics per `06-pilot-success-metrics.md`
6. Compile pre-retro summary doc

### Pre-retro summary template

```markdown
# Pilot Retro Pre-Summary — [Client Name]

**Pilot dates:** [start] to [launch + 7 days]
**Pilot lead:** [name]
**Project type:** [Shopify Redesign]

## Project outcome
- Launched on: [date]
- Timeline variance: [estimated vs actual]
- Cost variance: [estimated vs actual]
- Quality: [P1/P2 bugs caught post-launch]
- Client satisfaction: [based on feedback / NPS]

## Failure modes captured
- Total: [N]
- P1: [N] | P2: [N] | P3: [N] | P4 (ideas): [N]

## By agent
- Frontend: [N]
- Designer: [N]
- PM: [N]
- QA: [N]
- Code Review: [N]
- Orchestrator: [N]
- Delivery Head: [N]

## By category
- KB gaps: [N]
- Hallucinations: [N]
- Tooling issues: [N]
- Process issues: [N]
- Persona violations: [N]

## Top 5 most-impactful failures
1. [FM-XX] — [brief description]
2. [FM-XX] — [brief description]
3. [FM-XX] — [brief description]
4. [FM-XX] — [brief description]
5. [FM-XX] — [brief description]

## Top 5 most-frequent failures
1. [Pattern] — occurred [N] times
2. [Pattern] — occurred [N] times
3. [Pattern] — occurred [N] times
4. [Pattern] — occurred [N] times
5. [Pattern] — occurred [N] times

## Success metrics (per 06-pilot-success-metrics.md)
- Project shipped on time: [YES / NO / variance]
- Client satisfied: [YES / NO / detail]
- Gates passed cleanly: [YES / NO / number of overrides]
- ≤ 3 P1 bugs post-launch: [YES / NO / count]
- Team confidence: [HIGH / MEDIUM / LOW]
- KB updated: [pending retro decisions]
- Cost within budget: [YES / NO / variance]

## Recommendation
[Pilot lead's preliminary recommendation — Path A (rollout), Path B (refine + repilot), or other]
```

Share this summary with retro attendees 24 hours before the retro. They read in advance so retro time is for discussion, not status updates.

---

## Retro agenda (2-3 hours)

### Block 1: Outcome review (20 min)
Read pre-retro summary together. Confirm everyone's read it. Clarify questions about the data.

### Block 2: What went well (30 min)
Each person shares: what worked? What was a clear win?

Capture:
- Specific moments the system shined
- Patterns to keep
- Wins to celebrate

Don't rush this. Negative-bias retros under-capture wins.

### Block 3: What went poorly (45 min)
For each top-5 most-impactful + top-5 most-frequent failure:
- What happened?
- What was the root cause?
- What does the fix look like?
- Who owns the fix?
- When?

Document decisions in real-time. Don't leave unclear who-does-what.

### Block 4: System gaps (30 min)
Beyond specific failures, structural gaps:
- Was anything in the system completely missing for this project?
- Was anything overcomplicated for what we needed?
- Was anything underused (a feature we built but didn't touch)?
- Was anything misleading (felt right but turned out wrong)?

### Block 5: Process improvements (15 min)
Beyond KB: workflow improvements:
- Was the gate cadence right?
- Was sprint scope appropriate?
- Were shortcodes useful?
- Was the persona helpful or restrictive?
- Was Anthropic API spend on-budget?

### Block 6: Rollout decision (20 min)
Based on everything above:
- Path A: Roll out to whole team
- Path B: Refine + run second pilot
- Path C: Specific changes before rollout

Decide. Document the decision with reasoning.

### Block 7: Action items (20 min)
Concrete next steps:
- Who does what by when?
- Especially: KB update PRs, tool fixes, process changes
- Schedule follow-ups

---

## Retro output: retrospective document

After the retro, pilot lead writes:

```markdown
# Pilot Retrospective — [Client Name]

**Pilot dates:** [start] to [retro date]
**Retro date:** [date]
**Attendees:** [names]
**Retro lead:** [name]

## Outcome summary
[3-5 sentences of overall outcome]

## What went well
1. [Win 1 with specific example]
2. [Win 2 with specific example]
3. [Win 3 with specific example]
...

## What went poorly + decisions
1. [Issue 1] → Fix: [specific change] → Owner: [name] → Due: [date]
2. [Issue 2] → Fix: [specific change] → Owner: [name] → Due: [date]
...

## System gaps identified
- [Gap 1] → [action]
- [Gap 2] → [action]

## KB updates committed
- [File: change description] → PR owner: [name]
- [File: change description] → PR owner: [name]

## Tool/process changes committed
- [Change]
- [Change]

## Metrics
- Final score per success metrics: [X / 7]
- Effective system usage: [HIGH / MEDIUM / LOW]
- Team confidence to run another project: [HIGH / MEDIUM / LOW]

## Decision: Rollout path
**Choice:** [Path A / Path B / Path C]
**Reasoning:** [why]
**Next steps:** [if Path A: rollout plan, if Path B: refinements + repilot plan]
**Timing:** [when]

## Lessons learned (for client memory file)
[3-5 specific lessons that should propagate to future projects]

## Follow-up retro scheduled
- Date: [date]
- Purpose: [verify decisions implemented, measure impact]

---

Generated by: Pilot lead
Distributed to: [list]
Stored at: /projects/[client]/pilot/post-retro-document.md
```

---

## Common retro outcomes

### Outcome A: Strong pilot success
- 6-7 of 7 success metrics achieved
- Team confident
- Few P1 failures
- KB updates manageable

**Decision:** Path A — roll out. Within 30 days, start using on all new projects.

### Outcome B: Mixed pilot
- 3-5 of 7 metrics achieved
- Team has some concerns
- Several KB gaps identified
- Tooling issues to fix

**Decision:** Path C — fix specific issues, then start using on next project (without another full pilot).

### Outcome C: Pilot revealed major issues
- ≤ 2 of 7 metrics achieved
- Team frustrated
- Many failures
- Some unrecoverable mistakes

**Decision:** Path B — significant refinement needed before any rollout. Plan a second pilot.

### Outcome D: Mid-pilot abandonment
The pilot was abandoned mid-project (per `01-pilot-selection.md` § "When to abandon").

**Decision:** Identify which fundamental assumptions failed. Redesign the relevant parts of the system. Plan a second pilot 1-3 months later.

---

## Post-retro actions

Within 48 hours of retro:

1. Retro document distributed
2. Action items in someone's task list (each item has owner + due date)
3. KB update PRs opened
4. Tool issues filed
5. Follow-up retro scheduled

Within 2 weeks of retro:

1. All urgent KB updates merged
2. Tool fixes deployed
3. Process changes documented
4. Team notified of all updates

Within 4 weeks of retro:

1. Follow-up retro held (per "Follow-up retro" above)
2. Measure: did the changes work?
3. Decision: ready for broader rollout or need more refinement

---

## Anti-patterns at retro

1. **Skipping retro because "everyone is busy."** Pilot was wasted if no retro.

2. **Retro focused only on negatives.** Wins matter too. Capture both.

3. **No specific action items.** "We should improve KB" is not actionable. "Bob updates 09-forbidden.md with LIQ-024 by 2026-07-15" is.

4. **No follow-up retro.** Without follow-up, accountability evaporates.

5. **Pilot lead does all the talking.** Get every attendee's voice.

6. **Decision delayed.** "We'll decide rollout later." Decide at retro or commit to a date.

7. **Tools/process issues mixed with KB issues.** Categorize them separately for clarity.

8. **Hostile retro.** Blame doesn't help. Focus on system improvement.

---

## A note on emotional honesty

Pilots are emotional. People invested time + ego.

Retros can become defensive if someone feels their work is being criticized.

Frame everything as:
- "The SYSTEM failed at X" (not "you failed at X")
- "What could we have built into the SYSTEM to prevent this?" (not "why didn't you catch this?")
- "If we hit this again..." (not "you'll do it differently next time")

The pilot lead sets this tone. Other senior team members reinforce it.

---

## Retro success indicators

You know the retro was good if:

- ✓ Specific action items leave the room with owners + dates
- ✓ Both wins and failures got airtime
- ✓ KB update list is concrete
- ✓ Rollout decision is made
- ✓ Team feels heard
- ✓ Pilot lead has clear path forward

You know the retro was bad if:

- ✗ Vague action items ("we'll work on this")
- ✗ Decisions punted to "later"
- ✗ Only the loudest voices spoke
- ✗ No KB updates committed
- ✗ Pilot lead feels alone after retro
- ✗ Team is more confused than before

Reshape the bad retro into another session within 1 week. Don't accept bad retros.

---

Last reviewed: 2026-05-25 by Claude (initial)
Next review due: 2026-08-25
