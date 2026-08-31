---
doc_type: escalation
to: master
from: Headless skill-dev window (Claude)
raised_date: 2026-08-05
revised_date: 2026-08-06
severity: high
status: OPEN
applies_to: [headless]
supersedes: ESCALATION-to-master-D-HL-STACK-01.md (deleted 2026-08-06 — obsolete, referenced D-HL-STACK-01 rev 1)
---

# Escalation to master — Headless arm: decision codes, forbidden prefixes, and spine reads

## Why this is an escalation and not a change

This window is authorized to create and modify files under `skills/headless/` and to draft proposals in `outputs/`. It is **not** authorized to add D-codes to the canonical inventory, edit `_spine/`, `_contracts/` or `_decisions/`, edit `tools/scripts/*`, or issue a release. Everything below therefore arrives as a request, not as a completed change.

**Nothing under `skills/` has been created or modified by this window.** The entire packet lives in `outputs/headless-skill-dev/`.

---

## 1. Six decision codes requested for the canonical inventory

| Code | Title | Revision in packet | Severity | Blocks |
|---|---|---|---|---|
| `D-HL-STACK-01` | Headless architectures supported by WebDesk, and how one is selected | **rev 4** | critical | All headless scoping |
| `D-HL-TYPES-01` | Headless project types (five) **+ Headless Support / Retainer** | **rev 3** | high | G0 classification; retainer intake |
| `D-HL-DISCOVERY-01` | Mandatory headless discovery audit | **rev 3** | critical | Pricing on every type except New Build |
| `D-HL-APPS-01` | App and integration compatibility policy | **rev 2** | high | Pricing |
| `D-HL-SEC-01` | Headless security baseline | **rev 2** | critical | Release |
| `D-HL-ENV-01` | Environment preflight | **rev 2** | high | Build start |

Each has a full proposal file in this packet, with frontmatter, anti-patterns, and a review footer.

---

## 2. Forbidden prefixes requested

| Prefix range | Owner proposal | Purpose |
|---|---|---|
| `HL-SEC-001` … `HL-SEC-010` | `D-HL-SEC-01` | Security baseline rules |
| `HL-APPS-001` … `HL-APPS-008` | `D-HL-APPS-01` | App classification rules |
| `HL-CACHE-*` | scaffold-expected | Caching rules (not yet drafted) |
| `HL-CART-*` | scaffold-expected | Cart/session rules (not yet drafted) |
| `HL-ISR-*` | scaffold-expected | Incremental/static rendering rules (not yet drafted) |

Requesting reservation of all five ranges now so the arm's content buildout does not collide with another platform's codes later.

---

## 3. Decisions taken by the user in this window that master should ratify

| # | Decision | Source | Where recorded |
|---|---|---|---|
| 1 | **Redesign stands as its own project type.** This window recommended folding it into New Build; the user overrode. | User, 2026-08-05 | `D-HL-TYPES-01` §4 |
| 2 | **Replatform added** as a project type. | User, 2026-08-05 | `D-HL-TYPES-01` §2 |
| 3 | **Three Shopify architectures**, not two hosting sub-variants of one. | User, 2026-08-05 | `D-HL-STACK-01` grid |
| 4 | **Plan-awareness written into the skill files**, not held implicitly. | User, 2026-08-05 | `D-HL-STACK-01` plan matrix |
| 5 | **Multipass is a build path in the skill**, not only a disqualifier. | User, 2026-08-05 | `D-HL-DISCOVERY-01` §2a |
| 6 | **Architecture B has a live client** — promoted from SUPPORTED-ON-DEMAND to full buildout, second in build order. | User, 2026-08-05 | `D-HL-STACK-01` |
| 7 | **Hosting ownership: client owns the account by default; WebDesk deploys into it. Managed service is a priced option; if declined it is explicitly out of scope.** | User, 2026-08-06 | `D-HL-STACK-01` "Hosting ownership — resolved" |
| 8 | **Data migration is owned by separate WebDesk skills/automation, not this arm. This arm owns the audit of the existing site against the SOW.** | User, 2026-08-06 | `D-HL-TYPES-01` scope boundary; `D-HL-DISCOVERY-01` audit primacy |
| 9 | **Headless Support / Retainer is a sixth engagement type, owned by this arm** — ongoing maintenance and tickets run through this skill, not a separate commercial skill. | User, 2026-08-06 | `D-HL-TYPES-01` §6 |

---

## 4. Questions still open — master's ruling requested

| # | Question | Raised in |
|---|---|---|
| 1 | **What framework does architecture C use?** Leaving it open is what turns every C engagement into a bespoke build. Note the consistency test: B was promoted because a named client requires it — **is there a named client for C?** If not, C arguably belongs at SUPPORTED-ON-DEMAND by the same reasoning that promoted B. | `D-HL-STACK-01` OQ1 |
| 2 | **Retainer commercial parameters.** The type itself is settled (§3 item 9). Two numbers this window cannot set: (a) the **per-ticket size threshold** above which a ticket becomes a change order — without a number the boundary is argued monthly with the client; (b) whether retainers carry a **response-time commitment**. Both proposals currently assume no SLA; if that is wrong, `D-HL-STACK-01` and `D-HL-SEC-01` both change. | `D-HL-TYPES-01` §6, OQ1 |
| 3 | **Who owns operational responsibility when the client declines managed hosting?** Ownership of the *account* is settled; ownership of patching, monitoring, incident response and CalVer tracking is not. Recommend a standard SOW line, e.g. *"Client owns hosting, monitoring and incident response. WebDesk responds on request at prevailing hourly rates, no response-time commitment."* | `D-HL-STACK-01`, `D-HL-SEC-01` |
| 4 | **Should the classified app inventory be a shared cross-engagement register?** If yes, it needs a per-entry expiry, or it becomes a source of confidently stale answers. | `D-HL-APPS-01` |
| 5 | **Does preflight failure carry `D-QA-GATE-BLOCK` semantics?** The proposals assume yes. | `D-HL-ENV-01` |

---

## 5. Five `TODO-VERIFY` items that block specific assertions

From `VERIFIED-FACTS-shopify-bigcommerce.md`. None may be written as fact, estimated against, or quoted to a client until verified.

1. BigCommerce **GraphQL Storefront API** rate limits — governs architecture D.
2. Checkout branding / checkout UI extensions — Plus-gated or not — affects `D-HL-APPS-01` gate item 3.
3. Shopify Markets per-plan capabilities.
4. Hydrogen release support window — governs maintenance cadence quoted in SOWs.
5. `@shopify/hydrogen-react` current status and version — load-bearing for architecture C.

---

## 6. Disclosure — working-directory loss, 2026-08-06

On 2026-08-06 the working directory was found to contain only `D-HL-STACK-01-proposal.md` at **rev 1** and an obsolete escalation file. Six packet files that had been written were absent from disk. They have been **rebuilt from this window's own record**.

- `VERIFIED-FACTS-shopify-bigcommerce.md` and `D-HL-TYPES-01-proposal.md` carry a `rebuild_note` in frontmatter — they are faithful reconstructions, not byte-identical restorations.
- `D-HL-APPS-01`, `D-HL-SEC-01`, `D-HL-ENV-01` were rebuilt the same way and carry the same note.
- Every figure in the verification register was fetched from a live source on 2026-08-05 and each carries its source URL, so any number can be re-checked in seconds rather than taken on trust.

Master should treat the files in this packet as the current text and disregard any earlier copies.

---

## 7. Requested action

1. Ratify the six D-codes and add them to `_decisions/decision-inventory.md`.
2. Reserve the five forbidden-prefix ranges.
3. Rule on the five open questions in §4.
4. Ship the ratified decisions; this window reinstalls and then begins content buildout under `skills/headless/`.

Until ratification, **no content buildout under `skills/headless/` has begun or will begin** — `00-overview.md`, `01`–`11`, `architectures/*` and the project skills are all blocked on this escalation.

---

Last reviewed: 2026-08-06
Next review due: on master response
