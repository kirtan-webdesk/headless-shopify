---
proposal_id: D-HL-TYPES-01
revision: 3
status: RATIFIED
proposed_by: Headless skill-dev window (Claude)
proposed_date: 2026-08-05
revised_date: 2026-08-06
revision_reason: "rev 3 — user ruling 2026-08-06: Headless Support / Retainer is confirmed as a sixth engagement type owned by this arm, for ongoing maintenance and tickets. rev 2 — data migration is owned by separate WebDesk skills and automation, not by the Headless arm; Replatform's migration workstream becomes a named handoff. Reconstructed after working-directory loss."
rebuild_note: "Rebuilt 2026-08-06 from this window's own record after the working directory lost all files except D-HL-STACK-01 rev 1. Structure and rules are faithful; exact wording of rev 1 is not guaranteed. Master should treat this as the current text."
ratified_by: master (v1.11.17)
related: D-HL-STACK-01, D-HL-DISCOVERY-01, D-SOW-04, D-PM-04
applies_to: [headless]
severity: high
---

# D-HL-TYPES-01 (PROPOSED, rev 3) — Headless Project Types

## Master reconciliation (v1.11.17)

**Status:** RATIFIED by master 2026-08-07 in v1.11.17. Retainer commercial parameters ruled:

- **Per-ticket threshold:** ~~open~~ **RULED v1.11.17 = 8 hours.** Above becomes change order.
- **Response-time SLA:** ~~open~~ **RULED v1.11.17 = NO SLA.** Matches declined-hosting-management posture.
- Both defaults reviewed after 10 real retainer engagements.

Precedence per D-KB-FIDELITY-01 v1.11.21 amendment: **inventory authoritative for status; this proposal authoritative for detail.**

---

> **Status: PROPOSED — awaiting master ratification.**

---

## Decision (one line)

Headless work is classified into **five project types plus one ongoing engagement type**, each a distinct skill with its own scope, discovery obligations and estimating basis. For the five project types the classification is determined at **G0**, recorded in the project record, and drives which skill loads. The sixth type — **Headless Support / Retainer** — is not project work and does not pass through G0; it has its own intake, its own commercial shape, and a hard boundary against the five (§6).

---

## The discriminator

The types are not five names for "a headless project." They are separated by one question: **which layer is changing?**

| Type | Backend before | Frontend before | The question that identifies it |
|---|---|---|---|
| **New Build** | none | none | "Is anything live today?" → No |
| **Replatform** | a *different* platform | that platform's frontend | "Is the commerce backend itself changing?" → Yes |
| **Migrate-to-Headless** | Shopify / BigCommerce | a theme | "Same backend, but the frontend stops being a theme?" → Yes |
| **Redesign** | Shopify / BigCommerce | already headless | "Already headless, and the design is changing?" → Yes |
| **Framework Upgrade** | Shopify / BigCommerce | already headless | "Nothing changes except the version?" → Yes |

If two answers are yes, it is a **combination project** — see the cross-cutting rules.

**Type 6 is deliberately absent from this table.** The discriminator asks "which layer is changing," and the answer for a retainer is "none, continuously." Forcing it into the table would break the one thing the table does well. It is reached by a different route: an engagement that is already live, with no defined end state (§6).

---

## 1. New Build

No existing store, or an existing store from which nothing carries over.

- No data migration, no app inventory, no URL parity, no functional parity audit.
- **The only type where the discovery audit does not block pricing** (`D-HL-DISCOVERY-01`) — there is nothing to audit.
- Still requires: architecture selection, environment preflight (`D-HL-ENV-01`), the app *qualification* gate for any app proposed for the new build (`D-HL-APPS-01`), and the "what you must build yourself" inventory if the architecture is C.
- Estimating basis: the design surface and the commerce feature list. Not a theme benchmark.

## 2. Replatform

The commerce backend changes — for example Magento → Shopify + Hydrogen.

The heaviest type, because everything below the frontend moves too. Six mandatory workstreams:

| # | Workstream | Owner |
|---|---|---|
| 1 | **Data migration** — products, variants, customers, orders, content | **Separate WebDesk migration skill / automation. NOT this arm.** See the scope boundary below. |
| 2 | **URL and SEO parity** — old URL inventory → redirect map → implementation | **Shared.** Migration side supplies the old URL inventory; the headless arm owns the redirect implementation in the storefront. |
| 3 | **Functional parity audit** — every feature on the old site, matched or explicitly dropped | **This arm** (`D-HL-DISCOVERY-01`) |
| 4 | **Customer credential migration** | **Migration skill.** Headless arm owns the login/reset UX consequence. |
| 5 | **Integration re-pointing** — ERP, CRM, PIM, OMS, fulfillment, analytics | **Shared** — inventory by this arm, execution per integration |
| 6 | **Cutover plan** — DNS, freeze window, rollback, verification | **Shared**, named owner per step |

**Workstream 3 carries a client-signed "dropped" column.** Every feature on the old site is matched to its replacement or explicitly recorded as dropped, and the client signs the dropped list. Unsigned, "we assumed you didn't need that" becomes a dispute at UAT.

**Workstream 4, stated plainly because it is a marketing event and not a technical footnote:** customer **passwords do not transfer between platforms**. Every customer is forced to reset. Who tells them, when, and through which channel is a launch-plan item that belongs in the SOW.

### Scope boundary — data migration is NOT owned by the Headless arm *(user directive, 2026-08-06)*

WebDesk has separate skills and automation for data migration setup. The Headless arm does **not** duplicate them, does not write migration scripts, and does not own the migration estimate.

What the Headless arm **does** own on a Replatform:

- **The audit.** Validate every existing feature on the live site against the scope of work before anything is built, so nothing is missed. This is `D-HL-DISCOVERY-01`, and it is the arm's primary contribution to a Replatform.
- **The handoff interface.** The arm hands the migration skill a named entity list (what must exist in the target for the storefront to function), the URL inventory requirement, and the credential-reset consequence. It receives back a completion confirmation, and **cutover does not proceed without it.**
- **The frontend consequences** of migration decisions — redirect implementation, login/reset UX, and any storefront behaviour that depends on migrated data shape.

**The risk this boundary creates, stated rather than hidden:** a handoff is a place where things get dropped. The arm must not treat "migration is someone else's skill" as "migration is not my problem" — if the entity list was never handed over, or the completion confirmation never came back, that is the headless arm's gate failure, not the migration skill's.

## 3. Migrate-to-Headless

Same backend, theme → headless frontend. The client keeps their products, orders and customers.

- **No data migration.** This is the type most often confused with Replatform, and the confusion inflates estimates.
- **The full app-compatibility problem lands here.** Everything the theme was doing for free — app blocks, ScriptTags, theme app extensions, analytics, consent — has no theme to attach to any more. Each one is a build item or a replacement (`D-HL-APPS-01`).
- URL parity still applies. The backend did not move, but the frontend routing did.
- Discovery audit mandatory before pricing.

## 4. Redesign

An existing headless storefront gets a new design.

**Recorded explicitly: this window originally recommended folding Redesign into New Build. The user overrode that**, on the grounds that a client with an existing Shopify headless store needs their existing functionality carried over, their new functionality scoped, and their apps re-examined. The override is correct and this type stands on its own.

The work is dominated by **carryover analysis**, not by design:

- What existing functionality survives, unchanged, and must not regress.
- What functionality is being added.
- Which apps and integrations are already wired, and whether the redesign disturbs them.
- What the current architecture is — a redesign does not change it, and proposing an architecture change inside a redesign is a different project.

Discovery audit mandatory before pricing. The parity obligation is against the *client's own current site*, which makes an unsigned parity list even more dangerous than in a Replatform.

## 5. Framework Upgrade

Nothing changes except the version.

- Hydrogen ships on a **CalVer train** (`2026.4.x`) aligned to **Storefront API versions**, not SemVer. An upgrade is therefore an **API-version migration** with a support window — breaking-change review, deprecated-field replacement, regression testing.
- The react-router pin is the standing trap: Hydrogen `2026.4.4` peer-pins react-router **`~7.16.0`** while react-router's own latest is **8.3.0**. Upgrading react-router to "latest" during a Hydrogen upgrade is a defect.
- Discovery audit applies in reduced form: dependency audit against the new runtime, breaking-change review, and a regression scope. The app inventory is re-checked, not re-built.
- **This type exists because the alternative is that storefronts silently go stale.** A headless storefront with no maintenance arrangement drifts out of support by default. Type 6 is how that is prevented commercially.

---

## 6. Headless Support / Retainer  *(user ruling, 2026-08-06 — owned by this arm)*

**Confirmed by the user on 2026-08-06: this arm owns ongoing maintenance and ticket work for live headless storefronts.** It is a sixth type, not a project type.

### Why it is structurally different from types 1–5

| | Types 1–5 | Type 6 |
|---|---|---|
| End state | Defined, signed, delivered | None — it runs until cancelled |
| Estimating basis | Scope | Capacity per period |
| Discovery | Once, before pricing | Once at onboarding, then continuous |
| Gate behaviour | G0 → G6 once | Per ticket, at whatever gate the ticket touches |
| What "done" means | UAT sign-off | Ticket closed; the engagement continues |

Pricing it as a project, or running it through G0 per ticket, breaks both. It needs its own intake.

### What the retainer covers

1. **Ticket work** — bugs, small enhancements, content and merchandising changes that require code, third-party script additions.
2. **CalVer version tracking.** Hydrogen ships on a `2026.4.x` train aligned to Storefront API versions. Somebody must be watching the train. Under a retainer that is us; without one it is nobody. **Tracking is in scope; performing a major version upgrade is type 5** — see the boundary below.
3. **API deprecation response.** Storefront API and Customer Account API fields get deprecated on a schedule. This is scheduled, foreseeable work, not an incident.
4. **Dependency and security patching** — including the peer-pin discipline in `D-HL-SEC-01` §8. "Latest" is still wrong under a retainer.
5. **App-change response.** A vendor ships or withdraws a headless SDK and the classification in `D-HL-APPS-01` changes. Under a retainer, re-classification has an owner.
6. **Hosting and operations — only if explicitly purchased.** Per `D-HL-STACK-01` rev 4 the client owns the hosting account by default. A retainer does **not** silently absorb monitoring, incident response or on-call. If the client wants those, they are named and priced inside the retainer; if they are not named, they are out.

### The boundary that keeps this from becoming free project work

The commercial failure mode is obvious and it is not hypothetical: retainer tickets grow until the retainer is delivering a project at ticket rates.

**A ticket becomes a change order when any of the following is true:**

- It changes the **architecture** (`D-HL-STACK-01` — architecture is locked at signature; a retainer does not unlock it).
- It changes the **design system** rather than applying it.
- It introduces a new **third-party integration** that has not passed the `D-HL-APPS-01` qualification gate.
- It requires a **framework version upgrade** — that is type 5, priced as type 5, even when raised by a retainer client.
- It exceeds the retainer's per-ticket size threshold, which **must be a number in the retainer agreement**, not a judgement call made under pressure.

The last one is the load-bearing item. A retainer with no numeric threshold has no boundary, and the argument about whether something is "in the retainer" then happens with the client, monthly.

### Onboarding requirement — non-negotiable

**A retainer over a storefront WebDesk did not build requires a full discovery audit before the first ticket** (`D-HL-DISCOVERY-01`), plus an environment preflight (`D-HL-ENV-01`). Taking maintenance responsibility for an unaudited codebase means inheriting its defects at our own cost, silently, at ticket rates. The audit is billable onboarding work, not a goodwill gesture.

For a storefront WebDesk did build, the project's own discovery artifacts carry over, and onboarding is a handover check rather than a fresh audit.

### What must be recorded per retainer

Architecture, project type of the original build, plan (Shopify or BigCommerce tier), pinned framework version and its support status, hosting owner, secret store location and who can write to it, the classified app inventory with dates, and the per-ticket size threshold.

---

## Cross-cutting rules

1. **The type is determined at G0** and recorded in the project record, alongside the architecture (`D-HL-STACK-01`). It drives which project skill loads and which discovery sections are in scope.
2. **Combination projects are priced as the sum, not the max.** Replatform + Redesign in one engagement is both bodies of work. The instinct to say "we're rebuilding the frontend anyway, so the redesign is free" is what this rule exists to stop.
3. **Discovery blocks pricing for every type except New Build** (`D-HL-DISCOVERY-01`).
4. **One SOW = one platform** (`D-SOW-04`). A client running both Shopify and BigCommerce headless storefronts is two SOWs.
5. **Never estimate any of these against a theme build.** *(User-supplied, verbatim in `D-HL-DISCOVERY-01`: "Do not estimate a Hydrogen project as a normal theme redevelopment.")*
6. **A type may not be changed after signature without a change order.** Reclassifying a Migrate-to-Headless as a Replatform mid-flight is a re-price, not a correction.
7. **Every types 1–5 SOW ends with a retainer decision.** The client either buys type 6 or signs that they have declined it, and the decline records that version tracking, deprecation response and patching are then unowned. This is the mechanism that stops "the storefront went stale" from becoming our problem at renewal.
8. **A retainer never absorbs project work.** The change-order triggers in §6 are the boundary, and the per-ticket size threshold is a number in the agreement.

---

## Anti-patterns

1. Classifying a Migrate-to-Headless as a Replatform and pricing a data migration that does not exist.
2. Classifying a Replatform as a Migrate-to-Headless and discovering the data migration in sprint 2.
3. Treating a Redesign as cosmetic and skipping the carryover analysis.
4. Treating a Framework Upgrade as `npm update`.
5. Upgrading react-router to its latest release during a Hydrogen upgrade.
6. Pricing a combination project at the cost of its largest component.
7. Selling a headless build with no maintenance arrangement and not saying that the storefront will go stale.
8. Letting the client's description of the project set the type instead of the discriminator table.
9. Assuming data migration is handled because another skill owns it, without the entity list being handed over or the completion confirmation coming back.
10. Running a parity audit without a client signature on the dropped-functionality column.
11. Taking a retainer on a storefront WebDesk did not build, without a discovery audit and preflight first.
12. Writing a retainer with no numeric per-ticket size threshold, then arguing about scope monthly.
13. Delivering a framework version upgrade inside a retainer because the client asked nicely — that is type 5.
14. Letting a retainer imply monitoring, incident response or on-call that was never named or priced.

---

## Open questions requiring answers before ratification

1. ~~**Is there a sixth type — Headless Support / Retainer?**~~ **RESOLVED — user, 2026-08-06: yes, and it is owned by this arm** ("we want to have headless support and retainer on this skill, so we can use this skill for ongoing maintenance and tickets"). Written up as §6. **Two sub-questions this ruling creates, for master:** (a) the **per-ticket size threshold** is a commercial number this window cannot set — it must come from master or the commercial owner; (b) does the retainer carry a **response-time commitment**? `D-HL-STACK-01` rev 4 and `D-HL-SEC-01` both currently assume none, and the drafted SOW line says so explicitly. If retainers do carry an SLA, that line changes and the pricing basis changes with it.
2. **Does Replatform ever run *from* Shopify?** Today the type is defined as "another platform → Shopify/BigCommerce headless." If WebDesk ever takes Shopify → BigCommerce work, the type needs a direction field. Assessed as low urgency — scope it out and revisit on a real deal.

---

## Ask to master

Ratify D-HL-TYPES-01 rev 3 — the five project types, the **data-migration scope boundary and handoff interface**, and the new **type 6 Headless Support / Retainer** with its change-order boundary — and add to canonical `_decisions/decision-inventory.md`.

Two items need master's number rather than this window's judgement: the **per-ticket size threshold** and whether retainers carry a **response-time commitment**.

---

Last reviewed: 2026-08-06
Next review due: 2026-11-06
