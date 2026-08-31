---
tier: 3
load_when: ["human-reference-only"]
---

# 02 — Pilot Kickoff Checklist

> Pre-pilot prep. Complete BEFORE starting the project work.

---

## Why this matters

Skipping prep = pilot stumbles at the first gate. Doing prep = pilot runs smoother.

Estimated prep time: 4-8 hours spread over a few days.

---

## Pre-pilot checklist

### People
```
[ ] Pilot lead identified (senior dev or tech lead)
[ ] Pilot lead has 30-40% of their time blocked for this project
[ ] Internal PM identified
[ ] At least one other dev assigned (for code review + 2nd opinion)
[ ] QA lead identified
[ ] Retro participants identified + retro date scheduled (4-6 weeks out)
[ ] Pilot lead has read:
    [ ] _spine/persona.md
    [ ] docs/user-guide/WALKTHROUGH.md
    [ ] tools/docs/shortcodes.md
[ ] All pilot participants have read at minimum:
    [ ] _spine/persona.md
    [ ] docs/user-guide/WALKTHROUGH.md (top 4 sections)
```

### Workspace + tools (Layer 1 + Layer 2 of docs/user-guide/SETUP-INSTRUCTIONS.md)
```
[ ] Central skills repo set up + accessible to team
[ ] All participants have done Layer 2 (per-developer) setup:
    [ ] Claude Code installed + authenticated
    [ ] VS Code + extensions installed
    [ ] Shopify CLI installed (or relevant platform CLI)
    [ ] Claude in Chrome extension installed
    [ ] Skills repo cloned
    [ ] Claude Code configured to read skills
    [ ] Anthropic API key in environment
[ ] Anthropic workspace + spending alerts configured
[ ] Owners assigned (per E5):
    [ ] Spine owner
    [ ] Platform arm owner (Shopify if Shopify pilot)
[ ] Quarterly KB review calendar event created
[ ] Monthly system retro calendar event created
```

### Project-specific setup (Layer 3 of docs/user-guide/SETUP-INSTRUCTIONS.md)
```
[ ] Repo created with branch protection
[ ] GitHub Secrets configured (full list per deployment-guide.md)
[ ] GitHub Environment configured (production with required reviewers)
[ ] GitHub Actions workflows copied to .github/workflows/
[ ] Code Review Agent script copied to .github/scripts/run-code-review.py
[ ] Configs in project root (.theme-check.yml, .eslintrc.json, lhci-config.json)
[ ] CODEOWNERS customized with actual usernames
[ ] Pre-commit hooks installed on each dev machine
[ ] agency/ workspace initialized with project.json
[ ] Test PR run end-to-end (verify theme push, code review, lighthouse, axe all run)
```

### Pilot-specific setup
```
[ ] Pilot documentation folder created: /projects/[client]/pilot/
[ ] Failure mode capture file initialized: /projects/[client]/pilot/failure-modes.md
[ ] Retro date confirmed on all participants' calendars
[ ] Success metrics defined upfront (per 06-pilot-success-metrics.md)
[ ] Baseline metrics captured from comparable past projects (for comparison)
[ ] API spend budget for project set (per A11)
[ ] Pilot lead's calendar blocked (30-40% time)
```

### Communication
```
[ ] Client SOW received + reviewed
[ ] Internal kickoff meeting scheduled (whole pilot team)
[ ] Client kickoff meeting scheduled (Internal PM)
[ ] Communication cadence established with client
[ ] Failure mode logging protocol agreed (verbal + written)
[ ] Team agreement: capture problems honestly, don't hide failures
```

---

## Internal kickoff meeting (1 hour)

Hold this BEFORE starting project work. All pilot participants attend.

### Agenda

#### 1. Pilot context (10 min)
- This is our first project on the new system
- Goal: deliver good work + find system gaps
- Expected: 20% time overhead, some friction

#### 2. Roles (5 min)
- Who is pilot lead
- Who is Internal PM
- Who are devs
- Who is QA lead
- Who reviews code
- Who runs retro

#### 3. The system overview (15 min)
- Walk through `docs/user-guide/WALKTHROUGH.md` together
- Look at the persona, shortcodes
- Identify any team-specific questions

#### 4. The pilot project (15 min)
- Why this project chosen
- Scope summary
- Timeline
- Key risks
- Communication plan with client

#### 5. Failure capture protocol (10 min)
- Every place the system struggles → log it
- Per `03-failure-mode-capture.md` format
- Pilot lead reviews captures weekly
- No blame for finding failures — finding failures is the point

#### 6. Questions + concerns (5 min)
- Anyone have concerns about the pilot?
- Anything that should be different?

---

## Capture initial state

Before starting:

```markdown
# Pilot Pre-flight Snapshot — [Client Name]

**Date:** [date]
**Pilot lead:** [name]
**Pilot team:** [names]

## Project
- Client: [name]
- Type: Shopify Redesign
- Scope estimate: [N] weeks, [N] hours
- Budget: $[amount]

## Comparable past projects (for comparison)
- [Project A]: [N weeks], [N hours], result: [outcome]
- [Project B]: [N weeks], [N hours], result: [outcome]

## Hypothesis
- We expect the system to: [list 3-5 expected improvements]
- We expect the system to struggle with: [list 3-5 expected struggles]
- Worst-case: [what could go wrong]
- Best-case: [what would be ideal outcome]

## Success metrics (per 06-pilot-success-metrics.md)
[Copy success criteria here, customize numeric targets]

## Risks identified
- [Risk 1 + mitigation]
- [Risk 2 + mitigation]

## Approval to proceed
- Pilot lead: [name] [date]
- Tech lead: [name] [date]
```

Save at `/projects/[client]/pilot/pre-flight-snapshot.md`.

This captures upfront expectations so the retro can compare against them.

---

## Final pre-pilot review

24 hours before starting project work:

```
[ ] All checklist items above completed
[ ] Pre-flight snapshot written + saved
[ ] All pilot participants have time blocked
[ ] Client kickoff scheduled
[ ] Anthropic spend cap set for this project
[ ] Communication channels open
[ ] Pilot lead understands their role
```

If anything's not complete: delay project start until it is. Don't start with gaps.

---

## After kickoff: start the project

Type in Claude Code (with skills loaded):

```
/start shopify redesign [Client Name]
```

The orchestrator takes over. Follow the gates per the standard workflow.

Reference for during-pilot:
- `03-failure-mode-capture.md` — keep capturing
- `06-pilot-success-metrics.md` — track progress
- `tools/docs/shortcodes.md` — daily commands
- `docs/user-guide/WALKTHROUGH.md` — when team has system questions

---

## Common mistakes at kickoff

1. **Underestimating prep time.** "We'll figure it out as we go" → first sprint stumbles. Spend the 4-8 hours upfront.

2. **Not blocking pilot lead's calendar.** Pilot lead gets pulled into other work → pilot suffers.

3. **Skipping the internal kickoff meeting.** Team doesn't share understanding → different members do different things.

4. **Not setting up failure capture upfront.** During pilot, failures happen but don't get documented. Retro is worthless.

5. **Hiding the pilot from the team.** Some team members later say "I didn't know this was a pilot." Be transparent.

6. **Picking a stretch project for pilot.** Per `01-pilot-selection.md` — pilot should be standard complexity.

---

## You're ready to start

If all checklist items above are complete: you've done the prep right. Begin the pilot.

Expect:
- First week feels awkward
- First sprint surfaces 5-10 system issues (this is normal — capture them all)
- By milestone 2, team flows better
- By milestone 4, system feels natural
- Post-launch: clear improvements identified for next project

The pilot teaches the system to fit your team. Be patient. Capture everything.

---

Last reviewed: 2026-05-25 by Claude (initial)
Next review due: 2026-08-25
