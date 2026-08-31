---
name: frontmatter-spec
description: Canonical schema for frontmatter in SKILL.md and KB markdown files across the WebDesk delivery system. Required fields, validation rules, defaults, examples.
version: 1.0.0
tier: 3
load_when: ["human-reference-only"]
tools: []
model: any
used_by: ["all-agents", "skill-loader", "validate-frontmatter.sh"]
---

# Frontmatter Specification — v1.11.0

> Every `.md` file in `skills/` and `docs/` declares a frontmatter block. This file is the contract. The validator at `tools/scripts/validate-frontmatter.sh` enforces it.

---

## Two file types

There are two file types in the system. Each has different required fields:

1. **SKILL.md files** — entry points for skills. Loaded into agent context when the skill is invoked. Strict schema.
2. **KB (knowledge base) files** — `.md` files inside `knowledge/` directories. Loaded on-demand based on `load_when`. Lighter schema.

Templates, planning docs, and release notes also have minimal frontmatter — see Section 4 below.

---

## Section 1 — SKILL.md frontmatter (REQUIRED)

Every `SKILL.md` file MUST have all 7 required fields. Optional fields are allowed.

### Required fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `name` | string | Lowercase, kebab-case. Used by the skill loader as the skill identifier. Must match the directory name. | `pm-agent`, `wordpress-woocommerce`, `sow-builder` |
| `description` | string | 1-3 sentences explaining what the skill does, when to invoke it. Used by skill auto-trigger / search. | `Project Manager agent. Owns intake (G0), planning (G1), gates, and per-milestone documentation. Reads sow-spec.md at G0 if present.` |
| `version` | string | SemVer. Bumped on substantive change. | `1.0.0`, `2.3.1` |
| `tier` | integer | 0/1/2/3. See Section 5 — Tier definitions. | `0` for spine/persona, `1` for active task tags, `2` for on-demand, `3` for human-reference-only |
| `load_when` | array of strings | Trigger conditions that cause the skill to be loaded into context. See Section 6 — load_when triggers. | `["always"]`, `["g0-stage", "intake-active"]` |
| `tools` | array of strings | Whitelist of tool names this skill is permitted to call. Empty array `[]` means no tools (read-only context). | `["Read", "Write", "Edit", "Glob", "Grep", "Bash"]` |
| `model` | enum | Which Claude model the skill expects. `opus` / `sonnet` / `haiku` / `any`. | `opus` for agents that need deep reasoning, `sonnet` for routine work, `haiku` for fast scans |

### Optional fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `color` | string | Visualization tag for multi-agent dashboards. Hex or named color. | `blue`, `#ff6600` |
| `argument-hint` | string | Hint shown when skill is invoked via slash command. | `<task description>`, `[section-name or "full"]` |
| `applies_to` | array of strings | Platforms / project types this skill targets. Empty / omitted = applies everywhere. | `["wordpress", "woocommerce"]`, `["shopify-plus"]` |
| `used_by` | array of strings | Other skills / agents that reference this one. Documents dependency. | `["qa-agent", "designer-agent"]` |
| `cost_budget_usd` | number | Per-invocation soft cost ceiling. Orchestrator warns above this. | `2.0` |
| `deprecated` | boolean | If true, this skill should not be invoked; refer to `replaced_by`. | `false` |
| `replaced_by` | string | Slug of replacement skill if deprecated. | `pm-agent-v2` |

### Example — spine agent SKILL.md

```yaml
---
name: pm-agent
description: Project Manager agent. Owns intake (G0), planning (G1), gate enforcement, and per-milestone documentation. Reads outputs/<client_slug>/sow-spec.md at G0 Step 0 if present. Auto-schedules via 7 triggers.
version: 2.0.0
tier: 0
load_when: ["always"]
tools: ["Read", "Write", "Edit", "Glob", "Grep", "Bash"]
model: opus
color: green
argument-hint: <command or gate name>
used_by: ["orchestrator", "delivery-head"]
cost_budget_usd: 5.0
---
```

### Example — platform skill SKILL.md

```yaml
---
name: wordpress-woocommerce
description: WordPress + WooCommerce platform skill. Covers PHP coding standards, ACF + Classic editor patterns, page builder constraints, WooCommerce architecture, plugin ecosystem, HPOS migration.
version: 1.0.0
tier: 1
load_when: ["platform-wordpress", "platform-woocommerce", "project-uses-wordpress"]
tools: ["Read", "Write", "Edit", "Glob", "Grep", "Bash"]
model: sonnet
applies_to: ["wordpress", "woocommerce"]
---
```

---

## Section 2 — KB file frontmatter (REQUIRED)

Every `.md` file inside `knowledge/` directories MUST have 3 required fields. Description is recommended but may be `TBD` for v1.11.0; full descriptions to be backfilled in v1.12.0+.

### Required fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `tier` | integer | 0/1/2/3 — see Section 5 | `2` for most KB files |
| `load_when` | array of strings | When this file is loaded into context | `["g0-intake-stage"]`, `["code-production", "platform-shopify"]` |
| `description` | string | 1-2 sentence summary. May be `TBD` in v1.11.0; backfilled in v1.12.0. | `WordPress PHP coding standards: tabs, naming, sanitization, escaping, capability checks.` |

### Optional fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `applies_to` | array of strings | Platforms / project types | `["wordpress"]` |
| `decision_refs` | array of strings | Decision codes this file implements / references | `["D-WP-01", "D-WP-02"]` |
| `last_reviewed` | date | When the file was last reviewed | `2026-05-28` |
| `next_review_due` | date | When the file should be reviewed next | `2026-08-28` |
| `superseded_by` | string | Path to replacement file if deprecated | `<platform>/knowledge/<file>-v2.md` |

### Example — KB file with full frontmatter

```yaml
---
tier: 1
load_when: ["code-production", "platform-wordpress"]
description: WordPress PHP coding standards: WP PHPCS rules, naming conventions, escaping/sanitization, nonce usage, capability checks.
applies_to: ["wordpress", "woocommerce"]
decision_refs: ["D-WP-01"]
last_reviewed: 2026-05-28
next_review_due: 2026-08-28
---
```

### Example — KB file with TBD description (v1.11.0)

```yaml
---
tier: 2
load_when: ["theme-build", "platform-wordpress"]
description: TBD
applies_to: ["wordpress"]
---
```

---

## Section 3 — Template files frontmatter (REQUIRED, lightweight)

Files inside `templates/` directories.

```yaml
---
template_type: theme-baseline-decision | sow-spec | client-handoff | ...
applies_to: ["wordpress", "shopify"]
last_reviewed: 2026-06-03
---
```

---

## Section 4 — Docs (release notes, planning, user guide) frontmatter (OPTIONAL)

Docs in `docs/` directories do NOT load at runtime. Frontmatter is optional but if present:

```yaml
---
doc_type: release-notes | planning | user-guide
version: 1.10.0
audience: human-only
---
```

---

## Section 5 — Tier definitions

Tier controls when the file is loaded into context.

| Tier | Definition | Examples |
|------|------------|----------|
| **0** | Always loaded into every agent's context | `persona.md`, `forbidden-global.md`, `ai-tool-rules.md`, frontmatter spec, agent SKILL.md files when their agent is active |
| **1** | Loaded when matching task tag is active | platform SKILL.md, project-type SKILL.md, KB files for active task |
| **2** | On-demand only — agent explicitly requests | Most knowledge files (templates, gate-specific KBs) |
| **3** | Never proactively loaded — human reference only | Release notes, planning docs, decision inventory, deprecated files |

Cascade loader (per `_spine/orchestrator/knowledge/06-agent-cascade.md`) reads tier values when assembling context.

---

## Section 6 — `load_when` trigger vocabulary

Common triggers. Add new ones as the system grows; document them here.

### Arm-registered tags — VALID alongside this vocabulary (v1.11.18+)

Per `_spine/orchestrator/knowledge/06-agent-cascade.md`, **each arm registers its own tag bundle in `skills/<arm>/knowledge/00-overview.md`**. Those tags are valid `load_when` triggers even though they do not appear below. Examples: `shopify-platform-active`, `headless-platform-active`, `shopify-version-upgrade-active`. If an arm needs a tag no other arm needs, register it there rather than adding it here.

The validator (v1.11.18+) accepts a `load_when` tag if it appears in either (a) this file's universal vocabulary, or (b) the arm's own registered bundle. A tag registered in neither WARN-s in the validator (soft-launch — WARN today, FAIL after all arms' bundles are audited) because a `load_when` tag no loader knows about silently prevents the file from ever loading. That is the failure mode this validation exists to catch.

### Universal triggers
- `always` — loaded always
- `human-reference-only` — never loaded by AI; humans only

### Stage triggers
- `g0-stage`, `g0-intake-stage`, `g0.5-audit-stage`, `g1-plan-stage`, `g2-design-stage`, `g3-scaffold-stage`, `g4-sprint-qa`, `g5-milestone-stage`, `g6-prelaunch-stage`

### Platform triggers
- `platform-shopify`, `platform-shopify-plus`, `platform-bigcommerce`, `platform-magento`, `platform-adobe-commerce`, `platform-wordpress`, `platform-woocommerce`, `platform-headless`, `platform-custom-node`

### Project-type triggers
- `project-redesign`, `project-new-build`, `project-version-upgrade`, `project-migration`, `project-b2b-wholesale`, `project-multi-region`

### Activity triggers
- `code-production`, `theme-build`, `state-mutation`, `destructive-op`, `file-production`, `outbound-comms`

### Agent triggers
- `agent-pm`, `agent-designer`, `agent-qa`, `agent-code-review`, `agent-content-migration`, `agent-orchestrator`, `agent-delivery-head`

---

## Section 7 — Validation rules

The validator at `tools/scripts/validate-frontmatter.sh` enforces:

1. **Every SKILL.md must have all 7 required fields.** Missing field = build fails.
2. **Every KB file must have `tier`, `load_when`, `description` (may be `TBD`).** Missing = build fails.
3. **`name` must match directory name.** SKILL.md at `skills/foo/SKILL.md` must have `name: foo`.
4. **`tier` must be integer 0-3.** Other values = fail.
5. **`load_when` must be a non-empty array.** Empty = fail (use `["always"]` if truly universal).
6. **`tools` must be a valid tool name list.** Unknown tools = warning (not fail — tool list evolves).
7. **`model` must be one of `opus`/`sonnet`/`haiku`/`any`.** Other = fail.
8. **`version` must be SemVer.** Non-SemVer = warning.
9. **`description: TBD` is allowed in v1.11.0** for KB files. Must be replaced with real description by v1.12.0.

---

## Section 8 — How to add frontmatter to an existing file

1. Read the file. Identify which type it is (SKILL.md vs KB vs template vs doc).
2. Open the file, insert frontmatter at the very top (lines 1-N).
3. Fill in required fields. Use `TBD` for KB description if rushed.
4. Run `tools/scripts/validate-frontmatter.sh skills/<path>/<file>.md` to verify.
5. Commit.

---

## Section 9 — Migration path for legacy frontmatter (pre-v1.11.0)

Files with only `tier:` + `load_when:` (the v1.5.5 partial frontmatter) are upgraded automatically by `tools/scripts/upgrade-frontmatter.sh`. Adds `description: TBD` to KB files, adds full schema to SKILL.md files.

---

## Anti-patterns

1. **Setting `description: TBD` and leaving it.** Backfill by v1.12.0. Tracked.
2. **Listing tools you don't actually use.** Whitelists should be conservative.
3. **Using `model: opus` for routine work.** Cost matters; use the cheapest model that gets the job done.
4. **Using `tier: 0` to force a file into every context.** That's how tokens balloon. Reserve tier 0 for genuinely universal files.
5. **Inventing new `load_when` triggers without documenting them in Section 6.** Add the trigger here when you use it.
6. **Frontmatter at the bottom of the file.** Always at the very top (lines 1-N).
7. **Missing `---` delimiters.** YAML frontmatter requires opening and closing `---`.
8. **Tabs in YAML.** YAML requires spaces. Validator will fail on tabs.
9. **Quoting strings unnecessarily.** Only quote when YAML needs it (special chars, leading numbers).
10. **Description that doesn't describe.** "WordPress stuff" is not a description. Be specific.

---

Last reviewed: 2026-06-03 by Claude (v1.11.0 initial spec)
Next review due: 2026-09-03
