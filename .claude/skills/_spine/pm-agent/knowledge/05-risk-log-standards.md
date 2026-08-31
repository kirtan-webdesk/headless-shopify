---
tier: 2
load_when: ["agent-specific-detail"]
description: "Every project has risks. The PM Agent maintains an explicit risk log so the team isn't surprised when known risks materialize."
---

# 05 — Risk Log Standards

> Every project has risks. The PM Agent maintains an explicit risk log so the team isn't surprised when known risks materialize.

---

## What goes in the risk log

A risk is a future event that, IF it happens, will impact scope / timeline / cost / quality.

A risk is NOT:
- A current problem (that's a bug or a blocker)
- A certainty (that's a constraint, not a risk)
- A vague concern ("something might go wrong" — be specific)

---

## Risk log entry format

Stored in `project.json.risks[]`:

```json
{
  "id": "R1",
  "description": "Client product copy not delivered by milestone 3, blocks PDP development",
  "category": "client-dependency" | "technical" | "third-party" | "scope" | "team" | "external",
  "probability": "low" | "medium" | "high",
  "impact": "low" | "medium" | "high",
  "mitigation": "Send written content brief at kickoff. Set hard cutoff. Use placeholder content if late.",
  "owner": "Internal PM",
  "status": "open" | "mitigated" | "realized" | "closed",
  "identified_at": "[ISO datetime]",
  "last_reviewed": "[ISO datetime]"
}
```

---

## Risk categories

### client-dependency
Client-side delays or non-delivery.
Examples: content not provided on time, slow approval cycles, key stakeholder unavailable.

### technical
Risks from the technical implementation.
Examples: untested platform feature, complex integration, unfamiliar codebase, performance constraints.

### third-party
Risks from external vendors / services.
Examples: API rate limits, vendor outages, API breaking changes, deprecated services.

### scope
Risks of scope expansion or contradiction.
Examples: vague SOW, mid-project change requests, unclear acceptance criteria.

### team
Internal team risks.
Examples: key dev going on leave, role unfilled, knowledge silos.

### external
Outside-anyone's-control events.
Examples: regulatory changes, platform-level outages, market shifts.

---

## Probability × Impact matrix

```
                    IMPACT
                Low   Medium  High
PROBABILITY  ┌─────┬───────┬──────┐
       Low   │  1  │   2   │   3  │
   Medium    │  2  │   4   │   6  │
      High   │  3  │   6   │   9  │
             └─────┴───────┴──────┘

Score 1-2:  Watch (note, don't act)
Score 3-4:  Mitigate (have plan, monitor)
Score 6:    Active mitigation (plan in motion)
Score 9:    Escalate (block or change scope)
```

PM Agent calculates score and recommends action level.

---

## Standard risks PM Agent should ALWAYS check for

Per project type:

### All projects
- Client content delays (probability depends on Q13 + Q14 answers)
- Scope creep (probability medium if SOW completeness < 80)
- Key client contact unavailability (probability low-medium)
- Approval cycle slower than expected (probability medium)
- Estimate overrun (probability inversely proportional to confidence level)

### New Build
- Client expectations vs. platform capabilities mismatch
- Integration count higher than SOW suggested
- Custom feature complexity underestimated

### Redesign
- SEO traffic loss from URL or metadata changes
- Existing site functionality not documented (hidden requirements)
- Design changes break existing client workflows
- Plugin/app conflicts with new design

### Migration
- **Data loss** (highest-severity migration risk)
- Source platform data quality issues (incomplete, corrupted)
- URL redirect map gaps
- SEO ranking loss post-migration
- Customer account migration issues (passwords, gift cards, store credit)
- Integration re-setup gaps (apps that worked on source don't have target equivalents)
- Cutover downtime exceeds plan

### Headless
- API rate limit hits in production
- SSR/SSG complexity underestimated
- Hosting cost higher than client expects (Vercel/Cloudflare Workers/etc.)
- Performance regression vs. native theme
- Headless variant chosen no longer supported (e.g., Shopify deprecates a tool)

### Version Upgrade
- Customizations not compatible with new version
- Theme/plugin updates required for compatibility
- Breaking changes not in changelog
- Long regression QA tail
- Rollback unfeasible mid-migration

### B2B
- B2B platform/plan limits hit (catalog count, custom price list count)
- ERP integration data shape mismatch
- Customer account migration with company hierarchies
- Tax configuration complexity (multi-region B2B)

PM Agent should consider each applicable risk and either INCLUDE it in the risk log (with mitigation) or explicitly NOTE why it doesn't apply.

---

## Mitigation patterns

Each risk should have a mitigation that's specific and actionable.

### Bad mitigations (don't write these)
- "Monitor closely"
- "Communicate with client"
- "Handle it when it happens"
- "Add buffer to estimate"

### Good mitigations
- "Send written content brief at kickoff. Set hard cutoff at M2 start. Use placeholder + revise post-launch if content is late."
- "Require API rate limit testing during M3. Set up monitoring before launch. Have backup endpoint switching ready."
- "Document all customizations during M1 audit. For each, decide: port forward / drop / replace. Approve list before upgrade work begins."
- "Pre-migration: full data export + parity test on sample (10 records). Post-migration: full parity check before cutover. Rollback plan documented."

Pattern: **Action + When + Owner + Trigger condition.**

---

## Risk log review cadence

PM Agent reviews the risk log:
- At every gate decision (G1, G2, G3, G4, G5, G6)
- At every milestone close
- When a risk realizes (becomes a problem)
- When the project type or scope changes materially

At each review:
- Update `last_reviewed` timestamp
- Update `status` if changed
- Add new risks discovered
- Close risks that are no longer relevant
- Re-score probability/impact if changed

---

## When risks become realized

If a risk in `status: open` actually materializes:

1. Update status to `realized`
2. Append `audit_log` entry: `risk_realized` with risk_id
3. Convert to bug (`bugs[]`) or blocker if appropriate
4. Surface to developer with the realization details + which mitigation should activate

Example:
> "⚠ Risk R1 realized: Client product copy not delivered by M3 start. Mitigation activates: switching to placeholder copy. PDP development unblocked, but copy revision required pre-launch."

---

## Risk output format in artifacts

In `spec.md` § 11 (Risks):

```markdown
## Risks

| ID | Description | Probability | Impact | Score | Mitigation | Owner |
|----|-------------|-------------|--------|-------|------------|-------|
| R1 | Client product copy not delivered by M3 start | Medium | High | 6 | Send content brief at kickoff; set hard cutoff at M2; use placeholders if late | Internal PM |
| R2 | Klaviyo API changes mid-project | Low | Medium | 2 | Pin to API version in spec; subscribe to changelog | Backend Dev |
| R3 | ... | ... | ... | ... | ... | ... |
```

In project.json.risks (machine-readable format above).

---

## Anti-patterns

1. **Vague risks.** "Things might go wrong" is not a risk entry. Be specific.

2. **No mitigations.** Risk without mitigation = ignored risk.

3. **Risk log written at intake and never updated.** Risks evolve. Update at every milestone.

4. **Treating all risks equally.** Use the probability × impact matrix to prioritize.

5. **Hiding risks from the client.** Client should see the major risks (Score ≥ 6) in the spec. Transparency builds trust.

6. **Including impossible risks.** Don't include "asteroid hits server farm." Stay within reasonable.

---

## Required risks for each project type (minimum)

Each project's risk log must include AT LEAST these for the project type:

- New Build: 3+ risks (client content delay, scope creep, integration complexity)
- Redesign: 4+ risks (above + SEO preservation, existing functionality not documented)
- Migration: 6+ risks (above + data loss, redirect gaps, customer data, integration re-setup)
- Headless: 5+ risks (above + API limits, performance regression, hosting cost)
- Version Upgrade: 4+ risks (above + customization compatibility, regression tail)
- B2B: 5+ risks (above + ERP data shape, customer hierarchy migration)

If the PM Agent identifies fewer, it's missing something. Add more.

---

Last reviewed: 2026-05-24 by Claude (initial)
Next review due: 2026-08-24
