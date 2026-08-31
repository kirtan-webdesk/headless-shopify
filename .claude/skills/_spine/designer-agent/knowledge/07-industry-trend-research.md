---
tier: 2
load_when: ["agent-specific-detail"]
description: "Designer Agent does research, not generation. This file explains the research methodology, what's in scope, what's not."
---

# 07 — Industry Trend Research

> Designer Agent does research, not generation. This file explains the research methodology, what's in scope, what's not.

---

## Honest scope (read first)

AI cannot generate "trendy design." AI can:
- Research current trends via web search
- Analyze competitors and extract patterns
- Identify industry conventions
- Recommend tokens and section choices that REFLECT current trends

AI cannot:
- Invent a novel visual aesthetic
- Predict what will be trendy in 18 months
- Replace a human designer's creative judgment
- Generate "Awwwards-quality" original design from prompts

What follows is what Designer Agent CAN do — and where to stop and recommend human designer involvement.

---

## When research happens

Research runs in the design phase, AFTER brand questionnaire (`01-brand-questionnaire.md`) is complete. Sequencing:

1. Spec approved (G1)
2. Brand questionnaire run + responses received
3. Industry trend research (this file)
4. Competitor audit (next section of this file)
5. Design path recommendation (`02-design-path-decision.md`)
6. Token generation
7. Section selection

Without research, tokens are generic. With research, tokens are informed.

---

## Research methodology

### Step 1 — Define the search

From questionnaire responses + spec, build search queries:

```
Inputs from questionnaire:
- Industry (Q4 audience, Q8 competitors)
- Brand admiration list (Q6)
- Style direction (Q12 typography feel, Q14 imagery)
- Trust signals priority (Q20)

Inputs from spec:
- Geographic markets
- Target audience tier (luxury / mass-market / niche)

Output: 3-5 focused search queries
```

Examples:
- "Modern skincare brand ecommerce 2026"
- "Premium DTC skincare website design trends"
- "Minimal Shopify themes high contrast"
- "Sustainable beauty brand homepage 2025"

### Step 2 — Execute searches

Use WebSearch tool to gather references. Save URLs of relevant findings.

Look for:
- Award sites (Awwwards, CSS Design Awards, Webby Awards) — quality bar reference
- Industry blogs (Shopify blog, Klaviyo blog, AdAge, Marketing Brew, Glossy)
- Design trend articles (Smashing Magazine, Site Inspire, Dribbble)
- Specific industry roundups ("Top X skincare brands of [year]")

### Step 3 — Extract patterns

From research, identify recurring patterns in the industry:

```markdown
## Patterns observed in [industry] design (2025-2026)

### Layout patterns
- [Pattern 1]: [Where seen, how often]
- [Pattern 2]: [...]

### Color patterns
- [Pattern 1]: [E.g., "Warm earth tones with cream backgrounds"]
- [Pattern 2]: [...]

### Typography patterns
- [Pattern 1]: [E.g., "Serif heading + clean sans body — 12/15 brands surveyed"]
- [Pattern 2]: [...]

### Imagery patterns
- [Pattern 1]: [E.g., "Lifestyle photography over plain product shots"]
- [Pattern 2]: [...]

### Conversion patterns
- [Pattern 1]: [E.g., "Quiz-style product finder in nav — 8/15 brands"]
- [Pattern 2]: [...]
```

### Step 4 — Distinguish current vs. fading vs. emerging

Not all "trends" are equal:
- **Established convention:** Used by most brands in this space; safe; doesn't differentiate
- **Current trend:** Adopted in last 1-2 years, growing; differentiates a little; risk of becoming dated
- **Emerging trend:** Just appearing, not widely adopted yet; high differentiation; risk of being too early or wrong

Designer Agent flags which category each pattern falls into.

### Step 5 — Save findings

`/projects/[client]/industry-research.md`:

```markdown
# Industry Research — [Client Name]'s Industry

**Industry:** [Skincare / Fashion / B2B SaaS / etc.]
**Date:** [date]
**Sources surveyed:** [N]

## Patterns observed

[Detailed pattern analysis from Step 3]

## Emerging vs. established vs. fading

[Categorization from Step 4]

## Recommendations for this project

Based on research + client brand:
- Apply established conventions: [list — what to embrace]
- Apply current trends: [list — what to use]
- Avoid emerging risks: [list — what to be cautious about]
- Differentiate from competitors via: [list — opportunities]

## Sources
- [URL] — [what was found]
- [URL] — [what was found]
- ...
```

---

## Competitor audit

Separate from industry research. Specific to the 5 competitors named in questionnaire Q8.

### Methodology

For each of the 5 competitors:

1. **Visit the live site**
   - Homepage, PDP, PLP, cart (if accessible without purchase)
   - Mobile + desktop views
2. **Note observations across categories:**
   - Visual style (colors, typography, imagery)
   - Layout (above-the-fold, navigation, footer)
   - Content (tone, messaging, headlines)
   - Conversion design (CTAs, trust signals, social proof)
   - Performance (rough LCP impression, page weight)
   - Accessibility (cursory check)
3. **Identify what they do well**
4. **Identify what they do poorly**
5. **Identify opportunities for differentiation**

### Output format

`/projects/[client]/competitor-audit.md`:

```markdown
# Competitor Audit — [Client Name]

**Date:** [date]
**Competitors audited:** [N]

## Competitor 1: [Name + URL]

### What they do well
- [Specific observation]
- [...]

### What they do poorly
- [Specific observation]
- [...]

### Visual character
- Colors: [palette description]
- Typography: [families + feel]
- Imagery: [style + execution]

### Conversion approach
- Primary CTA: [what + where]
- Trust signals: [what + where]
- Social proof: [what + scale]

### Notable patterns
- [Pattern 1]
- [Pattern 2]

---

## Competitor 2: [Name + URL]
[Same structure]

[... competitors 3, 4, 5 ...]

---

## Cross-competitor analysis

### Consistent patterns across competitors
- [Pattern 1] (used by 5/5)
- [Pattern 2] (used by 4/5)

These are convention. To match, do this. To differentiate, do something different.

### Inconsistent patterns
- [Pattern 1] used by 2/5, the others avoid it

### Where everyone is weak
- [Common weakness 1] — opportunity for [Client Name] to differentiate
- [Common weakness 2]

### What [Client Name] should embrace
- [Specific recommendation]

### Where [Client Name] should differ
- [Specific opportunity]
```

---

## Tools available for research

### WebSearch
For broad industry queries. Use to find articles, roundups, trend reports.

### WebFetch
To pull specific page content for analysis. Use on competitor sites, award winners.

### Claude in Chrome (if available)
For richer interactions with JavaScript-heavy sites (some modern ecommerce sites are SPA-heavy and WebFetch only sees the shell).

### Figma MCP (if available)
For analyzing Figma files when client provides design references.

### Manual capture
Some sites block scraping. In those cases, Designer Agent notes: "Site X requires manual review by team — please screenshot key sections and feed back."

---

## Research scope limits

Designer Agent stays focused. Don't:

- Spend 8 hours researching when 2 hours is enough
- Analyze 20 competitors when 5 is the spec
- Document patterns that don't inform decisions
- Recommend "trendy" things that contradict client brand
- Research industry trends for B2B SaaS when client is selling pet supplies

If a research direction isn't paying off in 30 minutes of effort, stop and reframe.

---

## When to recommend human designer involvement

After research, Designer Agent assesses: can AI tokens + section library cover this, or does this need human design?

Recommend human designer when:

- **Brand differentiation is mission-critical** (client explicitly wants to look unique)
- **Hero moments need true creativity** (homepage hero, key brand expression)
- **Competitor analysis reveals saturation** (all 5 competitors look similar, client needs to stand out)
- **Industry has visual ceiling** (luxury, high-fashion, art-related — AI tokens are baseline at best)
- **Custom illustration / iconography** is part of scope
- **Client questionnaire indicates strong opinion + unique direction**

When recommending, be specific:

> "Based on the research, [Client Name]'s competitors are all using cool minimalist palettes. To stand out, the client should consider warm earthy tones with bold serif typography. The token system I can generate will reflect this direction, but the homepage hero and brand identity moments would benefit from a human designer who can craft truly distinctive visual treatments. Recommend [internal designer name or external]."

---

## Trend research anti-patterns

1. **Recommending what's "trendy" without explaining why it fits this client.** Trends are tools, not goals. Use them when they serve the brand, not because they're trendy.

2. **Cargo-culting competitor patterns.** If 5/5 competitors have a chatbot in the corner, doesn't mean this client should. Maybe avoiding it differentiates.

3. **Ignoring fading trends.** Designer Agent should recognize when a "trend" is past its peak and recommend against (e.g., heavy parallax in 2024, neumorphism in 2025).

4. **Over-researching.** Diminishing returns after a few hours. Move to token generation.

5. **Research without applying.** Research that doesn't change token decisions or section selection is wasted effort. Always tie research to specific decisions.

6. **Faking trend awareness.** If Designer Agent isn't sure a "trend" is current, say so. Don't fabricate.

---

## Updating research over time

Trend research is time-sensitive. A research file from 2 years ago is stale.

For repeat clients (via client memory file), Designer Agent does NOT reuse old research. Fresh research per project.

For trend libraries (curated by your team for the agency's pattern library): refresh quarterly. Add new patterns, remove fading ones.

---

Last reviewed: 2026-05-24 by Claude (initial)
Next review due: 2026-08-24
