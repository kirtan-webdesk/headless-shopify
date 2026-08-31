---
tier: 2
load_when: ["agent-specific-detail"]
description: "At project close, PM Agent generates a client-specific context file that persists across projects. Used when starting a NEW project for the same client to avoid re-learning their preferences."
---

# 10 — Client Memory Template

> At project close, PM Agent generates a client-specific context file that persists across projects. Used when starting a NEW project for the same client to avoid re-learning their preferences.

---

## Why this exists

Most clients return for additional work — new features, redesigns, additional platforms, new sites for sub-brands. Each return engagement involves rediscovering: what did this client prefer? What worked last time? What didn't?

The client memory file solves this. PM Agent reads it at the start of any new project for an existing client. Saves discovery overhead. Avoids repeating mistakes.

---

## When generated

At project close, AFTER the master doc is produced. Saved to:
- `/projects/[client]/final-deliverables/client-memory.md`
- AND copied to a client-level location: `/client-memory/[client-slug]/[YYYY-MM]-[project-name].md`

The client-level location accumulates one memory file per project. When a new project starts for the same client, the orchestrator reads ALL memory files in `/client-memory/[client-slug]/` and synthesizes them into the new project's context.

---

## How orchestrator uses this

When a new project starts (Step 2A in `01-session-start-protocol.md`):

1. Check if `/client-memory/[client-slug]/` exists
2. If yes, surface to developer:
   > "I see we've worked with [client] before. Found [N] previous projects in their memory:
   > - [Project 1] ([date])
   > - [Project 2] ([date])
   >
   > Should I load their memory to inform the new project's intake? (Y/N)"
3. If developer accepts, read all memory files
4. Synthesize key insights into the new project's spec generation context

This is OPT-IN, not automatic. Developer decides if memory is relevant.

---

## Format and structure

```markdown
# Client Memory — [Client Name]

**Client:** [Client Name]
**Client industry:** [industry/niche]
**Memory file version:** 1.0
**Compiled from project:** [Project Name] ([Project ID])
**Project completed:** [date]
**Compiled by:** PM Agent v1.0

> Purpose: Capture what we learned working with this client. Read at the start of any new project for them to avoid re-discovering.

---

## 1. About the Client

### Business profile
- **Industry / niche:** [specific]
- **Business stage at last engagement:** [Pre-launch / Early / Growth / Established]
- **Geographic markets:** [list]
- **Annual revenue tier (if known):** [tier]
- **Approximate team size:** [if known]
- **Their key competitors:** [list — useful for design research]
- **Their brand voice:** [formal / casual / playful / authoritative — observed during project]

### Why they chose us
[If known: referral, repeat work, specific capability, etc. Useful for relationship-building.]

---

## 2. Stakeholders

### Primary contact
- **Name:** [name]
- **Role:** [title]
- **Decision authority:** [full / requires approval / scope of authority]
- **Communication preferences:**
  - Best channel: [email / Slack / call / Podio]
  - Response time typical: [same-day / 1-2 days / slow]
  - Time zone: [zone]
  - Preferred meeting times: [if known]
- **Communication style observed:**
  - [Direct / thoughtful / data-driven / vision-focused / etc.]
  - [What they get excited about, what they don't]

### Secondary contacts (if any)
- **Name + Role:** [name + title]
- **When to involve:** [specific topics]

### External parties from their side
- **Brand designer:** [name, if applicable, working relationship]
- **Photographer:** [name]
- **PR / marketing agency:** [name]

---

## 3. Technical Preferences

### Platform / tech choices
- **Preferred platform:** [Shopify / WordPress / etc.]
- **Plan tier they pay for:** [Basic / Plus / Enterprise]
- **Hosting / infrastructure:** [if relevant]

### Approved tools / apps they like
- [Tool 1]: why they like it / how they use it
- [Tool 2]: ...

### Tools they've rejected / dislike
- [Tool 1]: reason ("too expensive," "bad UX," "data ownership concerns," etc.)

### Integration ecosystem
- **Email marketing:** [Klaviyo with [setup notes]]
- **Reviews:** [Judge.me with [notes]]
- **ERP / inventory:** [system + connection method]
- **Customer service:** [tool]
- **Analytics:** [GA4 + Meta Pixel + others]
- **Other:** [list]

---

## 4. Design Preferences

### Aesthetic direction
- **Style observed:** [minimalist / maximalist / editorial / playful / corporate / etc.]
- **Color preferences:** [specifics — they liked X, didn't like Y]
- **Typography preferences:** [serif / sans / specific fonts]
- **Imagery style:** [lifestyle / studio / mixed / illustration]

### Brand assets location
- **Brand guidelines:** [where stored, version]
- **Logo files:** [where stored]
- **Photography library:** [where stored]
- **Custom illustrations:** [where stored]

### Approval patterns observed
- **How many rounds of design revisions:** typically [N]
- **Common revision themes:** [what they often ask for]
- **What they say YES to fast:** [pattern]
- **What they tend to push back on:** [pattern]

---

## 5. Working Style

### Project management
- **Their PM tool of choice:** [Podio / Asana / Notion / etc.]
- **Their cadence preference:** [weekly check-ins / async / milestone-driven]
- **They prefer updates in:** [format]

### Approval cycles
- **Typical approval time:** [same-day / 1-3 days / longer]
- **Who approves what:** [primary signs off design, secondary signs off tech, etc.]
- **Decisions that take longer:** [pattern — e.g., "anything involving spend"]

### Communication patterns
- **Email response time:** [typical]
- **Meeting frequency preference:** [weekly / bi-weekly / on-demand]
- **Documentation appetite:** [light / thorough / formal contracts]

### Scope discipline
- **Mid-project change requests:** [frequent / rare / well-managed]
- **Scope creep tendency:** [low / medium / high]
- **How they handle out-of-scope:** [accept new quote / push to include / negotiate]

---

## 6. Past Projects History

### Project 1: [Name]
- **Date:** [start - end]
- **Type:** [type]
- **Outcome:** [successful / partially successful / problems]
- **Key learnings:** [what to remember]
- **Estimation accuracy:** [estimate vs actual]

### Project 2: [Name]
[Same structure]

[List all prior projects]

---

## 7. What Worked

[Specific things that were successful — repeat these patterns.]

- [Worked well 1]: [specific pattern]
- [Worked well 2]: [...]

Example:
- Sending Loom video walkthroughs for design reviews → client engaged more, faster feedback
- Splitting M2 into 2 milestones → made progress more visible, eased their nervousness
- Weekly Friday updates at 3pm → matched their internal review cadence

---

## 8. What Didn't Work

[Specific things to avoid in future projects.]

- [Didn't work 1]: [specific issue + what to do instead]
- [Didn't work 2]: [...]

Example:
- Showing design tokens as JSON for approval → confused client; use visual mockups instead
- Assuming default warranty acceptable → they wanted 60 days; ask upfront for this client
- Sprint-level cost reports → too granular; milestone-level is enough for this client

---

## 9. Quirks & Preferences

[Specific details that don't fit other categories but are important to remember.]

- [Quirk 1]: [observation + how to handle]

Example:
- Prefers being CC'd on internal discussions about their project → unusual but appreciated
- Has strong opinions about specific colors (#FF6B35 is their "rage color" — never use)
- Their CEO reviews EVERY launch — schedule launch on Tuesday or Wednesday, not Monday or Friday

---

## 10. Financial History

### Pricing patterns observed
- **Typical project budget:** [range]
- **Pricing model preference:** [fixed-price / hourly / hybrid]
- **Payment timing:** [prompt / sometimes slow / specific terms]
- **Net terms:** [Net 30 / Net 15 / etc.]
- **Currency:** [USD / CAD / etc.]

### Scope-cost relationship
- **Sensitive to:** [price changes / scope additions / etc.]
- **Willing to pay more for:** [quality / speed / specific capabilities]

---

## 11. Open Threads at Project Close

[Anything that was left open with this client — potential future work, deferred features, follow-up commitments.]

- **Deferred for v2:** [list of items]
- **Promised but not yet delivered:** [list, with dates if any]
- **Maintenance discussion:** [if any]
- **Renewal / next project conversation:** [where it's at]

---

## 12. Recommended Approach for Next Project

[If we work with this client again, here's what to do differently / continue.]

### Start with:
- [Specific approach 1]
- [Specific approach 2]

### Avoid:
- [Specific approach 1]

### Suggest to client:
- [Improvement opportunity 1 — based on what we observed]
- [Improvement opportunity 2]

---

## 13. Files & Resources

- **Master doc from last project:** [link]
- **Final spec:** [link]
- **Design files:** [Figma / etc. URLs]
- **Brand assets:** [location]
- **Credentials list:** [secure location reference, NOT in this file]
- **Communication archive:** [Podio / etc. links]

---

Generated by: PM Agent v1.0
Last engagement: [project name + close date]
Next review: when client returns for next project
```

---

## How memory accumulates over multiple projects

After 3-5 projects with the same client, the orchestrator should synthesize patterns across memory files:

```
Synthesized client profile for [Client Name]:

Aggregated from [N] projects over [date range]:

- Consistent preferences: [things that show up in multiple memory files]
- Evolving preferences: [things that have changed over time]
- Recurring quirks: [things that have appeared more than once]
- Estimation pattern: across [N] projects, this client's projects tend to overrun by [X%]
  due to [common cause]
```

This is handled at orchestrator level (cross-project synthesis), not in any single memory file.

---

## Privacy considerations

The client memory file contains observations about the client's behavior, preferences, and decision-making. Treat as confidential.

DO NOT include:
- Disparaging comments about client staff
- Specific complaint history that could be embarrassing
- Personal information about contacts beyond what's needed for working with them
- Financial information beyond pricing patterns (no bank details, etc.)

DO include:
- Professional observations relevant to delivering work
- Communication preferences
- Decision-making patterns
- Brand and design preferences
- Technical preferences and history

If in doubt, ask: "Would I be comfortable if the client saw this file?" If yes, include. If no, omit.

---

## When this file is updated

The file is created at project close.

It is NEVER updated retroactively. Each new project produces its OWN client memory file. The orchestrator synthesizes ACROSS files when starting a new project.

This way, you can see the evolution of the client relationship over time.

---

## Anti-patterns

1. **Memory file too generic.** "Client is good to work with" — useless. Be specific: "Sarah at [client] responds to Slack DMs within 30 minutes; emails take 24 hours. For urgent decisions, use Slack."

2. **Memory file as gossip.** Stay professional. Observations are about WORKING with them, not personal judgments.

3. **Memory not consulted.** Generated and forgotten. Orchestrator must check for client memory at every new project start.

4. **Memory file becomes a project diary.** It's a CONSOLIDATED post-project artifact, not a running log.

5. **Memory file ignored when stale.** If last engagement was 2+ years ago, client may have changed. Use as starting point, verify don't assume.

---

## Quality bar

A good client memory file:
- A new account manager could read it and have a 15-minute briefing on this client
- Saves at least 4-8 hours of discovery on the next engagement
- Captures specifics (names, dates, quirks), not generalities

A bad client memory file:
- Reads like a generic agency template
- Doesn't change PM Agent's behavior on next project
- Has nothing specific to this client

PM Agent self-check: "If I read this in a year and started a new project, would I be smarter for having read it?" If no, revise.

---

Last reviewed: 2026-05-24 by Claude (initial)
Next review due: 2026-08-24
