---
tier: 1
load_when: ["platform-headless", "headless-platform-active", "code-production", "agent-code-review", "g1-plan-stage", "g4-sprint-qa", "g6-prelaunch-stage"]
description: "Performance budgets for the Headless arm. The Oxygen hard ceilings that fail a deploy rather than slow a page, per-architecture budget ownership, the JS-weight and third-party-script budgets, image and font policy, rendering-strategy consequences, and what is measured at which gate. The budget is a SOW line, not an aspiration — an unbudgeted third-party script list is an unbounded commitment."
applies_to: [headless]
decision_refs: [D-HL-ENV-01, D-HL-STACK-01, D-HL-APPS-01, D-HL-SEC-01, D-KB-FIDELITY-01]
last_reviewed: 2026-08-06
next_review_due: 2026-11-06
---

# 04 — Performance Budget (Headless)

> Two kinds of number live here and they are not the same kind of thing.
>
> **Hard ceilings** fail a deploy or kill a request. You do not negotiate with them.
> **Budgets** are choices we make and hold ourselves to.
>
> Every figure traces to `pointers/verified-facts.md` (`HEADLESS-HALLUCINATION-01`).

---

## 1. Hard ceilings — architecture A (Oxygen)

Verified, register §1. These are **not** performance targets. Exceeding them is a failure, not a slow page.

| Constraint | Limit | What happens |
|---|---|---|
| Worker bundle | **10 MB or less** | **Deploy fails.** |
| Worker startup | **400 ms or less** | Worker rejected |
| CPU per request | **30 s** | Request killed |
| Memory | **128 MB** | Request killed |
| Custom env vars | **110** | Configuration rejected |
| Outbound request completion | within **2 min** | Request killed |

Static assets are separate from the worker bundle: images 20 MB, video 1 GB, 3D models 500 MB, other files 20 MB.

**The 10 MB figure is the source of a specific confusion worth killing on sight.** It is not "the theme zip limit" — there is no theme and no zip. It is the compiled worker bundle, and the correct framing is: *"if your Oxygen worker bundle exceeds 10 MB, your Hydrogen deployment fails."*

**Oxygen is `workerd`, not Node.** Anything assuming Node built-ins, a filesystem, long-lived processes or background timers is disqualified before it is written — and a dependency that drags one in disqualifies architecture A entirely (derivation gate 4 → B or C).

**Measure the scaffold, not the finished app** (`D-HL-ENV-01` A4). A scaffold already near the cap is a design constraint you plan around, not a footnote you discover at launch.

---

## 2. Who owns the ceiling — per architecture

| | Ceilings come from | Caching layer |
|---|---|---|
| **A** | Oxygen, above. Documented and fixed. | Oxygen / Hydrogen caching strategies |
| **B** | **The host.** Vercel, Netlify, Fly, Cloudflare Workers — each different. Fetched at preflight (`D-HL-ENV-01` B5), never assumed. | **None by default.** Designed, owned, priced. |
| **C** | The host, as B. | **None by default.** |
| **D** | The host. Node-capable, so fewer runtime exclusions than `workerd`. | Vercel Runtime Cache **on Vercel**; **nothing off it.** |

**A is the most constrained of the four, and that is why it is the reference architecture** — the constraints are documented, so they are checkable. B, C and D are less constrained and *less knowable*, which is the harder problem.

`HL-CACHE-003`: a plan that assumes edge caching, image optimization or ISR the chosen host does not supply is a pricing defect. **Unnamed means absent. Absent means unpriced.**

---

## 3. The budgets we set

Set per engagement at G1, recorded in the project record, measured at G4 and G6. Numbers below are the starting position, not a house constant — a content-heavy B2B catalogue and a single-product DTC launch do not share a budget.

| Budget | Starting position | Notes |
|---|---|---|
| JS shipped to the browser, initial route | Set a number and hold it | The single biggest lever in a headless build, and the one that silently regresses |
| Third-party scripts | **Enumerated in the SOW** | See §4 — this is a commercial control, not a technical one |
| Image weight per viewport | Set per template | Responsive sources and modern formats are the default, not an optimization pass |
| Web fonts | Subset, preloaded, bounded in count | A late brand-font addition is a budget change, not a styling tweak |
| Server response time per route | Set per route type | Dominated by the data layer — see `06-data-layer-patterns.md` §5 |

**A budget with no owner and no measurement point is an aspiration.** Each line gets both.

---

## 4. Third-party scripts — the commercial control

This is the item that turns a fixed price into a loss, so it is stated commercially rather than technically.

**Every third-party script is:**

- weight in the browser, on every page it loads on;
- an explicit **CSP allowance** (`05-security-baseline.md` §4);
- a **supply-chain entry** running with the same privileges as our code;
- an app-classification row with a bucket and evidence (`D-HL-APPS-01`);
- and, if it sits in the render path, an **availability decision** — question 5.

**The script list belongs in the SOW.** *"Marketing will send over a few tags"* is an open-ended commitment that gets discovered at launch, when there is no room left in the budget or the schedule.

In a theme these arrived free via ScriptTag and app embeds, which is exactly why clients do not expect to pay for them. **In headless every one is your code, your weight and your risk.** Say so during discovery, not during UAT.

---

## 5. Rendering strategy has a performance consequence

Every route carries a declared rendering strategy **and** cache behaviour before build (`HL-CACHE-002`). A starter-template default is not a declaration.

- **Static or revalidated** where content permits — fastest, and the revalidation window needs a purge path (`HL-ISR-001`) and a stated staleness tolerance (`HL-ISR-002`).
- **Server-rendered per request** where content is personalized. Then the data layer *is* the performance profile.
- **Client-fetched** only for genuinely interactive, non-critical surfaces.

The waterfall in `06-data-layer-patterns.md` §5 is the most common cause of a slow route in this arm — not payload size. Serialised queries that had no reason to be sequential cost more than any image you can compress.

---

## 6. Measurement points

| Gate | What is measured |
|---|---|
| **G1 / plan** | Budgets set and recorded. Host ceilings fetched (B/C/D). Bundle projected against 10 MB (A). |
| **G3 / scaffold** | Scaffold measured against the ceilings — before feature work, while the answer can still change the design. |
| **G4 / build** | Budgets measured per route. A regression is a defect, not a backlog item. |
| **G6 / release** | Ceilings confirmed. A bundle over 10 MB does not reach release — it fails deploy. |

Measure on the **target host**, not a developer laptop. For B this is part of what the B1 deploy spike exists to establish.

---

## Anti-patterns

1. Calling the Oxygen 10 MB worker cap a "theme zip limit." There is no theme and no zip.
2. Treating a hard ceiling as a performance target to optimize toward later. It fails the deploy.
3. Measuring bundle size for the first time at launch, against a cap that fails the deploy.
4. Assuming B, C or D-off-Vercel inherit Oxygen's caching layer.
5. Quoting a host's limits from memory instead of fetching them at preflight.
6. Accepting an open-ended third-party script list into scope, then absorbing the CSP, weight and availability work.
7. Adding a script because "it's just a tag" — it is weight, a CSP allowance, a supply-chain entry, a classification row and an availability decision.
8. Setting a budget with no owner and no measurement point.
9. Copying budget numbers between engagements with different catalogues, traffic and templates.
10. Shipping a route with a rendering strategy declared and its cache behaviour left to a framework default.
11. Optimizing images while the route serialises four independent queries.
12. Adding a brand web font late and treating it as a styling change rather than a budget change.
13. Measuring on a developer laptop and reporting it as the target host's performance.
14. Letting a G4 budget regression become a backlog ticket.

---

Last reviewed: 2026-08-06
Next review due: 2026-11-06
