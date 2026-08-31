---
tier: 1
load_when: ["platform-headless", "headless-platform-active", "g0-intake-stage", "g0.5-audit-stage", "g1-plan-stage"]
description: "Headless arm overview: what headless changes, the four architectures and the backend/frontend split, the three-mode architecture selection protocol with its six ordered gates, the plan-awareness matrix, rendering-model and cart-ownership decisions, cascade tag registration with worked example, and the arm's CRITICAL QA codes."
applies_to: [headless]
decision_refs: [C-HEADLESS-01, D-HL-SPEC-01, D-HL-STACK-01, D-HL-TYPES-01, D-HL-DISCOVERY-01, D-HL-ENV-01, D-HL-SEC-01, D-HL-APPS-01, D-QA-GATE-BLOCK]
last_reviewed: 2026-08-06
next_review_due: 2026-11-06
---

# 00 — Headless Overview

> Read this before anything else in the arm. It decides **which architecture** you are building and **what stops you** from building it.

---

## 1. What headless actually changes

Per `C-HEADLESS-01`, headless is not a variant of a monolithic platform build. One thing changes, and every other difference follows from it:

**The theme layer is gone.** Not replaced — gone.

In a themed store the theme is a shared surface that dozens of things quietly attach to: app blocks, ScriptTags, theme app extensions, analytics snippets, consent banners, review widgets, upsell injectors. None of them asked permission and none of them are in your repository. They work because the theme exists.

Take the theme away and every one of those becomes either a build item, a replacement, or a loss. That is the entire economic content of a headless project, and it is why `D-HL-DISCOVERY-01` exists.

**The binding rule, verbatim — `D-HL-DISCOVERY-01`. It is quoted, never paraphrased:**

> "Never assume that an existing Shopify theme feature, app block or third-party app will work in Hydrogen. Verify API, SDK, Customer Account API and Oxygen runtime compatibility before confirming feasibility or estimating development effort. Clearly separate native Shopify capabilities, custom Hydrogen development, third-party integrations and external middleware requirements."

The third sentence is the one that gets dropped, and it is the one that makes an estimate correct: **native Shopify capability, custom Hydrogen development, third-party integration and external middleware are four different cost structures**, and a line item that blends them cannot be priced or owned.

**The consequences, stated as rules:**

| In a theme | In headless |
|---|---|
| The platform renders the storefront | **You** render the storefront. Uptime of the render layer is now someone's job — see the hosting-ownership rule. |
| Apps attach themselves via the theme | Every app is classified against four buckets **with evidence** before pricing (`D-HL-APPS-01`). Default bucket is 4. |
| Secrets live on the platform | Secrets live in **your** environment, and a build step can publish them to the browser (`D-HL-SEC-01`). |
| Upgrades are the platform's problem | Upgrades are an **API-version migration** on a CalVer train, with a support window (`D-HL-TYPES-01` type 5). |
| No hosting decision exists | A hosting decision exists, has an owner, and has a price (`D-HL-STACK-01`). |

**The estimating rule that follows** *(user-supplied, verbatim in `D-HL-DISCOVERY-01`)*: *"Do not estimate a Hydrogen project as a normal theme redevelopment."* No exceptions, no "it's a simple one."

---

## 2. The four architectures and where each concern lives

| | **A** Hydrogen + Oxygen | **B** Hydrogen + self-host | **C** Headless channel + Next.js | **D** BigCommerce Catalyst |
|---|---|---|---|---|
| Backend | Shopify | Shopify | Shopify | BigCommerce |
| Framework | Hydrogen (React Router 7) | Hydrogen (React Router 7) | Next.js App Router + `@shopify/hydrogen-react` | Next.js RSC (Catalyst) |
| Sales channel required | **Hydrogen** channel | **Headless** channel | **Headless** channel | BigCommerce channel config |
| Hosting | Shopify Oxygen (managed, `workerd`) | Vercel / Netlify / Fly.io / Cloudflare Workers | Bring your own | Any Node-capable host |
| Data layer | Storefront API (GraphQL) | Storefront API (GraphQL) | Storefront API (GraphQL) | GraphQL Storefront API |
| Cart owner | Hydrogen cart (Storefront API cart) | Hydrogen cart | **Your code** | Catalyst cart |
| Checkout owner | **Shopify** — always | **Shopify** — always | **Shopify** — always | **BigCommerce** — always |
| Caching | Oxygen / Hydrogen caching strategies | **You design it** | **You design it** | Vercel Runtime Cache automatically; **off Vercel you design it** |
| Ops owner | Shopify | Client by default | Client by default | Client by default |
| Status | Full support — reference architecture | Full support — named client | **SUPPORTED-ON-DEMAND** — no named client | Full support |

**The honest position on B, from `D-HL-STACK-01` and unchanged by its promotion.** B is the **highest-risk of the four**, and the promotion to full support was *commercial* — a named client — not a finding that the risk went away. Shopify's self-hosting guide carries the warning *"This guide might not be compatible with features introduced in Hydrogen version 2025-05 and above"* while current Hydrogen is **2026.4.4**. **Cite that warning in every B SOW**, and **do not sell B as "Hydrogen, just on Vercel."** The `D-HL-ENV-01` B1 deploy spike before signature is the control that makes B safe to sign; without it, B is the riskiest thing this arm does.

**Wrong-channel failure mode, worth memorising:** installing the **Hydrogen** channel for a self-hosted build (B). Same framework, wrong channel, and the resulting token errors do not name the cause. Preflight check A1/B2 exists for exactly this.

**The C column's real cost.** `D-HL-STACK-01` states what you give up versus A/B: **every Hydrogen-native primitive — caching helpers, cart handlers, analytics and consent components, Customer Account API client wiring — becomes your code.** Shopify's own framing adds four more: **standard routes, caching strategies, redirects, and SEO.** Price the union of both lists, not either one — dropping cart handling and Customer Account API wiring is what makes a C estimate look like a Hydrogen estimate. `@shopify/hydrogen-react` gives you the data layer and components; it does not give you those four. C's KB leads with that inventory so it is estimated rather than discovered.

---

## 3. How an architecture is selected — three modes, and only three

`D-HL-STACK-01`. **The skill does not guess and never silently changes architecture mid-project.**

### Mode 1 — DECLARED (the normal case)

`architecture: A | B | C | D` is named in the SOW intake. The skill **validates it. It does not re-litigate it.** The hosting decision, the plan check and any infrastructure mandate are commercial conversations that already happened.

| Declared | Validated against |
|---|---|
| **A** | Store is not on an Agentic plan; Hydrogen channel installable; dependency audit fits `workerd`; bundle projection under 10 MB |
| **B** | Headless channel installed (**not** Hydrogen); **deploy spike passed** (`D-HL-ENV-01` B1); host limits recorded |
| **C** | Headless channel installed; storefront registered under the 100 cap; "build it yourself" inventory recorded |
| **D** | BigCommerce channel configured; store REST quota recorded; deepest query checked against depth 16 / complexity 10,000; caching-layer owner named if off Vercel |

Passes → build proceeds. Fails → **Mode 3**.

### Mode 2 — DERIVED (nothing was declared)

Run the gates below against **verified** store facts and the discovery audit. Propose **exactly one** architecture, name the gate that decided it, and **stop for human confirmation.** Do not begin building on your own proposal.

**Ordered gates — first match decides:**

1. Backend is BigCommerce → **D**. No further branching.
2. Store is on an Agentic plan → Oxygen unavailable → **B** or **C**.
3. Client mandates their own cloud, or has compliance constraints Oxygen cannot meet → **B** or **C**.
4. Dependency audit finds Node-specific APIs `workerd` does not provide, or a bundle that will not hold under 10 MB → **B** or **C**.
5. Scope includes substantial non-commerce surface in the same application (portal, marketing site, external CMS) → **C**.
6. Otherwise → **A**.

**B-vs-C tiebreak when both survive:** choose **C**, *unless the client already owns a Hydrogen codebase* — then B is a port rather than a rewrite. B's documented doc-staleness risk means B should be the deliberate answer to *"we already have Hydrogen and must move it,"* not the reflex answer to *"we don't want Oxygen."*

### Mode 3 — BLOCKED (declared architecture is impossible)

A declared architecture contradicts a **verified** hard disqualifier — Agentic plan with A declared, B deploy spike failed, a required dependency cannot run in `workerd`.

**Halt. Surface the conflict with the evidence. Do not switch. Do not build a workaround.**

The architecture is a **commercial** decision, not only a technical one. Silently moving a signed A engagement to C changes the price, the hosting arrangement, the maintenance obligation and the risk profile. Humans sign change orders.

### Lock point and house default

**Locked at SOW signature**, recorded in the project record. Changing it later is a change order, not a refactor.

**There is no house default and no recommended architecture.** A is the reference spec because it is the most constrained and best documented, not because it is preferred. Selection is per-project against the gates, recorded with the deciding gate named. *LLM preference is not a decision input.*

---

## 4. Plan-awareness — the arm is plan-aware, not Plus-assuming

Every figure here traces to `pointers/verified-facts.md`.

| Capability | Plan reality |
|---|---|
| Storefront API / Headless channel | No documented plan gate. The channel is **free**. |
| Oxygen | Free on Starter, Basic, Grow, Advanced, Plus, Pause-and-build. **"isn't available on Agentic plans."** |
| Headless storefronts per shop | **"maximum of 100 active storefronts and access tokens per shop"** |
| Customer Account API | Requires Headless *or* Hydrogen channel **and** customer accounts enabled. No plan gate documented. Local `http`/`localhost` **not supported** — tunnel required. |
| Multipass SSO | **Shopify Plus only**, **legacy customer accounts only** |
| B2B (headless) | "a plan that supports B2B capabilities"; works only with customer accounts. Plus is **not** named as the gate on the headless B2B page. |
| BigCommerce REST quota | Pro 60k/hr (450/30s); Plus & Standard 20k/hr (150/30s); Enterprise by plan+resource. **All apps share the store quota.** |
| BigCommerce GraphQL Storefront | Complexity **10,000**/request, depth **16**. **No request quota and no plan gate documented** — the constraint is query *shape*, not volume. |

**Headless on Shopify does not require Plus.** Any sentence in this arm implying otherwise is a defect — fix it, don't work around it.

**The trap to raise at discovery, not in sprint 3:** Multipass requires *legacy* customer accounts; the Customer Account API requires *new* customer accounts. **Mutually exclusive.** A Plus client on Multipass SSO is an authentication re-architecture, not a frontend port. Multipass is a documented, buildable path (`D-HL-DISCOVERY-01` §2a) at the cost of Plus, legacy accounts, a deprecated auth model, and **no authentication continuity from storefront into checkout**.

---

## 5. Rendering model — decide it per page type, record the decision

Headless gives you rendering control. Control is a liability until someone writes down how it is used.

**The rule: every route in the build has a declared rendering strategy and a declared cache behaviour, recorded before build, not discovered from the code afterwards.**

| Page type | Default posture | Why |
|---|---|---|
| Product detail | Server-rendered, cached, revalidated on catalog change | Price and availability are correctness-critical; a stale price is a commercial incident, not a performance issue |
| Collection / category | Server-rendered, cached | Same data-freshness class as PDP, higher traffic |
| Cart | **Never cached. Never static.** | Per-session state. See §6 |
| Account | **Never cached.** Server-rendered, authenticated | Caching an authenticated page is how one customer sees another's data |
| Search | Server-rendered; cache keyed on the full query | Cache-key omission of a facet is the standard bug here |
| Content / marketing | Static or long-cache with explicit purge | The only page class where staleness is genuinely cheap |
| Checkout | **Not yours.** Shopify or BigCommerce renders it | See §6 |

**Two decisions must be written into the project record before build:**

1. **What invalidates each cache**, and who or what triggers it. A revalidation window with no purge path on catalog update is the `HL-ISR-*` failure class.
2. **Whether the caching layer exists at all.** A and D-on-Vercel get one supplied. **B, C, and D-off-Vercel do not** — the caching layer is designed, owned and priced, or the storefront ships with none and nobody notices until traffic arrives.

Architecture-specific caching APIs and their exact semantics live in `architectures/*/`, not here — they are the part most likely to go stale.

---

## 6. Cart and checkout ownership — the boundary that is never negotiable

**Checkout is the platform's. Always. In all four architectures.**

Shopify renders Shopify checkout; BigCommerce renders BigCommerce checkout. WebDesk does not build a checkout, does not proxy one, and does not reimplement one. Any requirement that implies otherwise is escalated at discovery, not designed around.

**Cart ownership varies and must be named:** A and B use the Hydrogen cart over the Storefront API; D uses Catalyst's; **C is your code.**

**The cart ID is a bearer capability** (`D-HL-SEC-01`). Whoever holds it holds the cart. It is stored in a session cookie with the correct flags, never in a URL, never in `localStorage`, never logged. Client-only cart state is the `HL-CART-*` failure class.

**The handoff into checkout is where authentication continuity is won or lost.** The legacy customer-account flow — the Multipass path — carries Shopify's own quoted cost: *"This legacy authentication strategy will not maintain authentication between your Hydrogen storefront and checkout."* That is a priced architecture decision, not a bug to be fixed later.

Payments, shipping and tax integrations are **always manual** (`INT-001`, `INT-002`). They are never assumed to carry over.

---

## 7. Cascade tag registration + worked example

Per `_spine/orchestrator/knowledge/06-agent-cascade.md`, each arm registers its own tag bundle here. The spine does not bake in platform tag names.

### Registered tag bundle

```
IF CLAUDE.md.platform_config.platform == "headless":
  ACTIVATE:
    - headless-platform-active     # legacy-form arm tag
    - platform-headless            # canonical v1.11.5+ tag
    - code-production              # when writing code
    (NOT theme-build — there is no theme. Activating it is a defect.)

IF CLAUDE.md.platform_config.architecture in {A, B, C, D}:
  ADDITIONALLY ACTIVATE:
    - headless-arch-a | headless-arch-b | headless-arch-c | headless-arch-d
  If architecture is unset, DO NOT default it. Run Mode 2 and stop for confirmation.

IF CLAUDE.md.platform_config.project_type is set:
  ADDITIONALLY ACTIVATE project-<project_type>, plus the arm tag:
    - headless-new-build-active | headless-replatform-active
    - headless-migrate-to-headless-active | headless-redesign-active
    - headless-framework-upgrade-active | headless-retainer-active

IF current_gate == G0.5:  ACTIVATE audit-active, g0.5-audit-stage
IF current_gate in {G4,G5,G6}: ACTIVATE qa-active, g<N>-stage
```

**`headless-retainer-active` does not pass through G0.** Type 6 has its own intake (`projects/retainer/`). If a retainer session activates gate tags, something has misclassified an engagement.

### Registered tag list (machine-readable)

The block above is the activation *logic*; this table is the arm's **registration**. Per `_spine/shared-knowledge/frontmatter-spec.md` §6 (v1.11.18 clause), arm-registered tags are valid `load_when` triggers alongside the universal vocabulary, and the validator gathers them from this file by reading tag names in inline code. **A tag used in any `skills/headless/**` frontmatter must appear here or in §6.** An unregistered tag does not error — the file simply never loads, which for a gate-blocking file means the blocker never fires.

| Tag | Fires when | Notes |
|---|---|---|
| `headless-platform-active` | Arm is active | Legacy-form arm tag; also in §6 universal since v1.11.5 |
| `headless-arch-a` | Architecture A selected | Hydrogen + Oxygen |
| `headless-arch-b` | Architecture B selected | Hydrogen + self-host |
| `headless-arch-c` | Architecture C selected | SUPPORTED-ON-DEMAND |
| `headless-arch-d` | Architecture D selected | BigCommerce Catalyst |
| `headless-new-build-active` | Project type 1 | |
| `headless-replatform-active` | Project type 2 | |
| `headless-migrate-to-headless-active` | Project type 3 | |
| `headless-redesign-active` | Project type 4 | |
| `headless-framework-upgrade-active` | Project type 5 | |
| `headless-retainer-active` | Engagement type 6 | **Does not pass G0.** Own intake at `projects/retainer/`. |
| `audit-active` | Discovery audit in progress | Pairs with `g0.5-audit-stage` |

Universal tags this arm relies on, listed so the set is visible in one place: `platform-headless`, `platform-shopify`, `platform-bigcommerce`, `code-production`, `agent-code-review`, `g0-intake-stage`, `g0.5-audit-stage`, `g1-plan-stage`, `g3-scaffold-stage`, `g4-sprint-qa`, `g6-prelaunch-stage`, `qa-active`.

**Never `theme-build`.** There is no theme. Activating it on a headless project is a defect, not a fallback.

### MUST-load files by tag

| Active tags | Files that must eager-load |
|---|---|
| `platform-headless` | `SKILL.md`, `knowledge/00-overview.md` |
| `+ code-production` | `knowledge/01-coding-standards.md`, `knowledge/09-forbidden.md`, `_spine/shared-knowledge/forbidden-global.md` |
| `+ g0.5-audit-stage` / `audit-active` | `knowledge/12-discovery-audit.md`, `knowledge/08-app-integrations/` |
| `+ g0-intake-stage` | `knowledge/00-overview.md` §3 (selection), `knowledge/11-environment-preflight.md` |
| `+ g3-scaffold-stage` | `knowledge/11-environment-preflight.md`, `architectures/<selected>/` |
| `+ code-production` or `g6-prelaunch-stage` | `knowledge/05-security-baseline.md`, `knowledge/09-forbidden.md` |
| `+ headless-retainer-active` | `projects/retainer/SKILL.md`, `knowledge/12-discovery-audit.md` |

### Worked example — Migrate-to-Headless on architecture B, entering G0.5

`CLAUDE.md` says `platform: headless`, `architecture: B`, `project_type: migrate-to-headless`, `current_gate: G0.5`.

Tags activate: `headless-platform-active`, `platform-headless`, `platform-shopify`, `headless-arch-b`, `project-migration`, `headless-migrate-to-headless-active`, `audit-active`, `g0.5-audit-stage`.

Eager-loaded: `headless/SKILL.md` → `knowledge/00-overview.md` → `knowledge/12-discovery-audit.md` → `knowledge/08-app-integrations/` → `architectures/shopify-hydrogen-selfhost/`.

What the agent does with them, in order:

1. **Validates B, does not re-derive it** (Mode 1). Checks the **Headless** channel is installed — not the Hydrogen channel.
2. **Blocks on `D-HL-ENV-01` B1**: has the deploy spike been run on the actual target host? If not, this is a **halt before SOW signature**, not a backlog ticket.
3. Runs the seven-point audit. Every app, script and pixel lands in a bucket **with evidence**; anything undetermined is bucket 4.
4. Confirms no data migration is in this type's scope — same backend. If one appears, the type was misclassified and the engagement is re-priced.
5. Produces the artifact with the client-signed **dropped-functionality column**.

**If the deploy spike is missing, nothing downstream runs.** That is the point of the gate.

---

## 8. CRITICAL QA codes — headless-specific gate blockers

These block the gate. They are not advisory. All sit inside the ranges reserved by master in v1.11.17, v1.11.18 and v1.11.31.

| Code | Blocks | Condition |
|---|---|---|
| `HEADLESS-HALLUCINATION-01` | **every gate** | A number, limit, plan gate, version or API field is asserted without an entry in `pointers/verified-facts.md` carrying a source URL and a date. Reserved v1.11.18 after this arm flagged the gap. A headless hallucination fails commercially, not loudly — it goes into a signed estimate and surfaces as unpriced work. |
| `HL-SEC-001` | **G6 / release** | A secret appears in the **built client bundle**. Grep the build output, not the source. This is check 1 of the ship gate because it is the one that ends careers. |
| `HL-SEC-002` | G6 / release | A server-only credential carries a public build prefix (`VITE_`, `NEXT_PUBLIC_`). That error compiles cleanly and ships. |
| `HL-SEC-003` | G6 / release | A webhook handler parses the payload **before** verifying the signature. |
| `HL-SEC-004` | G6 / release | A server route proxies the commerce API with no rate limit. On BigCommerce this is store-wide DoS — all apps share the REST quota. |
| `HL-CART-001` | G4 / G6 | Cart state is client-only, or the cart ID is exposed in a URL, `localStorage`, or logs. |
| `HL-CACHE-001` | G4 / G6 | An authenticated or per-session response is cached, or a cache key omits a parameter that changes the response. |
| `HL-ISR-001` | G4 / G6 | A revalidation window exists with no purge path on catalog update — prices and stock go stale silently. |
| `HL-APPS-001` | **G0.5 / pricing** | An app was priced without a bucket and named evidence, or was assumed compatible. **No app is compatible until proven compatible.** |
| `HL-APPS-002` | G0.5 / pricing | A bucket-1 or bucket-2 classification rests on a register entry older than 90 days. The register is heuristic, never authoritative. |
| `HL-SEC-005` | G4 / G6 | An Admin API token (Shopify) or Store API `X-Auth-Token` (BigCommerce) appears anywhere in a storefront codebase or its runtime env. |
| `HL-SEC-006` | G0.5 / G4 / G6 | **Architecture D.** Server-to-server fetching uses a **storefront** token rather than a **private** token. Deprecated, dated cutoff **2027-03-31**. |
| `HL-APPS-003` | G0.5 / pricing | A theme app block, script tag, theme setting or metafield-driven theme behaviour is in scope with no named replacement mechanism in the headless app. |
| `HL-APPS-004` | G0.5 / G4 | Scope crosses the checkout boundary — proxy, reimplementation, or "light customization." Checkout is the platform's, in all four architectures. |
| `HL-CACHE-002` | G4 | A route ships with no **declared** rendering strategy *and* cache behaviour. A starter-template default is not a declaration. |
| `HL-CACHE-003` | G1 / pricing | The plan assumes edge caching, image optimization or ISR the chosen host does not supply. Unnamed means absent. |
| `HL-CART-002` | G4 / G6 | A client-supplied price, discount or total influences a persisted cart, an order, or an authoritative total. |
| `HL-CART-003` | G4 | Cart state is owned client-side with the commerce API as a sync target, rather than the reverse. |
| `HL-SPEC-001` | **G4** | A conformance-ledger row's acceptance test executes and does not pass. A percentage is not a pass. |
| `HL-SPEC-002` | **G1 and G4** | A SOW requirement with no row, or a row with an empty or unobservable test. **The code that would have caught the pilot's first failure five weeks before the client did.** |
| `HL-SPEC-003` | **G4** | Delivered **static** where the specification required dynamic. Renders correctly, demos well, fails when someone tries to change the content. |
| `HL-SPEC-004` | **G4** | Built route with an approved `D-DES-01` mockup shipped with no recorded comparison, or unexplained divergence at any declared viewport. |
| `HL-ISR-002` | G4 | A revalidation interval exists with no recorded answer to "how stale may this page be, per the client?" |

Preflight failure and audit failure both carry **`D-QA-GATE-BLOCK`** semantics — they halt, they do not become backlog tickets.

Full rule text: `knowledge/09-forbidden.md`.

---

## 9. Anti-patterns

1. Estimating any headless engagement against a theme build, for any architecture, at any size.
2. Deriving an architecture and then building on it without human confirmation — Mode 2 stops at the proposal.
3. Silently switching a declared architecture when validation fails, instead of halting and surfacing the evidence.
4. Treating architecture A as the recommended default rather than the reference spec, and letting that preference decide a project the gates would have sent to B or D.
5. Installing the Hydrogen channel for a self-hosted (B) build, then debugging token errors that never name the cause.
6. Writing "headless requires Shopify Plus" anywhere in this arm. It does not.
7. Quoting a figure that is not in `pointers/verified-facts.md`, or writing an open `TODO-VERIFY` item as if it were a fact.
8. Assuming a caching layer exists in B, C, or D-off-Vercel. It does not; it is designed, owned and priced, or it is absent.
9. Activating `theme-build` on a headless project because the tag bundle was copied from another arm. There is no theme.
10. Designing around the checkout boundary — proxying, reimplementing, or "just a small custom checkout." Escalate the requirement at discovery instead.
11. Letting an architecture-C engagement be scoped as if `@shopify/hydrogen-react` replaced Hydrogen. It supplies the data layer; routes, caching, redirects and SEO are still yours to build and maintain.
12. Treating a Multipass requirement as a configuration toggle rather than a priced architecture decision that costs storefront→checkout auth continuity.

---

Last reviewed: 2026-08-06
Next review due: 2026-11-06
