# Quickstart — Per-Project Setup

> Read this BEFORE starting any new client project. Avoids the 200K context error.

---

## The 30-second version

1. Copy `CLAUDE.md` template to your project root
2. Copy `HANDOFF.md` template to your project root
3. Fill in the placeholders
4. Start your Claude Code session
5. Claude reads `CLAUDE.md` automatically. Everything else loads on-demand.

That's it.

---

## Why this matters (the context window problem)

Claude Code has a 200K token context window. The full WebDesk skill bundle is ~2 MB across 196 markdown files. If you try to auto-load everything, you hit the limit and Claude Code errors out.

**The fix:** load only what you need. `CLAUDE.md` at your project root is the entry point. It tells Claude which skill files to read on demand. Nothing else loads automatically.

---

## Step-by-step

### Step 1 — Decide what your project needs

Your project will load ONE platform's content. Pick one:

| Tomorrow's project type | Load these |
|--------------------------|------------|
| WordPress + Elementor | `wordpress-woocommerce/` + `_spine/` only |
| WordPress + ACF (custom theme) | `wordpress-woocommerce/` + `_spine/` only |
| Shopify (any project type) | `shopify/` + `_spine/` only |
| BigCommerce | `bigcommerce/` + `_spine/` only |
| Magento / Adobe Commerce | `magento-adobe-commerce/` + `_spine/` only |

DELETE the platform folders you don't need from your `.claude/skills/` directory for THIS project. Don't keep all 4 platforms loaded for a WordPress project.

### Step 2 — Copy the templates

From the skill bundle:
```
skills/_spine/shared-knowledge/claude-md-template.md
skills/_spine/shared-knowledge/handoff-template.md
```

Copy both to your project root, renaming:
```
{your-project-root}/CLAUDE.md       (from claude-md-template.md)
{your-project-root}/HANDOFF.md      (from handoff-template.md, empty initially)
```

### Step 3 — Fill in CLAUDE.md

Open `CLAUDE.md` at your project root. Replace every `{{placeholder}}` with real values. Critical sections:

- **Project identity** — client name, slug, platform, plan tier, project type, target launch date
- **SOW + Spec references** — paths to your `sow-spec.md` if SOW Builder produced one
- **Team** — Internal PM, designer, dev lead, QA lead
- **Current gate state** — where you are right now (G0 / G0.5 / G1 / etc.)

Set the rest as you reach those gates.

### Step 4 — Tell Claude what to load

Inside `CLAUDE.md`, at the section "Required skill files for this project", list ONLY the files this project needs. Example for a WordPress Elementor project:

```markdown
## Required skill files for this project

When this project's session starts, load:

- `skills/_spine/persona.md`
- `skills/_spine/shared-knowledge/forbidden-global.md`
- `skills/_spine/shared-knowledge/ai-tool-rules.md`
- `skills/_spine/pm-agent/SKILL.md`
- `skills/_spine/designer-agent/SKILL.md`
- `skills/_spine/qa-agent/SKILL.md`
- `skills/_spine/code-review-agent/SKILL.md`
- `skills/wordpress-woocommerce/SKILL.md`
- `skills/wordpress-woocommerce/knowledge/08-page-builders.md` (D-WP-03 reference)
- `skills/wordpress-woocommerce/knowledge/20-elementor-architecture.md`
- `skills/wordpress-woocommerce/knowledge/21-elementor-performance.md`
- `skills/wordpress-woocommerce/knowledge/22-elementor-qa-checklist.md`
- `skills/wordpress-woocommerce/knowledge/23-scss-architecture-wp.md`

Do NOT load other platform skills (shopify/, bigcommerce/, magento-adobe-commerce/).
Do NOT load knowledge/ files outside this list unless explicitly requested.
```

This list goes in your project's `CLAUDE.md`, customized per project.

### Step 5 — Start the session

Open Claude Code in the project root. The session begins. Claude reads `CLAUDE.md` automatically. Everything else loads on demand from the list you provided in Step 4.

### Step 6 — Close the session properly

At session end:
1. Update `HANDOFF.md` (next-session resume info)
2. Update `CLAUDE.md` "Current gate state" + "Recent decisions" + "Open blockers"
3. Commit both files to git

---

## What goes WHERE — quick reference

| File | Location | Auto-loaded? |
|------|----------|--------------|
| `CLAUDE.md` | Project root | YES (Claude Code does this) |
| `HANDOFF.md` | Project root | YES if Claude is told to in `CLAUDE.md` |
| `sow-spec.md` | `outputs/<slug>/` | YES if path listed in CLAUDE.md |
| Spine `persona.md` | `skills/_spine/` | Only if listed in CLAUDE.md |
| `forbidden-global.md` | `skills/_spine/shared-knowledge/` | Only if listed in CLAUDE.md |
| Platform `SKILL.md` | `skills/{platform}/` | Only if listed in CLAUDE.md |
| Knowledge files | `skills/{platform}/knowledge/` | On demand only (when Claude needs them) |

---

## Common mistakes

1. **Loading every SKILL.md "just in case"** — that's how you blow context. Only list what THIS project needs.

2. **Keeping all 4 platform folders** in `.claude/skills/` for a single-platform project. Delete the unused ones.

3. **Forgetting to update HANDOFF.md at session end.** Next session starts cold.

4. **Updating CLAUDE.md to over 300 lines.** Hard cap. Archive older entries.

5. **Treating CLAUDE.md as a status report for humans.** It's for the next session to bootstrap. Keep it short, structured, latest-state only.

6. **Skipping the `Required skill files for this project` section** in CLAUDE.md. Without it, Claude doesn't know what's relevant — loads too much or too little.

7. **Using the same CLAUDE.md from project A on project B.** Each project gets its own. Copy the template, fill from scratch.

---

## If you hit the 200K error again

1. Check `.claude/skills/` — only the platform you need should be there
2. Check `CLAUDE.md` "Required skill files" — should be 10-15 files max, not the whole tree
3. Run `/compact` in Claude Code session to reduce conversation history
4. Restart session — fresh context, only loads what `CLAUDE.md` specifies
5. If still failing, run `tools/scripts/init-project.sh` to regenerate the per-project setup from scratch

---

## What's NOT supported (deliberately)

- **Multi-platform projects.** One project = one platform. If client has both Shopify and WP, run them as separate projects with separate `CLAUDE.md` files in separate directories.
- **Loading all knowledge files at once.** They load on demand only.
- **CLAUDE.md without `Required skill files` section.** That section is mandatory for v1.11.2+.

---

Last reviewed: 2026-06-03 by Claude (v1.11.2 initial quickstart)
