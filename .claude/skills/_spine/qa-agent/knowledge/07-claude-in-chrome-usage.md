---
tier: 2
load_when: ["agent-specific-detail"]
description: "Claude in Chrome extension complements Playwright. Different tools, different strengths. This file defines when and how QA Agent uses Claude in Chrome."
---

# 07 — Claude in Chrome Usage

> Claude in Chrome extension complements Playwright. Different tools, different strengths. This file defines when and how QA Agent uses Claude in Chrome.

---

## Why both Playwright AND Claude in Chrome

Both tools test in a browser. They are NOT redundant.

| Playwright | Claude in Chrome |
|-----------|------------------|
| Scripted (you write the test) | Exploratory (AI explores) |
| Deterministic (same input = same output) | Intelligent (judges what it sees) |
| Fast | Slower (LLM inference per step) |
| Free per run (no AI tokens) | Costs API tokens per session |
| Best at: regression, repeatable checks, CI | Best at: novel discovery, UX judgment, edge cases |
| Catches: known bugs, scripted scenarios | Catches: unknown bugs, "this feels wrong" |
| Runs in CI / unattended | Runs interactively (or in scheduled sessions) |

Playwright is the **deterministic backbone.** Claude in Chrome is the **intelligent supplement.**

Use Playwright for the 80% you can script. Use Claude in Chrome for the 20% scripts can't anticipate.

---

## What Claude in Chrome does well

### 1. UX quality judgment
Playwright can verify "button exists and is clickable." Claude in Chrome can judge "this button feels hard to find" or "the spacing makes this feel cramped."

Example invocation:
> "Open [preview URL] on mobile viewport 375px. Walk through adding a product to cart and tell me how the flow feels — anywhere confusing, slow, or unclear."

### 2. Edge case discovery
Playwright tests known scenarios. Claude in Chrome can find unknown ones.

Example:
> "Open [URL]. Try to break the cart. Add many products, edit quantities to 0, try invalid coupon codes, navigate away and back. Report what happens."

### 3. Visual judgment
Playwright captures screenshots; visual regression compares pixels. Claude in Chrome can assess: "Does this look right? Is the hierarchy clear?"

Example:
> "Open [PDP URL]. Look at the page on mobile and desktop. Tell me if the visual hierarchy supports the user's goal of evaluating and purchasing the product."

### 4. SEO content verification
Playwright checks meta tags via DOM inspection. Claude in Chrome can verify the rendered content makes sense for crawlers.

Example:
> "Open [URL]. View the rendered HTML. Verify that the H1 makes sense for the page's purpose. Verify the meta description (visible via View Source) is compelling. Verify schema markup looks correctly populated."

### 5. Dynamic content verification (especially headless)
Headless sites use JavaScript to render. Playwright can verify rendered output, but Claude in Chrome can evaluate whether the rendered content matches the data and intent.

Example:
> "Open [headless site URL]. Wait for full hydration. Verify the product information rendered matches what's expected (price, stock, variants). Check for any SSR/CSR mismatches."

### 6. Accessibility user experience
axe catches programmatic violations. Claude in Chrome can evaluate accessibility from a user's perspective.

Example:
> "Open [URL]. Try to use the page with keyboard only. Report on tab order, focus visibility, and whether all interactive elements are reachable and operable."

### 7. Form usability
Playwright fills forms with valid data. Claude in Chrome can try things users actually do.

Example:
> "Open [signup form URL]. Try common user mistakes: wrong email format, password too short, leaving fields blank, pasting from clipboard. Report on error message clarity."

---

## What Claude in Chrome does poorly (use Playwright instead)

### 1. High-volume regression
Don't use Claude in Chrome to run 100 regression tests every PR. Too slow, too expensive. Playwright handles this.

### 2. Deterministic checks
"Does this button exist?" — Playwright. "Does this fit my brand?" — Claude in Chrome.

### 3. Performance measurement
Lighthouse / WebPageTest give numeric measurements. Claude in Chrome's "this feels slow" is qualitative, not quantitative.

### 4. Visual regression diffs
Don't ask Claude in Chrome to compare 2 screenshots pixel-by-pixel. Visual regression tools (Percy, Playwright snapshot) do this faster and more accurately.

### 5. Load testing
Not its purpose at all.

### 6. CI gating
Playwright in CI = fast, reliable, deterministic. Claude in Chrome in CI = slower, costlier, more variance. Use Claude in Chrome on-demand at sprint/milestone QA, not as a CI gate.

---

## When QA Agent invokes Claude in Chrome

### Sprint QA (Module 2 Functional, Module 3 Responsive, Module 5 Accessibility, Module 7 SEO)

For each sprint, Claude in Chrome runs ONE exploratory session per sprint after Playwright passes:

```
1. Open preview URL with dev theme
2. Walk through the sprint's outputs
3. Try the user flow specified in sprint acceptance criteria
4. Try ONE off-script exploration ("what could break this?")
5. Report findings, categorize bugs by severity
```

Duration: 15-30 minutes per sprint.

### Milestone regression (Module 2, 3, 5, 7 deeper)

For each milestone, Claude in Chrome runs MULTIPLE exploratory sessions across the milestone scope:

```
1. Walk full user journeys (homepage → PLP → PDP → cart → checkout)
2. Try mobile + desktop both
3. Try off-script edge cases
4. Cross-sprint integration exploration ("does new section conflict with old?")
5. Visual judgment of brand consistency across pages
6. Report findings
```

Duration: 1-2 hours per milestone.

### Pre-launch (final exploratory pass)

Most thorough Claude in Chrome session:

```
1. Treat as a real user. Pretend to be the primary persona.
2. Discover the product, evaluate, attempt purchase.
3. Try common user mistakes throughout
4. Push the system: edge cases, unusual paths
5. Mobile + desktop both
6. Multiple browsers if accessible
7. Comprehensive report with recommendations
```

Duration: 2-4 hours pre-launch.

---

## Cost management for Claude in Chrome

Each Claude in Chrome session uses Claude API tokens (Sonnet typically). Costs vary by session length and complexity.

### Estimated costs

| Session type | Tokens | Estimated cost |
|--------------|-------:|---------------:|
| Sprint exploratory (15-30 min) | 20-40K | $0.30 - $0.60 |
| Milestone exploratory (60-120 min) | 80-160K | $1.20 - $2.40 |
| Pre-launch comprehensive (3-4 hours) | 200-400K | $3.00 - $6.00 |

Per project total: typically $15-50 in Claude in Chrome costs (across all sprints + milestones + pre-launch).

This is in addition to Playwright (free) and Lighthouse CI (free) and the other tools.

Roll into project's token budget tracking (G1, G5). Reported per milestone.

### Cost controls

- Per-session cap: alert if a session exceeds $5 (rare, indicates runaway)
- Per-project cap: $50 (alert at 80%)
- Defer to launch: if budget tight, defer some sprint exploratory to pre-launch comprehensive
- Skip option: very small / low-risk sprints can skip Claude in Chrome with documented rationale

---

## Claude in Chrome session protocol

### Setup
1. Verify Claude in Chrome extension is installed and connected
2. Open the preview URL in Chrome
3. Confirm browser context loaded correctly
4. QA Agent initiates session with specific intent

### Execution
1. QA Agent issues clear directive: "Test [specific flow]. Report on [specific criteria]."
2. Claude in Chrome navigates, interacts, observes
3. Claude in Chrome reports findings as session progresses
4. QA Agent watches, intervenes if Claude in Chrome heads in wrong direction
5. Session terminates when objective met OR time/token cap reached

### Output
1. Session log: every action Claude in Chrome took
2. Findings: bugs found, UX observations, recommendations
3. Screenshots / video clips of issues (captured during session)
4. Bug entries created in `project.json.bugs[]` with severity
5. Session cost recorded in audit_log

---

## Example session prompts

### Sprint S2.4 — Homepage hero

```
Open preview URL [URL] at mobile viewport 390px.

Test the homepage hero section that was built in S2.4. Verify:
1. Visual appearance matches the approved mockup
2. CTA button is prominently visible and in thumb zone
3. Hero loads quickly (subjective feel)
4. Tapping the CTA goes to the expected destination
5. Switching orientation (portrait <-> landscape) doesn't break layout

Try these off-script things:
- Scroll partway down and back, does sticky header behave correctly?
- Tap the hero image — does anything unexpected happen?
- Use browser back/forward buttons after CTA click

Report findings with severity tags.
```

### Pre-launch — Full purchase flow

```
You are a customer visiting aurora-skincare.com for the first time on iPhone 14 (mobile 390px viewport).

1. Land on the homepage. Spend 30 seconds exploring.
2. Find a product you'd want to buy. Navigate to it.
3. Add it to your cart.
4. Proceed to checkout.
5. Fill in test data:
   - Email: test@example.com
   - Address: 123 Main St, Toronto, ON, M5V 3K2
   - Payment: use test card 4242 4242 4242 4242
6. Place the order (stop before final payment confirmation if in production)

Throughout, observe:
- Was the navigation obvious?
- Did anything feel slow or unresponsive?
- Did any field cause confusion?
- Were error messages helpful?
- Was the path to checkout clear?
- Did anything feel like it might cause cart abandonment?

Report comprehensive findings.
```

---

## Claude in Chrome limitations

1. **Browser session state.** Each Claude in Chrome session starts fresh. Cookies, localStorage cleared.
2. **JavaScript execution.** Sometimes complex SPA interactions take time to settle. Claude in Chrome should wait appropriately.
3. **Rate limits.** Anthropic API rate limits apply. Long sessions may hit limits.
4. **Cannot test what doesn't render.** If JS is broken and page doesn't render, Claude in Chrome reports "can't load." Use Playwright or DevTools for diagnostic.
5. **Cannot test cross-origin.** Cross-origin requests may be blocked by browser CORS.
6. **Cannot file true bug reports without QA Agent's structure.** Claude in Chrome observes; QA Agent codifies findings into structured bugs.

---

## Anti-patterns

1. **Using Claude in Chrome instead of Playwright.** Different tools for different jobs. Playwright is your CI gate. Claude in Chrome is exploratory supplement.

2. **Running Claude in Chrome on every PR.** Too slow, too expensive. Sprint or milestone level.

3. **Open-ended sessions ("just explore the site").** Always have a specific objective. Otherwise tokens wasted.

4. **Trusting Claude in Chrome's judgment as definitive.** It's a judgment, not a measurement. Verify subjective findings with quantitative tools where possible.

5. **Skipping session log review.** Claude in Chrome will report findings; review them. Don't accept blindly.

6. **No cost tracking.** Sessions add up. Track per-project, per-stage.

---

## Setup requirements

For Claude in Chrome to work:
1. Chrome browser with Claude extension installed
2. Anthropic account with API access
3. Sufficient API quota (Sonnet recommended)
4. Preview URL accessible from extension (dev / staging theme URLs)
5. For Shopify projects: preview_theme_id token included in URL

Developer setup steps documented in `_spine/shared-knowledge/dev-environment-setup.md` (Phase 5 wiring).

---

## When to skip Claude in Chrome

Per token budget or scope:

- **Very small sprint (< 8 hours):** Skip exploratory. Playwright + manual smoke from dev is enough.
- **Pure backend sprint (no UI change):** Skip. Use API testing instead.
- **Cost-constrained project:** Defer per-sprint exploratory to single pre-launch session.
- **Repeat project for same client:** May skip if previous projects established patterns.

Decision logged per project. Default is to run Claude in Chrome at sprint + milestone + pre-launch.

---

Last reviewed: 2026-05-24 by Claude (initial)
Next review due: 2026-08-24
