---
tier: 2
load_when: ["agent-cascade-decision"]
description: "How skills load each other. Cascade order matters. Get it wrong and the agent invoked won't have the context it needs."
---

# 06 — Agent Cascade

> How skills load each other. Cascade order matters. Get it wrong and the agent invoked won't have the context it needs.

---

## The cascade order (universal)

When the orchestrator invokes an agent for a specific project, skills load in this order:

```
1. Orchestrator (already loaded — you are here)
       ↓
2. Spine agent skill (e.g., PM Agent, Designer Agent, QA Agent)
       ↓
3. Platform arm skill (if applicable — e.g., <active-platform>/SKILL.md)
       ↓
4. Project-type skill (e.g., <active-platform>/projects/redesign/SKILL.md)
       ↓
5. Modifier skill (if applicable — e.g., _b2b-modifier)
       ↓
6. Knowledge files within each skill, loaded ON DEMAND by the agent
```

Each layer's SKILL.md is a lean entry point with pointers. The deeper knowledge files are read by the agent when it needs them, not all at once.

---

## v1.5.5 — Tier-aware loading

Every KB file declares frontmatter:

```yaml
---
tier: 0 | 1 | 2 | 3
load_when: ["task-tag-1", "task-tag-2", ...]
---
```

Cascade loader honors tiers:

| Tier | When loaded | Examples |
|------|------------|----------|
| **0** | Every message | persona.md, orchestrator/SKILL.md |
| **1** | When the matching task tag is active | agent SKILL.md (when agent invoked), forbidden-global.md (when code production), platform 09-forbidden.md (when platform code production), ai-tool-rules.md (when file production) |
| **2** | On demand — agent explicitly requests | destructive-ops-protocol.md (when destructive op), 04-state-management.md (when state mutation), most knowledge files |
| **3** | Never proactively loaded — human reads only | docs/user-guide/WALKTHROUGH.md, docs/user-guide/SETUP-INSTRUCTIONS.md, _decisions/decision-inventory.md, docs/planning/*, docs/release-notes/*, tools/docs/*, tools/pilot/* |

### Active task tags

The orchestrator maintains a set of currently-active task tags. Tags activate based on:

- **Project stage:** `intake`, `planning`, `design-stage`, `g0-stage`, `g0.5-stage`, `g1-stage`, `g2-stage`, `g3-stage`, `g4-stage`, `g5-stage`, `g6-stage`, `launch`
- **Active agent:** `pm-active`, `designer-active`, `qa-active`, `delivery-head-active`, `orchestrator-active`, `agent-pm`, `agent-designer`, `agent-qa`, `agent-code-review`, `agent-content-migration`
- **Active task type:** `code-production`, `code-review`, `mockup-production`, `bug-management`, `content-migration`, `data-migration`, `theme-build`, `performance-task`
- **Platform (legacy):** `shopify-platform-active`, `bigcommerce-platform-active`, `magento-platform-active`, `wordpress-platform-active`, `woocommerce-platform-active`
- **Platform (canonical v1.11.5+):** `platform-shopify`, `platform-shopify-plus`, `platform-bigcommerce`, `platform-magento`, `platform-adobe-commerce`, `platform-wordpress`, `platform-woocommerce`, `platform-headless`, `platform-custom-node`
- **Project type:** `project-redesign`, `project-new-build`, `project-version-upgrade`, `project-migration`, `project-b2b-wholesale`, `project-multi-region`
- **Builder / stack (v1.11.5+):** `elementor-build`, `acf-classic-build`, `block-editor-build`, `sage-build`, `wordpress-page-builder-build`
- **Topic:** `destructive-op`, `outbound-comms`, `third-party-app-flow`, `env-issue`, `security-topic`, `state-mutation`, `escalation-needed`, `human-reference-only`

### Task tag activation rules (v1.11.5+) — CRITICAL

The orchestrator MUST derive the initial task-tag set from the project's `CLAUDE.md` at session start. Static enumeration in this file is not enough — a rule for deriving active tags from project context is required.

Derivation rules (platform-agnostic; each platform arm registers its own rule set — see below):

```
IF CLAUDE.md.platform_config.platform == <PLATFORM>:
  ACTIVATE the tag bundle registered by that platform's arm
  Bundle typically includes:
    - <platform>-platform-active
    - platform-<platform>
    - theme-build
    - code-production  (when writing code)

IF CLAUDE.md.platform_config.builder == <BUILDER>:
  ADDITIONALLY ACTIVATE the tag bundle registered for that builder

IF CLAUDE.md.current_gate in {G0.5, G4, G5, G6}:
  ADDITIONALLY ACTIVATE:
    - qa-active (for G4-G6)
    - audit-active (for G0.5)
    - g<N>-stage

IF CLAUDE.md.platform_config.project_type is set:
  ADDITIONALLY ACTIVATE:
    - project-<project_type>
      Example: project_type = new-build → activate `project-new-build`
                project_type = redesign → activate `project-redesign`
                project_type = version-upgrade → activate `project-version-upgrade`
                project_type = migration → activate `project-migration`
                project_type = b2b-wholesale-setup → activate `project-b2b-wholesale`
                project_type = multi-region-multi-store-setup → activate `project-multi-region`
  Platform arms may also register additional `<platform>-<project-type>-active` tags
  in their arm's `00-overview.md` — see the arm's "Cascade tag registration" section.
```

Each platform arm publishes its own tag-bundle-registration table at `skills/<platform>/knowledge/00-overview.md` under a "Cascade tag registration" section. Master's spine does NOT bake in specific platform tag names — that content lives in the platform arm.

If `CLAUDE.md` is missing this metadata, the orchestrator SHOULD ask the user before proceeding, not silently default.

### Worked example — reference platform arm

For a platform-specific worked example (which tags activate, which files must eager-load, what happens at each gate), read the ACTIVE platform's overview:

```
skills/<active-platform>/knowledge/00-overview.md
  §"Cascade tag registration + worked example"
```

Where `<active-platform>` is the value of `CLAUDE.md.platform_config.platform` for the current project.

Spine does not carry the worked example. The platform arm owns it. This split (D-EDITION-FILTER-01 rule 2) prevents cross-platform bleed at packaging — the orchestrator only follows the pointer for the ACTIVE platform, so a Shopify-edition install never sees a WP arm reference, and vice versa.

If your active platform's arm is missing the `"Cascade tag registration + worked example"` section, that's a platform-arm gap — escalate via the cross-window protocol to the appropriate platform window. Do NOT add the worked example to this spine file.

### Load algorithm (pseudocode)

```python
def load_cascade(active_tags: set) -> list:
    loaded = []

    for file in all_kb_files:
        meta = read_frontmatter(file)
        tier = meta.get("tier", 3)  # default Tier 3 if missing
        load_when = set(meta.get("load_when", []))

        if tier == 0:
            loaded.append(file)
        elif tier == 1 and (load_when & active_tags or "always" in load_when):
            loaded.append(file)
        elif tier == 2:
            # NOT proactively loaded — agent reads when needed
            pass
        elif tier == 3:
            # Never auto-loaded
            pass

    return loaded
```

### When agent reads a Tier 2 file explicitly

Agent calls `Read` tool with the file path. Orchestrator does not pre-include in cascade. Tier 2 files are documented in agent SKILL.md so agents know they exist.

### Cost target

Per `_spine/shared-knowledge/tiered-kb-loading.md` § "Estimated cost impact":

| Before (v1.5.1) | After (v1.5.5 Tier F) |
|-----------------|----------------------|
| ~79K cached tokens / message | ~15-25K cached tokens / message |
| Cache reads ~$100 per project | Cache reads ~$45 per project |

Validation: re-pilot on v1.5.5 and compare to Kitchen Blockers baseline.

### Frontmatter validation rule

Code Review Agent enforces on every KB file PR:
- `tier:` field present and value in {0, 1, 2, 3}
- `load_when:` array present (can be `["always"]` for Tier 0)
- Tier 0 files MUST have `"always"` in load_when
- Tier 0 file size MUST be < 15 KB (else flag for split)
- Tier 1 file size MUST be < 25 KB
- Tier 2 file size MUST be < 50 KB

---

## Why cascade order matters

If you load project-type before platform, the project-type skill references platform concepts that aren't loaded yet → hallucination or refusal.

If you load platform before spine, the platform skill expects spine agent context (e.g., "PM Agent will have already produced the spec") that isn't there → wrong assumptions.

Skill instructions reference each other. The cascade respects those references.

---

## Per-stage cascade examples

### Stage: spec generation (PM Agent)

```
1. orchestrator/SKILL.md (you)
2. _spine/pm-agent/SKILL.md
3. _spine/pm-agent/knowledge/01-sow-intake-protocol.md (read by PM Agent)
4. _spine/pm-agent/knowledge/02-clarification-questions.md (read on demand)
5. _spine/shared-knowledge/security-baseline.md (read if SOW touches sensitive data)
```

No platform skill loaded yet — spec is platform-agnostic structure.

### Stage: design (Designer Agent on Shopify Redesign)

```
1. orchestrator/SKILL.md
2. _spine/designer-agent/SKILL.md
3. _spine/designer-agent/knowledge/01-brand-questionnaire.md
4. <active-platform>/SKILL.md (platform context)
5. <active-platform>/knowledge/06-section-patterns.md (Shopify section conventions)
6. <active-platform>/projects/redesign/SKILL.md (redesign-specific design constraints)
7. <active-platform>/projects/redesign/knowledge/01-seo-preservation.md (URL-preserve = limited redesign freedom)
```

Now platform and project-type skills are loaded — Designer Agent understands "Shopify redesign means preserve URLs and design system, no schema changes."

### Stage: frontend development (sprint S1.2 on Shopify)

```
1. orchestrator/SKILL.md
2. <active-platform>/SKILL.md
3. <active-platform>/knowledge/01-coding-standards.md
4. <active-platform>/knowledge/02-naming-conventions.md
5. <active-platform>/knowledge/06-section-patterns.md
6. <active-platform>/knowledge/09-forbidden.md (CRITICAL — never skip this)
7. <active-platform>/examples/sections/[relevant examples] (reference implementations)
8. <active-platform>/templates/new-section.liquid (scaffolding)
9. <active-platform>/projects/redesign/SKILL.md (project-type context)
10. [project workspace]/design-tokens.json (from Designer Agent)
11. [project workspace]/section-map.json (which section to build)
12. [project workspace]/spec.md (acceptance criteria)
```

This is heavier context. Prompt caching makes it affordable — most files are cached after first session of the project.

---

## Loading rules

### Eager load (always, before agent acts)

- The agent's own SKILL.md
- `forbidden.md` for the active platform (if platform is loaded)
- Active project's `project.json`
- The contracts files referenced by the agent's SKILL.md

### Lazy load (on demand by the agent)

- Specific knowledge files (e.g., section patterns, only when building a section)
- Example files (only when needed for reference)
- Templates (only when scaffolding)
- Other project artifacts (spec.md, design-tokens.json) — load when relevant

### Never load unnecessarily

- Other platforms' KB (Shopify dev doesn't need WordPress files)
- Other project-type skills (Redesign agent doesn't need Migration skill)
- Other projects' state (Project A doesn't need Project B's `project.json`)

This keeps context window from bloating.

---

## Prompt caching strategy

Anthropic prompt caching gives 90% discount on cached content. Use it like this:

```
Stable content (cache for 5 min, often reused):
- Orchestrator SKILL.md
- Active platform's SKILL.md
- Active platform's knowledge/ files (mostly stable)
- Schemas

Dynamic content (don't cache):
- project.json (changes per turn)
- Specific work-in-progress artifacts
- User input
```

Cache keys are computed by Anthropic from the content prefix. Put stable content FIRST in the prompt; dynamic content LAST. This maximizes cache hits.

---

## Context budget management

Even with caching, context windows are finite. Per agent invocation:

| Content type | Budget |
|--------------|--------|
| Active skill's SKILL.md + 2-3 knowledge files | 5-10K tokens |
| Platform skill + relevant KB files | 8-15K tokens |
| Project-type skill | 3-5K tokens |
| Modifier skill (if loaded) | 2-3K tokens |
| Project state (project.json, spec.md, design-tokens.json) | 5-10K tokens |
| Examples + templates | 5-10K tokens |
| Conversation history | 2-5K tokens |
| **Total** | **30-58K tokens** |

Well under Sonnet's 200K window. Plenty of headroom.

If approaching context limit:
- Trim conversation history (keep last 5 turns)
- Don't load examples unless actively building from them
- Don't load all KB files — load on demand

---

## Cascade for special cases

### Discovery phase (PM Agent + Designer Agent collaboration)

PM Agent leads. Invokes Designer Agent for research portion. Designer Agent runs in a sub-context (its own cascade), returns results to PM Agent. PM Agent integrates and produces discovery report.

```
PM Agent (primary)
  ├── reads _spine/pm-agent/knowledge/discovery-protocol.md
  └── invokes Designer Agent (sub-context)
        └── _spine/designer-agent/SKILL.md
            ├── reads knowledge/01-brand-questionnaire.md
            └── reads knowledge/02-design-path-decision.md
        └── returns research findings
  └── integrates findings into discovery report
```

### Code Review (triggered by GitHub Action, not orchestrator)

Code Review Agent runs OUTSIDE the orchestrator session. It runs in a GitHub Action context. Its cascade:

```
GitHub Action workflow
  └── invokes Code Review Agent
       ├── reads _spine/code-review-agent/SKILL.md
       ├── reads _spine/code-review-agent/knowledge/review-checks.md
       ├── reads [platform]/knowledge/09-forbidden.md (active project's platform)
       ├── reads PR diff
       └── posts review comments to GitHub PR
```

Orchestrator is notified of review result (via webhook/API), records in `audit_log`. But orchestrator doesn't run the review itself.

### Migration project (parallel agents)

In a migration project, multiple agents run in parallel tracks. Orchestrator manages the parallelism:

```
Orchestrator invokes (in parallel):
  ├── Designer Agent (design track)
  ├── Content & Migration Agent (data track)
  └── PM Agent + SEO Agent (URL/SEO track)

Each tracks writes to their own artifacts.
Orchestrator manages convergence at QA gate.
```

Parallel execution requires careful lock management — each agent only writes to its OWN artifacts, not to shared state. Orchestrator updates `project.json` based on agent outputs.

---

## What gets passed between agents

When orchestrator hands off from Agent A to Agent B:

```
{
  "from_agent": "pm-agent",
  "to_agent": "designer-agent",
  "context_summary": "Spec approved at Gate 1. Designer needs to produce tokens + section map.",
  "artifacts_to_consume": ["spec.md", "milestones.json"],
  "artifacts_to_produce": ["design-tokens.json", "section-map.json", "visual-mockups"],
  "constraints": ["Preserve existing URLs", "WCAG 2.1 AA minimum", "LCP ≤3.0s"],
  "next_gate": "G2-design-approval"
}
```

This handoff block is written to `/projects/[client]/handoff-blocks/[from]-to-[to].md` for audit purposes.

---

## Anti-patterns

1. **Loading everything upfront.** Wastes tokens. Load on demand.
2. **Skipping the spine.** Project-type skills assume spine context. Always cascade through spine first.
3. **Loading multiple platforms.** Each project has ONE platform. Don't load others.
4. **Caching dynamic content.** `project.json` changes per turn. Don't cache it.
5. **Forgetting modifiers.** B2B projects need the modifier loaded. Discovery scoped projects need the discovery sub-skill.

---

Last reviewed: 2026-05-24 by Claude (initial)
Next review due: 2026-08-24
