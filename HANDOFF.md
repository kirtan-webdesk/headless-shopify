# HANDOFF.md — Car Brite

> Read order at session start: `CLAUDE.md` → `sow-spec.md` → this file.
> Full narrative history through 2026-08-31 archived to `docs/session-handoffs/2026-08-31-car-brite.md` (this file exceeded its 200-line cap). Read the archive for the "why" behind any decision referenced here only in shorthand.

---

## Last session

- **Session ended:** 2026-09-01
- **Active milestone:** M2 (Hydrogen Setup) done, M3 (Custom Theme Dev) built — S2.1/S2.2/S3.1/S3.2 all in `qa`, awaiting QA lead (JT) sign-off. Formal PM Agent adherence check this session marked S2.2/S3.1/S3.2 **FAIL on design-fidelity ACs** (risk R12) — reopened for rework, not a pass.
- **Active gate:** G2 PASSED (Ajay Sir). G3 (Scaffold Verification) not yet opened. G0 still open in parallel (residual items, non-blocking). Project status: `development`. Building against **wds55** (confirmed intentional dev store) — **production store swap to real Car Brite store still required before G6**.
- **project.json:** version 27
- **Dev server:** `.claude/launch.json` (at `C:\Users\Admin\.claude\launch.json`, NOT in this repo) got a **new `car-brite-dev` entry** pointing at `D:/Projects/headless-shopify` on port 3010 (auto-ports to 3001 if busy). The pre-existing `hydrogen-dev` entry points at an **unrelated project** (`D:/Projects/Headless/shopify-headless`) — do not use it for this project, it was a red herring that nearly caused a false verification against the wrong app.

---

## Where we left off

User's formal review demanded to know *why* the build kept missing the mockup despite repeated "fix" rounds. Investigated properly this time instead of re-asserting completion:

**Root cause found:** `car_brite_home_page_design_details.md` / `car_brite_collection_page_design_details.md` are literal extraction checklists (~60 `[EXTRACT FROM HTML]` placeholders each) that were never actually resolved against the real mockup source — every prior "fix" round matched the mockup by eye/impression, not by literal value. Filed as a formal PM Agent adherence report: `docs/adherence-reports/sprint-S2.2-design-adherence.md` (risk R12).

**Did the actual extraction.** The mockup `.html` files aren't plain HTML — they're self-unpacking React apps (compressed manifest + template inflated client-side). Decompressed `PEARLS-Homepage.html` directly (see method below) to recover the real JSX/CSS source instead of reading a rendered screenshot. This also revealed the real `App()` composition: `TopBar → Hero → hero-edge → SystemRoutine → TrustBlock → Subscribe → Ugc → Faq → NewsAndFooter` — and that `Press`/`Steps`/`Products`/`KitBuilder` components exist in the source but are **not actually rendered** (would have been over-building to add them).

**Three literal-extraction fix passes on the homepage** (R13, R14 in project.json), landing on a critical lesson: **the first two passes were verified at the browser pane's default ~580-800px scaled width, where `clamp()`-based responsive type sits near its minimum and looks deceptively close even when the max value is wrong.** Re-testing at a true 1440px viewport in pass 3 surfaced real bugs the narrow-width testing had hidden — most importantly a **sitewide button-shape bug**: every CTA (`.hero-cta`, used everywhere) was a full pill (`border-radius:999px`, 11px/18px padding) when the literal mockup value is a barely-rounded rectangle (`5px`, 16px/24px padding). Also fixed: hero h1 clamp max (96px→112px, wrong line-height/letter-spacing too), pod card image aspect-ratio (1:1→4:5), pod card type sizes, pod bundle bar (complete rebuild — price was rendering at 17.6px vs literal 36px).

**How to redo the mockup decompression** (needed again for the Collection page, and for the PDP if a mockup ever arrives): the bundler HTML has `<script type="__bundler/manifest">` (JSON: asset-id → `{mime, compressed, data (base64)}`) and `<script type="__bundler/template">` (JSON string = the real HTML shell). The real page CSS is the file's 2nd `<style>` block. The real JSX is the asset referenced by the `<script type="text/babel" src="...">` tag in the template — gunzip its base64 `data` from the manifest. Full working extraction script was run inline this session (not saved to a file) — see conversation for the exact node one-liners if redoing this.

---

## Next tasks (queued)

1. ~~Collection page literal-extraction~~ **DONE 2026-09-01** (project.json v27). Same method as the homepage: 3 babel parts this time (tweaks-panel utility, shared `TopBar`/`NewsAndFooter` chrome, page-specific component). Confirmed `CollectionHeader style="band"` (navy gradient) is the live variant, not "image"/"split". Found and fixed a real hidden bug along the way: `.collection-page` had a page-wide `background:#eaf7f7` (old approximation) *plus* an explicit `.collection-page .collection-grid{background:transparent}` override that was silently defeating an otherwise-correct fix via CSS specificity — worth remembering as a category of bug (a correct rule can still lose to a more-specific stale one). Also confirmed `NewsAndFooter` is literally the same component on both pages, not a distinct smaller collection variant — extended homepage's `.home`-scoped newsletter/footer styling to also cover `.collection-page`.
2. **FAQ accordion** — confirmed still non-interactive (all answers render permanently open via computed style check `display:block`). Mockup has one-open-at-a-time collapse (`React.useState`-driven). Self-contained fix, no architecture question.
3. **Promo bar position** — confirmed still below the nav, not above it (mockup: promo bar is global chrome, sits above nav in `TopBar()`; current build: it's the homepage's Metaobject-driven `AnnouncementBar`, rendered inside `<main>`, which is architecturally *after* `<Header>` in `PageLayout.jsx`). Needs a decision, not a guess: make it global (query in `root.jsx` loader, pass to `Header`) or accept homepage-only and find another positioning approach. **Do not silently hardcode static copy here** — already tried once this session and reverted, because the existing Metaobject-driven copy is correct and duplicating it would be worse.
4. QA sign-off on S2.1/S2.2/S3.1/S3.2 from JT — blocked behind item 1-3 now that adherence officially FAILed.
5. Product Page mockup still doesn't exist (re-confirmed again).
6. Remaining G0 answers, production store swap before G6, S3.1 scope-hours reconciliation (R7).

---

## Client blockers (waiting on)

- Google Analytics tracking code, Shopify Admin/Storefront API credentials, GitHub repo access decision, Recharge account access. Owner: Internal PM (Ajay Sir).

---

## What NOT to do on resume

- **Do NOT verify visual fidelity at the browser pane's default width.** Use `resize_window` with an explicit `width:1440, height:900` (or similar real desktop size) — the default scaled pane width (~580-800px) hides real `clamp()` max-value bugs. This cost multiple rounds this session.
- **Do NOT trust a "done" claim (including your own from a prior round) without a fresh literal-value check.** Re-verify via `getComputedStyle` against the actual mockup source, not memory of what was fixed.
- **Do NOT use the `hydrogen-dev` launch.json entry** — it points at a different, unrelated project. Use `car-brite-dev`.
- The browser pane's visibility can toggle hidden mid-session (outside your control) — screenshots silently return stale blank frames while hidden. If a screenshot is suspiciously blank, verify with `getComputedStyle`/`elementFromPoint` before concluding something is broken.
- Do NOT follow `sow-spec.md`'s `cascading_skill_loads` literally — use `headless/SKILL.md` + `headless/projects/new-build/SKILL.md`, not the nonexistent `shopify/` arm.
- Do NOT treat `Design/` (top level) as the mockup root — files are one level deeper, under `Design/Design/`. The static JPGs (`Mockup/Pearls_HP.jpg`, `Mockups/Pearls_CP.jpg`) are useful for structure/copy, but the **interactive HTML's decompressed source is the literal-value authority** per `car_brite_home_page_design_details.md`'s own source-priority rules — HTML/CSS beats the JPG on appearance.
- Do NOT touch the client's existing live Dawn theme/storefront — this build is a second, independent storefront.
- Do NOT treat "The Routine" 5-step block as a homepage/collection-page section — it's a Shop-nav mega-menu.
- Do NOT read `.env` directly, ever — scripts read it internally, values never appear in chat.

---

Last touched: 2026-09-01
Touched by: Claude
