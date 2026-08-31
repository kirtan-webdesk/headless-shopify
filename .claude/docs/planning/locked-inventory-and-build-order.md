---
tier: 3
load_when: ["human-reference-only"]
---

# Locked Decision Inventory + Build Order

> Final state after section-by-section review. Every item below is your locked decision. Build order at the bottom.

---

## A. Tool & Environment — LOCKED

```
[X] A1.  Claude Code as primary AI coding tool. Drop Codex.
[X] A2.  VS Code as IDE.
[X] A3.  Full test pyramid (skill prompts dev to run at sprint-end):
         - Playwright (E2E)
         - Unit tests (business logic)
         - Lighthouse CI (performance)
         - axe-core (accessibility)
         - Visual regression
         - Security scanning
         - Cross-browser + mobile responsive
[X] A4.  Per-platform dev environment setup (Shopify CLI / WP-CLI / etc.)
[X] A5.  Branch strategy: main / develop / feature / fix
[X] A6.  .env management + .gitignore + theme IDs in secrets
[X] A7.  Required reviewer protection on main branch
[X] A8.  Anthropic prompt caching enabled across all agent calls
[X] A9.  Anthropic Batch API for non-urgent work
[X] A10. Hard spend cap per project + daily workspace cap (API console)
[X] A11. Per-project token budget + token report after every milestone
[X] Dashboard: MVP first (skill+agent in Claude Code). Dashboard later, after 5-10 projects.
```

## B. Testing & QA Layers — LOCKED

```
[X] B1.  Unit tests for business logic
[X] B2.  Lighthouse CI as pre-merge gate
[X] B3.  axe-core / Playwright accessibility scanner in CI
[X] B4.  Visual regression
[X] B5.  Security scanning (npm audit, Snyk, Dependabot)
[X] B6.  Platform-specific linters: theme-check, PHPCS, ESLint, Magento Code Sniffer, Stencil
[X] B7.  Cross-browser + mobile responsive testing
[X] B8.  Synthetic monitoring (UptimeRobot or equivalent) — set up at launch only.
         Delivery Head launch protocol includes this so dev doesn't forget.
[X] B9.  8 QA modules defined:
         1. Theme/Code validity
         2. Functional (cart/checkout/forms)
         3. Responsive (375/768/1024/1440/wide)
         4. Cross-browser (Chrome, Safari, Firefox, Edge)
         5. Accessibility (axe + manual WCAG checks)
         6. Performance (Lighthouse + Core Web Vitals)
         7. SEO (meta, schema, sitemap, alt, headings)
         8. Security (credentials, headers, dependency scan)
[X] B10. Bug severity P1-P4 tagged during dev — NO time SLAs during dev.
         SLAs only apply during warranty period (J8).
[X] B11. Bug report template with spreadsheet export. No auto-fix.
         Developer command triggers fix → Claude Code generates PR → human reviews & merges.
[X] B12. Sprint-level QA + milestone regression QA (two-tier, kept)
```

## C. Project Types & Platforms — LOCKED

```
[X] C1.  Skills cascade architecture (orchestrator → project-type → platform → spine)
[X] C2.  Shopify Redesign = first project-type skill to build
[X] C3.  7 project types total:
         1. New Build
         2. Redesign
         3. Headless Build (separate from regular projects)
         4. Migration / Replatforming
         5. B2B Commerce (loaded as MODIFIER, not separate type)
         6. Version Upgrade + Redesign (combined)
         7. Version Upgrade Only (separate skill, kept lean)
[X] C4.  5 platform arms:
         Tier 1 (DEEP): Shopify, BigCommerce
         Tier 2 (SOLID): WordPress
         Tier 3 (LIGHT): Magento
         Separate track: Node.js (custom apps/portals/dashboards, NOT ecommerce)
[X] C5.  Headless variants per platform:
         Shopify: Hydrogen/Oxygen + Custom
         BigCommerce: Catalyst + Custom
         Magento: Hyva + Custom
         WordPress: Custom React + WP block-headless
         → Single headless-build skill per platform, variants inside (sub-paths)
[X] C6.  Page builders → platform KB content (NOT separate skills):
         WordPress KB: Elementor patterns
         Shopify KB: native sections (dynamic blocks)
         BigCommerce KB: native builder + Makeswift
         Magento KB: standard blocks
         Shopify (exception): PageFly only for CMS/landing pages
[X] C7.  Maintenance projects → separate skill, built LATER.
[X] B2B as modifier with platform-specific implementation:
         Shopify (non-Plus): app-based (B2B Wholesale Club, Sparklayer)
         Shopify Plus: native B2B (Companies, catalogs, NET terms)
         BigCommerce Enterprise: B2B Edition (B2BBundle framework)
         WordPress/WooCommerce: plugin-based (B2BKing, Wholesale Suite)
         Magento: B2B Edition (Adobe Commerce) or plugin
         Node.js: future custom build
[X] Discovery as optional pre-spec stage (G0.5 gate, only if scoped)
[X] Design sub-modes (within Designer Agent):
         1. Custom-over-default-theme (Dawn, Cornerstone, etc.)
         2. Inspired-by-predefined-template (Prestige, Impulse, etc.)
         3. Fully custom from scratch
         4. Headless (own path within Headless Build project type)
         5. Figma import (client-provided)
         6. Page builder driven (Elementor / Makeswift / native sections)
```

## D. Agents & Core Architecture — LOCKED

```
[X] D1.  4-layer hybrid architecture:
         A. Conversation/Orchestration (agent)
         B. Workflow Definition (skill)
         C. Execution (hybrid)
         D. Validation (skill)
[X] D2.  PM Agent — EXPANDED SCOPE:
         1. SOW intake + clarification
         2. Spec generation
         3. Milestone + sprint planning
         4. Sprint adherence verification (vs scope)
         5. Milestone adherence verification
         6. Final project verification (deliverables vs original spec)
         7. Sprint release notes
         8. Update documents (7 types — see J3)
         9. Project master doc at closeout (developer reference)
         10. Client memory .md (cross-project context for same client)
[X] D3.  Designer Agent — research + tokens + section library + AI image gen.
         NOT generative visual creativity. Honest scope.
[X] D4.  Frontend Dev Agent (per platform)
[X] D5.  Backend Dev Agent — AUTO-CONFIGURE: metafields, webhooks, app metadata, GraphQL.
         MANUAL/INSTRUCTIONS-ONLY: payment, shipping, tax, fulfillment.
         VERIFY at pre-launch: are sensitive integrations done?
[X] D6.  QA Agent (full test pyramid per A3)
[X] D7.  Delivery Head — dynamic pre-launch checklist composed at runtime
         (standard baseline + spec-driven + platform-specific + project-type-specific)
[X] D8.  Orchestrator Agent (universal, ties everything)
[X] D9.  Code Review Agent (in spine — see H)
[X] D10. Content & Data Migration Agent (Option A — dedicated, for migration projects)
[X] D11. SEO — BOTH approaches:
         - SEO module in QA Agent + Delivery Head (automated baseline checks)
         - Dedicated SEO Agent for deeper SEO work (migrations, redesigns)
[X] D12. Analytics → Backend Agent configures + Delivery Head verifies (Option B)
[D] D13. Multi-Project Master skill — DEFERRED. Build only if proven needed.
```

## E. Skills & Knowledge Base — LOCKED

```
[X] E1.  Folder structure (in 01-folder-structure.md)
[X] E2.  3-layer KB per platform (pointers / agency standards / reference implementations)
[X] E3.  forbidden.md per platform (highest-leverage KB file)
[X] E4.  3 reference implementation sections per platform
         (you will supply real Shopify sections — TRACKED PENDING)
[X] E5.  Per-platform KB owner + quarterly review cycle
[X] E6.  Version stamp + next-review date on every KB file
[X] E7.  Deprecation list per platform
[X] E8.  KB changelog per platform
[X] E10. Shopify MCP for live API lookups
[X] E11. Self-check requirement (agent states which KB files consulted)
[N] E9.  SKIP RAG / vector store. Prompt caching is enough at your scale.
```

## F. Gates & Guardrails — LOCKED

```
[X] F1.  7-gate model (G0-G6) per 04-gate-format.md
[X] F2.  Decisions: CONFIRM / REJECT / REVISE / RENEGOTIATE
[X] F3.  Simplified SLA — 24h per gate, manual escalation (Option B).
         No formal escalation chain for now.
[X] F4.  Self-approval prohibition (designer can't approve G2, dev can't approve G4)
[X] F5.  File locking on project.json
[X] F6.  Versioned project.json (snapshot per write)
[X] F7.  Schema validation on every artifact write
[X] F8.  Audit log of every state change
[X] F10. Stage prerequisite enforcement WITH project-type-aware dependency graphs:
         - Linear (new-build, redesign)
         - Parallel-tracks (migration, b2b — data/design/URL run in parallel)
         - Iterative (headless, complex new-build)
[X] F11. Gate override protocol (emergency only, logged, weekly review)
[X] F12. Mandatory backup before live push (non-skippable)
[X] F13. Post-deploy health check + auto-rollback
[N] F9.  SKIP sub-agent iteration cap (Claude Code has built-in protections)
```

## G. Cost & Budget — LOCKED

```
[X] G1.  Per-project token budget cap (in schema)
[X] G3.  Daily workspace spend cap (API console)
[X] G4.  Automatic model selection per skill — NOT dev's choice:
         Haiku:  Validators, gap detection, classification, status updates, audit entries
         Sonnet: PM Agent, Designer Agent, Frontend Agent, Backend Agent, QA Agent,
                 Code Review Agent (default workhorse)
         Opus:   Complex migration planning, architectural decisions, hard debugging (3rd retry)
         Override path: senior dev can force model with justification (logged)
[X] G5.  Cost-per-project tracking + monthly reporting
[X] G6.  Path A — AI savings = margin expansion (prices stay same, profit grows)
[N] G2.  SKIP per-stage token estimate tracking. Milestone-level is enough.
```

## H. Code Review Agent — LOCKED

```
[X] H1.  Code Review Agent as dedicated agent in spine
[N] H2.  SKIP paid CodeRabbit for now. Can integrate later if needed.
[N] H3.  SKIP Copilot subscription. Use default GitHub features.
[X] H4.  Custom Claude API review via GitHub Action
         WITH COST GUARDRAILS:
         - Per-PR cost estimate (asks approval if >$2 single PR)
         - Daily review budget cap ($10/day default, alert at 80%, stop at 100%)
         - Per-project review budget cap ($20/project default)
         - "Defer to launch" mode option (skip per-PR, batch review at end)
         - Toggle per project (enable/disable AI review entirely)
[X] H5.  Checks: Liquid validity, schema correctness, deprecated APIs
[X] H6.  Checks: hallucinated functions/imports
[X] H7.  Checks: forbidden patterns (reads forbidden.md from KB)
[X] H8.  Checks: security (no inline scripts, eval, credentials, XSS)
[X] H9.  Checks: performance impact (Lighthouse delta vs main)
[X] H10. Checks: accessibility regressions (axe-core delta)
[X] H11. Checks: SEO compliance (meta, alt text, schema, heading order)
[X] H12. Severity P1-P4, auto-block merge on P1/P2
[X] H13. Human senior dev review for sensitive paths (checkout, payment, auth)
         Auto-detected via CODEOWNERS file
[X] H14. Code review feedback loop → KB updates (failures become forbidden.md entries)
[X] H15. Review pass/fail logged to project.json audit_log
```

## I. Performance, SEO & Accessibility — LOCKED

### I.1 Performance

```
[X] I1.  Performance budget per template type:
         Homepage:        ~1.5MB total
         Product (PDP):   ~1.2MB total
         Collection:      ~1.2MB total
         Cart:            ~600KB total
         Checkout:        ~500KB total
         Account/utility: ~400KB total
[X] I2.  Thresholds — Option A:
         Normal projects:   LCP ≤3.0s, Lighthouse ≥80
         Headless projects: LCP ≤2.0s, Lighthouse ≥90+
[X] I3.  Lighthouse CI as pre-merge gate (locked via B2)
[X] I4.  Image optimization automation (responsive srcset, WebP/AVIF, lazy)
[X] I5.  Critical CSS extraction
[X] I6.  Third-party script policy (no render-blocking without senior approval)
[X] I7.  Font loading strategy (font-display: swap, preload, self-host)
[X] I8.  Cache headers validation pre-launch
[X] I9.  Bundle size cap per template (~200KB initial JS budget default)
[X] I10. JS execution time budget (TBT/INP target)
[X] I11. CDN check pre-launch — platform-conditional:
         Shopify: always (built-in)
         BigCommerce: always (built-in)
         WordPress: only if Cloudflare/equivalent purchased
         Magento: only if Cloudflare/equivalent purchased
         Node.js: depends on hosting
```

### I.2 SEO

```
[X] I12. SEO baseline KB per platform — YOUR CHECKLIST INTEGRATED:
         Technical SEO (indexing, crawling, performance, mobile, HTTPS)
         On-Page SEO (meta, headings, URLs, content)
         Ecommerce SEO (product, category, faceted nav)
         Structured Data (schemas + validation)
         Content SEO (blog, E-E-A-T)
         PLUS platform-specific additions per arm.
[X] I13. Schema markup templates (Product, Organization, BreadcrumbList, Article, FAQPage, Review)
[X] I14. Meta tag requirements (title, description, OG, Twitter, canonical)
[X] I15. Sitemap.xml + robots.txt + llms.txt validation
[X] I16. 301 redirect map (required for redesigns + migrations)
[X] I17. URL structure rules:
         - New websites + migrations: define platform-specific structure
         - Redesigns: PRESERVE existing URLs
         - 301 redirects: single-hop only
         - Redirect chains: developer approval required, logged
[X] I18. Heading hierarchy (one H1, no skipped levels)
[X] I19. Internal linking standards (≤3 clicks to any page)
[X] I20. Image attributes enforcement:
         - alt (mandatory, empty for decorative)
         - width + height (CLS prevention)
         - loading="lazy" (below-fold)
         - srcset + sizes (responsive)
         - decoding="async"
         - fetchpriority="high" (LCP image only)
[X] I21. Pre-launch SEO audit (Screaming Frog / Sitebulb / programmatic crawler)
[X] I22. GSC + Bing Webmaster Tools integration in handoff

Platform-specific SEO additions per arm:
- Shopify: /collections/all noindex, faceted nav, robots.txt.liquid, Markets canonicals
- WordPress: Yoast/Rank Math baseline, WooCommerce taxonomies, permalinks, wp-admin blocked
- Magento: layered nav indexation, catalog URL rewrites, store views hreflang
- BigCommerce: Stencil SEO output, URL routing, BC sitemap config
- Node.js headless: SSR verification, schema injection at build time
Universal additions: hreflang, pagination rel="next"/"prev", image sitemap, OG dimensions,
                     Lighthouse SEO ≥95, post-launch indexing status verification
```

### I.3 Accessibility (WCAG 2.1 AA)

```
[X] I23. WCAG 2.1 AA as minimum standard
[X] I24. Color contrast validated at design-tokens.json level (before code)
[X] I25. Keyboard navigation testing
[X] I26. Focus indicators required
[X] I27. Semantic HTML enforcement
[X] I28. ARIA usage rules
[X] I29. Form accessibility (labels, aria-live errors, fieldsets, etc.)
[X] I30. Skip links on every page
[X] I31. Manual screen reader testing (NVDA + VoiceOver) pre-launch
[X] I32. axe-core zero-violations gate (locked via B3)
[X] I33. VPAT / accessibility statement — CONDITIONAL (only when client requires)
```

## J. Client-Facing & Communication — LOCKED

```
[X] J1.  Preview URLs via platform-specific mechanism (Shopify preview_theme_id, BC equivalent)
[N] J2.  SKIP custom client portal. Use Podio (your existing PM tool).
[X] J3.  PM Agent produces 7 update document templates:
         1. Sprint update
         2. Milestone update
         3. Data migration update (migration projects)
         4. Desktop preview update
         5. Responsive preview update
         6. SEO update
         7. Go-live update
[X] J4.  Sign-off model: Internal PM proxy (PM confirms after client approves; system logs evidence)
[X] J5.  Visual mockups at design gate (decided via D3 — research + tokens + library + AI image gen)
[X] J6.  Change Request workflow via Podio:
         1. Client requests → Internal PM logs in Podio
         2. Internal PM provides requirements to PM Agent
         3. PM Agent produces CR scope of work
         4. Internal developer approves feasibility
         5. CR sent to client (via Internal PM)
         6. If approved: Internal PM joins as addition; PM Agent integrates into spec
[X] J7.  Handoff includes:
         - Update documents (7 types from J3)
         - User guides (admin guide + training video script)
         - Credentials handover
         - Warranty terms
         - Project master doc (technical reference)
         - Client memory .md
[X] J8.  Variable warranty: 15 / 30 (default) / 45 / 60 / 90 days
         Bug SLAs during warranty:
         P1: 4 business hours
         P2: 1 business day
         P3: 3 business days
         P4: Best effort
```

## K. Maintenance & Governance — LOCKED

```
[X] K1. Per-platform KB owner (locked via E5)
[X] K2. Quarterly KB review (locked via E5)
[X] K3. Skill versioning + changelog
[X] K4. Failure → KB update feedback loop
[X] K5. Monthly system retro (30-minute review)
[X] K6. Success metrics tracked:
        - Hours per project (vs. pre-AI baseline)
        - Bugs per launch
        - Rework percentage (revisions after gate approval)
        - Client satisfaction / NPS
        - AI cost per project
        - Junior dev productivity vs. baseline
[X] K7. Onboarding doc for new devs
[X] K8. 3-tier training program:
        Tier 1 (all hands, week 1, 4 hours): What AI can/can't be trusted with
        Tier 2 (all devs, weeks 2-4, 2hr/week): Platform prompts, KB use, AI review
        Tier 3 (seniors/leads, weeks 5-6, 4hr/week): Prompts, governance, juniors' reviews
```

---

## Items SKIPPED

```
[N] E9.  RAG / vector store — prompt caching is sufficient
[N] F9.  Sub-agent iteration cap — Claude Code has built-in protections
[N] G2.  Per-stage token estimate tracking — milestone-level enough
[N] H2.  Paid CodeRabbit (for now) — using custom Claude review via H4
[N] H3.  Copilot subscription — default GitHub features only
[N] J2.  Custom client portal — using Podio
[D] D13. Multi-Project Master skill — DEFERRED, build only if proven needed
[N] C7.  Maintenance project type — separate skill built LATER
```

---

## You owe me (pending, not blocking Phase 2 start)

```
1. Inspiration documents — your current milestone/release update format
   → Affects PM Agent output style (D2, J3)
   → Provide before Phase 2 PM Agent build

2. 3 real Shopify sections (anonymized) — for E4 reference library
   → Provide before Phase 3 Shopify arm build
```

---

## Final Build Order

### Stage 1 — Spine + Shopify + Shopify Redesign MVP (~6-8 weeks)

**Phase 2 (now → ~3 weeks): Build the universal spine skills**

1. Orchestrator skill (the conductor)
2. PM Agent (with expanded scope: spec, planning, sprint adherence, update docs, master doc)
3. Designer Agent (research + tokens + section library + AI image gen)
4. QA Agent (8 modules, test pyramid integration)
5. Delivery Head Agent (dynamic pre-launch checklist, backup, rollback)
6. Code Review Agent (with H4 custom review integration)
7. Content & Migration Agent (for migration projects later, but spec'd now)
8. Shared knowledge files (code review standards, git strategy, security baseline, AI verification)

**Phase 3 (~3 weeks): Shopify platform arm**

1. Shopify SKILL.md (entry point)
2. Knowledge files: coding standards, naming, accessibility, performance budget,
   security, section patterns, cart/checkout, app integrations, forbidden patterns,
   SEO baseline (your checklist + Shopify-specific), changelog, deprecations, version
3. Reference implementations: 3 real Shopify sections (PENDING from you)
4. Templates: new-section, new-snippet, new-app-block
5. Pointers: Shopify docs URLs + API version anchor

**Phase 4 (~2 weeks): Shopify Redesign project-type skill**

1. SKILL.md (workflow definition for redesign)
2. Knowledge: SEO preservation, design system audit, content inventory, redirect strategy
3. Templates: audit report, redirect map
4. gates.md (redesign-specific gate definitions)

**Phase 5 (~1-2 weeks): Wire to tools**

1. GitHub Actions workflows (theme push, code review)
2. Pre-commit hooks
3. Prompt caching configuration
4. Linter integration (theme-check)
5. Lighthouse CI configuration
6. axe-core CI configuration
7. project.json file locking + versioning script
8. Cost tracking + alert wiring

**Phase 6 (~2-3 weeks): Pilot on one real Shopify Redesign project**

1. Run a real project end-to-end
2. Capture every failure mode
3. Update KB from real failures
4. Refine skills based on actual usage
5. Document what worked / what didn't

### Stage 2 — Extend Shopify (~4-5 weeks)

After pilot validates Stage 1:

- Shopify New Build skill
- Shopify Migration skill
- Shopify Headless Build skill (Hydrogen/Oxygen + custom variants)
- Shopify B2B modifier
- Shopify Version Upgrade Only skill
- Shopify Version Upgrade + Redesign skill

### Stage 3 — BigCommerce arm (~4-5 weeks)

Replicate Stages 1-2 structure for BigCommerce (deep arm, Tier 1).

### Stage 4 — WordPress arm (~3-4 weeks)

Tier 2 — solid arm with core project types.

### Stage 5 — Magento arm (~2-3 weeks)

Tier 3 — light arm, core project types only, Hyva headless.

### Stage 6 — Node.js arm (parallel track)

Custom apps, portals, dashboards. Different structure from ecommerce arms.

### Stage 7 — Maintenance skill (built LATER, post-launch system stabilization)

---

## Total estimate

```
Stage 1: 6-8 weeks (spine + Shopify + Shopify Redesign + tools + pilot)
Stage 2: 4-5 weeks (other Shopify project types)
Stage 3: 4-5 weeks (BigCommerce)
Stage 4: 3-4 weeks (WordPress)
Stage 5: 2-3 weeks (Magento)
Stage 6: parallel (Node.js)
Stage 7: post Stage 5 (Maintenance)

Total to fully operational ecommerce arms: ~5-6 months
Time to MVP (Stage 1 complete): ~6-8 weeks
```

These estimates assume Claude does most authoring. Your team's time investment: KB review, real project for pilot, feedback during build.

---

## What happens next

You confirm this locked inventory + build order. Then we start Phase 2 (Spine skills). First concrete deliverable: Orchestrator skill (`/skills/_spine/orchestrator/SKILL.md` + supporting knowledge files).

After orchestrator, PM Agent next (highest-leverage spine skill — owns the project narrative end to end).

---

Last reviewed: 2026-05-24 by Claude
Status: LOCKED — proceed to Phase 2 on user confirmation
