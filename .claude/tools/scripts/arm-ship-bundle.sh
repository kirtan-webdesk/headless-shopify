#!/usr/bin/env bash
# arm-ship-bundle.sh — v1.11.35+
#
# Arm-side release script under D-ARM-AUTONOMY-01.
# Packages an arm's content + a pinned spine snapshot into a distributable
# bundle. Runs the shared integrity gate (verify-edition-integrity.sh) scoped
# to arm content, and emits a manifest recording the arm version, pinned
# spine version, and integrity result.
#
# Autonomous arms as of v1.11.35: shopify, wordpress-woocommerce, headless.
# Gated arms (route through master): bigcommerce (until onboarding complete),
# magento-adobe-commerce (scaffold-only).
#
# Usage:
#   arm-ship-bundle.sh <arm> <working-tree> <dest.zip>
#
# arm:           shopify | wordpress-woocommerce | headless
# working-tree:  path containing skills/{arm}/, skills/_spine/, tools/, etc.
#                (typically your unzipped master bundle + your arm changes)
# dest.zip:      output path, e.g. webdesk-headless-arm-v0.17.0.zip
#
# Exit codes:
#   0 = ship succeeded (integrity passed, bundle written)
#   1 = ship BLOCKED (integrity failed OR arm not autonomous OR reserved-scope
#       modified)
#   2 = usage error

set -euo pipefail

ARM="${1:-}"
WORK="${2:-}"
DEST="${3:-}"

if [[ -z "$ARM" || -z "$WORK" || -z "$DEST" ]]; then
    echo "Usage: $0 <arm> <working-tree> <dest.zip>" >&2
    echo "arm: shopify | wordpress-woocommerce | headless" >&2
    exit 2
fi

# 1. Autonomy check per D-ARM-AUTONOMY-01
case "$ARM" in
    shopify|wordpress-woocommerce|headless) ;;
    bigcommerce)
        echo "BLOCKED: bigcommerce arm is GATED per D-ARM-AUTONOMY-01." >&2
        echo "        Onboarding required. Route this release through master." >&2
        exit 1
        ;;
    magento-adobe-commerce)
        echo "BLOCKED: magento-adobe-commerce arm is GATED (scaffold-only)." >&2
        exit 1
        ;;
    *)
        echo "ERROR: unknown arm '$ARM'" >&2
        exit 2
        ;;
esac

if [[ ! -d "$WORK/skills/$ARM" ]]; then
    echo "ERROR: skills/$ARM/ not found in $WORK" >&2
    exit 2
fi

echo "==================================================="
echo "ARM-SHIP-BUNDLE — v1.11.35 (D-ARM-AUTONOMY-01)"
echo "Arm:      $ARM (AUTONOMOUS)"
echo "Source:   $WORK"
echo "Dest:     $DEST"
echo "==================================================="

# 2. Extract arm version from SKILL.md
ARM_VERSION=$(grep -E "^version:" "$WORK/skills/$ARM/SKILL.md" | head -1 | awk '{print $2}')
if [[ -z "$ARM_VERSION" ]]; then
    echo "ERROR: could not read arm version from $WORK/skills/$ARM/SKILL.md" >&2
    exit 2
fi
echo "Arm version: $ARM_VERSION"

# 3. Determine pinned spine version from the working tree's README
SPINE_VERSION=$(grep -oE "v1\.[0-9]+\.[0-9]+" "$WORK/README.md" | head -1)
if [[ -z "$SPINE_VERSION" ]]; then
    SPINE_VERSION="unknown"
fi
echo "Spine pinned: $SPINE_VERSION"

# 4. Advisory reserved-scope check (guardrail deferred one cycle)
echo ""
echo "-- Reserved-scope advisory (D-ARM-AUTONOMY-01 honor-system, v1.11.35 MVP)"
echo "   The arm attests it has NOT modified files under:"
echo "     skills/_spine/, skills/_contracts/, skills/_decisions/,"
echo "     tools/, forbidden-global.md, README.md"
echo "   If any of those changed, STOP and file a HANDOFF to master instead."
echo ""

# 5. Build a temporary staging tree: arm + pinned spine snapshot
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
BUNDLE_NAME=$(basename "$DEST" .zip)
STAGE="$TMP/$BUNDLE_NAME"
mkdir -p "$STAGE/skills"

# Copy arm content
cp -R "$WORK/skills/$ARM" "$STAGE/skills/$ARM"

# Pin spine snapshot
cp -R "$WORK/skills/_spine" "$STAGE/skills/_spine"
cp -R "$WORK/skills/_contracts" "$STAGE/skills/_contracts"
cp -R "$WORK/skills/_decisions" "$STAGE/skills/_decisions"
cp -R "$WORK/tools" "$STAGE/tools"
cp "$WORK/README.md" "$STAGE/README.md"
[[ -f "$WORK/forbidden-global.md" ]] && cp "$WORK/forbidden-global.md" "$STAGE/forbidden-global.md"
[[ -d "$WORK/docs" ]] && cp -R "$WORK/docs" "$STAGE/docs"

# 6. Strip WP-only script from non-WP bundles (packaging fix from v1.11.32 gate catch)
if [[ "$ARM" != "wordpress-woocommerce" ]]; then
    rm -f "$STAGE/tools/scripts/wp-safe-deploy.sh"
fi

# 7. Run integrity gate scoped to arm content
INTEGRITY="$STAGE/tools/scripts/verify-edition-integrity.sh"
if [[ ! -x "$INTEGRITY" ]]; then
    echo "ERROR: verify-edition-integrity.sh not executable in staging tree" >&2
    exit 1
fi

# Map arm name to edition token expected by verify-edition-integrity.sh
case "$ARM" in
    shopify)               EDITION_TOKEN="shopify" ;;
    wordpress-woocommerce) EDITION_TOKEN="wordpress" ;;
    headless)              EDITION_TOKEN="headless" ;;
esac

echo "-- Running integrity gate (arm scope)"
if ! (cd "$TMP" && bash "$INTEGRITY" "$EDITION_TOKEN" "$STAGE") 2>&1 | tee "$TMP/integrity.log" | tail -5; then
    echo "" >&2
    echo "===================================================" >&2
    echo "SHIP BLOCKED — integrity gate failed" >&2
    echo "Bundle NOT written." >&2
    echo "See $TMP/integrity.log for detail (temp dir preserved on failure)." >&2
    trap - EXIT
    exit 1
fi

# 8. Write manifest
BUILD_TS=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
cat > "$STAGE/.arm-bundle-manifest.json" <<EOF
{
  "arm": "$ARM",
  "arm_version": "$ARM_VERSION",
  "spine_pinned": "$SPINE_VERSION",
  "built_at": "$BUILD_TS",
  "governance": "D-ARM-AUTONOMY-01",
  "integrity_gate": "PASS",
  "reserved_scope_check": "honor-system (v1.11.35 MVP)"
}
EOF

# 9. Zip
(cd "$TMP" && zip -q -r "$DEST" "$BUNDLE_NAME" -x "*/__pycache__/*" "*.pyc")

echo ""
echo "==================================================="
echo "SHIP SUCCEEDED — $DEST"
echo "  arm: $ARM at $ARM_VERSION"
echo "  spine pinned: $SPINE_VERSION"
echo "==================================================="

exit 0
