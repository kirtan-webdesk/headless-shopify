---
tier: 2
load_when: ["customization-register", "existing-site-project", "g1-stage"]
description: "Single source of truth for every customization on an existing-site project (migration / redesign / version-upgrade). One customization = one stable ID, written at two altitudes (client-plain + dev-technical), reconciled against the SOW at G1. No silent drops."
---

# Customization Register

> On any project that rebuilds an existing site — **migration, redesign, version-upgrade** — every customization is one traceable line with a stable ID, described for the client in plain language AND for the developer/PM Agent in technical terms, and reconciled against the SOW. A customization that isn't reconciled is a "where did X go?" ticket waiting to happen.

> **Status:** ratified as **D-CUST-RECON-01** (v1.11.9). Master owns the canonical copy. Platform arms reference this file; they do not re-implement it.

---

## Why this exists

Scoping is strong (WebDesk scopes existing-site work with technical-team due diligence, ~90-95% accurate). This register is the safety net for the residual 5-10% — the small **behavioral** customizations that are real but too minor to itemise in an estimate (a parent collection that shows products, a custom PDP tab). They have no obvious custom file, so they slip through unless something deliberately reconciles what's *on live* against what's *in the SOW*.

The register is not a re-scope. It is a coverage check that proves the scope was complete — and turns every gap into an explicit decision instead of a silent drop.

## When it applies

- **Existing-site projects only:** migration, redesign, version-upgrade.
- **Not new builds** — there's no live site to reconcile against (the register's "Discovered" column would be empty).
- Populated during discovery, **reconciled at G1** (once devs have full store access), verified at G5/G6.

---

## The model: one customization, one ID, three lists that must agree

Each customization gets a stable ID (`CUST-001`, `CUST-002`, …, unique per project) and is tracked across three lists:

1. **Discovered** — what the live-site scan actually finds (the platform arm's discovery engine; see "How each project type feeds this" below).
2. **Scoped** — what the SOW (client) and `sow-spec.md` (technical) say we're carrying.
3. **Built** — verified present in the new build.

Reconciliation is simply checking these agree.

---

## Two-altitude write-up (same ID, two readers)

Write each customization once, at two altitudes, linked by ID. The client reads the top line and signs; the developer builds from the bottom line; reconciliation matches the discovered behavior back to the ID.

```
CUST-014
  Client (SOW — plain, outcome language, no jargon):
    On category pages, shoppers see products right away — not just a list of
    sub-categories — so they can start shopping in one click.

  Spec (sow-spec.md — technical, verifiable):
    Parent + nested collection templates render the product grid (live behavior).
    Source: metafield custom.show_products + custom collection template.
    Acceptance: matches live on parent AND nested collections, all breakpoints.
```

The plain line must still describe a **verifiable outcome** — if it's too vague to test ("improve the category page"), reconciliation can't match it and QA can't confirm it. Plain ≠ vague.

---

## The register table

Kept at `/projects/[client]/customization-register.md`. One row per customization:

| ID | Client description (plain) | Technical spec | Source (file / setting / metafield / app) | Discovered on live? | In SOW / spec? | Decision | Approver | Built + verified? |
|----|----------------------------|----------------|-------------------------------------------|---------------------|----------------|----------|----------|-------------------|
| CUST-014 | Category pages show products in one click | parent+nested collections render product grid; metafield-driven | `collection.custom` + `custom.show_products` | Yes | Yes | KEEP | Client 2026-07-01 | ☐ |
| CUST-022 | "Notify me when back in stock" on sold-out items | Klaviyo back-in-stock block on PDP | Klaviyo app | Yes | **No** | **NOTIFY DEV** | — | ☐ |

## Reconciliation rule (run at G1)

Compare **Discovered** against **Scoped** and resolve every gap to a named decision — never a silent pass:

- **Discovered, not in SOW** → **notify the developers.** The developer decides:
  - it was missed → add to scope (change-order or absorbed, per the project's commercial terms), OR
  - the client doesn't want it → record as an **explicit exclusion** with an approver.
  Either way it becomes a written row with a decision + approver. This is the case WebDesk specifically wants caught.
- **In SOW, not discovered on live** → flag: the spec promises something that isn't there (already removed, or a spec error). Resolve before build.
- **In SOW, not built** → delivery gap; QA catches at G5/G6.

The governing principle (shared with the version-upgrade parity audit): **every customization ends in an approved decision. "Not discovered" and "not decided" are the failure modes.**

---

## How each project type feeds this

The register structure and reconciliation are identical across project types; only the **discovery method** differs:

- **Version-upgrade** — the arm's live-parity-audit file (e.g., `<active-platform>/projects/version-upgrade/knowledge/NN-live-parity-audit.md`; diff live behavior vs a fresh stock theme, three-way parity).
- **Redesign** — the arm's functionality-preservation file (e.g., `<active-platform>/projects/redesign/knowledge/NN-functionality-preservation.md`; existing-site functionality inventory, hidden-requirements sweep).
- **Migration** — the source-platform export + parity check (per the arm's migration skill when present).

The concrete file numbering + names live in each platform arm's project skill. See the ACTIVE platform's own overview:

```
skills/<active-platform>/knowledge/00-overview.md
```

Section title: `"Cascade tag registration + worked example"`. Each arm publishes its Redesign / Migration / Version-Upgrade file pointers there. Master's spine does NOT bake in a specific platform's file names — that keeps this register truly cross-platform.

Each discovery engine's findings become register rows. The register is the shared ledger; the arm files are the scanners that fill it.

---

## Anti-patterns

1. **Treating the SOW as the complete list of customizations.** For existing-site work it's the *scoped* list (~90-95%); the register exists to catch the rest by reconciling against live.
2. **Discovering a customization but not deciding on it.** Discovery without a KEEP / EXCLUDE decision + approver is still a silent drop.
3. **Only a technical spec, or only a plain SOW line.** Both altitudes, same ID — otherwise either the client can't sign or the dev can't build (or QA can't verify).
4. **Reconciling at signing only.** The deep scan needs store access; run reconciliation at G1, not at the estimate.
5. **Plain-language lines that aren't verifiable.** "Improve X" can't be reconciled or tested. Describe a checkable outcome.
6. **Skipping the register on new builds "for consistency."** No live site = nothing to reconcile; don't add ceremony that has no input.

---

Last reviewed: 2026-07-02 by Claude (ratified into spine — D-CUST-RECON-01, v1.11.9)
Next review due: After first pilot uses the register (K4 feedback loop)
