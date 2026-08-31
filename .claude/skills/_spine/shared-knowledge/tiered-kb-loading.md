---
tier: 2
load_when: ["cost-discussion", "kb-architecture"]
---

# Tiered KB Loading Strategy

> v1.5.2 Tier F — addresses the #1 cost driver. Kitchen Blockers pilot: cache reads were 43% of cost ($100 / $232). Loading 79K cached tokens per message is excessive. This file defines tier rules to cut that in half.

---

## The problem (from Kitchen Blockers pilot data)

```
Total cost: $232.53
  Fresh input: $1.06    (<1%) — caching IS working
  Output:      $72.94   (31%) — verbose responses
  Cache write: $58.16   (25%) — re-cache when prefix changes
  Cache read:  $100.37  (43%) — every message reloads cached prefix
```

334M cache-read tokens / 4,228 messages = **79K cached tokens per message average**. That's the persona + walkthrough + multiple agent KBs + Shopify platform files loading every turn.

This is the wrong design. Most messages need a small slice of the KB, not the whole thing.

---

## The tier model

Every KB file has a load tier. The orchestrator's agent cascade respects tiers based on task type.

### Tier 0 — Always loaded (every message)

Minimal, dense, frequently referenced:

- `_spine/persona.md` (~11 KB)
- `_spine/orchestrator/SKILL.md` (~5 KB) — just for the orchestrator
- Current project's `project.json` summary (NOT the full file — a digest)

Estimated cached tokens per message: ~5-8K. Acceptable.

### Tier 1 — Task-type loaded

Loaded when a specific task type starts. Examples:

| Task type | Tier 1 KB files |
|-----------|-----------------|
| Frontend dev (Shopify) | `<active-platform>/knowledge/01-coding-standards.md`, `<active-platform>/knowledge/09-forbidden.md` |
| Designer Agent active | `_spine/designer-agent/SKILL.md`, `_spine/designer-agent/knowledge/09-html-mockup-standards.md` |
| Code review | `_spine/code-review-agent/SKILL.md`, `<active-platform>/knowledge/09-forbidden.md` |
| PM brief check | `_spine/pm-agent/SKILL.md`, `pm-agent/knowledge/12-pm-auto-trigger.md` |
| Cart/checkout work | Tier 0 + `<active-platform>/knowledge/07-cart-and-checkout.md`, `09-forbidden.md` |
| Mockup production | Tier 0 + Designer Agent files + `<active-platform>/knowledge/09-forbidden.md` |

Loaded for the duration of the task. Cleared when task ends.

### Tier 2 — On-demand

Loaded when explicitly referenced or needed for a specific question:

- `<active-platform>/knowledge/05-security-baseline.md` — only when security concern arises
- `<active-platform>/knowledge/10-seo-baseline.md` — only when SEO work
- `_spine/shared-knowledge/dev-environment-setup.md` — only when env issue
- `tools/pilot/*.md` — only during pilot administration

### Tier 3 — Reference (never proactively loaded)

Documents that exist for human reading, not agent loading:

- `docs/user-guide/WALKTHROUGH.md`
- `docs/user-guide/SETUP-INSTRUCTIONS.md`
- `tools/docs/*.md`
- `tools/pilot/*.md`
- `skills/_decisions/decision-inventory.md` (rare — most decisions baked into other files)

Agents NEVER include Tier 3 in their context. Humans read them.

---

## Tier declarations

Each KB file declares its tier in frontmatter:

```markdown
---
tier: 1
load_when: ["frontend-shopify-task", "code-review", "scaffold"]
---

# 09 — Forbidden Patterns (Shopify)
...
```

Orchestrator's cascade loader reads frontmatter to decide what to include.

---

## What changes from v1.5.1 default behavior

In v1.5.1, the cascade loaded:
- `_spine/persona.md`
- All `_spine/<agent>/SKILL.md` for invoked agents
- All `_spine/<agent>/knowledge/*.md` for invoked agents
- All `<active-platform>/knowledge/*.md`
- All `<active-platform>/examples/*` referenced

That's 30-40 KB files. For a 6-week project at 4K messages, this multiplies into hundreds of millions of cached tokens.

In v1.5.2 Tier F:
- Tier 0: ~3 files, always
- Tier 1: 2-5 files per task type
- Tier 2: only as needed
- Tier 3: never proactively

Estimated cached tokens per message after Tier F: ~15-25K (down from 79K). Cache read cost drops proportionally.

---

## Per-task token budgets (output caps)

In addition to tier-based input reduction, output has hard caps per task type:

| Task type | Max output tokens |
|-----------|-------------------|
| PM brief check | 200 |
| Code review on single PR | 1,500 |
| Single section build (Liquid) | 3,500 |
| Full page build | 5,000 |
| Full mockup page (HTML/CSS/JS) | 8,000 |
| Sprint retro report | 1,500 |
| Milestone update doc | 3,000 |
| Build plan preview | 100 |
| Audit report | 2,500 |

Orchestrator enforces by truncating response if approaching cap. Agent must request explicit increase: "I need ~2x to cover this — approve?"

---

## Verbose prose elimination

Per persona: no glazing, no warm-up sentences. Enforced via examples:

### BAD (verbose, costs output tokens)
> "Great question! Let me think through this carefully. First, I'll consider the structural aspects of the section, then move on to the styling considerations. Looking at the requirements, I see that we need to..."

### GOOD (terse, costs few tokens)
> "Section structure: semantic <section> + h2 + content. Styles in assets/section-X.css using existing tokens. Mobile-first."

Persona enforces this. Code Review Agent flags verbose responses as a KB candidate.

---

## Cache invalidation discipline

Cache invalidates when the cached prefix changes. Common causes:

1. **Adding new content to a Tier 0/1 KB file** — invalidates EVERY message
2. **Tool output injected before cached suffix** — invalidates from that point
3. **Reordering KB files in cascade** — invalidates

Mitigations:
- Make Tier 0/1 files STABLE. Don't edit during active sessions unless critical.
- Defer KB updates to retro phase (per K4 feedback loop already)
- Use a versioned cache key — separate active sessions don't invalidate each other

---

## Validation

Code Review Agent runs on every KB file PR:
- Check `tier:` frontmatter is declared
- Check size against tier:
  - Tier 0 files > 15 KB → flag (should be smaller)
  - Tier 1 files > 25 KB → flag (consider splitting)
  - Tier 2 files > 50 KB → flag (consider splitting)
- Check `load_when:` lists at least 1 task type for Tier 1

---

## Migration plan for existing files

In v1.5.2, the spine files get frontmatter retroactively:

### Tier 0 candidates (always loaded)
- `_spine/persona.md` → Tier 0
- `_spine/orchestrator/SKILL.md` → Tier 0 (for orchestrator's own context)

### Tier 1 candidates (task-type loaded)
- All agent `SKILL.md` files → Tier 1 (loaded when that agent invoked)
- `<active-platform>/knowledge/09-forbidden.md` → Tier 1 (anyone writing Shopify code)
- `<active-platform>/knowledge/01-coding-standards.md` → Tier 1
- `<active-platform>/knowledge/02-naming-conventions.md` → Tier 1
- `<active-platform>/knowledge/06-section-patterns.md` → Tier 1 (Frontend Agent)
- `_spine/code-review-agent/knowledge/01-review-checks.md` → Tier 1

### Tier 2 candidates (on-demand)
- `<active-platform>/knowledge/03-accessibility.md` → Tier 2 (loads when A11Y task)
- `<active-platform>/knowledge/04-performance-budget.md` → Tier 2 (loads when perf task)
- `<active-platform>/knowledge/05-security-baseline.md` → Tier 2 (loads when security flag)
- `<active-platform>/knowledge/07-cart-and-checkout.md` → Tier 2 (loads when cart work)
- `<active-platform>/knowledge/08-app-integrations/*.md` → Tier 2 (loads when app work)
- `<active-platform>/knowledge/10-seo-baseline.md` → Tier 2
- `<active-platform>/knowledge/11-web-components.md` → Tier 2
- `_spine/shared-knowledge/*.md` → mostly Tier 2

### Tier 3 candidates (reference only)
- `docs/user-guide/WALKTHROUGH.md` → Tier 3
- `docs/user-guide/SETUP-INSTRUCTIONS.md` → Tier 3
- `tools/docs/shortcodes.md` → Tier 3
- `tools/pilot/*.md` → Tier 3
- `_decisions/*.md` → Tier 3

---

## Estimated cost impact

For a project similar to Kitchen Blockers:

| Metric | v1.5.1 (actual) | v1.5.2 Tier F (target) |
|--------|----------------|------------------------|
| Cache read tokens | 334M | 150M (~55% reduction) |
| Cache read cost | $100.37 | $45.00 |
| Cache write cost | $58.16 | $35.00 (less re-caching) |
| Output cost | $72.94 | $50.00 (token budgets) |
| Total | **$232.53** | **~$130** |

Target: ~$130 per redesign project. Achievable if tier rules are followed.

---

## Anti-patterns

1. **Loading all KB files "just in case."** Defeats the whole point. Trust the tiers.

2. **Tier 0 files growing over time.** They should shrink, not grow. Split if needed.

3. **No tier frontmatter on new KB files.** Auto-tier them via Code Review Agent rule.

4. **Output token caps ignored.** If agent regularly exceeds caps, either cap is wrong or persona enforcement is failing.

5. **Cache thrash from frequent KB edits.** Schedule KB updates outside active sessions.

6. **Tier 3 files referenced in agent SKILL.md.** Tier 3 is for humans. Agents shouldn't load them.

---

## Implementation status (v1.5.2 Phase 2)

- [x] Strategy documented (this file)
- [ ] Frontmatter added to existing KB files (manual pass — Phase 2 + ongoing)
- [ ] Orchestrator cascade loader updated to respect tiers (Phase 2)
- [ ] Per-task output token budgets enforced (Phase 2)
- [ ] Cost measurement on next pilot to validate target (deferred to next pilot)

---

Last reviewed: 2026-05-27 by Claude (v1.5.2 Phase 2 Tier F)
Next review due: 2026-08-27
