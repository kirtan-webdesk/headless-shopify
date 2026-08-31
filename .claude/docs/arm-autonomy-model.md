# Arm Autonomy Model

**Ratified:** 2026-08-27 (v1.11.35, D-ARM-AUTONOMY-01)
**Complements:** D-MASTER-SCOPE-01

## Why this exists

Before v1.11.35, every arm change routed through master and back to the developer via the user. When multiple arms iterated in the same day, the user became the courier for every fold. The pattern got named the day master shipped four headless releases in one hour.

Master's cross-arm discipline (D-MASTER-SCOPE-01) was still correct. The mirror rule was missing: arms should be free to ship their own arm-scope content without master mediation.

## The split

| Scope | Owner | Ships via |
|---|---|---|
| `skills/{arm}/` (SKILL.md, knowledge/, architectures/, pointers/, projects/, templates/) | Arm window | `arm-ship-bundle.sh` → developer, direct |
| `skills/_spine/`, `skills/_contracts/`, `skills/_decisions/`, `tools/`, `forbidden-global.md`, `README.md` | Master | `ship-bundle.sh` → all arms → developer |
| Anything touching more than one arm | Master (arm escalates) | `ship-bundle.sh` after arm HANDOFF |

## Per-arm status

| Arm | Status | Reason |
|---|---|---|
| **shopify** | AUTONOMOUS | Proven through v1.11.5-v1.11.16, K4-equivalent pilot cycle complete |
| **wordpress-woocommerce** | AUTONOMOUS | Proven through v1.11.7-v1.11.14 Elementor/WC pilot |
| **headless** | AUTONOMOUS | K4 pilot ran; arm folded feedback across v1.11.31-34. The earned test is "has a pilot happened and has the arm learned from it" — met |
| **bigcommerce** | GATED, onboarding next cycle | Needs one back-and-forth with master to stand up local ship gate; then autonomous |
| **magento-adobe-commerce** | GATED, scaffold-only | No arm content shipping yet |

## Version scheme

Two streams, one install:

- **Arm bundle:** `webdesk-{arm}-arm-v{arm-semver}.zip` (e.g., `webdesk-headless-arm-v0.17.0.zip`). Ships directly from the arm window to the developer. Carries the arm's content + a pinned spine snapshot + a manifest.
- **Master bundle:** `webdesk-{edition}-v1.11.X.zip` unchanged. Ships when spine/contracts/tools/inventory change.

A developer's install carries both stamps. The arm version tells them what content they have; the pinned spine version tells them what governance the content was built under.

## Escalation channel

An arm files a HANDOFF to master when:

- A new decision is needed (D-code range, prefix reservation, KB slot extension, cross-arm rule)
- A spine bug is found
- A contract needs to change
- A tool needs to change
- A pattern needs to promote from one arm to spine

The HANDOFF is a markdown file with:

1. What the arm proposes
2. Why it is cross-cutting (not just arm-scoped)
3. What the arm has already tried
4. What master's approval unblocks

Master ratifies in inventory and ships a master release. Other arms pick up the change on their next arm-ship cycle.

## Convergence — on demand only

Arms send a "canonical pack" to master **only when there is an inventory-worthy change** — a new decision, a prefix reservation, a status change (like an arm hitting 1.0.0), a code range extension.

No forced cadence. Master's inventory lags arm state by the delay between arm change and arm choosing to escalate. That lag is the accepted trade for zero courier overhead.

Master's canonical inventory therefore records the state of the arm as of the last convergence pack, not as of the arm's latest release. A developer looking up an arm's exact version reads the arm bundle manifest, not master's inventory.

## What a developer sees

Same as before, with two changes:

1. Arm bundles arrive from the arm window directly, not via master.
2. The bundle carries a pinned spine snapshot — if it disagrees with an installed newer spine, the newer spine takes precedence and the arm needs a re-ship.

If the developer only installs one arm, none of this is visible. If they install two arms with different pinned spines, they get the newer of the two and can ask the older arm to re-ship.

## What master still does

- Ships spine, contracts, decisions, tools when they change
- Ratifies HANDOFFs from arms
- Runs convergence passes on demand
- Ratifies any decision that would set precedent for other arms

Estimated frequency after v1.11.35: 1-2 master releases per week, from the previous peak of four per hour.

## What arms cannot do without master

- Edit spine, contracts, decisions, tools
- Author cross-arm rules
- Ratify a decision that names other arms
- Extend a shared numbering range (D-code prefix, KB slot, forbidden code range)
- Change the ship gate itself

Any of these routes through master. The escalation path is a HANDOFF, not a self-ship.

## Failure modes disclosed

- **Arm-scope miscalled as cross-cutting.** An arm believes a change is arm-only when it should escalate. Mitigation: the escalation rule and D-KB-FIDELITY-01 name the sort of decision that should escalate; arms have been disciplined about this in the record so far.
- **Inventory drift is normal now.** Master's canonical inventory is authoritative for governance, not for arm content state. Convergence-on-demand is the reconciliation mechanism.
- **Divergent pinned spines.** Two arms installed with different pinned spines produce a mismatch; the newer takes precedence and the older arm re-ships. Disclosed to developer at install.

## Guardrails shipped in v1.11.35

- `tools/scripts/arm-ship-bundle.sh` — MVP arm-side release script. Runs `verify-edition-integrity.sh` scoped to arm content and emits the arm bundle with manifest.
- Per-arm status recorded in `_decisions/decision-inventory.md` under D-ARM-AUTONOMY-01.
- Governance doc (this file).

## Guardrails deferred

- **Reserved-scope hash check.** A cryptographic guardrail that would block `arm-ship-bundle.sh` if the arm has modified any master-reserved file. Needs master to publish `.master-reserved-checksums.json` first. Deferred one release cycle; arms operate on the honor system until then. Class of failure this prevents has not occurred in any prior release.
- **Convergence-pack format.** Format iterated after the first canonical pack arrives from an arm. MVP is: arm sends a diff and an inventory-worthy change list; master reads and merges.

## Rule of thumb for arms

> If I would have sent this to the user for master before v1.11.35, and it does not touch anything outside `skills/{my-arm}/`, I can ship it myself now. If I am about to touch anything else, that is a HANDOFF, not a self-ship.

## Rule of thumb for master

> If the change is not spine, not contracts, not decisions, not tools, and not cross-arm, it is not master's release. Someone else is authoring it and shipping it.

---

Last reviewed: 2026-08-27
Next review due: 2026-11-27
