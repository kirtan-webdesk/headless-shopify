# HANDOFF.md — Car Brite

> Read order at session start: `CLAUDE.md` → `sow-spec.md` → this file.
> Full narrative history through 2026-08-31 archived to `docs/session-handoffs/2026-08-31-car-brite.md` (this file exceeded its 200-line cap). Read the archive for the "why" behind any decision referenced here only in shorthand.

---

## Last session

- **Session ended:** 2026-09-01 (mid-session, archiving mid-flow)
- **Active milestone:** M2 (Hydrogen Setup) done, M3 (Custom Theme Dev) built — S2.1/S2.2/S3.1/S3.2 all in `qa`, awaiting QA lead (JT) sign-off
- **Active gate:** G2 PASSED (Ajay Sir). G3 (Scaffold Verification) not yet opened. G0 still open in parallel (residual items, non-blocking). Project status: `development`. Building against **wds55** (confirmed intentional dev store) — **production store swap to real Car Brite store still required before G6**.
- **project.json:** version 19

---

## Where we left off

User sent a formal, detailed re-review brief demanding mockup-fidelity (not dynamic data alone) as the acceptance bar, with an explicit gap-analysis-table + 8-section final-report format. In response, found and fixed one more major gap: **Header.jsx was still 100% generic scaffold** (plain shop name, wds55's own menu instead of the mockup's nav, text instead of icons) — fixed globally, now matches the reference. Verified Add to Cart works end-to-end (real click, drawer opens, badge updates), mobile responsive across hero/pod-system/subscription/collection grid. Fixed a real CRLF-parsing bug in 5 of the project's own setup scripts (tooling-only, never affected the live app). Used a corrected read-only Admin API script to definitively confirm the `homepage_content` Metaobject definition + entry are correctly configured (`PUBLIC_READ` access, all field values match live-rendered content exactly) — the only real gap is `hero_image` staying null because the Admin API token lacks `write_files` scope.

Full structured gap-analysis report (per the user's exact requested format) was delivered in that response — see conversation, not repeated here.

---

## Next 3 tasks (queued)

1. **QA sign-off** on S2.1/S2.2/S3.1/S3.2 from JT (QA lead) — all built and agent-verified, need the independent confirmation sprint rules require.
2. **Send the missing Product Page mockup**, if one exists — re-confirmed (again) that `Design/` only contains Homepage Design/ and Collection page Design/. PDP is styled consistently with the system but cannot be "matched" to a reference that was never provided.
3. Remaining G0 answers (credentials handoff channel, app versions, third-party integrations, logo SVG), production store swap before G6, S3.1's scope-expansion hours reconciliation (risk R7).

**2026-09-01: both previously-open build gaps closed.** User confirmed `write_files` Admin API scope was granted — ran `scripts/upload-hero-image.mjs` (already existed, was blocked), hero photo is now genuinely Metaobject-driven (verified `cdn.shopify.com` URL in browser, not the static fallback). Built the Shop-nav mega-menu for real (`Header.jsx` `ShopMegaMenuItem`, CSS `:hover`/`:focus-within`, no JS state) — found and fixed a real positioning bug during verification (centered layout clipped off-screen near the header's left edge; changed to left-aligned). `project.json` at version 21.

**Then: "homepage is ~70%, want 100%."** Re-opened `Pearls_HP.jpg` at full resolution and compared section-by-section against the live render (not memory). Found and fixed 4 real gaps: pod cards all used one uniform gradient instead of 5 distinct per-product colors; pod-system stats dropped the bold number prefix (7/0/pH/75yr), showing only description text; testimonial social cards had no photos despite the assets already being copied into `public/images/`; newsletter's first stat was mis-structured (`Free pod`/`First order` instead of `1`/`Free pod, first order`, fixed in all 3 places it's duplicated). Also investigated a screenshot that looked broken (empty hero) via `currentSrc`/`getBoundingClientRect` rather than assuming — confirmed it was a stale browser-pane frame, not a real defect. `project.json` at version 22.

---

## Client blockers (waiting on)

- Google Analytics tracking code, Shopify Admin/Storefront API credentials, GitHub repo access decision, Recharge account access. Owner: Internal PM (Ajay Sir).

---

## What NOT to do on resume

- Do NOT follow `sow-spec.md`'s `cascading_skill_loads` literally — use `headless/SKILL.md` + `headless/projects/new-build/SKILL.md`, not the nonexistent `shopify/` arm.
- Do NOT treat `Design/` (top level) as the mockup root — files are one level deeper, under `Design/Design/`. Static pixel mockups (`Mockup/Pearls_HP.jpg`, `Mockups/Pearls_CP.jpg`) are the primary visual contract — check those, not just the interactive HTML.
- Do NOT touch the client's existing live Dawn theme/storefront — this build is a second, independent storefront.
- Do NOT treat "The Routine" 5-step block as a homepage/collection-page section — it's a Shop-nav mega-menu.
- Do NOT read `.env` directly, ever — scripts read it internally, values never appear in chat.

---

Last touched: 2026-09-01
Touched by: Claude
