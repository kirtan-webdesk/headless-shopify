# HANDOFF.md — Car Brite

> Read order at session start: `CLAUDE.md` → `sow-spec.md` → this file.

---

## Last session

- **Session ended:** 2026-08-31 (initial bootstrap)
- **Session ID:** n/a
- **Last active agent:** none yet — no agent session has run against this project
- **Active milestone:** M2 (Hydrogen Setup) — active, S2.1 `done`, S2.2 in `qa`
- **Active sprint:** S2.2 (Metaobject-driven homepage) — built and verified in-browser, awaiting QA lead (JT) sign-off before `done`
- **Active gate:** G2 PASSED (2026-08-31T13:45:00Z, Ajay Sir). G3 (Scaffold Verification) not yet opened — needs S2.1/S2.2 QA sign-off. G0 still open in parallel (residual items, non-blocking). Project status: `development`. Building against **wds55** (confirmed intentional dev store) — **production store swap to real Car Brite store still needed before G6** (tracked in `sow.gaps`).

---

## Where we left off

Project formally started this session. Ran orchestrator Step 0 preflight (`check-env.sh --platform headless`): Node.js v20.18.0 FAILs the v22+ requirement — overridden (logged in audit_log) to let G0 document work proceed, but flagged as a hard blocker before G3 scaffold. Created `project.json` at project root (id `864761f5-3fb1-4721-9c43-6632fc4b19cf`), validated against `_contracts/project-json.schema.json` (passes). PM Agent Step 0 ingested `sow-spec.md`: all validation checks passed except `validation.status` being `passed_with_logged_deviations` rather than a literal `passed` (soft-fail, not blocking — 5 rewrites all have sales-confirmed audit trail). Computed SOW completeness score = 83/100 (weighted formula, clears the 60 threshold) — but the separate hard G0 gate (`13-g0-intake-gate.md`) needs its own 8-question abbreviated intake answered before G0 can close. Batched those 8 questions and posted them (see `CLAUDE.md` "G0 batched clarification"). Next action: wait for Internal PM (Ajay Sir) answers, then re-run G0 close check; separately, someone needs to upgrade Node to v22+ before G3.

---

## Files pushed this session

None committed to git yet.

---

## Files pending push

- `CLAUDE.md` — bootstrap + gate state updates
- `HANDOFF.md` — this file
- `project.json` — new, project state file (schema-validated)

---

## Next 3 tasks (queued)

1. **QA sign-off on S2.1 + S2.2** from JT (QA lead) — both built and self/agent-verified, but need the independent confirmation the sprint rules require before `done`.
2. **Build S3.1 (PLP) + S3.2 (PDP)** — same pattern as S2.2: verify against wds55 in a real browser, not just by reading code.
3. Get the remaining G0 answers: credentials handoff channel, app versions/plan tiers, third-party integrations beyond GA/GTM/Recharge, confirm whether a dedicated logo SVG exists. Also: **production store swap** (wds55 → real Car Brite store) needs to happen before G6 — don't let this get forgotten at launch.

**This session:** GitHub repo URL received. Ran G1 milestone/sprint decomposition (5 milestones, 12 sprints) — pattern-based estimate came back 5.4-9.7x the signed 45h (242-438h vs 45h). Presented the HALT/renegotiation surface. **Internal PM (Ajay Sir): Option D, ACCEPT TIGHT — CONFIRM.** G1 passed, stage advanced to `design`, architecture A confirmed. Sprint hours then rebased to the exact 45h SOW breakdown (not pattern-based, not the 54h Bifurcation table).

**Then a correction came in:** the 45h figure itself was a mistake — 54h is correct (the previously-dismissed "Hours Bifurcation" table). Updated BOTH `sow-spec.md` (total_hours→54, cost→$2,160, Rewrite 6 added, Rewrite 3 marked superseded not deleted, Module 6 "Unallocated buffer" row added) and `project.json` (`estimates.total_hours`→54, `unallocated_hours`:9, budget updated, `risks[R3]` reopened+corrected, `risks[R3b]` added). **The 9h gap between 54 and the 45h sprint breakdown is intentionally NOT allocated** — user chose to specify the line items later rather than have me guess. `project.json` now at version 4.

**Both open items from last entry are now resolved:**
1. **9h buffer purpose defined** — it's a client feedback buffer (not unallocated), reserved for post-feedback revision rounds across sprints, tracked via `budget.hours_burned`. `sow-spec.md` Module 6 + `project.json` risks/estimates updated.
2. **G2 mockup decision made: reference-only.** Before accepting it, actually served both HTML files locally and opened them in a real browser to verify — they're self-extracting bundler exports (13.4MB/8.3MB) that DO work: clean render, zero console errors on desktop. Found a real mobile (375px) bug — nav doesn't collapse to hamburger, announcement bar wraps 3 lines — flagged for Frontend Agent in `project.json.design.reference_verification`, not silently ignored.

**G2-car-brite gate is OPEN, not passed.** The scope-approach decision is made (deviating from the standard 30-60h Designer Agent Path 4 process, documented in `design.path_deviation` since that alone exceeds the 45h build budget) — Frontend Agent can start non-visual work (S2.1 environment setup), but formal Design lead + Client sign-off (via Internal PM) per `gate-format.md` hasn't happened. Don't start S2.2/S3.1/S3.2 (visually-driven sprints) until that lands. `project.json` now at version 5.

**2026-08-31, later:** dev team reports S2.1 (environment setup) already done on their side. Set to `qa` status (not `done` — needs QA lead confirmation, not self-reported completion, per sprint-rules.md's approver-≠-doer rule), specifically flagging Node v22+ for re-confirmation since it hard-FAILed the Step 0 preflight earlier this session. User then said "Start G2" — presented the formal G2 gate block per gate-format.md for an explicit decision. `project.json` at version 6.

**2026-08-31, final this session: G2 CONFIRMED by Ajay Sir.** Design frozen (reference-only). `gates[G2-car-brite]` → passed, `design.approved_by`/`approved_at` set, project stage advanced `design` → `development`. S2.2 (Metaobject homepage), S3.1 (PLP), S3.2 (PDP) are now unblocked for build. `project.json` at version 7.

**Then S2.1 was actually built, not just claimed.** User said environment setup + .env were done; verification found otherwise (no scaffold in repo, Node still v20). Real scaffold created via `@shopify/cli-hydrogen` (careful process — first attempt's `--force` flag nearly `rmdir`'d the whole repo, caught by a lucky Windows file lock, redone safely via an isolated temp dir + manual file merge). Fixed a real `.gitignore` gap (was empty/misnamed, node_modules+.env unprotected). Hit and root-caused a real build failure (rolldown needs Node >=22.12.0, workstation had exactly 22.0.0) — clean reinstall fixed it, **build now genuinely succeeds**: `dist/server/index.js` 409.7kB vs the 10MB Oxygen cap. S2.1 marked `done`. `project.json` at version 12.

**Then dev server confirmed connected to the wrong store.** Live data loaded fine, but the store was branded "wds55" with generic Shopify demo products (Collection Snowboard etc), not Car Brite. Halted before building anything against it, asked the user in plain language. **Confirmed: wds55 is an intentional WebDesk dev/test store** — build against it now, swap to the real Car Brite store before G6 (tracked in `sow.gaps` as `production_store_swap`). Risk R6 resolved.

**Then S2.2 (Metaobject-driven homepage) was actually built end-to-end, not stubbed:**
- User added `ADMIN_API_TOKEN` to `.env`. Verified the exact Admin API mutation shape via Shopify's own docs (not from memory) before calling it.
- Created the `homepage_content` Metaobject definition + a `main-homepage` entry, live on wds55, via credential-blind scripts in `scripts/` — they read `.env` at runtime; values never appeared in this session, only key names and success/failure output.
- Caught that the definition's default Storefront API access was `NONE` — would have silently rendered nothing — fixed to `PUBLIC_READ`.
- Rebuilt `app/routes/_index.jsx` (announcement bar + hero, reading live from the Metaobject, with an explicit "not configured" fallback instead of a blank page if the entry is ever missing) and `app/styles/app.css` (brand tokens, Halogen `@font-face`, hero/announcement styles) to match the G2-approved reference.
- Verified in a real browser, not just by reading the code: desktop render matches the approved design, zero new console errors (one pre-existing scaffold warning about Customer Privacy/consent setup, unrelated, logged as a new gap), mobile 375px is responsive and the nav actually collapses properly — did NOT replicate the reference HTML's known mobile bug.

S2.1 → `done`, S2.2 → `qa` (built and verified, but not self-marked `done` — needs QA lead JT per the approver-≠-doer rule). `project.json` at version 13.

**Then S3.1 (Collection page):** user chose "build everything in the reference" (not just core PLP) + keep the reference's non-Shopify "Buy on Amazon" link as a static placeholder. Logged as a scope expansion beyond the SOW's 2h line item (risk R7), not silently absorbed. Read the reference HTML's live DOM (not a screenshot) to extract the real structure per the design doc's explicit contract. Built both `collections.$handle.jsx` (real named collections) and `collections.all.jsx` (the actual route the reference maps to — different query, no `collection` object). Hit and fixed a real 500 error during verification: the top-level `products` query doesn't support `filters` at all (only a `query` search string) — caught live, not shipped broken. Also fixed a `CREATED`/`CREATED_AT` enum mismatch and a nonexistent `product.badge` field before shipping. Verified against real wds55 product data — grid renders, filter/sort persist via URL params, empty state confirmed. S3.1 → `qa`. `project.json` at version 15.

**S3.2 (PDP) built and verified.** No design-contract doc for PDP (unlike collection), so styled to match established brand tokens rather than extracting a pixel reference — kept closer to the 3h budget line since there was no "build everything" instruction here. Added: `quantityAvailable`-based inventory status, deferred Related Products section (reuses `CollectionProductCard`, excludes current product), and a Recharge-style subscription block that only renders when `sellingPlanAllocations` actually has entries (confirmed empty/hidden on the test product, not faked). Verified in browser against a real wds55 product — image, price, stock status, Add to cart, related products all working, desktop + mobile. Removed old orphaned `.product`/`.product-main` CSS instead of leaving it dead. S3.2 → `qa`. `project.json` at version 16.

**M2 + M3 core build work is now largely complete, pending QA sign-off across S2.1/S2.2/S3.1/S3.2.** Given S3.1's scope expansion (risk R7), actual hours burned should be reconciled against the 45h + 9h feedback buffer soon rather than left for later.

**Then: "the design is not proper, recheck and fix it."** Didn't guess at what was wrong — re-served the reference HTML and pulled exact `getComputedStyle()` values (fonts, gradients, radii) from its live DOM, compared numerically against the build. Found and fixed real, verifiable gaps:
- Header was scaffold-default white; reference is translucent navy blending into the hero — fixed globally.
- Hero gradient was an oversimplified 2-stop approximation; replaced with the real 3-layer gradient.
- Hero had no photo at all; reference is two-column with a 543×680 rounded photo — added it (temporarily a static asset, see below).
- Body font was never wired up (only headings had Halogen) — added Manrope.
- Manrope then silently failed to load even with the link added — root cause was Hydrogen's default CSP blocking `fonts.googleapis.com` with no visible console error. Found it by checking network requests (zero Google Fonts requests) before guessing. Fixed in `entry.server.jsx`.
- Buttons were 4px radius; reference is a full 999px pill.
- H1 was capped at 72px; reference measures 96px.

**One thing NOT fully fixed:** the hero photo should be a Metaobject field (`hero_image`) for true no-deploy editability, matching S2.2's own acceptance bar. Wrote `scripts/upload-hero-image.mjs` to do that via Admin API — but the token lacks `write_files` scope, so it's blocked. Using a static asset fallback in the meantime, clearly commented as temporary in the code. Logged as `risks[R8]`.

`project.json` at version 17.

**Open items:** Admin API token (4 scopes verified against shopify.dev, given to user, not yet added to `.env`) still needed for the Metaobject definition — S2.2 can't fully complete without it. Dev server hasn't been run against the real store yet (D-HL-ENV-01 check 5, live query) — scaffold currently defaults to mock-shop data since that's how init was run; real store env vars are already in `.env` and should work once `npm run dev` is tried.

**Then: user said ".env details added, proceed straight into S2.2 build." Checked directly instead of trusting the self-report — contradicted on 2 of 3 counts:**
- Node: still v20.18.0 (not v22+)
- No Hydrogen scaffold anywhere in the repo (no package.json, no app dir)
- `.env` IS present (correctly not read — credentials rule respected)
- git log: 1 commit ("gitignore"), everything else untracked

S2.1 flipped `qa` → `blocked`. Did NOT proceed to write S2.2 homepage code against a scaffold that doesn't exist. `project.json` now at version 8. Waiting on user: is the real scaffold elsewhere and needs pulling into this repo, or does S2.1 need to actually run now (Node upgrade first)?

After these 3, see `CLAUDE.md` "Active tasks (this sprint)".

---

## Client blockers (waiting on)

- [2026-08-31] — Google Analytics tracking code, Shopify Admin/Storefront API credentials, GitHub repo access decision, Recharge account access. Owner: Internal PM (Ajay Sir). Target unblock: before G0 can close.

---

## Open failure modes captured this session

- `sow-spec.md` frontmatter (`platform`, `cascading_skill_loads`) references a `shopify/` arm that isn't installed in this project and doesn't match the headless scope described in the SOW body. Worth feeding back to whoever owns sow-builder — this looks like a platform-tagging bug in the generator, not a one-off.
- No `CLAUDE.md`/`HANDOFF.md`/`project.json` existed despite `sow-spec.md` already being generated — suggests the sow-builder → PM Agent handoff step (project bootstrap) was skipped for this project.

---

## Decisions made this session

- [2026-08-31] Project treated as `headless` arm / Architecture A (Hydrogen+Oxygen) for all skill loading, overriding `sow-spec.md`'s `platform: shopify` tag. `sow-spec.md` itself left unedited per user decision — this is recorded here and in `CLAUDE.md` instead.
- [2026-08-31] Node v22+ environment FAIL overridden to let G0 intake (non-code) proceed. Logged as `env_check_override` in `project.json.audit_log` with reason + approver.
- [2026-08-31] `project.json.project.platform` set to `shopify` and `project_type` to `new-development` for strict schema compliance (schema has no `headless`/`new-build` enum values). Actual engagement type recorded in a custom `project._headless_arm_notes` block instead. Worth flagging upstream as a schema gap.
- [2026-08-31T12:30:00Z] **G1-car-brite CONFIRMED by Ajay Sir (Internal PM) — Option D, ACCEPT TIGHT.** Proceeding on the signed 45h/$1,800 despite a pattern-based estimate of 242-438h (5.4x-9.7x). Not renegotiated. Architecture A (Hydrogen+Oxygen) formally confirmed alongside this decision (DERIVED mode, D-HL-STACK-01). Project stage advanced to `design`.

---

## What NOT to do on resume

- Do NOT follow `sow-spec.md`'s `cascading_skill_loads` literally — `shopify/SKILL.md` and `shopify/projects/new-build/SKILL.md` do not exist in this repo. Use `headless/SKILL.md` + `headless/projects/new-build/SKILL.md` instead (see `CLAUDE.md` "Required skill files").
- Do NOT treat `Design/` (top level) as the mockup root — actual files are one level deeper, under `Design/Design/`.
- Do NOT touch the client's existing live Dawn theme/storefront — this build is a second, independent storefront (explicit out-of-scope item in `sow-spec.md`).

---

## Notes for next session

- No architecture confirmation call has happened yet — Architecture A (Hydrogen+Oxygen) is inferred from the SOW body (Module 2 line items name Hydrogen/Oxygen explicitly), not yet a signed DECLARED/DERIVED decision per `D-HL-STACK-01`. Confirm formally at G1.

---

Last touched: 2026-08-31
Touched by: Claude (bootstrap during skill-set audit)
