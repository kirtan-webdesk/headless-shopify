---
tier: 3
load_when: ["human-reference-only"]
description: "Template for the env-preflight.md artifact required by D-HL-ENV-01. Copied into the project record and completed per engagement. An engagement with no completed env-preflight.md has not started. Every check records pass/fail, the evidence, the date and who ran it; a failed check halts under D-QA-GATE-BLOCK semantics with exactly three legitimate responses."
applies_to: [headless]
decision_refs: [D-HL-ENV-01, D-HL-STACK-01, D-QA-GATE-BLOCK]
doc_type: template
last_reviewed: 2026-08-12
next_review_due: 2026-11-12
---

# Environment Preflight — `<CLIENT>` / `<ENGAGEMENT>`

> Copy to the project record. Complete before build. **An engagement with no completed `env-preflight.md` has not started.**
> Re-run and re-record at **G3**. A preflight from proposal time is not a verified environment.
> Rules and rationale: `knowledge/11-environment-preflight.md`. Figures: `pointers/verified-facts.md`.

| | |
|---|---|
| Architecture | `A / B / C / D` — and how it was decided: **DECLARED / DERIVED (gate n) / BLOCKED** |
| Engagement type | `1–6` |
| Run by | |
| Date | |
| Stage | `G0-G1 proposal` / `G3 scaffold re-run` |

---

## Universal checks 1–9

| # | Check | Pass / Fail | Evidence (a value, a command output, a URL — not "yes") |
|---|---|---|---|
| 1 | Node version from `engines`, not docs | | Resolved `node -v` = ; `engines` read from = |
| **1b** | **Cross-project Node resolution** — does this machine/CI serve more than one architecture? | | Architectures served = ; version satisfying all = ; or per-project management named = |
| 2 | Package manager and lockfile; CI installs from lockfile | | |
| 3 | Peer-pin resolution clean; pins recorded | | `react-router` = ; `@react-router/dev` = |
| 4 | Store access — real target store, required channel installed | | |
| 5 | **Live** Storefront API test query returns real data | | Query used = ; response summary = |
| 6 | Secret store confirmed; who can write to it | | Location = ; writers = |
| 7 | Environment matrix — dev / staging / production | | Each with its own store-or-mode, tokens, hosting target |
| 8 | Git + CI: install, build, dependency audit, **built-bundle secret scan** | | |
| 9 | Customer accounts decision recorded — **new vs legacy**, mutually exclusive | | Chosen = ; capability closed = |

---

## Architecture-specific

**Complete only the block for the declared architecture. Delete the rest.**

### A — Hydrogen + Oxygen

| # | Check | Pass / Fail | Evidence |
|---|---|---|---|
| A1 | **Hydrogen** channel installed (not Headless) | | |
| A2 | Plan is **not Agentic** | | Plan = |
| A3 | `hydrogen link` + `env pull` succeed | | |
| A4 | Bundle-size headroom baselined vs **10 MB** | | Scaffold build size = |
| A5 | Worker startup measured vs **400 ms** | | Measured = |
| A6 | Env-var count under **110** — **projected**, not current | | Projected = |

### B — Hydrogen + self-host

| # | Check | Pass / Fail | Evidence |
|---|---|---|---|
| **B1** | **Deploy spike on the actual target host — BEFORE SIGNATURE.** Builds *and serves* a real query. | | Host = ; date = ; query served = |
| B2 | **Headless** channel installed (not Hydrogen) | | |
| B3 | Oxygen-specific code removal enumerated | | Files = |
| B4 | Custom server context proven through `getLoadContext` | | Loader that read from it = |
| B5 | Host limits recorded — **the host's numbers, fetched** | | Env cap / size / cold start / timeout = |
| — | Runtime family: **worker** or **Node**? Dependency audit run against it | | |
| — | Caching layer designed, owned, priced | | Owner = |
| — | SOW carries the operational-responsibility line | | |

### C — Headless channel + Next.js *(SUPPORTED-ON-DEMAND — commercial hold)*

| # | Check | Pass / Fail | Evidence |
|---|---|---|---|
| C1 | **Headless** channel installed; tokens issued; **rotation procedure recorded** | | |
| C2 | Framework choice recorded | | |
| C3 | **Commerce-layer inventory** — cart, session, caching, analytics events, SEO routing | | |
| C4 | `@shopify/hydrogen-react` status **re-verified this project** | | Version = ; deprecated? = |
| C5 | Host limits recorded | | |

### D — BigCommerce Catalyst

| # | Check | Pass / Fail | Evidence |
|---|---|---|---|
| D1 | Node-capable host confirmed; BC channel configured | | Host = |
| D2 | **Caching layer designed if not on Vercel** | | Owner = |
| D3 | Deepest planned query vs **complexity 10,000 / depth 16** | | Measured = |
| D4 | Store REST quota recorded; **shared-quota blast radius understood** | | Plan = ; quota = |
| — | **Token class is Private** for all server-to-server | | |
| — | Private-token `expires_at` + named holder + rotation procedure | | |
| — | Node resolved against **`create-catalyst`**, not its dependency | | |

---

## Result

**Overall:** `PASS` / `HALT`

A failed check **halts**. Three legitimate responses, and only three:

1. **Fix it and re-run the check.**
2. **Change the architecture** — Mode 3. Surface the evidence. Never switch silently.
3. **Record the failure in the SOW** as an explicit exclusion, or a time-boxed risk **with a named owner**.

**"Proceed and deal with it later" is not on the list.**

| Failed check | Response taken (1/2/3) | Owner | Recorded where |
|---|---|---|---|
| | | | |

**Attached to SOW:** ☐   **Re-run scheduled at G3:** ☐
