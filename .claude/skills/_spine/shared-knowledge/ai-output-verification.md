---
tier: 2
load_when: ["output-verification"]
---

# AI Output Verification

> How to verify what AI agents produce. AI is a tool, not an oracle. Verification protects against the system shipping hallucinated, wrong, or unsafe output.

---

## Why verification matters

AI agents (Frontend, Backend, Designer, etc.) produce content + code at speed. Most of it is good. Some of it is wrong. Some of it is confidently wrong in ways that are hard to spot.

Without verification:
- AI hallucinated APIs ship to production → runtime errors
- AI invented facts ship to client documents → trust loss
- AI invented patterns become tribal knowledge → propagate bad practices

Verification is what turns AI from "fast" to "fast and reliable."

---

## Verification layers

### Layer 1: Deterministic verification (linters, validators, tests)

Catches the verifiable.
- Code: does it compile? Pass theme-check? PHPCS? ESLint?
- Data: does it match schema? Pass type checks?
- Output: does it validate against the expected format?

**Tools:** Platform linters, schema validators, unit tests.
**Speed:** Fast, runs in CI.
**Catches:** Syntax errors, schema violations, type errors, deterministic patterns.
**Misses:** Semantic errors, hallucinated APIs that pass syntax check, unsuitable patterns.

### Layer 2: AI cross-check (Code Review Agent + sub-agents)

Catches the semantic.
- Does this function actually exist in the platform's API?
- Does this match the project's forbidden.md patterns?
- Does this have security issues?
- Does this match the section pattern library?

**Tools:** Code Review Agent (per `_spine/code-review-agent/`).
**Speed:** Medium (per-PR cost).
**Catches:** Hallucinated APIs, forbidden patterns, semantic security issues, project pattern violations.
**Misses:** Subjective judgment issues, novel risks, things AI itself hallucinates about.

### Layer 3: Human review (senior dev / QA lead)

Catches the judgment-required.
- Is this the right approach for THIS client?
- Does this match the brand?
- Is this an over-engineered solution?
- Are there better alternatives?

**Tools:** Human reviewer reading PR.
**Speed:** Slow (per-review human time).
**Catches:** Judgment calls, contextual issues, architecture concerns, brand mismatches.
**Misses:** Things humans don't think to check.

### All three layers together

Each layer catches different kinds of issues. None is sufficient alone.

```
AI Output → Layer 1 (deterministic) → Layer 2 (AI cross-check) → Layer 3 (human review) → Production
```

---

## Verification by AI agent

### PM Agent output verification

**Outputs:**
- spec.md
- milestones.json
- Update documents
- Master doc
- Adherence reports

**Verification:**

| Output | Layer 1 | Layer 2 | Layer 3 |
|--------|---------|---------|---------|
| spec.md | Schema validator (validate-spec) | — | Internal PM reads + approves at G1 |
| milestones.json | Schema validator | — | Internal PM reads + approves at G1 |
| Update documents | (template structure check) | — | Internal PM reviews before client send |
| Master doc | (structure check) | — | Senior dev reviews at project close |
| Adherence reports | — | Cross-checks against actual code | QA lead reviews findings |

PM Agent's output is mostly text. Verification is mostly human read. Schema checks catch format issues.

### Designer Agent output verification

**Outputs:**
- design-tokens.json
- section-map.json
- Visual mockups
- Research reports

**Verification:**

| Output | Layer 1 | Layer 2 | Layer 3 |
|--------|---------|---------|---------|
| design-tokens.json | Schema validator + WCAG contrast check | — | Designer lead reviews tokens |
| section-map.json | Schema validator + sprint assignment check | — | Frontend lead reviews structure |
| Visual mockups | (rendering check — do they render?) | — | Designer + Client review at G2 |
| Research reports | (links resolve?) | — | Internal PM reviews findings |

Critical: WCAG contrast validation is automated and rejects bad tokens before they reach code.

### Frontend Agent output verification

**Outputs:**
- Liquid / PHP / JSX code
- CSS / SCSS / Tailwind
- JavaScript
- Section schemas / config

**Verification:**

| Output | Layer 1 | Layer 2 | Layer 3 |
|--------|---------|---------|---------|
| Liquid code | theme-check | Code Review Agent — hallucinated APIs, forbidden patterns | Senior dev reads PR |
| CSS | Stylelint | Code Review Agent — token usage, performance | Senior dev reads PR |
| JavaScript | ESLint + TypeScript (if applicable) | Code Review Agent — security, performance | Senior dev reads PR |
| Section schemas | Schema validator | Code Review Agent — schema correctness | Frontend lead reviews structure |

For sensitive paths (cart, checkout) — additional senior dev required per CODEOWNERS.

### Backend Agent output verification

**Outputs:**
- API integration code
- Metafield definitions
- Webhook handlers
- Database queries

**Verification:**

| Output | Layer 1 | Layer 2 | Layer 3 |
|--------|---------|---------|---------|
| Integration code | Linter + (where possible) integration smoke test | Code Review Agent — security, hallucinated APIs | Senior dev for any sensitive integration |
| Metafield definitions | Schema validator | Code Review Agent — naming conventions | Backend lead reviews |
| Webhook handlers | Linter + signature verification check | Code Review Agent — security (CSRF, signature verification) | Senior dev — webhooks are security-critical |
| Database queries | Linter + parameterization check | Code Review Agent — SQL injection vectors | Senior dev for any direct DB query |

Backend output requires more rigorous verification because of higher impact (data integrity, security).

### QA Agent output verification

**Outputs:**
- QA reports (per sprint, milestone, pre-launch)
- Bug reports
- Test files (Playwright tests)

**Verification:**

| Output | Layer 1 | Layer 2 | Layer 3 |
|--------|---------|---------|---------|
| QA reports | (format check) | — | QA lead reviews findings |
| Bug reports | Schema validator + evidence check | — | QA lead triages |
| Playwright tests | Test runner — do tests pass? | Code Review Agent — test quality | QA lead reviews test logic |

QA Agent verifying others' work is a layer of verification. Its OWN output needs verification too.

### Code Review Agent output verification

**Outputs:**
- PR comments
- Review status (PASS / FAIL)
- KB update candidates

**Verification:**

| Output | Layer 1 | Layer 2 | Layer 3 |
|--------|---------|---------|---------|
| PR comments | (format check) | — | Dev reads + responds to suggestions |
| Review status | (auto-applied) | — | If dev disputes, escalate to senior |
| KB candidates | (format check) | — | KB owner reviews quarterly (per K4) |

Code Review Agent is the AI verification layer for code. Its own output mostly verified by humans (devs reading comments, KB owner approving candidates).

### Content & Migration Agent output verification

**Outputs:**
- Data audit reports
- Field mapping documents
- Parity reports
- Redirect maps
- Cutover runbooks

**Verification:**

| Output | Layer 1 | Layer 2 | Layer 3 |
|--------|---------|---------|---------|
| Data audit | (record counts cross-checked vs source) | — | Tech lead + Internal PM review |
| Field mapping | Schema validator + completeness check | — | Tech lead approves before migration |
| Parity report | (cross-check counts) | — | Tech lead reviews |
| Redirect map | (single-hop validation + format check) | Code Review Agent (when implementing redirects) | SEO lead / Tech lead review |
| Cutover runbook | (template structure check) | — | Tech lead rehearses + approves |

Migration outputs require especially careful verification because mistakes = data loss.

### Delivery Head output verification

**Outputs:**
- Pre-launch checklist
- Verification reports
- Backup records
- Launch runbook
- Handoff documents

**Verification:**

| Output | Layer 1 | Layer 2 | Layer 3 |
|--------|---------|---------|---------|
| Pre-launch checklist | (completeness check vs spec) | — | Tech lead + Delivery Head human reviews |
| Verification reports | (cross-checks artifacts) | — | Internal PM + Tech lead at G6 |
| Backup records | (verify backup exists + accessible) | — | Tech lead confirms |
| Launch runbook | (rehearsal walkthrough) | — | Team rehearses pre-launch |
| Handoff docs | (template check) | — | Internal PM reviews before client send |

---

## Self-check requirement (per E11)

Every agent, at the end of its work, states:
- "I consulted [KB files]"
- "I validated [outputs] against [schemas]"
- "I followed [protocols]"

This forces actual KB consultation (vs hallucination from training data).

Example from Frontend Agent:
> "Section built per:
> - <active-platform>/knowledge/06-section-patterns.md
> - <active-platform>/knowledge/09-forbidden.md (verified no forbidden patterns used)
> - <active-platform>/examples/sections/hero-fullbleed-image (used as reference)
> - design-tokens.json (applied brand colors)
>
> Section validates against theme-check. Acceptance criteria AC1, AC2, AC3 verifiable via Playwright test."

If self-check statement is missing, the gate fails. The agent must re-do with proper protocol consultation.

---

## When verification fails

Verification finds something wrong:

1. **Layer 1 fail (deterministic):** Auto-rejected, agent re-tries. Common (typos, schema misses).
2. **Layer 2 fail (AI cross-check):** Code Review Agent flags. Dev addresses. PR doesn't merge until resolved.
3. **Layer 3 fail (human review):** Senior reviewer comments. Dev addresses. PR cycle continues.

The cost of catching at each layer:
- Layer 1: ~0 (CI runs automatically)
- Layer 2: small ($0.10-$2 per PR review)
- Layer 3: significant (senior dev time)
- Production: catastrophic (incident response, rollback, customer trust loss)

**Catch earlier = cheaper.**

---

## What humans must verify (cannot be automated)

Some things only humans can verify. Don't try to automate:

1. **Brand fit:** Does this match the client's brand?
2. **User experience:** Does this feel right?
3. **Strategic alignment:** Is this serving the business goals?
4. **Edge case judgment:** Should we handle this rare case or accept it?
5. **Client relationship context:** Is this the right communication for this client?

For these, human judgment is required. Agents flag for human attention; humans decide.

---

## Verification anti-patterns

1. **Trusting AI without verification.** AI is fast but fallible. Always verify.

2. **Verification only at the end.** Catch issues at earliest layer. Verification at end = expensive rework.

3. **Skipping Layer 2 to save cost.** Code Review Agent's $0.20-2.00 per PR saves $20-200 in human reviewer time + production incidents.

4. **Layer 1 only.** Linters pass + obvious issues ship anyway. Layers 2 + 3 catch the subtle stuff.

5. **No self-check statement.** Agents skip consulting KB. Quality drops over time.

6. **Verification ≠ blind approval.** Reviewer just approving without reading = no verification. Read the PR.

7. **Same person doing work + verifying.** Per F4 self-approval prohibition.

---

## Improving verification over time

Each project should improve verification:
- When a bug ships that verification didn't catch → add a check
- When a pattern recurs that Code Review Agent missed → add to forbidden.md
- When manual review catches something → add automated check if possible

Continuous improvement loop. Reviewed at K5 monthly retro.

---

Last reviewed: 2026-05-24 by Claude (initial)
Next review due: 2026-08-24
