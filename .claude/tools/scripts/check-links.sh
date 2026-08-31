#!/usr/bin/env bash
# check-links.sh
# Pre-push broken-link audit for theme / template files.
# Per v1.5.5 — addresses Report 2 scorecard target "Automated link-check pre-push".
#
# Catches:
# - Local hrefs to pages that don't exist in the project
# - Internal links to /pages/X where the page slug isn't found
# - mailto: links matching client_contact_blocklist (per COMM-001)
# - Form actions to client-controlled domains (per COMM-002)
# - Hardcoded URLs to unknown external domains (warning)
#
# Usage:
#   ./check-links.sh --platform shopify
#   ./check-links.sh --platform shopify --dir ./theme
#   ./check-links.sh --platform wordpress --dir ./wp-content/themes/my-theme

set -uo pipefail

SCRIPT_NAME="check-links.sh"
PLATFORM=""
SCAN_DIR="."
PROJECT_JSON="${PROJECT_JSON_PATH:-./project.json}"
FAILURES=0
WARNINGS=0

while [ $# -gt 0 ]; do
  case "$1" in
    --platform) PLATFORM="${2:?}"; shift 2 ;;
    --dir) SCAN_DIR="${2:?}"; shift 2 ;;
    *) echo "Unknown arg: $1" >&2; exit 1 ;;
  esac
done

[ -z "$PLATFORM" ] && PLATFORM=$(jq -r '.platform // ""' "$PROJECT_JSON" 2>/dev/null || echo "")
[ -z "$PLATFORM" ] && { echo "ERROR: --platform required (or set in project.json)"; exit 1; }

pass() { printf "\033[0;32m✓\033[0m %s\n" "$1"; }
fail() { printf "\033[0;31m✗\033[0m %s — %s\n" "$1" "$2"; FAILURES=$((FAILURES + 1)); }
warn() { printf "\033[0;33m⚠\033[0m %s — %s\n" "$1" "$2"; WARNINGS=$((WARNINGS + 1)); }

# ------------- Determine file patterns per platform -------------
case "$PLATFORM" in
  shopify|shopify-plus)
    TEMPLATE_GLOBS="*.liquid"
    TEMPLATE_FIND_ARGS="-name *.liquid"
    ;;
  wordpress|woocommerce)
    TEMPLATE_FIND_ARGS="-name *.php"
    ;;
  magento|adobe-commerce)
    TEMPLATE_FIND_ARGS="-name *.phtml -o -name *.html"
    ;;
  bigcommerce)
    TEMPLATE_FIND_ARGS="-name *.html"
    ;;
  *)
    TEMPLATE_FIND_ARGS="-name *.html -o -name *.liquid -o -name *.php -o -name *.phtml"
    ;;
esac

echo "Scanning $SCAN_DIR for broken/forbidden links (platform: $PLATFORM)"
echo ""

# ------------- Build blocklist + known-pages set -------------
BLOCKLIST_EMAILS=""
BLOCKLIST_DOMAINS=""
if [ -f "$PROJECT_JSON" ] && command -v jq >/dev/null 2>&1; then
  BLOCKLIST_EMAILS=$(jq -r '.client_contact_blocklist.emails[]? // empty' "$PROJECT_JSON" 2>/dev/null | tr '\n' '|' | sed 's/|$//')
  BLOCKLIST_DOMAINS=$(jq -r '.client_contact_blocklist.domains[]? // empty' "$PROJECT_JSON" 2>/dev/null | tr '\n' '|' | sed 's/|$//')
fi

# Known page slugs (Shopify pattern — page templates in templates/page.<slug>.json)
KNOWN_PAGES=""
if [ "$PLATFORM" = "shopify" ] || [ "$PLATFORM" = "shopify-plus" ]; then
  KNOWN_PAGES=$(find "$SCAN_DIR" -name "page.*.json" -type f 2>/dev/null | \
    sed 's|.*page\.||; s|\.json$||' | sort -u | tr '\n' '|' | sed 's/|$//')
fi

# ------------- Check 1: mailto: links matching blocklist -------------
if [ -n "$BLOCKLIST_EMAILS" ]; then
  MATCHES=$(eval "find $SCAN_DIR -type f \\( $TEMPLATE_FIND_ARGS \\)" 2>/dev/null | \
    xargs grep -lE "mailto:($BLOCKLIST_EMAILS)" 2>/dev/null || true)
  if [ -z "$MATCHES" ]; then
    pass "No mailto: links to blocked client emails (COMM-001)"
  else
    while IFS= read -r f; do
      [ -z "$f" ] && continue
      fail "COMM-001 — Blocked client email in mailto:" "$f"
    done <<< "$MATCHES"
  fi
fi

# ------------- Check 2: form actions to client-controlled domains -------------
if [ -n "$BLOCKLIST_DOMAINS" ]; then
  MATCHES=$(eval "find $SCAN_DIR -type f \\( $TEMPLATE_FIND_ARGS \\)" 2>/dev/null | \
    xargs grep -lE "action=[\"'](https?://)?($BLOCKLIST_DOMAINS)" 2>/dev/null || true)
  if [ -z "$MATCHES" ]; then
    pass "No form actions to client-controlled domains (COMM-002)"
  else
    while IFS= read -r f; do
      [ -z "$f" ] && continue
      fail "COMM-002 — form action to client domain" "$f"
    done <<< "$MATCHES"
  fi
fi

# ------------- Check 3: Internal /pages/X links resolve (Shopify only) -------------
if [ -n "$KNOWN_PAGES" ]; then
  REFERENCED_PAGES=$(eval "find $SCAN_DIR -type f \\( $TEMPLATE_FIND_ARGS \\)" 2>/dev/null | \
    xargs grep -ohE "/pages/[a-zA-Z0-9_-]+" 2>/dev/null | sed 's|/pages/||' | sort -u)

  BROKEN_PAGES=""
  while IFS= read -r page; do
    [ -z "$page" ] && continue
    if ! echo "$KNOWN_PAGES" | grep -qE "(^|\|)$page($|\|)"; then
      BROKEN_PAGES="$BROKEN_PAGES $page"
    fi
  done <<< "$REFERENCED_PAGES"

  if [ -z "$BROKEN_PAGES" ]; then
    pass "All internal /pages/X links resolve to known page templates"
  else
    for page in $BROKEN_PAGES; do
      warn "Broken page link" "/pages/$page — no template found"
    done
  fi
fi

# ------------- Check 4: External hrefs to unfamiliar domains (warning only) -------------
EXT_DOMAINS=$(eval "find $SCAN_DIR -type f \\( $TEMPLATE_FIND_ARGS \\)" 2>/dev/null | \
  xargs grep -ohE 'href="https?://[a-zA-Z0-9.-]+' 2>/dev/null | \
  sed 's|href="https\?://||' | sort -u | head -20)

if [ -n "$EXT_DOMAINS" ]; then
  echo ""
  echo "  External domains referenced (review for unintended external links):"
  echo "$EXT_DOMAINS" | sed 's/^/    /'
fi

# ------------- Summary -------------
echo ""
if [ "$FAILURES" -eq 0 ] && [ "$WARNINGS" -eq 0 ]; then
  printf "\033[0;32m✓ Link audit clean. Safe to push.\033[0m\n"
  exit 0
elif [ "$FAILURES" -eq 0 ]; then
  printf "\033[0;33m⚠ %d warnings (review before push). No hard failures.\033[0m\n" "$WARNINGS"
  exit 0
else
  printf "\033[0;31m✗ %d failures + %d warnings. Fix before push.\033[0m\n" "$FAILURES" "$WARNINGS"
  exit 1
fi
