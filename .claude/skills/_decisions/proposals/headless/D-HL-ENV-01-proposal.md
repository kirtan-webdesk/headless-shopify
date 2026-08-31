---
proposal_id: D-HL-ENV-01
revision: 2
status: RATIFIED
proposed_by: Headless skill-dev window (Claude)
proposed_date: 2026-08-05
revised_date: 2026-08-06
revision_reason: "Rebuilt after working-directory loss. Architecture B preflight now reflects CONFIRMED pipeline status — the deploy spike is a pre-signature gate, not a nice-to-have."
rebuild_note: "Rebuilt 2026-08-06 from this window's own record. Structure and rules are faithful; exact rev 1 wording is not guaranteed."
ratified_by: master (v1.11.17)
related: D-HL-STACK-01, D-HL-SEC-01, D-HL-DISCOVERY-01
applies_to: [headless]
severity: high
---

# D-HL-ENV-01 (PROPOSED, rev 2) — Environment Preflight

## Master reconciliation (v1.11.17)

**Status:** RATIFIED by master 2026-08-07 in v1.11.17. Below-line rulings:

- **Preflight failure semantics (§ OQ):** ~~open~~ **RULED v1.11.17 = D-QA-GATE-BLOCK semantics.** Failed preflight halts; does not become a backlog ticket.
- **20 check IDs (A1-A6, B1-B5, C1-C5, D1-D4)** authoritative in body. v1.11.19 KB fold renumbered these; restored v1.11.20.
- **Halt response 3** (record failure as explicit exclusion or time-boxed risk with named owner): authoritative in body. Dropped in v1.11.19 KB fold; restored v1.11.20.
- **Check 1b — cross-project Node resolution — ADDED v1.11.28.** Additive per D-KB-FIDELITY-01; no renumbering. Where the same workstation / container / CI runner serves more than one headless architecture, the resolved Node version must satisfy every architecture it builds; read `engines` from each scaffolder actually invoked (not the framework it depends on — the two can disagree, and on BigCommerce the scaffolder is stricter); record in the environment matrix (check 7); name per-project version management at preflight where no single version satisfies all. Current numbers illustrative and dated (verified-facts §12a + §13). Body below predates this amendment; the inventory D-HL-ENV-01 entry carries the ratified 1b text.

Precedence per D-KB-FIDELITY-01 v1.11.21 amendment: **inventory authoritative for status; this proposal authoritative for detail.**

---

> **Status: PROPOSED — awaiting master ratification.**

---

## Decision (one line)

No headless build starts until a **preflight** has been run and recorded. A failed preflight **halts** — it does not become a backlog ticket.

---

## Why

Every hour spent on a preflight check is an hour that would otherwise be spent on the same problem in sprint 2, with a signed SOW and a date. The checks below each correspond to a real, documented failure mode, not a hypothetical.

The clearest justification is check 1. Shopify's own getting-started page says **"Node.js v16.20+"**. The actual CLI package declares `engines: { node: '^22 || ^24' }`. Node 16 went end-of-life in September 2023. Following the documentation gets you an environment that cannot install the toolchain. (Verification register §4b.)

---

## Checks that apply to every architecture

| # | Check | Pass condition | Failure consequence |
|---|---|---|---|
| 1 | **Node version from `engines`, not from docs** | `node -v` satisfies the `engines` field of the *pinned* CLI and framework packages | Toolchain will not install |
| 2 | **Package manager and lockfile** | One package manager agreed; lockfile committed; CI installs from lockfile | Non-reproducible builds |
| 3 | **Dependency peer-pin resolution** | Install completes with no unresolved peer conflicts; peer pins recorded (e.g. react-router `~7.16.0`) | Runtime errors that look like app bugs |
| 4 | **Store access** | Credentials for the actual target store, with the required channel installed | Blocked on day 1 waiting for client access |
| 5 | **Live Storefront API test query** | A real query returns real data from the real store — not a fixture, not a demo store | Token/channel/scope errors discovered mid-build |
| 6 | **Secret store confirmed** | Named location for every secret in `D-HL-SEC-01` §1, with who can write to it | Secrets end up in a repo or a Slack message |
| 7 | **Environment matrix** | dev / staging / production named, each with its own store or store mode, its own tokens, and its own hosting target | Staging pointed at production data |
| 8 | **Git and CI** | Repo exists, branch policy agreed, CI runs install + build + dependency audit | Ship gate cannot be enforced |
| 9 | **Customer accounts decision recorded** | New (Customer Account API) vs legacy (Multipass) chosen and recorded — they are mutually exclusive | Auth re-architecture mid-build |

---

## Architecture A — Hydrogen + Oxygen

| # | Check | Pass condition |
|---|---|---|
| A1 | **Hydrogen channel installed** (not Headless channel) | Confirmed in admin |
| A2 | **Plan is not Agentic** | Oxygen "isn't available on Agentic plans" (register §2) |
| A3 | **`npx shopify hydrogen link` + `env pull` succeed** | Environment variables pull down cleanly |
| A4 | **Bundle-size headroom baselined** | Scaffold build measured against the **10 MB** worker cap; a scaffold already near the cap is a design constraint, not a footnote |
| A5 | **Worker startup measured** | Against the **400 ms** limit |
| A6 | **Env-var count under 110** | Projected count, not current count |

## Architecture B — Hydrogen + self-host  *(pipeline status: CONFIRMED — treat B1 as a pre-signature gate)*

| # | Check | Pass condition |
|---|---|---|
| B1 | **Deploy spike on the actual target host, before signature** | A scaffold Hydrogen app builds *and serves* on the chosen host. **This is the gate.** Shopify's self-hosting guide carries the warning *"This guide might not be compatible with features introduced in Hydrogen version 2025-05 and above"* while current Hydrogen is 2026.4.4 — the instructions are documented as potentially a year stale. Nobody signs a fixed price against them without proving the path first. |
| B2 | **Headless channel installed** (not Hydrogen channel) | Confirmed in admin |
| B3 | **Oxygen-specific code removal enumerated** | The guide's *"Remove Oxygen-specific packages and code"* turned into a concrete file list: `server.js`, `react-router.config.ts`, `vite.config.ts`, possibly `app/entry.server.tsx` |
| B4 | **Custom server context proven** | Server entry creates a Hydrogen context and passes it through `getLoadContext` |
| B5 | **Host limits recorded** | Env-var cap, bundle/function size cap, cold-start behaviour, request timeout — the host's numbers, fetched, not assumed |

## Architecture C — Headless channel + Next.js

| # | Check | Pass condition |
|---|---|---|
| C1 | **Headless channel installed**, tokens issued, rotation procedure recorded | Confirmed |
| C2 | **Framework choice recorded and justified** | Open question 1 in `D-HL-STACK-01` — C's framework is not yet ratified |
| C3 | **Commerce-layer inventory** | Everything Hydrogen provides for free that must now be built or sourced: cart, session, caching, analytics events, SEO routing. Enumerated *before* estimating. |
| C4 | **`@shopify/hydrogen-react` status verified** | `TODO-VERIFY` in the register — load-bearing for C, must be resolved before C is priced |
| C5 | **Host limits recorded** | As B5 |

## Architecture D — BigCommerce Catalyst

| # | Check | Pass condition |
|---|---|---|
| D1 | **Node-capable host confirmed** | Catalyst *"can be deployed to any hosting provider that supports Node.js"* — confirm which |
| D2 | **Caching layer designed if not on Vercel** | On Vercel, Runtime Cache is automatic with no external KV setup. Off Vercel, the cache is designed and owned. Not free. |
| D3 | **GraphQL Storefront API rate limits verified** | `TODO-VERIFY` in the register. This is the governing limit for D and it is currently unknown. |
| D4 | **Store quota sharing understood** | All apps share the store quota (register §9) — feeds `D-HL-SEC-01` §7 |

---

## Halt behaviour

A failed check **stops the engagement at that point**. The three legitimate responses:

1. Fix it and re-run the check.
2. Change the architecture (`D-HL-STACK-01` mode 3 — surface the evidence, never switch silently).
3. Record the failure in the SOW as an explicit exclusion or a time-boxed risk with a named owner.

"Proceed and deal with it later" is not on the list.

---

## Artifact

Preflight produces `env-preflight.md` in the project record: every check, pass/fail, the evidence, the date, and who ran it. It is attached to the SOW. An engagement with no `env-preflight.md` has not started.

---

## Anti-patterns

1. Reading a Node version off a documentation page instead of the package's `engines` field.
2. Testing against a demo store and discovering the real store's plan or channel differs.
3. Installing the Hydrogen channel for a self-hosted build, or the Headless channel for an Oxygen build.
4. Signing a fixed-price architecture B engagement with no deploy spike on the actual host.
5. Measuring bundle size for the first time at launch, against a 10 MB hard cap.
6. Pointing staging at production data because "it's only staging."
7. Estimating architecture C without enumerating what Hydrogen would have provided for free.
8. Pricing architecture D without the GraphQL Storefront rate limits.
9. Assuming an off-Vercel Catalyst deployment gets caching for free.
10. Leaving the new-vs-legacy customer accounts decision open past preflight.
11. Recording a preflight failure as a backlog ticket and starting the build anyway.

---

## Ask to master

Ratify D-HL-ENV-01 rev 2 and confirm that preflight failure carries `D-QA-GATE-BLOCK` semantics.

---

Last reviewed: 2026-08-06
Next review due: 2026-11-06
