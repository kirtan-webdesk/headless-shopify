#!/usr/bin/env python3
"""
validate-frontmatter.py — v1.11.0 frontmatter validator for WebDesk AI Delivery System

Walks the skills/ tree, checks every .md file against the spec in
_spine/shared-knowledge/frontmatter-spec.md.

Usage:
  python3 tools/scripts/validate-frontmatter.py [PATH]
  python3 tools/scripts/validate-frontmatter.py --strict   (warnings become errors)
  python3 tools/scripts/validate-frontmatter.py --json     (JSON output for CI)

Exits 0 if all required fields present and valid. Exits 1 on any error.

Spec reference: skills/_spine/shared-knowledge/frontmatter-spec.md
"""

import argparse
import json
import os
import re
import sys
from pathlib import Path

# ---------------------------------------------------------------------------
# Schema constants — match frontmatter-spec.md
# ---------------------------------------------------------------------------

SKILL_REQUIRED_FIELDS = ["name", "description", "version", "tier", "load_when", "tools", "model"]
KB_REQUIRED_FIELDS = ["tier", "load_when", "description"]

VALID_TIERS = {0, 1, 2, 3}
VALID_MODELS = {"opus", "sonnet", "haiku", "any"}
KNOWN_TOOLS = {
    "Read", "Write", "Edit", "Glob", "Grep", "Bash",
    "Task", "TodoWrite", "WebFetch", "WebSearch",
    "NotebookEdit", "NotebookRead",
    # MCP-style tools — accept anything starting with mcp__
}

SEMVER_RE = re.compile(r"^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?$")

# v1.11.18+ — universal load_when tag vocabulary from
# _spine/shared-knowledge/frontmatter-spec.md §6. Arm-registered tags are
# additionally valid but not enumerated here — they're gathered dynamically
# from each arm's knowledge/00-overview.md. See load_universal_tags() below.
UNIVERSAL_LOAD_WHEN_TAGS = {
    # Universal
    "always", "human-reference-only",
    # Stage
    "g0-stage", "g0-intake-stage", "g0.5-audit-stage", "g1-plan-stage",
    "g2-design-stage", "g3-scaffold-stage", "g4-sprint-qa",
    "g5-milestone-stage", "g6-prelaunch-stage",
    # Platform
    "platform-shopify", "platform-shopify-plus", "platform-bigcommerce",
    "platform-magento", "platform-adobe-commerce", "platform-wordpress",
    "platform-woocommerce", "platform-headless", "platform-custom-node",
    # Project-type
    "project-redesign", "project-new-build", "project-version-upgrade",
    "project-migration", "project-b2b-wholesale", "project-multi-region",
    # Activity
    "code-production", "theme-build", "state-mutation", "destructive-op",
    "file-production", "outbound-comms",
    # Agent
    "agent-pm", "agent-designer", "agent-qa", "agent-code-review",
    "agent-content-migration", "agent-orchestrator", "agent-delivery-head",
    # v1.11.5+ — cascade-derived tags used by orchestrator context loading
    "shopify-platform-active", "shopify-version-upgrade-active",
    "shopify-plus-features", "headless-platform-active",
    "acf-classic-build", "elementor-build", "block-editor-build",
    "woocommerce-platform-active",
    # v1.11.13+
    "theme-baseline-premium", "premium-theme-active",
    # v1.11.11+
    "agent-specific-detail",
    # v1.11.18+ — arm-registered tags surfaced by initial validator scan.
    # Added to universal because they're widely used across arm KB files;
    # documenting them here beats forcing every arm to redeclare in each
    # 00-overview.md. Deliberately EXCLUDED (kept as WARN — real debt):
    #   g1-stage / g2-stage / ... (spec: g1-plan-stage / g2-design-stage / ...)
    #   code-review (spec: agent-code-review)
    #   intake (spec: g0-intake-stage)
    #   {arm}-code-production (spec: use universal code-production)
    "wordpress-platform-active", "bigcommerce-platform-active",
    "magento-platform-active",
    "platform-knowledge-detail",
    "pm-active", "qa-active", "mockup-production", "task-execution",
    # v1.11.19+ — Headless arm registered tags (surfaced in 00-overview §7
    # machine-readable tag table added this release)
    "audit-active",
}

# ---------------------------------------------------------------------------
# Frontmatter parsing
# ---------------------------------------------------------------------------

def extract_frontmatter(path):
    """Return (yaml_str, body_starts_at_line) or (None, None) if no frontmatter."""
    try:
        with open(path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    except Exception as e:
        return None, str(e)

    if not lines or not lines[0].strip() == "---":
        return None, "no frontmatter delimiter at line 1"

    end_idx = None
    for i in range(1, len(lines)):
        if lines[i].strip() == "---":
            end_idx = i
            break

    if end_idx is None:
        return None, "frontmatter not closed with ---"

    yaml_str = "".join(lines[1:end_idx])
    return yaml_str, end_idx + 1

def parse_yaml(yaml_str):
    """Minimal YAML parser sufficient for our frontmatter. Returns dict or raises ValueError."""
    result = {}
    current_key = None
    current_list = None

    for line_num, raw in enumerate(yaml_str.splitlines(), start=1):
        # Skip empty / comment lines
        stripped = raw.strip()
        if not stripped or stripped.startswith("#"):
            continue
        if "\t" in raw:
            raise ValueError(f"Line {line_num}: tab character (YAML requires spaces)")

        # List item under current key
        if raw.startswith("  - ") or raw.startswith("- "):
            if current_list is None:
                raise ValueError(f"Line {line_num}: list item without a parent key")
            item = stripped[2:].strip()
            # Strip surrounding quotes
            item = item.strip('"').strip("'")
            current_list.append(item)
            continue

        # Key: value
        if ":" not in raw:
            raise ValueError(f"Line {line_num}: unrecognized line '{raw}'")
        key, _, value = raw.partition(":")
        key = key.strip()
        value = value.strip()

        if value == "":
            # Multi-line list or block follows
            result[key] = []
            current_list = result[key]
            current_key = key
        elif value.startswith("[") and value.endswith("]"):
            # Inline list
            inner = value[1:-1].strip()
            if inner == "":
                result[key] = []
            else:
                items = [s.strip().strip('"').strip("'") for s in inner.split(",")]
                result[key] = items
            current_list = None
            current_key = None
        else:
            # Scalar
            v = value.strip('"').strip("'")
            # Try numeric
            try:
                if "." in v:
                    result[key] = float(v)
                else:
                    result[key] = int(v)
            except ValueError:
                # Try bool
                if v.lower() == "true":
                    result[key] = True
                elif v.lower() == "false":
                    result[key] = False
                else:
                    result[key] = v
            current_list = None
            current_key = None

    return result

# ---------------------------------------------------------------------------
# File classification
# ---------------------------------------------------------------------------

def classify(path, arm_scoped=False):
    """Return one of: 'skill', 'kb', 'template', 'docs', 'ignored'.

    `arm_scoped=True` when the walker was invoked against a single arm's
    directory (SKILL.md present at walk root). In that case, any *.md in
    a subdirectory is KB — the caller's context tells us we're inside
    arm content.

    v1.11.25+ classifier is INVERTED per Headless window escalation. Instead
    of enumerating validated subdirectories (knowledge/, pointers/, ...),
    the default under `skills/{arm}/{subdir}/` is KB — unless it's explicitly
    template or docs. Catches architectures/ (this release), projects/
    (unwritten, coming), and any future contract-mandated arm subdirectory.

    Third time a contract-mandated directory has fallen outside the classifier:
      - v1.11.3: knowledge/ path prefix bug (fixed then)
      - v1.11.18: pointers/ (fixed then)
      - v1.11.25: architectures/ — surfaced by first arm-A KB file. Instead
                  of patching a third dir, invert the default so the pattern
                  stops recurring.

    The failure mode this prevents: architecture files eager-load on an arch
    tag; a load_when typo silently prevents loading; the v1.11.18 WARN check
    exists specifically to catch that class — and it can only fire on a file
    the classifier reaches.
    """
    p = str(path)
    name = path.name

    # SKILL.md (anywhere) — strict schema
    if name == "SKILL.md":
        return "skill"

    # Templates — lightweight schema
    if "/templates/" in p or p.startswith("templates/"):
        return "template"

    # Docs (don't load at runtime, frontmatter optional)
    if p.startswith("docs/") or "/docs/" in p:
        return "docs"

    # v1.11.25+ — README.md at any location is docs-class (human-facing readme,
    # not runtime-loaded content). gates.md is a gate descriptor with its own
    # (unspecified-here) schema — treat as docs for now, dedicated class if it
    # gets one later.
    if name in ("README.md", "gates.md"):
        return "docs"

    # v1.11.25+ — _decisions/proposals/ files carry their own frontmatter
    # schema (proposal_id, status, ratified_by, ...) which isn't the KB
    # schema. They're reference material, not runtime-loaded KB. Classify
    # as docs — frontmatter shape is proposal-specific, not KB-conformant.
    if "/_decisions/proposals/" in p or p.startswith("_decisions/proposals/"):
        return "docs"

    # v1.11.30+ ROOT-INVARIANT CLASSIFICATION.
    #
    # v1.11.25's parts[0]=='skills' check silently misfired when the walker
    # root was `skills/` — the relative path then started with the arm name
    # (`shopify/knowledge/foo.md`), parts[0] was 'shopify' not 'skills', and
    # the file fell through to 'ignored'. `validate-frontmatter.py skills/`
    # (the standard invocation) validated 33 of ~180 files and reported
    # false-green from v1.11.25 through v1.11.29. Shopify window caught it.
    #
    # Fix: locate the 'skills' segment anywhere in the path, not just at
    # position 0. Then `skills/`, `.`, and `skills/{arm}` classify
    # identically. Root-invariant by construction.
    parts = path.parts if hasattr(path, "parts") else tuple(p.split("/"))

    if "skills" in parts:
        skills_idx = parts.index("skills")
        # Structure after skills: [arm, subdir, ..., file]
        # KB requires at least skills / arm / subdir / file → 4 parts from skills onwards
        if len(parts) - skills_idx >= 4:
            return "kb"
        # skills/{arm}/file.md at arm root (not SKILL.md — that was caught above)
        # stays ignored. Root-level skills/README.md etc. also ignored.
        return "ignored"

    # Path doesn't contain a 'skills' segment. Two cases:
    # (a) arm-scoped walker run (root was skills/{arm}); path is relative to
    #     that arm dir, so parts start with the subdir name. The arm_scoped
    #     signal (set by the walker when SKILL.md is at walk root) tells us
    #     this is arm content.
    # (b) some other tree (tools/, docs/, or unknown) — stays ignored.
    if arm_scoped and len(parts) >= 2:
        return "kb"
    return "ignored"

# ---------------------------------------------------------------------------
# Validators
# ---------------------------------------------------------------------------

def validate_skill(path, fm, errors, warnings):
    # Required fields present
    for f in SKILL_REQUIRED_FIELDS:
        if f not in fm:
            errors.append(f"missing required field '{f}'")

    # name matches directory (or ends with -<dirname> for nested project-type skills)
    expected_name = path.parent.name
    if "name" in fm:
        actual = fm["name"]
        if actual != expected_name and not actual.endswith(f"-{expected_name}"):
            errors.append(f"name '{actual}' doesn't match directory '{expected_name}' (allowed: 'X' or 'PREFIX-X')")

    # description not empty
    if "description" in fm:
        d = fm["description"]
        if not d or d == "TBD":
            errors.append("description is empty or TBD (not allowed in SKILL.md)")
        elif len(str(d)) < 20:
            warnings.append("description suspiciously short (< 20 chars)")

    # tier valid
    if "tier" in fm and fm["tier"] not in VALID_TIERS:
        errors.append(f"tier '{fm['tier']}' not in {sorted(VALID_TIERS)}")

    # load_when non-empty array
    if "load_when" in fm:
        if not isinstance(fm["load_when"], list) or len(fm["load_when"]) == 0:
            errors.append("load_when must be non-empty array")

    # tools is array (may be empty)
    if "tools" in fm and not isinstance(fm["tools"], list):
        errors.append("tools must be array (use [] if no tools)")
    elif "tools" in fm:
        for t in fm["tools"]:
            if t not in KNOWN_TOOLS and not t.startswith("mcp__"):
                warnings.append(f"unknown tool '{t}' (typo? new tool? whitelist?)")

    # model
    if "model" in fm and fm["model"] not in VALID_MODELS:
        errors.append(f"model '{fm['model']}' not in {sorted(VALID_MODELS)}")

    # version SemVer
    if "version" in fm and not SEMVER_RE.match(str(fm["version"])):
        warnings.append(f"version '{fm['version']}' is not SemVer (X.Y.Z)")

    # v1.11.14+ — frontmatter version must match footer "Version:" line
    # Class of bug: WP redesign SKILL.md shipped v1.11.10 → v1.11.13 with
    # frontmatter 1.10.0 vs footer 1.10.1 disagreeing. mtime enforcement
    # (scan_arm_version_bump in verify-edition-integrity.sh) can't see inside
    # a single file; this catches the intra-file disagreement.
    if "version" in fm:
        try:
            content = path.read_text(encoding="utf-8", errors="ignore")
            # Look for a "Version: X.Y.Z" line in the last ~15 lines of the file
            # (footer convention). Case-sensitive Version: to avoid matching
            # "api version" prose etc.
            tail_lines = content.splitlines()[-15:]
            footer_version = None
            footer_re = re.compile(r"^\s*Version:\s*([\w\.\-]+)\s*$")
            for line in tail_lines:
                m = footer_re.match(line)
                if m:
                    footer_version = m.group(1)
                    break
            if footer_version is not None:
                fm_version = str(fm["version"])
                if footer_version != fm_version:
                    errors.append(
                        f"version mismatch: frontmatter '{fm_version}' vs footer 'Version: {footer_version}'"
                    )
        except Exception:
            # If we can't read the file for footer check, skip silently — the
            # main frontmatter extraction would have already failed loudly.
            pass

def validate_kb(path, fm, errors, warnings):
    for f in KB_REQUIRED_FIELDS:
        if f not in fm:
            errors.append(f"missing required field '{f}'")

    if "tier" in fm and fm["tier"] not in VALID_TIERS:
        errors.append(f"tier '{fm['tier']}' not in {sorted(VALID_TIERS)}")

    if "load_when" in fm:
        if not isinstance(fm["load_when"], list) or len(fm["load_when"]) == 0:
            errors.append("load_when must be non-empty array")

    if "description" in fm:
        d = str(fm["description"])
        if d == "TBD":
            warnings.append("description: TBD — backfill before v1.12.0")
        elif not d:
            errors.append("description is empty")
        elif len(d) < 20:
            warnings.append("description suspiciously short (< 20 chars)")

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def find_repo_root(start):
    """v1.11.19+ — resolve the repository root by walking up from `start`
    looking for a `skills/` directory. This lets arm-scoped runs (root=
    `skills/headless`) still find the full arm tag registry across the
    whole repo. Previous version globbed relative to `root`, which
    produced 0 arm-registered tags on any arm-scoped run and would
    have false-FAILed once WARN promoted to FAIL.

    Falls back to `start` if no repo root is found (single-arm bundle
    where skills/ IS the root of the tree passed in).
    """
    p = Path(start).resolve()
    for _ in range(10):  # bounded walk
        if (p / "skills").is_dir():
            return p
        if (p.name == "skills") and (p.parent / "skills").is_dir():
            return p.parent
        if p == p.parent:
            break
        p = p.parent
    return Path(start).resolve()


def gather_arm_registered_tags(root):
    """v1.11.18+ — pre-scan every arm's `knowledge/00-overview.md` and
    `SKILL.md` for arm-registered `load_when` tags. Per cascade contract,
    arms register their own tag bundle in `knowledge/00-overview.md`. We
    extract every kebab-case token found inside inline code (backticks) —
    the pattern arms consistently use for registered tag names.

    v1.11.19 fix (Headless window escalation): glob against the repo root
    rather than the passed root, so arm-scoped validator runs
    (root=`skills/headless`) still find the full registry. Previously an
    arm-scoped run resolved `skills/*/knowledge/...` relative to the
    passed root, matching nothing — every correctly-registered tag WARN-ed.

    Returns: set of tag strings recognized as arm-registered.
    """
    registered = set()
    tag_re = re.compile(r"`([a-z][a-z0-9._-]*)`")

    repo_root = find_repo_root(root)
    # Base is the directory containing `skills/`. If we're at repo root,
    # scan under `skills/`. If start was skills/ itself, scan under it.
    if (repo_root / "skills").is_dir():
        scan_base = repo_root / "skills"
    else:
        scan_base = repo_root

    for pattern in ("*/knowledge/00-overview.md", "*/SKILL.md"):
        for path in scan_base.glob(pattern):
            try:
                content = path.read_text(encoding="utf-8", errors="ignore")
            except Exception:
                continue
            for m in tag_re.finditer(content):
                token = m.group(1)
                # Filter: kebab-case tags typically contain a hyphen and no dots
                # (dots are for file extensions and version numbers). Length > 3
                # to avoid single-letter aliases.
                if "-" in token and "." not in token and len(token) > 3:
                    registered.add(token)
    return registered


def check_load_when_tags(fm, warnings, arm_registered_tags):
    """v1.11.18+ WARN check. Any load_when tag that isn't in the universal
    vocabulary (frontmatter-spec.md §6) OR an arm's registered bundle
    silently prevents the file from loading — an unknown tag doesn't error,
    it just never fires. Soft-launch: WARN today, promote to FAIL after all
    arms' bundles are audited.
    """
    if "load_when" not in fm or not isinstance(fm["load_when"], list):
        return
    for tag in fm["load_when"]:
        if not isinstance(tag, str):
            continue
        if tag in UNIVERSAL_LOAD_WHEN_TAGS:
            continue
        if tag in arm_registered_tags:
            continue
        warnings.append(
            f"load_when tag '{tag}' not in universal vocabulary (frontmatter-spec.md §6) "
            f"and not found in any arm's 00-overview.md registered bundle — file may "
            f"silently never load. Register the tag or fix the typo."
        )


def walk_and_validate(root, strict=False):
    results = []  # list of {path, type, errors, warnings}
    arm_registered_tags = gather_arm_registered_tags(root)

    # v1.11.25+ — detect arm-scoped runs so classify() can invert the default
    # for arm subdirectories without over-classifying non-arm trees like tools/.
    root_path = Path(root)
    arm_scoped = (root_path / "SKILL.md").is_file()

    for path in root_path.rglob("*.md"):
        rel = path.relative_to(root_path)
        # v1.11.30 fix: pass the ABSOLUTE path to classify() so its
        # "skills"-segment lookup works regardless of what walker root
        # was passed. Under root=skills/, the relative path doesn't
        # contain "skills" as a segment — the absolute path always does.
        # rel is still used for the results display path.
        kind = classify(path.resolve(), arm_scoped=arm_scoped)
        if kind == "ignored":
            continue
        if kind == "docs":
            continue  # docs frontmatter optional

        yaml_str, body_line = extract_frontmatter(path)
        errors = []
        warnings = []
        # Placeholder — will be filled by classify below if not already

        if yaml_str is None:
            errors.append(f"no frontmatter: {body_line}")
            results.append({"path": str(rel), "type": kind, "errors": errors, "warnings": warnings})
            continue

        try:
            fm = parse_yaml(yaml_str)
        except ValueError as e:
            errors.append(f"YAML parse: {e}")
            results.append({"path": str(rel), "type": kind, "errors": errors, "warnings": warnings})
            continue

        if kind == "skill":
            validate_skill(path, fm, errors, warnings)
        elif kind == "kb":
            validate_kb(path, fm, errors, warnings)
        elif kind == "template":
            # Lightweight check
            if not fm:
                warnings.append("templates should have at minimum template_type + applies_to")

        # v1.11.18+ — load_when tag vocabulary check (WARN). Applies to any
        # kind that carries load_when (skill, kb). Templates are lightweight
        # and don't require it.
        if kind in ("skill", "kb"):
            check_load_when_tags(fm, warnings, arm_registered_tags)

        results.append({"path": str(rel), "type": kind, "errors": errors, "warnings": warnings})

    # v1.11.30+ COVERAGE SELF-GUARD.
    #
    # Regression class: v1.11.25's classify() silently skipped ~80% of files
    # under the standard `validate-frontmatter.py skills/` invocation and
    # reported false-green from v1.11.25 through v1.11.29. Same shape as the
    # v1.11.3 fix — a validator that checks 33 of 180 files must not be able
    # to report success without a signal that classification is dropping content.
    #
    # Rule: if we found N *.md files under skills/ and validated fewer than
    # 30% of them as skill/kb/template, emit a coverage warning. Threshold is
    # deliberately generous — templates/docs are legitimate exclusions, but
    # dropping 70%+ under skills/ is a classifier bug, not a valid outcome.
    #
    # Bootstrap-manifest-warning precedent (v1.11.16): tools that can silently
    # SKIP without signalling coverage are the class we've learned to guard
    # against explicitly.
    root_path = Path(root)
    skills_md_count = 0
    if (root_path / "skills").is_dir():
        skills_md_count = sum(1 for _ in (root_path / "skills").rglob("*.md"))
    elif root_path.name == "skills" or arm_scoped:
        skills_md_count = sum(1 for _ in root_path.rglob("*.md"))
    validated_count = sum(1 for r in results if r["type"] in ("skill", "kb", "template"))
    if skills_md_count >= 20 and validated_count < skills_md_count * 0.3:
        pct = int(validated_count * 100 / skills_md_count) if skills_md_count else 0
        results.append({
            "path": "__coverage_guard__",
            "type": "guard",
            "errors": [],
            "warnings": [
                f"Coverage guard: validated {validated_count} of {skills_md_count} *.md files under skills/ ({pct}%). "
                f"Classification may be silently dropping content — check classify() and the walker root. "
                f"See v1.11.29 Shopify window escalation for the regression class this guard exists to catch."
            ],
        })

    return results

def main():
    ap = argparse.ArgumentParser(description="Validate frontmatter across WebDesk skills tree")
    ap.add_argument("path", nargs="?", default=".", help="Root path (default: current dir)")
    ap.add_argument("--strict", action="store_true", help="Warnings become errors")
    ap.add_argument("--json", action="store_true", help="Emit JSON output")
    args = ap.parse_args()

    root = Path(args.path).resolve()
    if not root.exists():
        print(f"ERROR: path does not exist: {root}", file=sys.stderr)
        sys.exit(2)

    results = walk_and_validate(root, strict=args.strict)

    total = len(results)
    files_with_errors = sum(1 for r in results if r["errors"])
    files_with_warnings = sum(1 for r in results if r["warnings"])
    total_errors = sum(len(r["errors"]) for r in results)
    total_warnings = sum(len(r["warnings"]) for r in results)

    if args.json:
        print(json.dumps({
            "summary": {
                "total_files": total,
                "files_with_errors": files_with_errors,
                "files_with_warnings": files_with_warnings,
                "total_errors": total_errors,
                "total_warnings": total_warnings,
            },
            "results": results,
        }, indent=2))
    else:
        print(f"\nFrontmatter validation — v1.11.11")
        print(f"Root: {root}")
        print(f"Total files checked: {total}")
        print(f"Files with errors:   {files_with_errors}")
        print(f"Files with warnings: {files_with_warnings}")
        print(f"Total errors:        {total_errors}")
        print(f"Total warnings:      {total_warnings}")
        print()

        if files_with_errors > 0:
            print("=== ERRORS ===")
            for r in results:
                if r["errors"]:
                    print(f"  {r['path']} [{r['type']}]")
                    for e in r["errors"]:
                        print(f"    ERROR: {e}")
            print()

        if files_with_warnings > 0 and (args.strict or files_with_errors == 0):
            print("=== WARNINGS ===")
            for r in results:
                if r["warnings"]:
                    print(f"  {r['path']} [{r['type']}]")
                    for w in r["warnings"]:
                        print(f"    WARN: {w}")
            print()

    # Exit code
    exit_code = 0
    if total_errors > 0:
        exit_code = 1
    elif args.strict and total_warnings > 0:
        exit_code = 1
    sys.exit(exit_code)

if __name__ == "__main__":
    main()
