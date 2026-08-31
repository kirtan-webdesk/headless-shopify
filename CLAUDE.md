# CLAUDE.md — Car Brite

> Auto-loaded by Claude Code on every session start. Everything else loads on demand per "Required skill files" below. Keep under 300 lines.

---

## Project identity

- **Client:** Car Brite
- **DBA:** Car Brite
- **Slug:** car-brite
- **Current website:** https://carbrite.com/ (existing live Shopify/Dawn store — NOT to be touched)
- **Project type:** new-build (second storefront, built alongside the existing live store)
- **Platform:** headless — Shopify Hydrogen + Oxygen (Architecture A, the reference architecture)
- **Plan tier:** basic
- **Target launch date:** 2026-09-30
- **Hard deadlines:** none

> **Note (platform correction):** `sow-spec.md` frontmatter says `platform: "shopify"` and its `cascading_skill_loads` list points at `shopify/SKILL.md` + `shopify/projects/new-build/SKILL.md`. Neither exists in this project — only the `headless` arm is installed, and the SOW body describes a Hydrogen/Oxygen/Metaobjects/Storefront-API build. Treating this as `headless` per architecture A. **Flag to sow-builder / Ajay Sir as a platform-tagging bug** — do not propagate `shopify/` references into future generated docs for this project.

---

## SOW + Spec references

- **SOW spec (AI-facing):** `sow-spec.md` (project root — NOTE: file's own header declares `outputs/car-brite/sow-spec.md`; it is not actually at that path in this repo. Left as-is per user decision; if the `outputs/<slug>/` convention matters for tooling, this needs to be moved or symlinked.)
- **SOW client doc:** not present in this repo
- **Intake YAML:** not present in this repo
- **Estimation spreadsheet:** not present in this repo (source: `1DA __ Car Brite - Second Storefront.xlsx`, referenced only, not included)
- **Design reference docs:** `car_brite_home_page_design_details.md`, `car_brite_collection_page_design_details.md` (project root)
- **HTML mockups:** `Design/Design/Homepage Design/`, `Design/Design/Collection page Design/` — **note the double-nested `Design/Design/` path** (sow-spec's `html_reference` points at `Design/` only, one level too shallow). `Design/__MACOSX/` is zip-extraction junk, not content.

PM Agent reads `sow-spec.md` at G0 Step 0 — frontmatter pre-fills ~85% of intake fields (see file for full list).

---

## Team

- **Internal PM:** Ajay Sir <ajay@webdesksolution.ca>
- **WebDesk Designer:** Schain
- **WebDesk Dev Lead:** BD
- **WebDesk QA Lead:** JT

**Client primary contact:** see `flag_004_blocklist` in `sow-spec.md`. NEVER contact directly — route all comms through Internal PM (FLAG-004, COMM-005). Blocklist currently has `info@carbrite.com` only — `carbrite.com` domain deferred (Rewrite 5), confirm at G0.

---

## Current gate state

- **Current gate:** G3-car-brite (Scaffold Verification) — not yet opened. Needs QA lead (JT) sign-off on S2.1 (environment, `done`) and S2.2 (Metaobject homepage, `qa`).
- **G2-car-brite:** **PASSED** 2026-08-31T13:45:00Z. CONFIRM by Ajay Sir — reference-only design approach approved, design frozen.
- **G1-car-brite:** **PASSED** 2026-08-31T12:30:00Z. CONFIRM, Option D (ACCEPT TIGHT) by Ajay Sir. Proceeding on the signed 45h build budget (+ 9h client feedback buffer = 54h total, $2,160) knowingly.
- **G0-car-brite:** still open in parallel (SOW completeness 83/100 passes the auto-threshold; residual items don't block build, must land before G3 closes)
- **Project status:** `development` (advanced from `design` on G2 CONFIRM)
- **Last completed gate:** G2 — Design Approval, 2026-08-31T13:45:00Z, Ajay Sir

`project.json` at project root (id `864761f5-3fb1-4721-9c43-6632fc4b19cf`), version 13.

### Real build progress (2026-08-31) — S2.1, S2.2, S3.1, S3.2

- **S2.1 (environment): `done`.** Real Hydrogen 2026.4.5 scaffold in the repo (not fabricated) — `npm run build` succeeds, bundle ~410KB (well under Oxygen's 10MB cap). `.gitignore` fixed (was empty/misnamed — real risk of committing `node_modules`/`.env`).
- **Building against `wds55`** — confirmed by the user as an intentional WebDesk dev/test store. **Production store swap to the real Car Brite store is still required before G6** — tracked in `sow.gaps` as `production_store_swap`. Do not let this slip.
- **S2.2 (Metaobject homepage): `qa`, built and verified, awaiting QA lead sign-off.** Created the `homepage_content` Metaobject definition (`gid://shopify/MetaobjectDefinition/23575920938`) + a real content entry (`gid://shopify/Metaobject/211403211050`, handle `main-homepage`) live on wds55, via Admin API using credential-blind scripts in `scripts/` — `.env` values were never read by the assistant, only key names. Caught that Storefront API access defaulted to `NONE` (would've silently rendered nothing) and fixed it to `PUBLIC_READ`.
- `app/routes/_index.jsx` + `app/styles/app.css` now render the hero/announcement bar live from the Metaobject, with brand tokens (navy/teal/purple) and the Halogen font, matching the G2-approved reference. Verified in a real browser: clean render, zero new console errors, mobile (375px) responsive — and unlike the reference HTML, the nav actually collapses properly.
- New gap found: pre-existing scaffold console warning about Customer Privacy/consent `checkoutDomain` not configured in Shopify admin — unrelated to this session's changes, logged in `sow.gaps`.
- **S3.1 (Collection page): `qa`.** User chose to build the FULL reference (routine strip, filter tabs, sort, 12-card grid, pagination, shop-by-surface, about-collection, newsletter, static "Buy on Amazon" links) rather than core-PLP-only — logged as scope expansion beyond the SOW's 2h line (`risks[R7]`), not silently absorbed. Built both `collections.$handle.jsx` and `collections.all.jsx` (the route the reference actually maps to). Hit and fixed a real 500 error verifying: top-level `products` query has no `filters` arg (only `query` search-syntax) — caught live via Shopify docs lookup, not shipped broken. Also fixed a `CREATED`/`CREATED_AT` mismatch and a nonexistent `product.badge` field before shipping. Verified against real wds55 data — filter/sort state persists via URL params, empty state confirmed.
- **S3.2 (PDP): `qa`.** No design-contract doc for this one, so styled to brand tokens rather than pixel-extracted — kept closer to the 3h budget. Added inventory status (`quantityAvailable`), deferred Related Products (reuses the S3.1 card component), and a Recharge-style subscription block that only renders when `sellingPlanAllocations` actually has entries (verified empty/correctly hidden on the test product). Removed dead `.product`/`.product-main` CSS from the old scaffold instead of leaving both old and new side by side. Verified end-to-end in browser, desktop + mobile.
- **M2 + M3 core build is now largely complete, pending QA sign-off** across S2.1/S2.2/S3.1/S3.2. Given S3.1's scope expansion, actual hours burned should be reconciled against the 45h + 9h feedback buffer soon.
- **2026-08-31, mockup fidelity recheck.** User was right that the build didn't match reference — first pass only checked the interactive HTML's visible-on-load content, never opened the actual static mockups (`Pearls_HP.jpg`, `Pearls_CP.jpg`). Fixed: homepage rebuilt with 6 previously-missing sections (pod system, brand/stats, subscription, testimonials, FAQ, newsletter), real footer built site-wide, "The Routine" block correctly identified as a Shop-nav mega-menu (not a section — wrongly shown as one on collection page, now removed), collection page card/photo/layout details corrected. **Also caught a real accessibility bug**: `body` had no explicit `color-scheme`, so dark text was unreadable on some sections under a dark browser preference — fixed globally. PDP still has no reference mockup anywhere in `Design/` (re-confirmed). `project.json` at version 17. See `risks[R8]` and `sow.gaps` (`shop_nav_mega_menu_not_built`, `pdp_no_design_reference`, `social_proof_images_unused`).
- **Design fidelity recheck (2026-08-31):** pulled exact `getComputedStyle()` values from the live reference, not eyeballed. Fixed globally: header (white→translucent navy), hero gradient (2-stop→real 3-layer), hero photo (added, two-column layout), body font (Manrope wasn't wired up, then silently CSP-blocked — fixed `entry.server.jsx`), button radius (4px→999px pill), H1 size (72px→96px cap). Not fixed: `hero_image` Metaobject field needs `write_files` Admin API scope (not granted) — static asset fallback in place, `risks[R8]`. `project.json` at version 17.

### Gate completion log

| Gate | Status | Completed | Sign-off |
|------|--------|-----------|----------|
| G0 — Intake | open (score 83/100, residual items) | — | — |
| G1 — Plan | **passed** | 2026-08-31 | Ajay Sir (CONFIRM — Option D, accept tight) |
| G2 — Design | **passed** | 2026-08-31 | Ajay Sir (CONFIRM — reference-only mockup approach) |

### G1 estimation flag — resolved, not eliminated

Pattern-based estimate (per `pm-agent/knowledge/04-estimation-framework.md`, headless +40-60% multiplier applied): **242–438 hours**, low confidence, vs the signed **45 hours / $1,800** (5.4x-9.7x). Biggest driver: the Metaobject-driven dynamic homepage (SOW: 5h) — no established build pattern in the arm yet.

**Internal PM chose Option D — proceed on the signed 45h knowingly, on the record.** Not renegotiated. This does NOT make the underlying gap go away — it's a conscious business decision to absorb it. Per `project.json.risks[R5]`, actual hours vs the 45h budget should be tracked closely per sprint (`actual_hours` field) so any large overrun is visible early rather than discovered at close-out.

**2026-08-31 update — sprint plan rebased to the signed 45h only.** Per explicit instruction, `project.json.milestones[].sprints[].estimated_hours` now uses the exact per-module SOW figures (summing to 45), not the pattern-based numbers, and the "Hours Bifurcation" 54h table is not used anywhere. The 242-438h pattern estimate stays only as historical record in `risks[R5]` / `gates[G1-car-brite].notes` — it is no longer the plan.

**2026-08-31 — CORRECTION: total_hours was 45 by mistake, now 54.** User: "I have added the 45 hours by mistake... update 54 hours spec.md also." Both `sow-spec.md` and `project.json` updated:
- `sow-spec.md`: `total_hours: 54`, `total_cost_usd: 2160` (54×$40/hr — user confirmed it should scale). Rewrite 3 (the "45h is authoritative" call) marked superseded, not deleted. New **Rewrite 6** documents the correction. New **Module 6 — Unallocated buffer (9h)** added to the module table. Grand Total corrected to 54h. `spreadsheet.match` is now `false` — intentional, see below.
- `project.json`: `estimates.total_hours: 54`, new `estimates.unallocated_hours: 9`. `budget.hours_budget: 54`, `budget.cost_estimate_usd: 2160`. `risks[R3]` reopened and corrected; new `risks[R3b]` tracks the unallocated 9h specifically.

**The 9h gap is deliberately NOT allocated to any sprint.** Per your choice ("you'll tell me the specific line items"), the sprint table below is unchanged — still sums to 45, not 54:

| Milestone | Sprints | SOW hours |
|---|---|---|
| M1 — Analysis & Kick-Off | S1.1 | 2h |
| M2 — Hydrogen Setup | S2.1(4) S2.2(5) S2.3(2) S2.4(6) | 17h |
| M3 — Custom Theme Dev | S3.1(2) S3.2(3) S3.3(2) S3.4(5) S3.5(2) | 14h |
| M4 — Desktop QA & Responsive | S4.1 | 4h |
| M5 — Go-Live | S5.1 | 8h |
| **Allocated subtotal** | | **45h** |
| **Unallocated buffer** | (Module 6, sow-spec.md) | **9h** |
| **Grand total** | | **54h** |

**2026-08-31 — RESOLVED: the 9h is a client feedback buffer.** Per instruction, it's reserved for post-feedback revision rounds across all sprints (not pre-assigned, drawn down via `budget.hours_burned` as it's actually used) — NOT a general contingency for R1 (zero-hour bundled items) or R5 (underquote) without an explicit redirect. `risks[R3b]` now mitigated. `sow-spec.md` Module 6 renamed "Client feedback buffer."

---

## G2 — Design approval

**Decision (2026-08-31): treat the existing HTML as reference-only, not a coded G2 deliverable.** Standard Designer Agent Path 4 (Headless) process is 30-60h alone — more than the entire 45h build budget — so this is a documented deviation, not a silent shortcut (`project.json.design.path_deviation`).

**Before accepting this, I actually verified the files** rather than take "existing HTML" at face value: served them locally and opened both in a real browser.
- Both are self-extracting bundler exports (13.4MB `PEARLS-Homepage.html`, 8.3MB `PEARLS Collections...html`) that unpack via JS at runtime.
- **They work.** Desktop (1280px): clean render, zero console errors, both pages.
- **Found a real bug at mobile (375px):** the announcement bar wraps to 3 lines and the nav doesn't collapse into a hamburger — items just overflow past the viewport edge. Flagged in `project.json.design.reference_verification` for Frontend Agent to build properly, not replicate.

**Gate state:** `G2-car-brite` **PASSED** 2026-08-31T13:45:00Z — CONFIRMED by Ajay Sir (Design lead sign-off, via Internal PM). Design frozen as reference. `design.approved_by`/`approved_at` set. **S2.2 (Metaobject homepage), S3.1 (PLP), S3.2 (PDP) are now unblocked for build.**

Project stage advanced: `design` → `development`. `project.json` now version 7.

**Still open before S2.1 can move from `qa` to `done`, and before G3 (scaffold-verification) opens:**
- Node v22+ re-confirmation (was a hard FAIL at v20.18.0 earlier this session — dev team reports environment setup done, but this specific item needs explicit QA confirmation, not an assumption)
- Actual CI/Oxygen-deploy verification (self-report isn't the same as the automated scaffold check gate-format.md describes for G3)
- G0 residuals: credentials handoff channel, app versions/plan tiers, third-party integrations, logo SVG

Remaining gates (G3, G4 per-sprint, G5 per-milestone, G6) are all `pending` — none opened yet.

---

## Recent decisions (most recent first)

- [2026-08-31T13:45:00Z] **G2-car-brite CONFIRMED by Ajay Sir** — reference-only design approach approved, design frozen. S2.2/S3.1/S3.2 unblocked. Project stage `design` → `development`.
- [2026-08-31] S2.1 (environment setup) reported complete by dev team; set to `qa` status pending explicit Node v22+ re-confirmation (was a hard FAIL earlier this session) — not auto-marked `done` from self-report.
- [2026-08-31] 9h "unallocated" buffer resolved as a client feedback buffer (not a general contingency); total_hours corrected 45h→54h ($1,800→$2,160) after user flagged the 45h entry as a mistake — both `sow-spec.md` (Rewrite 6) and `project.json` updated, Rewrite 3 marked superseded not deleted.
- [2026-08-31] `project.json` created at project root. SOW completeness score computed at 83/100 (weighted formula per `pm-agent/knowledge/01-sow-intake-protocol.md`) — clears the 60 threshold, but `pm-agent/knowledge/13-g0-intake-gate.md`'s hard gate (abbreviated 8-question intake) is separate and still open.
- [2026-08-31] Environment preflight (`check-env.sh --platform headless`) run: Node.js v20.18.0 detected, **FAIL** (v22+ required for Shopify CLI v4 / Hydrogen tooling). Overridden to allow G0 document-level intake to proceed (logged in `project.json.audit_log` as `env_check_override`) — **Node MUST be upgraded to v22+ before G3 scaffold work starts.**
- [2026-08-31] Treat project as `headless` arm (Architecture A, Hydrogen+Oxygen) despite `sow-spec.md` saying `platform: shopify` — SOW body content (Hydrogen, Oxygen, Metaobjects, Storefront/Admin API) confirms headless; only `headless/` arm is installed. Source: user decision during skill-set audit. (Note: `project.json`'s schema has no `headless` platform enum value either — recorded as `platform: shopify` + a custom `_headless_arm_notes` block. Schema gap worth reporting upstream.)

---

## Open blockers

- [2026-08-31] **Node.js v20.18.0 → needs v22+.** Blocks Shopify CLI v4 / Hydrogen scaffold (G3), does not block current G0 intake work. Owner: whoever's machine is doing the build. Fix: `nvm use 22` (or install Node 22 LTS).
- [2026-08-31] G0 abbreviated intake incomplete — 8 questions batched and sent to Internal PM (Ajay Sir) this session, see below. Full list also in `sow-spec.md` § "PM Agent Hand-off Instructions".
- [2026-08-31] `Design/` folder path does not match `sow-spec.md`'s `html_reference` (extra nesting level + macOS zip junk). Owner: whoever re-exports/re-extracts the design zip.

### G0 batched clarification — round 1 answered 2026-08-31

1. ✅ Hosting/Oxygen plan — **Basic** (Shopify plan tier). Verified compatible: Oxygen is included at no extra cost on Basic (`headless/pointers/verified-facts.md` §2).
2. 🟡 GitHub repo — **already exists**, actual URL still needed.
3. 🔴 Credentials handoff protocol — asked what's needed; clarified (channel name only — Admin API, Storefront API, Recharge access itself must never be pasted into this session, PM channel only). Awaiting channel choice.
4. 🔴 Exact app list with versions — **skipped for now**.
5. 🟡 Brand assets location — **`Design/Design/`** confirmed. Verified on disk: Halogen font family (4 weights), hero/product imagery, UI icon SVGs (bag/plus/search). **No dedicated logo SVG found** — confirm with client whether one exists separately.
6. 🔴 Third-party integrations beyond GA/GTM/Recharge — **skipped for now** (not assumed to be zero).
7. ⏸️ `carbrite.com` FLAG-004 domain blocklist — **skipped again**, consistent with Rewrite 5. Client/sales choice, not chasing further unless it becomes operationally necessary.
8. ✅ Zero-hour bundled sub-items — **1 hour, shared buffer across all 9 items** (confirmed via follow-up — NOT 1h each, which would've added 9h to the fixed 45h scope). `total_hours` stays 45. Risk R1 in `project.json` downgraded to mitigated.

**Still blocking G0 close:** #3 (credentials channel), plus #2/#4/#5/#6 are open or partial. G0 does not need to be 100% closed before drafting G1 planning starts (completeness score 83 already clears that threshold) — but Category 5/6 items must land before G3 scaffold at the latest.

---

## Required-from-client (status)

| Item | Due | Status |
|------|-----|--------|
| Google Analytics tracking code | Module 5 (Go-Live) | pending |
| Shopify Admin API credentials (second storefront) | G0 | pending — PM channel only, never to AI directly |
| Shopify Storefront API credentials | G0 | pending — PM channel only, never to AI directly |
| GitHub repo URL (repo already exists) | G0 | pending — just need the URL |
| Recharge app account access / config | G0 | pending — PM channel only |
| Credentials handoff channel (1Password/Vault/secure email) | G0 | pending — asked, awaiting answer |
| Hosting/Oxygen plan confirmation | G0 | **received — Basic plan, Oxygen included** |
| Logo SVG (dedicated brand logo file) | G0 | pending — not found in `Design/Design/`, confirm with client |
| Confirmation: existing Dawn theme not to be touched | G0 | pending explicit sign-off (assumed, not yet confirmed) |

Status legend: `pending` / `received` / `partial` / `overdue`.

---

## Design tool

- **Tool:** HTML
- **Rationale:** D-DES-01 — HTML mockups only. No Adobe XD / Figma / Sketch / PSD as deliverable.
- **Homepage revisions allowed:** 5
- **Other-page revisions allowed:** 3
- **Mockup files location:** `Design/Design/Homepage Design/`, `Design/Design/Collection page Design/` (see nesting note above)

---

## Platform configuration

- **Platform:** headless — Shopify (Hydrogen + Oxygen, Architecture A)
- **Plan tier:** basic
- **Hosting:** Shopify Oxygen (managed)
- **Theme baseline:** n/a — headless build, not a theme. Existing live store runs Dawn; must remain unmodified (this is a second, independent storefront).
- **Repo URL:** TBD — confirm at G0 whether client has an existing repo or WebDesk creates one
- **Branch strategy:** main + per-milestone branches (see `git-branch-strategy.md`)
- **Local dev URL:** TBD
- **Staging URL:** TBD
- **Production URL:** TBD (not live yet — new build)

---

## Apps / plugins installed

| App / plugin | Version | License | Notes |
|--------------|---------|---------|-------|
| Recharge | TBD | TBD | Subscription / selling plan config, Sprint 2 (6h). INT-002 applies — manual config only, AI does not auto-configure. |

---

## Active tasks (this sprint)

- Run PM Agent G0 intake — resolve the 8 remaining fields listed in `sow-spec.md`
- Resolve `Design/` folder path mismatch
- Confirm platform tagging (headless vs shopify) with sow-builder owner

---

## Session log pointer

Last session ended at: 2026-08-31 (this file created)
Last session summary: see `HANDOFF.md`

Per `session-handoff-protocol.md`, every session ends with a HANDOFF.md update. Read the latest handoff before starting work.

---

## Required skill files for this project

When this project's session starts, load:

- `.claude/skills/_spine/persona.md`
- `.claude/skills/_spine/shared-knowledge/forbidden-global.md`
- `.claude/skills/_spine/shared-knowledge/ai-tool-rules.md`
- `.claude/skills/_spine/orchestrator/SKILL.md`
- `.claude/skills/_spine/pm-agent/SKILL.md`
- `.claude/skills/_spine/designer-agent/SKILL.md`
- `.claude/skills/_spine/designer-agent/knowledge/09-html-mockup-standards.md`
- `.claude/skills/_spine/orchestrator/knowledge/outbound-comms-gate.md`
- `.claude/skills/headless/SKILL.md`
- `.claude/skills/headless/README.md` (read first — flags the spec-conformance ledger + Metaobject gap)
- `.claude/skills/headless/projects/new-build/SKILL.md`
- `.claude/skills/headless/architectures/shopify-hydrogen-oxygen/00-reference.md`
- `.claude/skills/headless/knowledge/11-environment-preflight.md`
- `.claude/skills/headless/knowledge/12-discovery-audit.md` (n/a for pricing on new-build, but app qualification still applies)
- `.claude/skills/headless/knowledge/13-spec-conformance.md`
- `.claude/skills/headless/templates/spec-conformance-ledger.md` (fill at G1)

Do NOT load `shopify/`, `bigcommerce/`, `wordpress-woocommerce/`, `magento-adobe-commerce/` — not installed / not relevant.
Do NOT load other `headless/knowledge/*` files or `qa-agent/` / `code-review-agent/` / `delivery-head/` until the project reaches the gate that needs them.

---

## What this file does NOT contain

- Client emails / phones / handles → those live in `sow-spec.md` `flag_004_blocklist` only
- Code or full design specs → those live in their respective directories
- Long decision rationale → only one-line summaries here
- Test results → those live in `docs/qa-reports/` (not yet created)

This file is INDEX + LATEST STATE only. Keep it under 300 lines.

---

Last touched: 2026-08-31
Touched by: Claude (bootstrap during skill-set audit)
