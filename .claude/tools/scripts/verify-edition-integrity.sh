#!/usr/bin/env bash
# verify-edition-integrity.sh — v1.11.12
#
# Verifies an edition bundle has no cross-platform contamination.
#
# Usage:
#   verify-edition-integrity.sh /path/to/extracted/edition/  shopify
#   verify-edition-integrity.sh /path/to/extracted/edition/  wordpress
#   verify-edition-integrity.sh /path/to/extracted/edition/  full
#
# Exit codes:
#   0 = clean
#   1 = contamination detected
#   2 = usage error

set -euo pipefail

EDITION_DIR="${1:-}"
EDITION="${2:-}"

if [[ -z "$EDITION_DIR" || -z "$EDITION" ]]; then
    echo "Usage: $0 EDITION_DIR EDITION (shopify|wordpress|bigcommerce|magento|full)" >&2
    exit 2
fi

if [[ ! -d "$EDITION_DIR" ]]; then
    echo "ERROR: $EDITION_DIR is not a directory" >&2
    exit 2
fi

ERRORS=0

# ---------------------------------------------------------------------------
# Rule matrix — what SHOULD NOT be in each edition
# ---------------------------------------------------------------------------

check_shopify() {
    echo "== Edition: Shopify =="

    # No wp-safe-deploy.sh
    if [[ -f "$EDITION_DIR/tools/scripts/wp-safe-deploy.sh" ]]; then
        echo "  FAIL: wp-safe-deploy.sh present (WordPress-only script)"
        ERRORS=$((ERRORS + 1))
    else
        echo "  PASS: no wp-safe-deploy.sh"
    fi

    # No wordpress-woocommerce/ skill arm
    if [[ -d "$EDITION_DIR/skills/wordpress-woocommerce" ]]; then
        echo "  FAIL: wordpress-woocommerce/ skill arm present"
        ERRORS=$((ERRORS + 1))
    else
        echo "  PASS: no wordpress-woocommerce/ skill arm"
    fi

    # No bigcommerce/ skill arm
    if [[ -d "$EDITION_DIR/skills/bigcommerce" ]]; then
        echo "  FAIL: bigcommerce/ skill arm present"
        ERRORS=$((ERRORS + 1))
    else
        echo "  PASS: no bigcommerce/ skill arm"
    fi

    # No magento-adobe-commerce/ skill arm
    if [[ -d "$EDITION_DIR/skills/magento-adobe-commerce" ]]; then
        echo "  FAIL: magento-adobe-commerce/ skill arm present"
        ERRORS=$((ERRORS + 1))
    else
        echo "  PASS: no magento-adobe-commerce/ skill arm"
    fi

    # Decision inventory should NOT contain WP D-codes
    local wp_count
    wp_count=$(grep -c "D-WP-\|D-WP-RD-" "$EDITION_DIR/skills/_decisions/decision-inventory.md" 2>/dev/null || true)
    if [[ "$wp_count" -gt 0 ]]; then
        echo "  FAIL: decision-inventory.md contains $wp_count D-WP-* references (WordPress)"
        ERRORS=$((ERRORS + 1))
    else
        echo "  PASS: no D-WP-* references in inventory"
    fi

    # Decision inventory MUST contain Shopify D-codes
    local shopify_count
    shopify_count=$(grep -c "D-NB-\|D-VU-\|D-B2B-\|D-MR-" "$EDITION_DIR/skills/_decisions/decision-inventory.md" 2>/dev/null || true)
    if [[ "$shopify_count" -lt 4 ]]; then
        echo "  FAIL: decision-inventory.md missing Shopify D-codes (found $shopify_count, need >= 4)"
        ERRORS=$((ERRORS + 1))
    else
        echo "  PASS: $shopify_count Shopify D-codes present in inventory"
    fi

    # Shopify skill arm must exist
    if [[ ! -d "$EDITION_DIR/skills/shopify" ]]; then
        echo "  FAIL: skills/shopify/ missing (edition should have it!)"
        ERRORS=$((ERRORS + 1))
    else
        echo "  PASS: skills/shopify/ present"
    fi

    # All 5 Shopify project types must be present
    for project in redesign new-build version-upgrade b2b-wholesale-setup multi-region-multi-store-setup; do
        if [[ ! -d "$EDITION_DIR/skills/shopify/projects/$project" ]]; then
            echo "  FAIL: skills/shopify/projects/$project/ missing"
            ERRORS=$((ERRORS + 1))
        else
            echo "  PASS: skills/shopify/projects/$project/ present"
        fi
    done
}

check_wordpress() {
    echo "== Edition: WordPress =="

    # No shopify/ skill arm
    if [[ -d "$EDITION_DIR/skills/shopify" ]]; then
        echo "  FAIL: shopify/ skill arm present"
        ERRORS=$((ERRORS + 1))
    else
        echo "  PASS: no shopify/ skill arm"
    fi

    # No bigcommerce/ or magento arms
    for arm in bigcommerce magento-adobe-commerce; do
        if [[ -d "$EDITION_DIR/skills/$arm" ]]; then
            echo "  FAIL: skills/$arm/ present"
            ERRORS=$((ERRORS + 1))
        else
            echo "  PASS: no skills/$arm/"
        fi
    done

    # Decision inventory should NOT contain Shopify project D-codes
    local shopify_count
    shopify_count=$(grep -c "D-NB-\|D-VU-\|D-B2B-\|D-MR-" "$EDITION_DIR/skills/_decisions/decision-inventory.md" 2>/dev/null || true)
    if [[ "$shopify_count" -gt 0 ]]; then
        echo "  FAIL: decision-inventory.md contains $shopify_count Shopify project D-codes"
        ERRORS=$((ERRORS + 1))
    else
        echo "  PASS: no Shopify project D-codes in inventory"
    fi

    # Decision inventory MUST contain WP D-codes
    local wp_count
    wp_count=$(grep -c "D-WP-\|D-WP-RD-" "$EDITION_DIR/skills/_decisions/decision-inventory.md" 2>/dev/null || true)
    if [[ "$wp_count" -lt 4 ]]; then
        echo "  FAIL: decision-inventory.md missing WP D-codes (found $wp_count, need >= 4)"
        ERRORS=$((ERRORS + 1))
    else
        echo "  PASS: $wp_count WP D-codes present in inventory"
    fi

    # WP skill arm must exist
    if [[ ! -d "$EDITION_DIR/skills/wordpress-woocommerce" ]]; then
        echo "  FAIL: skills/wordpress-woocommerce/ missing"
        ERRORS=$((ERRORS + 1))
    else
        echo "  PASS: skills/wordpress-woocommerce/ present"
    fi
}

check_spine_only() {
    echo "== Edition: Spine + Contracts Only =="
    echo "  INFO: Master's canonical spine bundle — no platform arms expected"

    # Universal spine must exist
    for req in "skills/_spine/persona.md" "skills/_spine/shared-knowledge/forbidden-global.md" "skills/_contracts" "skills/_decisions/decision-inventory.md" "tools/scripts/verify-edition-integrity.sh" "tools/scripts/ship-bundle.sh"; do
        if [[ ! -e "$EDITION_DIR/$req" ]]; then
            echo "  FAIL: required spine file missing: $req"
            ERRORS=$((ERRORS + 1))
        else
            echo "  PASS: $req present"
        fi
    done

    # Platform arms explicitly must NOT be present
    for arm in shopify wordpress-woocommerce bigcommerce magento-adobe-commerce; do
        if [[ -d "$EDITION_DIR/skills/$arm" ]]; then
            echo "  FAIL: platform arm '$arm' present in spine-only bundle (should not be)"
            ERRORS=$((ERRORS + 1))
        else
            echo "  PASS: no skills/$arm/ (correct for spine-only)"
        fi
    done

    # Inventory must be canonical (has both Shopify + WP D-codes)
    local shopify_count wp_count
    shopify_count=$(grep -c "D-NB-\|D-VU-\|D-B2B-\|D-MR-" "$EDITION_DIR/skills/_decisions/decision-inventory.md" 2>/dev/null || true)
    wp_count=$(grep -c "D-WP-\|D-WP-RD-" "$EDITION_DIR/skills/_decisions/decision-inventory.md" 2>/dev/null || true)

    if [[ "$shopify_count" -lt 4 || "$wp_count" -lt 4 ]]; then
        echo "  FAIL: spine-only inventory missing codes (Shopify $shopify_count, WP $wp_count)"
        ERRORS=$((ERRORS + 1))
    else
        echo "  PASS: canonical inventory has both Shopify ($shopify_count) and WP ($wp_count) D-codes"
    fi
}

check_bigcommerce() {
    echo "== Edition: BigCommerce =="
    echo "  INFO: BC arm is scaffold-only until Headless window builds it out"

    # BC arm must exist (even as scaffold)
    if [[ ! -d "$EDITION_DIR/skills/bigcommerce" ]]; then
        echo "  FAIL: skills/bigcommerce/ missing"
        ERRORS=$((ERRORS + 1))
    else
        echo "  PASS: skills/bigcommerce/ present"
    fi

    # Other platform arms must NOT be present
    for arm in shopify wordpress-woocommerce magento-adobe-commerce headless; do
        if [[ -d "$EDITION_DIR/skills/$arm" ]]; then
            echo "  FAIL: skills/$arm/ present in BC edition"
            ERRORS=$((ERRORS + 1))
        else
            echo "  PASS: no skills/$arm/"
        fi
    done

    # Inventory should NOT contain other-platform D-codes
    local other_count
    other_count=$(grep -c "D-WP-\|D-NB-\|D-VU-\|D-B2B-\|D-MR-\|D-HL-\|D-MG-" "$EDITION_DIR/skills/_decisions/decision-inventory.md" 2>/dev/null || true)
    if [[ "$other_count" -gt 0 ]]; then
        echo "  FAIL: decision-inventory.md contains $other_count other-platform D-codes"
        ERRORS=$((ERRORS + 1))
    else
        echo "  PASS: no other-platform D-codes in inventory"
    fi
}

check_headless() {
    echo "== Edition: Headless =="
    echo "  INFO: Headless arm is scaffold-only until Headless window builds it out"

    # Headless arm must exist (even as scaffold)
    if [[ ! -d "$EDITION_DIR/skills/headless" ]]; then
        echo "  FAIL: skills/headless/ missing"
        ERRORS=$((ERRORS + 1))
    else
        echo "  PASS: skills/headless/ present"
    fi

    # Other platform arms must NOT be present
    for arm in shopify wordpress-woocommerce bigcommerce magento-adobe-commerce; do
        if [[ -d "$EDITION_DIR/skills/$arm" ]]; then
            echo "  FAIL: skills/$arm/ present in Headless edition"
            ERRORS=$((ERRORS + 1))
        else
            echo "  PASS: no skills/$arm/"
        fi
    done

    # Inventory should NOT contain other-platform D-codes
    local other_count
    other_count=$(grep -c "D-WP-\|D-NB-\|D-VU-\|D-B2B-\|D-MR-\|D-BC-\|D-MG-" "$EDITION_DIR/skills/_decisions/decision-inventory.md" 2>/dev/null || true)
    if [[ "$other_count" -gt 0 ]]; then
        echo "  FAIL: decision-inventory.md contains $other_count other-platform D-codes"
        ERRORS=$((ERRORS + 1))
    else
        echo "  PASS: no other-platform D-codes in inventory"
    fi
}

check_full() {
    echo "== Edition: Full =="

    # All 4 platform arms should exist (some as scaffolds)
    for arm in shopify wordpress-woocommerce bigcommerce magento-adobe-commerce; do
        if [[ ! -d "$EDITION_DIR/skills/$arm" ]]; then
            echo "  FAIL: skills/$arm/ missing"
            ERRORS=$((ERRORS + 1))
        else
            echo "  PASS: skills/$arm/ present"
        fi
    done

    # Decision inventory has both Shopify AND WP D-codes
    local shopify_count wp_count
    shopify_count=$(grep -c "D-NB-\|D-VU-\|D-B2B-\|D-MR-" "$EDITION_DIR/skills/_decisions/decision-inventory.md" 2>/dev/null || true)
    wp_count=$(grep -c "D-WP-\|D-WP-RD-" "$EDITION_DIR/skills/_decisions/decision-inventory.md" 2>/dev/null || true)

    if [[ "$shopify_count" -lt 4 || "$wp_count" -lt 4 ]]; then
        echo "  FAIL: full inventory missing codes (Shopify $shopify_count, WP $wp_count)"
        ERRORS=$((ERRORS + 1))
    else
        echo "  PASS: full inventory has both Shopify ($shopify_count) and WP ($wp_count) D-codes"
    fi
}

# Common checks (all editions)
check_common() {
    echo "== Common checks =="

    # frontmatter validator present
    if [[ ! -f "$EDITION_DIR/tools/scripts/validate-frontmatter.py" ]]; then
        echo "  FAIL: validate-frontmatter.py missing"
        ERRORS=$((ERRORS + 1))
    else
        echo "  PASS: validate-frontmatter.py present"
    fi

    # persona present
    if [[ ! -f "$EDITION_DIR/skills/_spine/persona.md" ]]; then
        echo "  FAIL: skills/_spine/persona.md missing"
        ERRORS=$((ERRORS + 1))
    else
        echo "  PASS: persona.md present"
    fi

    # forbidden-global present
    if [[ ! -f "$EDITION_DIR/skills/_spine/shared-knowledge/forbidden-global.md" ]]; then
        echo "  FAIL: forbidden-global.md missing"
        ERRORS=$((ERRORS + 1))
    else
        echo "  PASS: forbidden-global.md present"
    fi

    # decision-inventory.md must exist
    if [[ ! -f "$EDITION_DIR/skills/_decisions/decision-inventory.md" ]]; then
        echo "  FAIL: decision-inventory.md missing"
        ERRORS=$((ERRORS + 1))
    else
        echo "  PASS: decision-inventory.md present"
    fi

    # Root README must exist and have content beyond one line
    if [[ ! -f "$EDITION_DIR/README.md" ]]; then
        echo "  FAIL: README.md missing at bundle root"
        ERRORS=$((ERRORS + 1))
    else
        local lines
        lines=$(wc -l < "$EDITION_DIR/README.md")
        if [[ "$lines" -lt 5 ]]; then
            echo "  FAIL: README.md is too short (only $lines lines — suspected stub regression)"
            ERRORS=$((ERRORS + 1))
        else
            echo "  PASS: README.md has $lines lines"
        fi
    fi
}


# ---------------------------------------------------------------------------
# Spine contamination scan (v1.11.6+ per D-EDITION-FILTER-01 rule 3)
# ---------------------------------------------------------------------------
# Detects platform-specific WORKED EXAMPLES or DANGLING LOAD instructions that
# leaked into shared spine files. Does NOT flag universal enumeration (routing
# tables, valid-value lists, cross-platform detection knowledge).
#
# The strongest contamination signal is a FILE PATH reference to a platform arm
# that doesn't exist in the current edition. Example: `wordpress-woocommerce/knowledge/24-woocommerce-css-conflicts.md`
# appearing inside `_spine/*` when the WP arm is NOT installed in this edition.

scan_spine_contamination() {
    local edition="$1"
    echo ""
    echo "== Spine contamination scan (D-EDITION-FILTER-01 rule 3) =="

    local forbidden_arms=()
    case "$edition" in
        shopify)
            forbidden_arms=("wordpress-woocommerce" "bigcommerce" "magento-adobe-commerce" "headless")
            ;;
        wordpress)
            forbidden_arms=("shopify" "bigcommerce" "magento-adobe-commerce" "headless")
            ;;
        bigcommerce)
            forbidden_arms=("shopify" "wordpress-woocommerce" "magento-adobe-commerce" "headless")
            ;;
        magento)
            forbidden_arms=("shopify" "wordpress-woocommerce" "bigcommerce" "headless")
            ;;
        headless)
            forbidden_arms=("shopify" "wordpress-woocommerce" "bigcommerce" "magento-adobe-commerce")
            ;;
        full)
            echo "  SKIP: full edition ships canonical spine; contamination scan not applicable"
            return
            ;;
    esac

    local violations=0
    for arm in "${forbidden_arms[@]}"; do
        # Look for FILE PATH references (dangling loads / worked examples) in spine files
        local hits
        hits=$(grep -rln "${arm}/knowledge/\|${arm}/projects/\|${arm}/templates/"                "$EDITION_DIR/skills/_spine/" 2>/dev/null || true)

        if [[ -n "$hits" ]]; then
            echo "  FAIL: spine contamination — file-path refs to non-installed arm '$arm':"
            while IFS= read -r hit; do
                echo "    - $hit"
                # Show one example line
                grep -n "${arm}/" "$hit" 2>/dev/null | head -1 | sed 's/^/      /'
            done <<< "$hits"
            violations=$((violations + 1))
            ERRORS=$((ERRORS + 1))
        else
            echo "  PASS: no file-path refs to '$arm' in spine"
        fi
    done

    if [[ "$violations" -eq 0 ]]; then
        echo "  PASS: spine contamination scan clean"
    fi
}

# ---------------------------------------------------------------------------
# Spine free-text platform token scan (v1.11.12+ per D-EDITION-FILTER-01 rule 5)
# ---------------------------------------------------------------------------
# Catches free-text worked-example bleed that the file-path scan misses.
# Example: a spine handoff template lists YITH WooCommerce, hello-elementor-child,
# WP Rocket as concrete examples — no file-path ref, but a WP-only reader is
# forced to translate an unfamiliar stack to their own context.
#
# Policy per D-EDITION-FILTER-01: spine files must be universal.
# Concrete platform-specific technical tokens (product names, framework names,
# specific plugin/app names) SHOULD NOT appear in _spine/*. Use `<active-platform>`
# placeholders or generic phrasing instead.
#
# Enumeration is still allowed — a routing table listing "shopify | wordpress |
# bigcommerce | headless" side-by-side is legitimate. The scan targets
# HIGHLY-SPECIFIC tokens that make sense only as a worked example, not
# platform NAMES themselves.

scan_spine_free_text() {
    local edition="$1"
    echo ""
    echo "== Spine free-text token scan (D-EDITION-FILTER-01 rule 5, v1.11.12+) =="

    if [[ "$edition" == "full" ]]; then
        echo "  SKIP: full edition ships canonical spine; free-text scan not applicable"
        return
    fi

    # Per-arm technical token blocklist. Case-insensitive. Regex-safe.
    # Each token here is highly specific to a single arm — no legit reason for
    # it to appear in _spine/* as a worked example when that arm isn't installed.
    #
    # Deliberately narrow. Not "elementor" alone (may be enumerated) but
    # "elementor pro" / "hello-elementor" / "YITH" — plugin/app product names,
    # theme names, framework names.

    local wp_tokens='YITH|hello-elementor|WP Rocket|Elementor Pro|wp-content/|WooCommerce widget|Advanced Custom Fields|Gutenberg block|WP-CLI|Timber|Bedrock|Roots'
    local shopify_tokens='\.liquid\b|Liquid template|theme\.liquid|shopify theme dev|shopify theme push|theme-check|OS 2\.0|Dawn theme|Sense theme|Storefront API|section groups JSON|Shopify Functions|Shopify Flow'
    local bc_tokens='Stencil framework|stencil-cli|Widget-Zone|Widget Regions|BigCommerce Page Builder|Big Design'
    local headless_tokens='Hydrogen|Oxygen|Next\.js Commerce|Vendure|Medusa\.js|Commerce\.js'

    # Determine which token sets are FORBIDDEN in this edition's spine
    local forbidden_desc=()
    local forbidden_patterns=()

    case "$edition" in
        shopify)
            forbidden_desc=("WordPress" "BigCommerce" "Headless")
            forbidden_patterns=("$wp_tokens" "$bc_tokens" "$headless_tokens")
            ;;
        wordpress)
            forbidden_desc=("Shopify" "BigCommerce" "Headless")
            forbidden_patterns=("$shopify_tokens" "$bc_tokens" "$headless_tokens")
            ;;
        bigcommerce)
            forbidden_desc=("Shopify" "WordPress" "Headless")
            forbidden_patterns=("$shopify_tokens" "$wp_tokens" "$headless_tokens")
            ;;
        headless)
            forbidden_desc=("Shopify" "WordPress" "BigCommerce")
            forbidden_patterns=("$shopify_tokens" "$wp_tokens" "$bc_tokens")
            ;;
        magento)
            forbidden_desc=("Shopify" "WordPress" "BigCommerce" "Headless")
            forbidden_patterns=("$shopify_tokens" "$wp_tokens" "$bc_tokens" "$headless_tokens")
            ;;
        spine-only)
            echo "  SKIP: spine-only edition ships canonical spine; enumeration is legitimate"
            return
            ;;
        *)
            echo "  SKIP: unknown edition for free-text scan"
            return
            ;;
    esac

    local scan_root="$EDITION_DIR/skills/_spine"
    if [[ ! -d "$scan_root" ]]; then
        echo "  SKIP: no _spine directory at $scan_root"
        return
    fi

    # Allowlist — spine files that DELIBERATELY enumerate cross-platform content
    # (per-platform sections, cross-platform reference material). Reviewed and
    # confirmed as legitimate enumeration, not worked-example bleed. Any new
    # entry here should be justified in the commit message.
    #
    # Rationale for each allowlisted file:
    #   forbidden-global.md — cross-platform rules; enumerates per-platform enforcement paths
    #   dev-environment-setup.md — cross-platform toolchain setup; developer must set up all arms they work on
    #   pm-agent/09-master-doc-template.md — cross-platform template; parenthetical enumeration only
    #   content-migration-agent/05-content-import-patterns.md — migration crosses source+target platforms
    #   code-review-agent/03-sensitive-paths.md — cross-platform sensitive-path enumeration
    #   delivery-head/01-prelaunch-checklist-composition.md — per-platform prelaunch sections
    #   delivery-head/02-publish-protocol.md — per-platform publish protocol sections
    # Group A — cross-platform enumeration (permanent allowlist, reviewed).
    # These files DELIBERATELY enumerate cross-platform content: per-platform
    # sections, cross-platform reference material, agency-tech-stack lists.
    local allowlist_patterns=(
        "_spine/shared-knowledge/forbidden-global.md"
        "_spine/shared-knowledge/dev-environment-setup.md"
        "_spine/pm-agent/knowledge/09-master-doc-template.md"
        "_spine/content-migration-agent/knowledge/05-content-import-patterns.md"
        "_spine/code-review-agent/knowledge/03-sensitive-paths.md"
        "_spine/delivery-head/knowledge/01-prelaunch-checklist-composition.md"
        "_spine/delivery-head/knowledge/02-publish-protocol.md"
        "_spine/persona.md"
        "_spine/designer-agent/knowledge/02-design-path-decision.md"
        "_spine/qa-agent/knowledge/04-lighthouse-thresholds.md"

        # Group B — LEGACY DEBT allowlist (v1.11.13 genericization sweep).
        # These 18 spine files contain Shopify-specific worked examples that
        # predate the v1.11.12 scanner. Detected by the scanner on first run.
        # Allowlisted so v1.11.12 can ship the preventive scanner without
        # blocking on a scope-explosion; TODO(v1.11.13): genericize these
        # files to use <active-platform> placeholders and remove from this
        # legacy-debt group. Any NEW bleeds in these files still trip other
        # controls (structural contamination scan + review). New files
        # starting from v1.11.12 must be clean — no additions to Group B.
        "_spine/code-review-agent/SKILL.md"
        "_spine/code-review-agent/knowledge/01-review-checks.md"
        "_spine/code-review-agent/knowledge/02-severity-classification.md"
        "_spine/code-review-agent/templates/review-comment.md"
        "_spine/designer-agent/SKILL.md"
        "_spine/designer-agent/knowledge/08-section-pattern-library.md"
        "_spine/orchestrator/knowledge/03-gate-protocol.md"
        "_spine/orchestrator/knowledge/06-agent-cascade.md"
        "_spine/orchestrator/knowledge/07-build-plan-preview.md"
        "_spine/pm-agent/knowledge/07-adherence-verification.md"
        "_spine/qa-agent/knowledge/01-qa-modules.md"
        "_spine/qa-agent/knowledge/06-test-pyramid-orchestration.md"
        "_spine/shared-knowledge/ai-output-verification.md"
        "_spine/shared-knowledge/ai-tool-rules.md"
        "_spine/shared-knowledge/code-review-standards.md"
        "_spine/shared-knowledge/destructive-ops-protocol.md"
        "_spine/shared-knowledge/pr-template.md"
        "_spine/shared-knowledge/session-handoff-protocol.md"
    )

    # Build a filter-out expression for grep -v
    local exclude_expr=""
    for allow in "${allowlist_patterns[@]}"; do
        if [[ -z "$exclude_expr" ]]; then
            exclude_expr="$allow"
        else
            exclude_expr="$exclude_expr|$allow"
        fi
    done

    local violations=0
    local i=0
    while [[ $i -lt ${#forbidden_desc[@]} ]]; do
        local label="${forbidden_desc[$i]}"
        local pattern="${forbidden_patterns[$i]}"

        # Search spine .md files; case-insensitive; extended regex. Filter
        # allowlisted enumeration files.
        local hits
        hits=$(grep -rniE --include='*.md' "$pattern" "$scan_root" 2>/dev/null | grep -vE "$exclude_expr" || true)

        if [[ -n "$hits" ]]; then
            echo "  FAIL: spine free-text bleed — $label-specific tokens found in _spine/:"
            echo "$hits" | head -6 | sed 's|'"$EDITION_DIR"'/|    |'
            local total_hits
            total_hits=$(echo "$hits" | wc -l | tr -d ' ')
            if [[ "$total_hits" -gt 6 ]]; then
                echo "    ... and $((total_hits - 6)) more"
            fi
            violations=$((violations + 1))
            ERRORS=$((ERRORS + 1))
        else
            echo "  PASS: no $label free-text bleed in spine (allowlisted enumeration files excluded)"
        fi
        i=$((i + 1))
    done

    if [[ "$violations" -eq 0 ]]; then
        echo "  PASS: spine free-text scan clean (${#allowlist_patterns[@]} cross-platform enumeration files allowlisted)"
    fi
}

# ---------------------------------------------------------------------------
# Arm-version-bump enforcement (v1.11.13 mtime; v1.11.15+ content-hash)
# ---------------------------------------------------------------------------
# Catches the class of bug where arm files are updated in a release but the
# arm's SKILL.md version is not bumped. Recurred v1.11.6, v1.11.12 — both
# caught by external audit, not by tooling.
#
# v1.11.13 first attempt: mtime-based check. Correctly identified by the
# Shopify window as too weak — mtime false-positives on inconvenient edit
# ordering, clears with `touch`, would also mask a real missed bump. That
# version claimed a "PASS" that meant nothing.
#
# v1.11.15 rewrite: content-hash comparison against a release manifest
# shipped with each bundle at `.release-manifest.json`. For each arm:
#   1. Compute sha256 of concatenated sorted arm content (excluding SKILL.md)
#   2. Read SKILL.md's frontmatter `version:` value
#   3. Compare against previous release's manifest entry for this arm
#   4. If content_hash differs but skill_version is identical → FAIL
#      (arm files changed but SKILL.md wasn't bumped — real bug)
#   5. If both are identical → PASS (no arm change; no bump needed)
#   6. If skill_version differs → PASS (bump happened regardless of content)
#   7. If no previous manifest exists → SKIP (bootstrap release)
#
# The new manifest is written into the bundle by ship-bundle.sh so the NEXT
# release has a baseline.

scan_arm_version_bump() {
    local edition="$1"
    echo ""
    echo "== Arm-version-bump enforcement (v1.11.15+ content-hash) =="

    # Which arms are present in this edition?
    local arms=()
    for arm in shopify wordpress-woocommerce bigcommerce magento-adobe-commerce headless; do
        if [[ -d "$EDITION_DIR/skills/$arm" && -f "$EDITION_DIR/skills/$arm/SKILL.md" ]]; then
            arms+=("$arm")
        fi
    done

    if [[ ${#arms[@]} -eq 0 ]]; then
        echo "  SKIP: no arm SKILL.md files present in this edition"
        return
    fi

    # Previous release manifest — expected at $PREV_MANIFEST env var
    # (ship-bundle.sh sets this before invoking the checker) or at
    # $EDITION_DIR/.previous-release-manifest.json.
    local prev_manifest="${PREV_MANIFEST:-$EDITION_DIR/.previous-release-manifest.json}"
    if [[ ! -f "$prev_manifest" ]]; then
        echo "  SKIP: no previous release manifest — bootstrap release, cannot compare"
        echo "        (a manifest will be written to the current bundle at ship time)"
        return
    fi

    local violations=0
    for arm in "${arms[@]}"; do
        local arm_skill="$EDITION_DIR/skills/$arm/SKILL.md"
        # Extract current version from SKILL.md frontmatter
        local cur_version
        cur_version=$(awk '/^version:/ {gsub(/^version:[[:space:]]*/, ""); gsub(/[[:space:]]*$/, ""); print; exit}' "$arm_skill")

        # Compute content hash of arm subdirectory (excluding SKILL.md itself)
        # Sorted-file-list + concatenated contents keeps this deterministic.
        # v1.11.16: LC_ALL=C pinned on `sort -z` to match the writer's
        # codepoint-order sort (Python `list.sort()`). Without this, UTF-8
        # locales collate differently from the writer, producing a spurious
        # mismatch on the first real check run in any UTF-8 environment
        # (caught by Shopify window after v1.11.15 shipped).
        local cur_hash
        cur_hash=$(cd "$EDITION_DIR/skills/$arm" && \
            find . -type f -name '*.md' ! -name 'SKILL.md' -print0 2>/dev/null | \
            LC_ALL=C sort -z | xargs -0 cat 2>/dev/null | sha256sum | awk '{print $1}')

        # Extract previous version + hash from manifest for this arm
        local prev_version prev_hash
        prev_version=$(python3 -c "
import json, sys
try:
    m = json.load(open('$prev_manifest'))
    print(m.get('$arm', {}).get('skill_version', ''))
except Exception:
    print('')
" 2>/dev/null)
        prev_hash=$(python3 -c "
import json, sys
try:
    m = json.load(open('$prev_manifest'))
    print(m.get('$arm', {}).get('content_hash', ''))
except Exception:
    print('')
" 2>/dev/null)

        if [[ -z "$prev_version" || -z "$prev_hash" ]]; then
            echo "  SKIP: $arm — not in previous manifest (new arm this release)"
            continue
        fi

        if [[ "$cur_hash" == "$prev_hash" ]]; then
            # Content unchanged — bump not required regardless of version state
            echo "  PASS: $arm — content unchanged since previous release (v$prev_version)"
        elif [[ "$cur_version" != "$prev_version" ]]; then
            # Content changed AND version bumped — correct discipline
            echo "  PASS: $arm — content changed, SKILL.md bumped $prev_version → $cur_version"
        else
            # Content changed but version identical — real bug
            echo "  FAIL: $arm — content changed since previous release, but SKILL.md still at v$prev_version. Missed version bump."
            echo "        previous content_hash: ${prev_hash:0:16}..."
            echo "        current  content_hash: ${cur_hash:0:16}..."
            violations=$((violations + 1))
            ERRORS=$((ERRORS + 1))
        fi
    done

    if [[ "$violations" -eq 0 ]]; then
        echo "  PASS: arm-version-bump scan clean (${#arms[@]} arm(s) checked against previous manifest)"
    fi
}

# ---------------------------------------------------------------------------
# Dispatch
# ---------------------------------------------------------------------------

case "$EDITION" in
    shopify)    check_shopify ;;
    wordpress)  check_wordpress ;;
    full)       check_full ;;
    spine-only) check_spine_only ;;
    bigcommerce) check_bigcommerce ;;
    headless)    check_headless ;;
    magento)
        echo "== Edition: $EDITION (not yet built out; only common checks apply) =="
        ;;
    *)
        echo "ERROR: unknown edition '$EDITION'" >&2
        exit 2
        ;;
esac

# v1.11.6+ spine contamination scan (D-EDITION-FILTER-01 rule 3)
scan_spine_contamination "$EDITION"

# v1.11.12+ spine free-text platform token scan (D-EDITION-FILTER-01 rule 5)
scan_spine_free_text "$EDITION"

# v1.11.13+ arm-version-bump enforcement (per Shopify window recommendation)
scan_arm_version_bump "$EDITION"

echo ""
check_common

echo ""
if [[ "$ERRORS" -eq 0 ]]; then
    echo "===================="
    echo "PASS — 0 contamination detected"
    echo "===================="
    exit 0
else
    echo "===================="
    echo "FAIL — $ERRORS integrity check(s) failed"
    echo "===================="
    exit 1
fi
