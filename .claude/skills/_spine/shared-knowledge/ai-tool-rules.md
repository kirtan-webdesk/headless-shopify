---
tier: 1
load_when: ["file-production", "script-execution", "tool-use"]
---

# AI Tool Usage Rules

> v1.5.3 — closes the 3 NOT FIXED gaps from the Kitchen Blockers Skill Verification Report (2026-05-28). These are CLAUDE TOOL behaviors, not code patterns — they don't fit in `forbidden.md` (which is for source code rules). They live here as binding rules every agent must respect.

> **Tier 1 (load when any agent is producing files or scripts).**

---

## Why this file exists

Three failures during the Kitchen Blockers pilot were not code bugs — they were misuses of Claude's own tools:

1. Write tool calls that fail because the target file wasn't read first in the session
2. Bash heredocs used to write JS, which break on bracket characters and cause `SyntaxError`
3. JS scripts using undefined variables (e.g., `GBGC`) that silently emit `"undefined"` in output

None of these had a rule anywhere in v1.5.2. The verification audit caught the miss. This file fixes it.

---

## Rule TOOL-001 — Write tool requires prior Read for existing files

**Severity:** P1

### The behavior

The Write tool maintains an internal "seen files" list per Claude session. If you call `Write` on a path that already exists on disk but was NOT read earlier in the same session, the tool errors:

```
File has not been read yet. Read it first before writing to it.
```

This is a guard against blind overwrites. It does NOT apply to brand-new files at a path that does not yet exist — those can be written directly.

### The rule

Before calling `Write` on any path that may already exist:

1. Call `Read` on the path first (any line range counts)
2. THEN call `Write` with the new content

For brand-new paths (file doesn't exist yet): `Write` directly without a prior Read is fine.

### When this rule applies

- Editing any file already in the repo
- Overwriting a generated artifact from a previous session
- Re-emitting a script after a fix
- Updating a doc that exists at the path

### When this rule does NOT apply

- Creating a file at a path that doesn't exist
- Using the `Edit` tool (which has its own internal handling)
- Using shell commands (`cp`, `mv`, `echo >`) — those bypass Claude's tool guard

### Why the system does this

Prevents accidental destructive overwrites. Forces the agent to know what's being replaced.

### Anti-pattern (from Kitchen Blockers Session 2)

```
[Generated kb-full-report.js without prior Read]
Write call → ERROR: File has not been read yet
[Lost ~3 minutes debugging the error]
```

### Correct pattern

```
Read kb-full-report.js (limit: 10 lines is fine)
Edit OR Write kb-full-report.js with the changes
```

---

## Rule TOOL-002 — Never write JavaScript via Bash heredoc

**Severity:** P1

### The behavior

Bash heredocs (`cat <<EOF ... EOF`) parse the content for shell variable expansion and certain special characters. When the content contains JavaScript:

- Array literals `[ ... ]` — heredoc parses brackets, may strip or rearrange
- Object literals `{ ... }` — `{` and `}` interpreted in some contexts
- Template strings with `${expr}` — Bash expands `${expr}` BEFORE writing the file
- Backticks `` ` `` — Bash treats as command substitution

Result: the JS file written to disk has corrupted syntax. Running it produces:
```
SyntaxError: Unexpected token
```

### The rule

ALWAYS use the Write tool to create `.js`, `.ts`, `.jsx`, `.tsx`, `.mjs` files.

NEVER use Bash heredoc for these file types.

For other file types where heredoc is acceptable (plain text, simple shell, basic config), still prefer Write tool for consistency.

### Acceptable heredoc use cases

- Writing a small `.txt` config with no special characters
- Writing a one-line `.env` file (and even then, prefer Write)
- Generating a markdown file with no inline JS code blocks containing template strings

### Forbidden heredoc use cases

- JavaScript files (`.js`, `.ts`, etc.)
- JSON with complex nested structures (some `${}` patterns trigger expansion)
- Liquid templates (`{{ }}` and `{% %}` patterns may interact with shell)
- Files containing backticks

### Anti-pattern (from Kitchen Blockers Session 2)

```bash
cat <<EOF > kb-full-report.js
const hn = (rows) => [
  rows.map(r => ({ name: \`\${r.name}\`, count: r.count }))
];
EOF
# → SyntaxError at line 70 when run with node kb-full-report.js
```

### Correct pattern

```
Write kb-full-report.js with:
const hn = (rows) => [
  rows.map(r => ({ name: `${r.name}`, count: r.count }))
];
```

Write tool delivers the content byte-for-byte. No shell interpretation.

---

## Rule TOOL-003 — Validate variable scope before running generated scripts

**Severity:** P2

### The behavior

When generating JS scripts via Write, agents sometimes reference variables that are not declared in the same scope. Common patterns:

- Using a variable from an earlier "template" mentally but not writing the declaration
- Copying a snippet from a different file that referenced a `const` not present in the new file
- Using shorthand abbreviations (like `GBGC` for some background color) that were never defined

JS doesn't error at parse time on undefined references inside template strings. It silently emits the string `"undefined"` in the output.

For docx-js (which the Kitchen Blockers session used), this manifested as documents with `"undefined"` text in headers, table cells, etc.

### The rule

Before running any generated JS script that writes user-facing output:

1. Lint the file for undeclared variables. Tools:
   - `node --check script.js` catches syntax errors but NOT undeclared variables
   - ESLint with `no-undef` rule catches undeclared variables
   - A simple grep for variable names used in template strings + verifying each has a `const`, `let`, `var`, or function parameter declaration in scope
2. If undeclared variables are found, FIX before running
3. If `"undefined"` appears in output, treat as a script bug, not a content issue

### Implementation suggestion

Add a pre-run check to scripts that generate docs:

```javascript
// At top of generator script
const REQUIRED_VARS = ['GBGC', 'CLIENT_NAME', 'DATE', 'SESSION_ID'];
const missing = REQUIRED_VARS.filter(v => typeof eval(v) === 'undefined');
if (missing.length) {
  console.error(`Missing variables: ${missing.join(', ')}`);
  process.exit(1);
}
```

(Note: `eval` is forbidden in production code per JS-003, but acceptable in build-time generators with explicit allowlist.)

### Anti-pattern (from Kitchen Blockers Session 2)

```javascript
// docx generation
new Paragraph({
  text: `Background: ${GBGC || 'default'}`,  // GBGC never declared
});
// Output: "Background: undefined"
// Or: "Background: default" if the || fallback rescues it
```

### Correct pattern

```javascript
const GBGC = '#f5f5f5';  // Explicitly declared
new Paragraph({
  text: `Background: ${GBGC}`,
});
```

OR catch the undeclared variable BEFORE the script runs.

---

## Rule TOOL-004 — Prefer Edit over Write for small changes to existing files

**Severity:** P3

### The behavior

The `Edit` tool sends only the diff (old_string + new_string). The `Write` tool sends the entire file content.

For small changes to large files, `Edit` is dramatically cheaper (fewer output tokens) AND less risky (smaller surface for the agent to corrupt the unchanged parts).

### The rule

| Change type | Use |
|-------------|-----|
| Add a single function to a 500-line file | `Edit` |
| Change one config line | `Edit` |
| Rename a variable across the file | `Edit` with `replace_all` |
| Initial creation of a file | `Write` |
| Wholesale rewrite of a small (<50 line) file | `Write` |
| Reorganization that touches > 30% of file | `Write` |

### Anti-pattern

Using `Write` for a 1-line change in a 1000-line file — wastes 999 lines of output tokens AND risks corrupting any of those 999 lines.

### Correct pattern

```
Edit file.js
  old_string: "const RATE = 0.05;"
  new_string: "const RATE = 0.075;"
```

Cost: ~20 tokens vs. ~5,000 tokens for a Write of the same file.

---

## Rule TOOL-005 — Pre-flight validate generated scripts before execution

**Severity:** P2

### The behavior

Generated scripts can have:
- Syntax errors
- Undeclared variables (per TOOL-003)
- Missing dependencies (`require()` for a package not installed)
- Wrong file paths
- Permission issues

Running a broken script wastes a tool call AND can leave partial output (half-written files, corrupted state).

### The rule

Before running any generated script:

1. **Syntax check** — `node --check script.js` (or platform equivalent)
2. **Dependency check** — verify `require()` targets exist
3. **Variable scope check** — per TOOL-003
4. **Path check** — verify file paths referenced exist or can be created

Only if all pre-flight checks pass: run the script.

If a pre-flight check fails: fix, then re-run pre-flight, then execute.

### Anti-pattern

```
[Write generator script]
[Run script]
[Script errors at line 70]
[Edit fix]
[Run script]
[Script errors at line 73]
[Edit fix]
...
```

Each round trip costs tokens and time. Pre-flight catches all errors in one pass.

### Correct pattern

```
[Write generator script]
node --check script.js  → syntax OK
grep -E "const|let|var|function" script.js → matches variables used in template strings
[Run script — passes on first try]
```

---

## Rule TOOL-006 — Tool fallback discipline

**Severity:** P2

### The behavior

When a tool call fails, the natural impulse is to retry with a different tool or approach. This can mask the root cause and lead to inconsistent behavior.

### The rule

If a tool fails:

1. **Read the error.** Don't ignore it.
2. **Identify the root cause.** Not "the tool is broken" — "I called Write without reading first" or "I used heredoc on JS."
3. **Fix the cause.** Don't switch tools to avoid the rule.
4. **Document.** If the same failure happens 3+ times across projects → KB candidate.

### Anti-pattern

```
[Write fails: file not read]
[Switch to bash echo > to write the file]  ← bypassing the guard
```

### Correct pattern

```
[Write fails: file not read]
[Read the file]
[Write succeeds]
```

---

## Rule TOOL-007 — Honor the per-agent `tools:` whitelist in SKILL.md frontmatter
**Added v1.11.0.**

### The behavior

Every SKILL.md frontmatter declares a `tools:` array listing the tools that agent is permitted to call. Calling a tool not in that list is forbidden — even if the tool is otherwise available in the environment.

### The rule

1. Before invoking any tool, the agent must verify the tool name appears in its own SKILL.md `tools:` list.
2. If a tool is not whitelisted, the agent halts and asks the user to either: (a) provide a workaround using whitelisted tools, or (b) explicitly expand the whitelist in the SKILL.md.
3. Whitelist changes require a decision log entry and a SKILL.md edit; they are not made silently mid-task.

### Default whitelists (v1.11.0)

For the spine agents (conservative starting point — to be tightened over time):

| Agent | Default `tools:` |
|-------|-------------------|
| orchestrator | Read, Glob, Grep, Bash |
| pm-agent | Read, Write, Edit, Glob, Grep, Bash |
| designer-agent | Read, Write, Edit, Glob, Grep, Bash |
| code-review-agent | Read, Glob, Grep, Bash |
| qa-agent | Read, Glob, Grep, Bash (Playwright tools added in v1.12.0) |
| delivery-head | Read, Glob, Grep, Bash |
| content-migration-agent | Read, Write, Edit, Glob, Grep, Bash |

Platform skills and project-type skills inherit the parent agent's whitelist unless overridden.

### Why

Tool whitelisting per agent is a hygiene improvement (don't let QA Agent write code; don't let Designer Agent run destructive Bash). Without explicit whitelists, all agents have all tools, which breaks least-privilege and complicates audit.

### Anti-pattern

QA Agent invoking the Write tool to edit production code because it found a typo during testing. The fix loop must go: QA → Bug report → Code Review or Dev Agent → Edit. Not QA → Edit directly.

### Correct pattern

QA Agent logs the typo as a bug in the bug tracker, surfaces to PM Agent, PM routes to Dev. QA Agent never touches code directly.

---

## Cross-references

| Rule | Related |
|------|---------|
| TOOL-001 | SKILL.md "Critical rules" sections — all agents must respect |
| TOOL-002 | Backend Agent SKILL.md (most JS generation), Code Review Agent (catches in PRs) |
| TOOL-003 | Backend Agent SKILL.md, any agent generating reports/docs |
| TOOL-004 | All agents — cost discipline (per Tier F) |
| TOOL-005 | All agents executing generated scripts |
| TOOL-006 | All agents — failure mode discipline (K4) |

---

## How agents reference this file

Each agent SKILL.md's "Critical rules" section MUST include:

```markdown
N. **Respect AI tool usage rules.** Read `_spine/shared-knowledge/ai-tool-rules.md` for Write tool prerequisites (TOOL-001), heredoc restrictions (TOOL-002), and pre-flight validation (TOOL-005). These are NOT optional — Kitchen Blockers pilot had 3 separate tool failures from violating them.
```

---

## Failure mode tracking

If any rule above is violated and causes a session failure:

1. Capture in `failure-modes.md` per project
2. Reference rule ID (TOOL-NNN)
3. At 3+ occurrences across projects, strengthen wording or add new sub-rules
4. Update relevant SKILL.md cross-references

---

## Why these aren't in `forbidden.md`

`forbidden.md` covers SOURCE CODE patterns (Liquid, JS, CSS) that ship to production. These rules cover AGENT TOOL USAGE during generation — a different layer.

Mixing them would pollute `forbidden.md` and dilute the "this is what your code must look like" message. Separation is intentional.

---

Last reviewed: 2026-05-28 by Claude (v1.5.3 — Skill Verification Report response)
Next review due: 2026-08-28
