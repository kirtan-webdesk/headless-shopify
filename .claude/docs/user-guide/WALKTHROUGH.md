---
tier: 3
load_when: ["human-reference-only"]
---

# WebDesk AI Delivery System — Walkthrough Guide

> Start here. ~15 minutes of reading gives you working knowledge of the system. Detailed reference docs are in individual skill folders.

---

## Part 1: What this system is

### The problem we built it for

Agency project delivery has two failure modes:
1. **Inconsistent quality.** Different devs produce different patterns. No standard. Client gets variable results.
2. **AI without guardrails.** Devs use Claude Code, but without structure, AI produces generic code, hallucinates APIs, ignores agency conventions.

This system solves both: a **structured set of AI agents + knowledge** that enforces consistency and guards against AI failures.

### What it is, concretely

- **149 files** organized in a specific structure
- Files are split into **skills** (read by Claude Code) and **tools** (CI/CD, scripts, configs)
- Skills include **agents** (PM, Designer, Frontend, Backend, QA, Delivery Head, Code Review, Content Migration) and **knowledge** (agency standards, naming conventions, forbidden patterns, etc.)
- Tools include **GitHub Actions workflows**, **the Code Review Agent's Claude API script**, **setup configs**

### What it isn't

- Not a replacement for senior developer judgment
- Not magic — requires team to actually use the system
- Not finished — gets better over time as KB is refined per project learnings
- Not "AI does everything" — humans approve gates, fix bugs, ship code

The system is a force multiplier for a capable team. Without a capable team underneath, it's nothing.

---

## Part 2: How it's organized

```
webdesk-ai-delivery-system/
├── README.md                          ← Quick package overview
├── WALKTHROUGH.md                     ← you are here
├── SETUP-INSTRUCTIONS.md              ← How to install
├── skills/                            ← Knowledge for Claude Code to read
│   ├── _contracts/                    ← Schemas + protocols (4 files)
│   ├── _spine/                        ← Universal agents (71 files)
│   │   ├── persona.md                 ← CTO persona (loaded by every agent)
│   │   ├── orchestrator/              ← Conductor agent
│   │   ├── pm-agent/                  ← Project manager agent
│   │   ├── designer-agent/            ← Design system agent
│   │   ├── qa-agent/                  ← Quality assurance agent
│   │   ├── delivery-head/             ← Launch + handoff agent
│   │   ├── code-review-agent/         ← AI code review agent
│   │   ├── content-migration-agent/   ← Data migration agent (migrations only)
│   │   └── shared-knowledge/          ← Universal rules
│   └── shopify/                       ← Shopify-specific knowledge (40 files)
│       ├── SKILL.md
│       ├── knowledge/                 ← Coding standards, forbidden patterns, etc.
│       ├── examples/                  ← Real Liquid sections + JS components
│       ├── templates/                 ← Section / snippet starters
│       ├── pointers/                  ← External doc anchors
│       └── projects/
│           └── redesign/              ← Shopify Redesign project-type skill (13 files)
└── tools/                             ← CI/CD + scripts + configs (21 files)
    ├── README.md
    ├── github-actions/                ← 7 workflows
    ├── scripts/                       ← 4 scripts (incl. Code Review Agent's run script)
    ├── configs/                       ← Linter + CI config templates
    ├── pre-commit/                    ← Pre-commit hooks
    ├── alerts/                        ← Monitoring setup docs
    └── docs/                          ← Including shortcodes.md + deployment-guide.md
```

### The folder logic

- **`skills/_spine/`** = universal, platform-agnostic. Same for Shopify, WordPress, Magento, etc.
- **`skills/shopify/`** = Shopify-specific. (Future: `skills/wordpress/`, `skills/magento/`, etc.)
- **`skills/shopify/projects/redesign/`** = Shopify Redesign-specific. (Future: `migration/`, `new-build/`, etc.)
- **`tools/`** = not skills. These are scripts + configs that run things automatically.

Three layers (spine → platform → project-type) means agents can compose context. A Shopify Redesign project loads all three. A Shopify New Build project loads spine + shopify + (future) `projects/new-build/`.

---

## Part 3: How agents work together

### The mental model

Think of the system like a **small project team that exists inside Claude Code**:

- **Orchestrator** = Project Tech Lead (decides who does what when)
- **PM Agent** = Project Manager (owns scope, planning, communication)
- **Designer Agent** = Design Lead (tokens, system, section composition)
- **Frontend Agent** = Frontend Developer (Liquid, CSS, JS)
- **Backend Agent** = Backend Developer (APIs, integrations, metafields)
- **QA Agent** = QA Engineer (runs the 8 QA modules)
- **Code Review Agent** = Senior Reviewer (catches mistakes on PRs)
- **Delivery Head** = Release Manager (pre-launch + launch + handoff)
- **Content & Migration Agent** = Data Engineer (migration projects only)

Just like a real team, they don't all work at once. The Orchestrator routes work to the right person.

### The flow

```
[Developer types a request]
        ↓
Orchestrator (reads persona, identifies intent, routes)
        ↓
Specialist agent (loads its skill + platform arm + project-type skill)
        ↓
Produces artifact (spec.md, design tokens, section code, QA report, etc.)
        ↓
Artifact goes to a gate (G0, G1, G2, G3, G4, G5, G6)
        ↓
Human approves the gate
        ↓
Orchestrator advances to next stage
```

Every project follows this loop, repeatedly.

### The 7 gates

Per `skills/_contracts/gate-format.md`:

| Gate | What it controls | Who approves |
|------|------------------|--------------|
| G0 | SOW validation (completeness ≥ 60) | Auto |
| G0.5 | Audit completion (redesigns only) | Internal PM + Senior Dev |
| G1 | Plan + estimate approval | Internal PM |
| G2 | Design approval | Designer Lead + Client (via Internal PM) |
| G3 | Scaffold verification | Senior Dev / Tech Lead |
| G4 | Sprint QA (one per sprint) | QA Lead |
| G5 | Milestone regression | Tech Lead + PM |
| G6 | Pre-launch | Delivery Head + Client (via Internal PM) |

Each gate has 4 decision options: CONFIRM / REJECT / REVISE / RENEGOTIATE (G1+G2 only).

### Why this matters

Without gates, agents would barrel through producing potentially-wrong work. Gates force human review at points where mistakes compound. Per `_spine/orchestrator/knowledge/03-gate-protocol.md`.

---

## Part 4: How developers use the system

### Day-to-day workflow

```
Morning:
  1. Open Claude Code
  2. Type: /resume Aurora Skincare
  3. Orchestrator reports status, suggests next action
  4. (Or check /status [client] for read-only summary)

Sprint work:
  5. Type: /sprint S2.4
  6. Frontend Agent reads sprint brief, applies KB rules, writes code
  7. Dev reviews + commits (per pre-commit hooks)
  8. Push → GitHub Actions kicks in:
     - Theme push to dev theme
     - Code Review Agent posts review on PR
     - Lighthouse CI runs
     - axe-core CI runs
  9. Dev addresses any P1/P2 issues
  10. PR merges to develop (with reviewer approval)
  11. Staging push happens automatically

Sprint close:
  12. Type: /qa S2.4
  13. QA Agent runs 8 modules
  14. QA report generated
  15. G4 (Sprint QA) gate opens for QA Lead approval
  16. /confirm G4-S2.4 → advance to next sprint
```

### Use shortcodes, not long prompts

Per `tools/docs/shortcodes.md`, there are ~30 shortcodes for common operations. Use them.

Bad:
> "Hi can you help me start a new shopify redesign project for aurora skincare please use the standard process and run discovery if it's scoped..."

Good:
> `/start shopify redesign Aurora Skincare`

Shortcodes = consistent behavior. Long prompts = drift + variance.

### Claude Code, VS Code, Claude in Chrome

Per `_spine/shared-knowledge/dev-environment-setup.md`:

- **Claude Code** = primary AI coding tool. Runs the agents.
- **VS Code** = IDE. Standard text editor.
- **Claude in Chrome** = exploratory QA. Used by QA Agent for "feel" testing that Playwright can't capture.

All three required per developer.

---

## Part 5: How the system catches mistakes

### Layer 1: Persona + KB

Every agent reads `_spine/persona.md` FIRST. This enforces:
- No hallucination ("don't invent APIs")
- Truthfulness ("say 'I don't know' when uncertain")
- Specificity ("vague claims aren't allowed")
- Direct output ("no buttering, no padding")

Then agents read platform-specific knowledge like `shopify/knowledge/09-forbidden.md` which has 24+ specific rules.

### Layer 2: Validators + linters

Per agent output → automated check:
- Spec → schema validator
- Design tokens → WCAG contrast validator (built into Designer Agent)
- Code → theme-check, ESLint, PHPCS
- Performance → Lighthouse CI
- Accessibility → axe-core

These catch the deterministic stuff.

### Layer 3: Code Review Agent

Per `_spine/code-review-agent/`. On every PR:
- Reads platform KB (especially `09-forbidden.md`)
- Cross-checks AI-generated code against KB rules
- Identifies hallucinated APIs, forbidden patterns, security issues, performance regressions, accessibility regressions, SEO compliance gaps
- Posts structured comment to PR
- Blocks merge if P1/P2 findings

### Layer 4: Human review

Per `_spine/code-review-agent/knowledge/03-sensitive-paths.md`:
- Sensitive paths (checkout, payment, auth, customer data) require senior dev review
- Enforced via GitHub CODEOWNERS file
- Branch protection blocks merge without required approver

### Layer 5: Gate approvals

Every stage transition requires human gate approval. Per F4 (self-approval prohibition), the approver must be DIFFERENT from the doer.

### Layer 6: QA modules + pre-launch checklist

Per `_spine/qa-agent/knowledge/01-qa-modules.md` + `_spine/delivery-head/knowledge/01-prelaunch-checklist-composition.md`. Final safety net before launch.

### Layer 7: Post-deploy health check + rollback

Per F13 + `_spine/delivery-head/knowledge/03-rollback-procedure.md`. Automatic verification post-launch. Auto-rollback if checks fail.

**Multiple layers means: lots of chances to catch mistakes before they ship.**

---

## Part 6: What developers need to know

### The persona is foundational

Every agent loads `_spine/persona.md` first. This sets the operating contract: truthfulness, no hallucination, CTO is watching, no buttering.

When agents drift from these principles, it's because the persona wasn't loaded. Always ensure it loads first.

### Read forbidden.md

For Shopify projects, `skills/shopify/knowledge/09-forbidden.md` is the highest-leverage file. 24+ rules of what AI should never do. Every PR is checked against it.

When you see a Code Review Agent comment referencing "LIQ-001" or "JS-003" — those are rule IDs from this file.

### Acceptance criteria are the contract

Per `_spine/pm-agent/knowledge/06-sprint-rules.md`, every sprint has 3-7 acceptance criteria. The sprint is "done" only when ALL ACs check off.

Don't let "almost done" become "done."

### Gates can't be skipped

The orchestrator refuses to advance past unconfirmed gates. If you try to skip (e.g., go from G1 to G4 without G2/G3), it refuses.

To override in true emergencies: `/override [gate-id] [reason]`. Requires senior dev approval. Logged for weekly review.

### Cost tracking is real

Per `_spine/orchestrator/knowledge/05-escalation-paths.md`, the orchestrator tracks API token usage per project. Alerts at 80% of project cap. Halts at 100%.

Per `tools/alerts/anthropic-spending-alerts.md`, configure workspace-level alerts so you don't get surprise bills.

---

## Part 7: How to extend the system

### Adding a new platform arm

Currently only Shopify. To add WordPress:

1. Create `skills/wordpress/` mirroring `skills/shopify/` structure
2. Write WordPress-specific knowledge files (coding standards, naming, forbidden patterns)
3. Add WordPress examples (real theme files)
4. Add WordPress-specific tools (WP-CLI workflows)
5. Test with a real WordPress project

The spine doesn't change. Each platform arm is self-contained.

### Adding a new project type

For Shopify, only Redesign is built. To add Migration:

1. Create `skills/shopify/projects/migration/` mirroring `redesign/` structure
2. Write migration-specific knowledge (different from redesign)
3. Adjust gates per migration project type
4. Add migration examples

### Adding new shortcodes

Per `tools/docs/shortcodes.md` § "Adding new shortcodes":
1. Identify the repeatable workflow
2. Add to shortcodes.md
3. Add to orchestrator's session-start protocol
4. Update tools changelog

### Adding new forbidden patterns

Per `_spine/code-review-agent/knowledge/06-feedback-loop-kb-updates.md`:
1. Code Review Agent identifies recurring mistakes (3+ occurrences)
2. KB owner reviews candidates quarterly
3. Approved candidates added to `09-forbidden.md`
4. System improves with each iteration

---

## Part 8: Common questions

### "What if Claude makes up an API call?"

Multiple layers catch this:
1. Persona requires verification
2. Code Review Agent specifically checks for hallucinated APIs (per `_spine/code-review-agent/knowledge/01-review-checks.md` § Check 1)
3. theme-check catches Liquid hallucinations
4. ESLint catches JS hallucinations
5. Tests fail at runtime if API doesn't exist
6. Human review catches what slips through

Hallucinations DO sometimes happen. The system catches them before they ship.

### "What if a developer ignores the gates?"

Gates can't be bypassed in normal flow. The orchestrator refuses.

Override is available (`/override`) but requires senior dev + reason + logged for weekly review. If a developer overrides often, that's a red flag for their performance review.

### "What if Claude is offline?"

The system requires Anthropic API access for most agent work. If Anthropic is down:
- Local linting still works (theme-check, ESLint)
- Pre-commit hooks still work
- GitHub Actions Lighthouse + axe still work
- Code Review Agent doesn't (degrades to manual review)

Anthropic uptime is high (typically 99.9%+) but plan for occasional outages.

### "How much does this cost in Claude API spend?"

Per `tools/alerts/anthropic-spending-alerts.md`:
- Small project: $20-40 in API costs total
- Medium project: $45-90 total
- Large/complex project: $130-260 total

Across 50 projects/year at medium: ~$3,000-4,500 in API spend. Compared to project values, marginal.

### "What if the AI produces bad code repeatedly?"

The feedback loop (per `_spine/code-review-agent/knowledge/06-feedback-loop-kb-updates.md`) means:
- Code Review Agent catches the issue
- After 3 occurrences across projects, becomes a KB candidate
- Quarterly review approves + adds to `09-forbidden.md`
- Future projects don't repeat the mistake

The system gets smarter over time IF you maintain the feedback loop. Without quarterly KB review, the system stagnates.

### "Who owns this system?"

Per E5 (locked decision):
- Each platform arm needs a designated owner (senior dev)
- Owner reviews quarterly
- Owner approves KB updates from feedback loop

Without owners, the KB rots in 90 days. This is the #1 risk to long-term system value.

---

## Part 9: When NOT to use this system

The system is designed for **structured project delivery**. It's NOT optimized for:

- **Quick one-off scripts** — use Claude Code directly, no spine needed
- **Exploratory prototyping** — too much process for "I just want to try something"
- **Maintenance work on existing projects** — different workflow (separate Maintenance skill, future)
- **Pair-coding sessions** — humans + Claude Code is fine, no orchestrator needed

The system shines when you have:
- A real client project
- A spec to follow
- Multiple sprints
- Quality gates to enforce
- A team that needs consistency

For "I just want to add a section to my own theme experiments," skip the system.

---

## Part 10: Where to learn more

| Topic | File |
|-------|------|
| Persona (read this first) | `skills/_spine/persona.md` |
| Folder structure | `skills/_contracts/folder-structure.md` |
| Project state schema | `skills/_contracts/project-json.schema.json` |
| Spec template | `skills/_contracts/spec-template.md` |
| Gate protocol | `skills/_contracts/gate-format.md` |
| Orchestrator workflow | `skills/_spine/orchestrator/SKILL.md` |
| Forbidden patterns (Shopify) | `skills/shopify/knowledge/09-forbidden.md` |
| Coding standards (Shopify) | `skills/shopify/knowledge/01-coding-standards.md` |
| Web component architecture | `skills/shopify/knowledge/11-web-components.md` |
| Reference sections | `skills/shopify/examples/sections/` |
| Reference JS components | `skills/shopify/examples/js-components/` |
| Redesign workflow | `skills/shopify/projects/redesign/SKILL.md` |
| Existing site audit protocol | `skills/shopify/projects/redesign/knowledge/01-existing-site-audit.md` |
| Shortcodes reference | `tools/docs/shortcodes.md` |
| Deployment instructions | `SETUP-INSTRUCTIONS.md` (top level) |
| Detailed setup | `tools/docs/deployment-guide.md` |

Start with `persona.md` and `shortcodes.md`. That's 90% of what you need day-to-day. The rest is reference material.

---

## TL;DR

If you read nothing else:

1. **Every agent loads `_spine/persona.md` first.** That's the operating contract.
2. **Use shortcodes** (`/start`, `/audit`, `/sprint`, `/qa`, etc.). Don't write long prompts.
3. **Trust gates.** They catch mistakes before launch.
4. **Quarterly KB review** keeps the system from rotting. Assign owners.
5. **The system augments your team.** It doesn't replace senior judgment.

The system works if the team works with it. It fails if the team ignores it.

---

Last reviewed: 2026-05-25 by Claude (initial)
Next review due: 2026-08-25
