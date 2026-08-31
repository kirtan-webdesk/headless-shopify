#!/bin/bash
# verify-redirects.sh
#
# Verifies that every redirect in a CSV maps to its expected target.
# Per _spine/content-migration-agent/knowledge/04-url-redirect-strategy.md
# Usage:
#   ./verify-redirects.sh redirect-map.csv https://staging.example.com
#
# Output: verification-report.md

set -e

REDIRECT_MAP="${1:-redirect-map.csv}"
BASE_URL="${2:-}"
OUTPUT="verification-report.md"

if [ ! -f "$REDIRECT_MAP" ]; then
    echo "ERROR: $REDIRECT_MAP not found"
    exit 1
fi

if [ -z "$BASE_URL" ]; then
    echo "Usage: $0 [redirect-map.csv] [base-url]"
    echo "Example: $0 redirect-map.csv https://staging.example.com"
    exit 1
fi

echo "# Redirect Verification Report" > "$OUTPUT"
echo "" >> "$OUTPUT"
echo "**Base URL:** $BASE_URL" >> "$OUTPUT"
echo "**Map:** $REDIRECT_MAP" >> "$OUTPUT"
echo "**Date:** $(date -u +'%Y-%m-%dT%H:%M:%SZ')" >> "$OUTPUT"
echo "" >> "$OUTPUT"
echo "## Results" >> "$OUTPUT"
echo "" >> "$OUTPUT"
echo "| Source | Expected target | Actual status | Actual location | Result |" >> "$OUTPUT"
echo "|--------|-----------------|---------------|-----------------|--------|" >> "$OUTPUT"

TOTAL=0
PASSED=0
FAILED=0

# Skip header line and comments
while IFS=, read -r source_url target_url redirect_type priority reason; do
    # Skip empty lines and comments
    [[ -z "$source_url" || "$source_url" =~ ^# ]] && continue
    # Skip header
    [[ "$source_url" == "source_url" ]] && continue

    TOTAL=$((TOTAL + 1))

    # Build full URL
    FULL_URL="${BASE_URL}${source_url}"

    # Use curl with -I -L to follow redirects and show all hops
    RESPONSE=$(curl -s -I -L --max-redirs 5 "$FULL_URL" 2>/dev/null || echo "ERROR")

    if [ "$RESPONSE" == "ERROR" ]; then
        echo "| $source_url | $target_url | ERROR | - | ✗ |" >> "$OUTPUT"
        FAILED=$((FAILED + 1))
        continue
    fi

    # Get first response status
    FIRST_STATUS=$(echo "$RESPONSE" | head -1 | awk '{print $2}')

    # Get the Location header from first response
    LOCATION=$(echo "$RESPONSE" | grep -i "^Location:" | head -1 | awk '{print $2}' | tr -d '\r')

    # Normalize: strip base URL if present
    LOCATION_PATH=$(echo "$LOCATION" | sed "s|^${BASE_URL}||")

    if [ "$FIRST_STATUS" == "301" ] && [ "$LOCATION_PATH" == "$target_url" ]; then
        echo "| $source_url | $target_url | 301 | $LOCATION_PATH | ✓ |" >> "$OUTPUT"
        PASSED=$((PASSED + 1))
    elif [ "$FIRST_STATUS" == "200" ] && [ "$source_url" == "$target_url" ]; then
        # Canonical case: target same as source, no redirect needed
        echo "| $source_url | $target_url | 200 | - | ✓ canonical |" >> "$OUTPUT"
        PASSED=$((PASSED + 1))
    else
        echo "| $source_url | $target_url | $FIRST_STATUS | $LOCATION_PATH | ✗ |" >> "$OUTPUT"
        FAILED=$((FAILED + 1))
    fi
done < "$REDIRECT_MAP"

echo "" >> "$OUTPUT"
echo "## Summary" >> "$OUTPUT"
echo "" >> "$OUTPUT"
echo "- Total: $TOTAL" >> "$OUTPUT"
echo "- Passed: $PASSED" >> "$OUTPUT"
echo "- Failed: $FAILED" >> "$OUTPUT"

if [ "$FAILED" -gt 0 ]; then
    echo "" >> "$OUTPUT"
    echo "⚠ **$FAILED redirects failed verification.** Investigate before launch." >> "$OUTPUT"
    echo "Report: $OUTPUT"
    exit 1
fi

echo "" >> "$OUTPUT"
echo "✓ All redirects verified." >> "$OUTPUT"
echo "Report: $OUTPUT"
