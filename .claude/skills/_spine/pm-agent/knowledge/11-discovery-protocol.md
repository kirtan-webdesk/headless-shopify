---
tier: 2
load_when: ["agent-specific-detail"]
description: "When the SOW includes a discovery phase, this protocol runs BEFORE spec generation. Discovery output may revise the scope before commitment."
---

# 11 — Discovery Protocol

> When the SOW includes a discovery phase, this protocol runs BEFORE spec generation. Discovery output may revise the scope before commitment.

---

## When discovery runs

Discovery is conditional. It runs when the SOW indicates one of:

1. **Explicit discovery line item** in deliverables (e.g., "Discovery: 20 hours")
2. **Discovery keywords** in SOW: "discovery phase," "user research," "audit," "stakeholder interviews," "competitive analysis," "design audit"
3. **Client explicitly requests** discovery in clarification responses
4. **Project type warrants it:** complex migrations, large new builds (>$50K), B2B with custom workflows

If discovery is scoped: G0.5 gate exists between G0 (SOW validation) and spec generation.
If not scoped: skip directly from G0 to spec generation. Don't insert discovery uninvited (you'd be billing/working for unscoped time).

---

## Discovery scope (what's covered)

Discovery deliverables vary by project type. Standard modules:

### Module 1 — Business audit
- Current state assessment (existing site if any, current platform, current metrics)
- Business goals deep-dive (beyond SOW: what's actually trying to be achieved?)
- KPI definition (specific success metrics, 30/60/90/180 day)
- Competitive landscape (top 5 competitors, what they do well/poorly)

### Module 2 — User / audience research
- Persona definition (primary + secondary + edge personas)
- User journey mapping (current state, ideal state)
- Pain points in current experience (from analytics, support tickets, customer feedback if available)
- Device / behavior mix (from analytics)

### Module 3 — Technical audit
- Current platform health (if existing site)
- Performance baseline (Lighthouse, Core Web Vitals)
- SEO baseline (organic traffic, ranking keywords, technical SEO issues)
- Accessibility baseline (axe scan of existing site if any)
- Existing integrations inventory + status
- Technical debt assessment (for redesigns/upgrades)

### Module 4 — Content audit (for redesigns/migrations)
- Content inventory (pages, posts, products, media)
- Content quality assessment
- Content gaps vs. competitor benchmarks
- Content migration scope (what comes over, what gets rewritten, what's deprecated)

### Module 5 — Design audit (for redesigns)
- Existing design system inventory (if any)
- Visual brand consistency assessment
- Pain points in current UI
- Design trends in client's industry (research)

### Module 6 — Stakeholder interviews
- Primary client contact (decision authority, priorities)
- Marketing team (campaigns, content workflows)
- Customer service (common issues)
- Operations / fulfillment (backend workflows)
- (Only conducted if scoped in discovery hours)

---

## Discovery process

### Step 1 — Confirm discovery scope

Before starting discovery:
1. Read SOW for discovery scope (hours allocated, modules requested)
2. If unclear, surface to developer for clarification:
   > "Discovery is scoped at [X] hours. Which modules should I run? Standard for [project type] is [list]. Confirm scope."
3. Set discovery boundary (don't run modules not scoped)

### Step 2 — Generate discovery questionnaire (if applicable)

For modules requiring client input (business audit, user research, stakeholder interviews):

1. Generate batched questionnaire (similar to clarification batching)
2. Format with clear sections per module
3. Send via Internal PM to client
4. Wait for responses

### Step 3 — Conduct technical / content / design audits (autonomous)

For modules NOT requiring client input:

1. Read existing site (if redesign/migration/upgrade)
   - Use WebFetch to crawl key pages
   - Run Lighthouse / axe / SEO crawler against live URL
2. Read provided assets (Figma, brand guidelines, content library)
3. Research client's industry (use WebSearch for current design trends, top players)
4. Analyze competitors (read 5 competitor sites for patterns)

### Step 4 — Produce discovery report

`/projects/[client]/discovery-report.md`:

```markdown
# Discovery Report — [Project Name]

**Project:** [name]
**Date:** [ISO date]
**Discovery hours:** [scoped]
**Modules included:** [list]

---

## Executive Summary
[3-5 paragraphs of key findings + recommendations]

---

## 1. Business Audit
[Findings + recommendations]

## 2. User / Audience Research
[Findings + recommendations]

## 3. Technical Audit
[Findings + benchmarks + recommendations]

[... other modules ...]

---

## Key Recommendations
[Bulleted list of what should change in scope vs. original SOW]

## Risks Identified
[New risks discovered during discovery, fed into risk log]

## Suggested Spec Adjustments
[Specific changes to original SOW based on findings]

---

## Appendix
- Stakeholder interview notes
- Competitive analysis details
- Raw audit data
- Research sources
```

### Step 5 — Suggest spec adjustments

If discovery reveals scope mismatches:

1. Document specific suggested changes:
   - Add: [items discovered that weren't in SOW]
   - Remove: [items in SOW that don't fit goals]
   - Modify: [items that need scope adjustment]
2. Estimate cost/timeline impact of changes
3. Surface to developer/Internal PM via discovery report
4. Wait for Gate G0.5 decision (CONFIRM, REVISE, or RENEGOTIATE)

### Step 6 — G0.5 gate

Discovery report + recommendations go to G0.5 (Discovery Sign-off) gate:

- CONFIRM: discovery findings accepted, proceed to spec with current scope
- REVISE: client wants to adjust scope per discovery findings
  → Update spec/SOW + return to G0 with new scope
- RENEGOTIATE: discovery reveals scope is fundamentally different than expected
  → Halt for sales/client renegotiation

---

## Discovery deliverables by project type

### Standard New Build
- Modules: 1, 2, 4 (light), 5
- Hours: typically 16-32
- Output: 5-15 page discovery report + recommendations

### Redesign
- Modules: 1, 2, 3, 4, 5
- Hours: typically 24-48
- Output: 10-25 page report + current/new state comparison + redirect strategy preview

### Migration
- Modules: 1, 3, 4 (heavy)
- Hours: typically 24-48
- Output: technical audit of source platform + data inventory + redirect strategy + cutover plan

### Headless
- Modules: 1, 3 (technical architecture deep-dive)
- Hours: typically 32-64
- Output: architecture recommendation + tech stack decision + API contract preview

### B2B (when complex)
- Modules: 1, 2 (user research with B2B personas), 3, 6
- Hours: typically 40-80
- Output: B2B workflow audit + customer hierarchy design + ERP integration design

---

## Discovery output formats per module

### Business audit module
```
Current State
- Platform: [name + version]
- Annual revenue: [if known]
- Monthly traffic: [if known]
- Conversion rate: [if known]
- Average order value: [if known]
- Top traffic channels: [list]

Business Goals (validated from SOW + interviews)
1. [Goal 1] - target metric: [X]
2. [Goal 2] - target metric: [Y]
3. [Goal 3] - target metric: [Z]

Competitive Landscape
- Direct competitors: [list 5]
- Patterns observed: [what they do that's relevant]
- Differentiation opportunities: [what client could do better]
```

### Technical audit module
```
Performance Baseline
- Lighthouse Performance: [score]
- LCP: [seconds]
- CLS: [score]
- INP: [ms]
- Page weight: [MB]

SEO Baseline
- Organic traffic: [monthly visits]
- Ranking keywords: [count + top 20]
- Technical issues: [list]
- Schema markup: [present / missing per page type]

Accessibility Baseline
- WCAG 2.1 AA: [pass / partial / fail]
- axe-core violations: [count by severity]
- Manual issues: [list]

Integration Inventory
- [Tool name]: [status, working / broken / deprecated]
- ...
```

### Content audit module
```
Content Inventory
- Pages: [count]
- Blog posts: [count]
- Products: [count]
- Media files: [count + size]

Content Quality Assessment
- High quality: [count]
- Needs revision: [count]
- Should be deprecated: [count]

Content Migration Recommendations
- Migrate as-is: [list]
- Migrate with revision: [list]
- Don't migrate (deprecated): [list]
```

---

## Discovery quality bar

A good discovery report:
- Surfaces things the SOW didn't anticipate (most valuable output)
- Provides specific data, not vague impressions
- Recommends concrete spec adjustments (with cost/timeline impact)
- Identifies new risks not visible at SOW stage
- Validates or invalidates assumptions in the SOW

A bad discovery report:
- Restates the SOW back to the client
- Vague "needs more research" recommendations
- No specific data
- Surfaces no risks
- Doesn't change anything in the scope

If PM Agent's discovery report looks like the second list, redo it.

---

## When discovery should HALT for renegotiation

If discovery reveals:
- The SOW scope is fundamentally wrong (e.g., SOW says redesign but client really needs migration)
- Source platform data is corrupted beyond recoverable migration
- Client's goals can't be achieved on the platform specified
- Timeline is fundamentally unrealistic given discovered scope

→ Set G0.5 decision to RENEGOTIATE. Project on hold. Sales/client must revise SOW before continuing.

This is rare but happens. Better to halt here than to ship a doomed project.

---

## Anti-patterns

1. **Running discovery without scope.** Don't discover for free. Confirm hours allocated.

2. **Discovery report that's all summary, no findings.** The point of discovery is to FIND things. If you didn't find anything, you didn't really discover.

3. **Recommendations without cost/timeline impact.** Every recommendation has trade-offs. Spell them out.

4. **Skipping competitor research when it's scoped.** Competitors are the best data source for "what does good look like in this industry."

5. **Treating discovery as a formality.** Discovery is the BEST opportunity to catch SOW mistakes before development locks them in.

6. **Discovery with no client interaction.** If module 6 (stakeholder interviews) is scoped, actually conduct them via the Internal PM. Don't fake findings.

---

Last reviewed: 2026-05-24 by Claude (initial)
Next review due: 2026-08-24
