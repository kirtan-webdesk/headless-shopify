---
tier: 3
load_when: ["human-reference-only"]
---

# Pilot Runbook — WebDesk AI Delivery System

> How to run the first pilot project on the system. Optimizes for LEARNING, not perfect delivery.

---

## What this folder is

7 files that guide your first real pilot project:

```
tools/pilot/
├── README.md                            ← you are here
├── 01-pilot-selection.md                ← Pick the right pilot
├── 02-pilot-kickoff-checklist.md        ← Pre-pilot prep
├── 03-failure-mode-capture.md           ← Document what goes wrong
├── 04-kb-update-workflow.md             ← Turn failures into improvements
├── 05-post-pilot-retro-template.md      ← Structured retro
└── 06-pilot-success-metrics.md          ← How to measure success
```

---

## The pilot philosophy

A pilot has ONE primary purpose: **find out what's wrong with the system so you can fix it.**

Secondary purposes (in order):
1. Deliver good work for the client (always — never compromise client work for system learning)
2. Train the team on the system
3. Build confidence in the system

What a pilot is NOT:
- A demo (you're not showcasing)
- A perfect delivery (mistakes will happen)
- A trial to see "if AI works" (the question is HOW to use it well, not whether to use it)

---

## High-level flow

```
1. Pick pilot project (per 01-pilot-selection.md)
2. Pre-pilot prep (per 02-pilot-kickoff-checklist.md)
3. Run the project end-to-end through the system
4. Capture failure modes as they happen (per 03-failure-mode-capture.md)
5. Continue through project completion
6. Run post-pilot retro (per 05-post-pilot-retro-template.md)
7. Update KB based on findings (per 04-kb-update-workflow.md)
8. Decide: roll out to whole team OR refine more before rollout
```

Estimated pilot duration: **6-10 weeks** for a typical Shopify Redesign.

---

## Pilot success criteria

Per `06-pilot-success-metrics.md`. Quick version:

- ✓ Project shipped on time (or within reasonable variance per estimates)
- ✓ Client satisfied with delivery
- ✓ All gates passed without major override use
- ✓ ≤ 3 P1 bugs caught in production post-launch
- ✓ Team confident they can run more projects this way
- ✓ KB updated with learnings (per K4 feedback loop)
- ✓ Cost within budget cap

If 5+ of 7 are achieved: pilot SUCCESSFUL, roll out.
If 3-4: pilot PARTIAL, refine + try a second pilot.
If ≤ 2: pilot FAILED, deeper investigation needed.

---

## Who runs the pilot

### Required roles
- **Pilot lead** — senior dev or tech lead. Owns the pilot's success.
- **Internal PM** — manages client relationship
- **At least one other dev** — for code review + second opinion
- **QA lead** — runs the QA modules

### NOT recommended for pilot
- **Solo developer** — needs the human review layer to find AI failures
- **Junior-only team** — pilots benefit from senior judgment
- **First project for a new client** — pilot is internal-facing, focus on the system not relationship-building

### Estimated time investment
- Pilot lead: 30-40% of their time during the pilot
- Other devs: normal project hours
- Senior reviewer at retro: 4-8 hours total

---

## What to track during the pilot

Per `03-failure-mode-capture.md`. Briefly:

1. **Every time the system stalled** — what did the agent do wrong / not know?
2. **Every time you wrote a long prompt** — could it be a shortcode?
3. **Every time you ignored a recommendation from an agent** — was the agent wrong?
4. **Every time a code review caught something** — and every time it missed something
5. **Every time you overrode a gate** — why?
6. **Every time the team did something the system didn't anticipate** — surface gaps

Treat the pilot as a research project. Document everything.

---

## When to call the pilot done

The pilot is "done" when:
- Project is launched + warranty period started
- Post-launch monitoring stable (7-day report shows no major issues)
- Post-pilot retro held (per `05-post-pilot-retro-template.md`)
- KB updates from learnings either committed or queued

After this point: decide on rollout.

---

## After the pilot

Two paths:

### Path A: Pilot succeeded, roll out
- Update KB with pilot findings
- Train team on the system (per K8 — 3-tier training)
- Designate KB owners per platform (if not already done)
- Set up quarterly review cadence (per E5)
- Begin using on all new projects

### Path B: Pilot partial / failed, refine
- Identify the systemic gaps
- Prioritize fixes
- Run a second pilot with adjustments
- Some teams need 2-3 pilots before broad rollout

---

## Common pilot anti-patterns

1. **Picking the highest-risk project for pilot.** Wrong. Pick something medium-risk where you can afford to learn.

2. **Skipping the retro.** No retro = no learnings captured. Pilot wasted.

3. **Treating the pilot as a demo to client.** Pilot is internal-facing. Don't tell the client "we're testing a new system on you." They'll be nervous.

4. **No KB updates after pilot.** System doesn't improve. Next project hits same problems.

5. **Pilot lead doesn't have time.** If pilot lead is overcommitted, pilot suffers. Block their calendar.

6. **Comparing pilot to past projects directly.** Pilot has learning overhead. Don't expect it to be faster than past projects yet — that comes after rollout.

7. **Rolling out before retro.** Some teams want to "keep momentum." Don't. Retro captures learnings. Without retro, the next project repeats mistakes.

---

## Files to read in order

If you're about to start a pilot:

1. `01-pilot-selection.md` — pick the right project
2. `02-pilot-kickoff-checklist.md` — get ready
3. `03-failure-mode-capture.md` — set up capture process
4. `06-pilot-success-metrics.md` — know what success looks like upfront
5. (During pilot) `03-failure-mode-capture.md` — keep capturing
6. (After pilot) `05-post-pilot-retro-template.md` — run the retro
7. (After retro) `04-kb-update-workflow.md` — implement learnings

---

## Time + cost expectations for pilot

Expected:
- Project duration: 6-10 weeks (standard Shopify Redesign)
- Pilot lead time: 30-40% of working hours during the pilot
- API costs: $40-100 (pilot may exceed normal project cost due to learning overhead)
- Retro time: 4-8 hours total for the team

Acceptable variances during pilot:
- 20-30% slower than equivalent past projects (learning curve)
- 1.5-2x normal API costs (more agent invocations as team learns)
- 1-2 gate overrides (sign of friction points to fix in retro)

Concerning variances:
- 50%+ slower than past projects → process problem, not just learning curve
- 5+ gate overrides → gates are too strict OR team isn't engaging with the model
- Major client dissatisfaction → pilot picked the wrong project

---

## Final note

**Pilots are about finding what's broken.** Every problem you find = improvement to ship. Every problem you miss = improvement deferred.

Document everything. Be honest. The system gets better when you're honest about its failures.

---

Last reviewed: 2026-05-25 by Claude (initial)
Next review due: 2026-08-25
