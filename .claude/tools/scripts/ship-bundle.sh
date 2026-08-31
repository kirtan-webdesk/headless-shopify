#!/usr/bin/env bash
# ship-bundle.sh — v1.11.6+
#
# Release gate. Extracts the built zip, runs verify-edition-integrity.sh
# against its contents, and only copies to the ship destination if the check
# passes. Prevents stub-README regressions and cross-platform spine
# contamination from shipping to users.
#
# Usage:
#   ship-bundle.sh <edition> <source-zip> <dest-path>
#
# Editions: shopify | wordpress | full | bigcommerce | magento | spine-only
#
# Exit codes:
#   0 = ship succeeded (integrity passed, zip copied)
#   1 = ship BLOCKED (integrity failed)
#   2 = usage error

set -euo pipefail

EDITION="${1:-}"
SRC_ZIP="${2:-}"
DEST="${3:-}"

if [[ -z "$EDITION" || -z "$SRC_ZIP" || -z "$DEST" ]]; then
    echo "Usage: $0 <edition> <source-zip> <dest-path>" >&2
    exit 2
fi

if [[ ! -f "$SRC_ZIP" ]]; then
    echo "ERROR: source zip not found: $SRC_ZIP" >&2
    exit 2
fi

echo "==================================================="
echo "SHIP-BUNDLE GATE — v1.11.6+"
echo "Edition:  $EDITION"
echo "Source:   $SRC_ZIP"
echo "Dest:     $DEST"
echo "==================================================="

# Extract to isolated temp
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

cd "$TMP"
unzip -q "$SRC_ZIP"
BUNDLE_DIR=$(ls | head -1)

if [[ -z "$BUNDLE_DIR" ]]; then
    echo "ERROR: extracted zip has no top-level directory" >&2
    exit 1
fi

# Find the integrity checker (it's in the extracted bundle's tools/)
INTEGRITY="$TMP/$BUNDLE_DIR/tools/scripts/verify-edition-integrity.sh"

# If the extracted bundle doesn't have the checker (spine-only might not),
# fall back to the caller-supplied one
if [[ ! -x "$INTEGRITY" ]]; then
    INTEGRITY="$(dirname "$0")/verify-edition-integrity.sh"
fi

if [[ ! -x "$INTEGRITY" ]]; then
    echo "ERROR: verify-edition-integrity.sh not found or not executable" >&2
    exit 1
fi

# Map spine-only edition to a check we don't have — treat as "common checks only"
CHECK_EDITION="$EDITION"
case "$EDITION" in
    spine-only) CHECK_EDITION="spine-only" ;;
esac

# v1.11.15+ — locate previous release manifest for arm-version-bump content-hash
# comparison.
#
# v1.11.16 fix (Shopify window flag): previous approach relied on
# DEST_DIR/.release-manifest-{edition}.json persisting between releases,
# which silently SKIPs on a clean output directory (false green) and never
# helps standalone runs by any window. Now:
#   Priority 1: env var PREV_MANIFEST — explicit override
#   Priority 2: extract the previous release's zip from DEST_DIR — the
#              manifest lives INSIDE the bundle at .release-manifest.json
#              from v1.11.16 onward
#   Priority 3: legacy DEST_DIR/.release-manifest-{edition}.json — backward
#              compat with v1.11.15 shipping ritual
#   Fallback:  bootstrap SKIP with a prominent warning
DEST_DIR="$(dirname "$DEST")"

if [[ -n "${PREV_MANIFEST:-}" ]]; then
    echo "-- Previous manifest: $PREV_MANIFEST (from env) --"
else
    # Try to find the previous release's zip in DEST_DIR — most recent
    # version by lexical sort matching this edition's slug pattern.
    # Edition → bundle-slug mapping:
    case "$EDITION" in
        shopify)      SLUG_PATTERN="webdesk-shopify-v*.zip" ;;
        wordpress)    SLUG_PATTERN="webdesk-wp-elementor-v*.zip" ;;
        bigcommerce)  SLUG_PATTERN="webdesk-bigcommerce-v*.zip" ;;
        headless)     SLUG_PATTERN="webdesk-headless-v*.zip" ;;
        spine-only)   SLUG_PATTERN="webdesk-spine-only-v*.zip" ;;
        full)         SLUG_PATTERN="webdesk-ai-delivery-system-v*.zip" ;;
        *)            SLUG_PATTERN="" ;;
    esac

    PREV_BUNDLE=""
    if [[ -n "$SLUG_PATTERN" ]]; then
        # Exclude the destination file (avoid comparing self-to-self on retry).
        # v1.11.18 fix: under `set -euo pipefail`, `ls` failing on empty glob
        # kills the whole pipeline (and script). Chain `|| true` on the pipe
        # so the missing-previous-bundle case degrades gracefully to SKIP.
        PREV_BUNDLE=$( { ls -1 $DEST_DIR/$SLUG_PATTERN 2>/dev/null || true; } | grep -v "^$DEST\$" | sort -V | tail -1 || true)
    fi

    if [[ -n "$PREV_BUNDLE" && -f "$PREV_BUNDLE" ]]; then
        # Extract manifest from the previous bundle.
        PREV_TMP=$(mktemp -d)
        (cd "$PREV_TMP" && unzip -q "$PREV_BUNDLE")
        PREV_BUNDLE_DIR=$(ls "$PREV_TMP" | head -1)
        EMBEDDED_MANIFEST="$PREV_TMP/$PREV_BUNDLE_DIR/.release-manifest.json"
        if [[ -f "$EMBEDDED_MANIFEST" ]]; then
            export PREV_MANIFEST="$EMBEDDED_MANIFEST"
            # Register cleanup of the extracted previous bundle
            trap 'rm -rf "$TMP" "$PREV_TMP"' EXIT
            echo "-- Previous manifest: extracted from $(basename "$PREV_BUNDLE") --"
        else
            rm -rf "$PREV_TMP"
            # Fall through to legacy path
            PREV_MANIFEST_FILE="$DEST_DIR/.release-manifest-${EDITION}.json"
            if [[ -f "$PREV_MANIFEST_FILE" ]]; then
                export PREV_MANIFEST="$PREV_MANIFEST_FILE"
                echo "-- Previous manifest: $PREV_MANIFEST_FILE (legacy external, v1.11.15 shipping ritual) --"
            else
                echo ""
                echo "==================================================="
                echo "WARNING — no previous release manifest available"
                echo "  Neither embedded in the previous bundle nor external at $PREV_MANIFEST_FILE."
                echo "  Version-bump enforcement will SKIP this release (bootstrap)."
                echo "  A NEW manifest will be embedded in this bundle for v1.11.17+."
                echo "==================================================="
            fi
        fi
    else
        # No previous bundle found — try legacy external file
        PREV_MANIFEST_FILE="$DEST_DIR/.release-manifest-${EDITION}.json"
        if [[ -f "$PREV_MANIFEST_FILE" ]]; then
            export PREV_MANIFEST="$PREV_MANIFEST_FILE"
            echo "-- Previous manifest: $PREV_MANIFEST_FILE (legacy external, v1.11.15 shipping ritual) --"
        else
            echo ""
            echo "==================================================="
            echo "WARNING — no previous release manifest available"
            echo "  No previous $SLUG_PATTERN in $DEST_DIR."
            echo "  Version-bump enforcement will SKIP this release (bootstrap)."
            echo "  A NEW manifest will be embedded in this bundle for v1.11.17+."
            echo "==================================================="
        fi
    fi
fi

# Run integrity check
echo ""
echo "-- Integrity check --"
if ! "$INTEGRITY" "$TMP/$BUNDLE_DIR" "$CHECK_EDITION"; then
    echo ""
    echo "==================================================="
    echo "SHIP BLOCKED — integrity check failed"
    echo "Bundle NOT copied to $DEST"
    echo "==================================================="
    exit 1
fi

# v1.11.15+ — write NEW release manifest for the arms present in this bundle,
# so the NEXT release has a baseline for the content-hash comparison.
#
# v1.11.16 fix (Shopify window flag): the manifest is embedded INSIDE the
# bundle at .release-manifest.json (not just external at DEST_DIR). That
# means:
#   - The bundle carries its own baseline for future releases (no reliance
#     on DEST_DIR persisting across clean builds).
#   - Any window can extract a shipped bundle, get its manifest, and
#     validate their next build against it standalone.
# We still ALSO write the external DEST_DIR file for backward compat with
# the v1.11.15 shipping ritual, but the embedded copy is the source of truth.
EMBEDDED_MANIFEST="$TMP/$BUNDLE_DIR/.release-manifest.json"
EXTERNAL_MANIFEST="$DEST_DIR/.release-manifest-${EDITION}.json"
python3 - "$TMP/$BUNDLE_DIR" "$EMBEDDED_MANIFEST" "$EXTERNAL_MANIFEST" <<'PYEOF'
import hashlib, json, os, sys
bundle_dir, embedded_path, external_path = sys.argv[1], sys.argv[2], sys.argv[3]
skills_dir = os.path.join(bundle_dir, "skills")
arms = ["shopify", "wordpress-woocommerce", "bigcommerce", "magento-adobe-commerce", "headless"]
manifest = {}
for arm in arms:
    arm_dir = os.path.join(skills_dir, arm)
    skill_md = os.path.join(arm_dir, "SKILL.md")
    if not os.path.isdir(arm_dir) or not os.path.isfile(skill_md):
        continue
    # Read SKILL.md frontmatter version
    version = ""
    try:
        with open(skill_md, encoding="utf-8", errors="ignore") as f:
            for line in f:
                if line.startswith("version:"):
                    version = line.split(":", 1)[1].strip()
                    break
    except Exception:
        version = ""
    # Compute content hash of arm content (excluding SKILL.md)
    # Python's list.sort() is codepoint order — matches the checker's
    # LC_ALL=C-pinned shell sort in verify-edition-integrity.sh.
    h = hashlib.sha256()
    md_files = []
    for root, _, files in os.walk(arm_dir):
        for f in files:
            if f.endswith(".md") and f != "SKILL.md":
                md_files.append(os.path.join(root, f))
    md_files.sort()
    for p in md_files:
        try:
            with open(p, "rb") as fh:
                h.update(fh.read())
        except Exception:
            pass
    manifest[arm] = {"skill_version": version, "content_hash": h.hexdigest()}

# Embed inside the bundle (source of truth)
with open(embedded_path, "w") as f:
    json.dump(manifest, f, indent=2, sort_keys=True)
# Also write external (backward compat)
with open(external_path, "w") as f:
    json.dump(manifest, f, indent=2, sort_keys=True)
print(f"-- Manifest embedded: {embedded_path}")
print(f"-- Manifest external: {external_path}")
PYEOF

# v1.11.16 — rezip the bundle to include the embedded manifest, then copy.
# The original SRC_ZIP passed to ship-bundle.sh doesn't contain the manifest
# yet; we rebuild the zip from the extracted+augmented tree.
REZIPPED="$TMP/${BUNDLE_DIR}.zip"
(cd "$TMP" && zip -qr "$REZIPPED" "$BUNDLE_DIR")
cp "$REZIPPED" "$DEST"

echo ""
echo "==================================================="
echo "SHIP SUCCEEDED — bundle copied to $DEST"
echo "==================================================="
