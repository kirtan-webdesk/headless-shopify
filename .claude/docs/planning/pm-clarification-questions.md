---
tier: 3
load_when: ["human-reference-only"]
---

# PM Agent — SOW Clarification Question Bank

> This is the "22-question questionnaire" that was vapor in your architecture doc. It is no longer vapor. The PM agent uses this bank to identify gaps in the incoming SOW and ask for missing information.

> The PM agent does NOT ask all 22 questions every time. It first detects which fields the SOW already covers (via `validate-spec` skill) and asks only the unanswered questions. The agent batches questions into ONE round of clarification, not multiple back-and-forths.

---

## How the agent uses this bank

1. PM agent reads the raw SOW.
2. PM agent extracts what it can find into a draft spec.
3. PM agent computes `sow.completeness_score` (0-100) based on which required fields are populated.
4. If score < 60 → halt at G0, request clarification.
5. PM agent selects questions from the bank below where the corresponding spec field is empty or ambiguous.
6. PM agent presents ALL needed questions in ONE structured message (never drip them).
7. Human (sales or client) answers.
8. PM agent integrates answers, recomputes score, re-validates.
9. When score ≥ 60, proceed to Gate 1 (plan approval).

---

## The Bank

### A. Project identity (foundational)

**Q1. Platform**
> What platform will this be built on? (Shopify, WordPress, BigCommerce, Magento, Node.js custom, headless setup, other)

**Q2. Project type**
> Is this a new build from scratch, a redesign of an existing site, a migration from another platform, a version upgrade, or ongoing maintenance?

**Q3. Existing assets**
> Does the client have an existing website, brand guidelines, design files (Figma/Sketch), or content library we should review before scoping?

---

### B. Business context (calibration)

**Q4. Business stage and scale**
> What stage is the business at — pre-launch, early-stage (< 100 orders/mo), growth ($100k-$1M/yr), or established ($1M+/yr)? This calibrates which features are worth building.

**Q5. Geographic / market scope**
> Which countries and currencies must the site support? Are translations required? Are there region-specific compliance needs (GDPR, CCPA, accessibility regulations)?

**Q6. Stakeholders and decision authority**
> Who is the primary decision-maker on the client side, what is their availability, and who else has approval authority for design or scope changes?

---

### C. Goals (success definition)

**Q7. Primary business goal**
> What is the single most important outcome this project must achieve? (e.g., increase conversion rate, support new product launch, reduce support tickets, enable subscription model.) If you can only achieve one thing, what is it?

**Q8. Success metrics**
> How will we know this project succeeded 30/60/90 days after launch? Specific numbers preferred. ("Increase mobile CVR from 1.2% to 2.0% within 90 days" is useful. "Make it better" is not.)

**Q9. Non-goals**
> What is this project explicitly NOT trying to achieve? (Helps prevent scope creep.)

---

### D. Scope precision (the gap-killers)

**Q10. Deliverable list — pages and templates**
> Which specific pages and templates need to be built? (Homepage, PLP, PDP, cart, checkout customizations, account, blog, about, contact, custom landing pages?) For each, is it net-new, redesigned, or carried over as-is?

**Q11. Integration list**
> Which third-party tools need to be connected? For each, specify: name, purpose, whether agency or client owns the account, whether API credentials have been provided.
>
> Common categories to cover explicitly: payments, shipping, tax, email (Klaviyo/Mailchimp), reviews, analytics (GA4, Meta Pixel), CRM, ERP, fulfillment, subscriptions, B2B portals.

**Q12. Custom functionality**
> Are there any features beyond standard ecommerce/CMS that we must build? (Quizzes, configurators, calculators, custom apps, custom checkout extensions, member areas, loyalty programs, custom workflows.)

**Q13. Content responsibilities — split**
> Who is providing what content? Specifically:
> - Product copy (descriptions, features, specs)
> - Product images
> - Lifestyle/hero photography
> - Hero copy and marketing copy
> - Blog content
> - Legal pages (privacy, terms, refund)
> - Meta titles and descriptions

**Q14. Content delivery timeline**
> By what date will all content be delivered to us? What happens if content is late?

---

### E. Migration / redesign specifics (conditional)

**Q15. (Migration only) Source platform and data**
> What is the source platform? What data must be migrated: products, customers, orders, blog posts, reviews, customer accounts, gift cards, subscription contracts? Approximate record counts for each?

**Q16. (Redesign or migration only) URL preservation**
> Do existing URLs need to be preserved? If not, a redirect map is required. Is the client able to provide the current URL inventory? Will SEO preservation be critical (current organic traffic levels)?

**Q17. (Version upgrade only) Existing customizations inventory**
> What custom code, themes, or plugins exist that may not be compatible with the new version? Is there documentation of customizations?

---

### F. Technical (platform-specific)

**Q18. Platform tier / hosting**
> For Shopify: which plan (Basic, Shopify, Advanced, Plus)?
> For WordPress: hosting provider, server specs, managed or self-hosted?
> For Magento: cloud or on-premise, edition?
> For Node.js: deployment target (Vercel, AWS, Cloudflare, custom)?
> For BigCommerce: plan tier?

**Q19. Existing app/plugin inventory**
> What third-party apps or plugins are currently installed (for redesigns/upgrades) and which must be kept, removed, or replaced?

---

### G. Timeline and budget (the politely-uncomfortable questions)

**Q20. Hard deadlines**
> Is there a hard launch deadline driven by a real business event (product launch, seasonal sale, contract obligation, funding milestone)? Or is the timeline aspirational?

**Q21. Budget tier and pricing model**
> Is this fixed-price or hourly? What is the budget envelope? Is there flexibility if scope discovery reveals more work than the original estimate?

**Q22. Approval rounds and revision allowance**
> How many rounds of design revisions are included? How many rounds of QA fixes per sprint? What is the change-request process for out-of-scope additions?

---

### H. Post-launch (often forgotten)

**Q23. Warranty period**
> What warranty/support period is included post-launch? What's covered (bug fixes only) vs. not covered (new features, content updates)?

**Q24. Handoff and training**
> Who on the client side will manage the site post-launch? Do they need training? In what format (live session, recorded video, written docs)?

**Q25. Ongoing relationship**
> Is there an expected ongoing retainer or maintenance relationship after launch?

---

## Question Categorization (used internally by PM agent)

The PM agent categorizes which questions are CRITICAL (block G0 if missing) vs. IMPORTANT (lower the completeness score but don't block).

### Critical (must answer or G0 fails)
- Q1 Platform
- Q2 Project type
- Q10 Deliverable list
- Q11 Integration list
- Q13 Content responsibility
- Q18 Platform tier
- Q20 Hard deadlines
- Q21 Budget tier

### Important (score impact, not blocker)
- Q3, Q4, Q5, Q6, Q7, Q8, Q9, Q12, Q14, Q19, Q22, Q23, Q24

### Project-type-conditional
- Q15, Q16 (migration / redesign)
- Q17 (version upgrade)

### Nice-to-have (no score impact)
- Q25

---

## Question Format When Presented to Human

The PM agent presents missing questions as a single batched message. Example:

```
═════════════════════════════════════════════════════════════════
SOW CLARIFICATION REQUIRED
═════════════════════════════════════════════════════════════════

Project: Aurora Skincare Redesign
SOW completeness: 42/100 — below threshold (60)

I've read the SOW. To produce an accurate spec and plan, I need
answers to the following. Please reply with the question number
and your answer. You can answer in any order.

─── Critical (these block the project until answered) ───

Q1. Platform
The SOW mentions "modern ecommerce" but doesn't specify which
platform. Is this Shopify? Plan tier?

Q11. Integration list
I see mentions of "email marketing" and "reviews" but no specifics.
Which tools? Who owns the accounts? Have API credentials been
shared?

Q13. Content responsibility
Will the client provide product copy and images, or is the agency
producing these? This significantly affects timeline.

─── Important (these affect the spec quality) ───

Q4. Business stage and scale
Q8. Success metrics
Q22. Approval rounds

─── Once I have these, I will produce the full spec and project
plan for Gate 1 review. ───
═════════════════════════════════════════════════════════════════
```

The PM agent does NOT make up answers. If the human cannot answer, the spec is flagged with `gaps: ["Q11 integration list not provided"]` and Gate 1 review must address the unknowns.

---

## Maintenance

This bank should be reviewed quarterly. When recurring issues come up that the bank didn't catch, add new questions. When questions are consistently irrelevant, remove them.

Owner: PM lead.

---

Last reviewed: 2026-05-24 by Claude (initial)
Next review due: 2026-08-24
