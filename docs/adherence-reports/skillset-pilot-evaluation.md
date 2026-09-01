# Skillset Pilot Evaluation — Car Brite (Headless Build)

**Purpose:** CEO-facing review of the WebDesk AI Delivery System skillset, tested end-to-end on this project
**Filed by:** PM Agent
**Basis:** Real events from this project only — `project.json` (v28, 17 logged risks, full audit trail), the two prior adherence reports, and every gate/decision made across the engagement. No invented data.

---

## Scores

Not one number — three, because "the skillset" is really three different layers, and they performed very differently.

| Layer | Score | What it covers |
|---|---|---|
| **Process & governance** | **~90%** | Intake, SOW validation, gates, estimation, risk logging, credential handling |
| **Output fidelity (as delivered)** | **~40%** | Did the built pages match the supplied mockups without the client having to catch it |
| **Self-correction once triggered** | **~95%** | Once adherence verification actually ran, did it work correctly |
| **Blended overall (this pilot run)** | **~60-65%** | — |

The gap between "process" (90%) and "fidelity" (40%) is the whole story. Details below.

---

## 1. What genuinely worked (Process & governance — ~90%)

Real, verifiable, not a self-assessment:

- **G0 intake caught real problems before they became expensive.** SOW completeness scored 83/100, gaps correctly identified, clarification questions batched (not dripped) — matches `01-sow-intake-protocol.md` exactly.
- **Estimation caught a budget mismatch the client hadn't noticed.** The pattern-based estimate for a proper Designer Agent pass on this build was 30-60 hours — more than the entire 45-hour signed budget. The skillset surfaced this, didn't hide it, and the client's PM made an informed, on-the-record decision (`risks[R5]`, `design.path_deviation`).
- **Self-approval prohibition held throughout.** Every gate was approver-distinct from doer, every time — G1 and G2 both `CONFIRM`ed by Ajay Sir, not by the agent that did the work.
- **Audit trail is real and complete.** 28 versions of `project.json`, every decision, every fix, every rewrite logged with timestamps and reasoning — not reconstructed after the fact.
- **Credential handling held.** Every script that touches `.env` reads it internally; values never appeared in chat, across the entire project.
- **Hallucination discipline held.** Every Shopify GraphQL field, enum value, and API constraint used in the build was verified against real docs before use (`HEADLESS-HALLUCINATION-01`) — including catching and fixing a fabricated `filters` argument and an invented `product.badge` field before they shipped.
- **Risk log is a real risk log, not decoration.** 17 risks logged, 10 mitigated with evidence, 7 still open and correctly still open — nothing quietly closed without proof.

This layer is the actual differentiator of a PM-agent-driven system over a plain "build me a site" prompt, and it performed close to as advertised.

---

## 2. What didn't work (Output fidelity — ~40%)

This is what you and the client actually see, and it's where the pilot fell down. Two distinct causes — not one:

### 2a. A skillset gap: no safety net when the fidelity-guarantee mechanism is turned off

`09-html-mockup-standards.md` is a real, well-built mechanism — Designer Agent builds the mockup from tokens, runs 8 automated checks, and Frontend Agent's job becomes "mostly mechanical" with a stated **<5% visual diff target**. That's the skillset's actual answer to "will the build match the mockup."

It never ran on this project. Standard cost was 30-60h against a 45h total budget, so it was skipped (§1, disclosed and approved). **The skillset gap is what happens next: nothing.** There is no fallback process, no reduced-scope checklist, no "if you skip Designer Agent, do X instead" — the skillset just has Frontend Agent build "directly against the references," by eye, with no structural check at all. Compare that to the process it replaced (token files + 8 automated validations) and the gap is obvious. **This is a real hole in the skillset, not a one-off mistake** — any project that takes the budget-driven "reference-only" path will hit the same failure mode.

### 2b. A skillset gap: adherence verification exists but nothing triggers it

`07-adherence-verification.md` is genuinely well-designed — sprint/milestone/project-level checks, PASS/PASS_WITH_FLAGS/FAIL, evidence-based. When it finally ran on this project, it worked exactly as designed (see §3). **But it never ran on its own.** It's supposed to fire automatically before G4 opens. In practice, S2.2/S3.1/S3.2 sat in `qa` status through multiple "this is done" claims across several sessions, and the actual adherence check only ran because the client insisted on a formal review. **A check that only runs when the client demands it isn't really a check — it's a report you write after getting caught.**

### 2c. Execution mistakes on top of the two gaps above

Once Frontend Agent was building by eye with no structural check, real avoidable mistakes compounded it — logged honestly in `risks[R8, R9, R11, R13]`: incomplete first-pass reference checking, three passes where the header stayed generic scaffold, and — the most consequential one — verifying visual fidelity at a narrow browser width where responsive typography looks deceptively correct even when wrong at real desktop size. That last one alone let a sitewide bug (every button was the wrong shape) survive two separate "fidelity complete" claims.

---

## 3. What worked once it actually ran (Self-correction — ~95%)

When the adherence-verification protocol was finally invoked (`sprint-S2.2-design-adherence.md`), it did exactly what its spec says: read the spec, read what was built, compared them, reported FAIL with named evidence rather than fudging a pass. Same with the literal-extraction method used afterward — once actually applied, it found and fixed real, specific, verifiable gaps every time it ran (three rounds on the homepage, one on the collection page, each with a concrete before/after). **The skillset's quality mechanisms work when triggered. The problem is entirely about triggering, not capability.**

---

## 4. Skillset mistakes — summary for the CEO

1. No fallback checklist for the "reference-only, skip Designer Agent" path — the fidelity guarantee just silently disappears.
2. Adherence verification is not wired to actually fire automatically before a sprint is called done — it's manual/reactive.
3. `09-html-mockup-standards.md` assumes Designer Agent authored the mockup (token files, semantic CSS). It has no guidance for a client-supplied, externally-built interactive prototype (this one was a compressed, self-unpacking bundler export from a third-party tool) — extracting real values from that required improvising a decompression method mid-project because the skillset had nothing for this case.
4. No standard browser-viewport-width requirement anywhere in the QA/frontend knowledge base — this let a real sitewide bug pass "verification" twice.

---

## 5. Where the process (not just the AI) contributed

Being fair to the skillset means being fair about the other side too:

1. **The G2 approval note buried the real tradeoff.** `path_deviation` is accurate and honest, but it reads as a scheduling/cost note, not as "you are giving up the <5% fidelity guarantee entirely." A clearer headline risk statement at that gate would have set expectations correctly from day one instead of three complaint rounds later.
2. **Feedback across rounds was holistic** ("not proper," "still 30-40%") rather than pointing at specific sections. That's a completely reasonable way for a client to give feedback — but it meant every round required a fresh full sweep instead of a targeted fix, which is part of why this took multiple passes instead of one.
3. **No Product Page mockup was ever supplied**, despite PDP build work proceeding — confirmed again this session, five checks in a row across the project. This is a missing input, not a skillset defect, but it means PDP fidelity can't be evaluated at all right now.

---

## 6. Recommendation

The process/governance layer (§1) is genuinely strong and is the part worth showing off. The output-fidelity layer (§2) has two specific, fixable holes — not a vague "AI isn't good enough" problem:

1. Give the "reference-only" path a real fallback checklist (a literal-extraction requirement, exactly like the one improvised and proven on this project) instead of "build by eye, hope it's close."
2. Wire adherence verification to actually block G4 automatically instead of requiring the client to demand it.

Fix those two, and the ~40% output-fidelity score on this pilot should be much closer to the ~90% the governance layer already achieves — the mechanisms to get there already exist in the skillset, they just aren't required to run.

---

*Filed by PM Agent. Grounded entirely in this project's own logged history — no estimate in this report is invented.*
