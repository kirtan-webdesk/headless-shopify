---
tier: 2
load_when: ["agent-specific-detail"]
description: "The 22-question library Designer Agent uses to extract brand essentials. Questions surface specifics that drive token decisions."
---

# 01 — Brand Questionnaire

> The 22-question library Designer Agent uses to extract brand essentials. Questions surface specifics that drive token decisions.

---

## How this is used

After spec is approved (G1) and design phase starts, Designer Agent runs this questionnaire. Sent to Internal PM, who relays to client. Responses inform:
- Color token generation
- Typography token decisions
- Imagery direction
- Section pattern selection
- AI image generation prompts

Questions are batched into ONE structured questionnaire (not drip). Client answers in any order. Estimated 30-45 minutes of client time to complete.

---

## The 22 questions

### A. Brand essence (questions 1-5)

**Q1. In one sentence, what does your brand stand for?**
> Why we ask: Anchors all design decisions. If client can't answer, brand work needs to happen before design work.
> Example: "We make sustainable skincare for women who care about clean ingredients and visible results."

**Q2. What 3 adjectives best describe your brand personality?**
> Why we ask: Drives tone of design — playful, serious, sophisticated, energetic, etc.
> Example: "Calm. Honest. Premium."

**Q3. What 3 adjectives should your brand NEVER be associated with?**
> Why we ask: Guard rails. Often more informative than what brand IS.
> Example: "Cheap. Aggressive. Generic."

**Q4. Who is your primary customer (one persona, briefly)?**
> Why we ask: Design appeals to specific audiences differently. Gen Z vs. Boomer makes massive design differences.
> Example: "Women 30-45, urban professional, household income $100K+, values authenticity over hype."

**Q5. What's the emotional outcome you want customers to feel when visiting the site?**
> Why we ask: Drives mood + tone of everything.
> Example: "Confident. Reassured that they found a brand that gets them."

---

### B. Audience perception (questions 6-8)

**Q6. What 3 brands do you admire visually (in or out of your industry)? Why?**
> Why we ask: Visual references > vague descriptions. "I want it to look like Glossier" is useful. Pull patterns from cited brands.

**Q7. What 3 brands do you specifically NOT want to look like? Why?**
> Why we ask: Often surfaces values clients can't articulate positively but can identify negatively.

**Q8. Who are your top 5 direct competitors (URLs)?**
> Why we ask: Competitor audit research. We'll look at all 5 to identify patterns to embrace or differentiate from.

---

### C. Color & typography (questions 9-13)

**Q9. Do you have existing brand colors? List them as hex codes.**
> Example: "Primary #2E4A1F (deep green), Secondary #D4AF37 (gold), Accent #F5F1E8 (cream)."
> If yes → we'll work within these constraints + extend the palette.
> If no → we'll generate a palette during research.

**Q10. What color emotions do you want to evoke?**
> Examples to choose from (or describe own):
> - Warm + welcoming (earth tones, warm neutrals)
> - Cool + clinical (blues, grays, whites)
> - Bold + energetic (saturated, contrasting)
> - Refined + premium (deep tones, minimal palette)
> - Playful + youthful (bright, varied)
> - Natural + organic (greens, browns, muted)

**Q11. Do you have a brand font? If yes, what is it? If no, do you have a font style preference?**
> Style options: serif (traditional/editorial), sans-serif (modern/clean), display (distinctive headlines), monospace (technical).
> Example: "Heading font Playfair Display (serif). Body Inter (sans). Open to suggestions for accent."

**Q12. What's your typography "feel" preference?**
> Options:
> - Editorial (large display sizes, generous line heights, serif-heavy)
> - Modern (geometric sans, tight tracking, contemporary)
> - Bold (heavy weights, attention-grabbing)
> - Refined (smaller sizes, more whitespace, premium feel)
> - Friendly (rounded sans, comfortable reading)

**Q13. Do you have brand guidelines / style guide?**
> If yes: please share the file.
> If no: we'll generate baseline guidelines as part of token system.

---

### D. Imagery & visual style (questions 14-16)

**Q14. What kind of imagery feels right for your brand?**
> Options (can pick multiple):
> - Product on plain background (catalog style)
> - Lifestyle (people using product in context)
> - Editorial (high-fashion magazine style)
> - Documentary (authentic, behind-the-scenes)
> - Illustration / graphic (instead of photography)
> - Minimal / abstract (texture, color blocks)

**Q15. Will you provide photography, or should we direct AI-generated hero imagery?**
> If client-provided: we'll work with what's supplied
> If AI-generated: we'll direct Midjourney/DALL-E with brand-consistent prompts (output approved by client before use)
> If mixed: specify which sections client-provided vs AI-generated.

**Q16. Any visual elements you LOVE (motifs, textures, patterns, illustration styles)?**
> Free-form. Examples: "soft watercolor backgrounds", "geometric line patterns", "hand-drawn icons", "duotone photography treatment".

---

### E. Functional requirements (questions 17-19)

**Q17. What's the most important action you want users to take on the homepage?**
> Drives hero design + CTA hierarchy.
> Example: "Add a product to cart from the homepage hero."
> Or: "Sign up for the newsletter to learn more before buying."
> Or: "Watch our brand video to understand who we are."

**Q18. What functional features absolutely must be on the site (beyond standard ecommerce)?**
> Examples: subscription products, virtual try-on, store locator, video product reviews, live chat, quiz/recommender, loyalty program access.
> Pulled from spec but confirm here in case spec missed something.

**Q19. Mobile experience priority: optimized for transactional (fast checkout) or exploratory (browsing, content discovery)?**
> Drives mobile information architecture decisions.

---

### F. Conversion & trust (questions 20-22)

**Q20. What trust signals matter most to your customer?**
> Options:
> - Customer reviews & ratings
> - Press mentions (logos)
> - Founder/founder team visibility
> - Certifications (organic, fair-trade, B-Corp, etc.)
> - Money-back guarantee
> - Free shipping/returns
> - Social proof (community size, customer count)
> - Sustainability credentials
> - Made-in / origin story

**Q21. What's your typical customer's biggest hesitation before purchasing?**
> Drives where on the page we address objections.
> Example: "Is this actually worth the price?" → emphasize quality/ingredient differentiators near price.
> Example: "Will this work for my specific skin type?" → quiz/recommender + reviews from similar customers.

**Q22. Any specific design "must-haves" or "no-go's" that we haven't covered?**
> Free-form catch-all. Surfaces things clients couldn't articulate via earlier questions.

---

## Format when presenting to client

```
═════════════════════════════════════════════════════════════════
BRAND QUESTIONNAIRE — [Project Name]
═════════════════════════════════════════════════════════════════

We need to understand your brand to make design decisions that
serve your goals. About 30-45 minutes of your time. You can answer
in any order. Skip any question that doesn't apply.

─── A. Brand Essence ───────────────────────────────────────────

Q1. In one sentence, what does your brand stand for?

Q2. What 3 adjectives best describe your brand personality?

Q3. What 3 adjectives should your brand NEVER be associated with?

Q4. Who is your primary customer (one persona, briefly)?

Q5. What's the emotional outcome you want customers to feel when
    visiting the site?

─── B. Audience perception ─────────────────────────────────────

[... etc ...]

═════════════════════════════════════════════════════════════════
```

---

## Question prioritization

If client is time-constrained, the minimum set is:
- Q1 (brand stand), Q2 (personality), Q4 (customer), Q6 (admire), Q7 (avoid), Q9 (colors), Q11 (fonts), Q14 (imagery), Q17 (main action), Q21 (hesitation)

These 10 are enough to generate a working token system + section recommendations. The other 12 add depth/refinement.

---

## Output

Designer Agent stores responses in `/projects/[client]/brand-questionnaire-responses.md`:

```markdown
# Brand Questionnaire Responses — [Project Name]

**Date completed:** [date]
**Completed by:** [client name + role]

## A. Brand Essence
Q1: [response]
Q2: [response]
...

## B. Audience perception
...

[... full responses ...]

## Designer Agent's interpretation
[Designer Agent's analysis: which decisions are anchored, which need more research]

## Token implications
[How responses translate to token decisions]

## Section pattern implications
[How responses translate to section recommendations]
```

This file feeds into the design-tokens.json generation and section-map.json generation.

---

## Anti-patterns

1. **Skipping the questionnaire because spec is "detailed enough".** Spec has business requirements. Questionnaire surfaces brand specifics. Both needed.

2. **Asking all 22 questions when client said they want it lean.** Use prioritized set (10 questions) for time-constrained clients.

3. **Accepting vague answers.** "Q2: Modern and fresh." → Push back: "What does 'modern and fresh' mean to you? Show me an example of a brand that captures it."

4. **Generating tokens before getting questionnaire responses.** Tokens without brand input = generic. Wait for responses.

5. **Treating brand designer's input as optional.** If client has a brand designer (external), they should provide input or review. Loop them in via Internal PM.

---

## Maintenance

Questionnaire reviewed quarterly. Add questions when projects surface recurring gaps. Remove questions that consistently get skipped or get unhelpful responses.

Owner: Designer lead.

---

Last reviewed: 2026-05-24 by Claude (initial)
Next review due: 2026-08-24
