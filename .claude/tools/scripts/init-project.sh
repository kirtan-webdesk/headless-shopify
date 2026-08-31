#!/usr/bin/env bash
# init-project.sh — v1.11.2
#
# Initialize a new WebDesk project: copy CLAUDE.md + HANDOFF.md templates to
# project root, fill in basic placeholders, set up minimal per-project skill
# scope to avoid Claude Code's 200K context error.
#
# Usage:
#   tools/scripts/init-project.sh /path/to/new/project
#   tools/scripts/init-project.sh /path/to/new/project --platform wordpress --type new-build
#
# Or interactively:
#   tools/scripts/init-project.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
TEMPLATES_DIR="$REPO_ROOT/skills/_spine/shared-knowledge"

CLAUDE_TEMPLATE="$TEMPLATES_DIR/claude-md-template.md"
HANDOFF_TEMPLATE="$TEMPLATES_DIR/handoff-template.md"

# ---------------------------------------------------------------------------
# Args
# ---------------------------------------------------------------------------

PROJECT_ROOT=""
PLATFORM=""
PROJECT_TYPE=""

while [[ $# -gt 0 ]]; do
    case "$1" in
        --platform)
            PLATFORM="$2"
            shift 2
            ;;
        --type)
            PROJECT_TYPE="$2"
            shift 2
            ;;
        --help|-h)
            sed -n '1,/^set -euo pipefail/p' "$0" | tail -n +2 | grep '^#'
            exit 0
            ;;
        *)
            if [[ -z "$PROJECT_ROOT" ]]; then
                PROJECT_ROOT="$1"
            else
                echo "ERROR: unknown arg: $1" >&2
                exit 1
            fi
            shift
            ;;
    esac
done

# ---------------------------------------------------------------------------
# Interactive prompts for missing values
# ---------------------------------------------------------------------------

if [[ -z "$PROJECT_ROOT" ]]; then
    read -p "Project root path: " PROJECT_ROOT
fi

if [[ -z "$PROJECT_ROOT" ]]; then
    echo "ERROR: project root required" >&2
    exit 1
fi

if [[ ! -d "$PROJECT_ROOT" ]]; then
    mkdir -p "$PROJECT_ROOT"
    echo "Created project root: $PROJECT_ROOT"
fi

if [[ -z "$PLATFORM" ]]; then
    printf "\n"
    printf "Platform (pick ONE):\n"
    printf "  1) shopify\n"
    printf "  2) shopify-plus\n"
    printf "  3) bigcommerce\n"
    printf "  4) magento-adobe-commerce\n"
    printf "  5) wordpress-woocommerce\n"
    read -p "Choice [1-5]: " choice
    case "$choice" in
        1) PLATFORM="shopify" ;;
        2) PLATFORM="shopify-plus" ;;
        3) PLATFORM="bigcommerce" ;;
        4) PLATFORM="magento-adobe-commerce" ;;
        5) PLATFORM="wordpress-woocommerce" ;;
        *) echo "ERROR: invalid choice" >&2; exit 1 ;;
    esac
fi

if [[ -z "$PROJECT_TYPE" ]]; then
    printf "\n"
    printf "Project type:\n"
    printf "  1) redesign\n"
    printf "  2) new-build\n"
    printf "  3) version-upgrade\n"
    printf "  4) migration\n"
    printf "  5) b2b-wholesale-setup\n"
    printf "  6) multi-region-multi-store-setup\n"
    read -p "Choice [1-6]: " choice
    case "$choice" in
        1) PROJECT_TYPE="redesign" ;;
        2) PROJECT_TYPE="new-build" ;;
        3) PROJECT_TYPE="version-upgrade" ;;
        4) PROJECT_TYPE="migration" ;;
        5) PROJECT_TYPE="b2b-wholesale-setup" ;;
        6) PROJECT_TYPE="multi-region-multi-store-setup" ;;
        *) echo "ERROR: invalid choice" >&2; exit 1 ;;
    esac
fi

read -p "Client slug (lowercase, kebab-case, e.g., 'epoxy-depot'): " CLIENT_SLUG
read -p "Client legal name (e.g., 'Epoxy Depot LLC'): " CLIENT_LEGAL_NAME
read -p "Client DBA (e.g., 'Epoxy Depot'): " CLIENT_DBA
read -p "Current website URL (or 'none — new build'): " CURRENT_WEBSITE
read -p "Plan tier (basic / standard / advanced / plus / enterprise): " PLAN_TIER
read -p "Target launch date (YYYY-MM-DD or TBD): " TARGET_LAUNCH
read -p "Internal PM name: " INTERNAL_PM_NAME
read -p "Internal PM email (must be @webdesksolution.ca): " INTERNAL_PM_EMAIL

# Sanity checks
if [[ ! "$INTERNAL_PM_EMAIL" =~ @webdesksolution\.ca$ ]]; then
    echo "ERROR: Internal PM email must end with @webdesksolution.ca (FLAG-004 rule)" >&2
    exit 1
fi

# ---------------------------------------------------------------------------
# Verify templates exist
# ---------------------------------------------------------------------------

if [[ ! -f "$CLAUDE_TEMPLATE" ]]; then
    echo "ERROR: CLAUDE.md template not found at $CLAUDE_TEMPLATE" >&2
    exit 1
fi

if [[ ! -f "$HANDOFF_TEMPLATE" ]]; then
    echo "ERROR: HANDOFF.md template not found at $HANDOFF_TEMPLATE" >&2
    exit 1
fi

# ---------------------------------------------------------------------------
# Copy + fill templates
# ---------------------------------------------------------------------------

CLAUDE_DEST="$PROJECT_ROOT/CLAUDE.md"
HANDOFF_DEST="$PROJECT_ROOT/HANDOFF.md"

if [[ -f "$CLAUDE_DEST" ]]; then
    read -p "WARNING: $CLAUDE_DEST already exists. Overwrite? [y/N] " confirm
    [[ "$confirm" != "y" && "$confirm" != "Y" ]] && exit 0
fi

# Copy templates
cp "$CLAUDE_TEMPLATE" "$CLAUDE_DEST"
cp "$HANDOFF_TEMPLATE" "$HANDOFF_DEST"

# Fill placeholders in CLAUDE.md
TODAY=$(date -u +%Y-%m-%d)
NOW_ISO=$(date -u +%Y-%m-%dT%H:%M:%SZ)

# OS-agnostic sed in-place
SED_INPLACE=("sed" "-i")
if [[ "$(uname)" == "Darwin" ]]; then
    SED_INPLACE=("sed" "-i" "")
fi

"${SED_INPLACE[@]}" "s|{{client_legal_name}}|$CLIENT_LEGAL_NAME|g" "$CLAUDE_DEST"
"${SED_INPLACE[@]}" "s|{{client_dba}}|$CLIENT_DBA|g" "$CLAUDE_DEST"
"${SED_INPLACE[@]}" "s|{{client_slug}}|$CLIENT_SLUG|g" "$CLAUDE_DEST"
"${SED_INPLACE[@]}" "s|{{current_website}}|$CURRENT_WEBSITE|g" "$CLAUDE_DEST"
"${SED_INPLACE[@]}" "s|{{project_type}}|$PROJECT_TYPE|g" "$CLAUDE_DEST"
"${SED_INPLACE[@]}" "s|{{platform}}|$PLATFORM|g" "$CLAUDE_DEST"
"${SED_INPLACE[@]}" "s|{{plan_tier}}|$PLAN_TIER|g" "$CLAUDE_DEST"
"${SED_INPLACE[@]}" "s|{{target_launch_date}}|$TARGET_LAUNCH|g" "$CLAUDE_DEST"
"${SED_INPLACE[@]}" "s|{{internal_pm_name}}|$INTERNAL_PM_NAME|g" "$CLAUDE_DEST"
"${SED_INPLACE[@]}" "s|{{internal_pm_email}}|$INTERNAL_PM_EMAIL|g" "$CLAUDE_DEST"
"${SED_INPLACE[@]}" "s|{{last_touched_timestamp}}|$NOW_ISO|g" "$CLAUDE_DEST"
"${SED_INPLACE[@]}" "s|{{last_touched_by}}|init-project.sh|g" "$CLAUDE_DEST"

# ---------------------------------------------------------------------------
# Append the "Required skill files for this project" section
# ---------------------------------------------------------------------------

cat >> "$CLAUDE_DEST" <<EOF


---

## Required skill files for this project (v1.11.2+)

> CRITICAL — this section tells Claude what to load. Without it, Claude may auto-load everything (200K context error).

When this project's session starts, load ONLY these files:

### Always load
- \`skills/_spine/persona.md\`
- \`skills/_spine/shared-knowledge/forbidden-global.md\`
- \`skills/_spine/shared-knowledge/ai-tool-rules.md\`

### Active agents (load when needed)
- \`skills/_spine/pm-agent/SKILL.md\`
- \`skills/_spine/designer-agent/SKILL.md\`
- \`skills/_spine/qa-agent/SKILL.md\`
- \`skills/_spine/code-review-agent/SKILL.md\`

### Platform skill
- \`skills/$PLATFORM/SKILL.md\`

EOF

# Add project-type skill if it exists
if [[ -d "$REPO_ROOT/skills/$PLATFORM/projects/$PROJECT_TYPE" ]]; then
    echo "### Project-type skill" >> "$CLAUDE_DEST"
    echo "- \`skills/$PLATFORM/projects/$PROJECT_TYPE/SKILL.md\`" >> "$CLAUDE_DEST"
    echo "" >> "$CLAUDE_DEST"
fi

# Platform-specific KB hints
cat >> "$CLAUDE_DEST" <<EOF
### Platform knowledge files (load on demand based on task)
EOF

if [[ "$PLATFORM" == "wordpress-woocommerce" ]]; then
    cat >> "$CLAUDE_DEST" <<EOF
- For Elementor builds: load \`08-page-builders.md\` + \`20-elementor-architecture.md\` + \`21-elementor-performance.md\` + \`22-elementor-qa-checklist.md\` + \`23-scss-architecture-wp.md\`
- For ACF builds: load \`07-classic-editor-and-acf.md\` + \`06-theme-structure-patterns.md\`
- For both: \`05-security-baseline.md\` + \`14-app-plugin-ecosystem.md\` (always when writing code)
EOF
elif [[ "$PLATFORM" == "shopify" || "$PLATFORM" == "shopify-plus" ]]; then
    cat >> "$CLAUDE_DEST" <<EOF
- For code production: \`01-coding-standards.md\` + \`05-security-baseline.md\` + \`09-forbidden.md\`
- For design phase: \`03-accessibility.md\` + \`04-performance-budget.md\`
EOF
fi

cat >> "$CLAUDE_DEST" <<EOF

### Do NOT load
- Other platform folders (shopify/, bigcommerce/, magento-adobe-commerce/ etc. — unless that's THIS project's platform)
- \`docs/\` (human reference only — read directly, don't auto-load)
- KB files outside the lists above unless explicitly requested

### Required project files
- \`CLAUDE.md\` (this file, project root, auto-loaded)
- \`HANDOFF.md\` (project root, auto-loaded if present)
- \`outputs/$CLIENT_SLUG/sow-spec.md\` (if SOW Builder produced it)
EOF

# ---------------------------------------------------------------------------
# Final
# ---------------------------------------------------------------------------

# Update HANDOFF.md with first-session timestamp
"${SED_INPLACE[@]}" "s|{{timestamp}}|$NOW_ISO|g" "$HANDOFF_DEST"
"${SED_INPLACE[@]}" "s|{{name-or-agent}}|init-project.sh|g" "$HANDOFF_DEST"

echo ""
echo "=================================="
echo "Project initialized."
echo "=================================="
echo ""
echo "Created:"
echo "  $CLAUDE_DEST"
echo "  $HANDOFF_DEST"
echo ""
echo "Platform:     $PLATFORM"
echo "Project type: $PROJECT_TYPE"
echo "Client slug:  $CLIENT_SLUG"
echo ""
echo "Next steps:"
echo "  1. Review $CLAUDE_DEST — fill remaining {{placeholders}}"
echo "  2. If you have a SOW spec, copy to outputs/$CLIENT_SLUG/sow-spec.md"
echo "  3. Open the project in Claude Code"
echo "  4. Claude reads CLAUDE.md automatically; only listed skill files load"
echo ""
echo "If you hit 200K context error: review CLAUDE.md 'Required skill files'"
echo "section — should be 10-15 files max."
echo ""
