---
name: headless
description: Headless commerce platform arm. Four supported architectures (A Hydrogen+Oxygen, B Hydrogen+self-host, C Shopify Headless channel+Next.js, D BigCommerce Catalyst+self-host) across two backends. Owns architecture selection, the mandatory compatibility audit, app classification, security baseline, environment preflight, six engagement types including the support retainer, and the cross-architecture build standards. Per C-HEADLESS-01 headless is fundamentally different from monolithic platforms — nothing in this arm may be estimated against a theme build.
version: 0.18.0
tier: 1
load_when: ["platform-headless", "platform-shopify", "platform-bigcommerce"]
tools: [Read, Write, Edit, Glob, Grep, Bash]
model: sonnet
applies_to: [headless]
decision_refs: [C-HEADLESS-01, D-HL-SPEC-01, D-KB-FIDELITY-01, D-HL-STACK-01, D-HL-TYPES-01, D-HL-DISCOVERY-01, D-HL-APPS-01, D-HL-SEC-01, D-HL-ENV-01]
last_reviewed: 2026-08-06
next_review_due: 2026-11-06
---

# Headless Commerce Platform Arm

> Entry point. Pointers only — the rules live in `knowledge/` and `architectures/`.
> **Human starting a build? Read `README.md` in this directory first.**
> All six `D-HL-*` codes ratified by master 2026-08-07 in v1.11.17. Canonical text: `skills/_decisions/decision-inventory.md`.

---

## The one rule that governs everything else

**Nothing here is a theme build.** *(D-HL-DISCOVERY-01, verbatim)*

> "Never assume that an existing Shopify theme feature, app block or third-party app will work in Hydrogen. Verify API, SDK, Customer Account API and Oxygen runtime compatibility before confirming feasibility or estimating development effort. Clearly separate native Shopify capabilities, custom Hydrogen development, third-party integrations and external middleware requirements."

Every failure mode this arm exists to prevent traces back to someone assuming a theme-layer behaviour survives the move to headless. It does not survive by default; it survives only when something was built to carry it.

---

## Four architectures — `D-HL-STACK-01`

| | Architecture | Backend | Framework | Hosting | Status |
|---|---|---|---|---|---|
| **A** | Hydrogen + Oxygen | Shopify | Hydrogen | Shopify Oxygen (managed) | **Full support** — reference architecture |
| **B** | Hydrogen + self-host | Shopify | Hydrogen | Vercel / Netlify / Fly.io / Cloudflare Workers | **Full support** — named client |
| **C** | Headless channel + Next.js | Shopify | Next.js App Router + `@shopify/hydrogen-react` | Bring your own | **SUPPORTED-ON-DEMAND** — no named client |
| **D** | Catalyst + self-host | BigCommerce | Next.js RSC (Catalyst) | Any Node-capable host | **Full support** |

`architectures/shopify-hydrogen-oxygen/` is the reference spec. `architectures/shopify-hydrogen-selfhost/` is a **delta over A**, not a parallel copy. `architectures/shopify-headless-next/` and `architectures/bigcommerce-catalyst/` cross-reference each other on shared Next.js/RSC concerns.

**Architecture is locked at SOW signature. Changing it is a change order, never a correction.**

### How one is chosen — three modes, and only three

1. **DECLARED** — named in the SOW intake. The skill **validates** it against verified store facts. It does not re-litigate a signed decision.
2. **DERIVED** — not named. The skill runs the ordered gates in `knowledge/00-overview.md`, proposes **one** architecture with its reasoning, and **stops for human confirmation.** It does not proceed on its own proposal.
3. **BLOCKED** — the declared architecture contradicts a *verified* hard disqualifier. **Halt. Surface the evidence. Never silently switch.** A silent switch is the single worst outcome available here, because it is a commercially-signed decision being changed by a machine without anyone noticing.

**No stack preference is permitted.** A is the reference architecture because it is the most constrained and best documented, not because it is recommended. If the gates point at B or D, the answer is B or D.

---

## Six engagement types — `D-HL-TYPES-01`

Five project types, discriminated by one question — **which layer is changing?**

| Type | The question that identifies it |
|---|---|
| **1. New Build** | "Is anything live today?" → No |
| **2. Replatform** | "Is the commerce backend itself changing?" → Yes |
| **3. Migrate-to-Headless** | "Same backend, frontend stops being a theme?" → Yes |
| **4. Redesign** | "Already headless, design changing?" → Yes |
| **5. Framework Upgrade** | "Nothing changes except the version?" → Yes |

Plus **6. Headless Support / Retainer** — ongoing, not project work, does not pass G0, has its own intake. Deliberately off the discriminator table: the answer to "which layer is changing" is "none, continuously." Defaults: **8-hour per-ticket threshold**, **no response-time SLA**.

Combination projects are priced as the **sum**, not the max.

---

## Non-negotiable gates

| Gate | Rule | Governing code |
|---|---|---|
| **Discovery audit** | **Seven** user-supplied review points, cited by number. Blocks pricing on every type except New Build. Blocks the first ticket on any retainer storefront WebDesk did not build. | `D-HL-DISCOVERY-01` → `knowledge/12-discovery-audit.md` |
| **App classification** | Every app, script, pixel and integration lands in one of four buckets **with named evidence** before pricing. **Default bucket is 4 — requires discovery.** No app is compatible until proven compatible. | `D-HL-APPS-01` → `knowledge/08-app-integrations/` |
| **Environment preflight** | No build starts until preflight has run and been recorded. Failure **halts** — it does not become a backlog ticket. Carries `D-QA-GATE-BLOCK` semantics. | `D-HL-ENV-01` → `knowledge/11-environment-preflight.md` |
| **Security ship gate** | Five blocking checks. Check 1 is a secret scan of the **built client bundle**. | `D-HL-SEC-01` → `knowledge/05-security-baseline.md`, `knowledge/09-forbidden.md` |
| **Spec conformance** | Every SOW requirement becomes an **observable acceptance test** at G1. The ledger is walked at **every sprint exit**; no test, a failing test, or static-where-dynamic **blocks exit**. Built from K4 pilot feedback — the arm verified inputs exhaustively and never verified outputs. | `D-HL-SPEC-01` → `knowledge/13-spec-conformance.md` |

---

## Verify before asserting

**`pointers/verified-facts.md` is the source of truth behind every number in this arm.** If a version, limit, plan gate or quota appears anywhere under `skills/headless/**`, it appears there first with a source URL and a verification date.

Three open `TODO-VERIFY` items. An unverified item may be named as an open question; it **may not** be written as a fact, estimated against, or quoted to a client.

`HEADLESS-HALLUCINATION-01` enforces this at every gate. Two live proofs of why the rule exists, both currently in the register: Shopify's own docs say Node **v16.20+** while the pinned CLI's `engines` field says `^22 || ^24` and Node 16 died in 2023; and BigCommerce **storefront tokens are deprecated for server-to-server**, with the first milestone already behind us.

---

## Commercial holds currently in force

- **Architecture C is not quotable.** Its technical blocker cleared (`@shopify/hydrogen-react` verified alive and framework-agnostic, 2026-08-06). Its commercial one has not: no named client. C stays SUPPORTED-ON-DEMAND.
- **Every B / C / D SOW carries this line, including when managed hosting is declined:** *"Client owns hosting, monitoring and incident response. WebDesk responds on request at prevailing hourly rates, no response-time commitment."*

---

## Where things live

```
skills/headless/
├── SKILL.md                      # this file
├── knowledge/
│   ├── 00-overview.md            # architecture selection gates, rendering model, cascade tags
│   ├── 01-coding-standards.md
│   ├── 02-naming-conventions.md
│   ├── 03-accessibility.md
│   ├── 04-performance-budget.md
│   ├── 05-security-baseline.md   # D-HL-SEC-01
│   ├── 06-data-layer-patterns.md # GraphQL query + component patterns
│   ├── 07-cart-and-checkout.md
│   ├── 08-app-integrations/      # D-HL-APPS-01 — classification, not per-app wiring
│   │   └── 00-classification.md  # four buckets, five qualification questions
│   ├── 09-forbidden.md           # HL-SEC / HL-APPS / HL-CACHE / HL-CART / HL-ISR
│   ├── 10-seo-baseline.md
│   ├── 11-environment-preflight.md   # D-HL-ENV-01
│   └── 12-discovery-audit.md         # D-HL-DISCOVERY-01
├── pointers/
│   └── verified-facts.md             # the verification register — per _contracts/folder-structure.md, pointers/ sits at the arm root
├── architectures/
│   ├── shopify-hydrogen-oxygen/      # A — reference spec
│   │   └── 00-reference.md
│   ├── shopify-hydrogen-selfhost/    # B — delta over A
│   │   └── 00-delta-over-A.md
│   ├── shopify-headless-next/        # C — deferred
│   └── bigcommerce-catalyst/         # D
│       └── 00-reference.md
├── templates/
│   ├── env-preflight.md              # D-HL-ENV-01 artifact
│   ├── discovery-audit.md           # D-HL-DISCOVERY-01 artifact, 8 sections
└── projects/                         # per-type skills + retainer intake
    ├── new-build/SKILL.md            # type 1
    ├── replatform/SKILL.md           # type 2
    ├── migrate-to-headless/SKILL.md  # type 3
    ├── redesign/SKILL.md             # type 4
    ├── framework-upgrade/SKILL.md    # type 5
    └── retainer/SKILL.md             # type 6 — D-HL-TYPES-01 §6
```

---

## What this arm does not own

- **Data migration.** Separate WebDesk skills and automation own it. This arm owns the audit, the handoff interface (named entity list, URL inventory, credential-reset consequence), and the frontend consequences. *A handoff is a place where things get dropped — "another skill owns it" is not "not my problem."*
- **Payments, shipping, tax integrations.** Always manual, per `INT-001` / `INT-002`.
- **Per-app wiring instructions.** The skill owns policy, classification and commercial consequence; the developer owns wiring. App-by-app instructions are stale within a quarter and there are thousands of apps.
- **Hyvä / Adobe Commerce.** Hyvä is a coupled Magento theme. It is not headless and belongs in the Magento arm.
- **Releases.** Only master ships.

---

Last reviewed: 2026-08-06
Next review due: 2026-11-06
