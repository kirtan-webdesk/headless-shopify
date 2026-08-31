---
tier: 1
load_when: ["platform-headless", "headless-platform-active", "g0-intake-stage", "g1-plan-stage", "g3-scaffold-stage", "code-production"]
description: "Environment preflight per D-HL-ENV-01. Nine universal checks (1-9) plus check 1b (cross-project Node resolution, added v1.11.28) plus per-architecture checks A1-A6, B1-B5, C1-C5, D1-D4, using the ratified check IDs. Produces env-preflight.md, attached to the SOW; an engagement with no env-preflight.md has not started. Failure halts under D-QA-GATE-BLOCK semantics with exactly three legitimate responses. Check B1 — the deploy spike on the actual target host — runs BEFORE SOW signature."
applies_to: [headless]
decision_refs: [D-HL-ENV-01, D-HL-SPEC-01, D-HL-STACK-01, D-HL-SEC-01, D-HL-DISCOVERY-01, D-QA-GATE-BLOCK]
last_reviewed: 2026-08-11
next_review_due: 2026-11-11
---

# 11 — Environment Preflight (Headless)

> Governing decision: **`D-HL-ENV-01`** (ratified v1.11.17, rev 2). Canonical text: `_decisions/proposals/headless/D-HL-ENV-01-proposal.md`.
>
> **No headless build starts until preflight has been run and recorded.** A failed check **halts** — it does not become a backlog ticket.
>
> **Check IDs below are the ratified IDs.** They are cited by number in the decision, in SOWs and in escalations. Do not renumber them.

**Why it is worth the hours:** every hour spent on a preflight check is an hour that would otherwise be spent on the same problem in sprint 2, with a signed SOW and a date attached. Each check corresponds to a real documented failure mode, not a hypothetical.

The clearest justification is check 1. Shopify's own getting-started page says **"Node.js v16.20+"**. The pinned CLI package declares **`engines: { node: '^22 || ^24' }`**. Node 16 went end-of-life in **September 2023**. Following the documentation gets you an environment that cannot install the toolchain — and the error will not mention the doc.

---

## When it runs

| Stage | What runs |
|---|---|
| **Before SOW signature** | **B1**, when architecture B is declared or proposed. Its failure changes the architecture, and after signature that is a change order. |
| G0 / G1 | Checks 1–9 plus the per-architecture set for the declared or proposed architecture. Results feed the estimate. |
| G3 scaffold | Re-run and record. An environment verified six weeks ago at proposal time is not a verified environment. |

Every figure asserted during preflight comes from `pointers/verified-facts.md` (`HEADLESS-HALLUCINATION-01`).

---

## Checks 1–9 — every architecture

| # | Check | Pass condition | Failure consequence |
|---|---|---|---|
| **1** | **Node version from `engines`, not from docs** | `node -v` satisfies the `engines` field of the **pinned** CLI and framework packages | Toolchain will not install |
| **2** | **Package manager and lockfile** | One package manager agreed; lockfile committed; **CI installs from the lockfile** | Non-reproducible builds |
| **3** | **Dependency peer-pin resolution** | Install completes with no unresolved peer conflicts; peer pins recorded (e.g. `react-router ~7.16.0`) | Runtime errors that look like app bugs |
| **4** | **Store access** | Credentials for the **actual target store**, with the required channel installed | Blocked on day 1 waiting for client access |
| **5** | **Live Storefront API test query** | A real query returns real data from the real store — **not a fixture, not a demo store** | Token / channel / scope errors discovered mid-build |
| **6** | **Secret store confirmed** | A named location for every secret in `knowledge/05-security-baseline.md` §2, **and who can write to it** | Secrets end up in a repo or a Slack message |
| **7** | **Environment matrix** | dev / staging / production named, each with its own store or store mode, its own tokens, and its own hosting target | Staging pointed at production data |
| **8** | **Git and CI** | Repo exists, branch policy agreed, CI runs install + build + dependency audit | Ship gate cannot be enforced |
| **9** | **Customer accounts decision recorded** | New (Customer Account API) vs legacy (Multipass) chosen and recorded — **mutually exclusive** | Auth re-architecture mid-build |

### Check 5b — publication scoping *(`HL-CAP-002`, verified register §17)*

**Confirm the resources the storefront renders are published to the channel it queries — and to the markets it serves.**

Shopify, verbatim: *"Unpublished products will behave just like they were archived or deleted: they will be omitted from connections and not found when queried by handle or ID."* And: *"the Storefront API will only return products that are published both to your sales channel **and** the market you're querying for."*

**Two conditions. Both must hold.** A product published to the channel but not the queried market is absent, and nothing at the API surface distinguishes that from a product that does not exist.

**Why it belongs at preflight rather than in build:** the failure presents as an application bug — a `null` where a product should be — and is a configuration fact. A developer will debug a correct query first. **Check 5's live test query is the moment to catch it**: query a product you know exists and confirm it comes back.

Record: which channel the storefront queries, which markets it serves, and who owns publication going forward. On a live-store engagement, **publication is also what scopes which products the new storefront sees at all.**

---

### Check 1b — cross-project Node resolution *(ADDED v1.11.28, additive — no check renumbers)*

**Where the same workstation, container image or CI runner serves more than one headless architecture, the resolved Node version must satisfy *every* architecture it builds.**

- Read `engines` from **each scaffolder actually invoked** — not from the framework package it depends on. **The two can disagree, and on BigCommerce the scaffolder is the stricter one.**
- Record the resolved version in the **environment matrix** (check 7).
- Where no single version satisfies all, **per-project version management is the answer and it is named at preflight**, not improvised.

*Current state — illustrative and dated, per register §12a and §13:*

| Scaffolder / CLI | `engines` |
|---|---|
| `@shopify/cli-hydrogen` | `^22 \|\| ^24` |
| `@bigcommerce/create-catalyst` | **`^24.0.0`** |
| `@bigcommerce/catalyst` *(the dependency, not the scaffolder)* | `^20 \|\| ^22 \|\| ^24` |

***Node 24 is currently the only version that satisfies both scaffolders.***

**Why check 1 alone does not catch this.** Check 1 is scoped to one project, and it passes on every A and B project run from a Node 22 machine. The contradiction exists only in the **intersection** — and it surfaces as an incompatible-engines error when someone scaffolds Catalyst on a machine set up for Hydrogen, which reads as a broken laptop rather than a policy gap.

---

On check 3: **Hydrogen's peer pins are not advisory.** It pins `react-router ~7.16.0` against a published latest of `8.3.0`. "Latest" is *wrong* here, not modern, and any bot offering to fix the "outdated" dependency is offering to break the build. Hydrogen also ships on a **CalVer train** tied to Storefront API versions — an upgrade is an **API-version migration**, engagement type 5.

On check 9: the Customer Account API does **not** support `localhost` or plain `http` in development. **A tunnel is required.** Record it here; discovering it on build day costs an afternoon.

### Check 7b — reading production safely *(`HL-CAP` capability gap, K4)*

**Check 7 says staging pointed at production data is a failure. On a Migrate-to-Headless or Redesign build you often *must* read the production store** — the real products, metafields, metaobjects and menus are the thing being rendered, and a seeded dev store proves nothing about them.

**Both are true. The rule is not "never touch production" — it is that the direction of access is decided and recorded.**

| Access | Verdict |
|---|---|
| **Read** production catalogue, content and structure through a storefront token | **Legitimate and often necessary.** Record it. |
| **Write** anything to production from a development environment | **Failure.** No exceptions. |
| Development pointed at production **with write-capable credentials** | **Failure** — this is what check 7 is about. The risk is the credential, not the data. |
| Production **customer or order** data in a development environment | **Failure.** Read the catalogue, not the people. |

**How to hold the line:**

- **Development credentials are read-scoped.** A dev environment holding a write-capable token is one seed script away from an incident, and the incident lands on the client's live store.
- **No development-triggered mutation reaches production** — no cart writes, no metaobject creation, no test orders. If a mutation must be exercised, it runs against a store that is not the client's.
- **Merchandisers keep working during the build.** They are editing the live store while you read it, so the data moves under you. That is normal — treat "the catalogue changed" as an expected condition rather than a broken fixture.
- **Record it in the environment matrix**: which environments read production, with what scope, held by whom.

**On any engagement where an existing storefront must stay unaffected**, this is the check that carries it — and the shared-quota consequence applies: the build's traffic counts against the same store limits the live storefront depends on (`HL-SEC-004`). Rate-limit development traffic too, or a load test becomes a live-store incident.

---

## Architecture A — Hydrogen + Oxygen

| # | Check | Pass condition |
|---|---|---|
| **A1** | **Hydrogen channel installed** — *not* the Headless channel | Confirmed in admin |
| **A2** | **Plan is not Agentic** | Oxygen *"isn't available on Agentic plans"* (register §2). An Agentic-plan store cannot use A — a Mode 3 halt, not a workaround. |
| **A3** | **`npx shopify hydrogen link` + `env pull` succeed** | Environment variables pull down cleanly |
| **A4** | **Bundle-size headroom baselined** | Scaffold build measured against the **10 MB** worker cap. A scaffold already near the cap is a **design constraint, not a footnote.** **Run it, do not merely require it** (register §16b): `npx shopify hydrogen build` reports size plus top dependencies and app files, and emits `dist/server/server-bundle-analyzer.html`. |
| **A5** | **Worker startup measured** | Against the **400 ms** limit |
| **A6** | **Env-var count under 110** | **Projected** count, not current count |

Also governing A, from the runtime ceilings in `knowledge/12-discovery-audit.md` point 3: CPU **30 s**/request, memory **128 MB**, outbound within **2 min**, and a **`workerd`** runtime that is not Node. A dependency needing a Node API `workerd` lacks disqualifies A — derivation gate 4 sends it to B or C, with human confirmation.

---

## Architecture B — Hydrogen + self-host  *(pipeline status: CONFIRMED — B1 is a pre-signature gate)*

| # | Check | Pass condition |
|---|---|---|
| **B1** | **Deploy spike on the actual target host, before signature** | A scaffold Hydrogen app **builds *and serves*** on the chosen host. **This is the gate.** |
| **B2** | **Headless channel installed** — *not* the Hydrogen channel | Confirmed in admin |
| **B3** | **Oxygen-specific code removal enumerated** | The guide's *"Remove Oxygen-specific packages and code"* turned into a concrete file list: `server.js`, `react-router.config.ts`, `vite.config.ts`, possibly `app/entry.server.tsx` |
| **B4** | **Custom server context proven** | The server entry creates a Hydrogen context and passes it through **`getLoadContext`** |
| **B5** | **Host limits recorded** | Env-var cap, bundle/function size cap, cold-start behaviour, request timeout — **the host's numbers, fetched, not assumed** |

### Why B1 runs before signature

Shopify's own self-hosting guide carries this warning, verbatim:

> *"This guide might not be compatible with features introduced in Hydrogen version 2025-05 and above"*

Current Hydrogen is **2026.4.4**. The primary documentation for the thing architecture B does is documented as potentially a year stale.

**That is not a reason to refuse B** — B has a named client and full support. It is a reason to prove the deploy path on the actual target host **while the architecture can still change without a change order.** Deploy a minimal Hydrogen app to the real host, serve a real Storefront API query through it, and record what it took.

If the spike fails at proposal, the answer is "then it's A, or C, or B with these extra days priced in." After signature the same finding is a commercial dispute. **A spike that has not been run is a failed check, not an unknown.**

**B3 and B4 are why the spike is not a formality.** Removing Oxygen-specific code and proving a custom server context through `getLoadContext` is the actual work of self-hosting Hydrogen, and it is exactly the part the stale guide covers.

Also on B: the client owns the hosting account by default, there is **no caching layer** unless one is designed and priced (`HL-CACHE-003`), and the SOW carries the operational-responsibility line even when managed hosting is declined.

---

## Architecture C — Headless channel + Next.js

**SUPPORTED-ON-DEMAND — commercial hold, no named client. No verification is pending on C.** These checks exist so the arm is ready.

| # | Check | Pass condition |
|---|---|---|
| **C1** | **Headless channel installed**, tokens issued, **rotation procedure recorded** | Confirmed |
| **C2** | **Framework choice recorded and justified** | Ratified as Next.js App Router in v1.11.17 — recorded in the project record, not assumed |
| **C3** | **Commerce-layer inventory** | Everything Hydrogen provides for free that must now be built or sourced: **cart, session, caching, analytics events, SEO routing.** Enumerated *before* estimating. |
| **C4** | **`@shopify/hydrogen-react` status verified** | **Closed 2026-08-06** (register §10): 2026.4.3, dist-tag latest, no `deprecated` field, peers `react`/`react-dom`/`vite` and **no `react-router` peer** — the absence that makes it usable from Next.js. **Re-verify per project**; package status is a point-in-time fact. |
| **C5** | **Host limits recorded** | As B5 |

**C3 is what makes C estimable.** `@shopify/hydrogen-react` is a *"framework-agnostic library of React components"* that *"can be used by any React-based web app"*. Hydrogen adds **standard routes, caching strategies, redirects, and SEO** on top. In C those four are code WebDesk writes and maintains, per project, forever. Any C scope reading as if `hydrogen-react` replaced Hydrogen is mis-scoped.

---

## Architecture D — BigCommerce Catalyst

| # | Check | Pass condition |
|---|---|---|
| **D1** | **Node-capable host confirmed** | Catalyst *"can be deployed to any hosting provider that supports Node.js"* — confirm which |
| **D2** | **Caching layer designed if not on Vercel** | On Vercel, Runtime Cache is automatic with no external KV setup. **Off Vercel the cache is designed and owned. Not free.** (`HL-CACHE-003`) |
| **D3** | **GraphQL Storefront API rate limits verified** | **Closed 2026-08-06** (register §9b): complexity **10,000**/request, depth **16**, **no request-count quota, not plan-gated.** The governing constraint is query **shape**, not volume — check the deepest planned query, because a rate limit alone does not protect this. |
| **D4** | **Store quota sharing understood** | **All apps share the store quota** (register §9) — Pro 60k/hr (450/30 s); Plus and Standard 20k/hr (150/30 s); Enterprise by plan and resource. Feeds `HL-SEC-004`: an unthrottled proxy route is **store-wide** DoS. |

**Added by the register after this decision was ratified — not a renumbering of D1–D4, an addition:**

- **Token class must be Private for all server-to-server fetching** (`HL-SEC-006`). Storefront tokens are deprecated for s2s; **2026-06-30** has passed (cannot create without CORS origins), **2027-03-31** is the hard cutoff. On an existing build this is an audit remediation item with that date attached.
- **Private-token lifetime and rotation recorded.** `expires_at` is a unix timestamp with **no maximum lifetime** — *"It is possible to create a long-lived token that does not expire."* A non-expiring token is a decision with a named holder and a rotation procedure.

---

## Halt behaviour — three legitimate responses, and only three

A failed check **stops the engagement at that point.**

1. **Fix it and re-run the check.**
2. **Change the architecture** — `D-HL-STACK-01` Mode 3. Surface the evidence. **Never switch silently.**
3. **Record the failure in the SOW** as an explicit exclusion, or a time-boxed risk **with a named owner**.

**"Proceed and deal with it later" is not on the list.**

Response 3 is the one that gets forgotten, and it is the commercially useful one: a check can fail and the engagement can still proceed — *if* the failure is written into the SOW as an exclusion or an owned, bounded risk. What is not available is proceeding while the failure stays undocumented.

---

## Artifact — `env-preflight.md`

Preflight produces **`env-preflight.md`** in the project record: **every check, pass/fail, the evidence, the date, and who ran it.** It is **attached to the SOW**.

**An engagement with no `env-preflight.md` has not started.**

Re-run and re-record at G3. Plans change, packages ship, tokens expire.

---

## Anti-patterns *(lifted from `D-HL-ENV-01`)*

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

**Added by this KB file, not from the decision:**

12. Resolving Node for one project and assuming a workstation that serves several is therefore correct — check 1 passes per project while the intersection fails.
13. Reading `engines` from `@bigcommerce/catalyst` and concluding the scaffolder will run. `create-catalyst` is stricter.
14. Discovering the cross-architecture Node conflict as an incompatible-engines error on a developer's machine, and treating it as a broken laptop.
15. Treating an unrun check as an unknown rather than a failure.
16. Letting a dependency bot "fix" a peer-pinned dependency to latest, or treating a Hydrogen CalVer step as a version bump.
17. Renumbering the check IDs. They are cited by number in the decision, in SOWs and in escalations.
18. Forgetting response 3 in the halt list, and so treating every failed check as a hard stop when an owned, time-boxed, SOW-recorded exclusion was available.
19. Creating a non-expiring BigCommerce private token with no named holder and no rotation procedure.

---

Last reviewed: 2026-08-06
Next review due: 2026-11-06
