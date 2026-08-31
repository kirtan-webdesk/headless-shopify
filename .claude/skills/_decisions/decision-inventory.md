---
tier: 3
load_when: ["human-reference-only"]
---
<!-- v1.11.4+: This inventory has been filtered for the 'headless' edition. Master's canonical inventory (full) has all D-codes. -->


# Master Decision Inventory — WebDesk AI Delivery System

> Source of truth for every locked decision. The first section is a quick index of ALL locked decisions. Below that, the original A1-K inventory remains as historical context with the original deliberations.

---

## LOCKED DECISIONS — Master Index (v1.11.0)

> Sorted by category prefix. Each decision references where it's enforced.

### A — Tool & Environment
- **A7** — Backup workflow before live publish. Broadened to all destructive ops (SEC-005, destructive-ops-protocol).
- **A11** — Anthropic API budget cap + token tracking (token-estimator.py).

### B — Testing & QA
- **B-QA-01** (2026-05-27) — Bug lifecycle: LOGGED → FIXED → RETESTING → VERIFIED → CLOSED. Self-approval prohibited. Schema: `_contracts/bug-tracker.schema.json`.

### C — Project Types & Platforms
- **C1** — Project types: Redesign, New Build, Migration, Headless Conversion, Version Upgrade, Performance Optimization.
- **C2** — Platforms: Shopify, Shopify Plus, BigCommerce, Magento, Adobe Commerce, WordPress, WooCommerce.
- **C-HEADLESS-01** (2026-05-28) — Headless skill is SEPARATE (different structure). Built outside this thread.

### D — Agents & Core Architecture
- **D-PM-01** (2026-05-27) — PM Agent self-schedules via 7 triggers.
- **D-PM-02** (2026-05-27) — G0 is a hard gate. < 80% intake → halt G1.
- **D-PM-03** (2026-05-27) — Milestone-wise documentation, not sprint-wise.
- **D-PM-04** (2026-06-03) — PM Agent reads `sow-spec.md` at G0 Step 0 if present; pre-fills intake from frontmatter. See `pm-agent/knowledge/13-g0-intake-gate.md`.
- **D-QA-GATE-BLOCK** (2026-07-02, v1.11.5) — CRITICAL findings BLOCK the gate. FAIL verdict is enforcement, not advisory. Orchestrator MUST NOT emit G4/G5/G6 sign-off with any CRITICAL open. Documented human override requires exception filed to `_decisions/`. See `_spine/qa-agent/SKILL.md` "Gate blocking policy".
- **D-CASCADE-01** (2026-07-02, v1.11.5) — Orchestrator MUST derive active task tags from `CLAUDE.md` platform_config at session start. Rules documented in `_spine/orchestrator/knowledge/06-agent-cascade.md` "Task tag activation rules". Fixes gap where files 20/22/24 were tier-1 but never loaded because `elementor-build` / `woocommerce-platform-active` / `theme-build` weren't in the orchestrator's known-tags set.
- **D-DES-01** (2026-05-27) — Mockups ARE production scaffold. HTML/CSS/JS only. No Figma/Adobe XD/Sketch as deliverable.
- **D-DES-02** (2026-05-27) — Secret-code workflow bypass dropped.
- **D-DES-03** (2026-07-14, v1.11.11) — Canonical design source per page. When a client's later-provided artifact (PNG comp, updated screenshot, Figma export) supersedes the original HTML mockup for a specific page, the LATER artifact is canonical for that page — but ONLY after explicit confirmation from Internal PM which page is canonical to which artifact. Register per-page in `outputs/<client_slug>/design-source-register.md` (or the project's HANDOFF.md). Ambiguity resolves in favor of asking, not guessing. Pilot-derived from Epoxy Depot (2×2-grid-vs-big-image drift). Does NOT relax D-DES-01 — WebDesk still DELIVERS HTML mockups; the register tracks which reference artifact was USED as design input per page.
- **D5** — Backend Agent provides INSTRUCTIONS for payment/shipping/tax.

### E — Skills & Knowledge Base
- **E5** — Each platform arm + spine has a designated owner.
- **D-PLAT-01** (2026-05-28) — Forbidden split: `_spine/shared-knowledge/forbidden-global.md` + `skills/{platform}/knowledge/09-forbidden.md`. Code Review loads BOTH.
- **D-COST-01** (2026-05-27) — Tiered KB loading. Target: ~$130/project (from $232).
- **D-TIER-01** (2026-05-28) — Per-task output token budgets enforced (`09-token-budgets.md`).
- **D-FRONTMATTER-01** (2026-05-28) — Every KB file declares `tier:` + `load_when:` frontmatter.
- **D-SHIP-GATE-01** (2026-07-02, v1.11.6) — `tools/scripts/ship-bundle.sh` MUST run before any zip is copied to `outputs/`. Extract-verify-then-copy pattern. Bundle rejected on FAIL; not shipped. Prevents stub-README regressions (v1.11.3, v1.11.5) and cross-platform spine contamination (v1.11.5) from reaching users.
- **D-CUST-RECON-01** (2026-07-02, v1.11.9) — Existing-site projects (migration / redesign / version-upgrade) maintain a customization register: each customization has a stable ID and is described at two altitudes (client-plain in the SOW, technical in `sow-spec.md`). At G1 the discovered customizations are reconciled against the SOW; every discovered-but-unscoped item resolves to add-to-scope OR a client-approved exclusion, with an approver. No silent drops. Does not apply to new builds (no live site to reconcile). Backs `_spine/shared-knowledge/customization-register.md`.
- **D-FRONTMATTER-02** (2026-06-03) — Every SKILL.md declares `name:`, `description:`, `version:`, `tier:`, `load_when:` frontmatter. Skill loader requires it. Validator: `tools/scripts/validate-frontmatter.sh`.
- **D-EDITION-FILTER-01** (2026-07-01, expanded 2026-07-02, v1.11.5.1) — Platform edition bundles ship filtered content. TWO enforcement layers:
    1. **Inventory filter (v1.11.4 initial):** `decision-inventory.md` is filtered per edition via `tools/scripts/filter-inventory-for-edition.py`. Shopify edition strips WordPress-scoped codes (see filter script categories). WP edition strips Shopify-scoped project codes. Universal codes (A/B/C/D/E/F/G/H/I/J/K/TOOL/SOW plus agent-level D codes) are kept in every edition.
    2. **Spine content policy (v1.11.5.1 expansion):** ANY file in `_spine/`, `_contracts/`, `_decisions/` that ships to multiple editions MUST use platform-agnostic language. Platform-specific examples, worked examples, CRITICAL code names, file cross-references, or rationale text belong in the platform arm files (`skills/{platform}/*`), NOT in shared spine content. If a spine file needs to illustrate a rule that varies by platform, it references the pattern generically ("per each platform's `NN-qa-checklist.md`") without embedding platform-specific content.
    3. **Bundle integrity:** `tools/scripts/verify-edition-integrity.sh` extended in v1.11.6 with `scan_spine_contamination()` — grep spine files for file-path references to non-installed platform arms. Universal enumeration (platform tag lists, rule-prefix tables, cross-platform detection knowledge) is allowed. Dangling file-path references = FAIL.
    4. **Release gate (v1.11.6, D-SHIP-GATE-01):** `tools/scripts/ship-bundle.sh` runs integrity check before any zip is copied to `outputs/`. Physically impossible to ship past a red gate. Every edition zip goes through this gate.

    **Trigger for this decision expansion:** v1.11.5 shipped with WC+Elementor worked examples inside `_spine/orchestrator/knowledge/06-agent-cascade.md` and `_spine/qa-agent/SKILL.md`. The inventory filter caught nothing — because those files aren't the inventory. The Shopify window flagged the bleed. Rule now documented.

    **Applies going forward:** every spine-content change must be reviewed for platform bleed before ship. Master owns this rule enforcement at packaging time.
- **D-MEMORY-01** (2026-06-03) — Per-project `CLAUDE.md` memory pattern. Template: `_spine/shared-knowledge/claude-md-template.md`. Auto-loaded by Claude Code at project root.
- **D-MASTER-SCOPE-01** (2026-08-11, v1.11.30) — **Spine-level, binding on master.** When an arm is under active authorship (multi-release iterative content buildout — e.g., Headless v1.11.17 through v1.11.29), master's releases **MUST NOT** modify content in other arms' directories. Applies to: cleanups, "while I'm in there" fixes, incidental frontmatter additions, other arms' SKILL.md version bumps, backfills of pre-existing debt. **Master IS permitted to modify:** shared tooling (`tools/scripts/*`), shared spine files (`_spine/`, `_contracts/`, `_decisions/`) when the change is genuinely spine-scope (D-code ratification, spine schema change, cross-arm rule), the arm under active authorship per the standard fold protocol, `docs/`, `README.md`, packaging (release notes, edition READMEs, bundle build scripts). **Tooling changes that surface debt in other arms MUST disclose the debt but MUST NOT fix it in the same release.** Debt is logged with per-arm owner and reasoning, batched into a post-active-authorship release. **Ship-checklist item:** at ship time, master runs a diff-against-previous and lists every non-tooling, non-spine, non-docs file changed. Any hits require explicit *"why this can't wait for the post-batch release"* reasoning at ship time. Silent cross-arm changes fail the rule. **Trigger:** Shopify window's v1.11.29 escalation surfaced that master v1.11.14 / v1.11.18 / v1.11.25 releases each patched other-arm files as "cleanups" while Headless was under active authorship. Cross-arm churn accumulated. User ratified the rule 2026-08-11: *"Please freeze other tech files whenever it is not necessary to change... only give me updates for files where we are working like Headless... please do self-audit this strict rule."* **Amendment 2026-08-27, v1.11.31:** *Spine changes with cross-arm surface area require explicit user approval, not just "genuinely spine-scope" justification.* Even when a fix looks universally applicable (e.g., a build-vs-spec check that every arm eventually needs), the default is Headless-scoped ratification when the trigger is Headless-specific feedback. User's ruling verbatim: *"if there are any changes in the core files of the skill, still we dont want other skill to carry because this is specific issues or feedback of headless skill unless if we find a global issue."* Master must escalate cross-arm promotion via AskUserQuestion or equivalent before ratifying spine text that applies to other arms. **The rule is binding on master, not advisory.** Existing pending items (v1.11.14 spine debt sweep, v1.11.30 disclosed 14 spine debt files, arm load_when tag registrations) are batched to a post-Headless-K4 release with per-arm reasoning. **Amendment v1.11.35 (2026-08-27):** the rule's *inverse* is now also ratified as **D-ARM-AUTONOMY-01** — arms may edit and ship their own arm-scope content without master mediation. D-MASTER-SCOPE-01 continues to govern **master-reserved scope** (spine, contracts, decisions, tools, root README, cross-arm surfaces). The two decisions together form a symmetric rule: master does not touch arm content when an arm is authoring, and arms do not touch master-reserved content without escalation. Per-arm autonomy status recorded under D-ARM-AUTONOMY-01.

- **D-ARM-AUTONOMY-01** (2026-08-27, v1.11.35) — **Spine-level, complements D-MASTER-SCOPE-01.** Arms with earned autonomy may edit and ship arm-only content without master mediation. **Trigger:** user's ratification 2026-08-27 that the courier-through-master pattern was net-negative — verbatim: *"It is taking a lot of time to send ing to both window back and forth"*, and *"We have already proven contracts and spine for shopify, woocommerce."* Four headless releases in one hour (v1.11.31/32/33/34) made the friction structural. **Autonomy scope — an arm may edit and ship without master:** anything under `skills/{arm}/` — arm SKILL.md, knowledge/, architectures/, pointers/, projects/, templates/. This is 90% of arm work by delivery count. **Master-reserved scope — no arm edits without master ratification:** `skills/_spine/`, `skills/_contracts/`, `skills/_decisions/`, `tools/`, `forbidden-global.md`, root `README.md`, any file that touches more than one arm. **Version scheme.** Arm bundles use arm SKILL.md version: `webdesk-{arm}-arm-v{X.Y.Z}.zip` (e.g., `webdesk-headless-arm-v0.17.0.zip`). Master bundles retain the `v1.11.X` release stream for spine changes. A developer's install carries both stamps — arm version tells them what content they have, spine version tells them what governance rules that content was built under. **Escalation channel unchanged.** When an arm notices a global issue (spine bug, contract gap, cross-arm pattern, new D-code needed), the arm files a HANDOFF to master with the proposed change. Master ratifies and ships master bundle. Other arms pick up the change on their next arm release cycle. **Convergence pass — ON-DEMAND ONLY, per user ratification.** No forced cadence. Arms send a "canonical pack" to master only when there is an inventory-worthy change (new decision, prefix reservation, cross-arm implication, new arm code range). Master merges the pack into canonical inventory and re-ratifies. Master's canonical inventory therefore lags arm state by the delay between arm change and the arm choosing to escalate — that lag is the user's stated preference over the previous cadence of instant courier. **Per-arm autonomy status (v1.11.35, ratified by user):** `shopify` — **AUTONOMOUS.** Spine and contracts proven through v1.11.5-v1.11.16 iteration; K4-equivalent pilot cycle complete. `wordpress-woocommerce` — **AUTONOMOUS.** Proven through v1.11.7-v1.11.14 Elementor/WC pilot cycle. `headless` — **AUTONOMOUS.** The K4 pilot ran and the arm folded feedback (v1.11.31-v1.11.34); the earned test the user cares about is *"has a pilot happened and has the arm learned from it,"* which is met. Arm at 0.17.0, 1.0.0 arrives after the next pilot does not repeat — but autonomy is not gated on the version number, it is gated on the pilot cycle. `bigcommerce` — **GATED, pending onboarding.** Structurally complete but has not run a K4-equivalent pilot; user's phrasing was *"for BigCommerce we need to do back and forth initially, but after setting up we should release that too."* Onboarding = one release cycle where master helps stand up `arm-ship-bundle.sh` locally, verify the arm's discipline is sufficient, then autonomy grants. Earned within one arm-ship cycle, not gated on a maturity milestone. `magento-adobe-commerce` — **GATED, scaffold-only.** Not shipping arm content yet; autonomy question deferred until the arm has content to ship. **Guardrails.** (1) `tools/scripts/arm-ship-bundle.sh` (MVP shipped v1.11.35) is the arm-side release script; runs the same integrity gate master uses (`verify-edition-integrity.sh`) scoped to arm content, and emits the arm bundle with a manifest. (2) Reserved-scope hash check — DEFERRED as follow-on tooling (needs master to publish `.master-reserved-checksums.json` first). Arms operate on the honor system for one release cycle; the class of failure this guardrail prevents (an arm silently editing spine and shipping it) has not occurred in any prior release. (3) Every arm bundle carries a pinned spine snapshot (`spine-pinned: v1.11.35`) so a developer knows which governance the arm content was built under. **What actually changes at the user's boundary.** Arm-only changes never route through the user — the arm delivers directly to the developer. The user sees master only when an arm escalates a global issue (which produces one HANDOFF, one master release, one distribution). Estimated frequency: roughly 1-2 master releases per week, from the previous four-per-hour peak. **Failure modes disclosed.** (a) If an arm believes a change is arm-scoped when it is actually cross-cutting, the change ships without master review and other arms miss it. Mitigation: the escalation rule and D-KB-FIDELITY-01 name the sort of decision that should escalate; arms have been disciplined about this in the two-month record. (b) Decision-inventory drift between arm state and master canonical is now normal, not a bug. Convergence-on-demand is the reconciliation mechanism. (c) A developer installing two arm bundles (e.g., shopify + headless on the same client) gets two pinned spine snapshots; if they diverge, the newer spine bundle takes precedence and the older arm bundle needs a re-ship against the newer spine. This is disclosed in the governance doc. **Governance doc:** `docs/arm-autonomy-model.md` (new v1.11.35) — the pattern in operator-friendly language, one page. **Post-batch reconciliation:** the deferred items batched under D-MASTER-SCOPE-01 (14 spine debt files, arm load_when tags, delivery-landing check, wp-safe-deploy allowlist-vs-convention) remain master's responsibility and will ship in a future spine release. They are not blocked by this decision.
- **D-ARM-VERSION-01** (2026-08-11, v1.11.29) — **Spine-level, universal, forward-looking.** Arm SKILL.md `1.x` signals *"at least one real engagement has run through this arm and K4 feedback has been folded back."* Structurally complete without K4 validation ships as `0.x`. **Rationale:** version numbers get read downstream — sales and delivery both use them as a "ready for live engagement" signal. Structural completeness is necessary but not sufficient for that signal. The discipline required to know the difference (register-first authorship, D-KB-FIDELITY-01, hallucination-guard extended to decisions, master reconciliation pattern) matured with the Headless arm; older arms (Shopify at 1.5.9, WP at 1.12.4) predate the convention and are **not renumbered retroactively.** **Applies going forward** to any arm's first-ships: the Headless arm ships v0.14.0 at v1.11.29 (structurally complete, no pilot); bumps to v1.0.0 when the first real headless engagement closes K4. **Trigger:** Headless window's explicit flag in the v0.14.0 handoff — *"1.0 reads as ready for live engagement... master should decide whether that's the right signal."* Ruling ratified per that flag.
- **D-KB-FIDELITY-01** (2026-08-07, v1.11.20; amended 2026-08-06 v1.11.21 — precedence rule added) — **Spine-level, universal.** KB content authored against a ratified D-code MUST match the ratified proposal in `_decisions/proposals/{arm}/{D-CODE}-proposal.md`. Specifically: **verbatim rules stay verbatim, numbered lists stay in order, check IDs stay stable, review points stay in count and topic, halt responses stay in count, open questions stay marked open.** Paraphrase, renumber, omit, or invent items relative to the proposal = defect. **The rule is not "match the summary in the inventory."** Inventory summaries deliberately abbreviate; the proposal is authoritative for numbered/named content.

    **PRECEDENCE RULE (v1.11.21 amendment):** *The inventory is authoritative for **status** — what is ratified, closed, superseded, or open. The proposal is authoritative for **detail** — verbatim rules, numbered lists, check IDs, artifact names.* When they disagree on status (e.g., proposal says "open question for master" but inventory shows the question was ruled), **the inventory wins on status; the proposal's detail is still authoritative for its numbered content.** Reverting KB content to a proposal's superseded status is a defect, not a fidelity fix. Windows sweeping their arm's proposals must reconcile status against the inventory before flagging drift. **Trigger for the amendment:** Headless window's first D-KB-FIDELITY-01 sweep on 2026-08-06 flagged as defects three items that were correct and ratified (C=SUPPORTED-ON-DEMAND, BC GraphQL rate limits verified, `@shopify/hydrogen-react` usable). Following the rule as originally written would have reverted architecture D back to blocked — the deal sales was already held on once. Precedence rule was missing; caught during the first real use.

    If a KB file needs to add material beyond the proposal (register updates, per-edition context, ratified rulings closing OQs), the additions are marked as additions and do not renumber ratified IDs. Each arm's `09-forbidden.md` implements this via its arm-scoped CRITICAL hallucination-guard code — Shopify `SHOPIFY-HALLUCINATION-01`, WP `WP-HOOK-HALLUCINATION-01`, Headless `HEADLESS-HALLUCINATION-01`, etc. — extended to cover ratified decision content, not just verified facts. **Trigger for original ratification:** v1.11.19 shipped `11-environment-preflight.md` and `12-discovery-audit.md` in the Headless arm, both written from reconstruction during the window when the proposals existed nowhere. Both diverged from the ratified text: verbatim binding rule truncated (2 of 3 sentences), 5 of 7 ratified review points absent + replaced with invented ones, 4 checks missing, IDs renumbered so `B3` meant different things in the decision and the KB, halt response 3 dropped (making the gate stricter than ratified — reads as safe, isn't), and one open question answered locally. Caught by the Headless window on reinstalling v1.11.19 by diffing against the proposals master had just moved into `_decisions/proposals/headless/` per D-HL escalation §2. Corrected in v1.11.20. **Class of bug this rule prevents:** memory filling gaps with content that reads well, passes the validator, carries anti-patterns and review footers, and looks finished — but doesn't match the decision. Validator does not currently enforce this; tooling to diff KB content against proposals is a v1.12.x follow-up. Until then, the discipline is: KB author reads the proposal, diffs their draft against it, and cites the proposal path in the file header — and reconciles status against the inventory before flagging any drift.

### F — Gates & Guardrails
- **F4** — Self-approval prohibition.
- **F12** — Backup mandatory before destructive ops.
- **F-G0** (2026-05-27) — G0 is HARD gate.

### G — Cost & Budget
- **G-TIER-F** — Tier-aware loading + token budgets. ~44% cost reduction target.

### H — Code Review Agent
- **H4** — Cost guardrails: $2/PR, $10/day, $20/project.
- **H5-H11** — 6 check categories.
- **H14** — K4 feedback loop.
- **H-MOCKUP** (2026-05-28) — Code Review scans `/mockups/**` paths per DES-002.

### I — Performance, SEO, Accessibility
- **I-A11Y / I-SEO / I-PERF** — Baseline rules in `forbidden-global.md`.

### J — Client-Facing & Communication
- **J-FLAG-004** (2026-05-27) — Outbound comms gate enforces client_contact_blocklist.
- **J-COMM-01** — All client communication via Internal PM only.
- **D-INT-02** (2026-05-27) — Shipping + payment + tax config always manual (INT-002). AI never auto-configures.

### K — Maintenance & Governance
- **K2** — Quarterly KB review cadence.
- **K4** — Failure mode → KB candidate → forbidden.md.
- **K5** — Monthly System Retro.

### TOOL — AI Tool Usage (v1.5.3)
- **TOOL-001** (2026-05-28) — Write tool requires prior Read for existing files.
- **TOOL-002** (2026-05-28) — Never write JavaScript via Bash heredoc.
- **TOOL-003** (2026-05-28) — Validate variable scope before running scripts.
- **TOOL-004** (2026-05-28) — Prefer Edit over Write for small changes.
- **TOOL-005** (2026-05-28) — Pre-flight validate scripts before execution.
- **TOOL-006** (2026-05-28) — Tool fallback discipline.

### HL — Headless (v1.11.17)

Six foundational D-codes ratified 2026-08-07 from the Headless skill-dev window's escalation packet (2026-08-06). Content buildout under `skills/headless/` begins after ratification, subject to open TODO-VERIFY items noted per code.

- **D-HL-STACK-01** (2026-08-07, v1.11.17, rev 4) — WebDesk supports two backends (Shopify, BigCommerce) across four architectures: **A** Hydrogen + Oxygen, **B** Hydrogen + self-host, **C** Shopify Headless channel + Next.js App Router, **D** BigCommerce Catalyst + self-host. Architecture C **demoted to SUPPORTED-ON-DEMAND** — same consistency test that promoted B (named client requirement); no named client for C yet, so C's full KB defers until one exists. Selection protocol has three modes: **DECLARED** (named in SOW, skill validates only), **DERIVED** (skill runs ordered gates against verified store facts, proposes one architecture, stops for human confirmation), **BLOCKED** (declared architecture contradicts verified disqualifier — halt and surface, never silently switch). Hosting ownership: client owns the account by default, WebDesk deploys into it; managed service is a separately priced add-on; if declined it is explicitly OUT of scope. Plan-aware (Multipass = Plus + legacy accounts only; Customer Account API = new accounts). Rejected candidates: Vue/Nuxt, Remix standalone, Saleor/Vendure/Medusa, custom composable, Hyvä (belongs in Magento arm — it's not headless). Build order: A → B → D (C deferred). Full text in `_decisions/proposals/headless/D-HL-STACK-01-proposal.md` rev 4.
- **D-HL-TYPES-01** (2026-08-07, v1.11.17, rev 3) — Headless work is classified into **five project types** (New Build, Replatform, Migrate-to-Headless, Redesign, Framework Upgrade) plus **one ongoing engagement type** (Headless Support / Retainer). Discriminator per type: "which layer is changing?" Combination projects re-priced, not absorbed. **Data migration is owned by separate WebDesk migration skills / automation**, not this arm; the Headless arm owns the audit of existing site against SOW, the handoff interface to the migration skill (named entity list + URL inventory + credential-reset consequence), and frontend consequences of migration decisions. Retainer defaults ratified: **8-hour per-ticket threshold** (above becomes change order), **no response-time SLA** (matches declined-hosting-management posture). Both retainer defaults reviewed after 10 retainer engagements against actual ticket distribution. Full text in `_decisions/proposals/headless/D-HL-TYPES-01-proposal.md` rev 3.
- **D-HL-DISCOVERY-01** (2026-08-07, v1.11.17, rev 3; audit-signer ruled v1.11.21) — Mandatory seven-point compatibility audit before SOW pricing on every headless project type except New Build. Binding rule (verbatim, all three sentences required): *"Never assume that an existing Shopify theme feature, app block or third-party app will work in Hydrogen. Verify API, SDK, Customer Account API and Oxygen runtime compatibility before confirming feasibility or estimating development effort. Clearly separate native Shopify capabilities, custom Hydrogen development, third-party integrations and external middleware requirements."* Audit primacy: this is the arm's primary contribution to non-New-Build engagements — validate every feature of existing site against SOW before anything is built. Multipass covered as a documented build path split into discovery-half (build now: questions + costs + premise correction + sign-off) and implementation-half (deferred until a named Plus client with real requirement exists). Preflight failure carries **D-QA-GATE-BLOCK semantics**. **Audit signer (v1.11.21 ruling per Headless window recommendation):** client sign-off on the **dropped-functionality column only**, not the whole audit. The rest of the audit is internal working product full of vendor detail a client has no basis to approve, and asking for a signature on it invites line-by-line negotiation of technical findings. The dropped column is the one section a client can meaningfully assess and the exact document that prevents the UAT dispute. Template change is minimal: one signature line on one section. Full text in `_decisions/proposals/headless/D-HL-DISCOVERY-01-proposal.md` rev 3.
- **D-HL-APPS-01** (2026-08-07, v1.11.17, rev 2) — Every Shopify app, BigCommerce app, script, pixel and third-party integration classified into **one of four buckets with named evidence** before pricing: (1) Fully compatible, (2) Custom integration required, (3) Replacement required, (4) Requires discovery. Default bucket is 4 (undetermined) — no assumptions. Five-question qualification gate per app: (i) documented headless/API path with specific capability named? (ii) relies on theme layer? (iii) requires checkout surface? (iv) requires server-side secrets? (v) what happens on failure? An app that cannot answer all five is bucket 4. **Skill owns policy + classification + qualification gate + commercial consequence; developer owns wiring per app.** Cross-engagement app-classification register is **heuristic-only, never authoritative, with 90-day per-entry expiry** — treated as "check here first, then re-verify," never as ratified truth. Register schema drafted when second engagement lands (bootstrap value = 0 until then). Full text in `_decisions/proposals/headless/D-HL-APPS-01-proposal.md` rev 2.
- **D-HL-SEC-01** (2026-08-07, v1.11.17, rev 2) — Headless security baseline; ship gate blocks release. Token classification table covers Storefront (public), Storefront (private/delegate), Customer Account API client secret, Admin API access token (never in storefront), Multipass secret, BigCommerce Store API (X-Auth), webhook signing secrets — each with class + browser-accessibility + storage location. Test that resolves every argument: *"If this repository were public on GitHub tomorrow, what could an attacker do?"* Env variable discipline (framework-prefix conventions: Vite `VITE_`, Next.js `NEXT_PUBLIC_` — accidental public prefix on a secret publishes it silently at build). CSP + CORS + cookies + cart-and-session integrity + Customer Account API + webhooks + server-layer rate limiting. **Mandatory SOW boilerplate line for B/C/D — including declined-management case:** *"Client owns hosting, monitoring and incident response. WebDesk responds on request at prevailing hourly rates, no response-time commitment."* Full text in `_decisions/proposals/headless/D-HL-SEC-01-proposal.md` rev 2.
- **D-HL-ENV-01** (2026-08-07, v1.11.17, rev 2; **check 1b added v1.11.28**) — Environment preflight. No headless build starts until preflight has been run and recorded; failed preflight **halts** (does not become backlog ticket) and carries **D-QA-GATE-BLOCK semantics**. Nine universal checks (Node version from `engines` not docs, package manager + lockfile, peer-pin resolution, store access, live Storefront API test query, secret store, environment matrix, git + CI, customer-accounts decision recorded). Plus per-architecture checks: A (Oxygen availability + bundle-size + startup + env-var cap under 110), **B (deploy spike on target host BEFORE signature — the gate)**, C (framework choice recorded + `@shopify/hydrogen-react` status verified + "must build yourself" inventory), D (Node-capable host + caching layer designed if off Vercel + GraphQL Storefront rate limits verified + store quota sharing understood). **Check 1b (v1.11.28 amendment, additive — no renumbering per D-KB-FIDELITY-01):** *cross-project resolution.* Where the same workstation, container image or CI runner serves more than one headless architecture, the resolved Node version satisfies **every** architecture it will build. Read `engines` from **each scaffolder actually invoked**, not from the framework package it depends on — the two can disagree, and on BigCommerce the scaffolder is the stricter one. Record the resolved version in the environment matrix (check 7). Where no single version satisfies all architectures the machine serves, per-project version management is the answer and it is **named at preflight**, not improvised. Current state (illustrative, dated to `pointers/verified-facts.md` §12a and §13): Hydrogen CLI `^22 || ^24`, `@bigcommerce/create-catalyst` `^24.0.0` — Node 24 is the only version that satisfies both. The rule survives the numbers. **Trigger for the amendment:** ratified check 1 scopes the Node question to one project; the failure mode is cross-project — a workstation on Node 22 passes check 1 on every A and B project and cannot scaffold Catalyst at all, surfacing as what looks like a broken laptop rather than a policy gap. Escalated by Headless window 2026-08-11 after v1.11.27 filed the gap as a follow-up. Full text in `_decisions/proposals/headless/D-HL-ENV-01-proposal.md` rev 2 (proposal body predates the amendment; reconciliation section notes the addition per D-KB-FIDELITY-01 precedence rule).

- **D-HL-SPEC-01** (2026-08-27, v1.11.31) — **Headless-only per user ruling.** Spec-conformance gate. The arm currently verifies inputs exhaustively (7-point discovery audit at pricing, environment preflight at build start, 5-check ship gate at release) and never verifies the built output against the SOW. K4 pilot 2026-08-27 confirmed the gap: 4 SOW-compliance failures (static homepage vs SOW-required Metaobject-driven dynamic, ~70% design match, nav/menu regressions, ~70-80% responsive) all reduce to *"no gate between SOW-signed and release asks whether the built thing is the thing that was promised."* Nineteen existing CRITICAL codes (`HEADLESS-HALLUCINATION-01`, `HL-SEC-001..006`, `HL-APPS-001..004`, `HL-CACHE-001..003`, `HL-CART-001..003`, `HL-ISR-001..002`) cover technical correctness and commercial protection; none cover build-vs-spec fidelity. **Three parts to be built by the Headless window on next content pass:** (4a) G1 → G4 spec-conformance ledger: every SOW requirement becomes a row *requirement → observable acceptance test → route/component that satisfies it → verified by / date*; at G4 the row set is walked, requirements with no passing test block sprint exit under D-QA-GATE-BLOCK semantics. (4b) Design-fidelity check: at G4, built route diffed against approved HTML mockup (per D-DES-01) — computed styles for typography/colour/spacing, section order and presence, breakpoint behaviour. Would have caught failures 2 + 4. (4c) Regression containment for nav / header / shared layout — explicit coverage for surfaces whose breakage is invisible to whoever's changing something else. `01-coding-standards.md` §7 currently prioritises money/cart/webhooks/cache and deprioritises snapshot tests; correct for commerce logic, wrong for a design-system build. **Process ratification:** a self-declared acceptance criterion in a KB file is not machine-checkable; ratified pattern is "arm's own predicted acceptance criterion becomes a ship blocker for the arm's release, not a note inside a KB file." Trigger: `knowledge/12-discovery-audit.md` self-declared *"if the arm ships without [7-point audit, four-way classification, runtime audit, automated Metaobject structure generation], it has not improved on the pilot"* — arm shipped without item 4 (Metaobject) and failed the pilot on precisely that item. Twice recorded, twice unacted before pilot. **Version consequence per D-ARM-VERSION-01:** arm stays at v0.14.0. Fold of 4a/4b/4c is the K4 feedback that unlocks v1.0.0. 4a is release-blocking; 4b/4c are fast followers. **Scope note per D-MASTER-SCOPE-01 amendment:** Headless-only ratification. Other arms (Shopify, WP, BC) are not affected in this or subsequent releases unless they escalate independent same-class findings. Cross-arm promotion of the pattern requires user approval per the ruling. Related: D-DES-01 (referenced by 4b for the mockup diff), D-PM-04 (referenced by 4a for sow-spec.md structure), D-QA-GATE-BLOCK (semantics for G4 blocking), D-KB-FIDELITY-01 (this ratification's text is authoritative for the pattern; body detail per-fix authored by Headless window). **Folded v1.11.32 (2026-08-27):** authored by Headless window into `knowledge/13-spec-conformance.md` (Tier 0 — always loaded when arm active; the observability of preflight/discovery failures is what made this file Tier 0 where 11 and 12 are Tier 1) and `templates/spec-conformance-ledger.md`. All three parts covered — 4a as §§2-3 with the observability test *"would an incorrect implementation also pass this?"* as the load-bearing rubric; 4b as §4 with the treatment that a client-generated fidelity number is a dispute while an arm-generated one is a work item; 4c as §6 walked on every sprint exit rather than only the sprint that built the surface. Codes `HL-SPEC-001..004` defined in §8. `knowledge/01-coding-standards.md` §7 amended: the earlier no-snapshot position is right for commerce logic and wrong for a design system; codified as anti-pattern 20 (uncovered shared surfaces) and 21 (misapplying the no-snapshot rule to the design system). `knowledge/09-forbidden.md` cross-references §8 without duplicating per D-KB-FIDELITY-01. Arm version 0.14.0 → 0.15.0 (still 0.x per D-ARM-VERSION-01: fold done, next pilot pending). **4e disclosure (v1.11.33):** the K4 findings had a fifth item — four capability gaps (Metaobject-driven sections, channel publication scoping, navigation sourcing, live-store safety) that the arm cannot teach. D-HL-SPEC-01 as ratified covers **detection** (`HL-SPEC-003` will stop a static homepage at G4), not **capability** (a developer still has no Metaobject section pattern to build the dynamic one with). **Blocking is not teaching.** Filed as a distinct work item for the Headless window: **HL-CAP-\* prefix reserved** for capability KBs; content deferred, not scope-broadening D-HL-SPEC-01. Fixing this is a knowledge-authoring pass, not a rule change.

**Reserved prefix ranges** (for content buildout): `HL-SEC-001..010`, `HL-APPS-001..008`, `HL-CACHE-*`, `HL-CART-*`, `HL-ISR-*`, `HL-CAP-001..004` (v1.11.33 reserved, **v1.11.34 partial buildout**: capability-teaching KBs for the four K4 gaps, ratified per-gap on the *"authorable vs. needs verification vs. needs a real build"* triage rather than as a single unit — Headless window's split, adopted verbatim: **`HL-CAP-001` Metaobject-driven section patterns — PRINCIPLED DEFERRAL to next pilot** because it is the only one of the four that is implementation-shaped and writing it from theory is exactly the reconstruction-drift failure that cost three releases in v1.11.19-20; the gate (`HL-SPEC-003`) now makes the pilot fail safely at G4 instead of at the client, and the pilot is what should teach the pattern rather than one master invents; **`HL-CAP-002` channel publication scoping — DEFERRED pending source verification** per the arm's own no-assert-without-first-party-source rule (`HEADLESS-HALLUCINATION-01`), source URL **APPROVED THIS RELEASE**: `https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/products-collections` (first-party Shopify docs, meets the verified-facts rule); to be closed by Headless window in the next fold as `verified-facts §17`; **`HL-CAP-003` navigation sourcing — AUTHORED v1.11.34** in `knowledge/06-data-layer-patterns.md` §8b as a decision framework (platform menus / metaobjects / hardcoded) with the "who can change it on a Friday" question as the load-bearing decider; explicit `HL-SPEC-003` silent-shape cross-reference; **`HL-CAP-004` live-store safety — AUTHORED v1.11.34** in `knowledge/11-environment-preflight.md` as *check 7b* resolving the read-vs-write contradiction (check 7 says staging pointed at production is a failure; on Migrate-to-Headless a build often must read production) — the risk is the credential, not the data; read-scoped access to catalogue legitimate, write-capable token in dev environment forbidden; shared-quota consequence (`HL-SEC-004`) explicit — a load test against the client's store spends the quota the live storefront depends on. **HL-CAP is capability, not conformance:** it teaches how to build the correct thing; `HL-SPEC` detects when the built thing does not match the spec. The two together are what closes the K4 asymmetry — detection alone is blocking, not teaching), `HL-SPEC-001..004` (v1.11.31 reserved, **v1.11.32 defined** — spec-conformance blockers per D-HL-SPEC-01, authored in `knowledge/13-spec-conformance.md` §8: `HL-SPEC-001` requirement with a failing acceptance test at sprint exit / `HL-SPEC-002` SOW requirement with no acceptance test — blocks G1 and G4 because an untestable requirement discovered at G4 has already been built wrong / `HL-SPEC-003` delivered static where the specification required dynamic — the failure mode that looks finished until someone tries to change content / `HL-SPEC-004` built output not verified against the approved D-DES-01 mockup), `HEADLESS-*` (v1.11.18 — hallucination-guard prefix, matches SHOPIFY-* / WP-* convention; first defined code is `HEADLESS-HALLUCINATION-01` — any API field, limit, plan gate, or version asserted anywhere in the arm must first appear in `pointers/verified-facts.md` with source URL and date). No collision risk across other arms.

**KB slot range for Headless arm: `00-13`** (v1.11.18: `00-12`; **v1.11.32: extended to `00-13`**) — breaks range parity with other arms (`00-10`) intentionally to preserve **cross-arm slot parity** (security at `05` everywhere, forbidden at `09` everywhere, SEO at `10` everywhere). The three additional slots are stage-gate KBs, not coding-standard KBs: `11-environment-preflight.md` (D-HL-ENV-01, blocks build start), `12-discovery-audit.md` (D-HL-DISCOVERY-01, blocks pricing), `13-spec-conformance.md` (D-HL-SPEC-01, blocks sprint exit). None foldable into `01-coding-standards` without burying a halt condition inside a style guide — the same reasoning that promoted slot 12 in v1.11.18 promotes slot 13 here. The set is coherent as a triple: 11 blocks build start, 12 blocks pricing, 13 blocks sprint exit. Cross-arm slot parity was ruled worth more than range parity because a reviewer moving between arms should find the same concept at the same slot number. **Structural extension ratified as a first-class change, not passed unremarked** per Headless window's flag: same class of decision as slot 12, escalated the same way, ratified on the same reasoning. Not open to other arms without independent same-class findings (D-MASTER-SCOPE-01 amendment).

**Blockers on content buildout (updated v1.11.19 after Headless window closed 2 TODO-VERIFY items on 2026-08-06):**

- **Architecture D KB — UNBLOCKED (v1.11.19).** BC GraphQL Storefront rate limits verified: complexity 10,000/request, depth 16, no request-count quota, not plan-gated. The governing constraint is query shape, not volume. Source in `skills/headless/pointers/verified-facts.md` §9b.
- **Architecture C KB — held for a COMMERCIAL reason, no verification pending.** Technical half is resolved: `@shopify/hydrogen-react` is at 2026.4.3, dist-tag latest, no deprecated field, no react-router peer (usable from Next.js). Verified in `pointers/verified-facts.md` §10. **What still holds C: no named client per the same consistency test that promoted architecture B (D-HL-STACK-01).** This is not a research task waiting to complete — it resolves when a client signs, or it never resolves. Sales must be told the reason changed.
- **D-HL-APPS-01 gate item 3 (checkout surface) — NARROWED v1.11.33, still open.** `pointers/verified-facts.md` §14 (VERIFIED 2026-08-12): Checkout UI extensions at the information/shipping/payment step targets are Plus-only per docs; other targets not stated (absence of a restriction is not a grant); **checkout branding/styling still open**. First-party quote narrows the scope of "cannot quote," it does not close it.
- Shopify Markets per-plan capabilities + Hydrogen release support window — TODO-VERIFY, not blocking specific KB but affects maintenance-cadence claims in SOWs.

**Sales-facing status (updated v1.11.33):**
- **Architecture D — QUOTABLE.** Blocker cleared v1.11.19.
- **Architecture C — NOT quotable, commercial reason, no verification pending.** Same test that promoted B (named client). C resolves when a client signs. There is no research task that will unblock C independently.
- **Checkout UI extensions at information/shipping/payment steps — QUOTABLE only against a Plus store**, per §14. Any deal touching **checkout branding/styling** still "cannot quote" pending the branding half of item 2.
- **`checkout.liquid` ScriptTag pattern — DEAD** for both Plus (2025-08-28, in effect) and non-Plus (2026-08-26, in effect as of 2026-08-27) per `pointers/verified-facts.md` §15. Not a headless-scoping matter and not a warning any more. **See "Cross-arm surface: Shopify client relationships" below.**

**Working-directory-loss disclosure (2026-08-06):** five of the seven packet files (`VERIFIED-FACTS`, `D-HL-TYPES-01`, `D-HL-APPS-01`, `D-HL-SEC-01`, `D-HL-ENV-01`) were reconstructed after a working-directory loss — faithful reconstructions per the window's own record, not byte-identical. Every verified figure carries a source URL. Future audits should treat rev 1 references in older headless docs as unreliable pointers.

**Dropped-delivery incident (v1.11.33, 2026-08-27):** two Headless-window deliveries dated 2026-08-12 — `headless-pilot-templates` (env-preflight.md, discovery-audit.md artifact templates) and `headless-verified-findings` (verified-facts §14/§15/§16, KB updates to 08/09/11/12 and architecture A reference) — **were not folded by master into v1.11.30, v1.11.31 or v1.11.32.** All three releases shipped from the v1.11.29 base for headless content. Discovery: Headless window caught it while checking a later bundle; recovery delivered as `headless-RECOVERY-dropped-work.zip` and folded here. **Class of failure, verbatim per Headless window:** *"delivered work that nobody folds is indistinguishable from work never done. Same class as the K4 findings (a recorded gap that nobody converts into work is indistinguishable from an unrecorded one), at the release-fold boundary instead of the KB-note boundary."* **Tooling gap disclosed (deferred to post-Headless-K4 batch per D-MASTER-SCOPE-01):** `ship-bundle.sh` content-hash arm-version-bump check compares a bundle against the previous bundle, so work that never entered a bundle is invisible to it by construction. Candidate detector for the batch: a delivery-landing check that reconciles a per-arm delivery ledger (or an inbox convention) against the folded diff. Not fixed in-release; disclosed and named. **Cost of the drop, unmasked by this fold:** §15's ScriptTag sunset for non-Plus (2026-08-26) shipped the day after it passed — the shipped arm had no record of it at all through three releases, when it was verified on the 12th. This is a client-exposure item, not a headless-arm quality item; see below.

**Cross-arm surface: Shopify client relationships (v1.11.33, 2026-08-27, cross-arm safe under D-MASTER-SCOPE-01 amendment as a *disclosure*, not a content edit):** the `checkout.liquid` ScriptTag sunset dates in `verified-facts §15` **have both passed** — Plus 2025-08-28, non-Plus 2026-08-26. Not a headless-scoping matter and not a warning. **Nothing errors when a ScriptTag stops firing** on the covered pages, which is why non-Plus clients who have not looked since the 26th may have lost behaviour with no signal. Client-facing check appropriate this week, owner: whoever holds Shopify client relationships. This is a disclosure to the sales/account owner, not an edit to the Shopify arm (no other-arm content changed in this release). **Rationale for disclosure at the master level rather than escalation-only:** the fact lives in the Headless arm's verified-facts by history of source (Headless window verified it 2026-08-12); the exposure lives in existing Shopify stores. Naming it here rather than in the release-notes body ensures the record is auditable and does not depend on the notes being re-read.

### SOW — SOW Builder Agent (separate skill, v1.0)
- **D-SOW-01** (2026-06-02) — `design_tool` LOCKED to `HTML` at SOW stage. Agent refuses Adobe XD, Figma, Sketch, PSD, InVision, Marvel as deliverable values. Enforces D-DES-01 at the source.
- **D-SOW-02** (2026-06-02) — FLAG-004 client-contact blocklist captured at SOW stage (intake + Contact Us page scan), not deferred to G0. Lives in spec frontmatter only, never in client doc.
- **D-SOW-03** (2026-06-02) — Two outputs per SOW: client-facing `sow-client.md` (signing) + AI-facing `sow-spec.md` (PM Agent ingestion at G0).
- **D-SOW-04** (2026-06-02) — One SOW = one platform. Multi-platform SOWs refused unless project_type = migration with explicit source platform.
- **D-SOW-05** (2026-06-02) — Spreadsheet rewrites (platform conflicts, design-tool conflicts, client name leftovers) are SURFACED to sales person and confirmed before applied. Never silent. Audit trail in spec under `rewrites_applied`.
## How to add a new decision

1. Lock it (discuss → confirm)
2. Add a one-liner to the **Master Index** above under the appropriate category
3. If the decision warrants explanation, add detail to the relevant section below OR in the implementation file
4. Reference the decision ID in any file that implements it
5. Commit message: `decision(D-XXX-NN): [summary]`

---

## How to use this document

1. Each item has: ID, category, status, my honest recommendation level (MUST / SHOULD / COULD), and a brief explanation.
2. Mark each row: `[X]` = include in build, `[D]` = defer to later, `[N]` = no, don't build.
3. Status legend:
   - **DECIDED** = you've answered earlier in the chat
   - **PENDING** = raised but you haven't decided
   - **NEW** = just added by you (code review, speed, SEO, WCAG)
   - **YOURS** = already in your halfbaked Shopify system
4. Recommendation legend (my honest view, not buttered):
   - **MUST** = system fails or produces unsafe output without this
   - **SHOULD** = significant quality / scalability lift
   - **COULD** = nice-to-have, not critical for a 6-15 person agency
   - **SKIP** = I floated it but on reflection it's overkill for your stage

---

## My honest summary before you read further

If you only build the **MUST** items, you get a working system that doesn't embarrass you. That's ~30 items.

If you also build the **SHOULD** items, you get a polished system that scales to 25+ devs. That's ~50 items.

The **COULD** items can wait until you've run 10 real projects through the system. Don't build them prematurely.

Some items I raised earlier I now think were **SKIP** — over-engineered for your stage. I'll flag those honestly.

---

## A. Tool & Environment

```
[ ] A1. Standardize on Claude Code as primary IDE/coding tool
        Status: DECIDED (you confirmed)
        Recommendation: MUST
        Notes: Already decided. Drop Codex unless individual devs strongly prefer.

[ ] A2. Confirm VS Code as the editor (not Microsoft Visual Studio)
        Status: PENDING (you never confirmed)
        Recommendation: MUST (for clarity, not a feature)
        Notes: If Visual Studio (the full IDE) is in play, switch to VS Code for web work.

[ ] A3. Define what "skill" meant in your "Playwright in each skill" comment
        Status: PENDING (you never clarified)
        Recommendation: MUST (affects QA architecture)
        Notes: Each dev specialty? Each feature? Each project? Cannot finalize QA layer without this.

[ ] A4. Adopt Shopify CLI + GitHub Actions auto-push flow (from your setup guide)
        Status: YOURS (already designed)
        Recommendation: MUST
        Notes: Keep as-is. Solid foundation.

[ ] A5. Branch strategy: main / develop / feature/S* / fix/S*
        Status: YOURS
        Recommendation: MUST
        Notes: Keep as-is.

[ ] A6. .env management + .gitignore + theme IDs in secrets
        Status: YOURS
        Recommendation: MUST
        Notes: Keep as-is.

[ ] A7. Required reviewer protection on main branch
        Status: YOURS
        Recommendation: MUST
        Notes: Keep. Hard gate for live theme pushes.

[ ] A8. Enable Anthropic prompt caching across all agent calls
        Status: NEW (raised in cost discussion)
        Recommendation: MUST
        Notes: 90% discount on cached KB content. Without this, per-project cost is high.

[ ] A9. Anthropic Batch API for non-urgent work (overnight QA reports, archive generation)
        Status: PENDING
        Recommendation: COULD
        Notes: 50% discount but adds complexity. Worth it once you're at >20 projects/year.

[ ] A10. Hard spend cap per project + daily workspace cap (in API console)
         Status: PENDING
         Recommendation: SHOULD
         Notes: Prevents runaway costs. Easy to set up.

[ ] A11. Per-project token budget tracked in project.json (already in schema)
         Status: DECIDED (in schema)
         Recommendation: SHOULD
         Notes: Schema supports it. Need wiring.
```

---

## B. Testing & QA Layers

Your current setup: Playwright + manual QA. This is incomplete. Below is what's missing.

```
[ ] B1. Unit tests for business logic (especially AI-generated)
        Status: PENDING
        Recommendation: MUST
        Notes: AI hallucinates most in business logic. Playwright doesn't catch this.

[ ] B2. Lighthouse CI as pre-merge gate (perf ≥90, a11y ≥95, SEO ≥95)
        Status: PENDING
        Recommendation: MUST
        Notes: Single biggest quality gate you're missing.

[ ] B3. axe-core or Playwright accessibility scanner in CI
        Status: PENDING
        Recommendation: MUST (since WCAG is now a stated requirement)
        Notes: Automated WCAG 2.1 AA check. Zero violations gate.

[ ] B4. Visual regression (Playwright screenshot diff or Percy/Chromatic)
        Status: PENDING
        Recommendation: SHOULD
        Notes: Catches CSS bleeds. Worth it for redesigns specifically.

[ ] B5. Security scanning: npm audit, Snyk, or Dependabot
        Status: PENDING
        Recommendation: MUST
        Notes: AI happily uses outdated/vulnerable packages.

[ ] B6. Platform-specific linters: Shopify theme-check, PHPCS for WP, ESLint for Node.js
        Status: PENDING (Shopify theme-check is in your existing system)
        Recommendation: MUST
        Notes: Deterministic backstop for KB.

[ ] B7. Cross-browser test matrix (define which browsers/devices)
        Status: PARTIAL (your system mentions cross-browser but doesn't define matrix)
        Recommendation: SHOULD
        Notes: Specify exact list. Don't say "all browsers."

[ ] B8. Synthetic monitoring post-launch (UptimeRobot, Checkly, Better Stack)
        Status: PENDING
        Recommendation: SHOULD
        Notes: Catches launch regressions without manual checking.

[ ] B9. 8 QA modules defined in detail (currently vapor in your system)
        Status: YOURS (claimed but undefined)
        Recommendation: MUST
        Notes: Must produce actual content.

[ ] B10. P1-P4 bug severity matrix with SLA per severity
         Status: PARTIAL (mentioned in your system, not detailed)
         Recommendation: MUST
         Notes: Schema supports it. Need actual matrix.

[ ] B11. Bug report template (steps to reproduce, severity, screenshots)
         Status: PENDING
         Recommendation: MUST
         Notes: Standardizes how bugs flow back to dev agent.

[ ] B12. Sprint-level QA + milestone regression QA (distinct, both needed)
         Status: YOURS
         Recommendation: MUST
         Notes: Keep your two-tier QA approach.
```

---

## C. Project Types & Platforms

```
[ ] C1. Shared spine + per-platform deployment architecture
        Status: DECIDED (you confirmed)
        Recommendation: MUST
        Notes: Locked. Spine = universal, arms = platform-specific.

[ ] C2. Start with Shopify Redesign as first project-type skill
        Status: DECIDED
        Recommendation: MUST
        Notes: Locked. Building this first.

[ ] C3. Define 4 base project types: New Development, Redesign, Migration, Version Upgrade
        Status: DECIDED
        Recommendation: MUST
        Notes: Add Maintenance as a 5th if you do recurring work for clients.

[ ] C4. Cover 5 platforms: Shopify, WordPress, Magento, Node.js, BigCommerce
        Status: PENDING
        Recommendation: SHOULD revise — be honest about which platforms you do >5 projects/year
        Notes: Spreading thin across 5 dilutes AI investment. Top 3 by revenue get deep arms; rest get light arms.

[ ] C5. Headless/Hydrogen as separate project type or omit
        Status: PENDING (in your design as a "design option" but no real flow)
        Recommendation: COULD (depends on volume)
        Notes: Build only if you do headless projects regularly.

[ ] C6. Page builder integration (Replo/GemPages) as a project type or omit
        Status: PENDING (in your design but no flow)
        Recommendation: SKIP for now
        Notes: Low ROI as a dedicated skill. Treat as a sub-pattern of redesign.

[ ] C7. Maintenance/optimization as a 5th project type
        Status: PENDING
        Recommendation: SHOULD (if you have retainer clients)
        Notes: Different gate structure (no big-bang launch). Worth a skill if it's recurring revenue.
```

---

## D. Agents & Core Architecture

```
[ ] D1. 4-layer hybrid architecture: Conversation (agent) / Workflow (skill) / Execution (hybrid) / Validation (skill)
        Status: DECIDED (you confirmed direction)
        Recommendation: MUST
        Notes: The architectural spine.

[ ] D2. PM Agent (universal, in spine)
        Status: YOURS + improved
        Recommendation: MUST
        Notes: With G0 SOW gate + clarification bank (new).

[ ] D3. Designer Agent (universal, in spine)
        Status: YOURS
        Recommendation: MUST
        Notes: Must produce real visual mockup at G2, not just JSON tokens.

[ ] D4. Frontend Dev Agent (per platform)
        Status: YOURS
        Recommendation: MUST
        Notes: Lives in each platform arm.

[ ] D5. Backend Dev Agent (per platform)
        Status: YOURS
        Recommendation: MUST
        Notes: Scope must expand: payment, shipping, tax, fulfillment, inventory, POS, B2B (see audit item).

[ ] D6. QA Agent (universal framework + platform-specific addendums)
        Status: YOURS
        Recommendation: MUST
        Notes: 8 QA modules must be actually defined (B9).

[ ] D7. Delivery Head Agent (universal)
        Status: YOURS
        Recommendation: MUST
        Notes: 40-point pre-launch checklist must be defined.

[ ] D8. Orchestrator Agent (universal, ties everything)
        Status: YOURS (agency-master)
        Recommendation: MUST
        Notes: Renamed orchestrator for clarity.

[ ] D9. Code Review Agent (NEW — your request)
        Status: NEW
        Recommendation: MUST
        Notes: Spec in section H.

[ ] D10. Content & Data Migration Agent (or extend Backend Agent)
         Status: PENDING (gap from audit)
         Recommendation: MUST for migration project type
         Notes: Owns product import, customer data, blog content, redirects.

[ ] D11. SEO Agent (or SEO module within QA/Delivery)
         Status: PENDING (gap from audit)
         Recommendation: SHOULD
         Notes: SEO is too critical to live as a scattered checklist. Either a dedicated agent or a clearly-owned module.

[ ] D12. Analytics/Tracking Agent (or module)
         Status: PENDING (gap from audit)
         Recommendation: SHOULD
         Notes: GA4, Meta Pixel, server-side, consent — needs an owner.

[ ] D13. Multi-Project Master skill (mentioned in your deploy guide, unclear scope)
         Status: YOURS (vague)
         Recommendation: COULD (defer)
         Notes: Don't build before you have multiple concurrent projects causing actual conflicts.
```

---

## E. Skills & Knowledge Base

```
[ ] E1. Folder structure: /skills/_spine/ + /skills/[platform]/ + /skills/_contracts/
        Status: DECIDED (in 01-folder-structure.md)
        Recommendation: MUST
        Notes: Locked.

[ ] E2. 3-layer KB per platform: external pointers / agency standards / reference implementations
        Status: DECIDED (in earlier conversation)
        Recommendation: MUST
        Notes: Don't copy platform docs.

[ ] E3. forbidden.md per platform (what NEVER to do)
        Status: PENDING
        Recommendation: MUST
        Notes: Highest-leverage KB file. Prevents most damage.

[ ] E4. 3 reference implementation sections per platform (real code, anonymized)
        Status: PENDING
        Recommendation: MUST
        Notes: AI learns from examples 10x better than rules.

[ ] E5. Per-platform owner + quarterly review cycle for KB
        Status: PENDING
        Recommendation: MUST
        Notes: Without this, KB rots in 90 days.

[ ] E6. Version stamp + next-review date on every KB file
        Status: PENDING
        Recommendation: SHOULD
        Notes: Automated stale-detection.

[ ] E7. Deprecation list maintained per platform
        Status: PENDING
        Recommendation: SHOULD
        Notes: When you remove a pattern, log it explicitly.

[ ] E8. KB changelog per platform
        Status: PENDING
        Recommendation: SHOULD
        Notes: Audit trail for standards changes.

[ ] E9. RAG / vector store for KB retrieval
        Status: PENDING
        Recommendation: SKIP (for now)
        Notes: Full-context loading + prompt caching is simpler and cheaper at your scale.

[ ] E10. Shopify MCP for live API lookups
         Status: YOURS
         Recommendation: MUST
         Notes: Already connected per your system.

[ ] E11. Self-check requirement: agent states which KB files it consulted
         Status: PENDING
         Recommendation: SHOULD
         Notes: Forces actual KB consultation vs hallucination.
```

---

## F. Gates & Guardrails

```
[ ] F1. 7-gate model (G0-G6) as specified in 04-gate-format.md
        Status: DECIDED (file delivered)
        Recommendation: MUST
        Notes: Locked. G0 (SOW Validation) and G3 (Scaffold Verification) are new.

[ ] F2. Gate format: CONFIRM / REJECT / REVISE / RENEGOTIATE
        Status: DECIDED
        Recommendation: MUST
        Notes: RENEGOTIATE is new vs your system.

[ ] F3. Gate SLAs + escalation (12h reminder, 24h backup approver, 48h block)
        Status: DECIDED (in gate format)
        Recommendation: SHOULD
        Notes: Honestly, may be over-engineered at your team size. Could simplify to 24h SLA, manual escalation.

[ ] F4. Self-approval prohibition (designer can't approve G2, dev can't approve G4)
        Status: DECIDED
        Recommendation: MUST
        Notes: Non-negotiable.

[ ] F5. File locking on project.json
        Status: DECIDED (in schema)
        Recommendation: MUST
        Notes: Race condition prevention.

[ ] F6. Versioned project.json (every write saves a snapshot)
        Status: DECIDED (in schema)
        Recommendation: MUST
        Notes: Rollback capability.

[ ] F7. Schema validation on every artifact write
        Status: PENDING
        Recommendation: MUST
        Notes: Bad writes rejected at source.

[ ] F8. Audit log of every state change
        Status: DECIDED (in schema)
        Recommendation: SHOULD
        Notes: Required for SLA compliance review.

[ ] F9. Sub-agent iteration cap (no infinite loops)
        Status: PENDING
        Recommendation: COULD
        Notes: I floated this. Honestly, Claude Code already has guardrails for this. Probably skip.

[ ] F10. Stage prerequisite enforcement (can't advance until prior stage validated)
         Status: PENDING
         Recommendation: MUST
         Notes: Built into orchestrator logic.

[ ] F11. Gate override protocol (emergency bypass with audit)
         Status: PENDING
         Recommendation: SHOULD
         Notes: Defined in gate format.

[ ] F12. Backup before live push (mandatory, non-skippable)
         Status: PENDING
         Recommendation: MUST
         Notes: Hard rule in delivery-head skill.

[ ] F13. Post-deploy health check + auto-rollback if failed
         Status: PENDING
         Recommendation: SHOULD
         Notes: Worth it. Catches the bad pushes that look clean.
```

---

## G. Cost & Budget

```
[ ] G1. Per-project token budget cap
        Status: DECIDED (in schema)
        Recommendation: SHOULD
        Notes: Hard cap prevents runaway.

[ ] G2. Per-stage token estimate tracking
        Status: PENDING
        Recommendation: COULD
        Notes: Nice-to-have. Adds complexity. Skip unless you find token spend is actually a problem.

[ ] G3. Daily workspace spend cap (in API console)
        Status: PENDING
        Recommendation: SHOULD
        Notes: Easy to set up in Anthropic dashboard.

[ ] G4. Model selection per task (Haiku for cheap, Sonnet default, Opus for hard)
        Status: PENDING
        Recommendation: MUST
        Notes: Default-Sonnet-for-everything overpays 3-5x.

[ ] G5. Cost-per-project tracking + reporting
        Status: PENDING
        Recommendation: SHOULD
        Notes: Visibility into AI cost vs project margin.

[ ] G6. Pricing recalibration based on AI savings
        Status: PENDING
        Recommendation: SHOULD
        Notes: Strategic, not technical. Where do AI savings go — margin, more scope, lower price?
```

---

## H. Code Review Agent (NEW — your request)

Detailed spec for the code review agent. Choose granularity.

```
[ ] H1. Code Review Agent as a dedicated agent in the spine
        Status: NEW
        Recommendation: MUST
        Notes: Position: between dev agent commit and merge to develop branch.

[ ] H2. AI code review tool: CodeRabbit (primary recommendation)
        Status: NEW
        Recommendation: SHOULD
        Notes: Mature, good for Liquid + JS + CSS. ~$15/dev/month.

[ ] H3. Alternative AI review: GitHub Copilot Review (cheaper if you already pay Copilot)
        Status: NEW
        Recommendation: COULD
        Notes: Less depth than CodeRabbit but free with Copilot.

[ ] H4. Alternative: Claude API as reviewer in a GitHub Action
        Status: NEW
        Recommendation: COULD
        Notes: Custom but full control. More setup.

[ ] H5. Code review checks: Liquid validity, schema correctness, deprecated APIs
        Status: NEW
        Recommendation: MUST
        Notes: Catches hallucinated Liquid filters / APIs.

[ ] H6. Code review checks: hallucinated functions/imports
        Status: NEW
        Recommendation: MUST
        Notes: AI invents APIs. Critical to catch.

[ ] H7. Code review checks: forbidden patterns (from KB forbidden.md)
        Status: NEW
        Recommendation: MUST
        Notes: AI applies what you've told it not to.

[ ] H8. Code review checks: security (no inline scripts, no eval, no credentials, no XSS)
        Status: NEW
        Recommendation: MUST
        Notes: AI is sloppy with security defaults.

[ ] H9. Code review checks: performance impact (Lighthouse delta vs main)
        Status: NEW
        Recommendation: MUST
        Notes: Bot comments if perf regresses.

[ ] H10. Code review checks: accessibility regressions (axe delta)
         Status: NEW
         Recommendation: MUST
         Notes: Bot blocks if a11y regresses.

[ ] H11. Code review checks: SEO compliance (meta tags, alt text, schema markup, heading order)
         Status: NEW
         Recommendation: MUST
         Notes: SEO drift caught at PR level.

[ ] H12. Code review severity: P1 (block merge), P2 (block merge), P3 (warn), P4 (info)
         Status: NEW
         Recommendation: MUST
         Notes: Auto-block on P1/P2. P3/P4 are advisory.

[ ] H13. Human senior dev review required for sensitive paths (checkout, payment, customer data, auth)
         Status: NEW
         Recommendation: MUST
         Notes: Auto-detected by file path. CODEOWNERS file enforces.

[ ] H14. Code review feedback loop: failures become KB entries (update forbidden.md)
         Status: NEW
         Recommendation: SHOULD
         Notes: System gets smarter from real failures.

[ ] H15. Review pass written to project.json (audit trail)
         Status: NEW
         Recommendation: SHOULD
         Notes: For compliance + later analysis.
```

---

## I. Performance, SEO & Accessibility (NEW — your request)

### I.1 Performance / Speed per page

```
[ ] I1. Performance budget per template type (homepage may allow more weight than PDP)
        Status: NEW
        Recommendation: MUST
        Notes: Defined in spec.md, enforced by Lighthouse CI.

[ ] I2. Core Web Vitals thresholds: LCP ≤2.0s, CLS ≤0.05, INP ≤200ms (stricter than default)
        Status: PARTIAL (Lighthouse ≥90 mentioned in your system, no per-metric targets)
        Recommendation: MUST
        Notes: Specific targets prevent "90 average via good desktop, bad mobile."

[ ] I3. Lighthouse CI as hard pre-merge gate (already in B2)
        Status: PARTIAL
        Recommendation: MUST
        Notes: Block merge if budget exceeded.

[ ] I4. Image optimization automation: responsive srcset, WebP/AVIF, lazy loading
        Status: PENDING
        Recommendation: MUST
        Notes: Single biggest performance win on ecommerce.

[ ] I5. Critical CSS extraction for above-the-fold
        Status: PENDING
        Recommendation: SHOULD
        Notes: Measurable LCP improvement.

[ ] I6. Third-party script policy: no script blocks render without senior approval
        Status: PENDING
        Recommendation: MUST
        Notes: GTM, chat widgets, ad pixels — primary cause of bad performance.

[ ] I7. Font loading strategy: font-display: swap, preload, self-host
        Status: PENDING
        Recommendation: SHOULD
        Notes: Prevents FOIT/FOUT and improves LCP.

[ ] I8. Cache headers configuration validated pre-launch
        Status: PENDING
        Recommendation: SHOULD
        Notes: Static assets must be cacheable.

[ ] I9. Bundle size cap per template (e.g., 200KB initial JS)
        Status: PENDING
        Recommendation: SHOULD
        Notes: Prevents bundle bloat.

[ ] I10. JS execution time budget per page (TBT/INP target)
         Status: PENDING
         Recommendation: SHOULD
         Notes: Caught by Lighthouse but worth explicit budget.

[ ] I11. CDN check pre-launch (assets served via Shopify CDN or equivalent)
         Status: PENDING
         Recommendation: MUST
         Notes: Hard to fix post-launch.
```

### I.2 SEO standards

```
[ ] I12. SEO baseline KB file per platform (knowledge/10-seo-baseline.md)
         Status: PENDING
         Recommendation: MUST
         Notes: Master reference for what SEO must be present.

[ ] I13. Schema markup templates per page type: Product, Organization, BreadcrumbList, Article, FAQPage, Review
         Status: PENDING
         Recommendation: MUST
         Notes: AI ships sites without schema unless explicitly required.

[ ] I14. Meta tag requirements: title, description, OG, Twitter Cards, canonical
         Status: PENDING
         Recommendation: MUST
         Notes: Validated by SEO module in QA.

[ ] I15. Sitemap.xml + robots.txt validation pre-launch
         Status: PENDING
         Recommendation: MUST
         Notes: Submit to GSC as part of handoff.

[ ] I16. 301 redirect map for redesigns/migrations (required artifact)
         Status: PENDING
         Recommendation: MUST (for redesign/migration)
         Notes: SEO killer if missed.

[ ] I17. URL structure standards (slug conventions, no parameters where avoidable)
         Status: PENDING
         Recommendation: SHOULD
         Notes: Platform-specific in some cases.

[ ] I18. Heading hierarchy enforcement (exactly one H1 per page, no skipped levels)
         Status: PENDING
         Recommendation: MUST
         Notes: Caught by axe + linter.

[ ] I19. Internal linking standards (every page reachable in ≤3 clicks)
         Status: PENDING
         Recommendation: SHOULD
         Notes: Audit at milestone QA.

[ ] I20. Image alt text enforcement (no image without alt; decorative = empty alt explicitly)
         Status: PENDING
         Recommendation: MUST
         Notes: Linter rule. Hard gate.

[ ] I21. Pre-launch SEO audit (Screaming Frog, Sitebulb, or programmatic crawler)
         Status: PENDING
         Recommendation: SHOULD
         Notes: Catches crawl issues before launch.

[ ] I22. GSC + Bing Webmaster Tools integration in handoff
         Status: PENDING
         Recommendation: MUST
         Notes: Part of handoff checklist.
```

### I.3 Accessibility / WCAG 2.1 AA

```
[ ] I23. WCAG 2.1 AA as minimum standard, agency-stricter where defined
         Status: YOURS (mentioned)
         Recommendation: MUST
         Notes: Already in your system, needs concrete enforcement.

[ ] I24. Color contrast validated at design-tokens.json level (before any code is written)
         Status: NEW
         Recommendation: MUST
         Notes: Token validator skill checks 4.5:1 (text) / 3:1 (large text) / 3:1 (UI components).

[ ] I25. Keyboard navigation testing requirement (every interactive element reachable + operable)
         Status: PENDING
         Recommendation: MUST
         Notes: Part of QA module.

[ ] I26. Focus indicators required (visible :focus state on all interactive elements)
         Status: PENDING
         Recommendation: MUST
         Notes: Linter + design system rule.

[ ] I27. Semantic HTML enforcement (no <div> as button, no skipped headings)
         Status: PENDING
         Recommendation: MUST
         Notes: Linter rule.

[ ] I28. ARIA usage rules (only when semantic HTML can't express it)
         Status: PENDING
         Recommendation: MUST
         Notes: AI over-uses ARIA. KB rule.

[ ] I29. Form accessibility: every input has label, every error has aria-live, fieldsets for grouped fields
         Status: PENDING
         Recommendation: MUST
         Notes: Standard form audit in QA.

[ ] I30. Skip links on every page
         Status: PENDING
         Recommendation: SHOULD
         Notes: Required for full WCAG compliance.

[ ] I31. Screen reader testing (NVDA on Windows, VoiceOver on Mac) — manual checklist
         Status: PENDING
         Recommendation: SHOULD
         Notes: axe catches 30-40% of issues. Manual catches the rest.

[ ] I32. axe-core zero-violations gate in CI (already in B3)
         Status: PARTIAL
         Recommendation: MUST
         Notes: Already covered in B3.

[ ] I33. Accessibility VPAT or statement included in handoff
         Status: PENDING
         Recommendation: COULD
         Notes: Only if client requires (enterprise, gov, education).
```

---

## J. Client-Facing & Communication

```
[ ] J1. Client preview URLs (already auto-generated via dev theme)
        Status: YOURS
        Recommendation: MUST
        Notes: Keep.

[ ] J2. Client-facing project portal (custom build vs. existing tools)
        Status: PENDING
        Recommendation: SKIP custom build for now
        Notes: Use Notion/ClickUp/Basecamp until volume justifies custom portal.

[ ] J3. Milestone reports for client (auto-generated by delivery-head)
        Status: YOURS (mentioned, undefined)
        Recommendation: MUST
        Notes: Define template.

[ ] J4. Client sign-off mechanism per gate (email, e-sig, in-portal)
        Status: PENDING
        Recommendation: MUST
        Notes: Without signed sign-offs, scope creep is uncontrollable.

[ ] J5. Visual mockups at design gate (not just JSON tokens)
        Status: PENDING (gap from audit)
        Recommendation: MUST
        Notes: Clients cannot approve JSON.

[ ] J6. Client-facing change request process documented
        Status: PARTIAL (in spec template, needs enforcement)
        Recommendation: MUST
        Notes: Every change has paper trail.

[ ] J7. Handoff guide template (training material, admin guide, video script)
        Status: YOURS (mentioned, undefined)
        Recommendation: MUST
        Notes: Define template.

[ ] J8. Warranty period definition + post-launch SLA per severity
        Status: PARTIAL (in spec template)
        Recommendation: MUST
        Notes: Standard 30 days. Bug severity SLA already defined.
```

---

## K. Maintenance & Governance

```
[ ] K1. Per-platform KB owner (named senior dev)
        Status: PENDING
        Recommendation: MUST
        Notes: Without owner, KB rots.

[ ] K2. Quarterly KB review calendar event
        Status: PENDING
        Recommendation: MUST
        Notes: Non-negotiable.

[ ] K3. Skill versioning + changelog
        Status: PENDING
        Recommendation: SHOULD
        Notes: Track when skill prompts change.

[ ] K4. Failure → KB update feedback loop
        Status: PENDING
        Recommendation: SHOULD
        Notes: Code review failures → forbidden.md updates.

[ ] K5. Monthly "system retro" (what did the system catch vs miss)
        Status: PENDING
        Recommendation: SHOULD
        Notes: 30 minutes/month. Compounds.

[ ] K6. Success metrics defined (hours saved, bugs per launch, rework %, NPS)
        Status: PENDING (gap from audit)
        Recommendation: MUST
        Notes: Otherwise you cannot tell if the system is working.

[ ] K7. Onboarding doc for new devs (how to use the system)
        Status: PENDING
        Recommendation: MUST
        Notes: Otherwise the system stays in your head.

[ ] K8. Training program (3-tier as proposed earlier)
        Status: PENDING (proposed earlier in chat)
        Recommendation: SHOULD
        Notes: Tier 1 all-hands, Tier 2 devs, Tier 3 seniors.
```

---

## Items I do NOT recommend including

Being honest about what I floated that's overkill for your stage:

```
[N] Z1. Full RAG / vector store knowledge retrieval
        Recommendation: SKIP for now
        Notes: Prompt caching + full-context loading is simpler and cheaper until you have 500+ KB files per platform.

[N] Z2. Custom client portal (build vs buy)
        Recommendation: SKIP
        Notes: Use Notion/ClickUp/Basecamp. Build only when you have 50+ active projects.

[N] Z3. Sub-agent iteration caps as a custom guardrail
        Recommendation: SKIP
        Notes: Claude Code already has built-in protections. Custom layer is overhead.

[N] Z4. Per-stage detailed token estimate tracking
        Recommendation: SKIP (G2)
        Notes: Daily caps + per-project cap is enough. Per-stage tracking is engineering overhead.

[N] Z5. 10-platform full coverage
        Recommendation: SKIP
        Notes: Top 3 by revenue get deep arms. Others get light arms or aren't supported.

[N] Z6. Multi-Project Master skill (your existing system mentioned)
        Recommendation: DEFER
        Notes: Build only after you have multi-project conflicts to solve.

[N] Z7. Page builder integration as a dedicated project type
        Recommendation: SKIP
        Notes: Treat as a sub-pattern of redesign.
```

---

## Items from your existing Shopify system I recommend KEEPING as-is

These don't need redesign — they're solid:

```
[X] Y1. Local dev with hot reload (Shopify CLI theme dev)
[X] Y2. GitHub Actions auto-push to dev theme on feature/* branch
[X] Y3. Branch strategy (main / develop / feature / fix)
[X] Y4. .env management + production environment protection
[X] Y5. 6-agent identity (PM / DS / FE / BE / QA / DH)
[X] Y6. 6 design path options (theme, custom, marketplace, headless, Figma, page builder)
[X] Y7. Sprint structure (3-5 days, max 3 sections)
[X] Y8. Shopify MCP integration for direct theme push
[X] Y9. project.json as state file (your idea, kept + expanded)
[X] Y10. design-tokens.json + section-map.json as shared artifacts
[X] Y11. Section prefix naming convention (per project)
[X] Y12. Theme backup before live push
[X] Y13. 5-layer architecture (kept + enriched to 4-layer hybrid)
[X] Y14. Pipeline tab UX (good for internal visibility, not blocking)
```

---

## Items still PENDING your decision

Quick scan — these need your call before we can lock the build order:

1. **A2.** VS Code or Visual Studio? (still unanswered)
2. **A3.** What did "skill" mean in your Playwright statement? (still unanswered)
3. **C4.** Which 3 platforms get deep arms vs light arms? (revenue mix needed)
4. **C5, C6, C7.** Headless, page builder, maintenance — include as project types or omit?
5. **D10, D11, D12.** Content/migration agent, SEO agent, analytics agent — separate agents or modules?
6. **F3.** Do you want the full SLA + escalation gate machinery, or a simpler 24h-and-manual approach?
7. **H2, H3, H4.** Code review tool choice — CodeRabbit / Copilot Review / Claude API custom?
8. **J2.** Client portal — defer to existing tools, or build custom later?

---

## What to do next

1. Open this file in any markdown editor.
2. Mark each row: `[X]` include, `[D]` defer, `[N]` no.
3. Resolve the PENDING items at the bottom.
4. Save and tell me when you're done. I'll regenerate the build order based on your selections, then we move to producing Phase 2 spine skills against only the items you've selected.

This is the last "planning" file. After your markup, we build.

---

Last reviewed: 2026-05-24 by Claude (initial)
Next review due: when user returns marked-up version

---

# Decisions locked AFTER initial inventory (Kitchen Blockers pilot + v1.5.2 → v1.5.4)

## v1.5.2 design + workflow decisions

- **D-DES-01** (2026-05-27) — Mockups ARE production scaffold. Designer Agent writes near-production HTML/CSS/JS. Frontend Agent refines, doesn't rebuild. AI delivery system produces HTML mockups exclusively. Figma allowed for human visual exploration and brand asset intake only — never deliverable to client, never input to Frontend Agent.
- **D-DES-02** (2026-05-27) — Secret code bypass dropped. Existing OVERRIDE protocol in `project.json.audit_log` sufficient. Daily-changing server-hosted secret feature deferred indefinitely.
- **D-INT-02** (2026-05-27) — Shipping + payment configuration always manual. No AI autonomy on those settings (strengthens INT-001 from "shouldn't" to "MUST NOT").
- **D-PM-01** (2026-05-27) — PM Agent self-schedules via 7 trigger conditions (task count, time elapsed, sprint completion, milestone transition, pending gates, new artifacts, explicit invocation). Manual `/pm` still available.
- **D-PM-02** (2026-05-27) — G0 is now a hard gate. < 80% intake artifacts → halt G1. Override requires non-self approval.
- **D-PM-03** (2026-05-27) — Documentation is milestone-wise, not sprint-wise. Sprint docs are working state; milestone docs are deliverables.
- **D-QA-01** (2026-05-27) — Bug lifecycle is LOGGED → FIXED → RETESTING → VERIFIED → CLOSED. Self-approval prohibited.
- **D-COST-01** (2026-05-27) — Tiered KB loading. Target: project cost drops from $232 to ~$130 via Tier F.

## v1.5.4 platform architecture decision

- **D-PLAT-01** (2026-05-28) — Forbidden rules split into:
  - `_spine/shared-knowledge/forbidden-global.md` — cross-platform rules (SEC-004+, COMM-*, DES-*, INT-*, A11Y-*, SEO-001/003/004, JS-*, PERF-001/003/004)
  - `skills/{platform}/knowledge/09-forbidden.md` — platform-specific rules
  - Code Review Agent loads BOTH on every PR
  - `project.json.platform` field (required) declares which platform applies
  - Platforms in scope at v1.5.4:
    - `shopify` / `shopify-plus` → `skills/shopify/`
    - `bigcommerce` → `skills/bigcommerce/` (scaffold)
    - `magento` / `adobe-commerce` → `skills/magento-adobe-commerce/` (scaffold)
    - `wordpress` / `woocommerce` → `skills/wordpress-woocommerce/` (scaffold)
  - Headless arm is separate (different structure, built later)
  - Node.js Custom App and SaaS arms are separate threads

Decisions follow K4 feedback loop. Updates here are batched at retros.

Last reviewed: 2026-05-28 by Claude (v1.5.4 — D-PLAT-01 added)
Next review due: After first non-Shopify platform pilot
