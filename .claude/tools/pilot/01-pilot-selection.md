---
tier: 3
load_when: ["human-reference-only"]
---

# 01 — Pilot Selection

> Picking the wrong first project = pilot fails. Pick the right one.

---

## What "the right pilot project" looks like

### Required characteristics

**1. Real client work, not internal**
A pilot should be a real client project. Internal projects don't have:
- Real deadlines
- Real client communication
- Real launch pressure
- Real consequences

The system is built for real client work. Test it with real client work.

**2. Established client relationship**
Pick a client you've worked with before. Why:
- They trust you (small process changes don't worry them)
- You know their preferences (less discovery overhead)
- You can be honest if pilot has hiccups
- They give honest feedback

Don't pilot on a brand new client. The relationship has too much going on.

**3. Medium scope**
Not too small, not too big:

- ✗ Too small (< 4 weeks): not enough surface area to test system
- ✓ Right (6-10 weeks): full project lifecycle including all gates
- ✗ Too big (> 16 weeks): if pilot fails, you've burned a lot of time

A Shopify Redesign at 6-10 weeks is the sweet spot.

**4. Standard complexity**
Avoid for pilot:
- Multi-platform projects
- Major migrations
- Headless builds (use that as pilot only if your team is experienced with headless)
- B2B-heavy projects
- Complex integrations the team hasn't done before

Pick a standard Shopify Redesign or New Build. Standard = lets you focus on testing the system, not learning the platform.

**5. Internal team familiar with the platform**
Pilot needs a team that knows the platform deeply already. They'll evaluate AI output well.

Pilot is NOT the time to train a junior dev on a new platform.

**6. Reasonable client expectations**
Pick a client who:
- Has reasonable timelines (not "launch in 4 weeks")
- Communicates clearly
- Provides feedback when asked
- Doesn't change scope every week

Avoid clients who:
- Are particularly demanding right now
- Have unrealistic expectations
- Are going through internal turmoil

---

## What to AVOID for the pilot

### Don't pilot if any of these:

- **Bet-the-business project** — too risky
- **First project for a new client** — too much relationship building
- **Project with tight (< 4 week) timeline** — no room to learn
- **Project with novel platform/tech** — too many unknowns
- **Project with senior dev unavailable** — pilot needs senior leadership
- **Project where you've already committed to a specific delivery approach** — pilot needs flexibility
- **Project where AI failure would cost you the client** — too much downside

---

## Decision template

For each candidate project, score:

| Criterion | Score (1-5) |
|-----------|-------------|
| Established client relationship | __ |
| Standard complexity (Shopify Redesign) | __ |
| Right scope (6-10 weeks) | __ |
| Team has platform expertise | __ |
| Reasonable timeline (not rushed) | __ |
| Client communicates well | __ |
| You can afford process overhead | __ |
| Senior dev available to lead | __ |
| **TOTAL** | __/40 |

Score interpretation:
- **32+**: Strong pilot candidate
- **24-31**: Acceptable pilot
- **16-23**: Pilot would be risky
- **< 16**: Don't pilot this project

If no project scores 24+ right now, wait. Don't force a pilot on a poor candidate.

---

## Specific recommendations by situation

### "We have an upcoming standard Shopify Redesign for a returning client"
**Pilot it.** This is exactly the right scenario.

### "We have multiple projects right now, which to pilot?"
Score each per the template. Pick the highest scoring.

### "We have a new client coming in for a big project"
**Don't pilot.** Run that project the usual way. Pilot something else first.

### "We have a migration coming up"
**Don't pilot a migration.** The migration project-type skill isn't built yet (Phase 4 only covers Redesign). Wait until that skill exists, OR pilot something else first.

### "We don't have any projects right now"
**Wait.** Pilot needs a real project. Working on internal demos doesn't pressure-test the system.

### "Our team is small and busy"
**Pick the lowest-risk project + accept the pilot will take ~20% extra time.** If the team can't absorb that, defer the pilot until capacity exists.

---

## After picking the pilot

Before starting the project:

1. Document the choice
   - Why this project?
   - Why this client?
   - What you expect to learn

2. Brief the pilot lead
   - "This is our first project on the new system"
   - "Capture everything that goes wrong"
   - "Plan for ~20% time overhead for learning"

3. Don't tell the client (usually)
   - Pilots are internal-facing
   - From their perspective, you're delivering a normal project
   - You may be a bit slower, but quality should be normal/improved

4. Set retro date upfront
   - Calendar a 2-hour retro for week after launch
   - All pilot participants attend
   - Per `05-post-pilot-retro-template.md`

5. Move to `02-pilot-kickoff-checklist.md`

---

## Communication about pilot

### Internally (your team)
Clear:
- "We're piloting the new AI delivery system on the Aurora Skincare project"
- "Document every place the system struggles"
- "We'll retro after launch and decide whether to roll out"
- "Block extra time for learning curve"

### To the client
Usually: don't mention the pilot. From their view, you're just running their project.

Exception: if the client is genuinely technical and curious about your process, you can mention. But:
- Don't position as "we're using AI now" (some clients fear AI)
- Don't position as "we're testing our process on you" (clients dislike being test subjects)
- Position as: "We've upgraded our internal tools to improve consistency and quality"

### After launch (any client)
You CAN ask for feedback on:
- Was communication clear throughout?
- Were update documents useful?
- Did you feel informed at every stage?

This feedback feeds the post-pilot retro.

---

## Honest expectations

The pilot will:
- ✗ Take longer than equivalent past projects (10-30% longer typically)
- ✗ Cost more in API spend (pilot has learning overhead)
- ✗ Surface uncomfortable system gaps
- ✗ Require some manual workarounds
- ✗ Feel awkward at first

The pilot should:
- ✓ Deliver good work for the client
- ✓ Capture systemic improvements
- ✓ Build team confidence (gradually)
- ✓ Validate the system OR identify what to fix

Don't expect the first pilot to be magic. The system gets MAGIC after 5-10 projects with continuous KB refinement.

---

## When to abandon a pilot mid-flight

In rare cases, you may need to stop the pilot:

- System is causing serious project issues (client unhappy, missed deadlines, quality problems)
- Team is burning out trying to make the system work
- Critical bugs in the system that block delivery

If this happens:
1. Switch the project back to your normal delivery process
2. Document what failed at length
3. Fix the systemic issues
4. Try another pilot later

Abandoning a pilot is not a failure — it's a system signal. Pay attention to it.

---

Last reviewed: 2026-05-25 by Claude (initial)
Next review due: 2026-08-25
