---
tier: 2
load_when: ["agent-specific-detail"]
description: "How the PM Agent receives a SOW and decides what to do next. Determines if the SOW is complete enough to spec from, or if clarification is needed first."
---

# 01 — SOW Intake Protocol

> How the PM Agent receives a SOW and decides what to do next. Determines if the SOW is complete enough to spec from, or if clarification is needed first.

---

## What the PM Agent does at intake

1. Receive raw SOW (text or file path)
2. Extract structured fields from SOW
3. Compute completeness score
4. Identify gaps
5. If score < 60 → request clarification (batched)
6. If score ≥ 60 → proceed to spec generation (G0 passes)

---

## Step 1 — Receive SOW

SOW arrives from the orchestrator in one of these formats:

- Raw text pasted in chat
- File path: `/projects/[client]/sow.[md|pdf|docx]`
- Multiple files: contract + supplementary docs

If multiple files: read all, treat as a single combined SOW.

If file format is PDF or DOCX: read the file contents. If text extraction fails, surface to developer.

---

## Step 2 — Extract structured fields

Parse the SOW for these fields (mapped to `project.json` + spec.md):

### Project Identity
- Platform (Shopify, WordPress, BigCommerce, Magento, Node.js)
- Project type (new-build, redesign, migration, headless, version-upgrade, b2b)
- Client name + business identity
- Project name

### Business context
- Client industry / niche
- Business stage
- Geographic scope, currencies, languages

### Scope
- Deliverables (with or without acceptance criteria)
- Integrations (named third parties)
- Content responsibilities (who provides what)
- Out-of-scope items (explicit exclusions)

### Technical
- Platform tier/plan
- Performance / accessibility / SEO requirements (if specified)
- Custom features

### Timeline
- Project duration (weeks)
- Hard deadlines (launch dates, business events)
- Milestone-level dates

### Budget
- Total budget OR hourly + cap
- Payment schedule (milestone-tied or fixed)
- Currency

### Stakeholders
- Primary client contact
- Approval authority
- External parties (designers, photographers, etc.)

### Conditional fields (per project type)
- **Migration:** source platform, data inventory, URL inventory
- **Redesign:** current site URL, SEO baseline data
- **Version Upgrade:** current version, customizations list
- **Discovery scoped:** discovery hours/deliverables

---

## Step 3 — Compute completeness score

Each extracted field gets a weight. Sum the weights of fields present and divide by total possible.

### Field weights (out of 100)

| Field | Weight | Notes |
|-------|--------|-------|
| Platform | 8 | Critical |
| Project type | 8 | Critical |
| Deliverables (list with names) | 8 | Critical |
| Integrations (list with names) | 8 | Critical |
| Content responsibility split | 7 | Critical |
| Platform tier/plan | 6 | Critical |
| Hard deadlines | 6 | Critical |
| Budget envelope | 6 | Critical |
| Client name + contact | 5 | Important |
| Business stage | 4 | Important |
| Geographic scope | 4 | Important |
| Performance/SEO/A11y requirements | 4 | Important |
| Custom features | 4 | Important |
| Content delivery dates | 4 | Important |
| Approval process | 3 | Important |
| Stakeholder names | 3 | Important |
| Goals / success metrics | 3 | Important |
| Out-of-scope (explicit) | 3 | Important |
| Warranty terms | 2 | Important |
| Existing assets | 2 | Important |
| Conditional fields per project type | 2 | Important |

Total weights sum to 100.

### Calculation

```
completeness_score = sum(weight_i for each field_i where field is populated and unambiguous)
```

Notes:
- Field counted as populated only if value is concrete (not "TBD" or "to be discussed")
- Ambiguous values count as 50% of weight (e.g., "various integrations" without naming any)
- Conditional fields only count for their project type (don't penalize non-migration projects for missing migration fields)

---

## Step 4 — Identify gaps

For every field NOT populated (or ambiguous), append to `project.json.sow.gaps[]`:

```json
{
  "field": "integrations",
  "weight": 8,
  "severity": "critical" | "important" | "nice-to-have",
  "question_id": "Q11"
}
```

This list drives clarification.

---

## Step 5 — Decision branch

### If completeness_score < 60

1. Do NOT generate spec. Halt.
2. Select questions from `knowledge/02-clarification-questions.md` matching gap fields
3. Prioritize: ALL critical gaps + as many important gaps as needed to push to ≥ 60
4. Format as batched clarification request (single message)
5. Return to orchestrator with the request
6. Orchestrator surfaces to developer
7. Wait for clarification responses
8. Re-extract fields with new info, re-compute score, repeat if still < 60

### If 60 ≤ completeness_score < 80

1. Generate first-draft spec.md
2. Flag remaining gaps in `spec.appendix.gaps`
3. Note in Gate 1 (Plan Approval) that some gaps remain and may surface during execution
4. Proceed to planning

### If completeness_score ≥ 80

1. Generate spec.md normally
2. Proceed to planning
3. Note: even ≥ 80 doesn't mean perfect — record any soft gaps for monitoring

---

## Step 6 — Update project.json.sow

After intake:

```json
"sow": {
  "raw_text": "[full SOW content]",
  "source": "sales-handoff" | "client-direct" | "rfp-response" | "renewal",
  "version": 1,
  "received_at": "[ISO datetime]",
  "completeness_score": 78,
  "gaps": [
    { "field": "warranty_terms", "weight": 2, "severity": "important", "question_id": "Q23" }
  ],
  "clarification_responses": []
}
```

If clarifications come back:

```json
"clarification_responses": [
  {
    "question_id": "Q11",
    "question": "Which integrations are required?",
    "answer": "Klaviyo (agency configures), Judge.me (client owns), Shopify Payments...",
    "answered_at": "[ISO datetime]",
    "answered_by": "internal-pm@webdesksolution.ca"
  }
]
```

`sow.version` increments each time a clarification round happens.

---

## Clarification format (batched, structured)

When requesting clarification from the developer (who relays to client via Internal PM):

```
═════════════════════════════════════════════════════════════════
SOW CLARIFICATION REQUIRED — [Project Name]
═════════════════════════════════════════════════════════════════

SOW completeness: [score]/100  (threshold: 60)

I cannot produce an accurate spec without these answers. Please
reply with question number and answer in any order.

─── Critical (project blocked until answered) ───────────────────

[Q-id]. [Question text]
       Why: [why this matters]
       Example answer format: [...]

[Q-id]. [Question text]
       ...

─── Important (affect spec quality) ─────────────────────────────

[Q-id]. [Question text]
       ...

─── Nice to have (won't block) ──────────────────────────────────

[Q-id]. [Question text]
       ...

═════════════════════════════════════════════════════════════════
```

Selecting questions:
- Pull from `02-clarification-questions.md` matching the gap fields
- Don't ask redundant questions
- Don't ask for info already in SOW

---

## Anti-patterns

1. **Filling in plausible defaults.** Don't write "assumed 30-day warranty" if warranty isn't specified. Mark as gap.

2. **Generating spec from incomplete SOW.** If completeness < 60, do not produce spec. Period.

3. **Asking trivial questions when bigger gaps exist.** Don't ask about meta-description style if you don't know what platform the project is on.

4. **Multiple rounds of clarification.** Batch everything. One round only (with rare exception if client provides info that creates new gaps).

5. **Ignoring SOW contradictions.** If SOW says "fixed price $10K" in one section and "billed hourly" in another, surface the contradiction. Don't pick one silently.

6. **Treating SOW as gospel.** If the SOW says "build entire ecommerce platform in 2 weeks for $1K," call out unrealism. Document it. Surface for renegotiation BEFORE writing the spec.

---

## When the SOW is fundamentally broken

If the SOW has:
- Logical contradictions (different prices in different sections)
- Impossible promises (24-hour P1 SLA on a $500 project)
- Missing critical info that cannot be inferred (no platform, no client name, no budget)
- Mismatched project type (says "redesign" but lists "build from scratch")

Don't try to fix it. Halt. Surface to developer:

> "SOW has [specific issue]. This needs sales/client clarification before PM Agent can produce a spec. Specifically: [details]. Recommend renegotiation or SOW v2."

---

## Output of intake stage

When complete:
1. `project.json.sow` updated with score, gaps, version
2. Either clarification request batched and surfaced, OR spec generation triggered
3. `audit_log` entry: `sow_received` (initial), `sow_clarification_requested` (if needed), `intake_complete` (when score passes)
4. Gate G0 status: `passed` (if score ≥ 60) or `pending` (if awaiting clarification)

---

Last reviewed: 2026-05-24 by Claude (initial)
Next review due: 2026-08-24
