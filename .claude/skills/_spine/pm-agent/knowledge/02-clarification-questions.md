---
tier: 2
load_when: ["agent-specific-detail"]
description: "The 25-question library the PM Agent draws from when an SOW has gaps. Not asked all at once — only those matching identified gaps."
---

# 02 — Clarification Questions Bank

> The 25-question library the PM Agent draws from when an SOW has gaps. Not asked all at once — only those matching identified gaps.

---

## How this bank is used

The PM Agent identifies gaps in the SOW (per `01-sow-intake-protocol.md`). For each gap, the corresponding question is selected from this bank. All selected questions are batched into ONE structured clarification request.

Do NOT ask questions for fields the SOW already covers. Do NOT ask redundant questions. Do NOT drip questions across multiple rounds.

---

## Categorization

- **Critical (C):** Project blocked at G0 until answered. SOW completeness will not reach 60 without these.
- **Important (I):** Affects spec quality. Lowers completeness score if unanswered.
- **Nice-to-have (N):** No score impact. Asked only if other questions are being asked.
- **Conditional (X):** Only asked for specific project types.

---

## A. Project identity

### Q1 — Platform [C]
What platform will this be built on?
Options: Shopify, BigCommerce, WordPress (WooCommerce or other), Magento (Open Source or Adobe Commerce), Node.js custom, headless setup, other.

### Q2 — Project type [C]
Is this:
- New build from scratch
- Redesign of existing site
- Migration from another platform
- Version upgrade
- Version upgrade + redesign (combined)
- Headless build
- B2B commerce
- Other

### Q3 — Existing assets [I]
Does the client have an existing website, brand guidelines, Figma/Sketch design files, content library, or any prior agency work we should review before scoping?

---

## B. Business context

### Q4 — Business stage and scale [I]
Pre-launch / Early-stage (< 100 orders/mo) / Growth ($100k-$1M/yr) / Established ($1M+/yr)?
This affects which features are worth building.

### Q5 — Geographic and market scope [I]
Which countries and currencies must the site support? Are translations required? Region-specific compliance (GDPR, CCPA, accessibility regs)?

### Q6 — Stakeholders and decision authority [I]
Primary decision-maker on client side? Their typical availability? Anyone else with approval authority for design or scope changes?

---

## C. Goals

### Q7 — Primary business goal [I]
What is the single most important outcome this project must achieve? If you could only achieve one thing, what would it be?

### Q8 — Success metrics [I]
How will we know this project succeeded 30/60/90 days post-launch? Specific numbers preferred ("increase mobile CVR from 1.2% to 2.0%" is useful; "make it better" is not).

### Q9 — Non-goals [I]
What is this project explicitly NOT trying to achieve? (Prevents scope creep.)

---

## D. Scope precision

### Q10 — Deliverable list — pages and templates [C]
Which specific pages and templates need to be built?
- Homepage, PLP (Product Listing Page), PDP (Product Detail Page), cart, checkout customizations, account pages, blog, about, contact, custom landing pages?
- For each: net-new, redesigned, or carried over as-is?

### Q11 — Integration list [C]
Which third-party tools need to be connected? For each:
- Name and purpose
- Who owns the account (agency or client)
- Whether API credentials have been provided
- Common categories: payments, shipping, tax, email (Klaviyo/Mailchimp), reviews, analytics (GA4, Meta Pixel), CRM, ERP, fulfillment, subscriptions, B2B portals

### Q12 — Custom functionality [I]
Anything beyond standard ecommerce/CMS? (Quizzes, configurators, calculators, custom apps, custom checkout extensions, member areas, loyalty programs, custom workflows.)

### Q13 — Content responsibilities — split [C]
Who provides what content?
- Product copy
- Product images
- Lifestyle/hero photography
- Hero copy and marketing copy
- Blog content
- Legal pages (privacy, terms, refund)
- Meta titles and descriptions

### Q14 — Content delivery timeline [I]
By what date will content be delivered to us? What happens if content is late?

---

## E. Migration / redesign specifics (conditional)

### Q15 — (Migration only) Source platform and data [X]
What is the source platform? What data must be migrated:
- Products
- Customers
- Orders
- Blog posts
- Reviews
- Customer accounts
- Gift cards
- Subscription contracts
- Other

Approximate record counts for each?

### Q16 — (Redesign or migration only) URL preservation [X]
Do existing URLs need to be preserved?
- If yes: redesign with same URLs, no redirect map needed
- If no: full redirect map required (will be produced by SEO Agent / Content & Migration Agent)
- Will SEO preservation be critical? Current organic traffic levels?

### Q17 — (Version upgrade only) Existing customizations inventory [X]
What custom code, themes, or plugins exist that may not be compatible with the new version? Is there documentation of these customizations?

---

## F. Technical

### Q18 — Platform tier / hosting [C]
- For Shopify: Plan (Basic, Shopify, Advanced, Plus)?
- For WordPress: hosting provider, server specs, managed or self-hosted?
- For Magento: cloud or on-premise, Open Source or Adobe Commerce edition?
- For Node.js: deployment target (Vercel, AWS, Cloudflare, custom)?
- For BigCommerce: plan tier (Standard, Plus, Pro, Enterprise)?

### Q19 — Existing app/plugin inventory [I]
For redesigns/upgrades: what third-party apps or plugins are currently installed, and which must be kept, removed, or replaced?

---

## G. Timeline and budget

### Q20 — Hard deadlines [C]
Is there a hard launch deadline driven by a real business event (product launch, seasonal sale, contract obligation, funding milestone)? Or is the timeline aspirational?

### Q21 — Budget tier and pricing model [C]
- Fixed-price or hourly?
- Budget envelope?
- Flexibility if scope discovery reveals more work than estimated?

### Q22 — Approval rounds and revision allowance [I]
- How many rounds of design revisions are included?
- How many rounds of QA fixes per sprint?
- Change request process for out-of-scope additions?

---

## H. Post-launch

### Q23 — Warranty period [I]
What warranty/support period is included post-launch (15 / 30 / 45 / 60 / 90 days)? What's covered (bug fixes only) vs. not covered (new features, content updates)?

### Q24 — Handoff and training [I]
Who on the client side will manage the site post-launch? Do they need training? Format preference (live session, recorded video, written docs)?

### Q25 — Ongoing relationship [N]
Is there an expected ongoing retainer or maintenance relationship after launch?

---

## Question selection algorithm

When the PM Agent identifies gaps:

```
selected_questions = []
for each gap in sow.gaps:
    if gap.severity == "critical":
        selected_questions.append(question_for(gap.field))

# Ensure score will pass 60 after answers
projected_score = current_score + sum(weights of critical gaps)
while projected_score < 60:
    next_important = highest_weight_unanswered_important_question()
    selected_questions.append(next_important)
    projected_score += next_important.weight

# Filter project-type-conditional questions
selected_questions = filter_by_project_type(selected_questions, project_type)
```

---

## Format when presenting to developer

See `01-sow-intake-protocol.md` § Clarification format for the exact format.

Key rules:
- Group by severity (Critical / Important / Nice-to-have)
- Number each question (with Q-id from this bank)
- Include "Why this matters" for each
- Include "Example answer format" for clarity
- One round only — batch everything

---

## Maintenance

Bank reviewed quarterly. When recurring SOW issues come up that this bank didn't catch, add new questions with next available Q-id (Q26, Q27, etc.). Don't renumber existing ones.

Owner: PM lead.

---

Last reviewed: 2026-05-24 by Claude (initial)
Next review due: 2026-08-24
