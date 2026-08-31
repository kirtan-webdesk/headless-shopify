---
doc_type: packet-manifest
packet: headless-skill-dev
compiled_by: Headless skill-dev window (Claude)
compiled_date: 2026-08-06
status: READY TO SEND TO MASTER
applies_to: [headless]
---

# Packet manifest — Headless arm, proposals to master

**Send all eight files.** Earlier hand-offs contained only the files that had changed since the previous hand-off; that is why the count looked like it shrank. It did not. This is the complete, current packet and it supersedes every earlier copy.

---

## Send order

Read in this order — each file assumes the one above it.

| # | File | Rev | What it decides | Severity |
|---|---|---|---|---|
| 1 | `ESCALATION-to-master-headless-codes.md` | — | **Read first.** The ask: six D-codes, five forbidden-prefix ranges, five open questions, and the disclosure in §6. | high |
| 2 | `VERIFIED-FACTS-shopify-bigcommerce.md` | rebuilt 2026-08-06 | Not a decision. The source-of-truth register behind every number in the arm. Five `TODO-VERIFY` items. | reference |
| 3 | `D-HL-STACK-01-proposal.md` | **4** | The four architectures, **how one is selected** (three modes), hosting ownership, plan matrix, build order. | critical |
| 4 | `D-HL-TYPES-01-proposal.md` | **3** | The five project types, the discriminator, the **data-migration scope boundary**, and **type 6 Headless Support / Retainer** with its change-order boundary. | high |
| 5 | `D-HL-DISCOVERY-01-proposal.md` | **3** | The mandatory audit, audit primacy, the Multipass build path and its sequencing, the handoff register. | critical |
| 6 | `D-HL-APPS-01-proposal.md` | **2** | The four-way app classification and the five-question qualification gate. | high |
| 7 | `D-HL-SEC-01-proposal.md` | **2** | Token classification, env discipline, rate limiting, and the five-check ship gate. | critical |
| 8 | `D-HL-ENV-01-proposal.md` | **2** | Preflight checks, all-architecture and per-architecture, with halt behaviour. | high |

---

## Authority check

| Constraint | Status |
|---|---|
| Files created/modified under `skills/headless/` | **None.** Buildout is blocked pending ratification. |
| Files under `_spine/`, `_contracts/`, `_decisions/` | **Read only. None modified.** |
| `tools/scripts/*` | **Not touched.** |
| D-codes added to canonical inventory | **None.** Requested via escalation. |
| Version release issued | **None.** Only master ships. |
| Working location | `outputs/headless-skill-dev/` only |

---

## What master is being asked to do

1. Ratify six D-codes: `D-HL-STACK-01`, `D-HL-TYPES-01`, `D-HL-DISCOVERY-01`, `D-HL-APPS-01`, `D-HL-SEC-01`, `D-HL-ENV-01`.
2. Reserve five forbidden-prefix ranges: `HL-SEC-`, `HL-APPS-`, `HL-CACHE-`, `HL-CART-`, `HL-ISR-`.
3. Rule on five open questions (escalation §4) — the three that matter most commercially are **architecture C's framework**, **who owns operations when the client declines managed hosting**, and the **retainer's per-ticket threshold and SLA**.
4. Ship, so this window can reinstall and begin content buildout.

---

## Known gaps, stated rather than buried

- **Five `TODO-VERIFY` items** remain unverified. Two of them — BigCommerce GraphQL Storefront rate limits, and `@shopify/hydrogen-react` status — block pricing for architectures D and C respectively.
- **Architecture C has no named framework and, as far as this window knows, no named client.** Both facts should be settled together.
- **Two documents in this packet are reconstructions** after a working-directory loss on 2026-08-06 (`VERIFIED-FACTS`, `D-HL-TYPES-01`; three more were rebuilt the same day — `D-HL-APPS-01`, `D-HL-SEC-01`, `D-HL-ENV-01`). Each carries a `rebuild_note` in frontmatter. Rules and structure are faithful; exact prior wording is not guaranteed. Every verified figure retains its source URL and can be re-checked.
- **The retainer type is confirmed and written up (TYPES rev 3 §6), but its two commercial numbers are not set** — the per-ticket size threshold and whether it carries a response-time commitment. Both need master, not this window.

---

Last reviewed: 2026-08-06
Next review due: on master response
