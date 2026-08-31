---
tier: 0
load_when: ["platform-headless", "headless-platform-active", "g1-plan-stage", "g4-sprint-qa", "g6-prelaunch-stage", "code-production", "agent-code-review"]
description: "The spec-conformance gate per D-HL-SPEC-01, built from K4 pilot feedback. The arm verified inputs exhaustively and never verified outputs — this file is the missing half. Covers the G1 conformance ledger (every SOW requirement becomes an observable acceptance test), the G4 walk that blocks sprint exit, the design-fidelity diff against the approved D-DES-01 mockup, and the static-where-dynamic-was-required failure. Blocking under D-QA-GATE-BLOCK. Carries HL-SPEC-001..004."
applies_to: [headless]
decision_refs: [D-HL-SPEC-01, D-DES-01, D-PM-04, D-QA-GATE-BLOCK, D-KB-FIDELITY-01, D-HL-TYPES-01]
last_reviewed: 2026-08-27
next_review_due: 2026-11-27
---

# 13 — Spec Conformance

> Governing decision: **`D-HL-SPEC-01`** (RATIFIED v1.11.31, Headless-only). Built from **K4 pilot feedback**, not from theory.
>
> **Tier 0 — always loaded when this arm is active.** The other two stage gates are Tier 1; this one is Tier 0 because the failure it prevents is invisible to everyone downstream until a client sees it.

---

## 1. Why this file exists

The pilot produced four SOW-compliance failures: a **static homepage** where the SOW required a Metaobject-driven dynamic one; a **~70% match** to the approved design; **navigation broken** by unrelated changes; **~70–80% responsive** parity with fixes that regressed other areas.

They are not four problems. They are one:

> **The arm verified inputs exhaustively and never verified outputs.**

Every other gate here fires before code exists or about how code is written — the discovery audit blocks **pricing**, preflight blocks **build start**, the ship gate blocks **release on security**. **Nothing asked whether the built thing was the thing that was promised.**

Nineteen CRITICAL codes existed before this file. Not one covered build-versus-spec fidelity, which means **an agent could pass every gate in this arm while delivering a static homepage against a SOW that said dynamic.** It did.

**The calibration point, so this file is not over-applied:** the pilot reported no secret in a bundle, no token-class error, no cart or money defect, no caching leak, no quota incident, no unclassified app, no invented API. The arm's existing gates held. **This is an asymmetry being corrected, not a rewrite.**

---

## 2. The conformance ledger — built at G1

**Every SOW requirement becomes a row before build starts.**

| Requirement *(verbatim from the SOW)* | Observable acceptance test | Route / component that satisfies it | Verified by | Date |
|---|---|---|---|---|

**Four columns are load-bearing and one is not.** The requirement is quoted **verbatim** — a paraphrased requirement is a re-negotiated one. The acceptance test must be **observable**: something a person or a script can execute and get a yes or no from. The route/component names where the obligation lives, so a later change to that file is visibly a change to a signed obligation.

### What makes a test observable

The pilot's failure is the clearest teaching case. The SOW said:

> *"Configure Shopify Metaobjects to allow dynamic management of homepage content, including banners, featured collections, promotional sections, and configurable content blocks."*

**Unobservable** (what was effectively used): *"homepage is dynamic."* A static homepage with a hardcoded banner passes a reading of that on day one, because "dynamic" is an adjective and nobody has to prove an adjective.

**Observable:** *"Homepage sections resolve from Metaobject entries. Editing a Metaobject entry in admin changes the rendered homepage with no deploy and no code change. Banners, featured collections, promotional sections and configurable content blocks are each independently editable."*

**That test fails on day one against a static homepage.** It does not wait for a client review to fail. That is the entire difference between the two, and it is why the ledger is written at G1 rather than assembled at G4.

### Rules

- **A requirement with no observable test is not ready to build.** Write the test or escalate the ambiguity — do not start and infer.
- **One requirement, one row.** A compound SOW sentence becomes several rows. The pilot's Metaobject sentence is four testable obligations, not one.
- **Every row names a verifier.** "The team" is not a verifier.
- **Rows are added when scope changes**, at the same moment the change order is written — not reconstructed afterwards.

---

## 3. The G4 walk — where the gate actually fires

**At sprint exit, the ledger is walked. Every row is executed.**

| Outcome | Consequence |
|---|---|
| Every row has a passing, dated test | Sprint exits |
| Any row has **no test** | **Blocked** (`HL-SPEC-002`) |
| Any row has a **failing** test | **Blocked** (`HL-SPEC-001`) |
| Any row was **never verified**, only asserted complete | **Blocked.** "Done" from the person who built it is not a verification. |

Carries **`D-QA-GATE-BLOCK`** semantics: **it halts. It does not become a backlog ticket, a caveat, or a percentage.**

**On percentages.** The pilot reported "70% design match" and "70–80% responsive." **A percentage is what appears when nobody set a pass condition** — it is a negotiation opening, not a measurement. A conformance row is binary. If a requirement genuinely has degrees, the degrees are written into the acceptance test as a threshold before build, by someone with authority to accept the remainder.

---

## 4. Design fidelity — `D-DES-01`'s other half

`D-DES-01` mandates **HTML mockups** as the design deliverable. The arm used that once at **G2** — contrast, focus indicators and keyboard paths are checkable pre-build — **and then never referred to the mockup again.**

**An approved HTML mockup is a machine-comparable artifact.** That is the property that makes `D-DES-01` more than a preference, and the arm was not using it.

At G4, the built route is compared against the approved mockup on:

| Dimension | What is compared |
|---|---|
| **Typography** | Computed font family, size, weight, line-height per text role |
| **Colour** | Computed values for text, background, border, interactive states |
| **Spacing** | Computed margin, padding, gap at section and component level |
| **Section order and presence** | Every section in the mockup exists, in order. **A missing section is a missing requirement, not a styling difference.** |
| **Breakpoint behaviour** | The above, re-run at **each declared viewport** — not just the widest |

**Two things this changes.** *"70% match"* stops being possible, because the number exists before the client produces it — and a number we generated is a work item, while a number the client generated is a dispute. And responsive parity stops being a separate concern: it is **the same comparison at each breakpoint**, which is why the pilot's failures 2 and 4 have one fix.

**Scope honesty.** Pixel-identical is not the standard and is not achievable across real content. The standard is **no unexplained divergence**: every difference between mockup and build is either within a declared tolerance, or is a recorded, accepted deviation with a name against it. Undocumented drift is the failure.

---

## 5. Static where dynamic was required

Its own code (`HL-SPEC-003`) because it is its own failure mode, and because it is the one that looks finished.

A statically-implemented version of a dynamic requirement **renders correctly, demos well, and passes visual review.** Nothing about it appears broken. It fails only when someone tries to change the content — which is usually after handover, and is exactly the capability the client was paying for.

**The test is always the same shape:** change the data through the mechanism the SOW named, without a deploy, and confirm the rendered output changes.

If a dynamic requirement is being staged — static first, dynamic later — that is **a sequencing decision recorded in the ledger with a date**, not an implementation detail. An undated "we'll wire it up later" is how the pilot's homepage shipped.

---

## 6. Regression containment

The pilot's failures 3 and 4 share a symptom: **changing one area broke another.** Navigation and responsive layout regressed from work aimed elsewhere.

`knowledge/01-coding-standards.md` §7 points testing at money, cart, webhooks and cache keys, and explicitly deprioritises snapshot tests. **That call was right for commerce logic and wrong for a design-system build** — and this file's §7 amendment corrects it.

The surfaces that need explicit coverage are the ones **whose breakage is invisible to the person causing it**: navigation and mega-menu, header and footer, shared layout and page shell, and the design tokens everything else consumes. A developer changing a homepage section has no reason to open the header, which is precisely why the header breaks.

**A conformance row for a shared surface is walked on every sprint exit, not only the sprint that built it.** Otherwise the ledger verifies each requirement once and never notices it later becoming untrue.

---

## 7. The self-declared acceptance criterion — ship blocker, not note

**Ratified process pattern, `D-HL-SPEC-01`.**

`knowledge/12-discovery-audit.md` contained, before the pilot: *"If the arm ships without those, it has not improved on the pilot"* — naming automated Metaobject structure generation as one of four items. **The arm shipped without it and failed the pilot on precisely that item.** Recorded twice, acted on neither time.

**A prediction of failure written in prose is not a control.** From now on, when this arm's `knowledge/` declares its own acceptance criterion, that criterion is a **release blocker on the arm's bundle**, not a sentence someone may read.

**The rule that follows:** do not write *"the arm must add X or it has not improved"* unless you are willing to have that sentence block the next release. If X is not release-blocking, write it as a tracked gap with an owner instead. **The two are different claims and the arm conflated them once already.**

---

## 8. CRITICAL codes — `HL-SPEC-*`

Reserved by master in v1.11.31. Defined here.

### `HL-SPEC-001` — Requirement with a failing acceptance test at sprint exit

- **Blocks:** G4. **Applies to:** all.
- **Condition:** a conformance row's test executes and does not pass.
- **Detect:** walk the ledger at sprint exit; execute every row.
- **Not satisfiable by a percentage.** A partially-passing test is a failing test unless a threshold was written into the test before build.

### `HL-SPEC-002` — SOW requirement with no acceptance test

- **Blocks:** **G1 and G4.** **Applies to:** all.
- **Condition:** a requirement exists in the SOW with no row, or a row exists with an empty or unobservable test.
- **Detect:** reconcile the ledger against the SOW line by line. Every requirement, one or more rows.
- **Why it blocks at G1 too:** an untestable requirement discovered at G4 has already been built wrong. **This is the code that would have caught the pilot's first failure**, five weeks before the client did.

### `HL-SPEC-003` — Delivered static where the specification required dynamic

- **Blocks:** G4. **Applies to:** all.
- **Condition:** a requirement specifying content management, configurability or dynamic behaviour is satisfied by hardcoded output.
- **Detect:** change the data through the named mechanism, without a deploy. The rendered output must change.
- **Fix:** implement the mechanism, or record a **dated** staging decision in the ledger. An undated "wire it up later" is this code.

### `HL-SPEC-004` — Built output not verified against the approved design artifact

- **Blocks:** G4. **Applies to:** all.
- **Condition:** a route with an approved `D-DES-01` mockup ships with no recorded comparison, or with unexplained divergence in typography, colour, spacing, section order or breakpoint behaviour.
- **Detect:** run the §4 comparison at every declared viewport. Record it.
- **Fix:** correct the build, or record the deviation as accepted **with a name against it**. Unexplained drift is the failure; accepted deviation is not.

---

## Anti-patterns

1. Treating "the code is correct" as evidence that the scope was delivered. This arm's other nineteen codes all pass on a static homepage.
2. Writing an acceptance test that an incorrect implementation would also pass — "homepage is dynamic" rather than "editing a Metaobject entry changes the rendered homepage with no deploy."
3. Collapsing a compound SOW sentence into one ledger row.
4. Paraphrasing a requirement into the ledger instead of quoting it.
5. Assembling the ledger at G4 from what was built, rather than at G1 from what was promised.
6. Reporting a percentage where a pass condition was required.
7. Accepting "done" from the person who built it as verification.
8. Using the approved mockup once at G2 and never comparing against it again.
9. Comparing against the mockup at the widest viewport only.
10. Treating a missing section as a styling difference rather than a missing requirement.
11. Letting the client produce the fidelity number first — at that point it is a dispute, not a work item.
12. Shipping static for a dynamic requirement because it renders correctly and demos well.
13. Recording "we'll wire it up later" with no date.
14. Testing money and cart logic thoroughly while leaving navigation, header and shared layout uncovered — the surfaces whose breakage is invisible to whoever caused it.
15. Walking a shared-surface conformance row only in the sprint that built it.
16. Converting a blocked conformance row into a backlog ticket so the sprint can close.
17. Writing "the arm must add X or it has not improved" without being willing to have that sentence block the release.

---

Last reviewed: 2026-08-27
Next review due: 2026-11-27
