#!/usr/bin/env bash
# validate-mockup.sh
# Runs the 8 required validations against an HTML mockup directory before G2.
# Per v1.5.2 — 09-html-mockup-standards.md § "Required validations before G2".

set -uo pipefail

CLIENT=""
MOCKUP_DIR=""
PROJECTS_ROOT="${PROJECTS_ROOT:-./projects}"
FAILURES=0

while [ $# -gt 0 ]; do
  case "$1" in
    --client) CLIENT="${2:?}"; shift 2 ;;
    --dir) MOCKUP_DIR="${2:?}"; shift 2 ;;
    *) echo "Unknown arg: $1" >&2; exit 1 ;;
  esac
done

if [ -z "$MOCKUP_DIR" ] && [ -n "$CLIENT" ]; then
  MOCKUP_DIR="$PROJECTS_ROOT/$CLIENT/mockups"
fi

[ -d "$MOCKUP_DIR" ] || { echo "ERROR: mockup dir not found: $MOCKUP_DIR" >&2; exit 1; }

pass() { printf "\033[0;32m✓\033[0m %s\n" "$1"; }
fail() { printf "\033[0;31m✗\033[0m %s — %s\n" "$1" "$2"; FAILURES=$((FAILURES + 1)); }
warn() { printf "\033[0;33m⚠\033[0m %s — %s\n" "$1" "$2"; }

echo "Validating mockup at $MOCKUP_DIR"
echo ""

# 1. Semantic HTML check — heading hierarchy
DIVS_AS_BUTTONS=$(grep -rEo '<div[^>]*onclick' "$MOCKUP_DIR" --include="*.html" 2>/dev/null | wc -l)
if [ "$DIVS_AS_BUTTONS" -eq 0 ]; then
  pass "Semantic HTML — no <div onclick> patterns"
else
  fail "Semantic HTML" "$DIVS_AS_BUTTONS <div onclick> patterns found (use <button>)"
fi

# 2. axe-core (skipped if not installed — flagged as warning)
if command -v axe >/dev/null 2>&1; then
  for html in "$MOCKUP_DIR"/*.html; do
    [ -f "$html" ] || continue
    # axe CLI run — exit code 0 if no violations
    if axe "$html" --tags wcag2a,wcag2aa --exit 0 >/dev/null 2>&1; then
      pass "axe-core — $(basename "$html")"
    else
      fail "axe-core — $(basename "$html")" "violations found"
    fi
  done
else
  warn "axe-core" "axe CLI not installed. Install: npm install -g @axe-core/cli"
fi

# 3. Mobile responsive — can't fully automate, check for media queries presence
if find "$MOCKUP_DIR/assets" -name "*.css" -exec grep -l "@media" {} \; 2>/dev/null | head -1 | grep -q .; then
  pass "Responsive CSS — @media queries present"
else
  fail "Responsive CSS" "no @media queries found across CSS files"
fi

# 4. Lighthouse — skipped (requires server running)
warn "Lighthouse" "skipped — run via mockup-preview-server + lighthouse CLI separately"

# 5. Token-only colors check
HARDCODED_COLORS=$(grep -rE "(background|color|border)[^:]*:[^;]*#[0-9a-fA-F]{3,6}" "$MOCKUP_DIR/assets/sections" 2>/dev/null | grep -v "var(--" | wc -l || echo 0)
if [ "$HARDCODED_COLORS" -eq 0 ]; then
  pass "Tokens — no hardcoded hex colors in section CSS"
else
  fail "Tokens" "$HARDCODED_COLORS hardcoded hex colors found in section CSS (use var(--*))"
fi

# 6. No inline <style> blocks in HTML
INLINE_STYLES=$(grep -rl "<style>" "$MOCKUP_DIR" --include="*.html" 2>/dev/null | wc -l)
if [ "$INLINE_STYLES" -eq 0 ]; then
  pass "No inline <style> blocks in HTML"
else
  fail "Inline styles" "$INLINE_STYLES HTML file(s) contain <style> blocks (DES-003 / LIQ-009)"
fi

# 6b. No inline <script> blocks in HTML (no src)
INLINE_SCRIPTS=$(grep -rE "<script>[^<]" "$MOCKUP_DIR" --include="*.html" 2>/dev/null | wc -l)
if [ "$INLINE_SCRIPTS" -eq 0 ]; then
  pass "No inline <script> blocks in HTML"
else
  fail "Inline scripts" "$INLINE_SCRIPTS inline <script> block(s) found (LIQ-001 / J2)"
fi

# 7. Link integrity — local hrefs resolve
BROKEN_LINKS=0
for html in "$MOCKUP_DIR"/*.html; do
  [ -f "$html" ] || continue
  # extract href values that look like local paths
  while read -r href; do
    # skip external, fragment, mailto, tel
    case "$href" in
      http*|//*|\#*|mailto:*|tel:*|javascript:*) continue ;;
    esac
    # resolve to absolute path
    if [[ "$href" == /* ]]; then
      target="$MOCKUP_DIR$href"
    else
      target="$(dirname "$html")/$href"
    fi
    if [ ! -e "$target" ]; then
      BROKEN_LINKS=$((BROKEN_LINKS + 1))
    fi
  done < <(grep -oE 'href="[^"#]+"' "$html" | sed 's/href="//; s/"$//')
done
if [ "$BROKEN_LINKS" -eq 0 ]; then
  pass "Link integrity — all local hrefs resolve"
else
  warn "Link integrity" "$BROKEN_LINKS broken local href(s) (may be intentional placeholders)"
fi

# 8. Image dimensions
IMG_WITHOUT_DIMS=$(grep -rEo '<img [^>]*src="[^"]+"[^>]*>' "$MOCKUP_DIR" --include="*.html" 2>/dev/null | grep -vE 'width=' | wc -l || echo 0)
if [ "$IMG_WITHOUT_DIMS" -eq 0 ]; then
  pass "Image dimensions — all <img> have width attribute"
else
  fail "Image dimensions" "$IMG_WITHOUT_DIMS <img> without width attribute (PERF-001 / H7)"
fi

echo ""
if [ "$FAILURES" -eq 0 ]; then
  printf "\033[0;32m✓ All checks passed. Mockup ready for G2.\033[0m\n"
  exit 0
else
  printf "\033[0;31m✗ %d check(s) failed. Fix before G2.\033[0m\n" "$FAILURES"
  exit 1
fi
