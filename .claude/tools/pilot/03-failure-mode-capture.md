---
tier: 3
load_when: ["human-reference-only"]
---

# 03 — Failure Mode Capture

> Document every place the system struggles. Without capture, lessons don't propagate.

---

## What counts as a "failure mode"

A failure mode is any moment where the system didn't work as expected:

- Agent produced wrong output
- Agent didn't know something it should have
- Agent invented something (hallucinated)
- Workflow stalled at a step that shouldn't stall
- A shortcode didn't work as documented
- KB knowledge was missing or unclear
- A gate caused unnecessary friction
- A tool failed to run
- The team did something the system didn't anticipate
- A handoff between agents lost context

NOT failures (don't log):
- Genuine bugs in client's code (those are project bugs, not system failures)
- One-off API rate limits
- Network blips
- Developer typos in commands

---

## When to capture

**Immediately when the failure happens.** Memory fades by end of week.

Even if you're in the middle of solving the failure — pause, write 2-3 sentences in the capture file, then continue.

Bad: "I'll remember to write this up later" → not remembered.

Good: "30 seconds to log this NOW" → captured.

---

## How to capture

Append to `/projects/[client]/pilot/failure-modes.md`. Use this format:

```markdown
## FM-001: [Brief title — what went wrong]

**Date:** 2026-06-15 14:32
**Reported by:** [name]
**Stage:** [intake / discovery / planning / design / dev / qa / launch]
**Agent involved:** [orchestrator / pm-agent / designer-agent / frontend-agent / etc.]
**Severity:** P1 / P2 / P3 (see severity guide below)

### What happened
[2-4 sentences: factual description of what occurred]

### What was expected
[1-2 sentences: what should have happened]

### Root cause (initial hypothesis)
[Best guess at why this happened — refine after retro]

### Workaround applied
[What you did to keep the project moving]

### Impact
- Time lost: [N] minutes/hours
- Was project work blocked? [Y/N for how long]
- Was a gate impacted? [Y/N which gate]
- Was client impacted? [Y/N how]

### Suggested fix (initial idea)
[Best guess at how to prevent next time]

### Files / artifacts (for retro reference)
- [Link to relevant Claude Code session if available]
- [Link to relevant code commit / PR]
- [Link to KB file that should have prevented this]
```

---

## Severity guide

### P1 — Critical failure
System caused real project damage:
- Hallucinated API call shipped to production
- Critical security issue not caught by code review
- Major scope item missed by spec
- Wrong information given to client by PM Agent
- Gate approved that should have been rejected (or vice versa)

**Examples:**
- Frontend Agent generated code using non-existent Shopify Liquid filter, Code Review Agent didn't catch
- PM Agent generated spec with hallucinated client preference, sent to client, client confused

**Response:** Pilot lead reviews same day. Document thoroughly. KB update likely needed.

### P2 — Significant failure
System caused friction or rework but didn't damage delivery:
- Agent produced output that needed substantial revision
- Workflow stalled at a step that needed manual intervention
- Documented shortcode didn't behave as described
- KB knowledge was wrong or stale
- Sensitive path approval workflow had issues

**Examples:**
- Designer Agent recommended Path 3 (custom) when Path 1 was clearly better, took 2 hours to redirect
- Sprint QA gate stalled because validator script crashed on unusual file structure

**Response:** Pilot lead reviews weekly. Document for retro discussion.

### P3 — Minor friction
Small system papercuts:
- Wording in agent response could be clearer
- Small inconsistency between two KB files
- Polish on output formatting
- Useful shortcode missing from reference

**Examples:**
- Orchestrator's status report was verbose, took 30 seconds to find the relevant info
- KB file referenced another file that wasn't there

**Response:** Batched for retro. Quick fixes after.

### P4 — Idea / suggestion
Not a failure, but something worth noting:
- "It would be useful if..."
- "What if we added..."
- "Could the agent also..."

**Response:** Brainstorm fodder for retro. Some will become real improvements; others won't.

---

## Capture format for fast logging

If the formal format above feels heavy in the moment, use this faster shorthand:

```
2026-06-15 14:32 | P2 | [name] | designer-agent
WHAT: Recommended Path 3 fully-custom when budget says Path 1 is appropriate
EXPECTED: Should follow design path decision tree
CAUSE: Probably didn't read 02-design-path-decision.md properly
FIX: Refactored, lost 30 min
NOTE: KB candidate — strengthen decision tree wording
```

5 minutes per failure max. Get it down, move on.

Pilot lead reformats to full format weekly during pilot review.

---

## Pilot lead weekly review

Each week, pilot lead spends 1 hour:

1. Read all failure modes captured that week
2. Categorize by severity + theme
3. Identify P1s that need immediate attention
4. Group by "fix in KB" vs "fix in tool" vs "fix in process"
5. Update master failure log
6. Surface any patterns ("3 failures with Frontend Agent — common theme?")

---

## Specific common failure modes to watch for

Based on AI system patterns, watch for these:

### Failure pattern 1: Hallucinated APIs
**Where:** Frontend Agent, Backend Agent
**Sign:** Generated code references functions/filters that don't exist
**Catch:** Code Review Agent should catch these (review-checks.md Check 1)
**If Code Review missed:** Strengthen forbidden.md with the specific hallucinated pattern

### Failure pattern 2: KB drift
**Where:** Any agent
**Sign:** Agent contradicts what's in a KB file, or doesn't know something that's in a KB file
**Likely cause:** Agent didn't load the relevant KB file
**Fix:** Strengthen SKILL.md to require reading specific KB files

### Failure pattern 3: Self-approval attempts
**Where:** Gate decisions
**Sign:** Agent tries to confirm a gate on its own output
**Fix:** Self-approval prohibition not enforced strictly enough

### Failure pattern 4: Cost overruns
**Where:** Code review on large PRs
**Sign:** Single PR review costs > $5
**Fix:** H4 cost guardrails not properly enforced; tighten thresholds

### Failure pattern 5: Persona not loaded
**Where:** Agent responses become generic/buttery
**Sign:** Agent uses "Great question!" or excessive politeness
**Fix:** Persona load order not enforced; orchestrator's required-first-read directive missing

### Failure pattern 6: Sprint scope creep
**Where:** Frontend Agent during dev sprint
**Sign:** Sprint deliverables exceed sprint brief
**Fix:** Strengthen sprint adherence verification

### Failure pattern 7: Forgot to handle edge cases
**Where:** Any agent
**Sign:** Agent's output doesn't account for null values, empty states, error conditions
**Fix:** Add edge case examples to forbidden.md or relevant KB files

### Failure pattern 8: Missing context across agent handoffs
**Where:** Between agents (e.g., Designer → Frontend)
**Sign:** Frontend Agent doesn't have info from Designer Agent's work
**Fix:** Improve handoff block format; cascade order issue

### Failure pattern 9: Gate friction
**Where:** Approval gates
**Sign:** Gates approved without real review (rubber-stamping)
**Fix:** Gate format makes review too easy; tighten criteria

### Failure pattern 10: Tooling glitches
**Where:** GitHub Actions, scripts
**Sign:** CI fails for tooling reasons (not code reasons)
**Fix:** Workflow files; script bugs

---

## Capture is not blame

Important culture note:

**Capturing failures does NOT mean someone screwed up.**

The system is what failed, not the person. The system needs improvement.

Foster a culture where:
- "I found a failure" is celebrated, not criticized
- More failures captured = more improvement opportunities
- No one penalized for surfacing problems

If team members hide failures, the pilot is worthless.

---

## When the same failure happens twice

If failure mode FM-007 happens again as FM-012:

1. Note the repeat in FM-012: "Same as FM-007"
2. Increment the recurrence count
3. Escalate priority — recurring failures need urgent fixes
4. Per K4: 3+ recurrences = KB update candidate

---

## End-of-pilot processing

After pilot completes, all failure modes feed into the retro (per `05-post-pilot-retro-template.md`):

- Count by severity
- Count by category (agent / tool / process / KB gap)
- Identify top 5 most-impactful
- Identify top 5 most-frequent
- Plan KB updates

Then per `04-kb-update-workflow.md`, turn lessons into improvements.

---

## Sample failure-modes.md after 4 weeks

```markdown
# Pilot Failure Modes — Aurora Skincare

## Stats so far
- Total: 23 entries
- P1: 1
- P2: 8
- P3: 10
- P4: 4 (ideas)

## By agent
- Frontend: 7
- Designer: 4
- PM: 3
- QA: 2
- Code Review: 5
- Orchestrator: 2

## By category
- KB gap: 9
- Hallucination: 3
- Tooling: 4
- Process: 5
- Persona: 2 (forgot to load)

[... detailed entries ...]
```

This data drives the retro.

---

## Anti-patterns

1. **Capturing late.** "I'll do it Friday" → didn't happen.

2. **Vague captures.** "Something went wrong with the agent." Useless. Be specific.

3. **No root cause hypothesis.** Capture the symptom but not the cause = retro spends time figuring it out later.

4. **Marking everything P1.** Severity inflation. Most failures are P2/P3.

5. **Hiding embarrassing failures.** "I told it the wrong thing." Capture it anyway — the system should have caught the user error.

6. **No weekly review.** Captures pile up unread.

7. **Capturing without acting.** Captures inform retro AND become KB candidates. If neither happens, capture is wasted.

---

Last reviewed: 2026-05-25 by Claude (initial)
Next review due: 2026-08-25
