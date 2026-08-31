#!/usr/bin/env bash
# check-env.sh
# Pre-flight environment check for WebDesk projects.
# Fails fast if developer environment doesn't match project requirements.
#
# Per v1.5.2 Tier A — addresses Kitchen Blockers pilot Node version gap
# (Shopify CLI v4 requires Node 22+, default was v18).
#
# Run at session start, before any code work.
#
# Usage:
#   ./check-env.sh [--platform shopify|wordpress|nodejs|headless] [--strict]
#
# Options:
#   --platform   Project platform (default: read from project.json)
#   --strict     Treat warnings as errors (exit code 2 instead of 0)
#   --json       Output results as JSON instead of human-readable
#
# Exit codes:
#   0 = all checks pass
#   1 = critical failure (mismatched required version)
#   2 = warnings present and --strict was set

set -uo pipefail

SCRIPT_NAME="check-env.sh"
PLATFORM=""
STRICT=0
JSON=0
RESULTS=()
EXIT_CODE=0

# ------------- Argument parsing -------------
while [ $# -gt 0 ]; do
  case "$1" in
    --platform)
      PLATFORM="${2:?--platform requires a value}"
      shift 2
      ;;
    --strict)
      STRICT=1
      shift
      ;;
    --json)
      JSON=1
      shift
      ;;
    *)
      echo "Unknown arg: $1" >&2
      exit 1
      ;;
  esac
done

# ------------- Auto-detect platform from project.json -------------
if [ -z "$PLATFORM" ] && [ -f "./project.json" ]; then
  if command -v jq >/dev/null 2>&1; then
    PLATFORM=$(jq -r '.platform // ""' ./project.json 2>/dev/null || echo "")
  fi
fi

# ------------- Helpers -------------
log()     { [ "$JSON" -eq 0 ] && printf "\033[0;36m[%s]\033[0m %s\n" "$SCRIPT_NAME" "$*"; }
pass()    { RESULTS+=("PASS|$1|$2"); [ "$JSON" -eq 0 ] && printf "\033[0;32m✓\033[0m %s — %s\n" "$1" "$2"; }
warn()    { RESULTS+=("WARN|$1|$2"); [ "$JSON" -eq 0 ] && printf "\033[0;33m⚠\033[0m %s — %s\n" "$1" "$2"; [ "$STRICT" -eq 1 ] && EXIT_CODE=2; }
fail()    { RESULTS+=("FAIL|$1|$2"); [ "$JSON" -eq 0 ] && printf "\033[0;31m✗\033[0m %s — %s\n" "$1" "$2"; EXIT_CODE=1; }

[ "$JSON" -eq 0 ] && log "Running environment checks (platform: ${PLATFORM:-unknown})"
[ "$JSON" -eq 0 ] && echo ""

# ------------- Universal checks -------------

# Node.js
if command -v node >/dev/null 2>&1; then
  NODE_VER=$(node -v | sed 's/v//')
  NODE_MAJOR=$(echo "$NODE_VER" | cut -d. -f1)
  case "$PLATFORM" in
    shopify|headless)
      if [ "$NODE_MAJOR" -ge 22 ]; then
        pass "Node version" "v$NODE_VER (required: v22+, OK for Shopify CLI v4)"
      else
        fail "Node version" "v$NODE_VER detected. Shopify CLI v4 requires v22+. Fix: nvm use 22"
      fi
      ;;
    nodejs|nodejs-saas|nodejs-custom-app)
      if [ "$NODE_MAJOR" -ge 20 ]; then
        pass "Node version" "v$NODE_VER (required: v20+ for Node app dev)"
      else
        fail "Node version" "v$NODE_VER detected. Node app dev requires v20+. Fix: nvm use 22"
      fi
      ;;
    *)
      if [ "$NODE_MAJOR" -ge 20 ]; then
        pass "Node version" "v$NODE_VER"
      else
        warn "Node version" "v$NODE_VER detected. Recommended: v20 or v22"
      fi
      ;;
  esac
else
  fail "Node.js" "node not in PATH. Install via nvm: nvm install 22 && nvm use 22"
fi

# Git
if command -v git >/dev/null 2>&1; then
  pass "Git" "$(git --version)"
else
  fail "Git" "git not in PATH"
fi

# jq (used by safe-push.sh + other scripts)
if command -v jq >/dev/null 2>&1; then
  pass "jq" "$(jq --version)"
else
  warn "jq" "jq not in PATH. Install: brew install jq (or apt install jq). Required for safe-push.sh audit logging."
fi

# ------------- Shopify-specific checks -------------
if [ "$PLATFORM" = "shopify" ]; then

  if command -v shopify >/dev/null 2>&1; then
    SHOPIFY_VER=$(shopify version 2>/dev/null | head -n1 || echo "unknown")
    SHOPIFY_MAJOR=$(echo "$SHOPIFY_VER" | grep -oE '[0-9]+' | head -n1 || echo "0")
    if [ "$SHOPIFY_MAJOR" -ge 4 ]; then
      pass "Shopify CLI" "$SHOPIFY_VER (v4+ OK)"
    else
      fail "Shopify CLI" "$SHOPIFY_VER detected. v4+ required. Fix: npm install -g @shopify/cli@latest @shopify/theme@latest"
    fi
  else
    fail "Shopify CLI" "shopify CLI not installed. Fix: npm install -g @shopify/cli@latest @shopify/theme@latest"
  fi

  # Check for required env vars (without printing values)
  for var in SHOPIFY_CLI_THEME_TOKEN SHOPIFY_STORE_URL; do
    if [ -n "${!var:-}" ]; then
      pass "Env: $var" "set"
    else
      warn "Env: $var" "not set in current shell. Required for non-interactive Shopify CLI."
    fi
  done

  # Check safe-push.sh exists
  if [ -f "./tools/scripts/safe-push.sh" ]; then
    pass "safe-push.sh" "present at tools/scripts/safe-push.sh"
  else
    warn "safe-push.sh" "missing. Direct shopify theme push without --nodelete is dangerous (see SEC-004)."
  fi

fi

# ------------- WordPress / WooCommerce checks (v1.10.0) -------------
if [ "$PLATFORM" = "wordpress" ] || [ "$PLATFORM" = "woocommerce" ]; then

  if command -v wp >/dev/null 2>&1; then
    WP_CLI_VER=$(wp --version 2>/dev/null | head -n1 || echo "unknown")
    pass "WP-CLI" "$WP_CLI_VER"
  else
    fail "WP-CLI" "wp not in PATH. Install: curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar && chmod +x wp-cli.phar && sudo mv wp-cli.phar /usr/local/bin/wp"
  fi

  # PHP version (WP 6+ requires 7.4+; 8.0+ recommended)
  if command -v php >/dev/null 2>&1; then
    PHP_VER=$(php -r 'echo PHP_VERSION;' 2>/dev/null)
    PHP_MAJOR=$(echo "$PHP_VER" | cut -d. -f1)
    PHP_MINOR=$(echo "$PHP_VER" | cut -d. -f2)
    if [ "$PHP_MAJOR" -ge 8 ]; then
      pass "PHP version" "v$PHP_VER (8.x+ recommended)"
    elif [ "$PHP_MAJOR" -eq 7 ] && [ "$PHP_MINOR" -ge 4 ]; then
      warn "PHP version" "v$PHP_VER (works but PHP 8.x+ recommended)"
    else
      fail "PHP version" "v$PHP_VER detected. WordPress requires PHP 7.4+; 8.x+ recommended."
    fi
  else
    fail "PHP" "php not in PATH"
  fi

  # rsync for deploys
  if command -v rsync >/dev/null 2>&1; then
    pass "rsync" "available"
  else
    fail "rsync" "not installed. Required for wp-safe-deploy.sh"
  fi

  # Check wp-safe-deploy.sh exists
  if [ -f "./tools/scripts/wp-safe-deploy.sh" ]; then
    pass "wp-safe-deploy.sh" "present at tools/scripts/wp-safe-deploy.sh"
  else
    warn "wp-safe-deploy.sh" "missing. Direct rsync to wp-content/ without backup is dangerous."
  fi

  # WooCommerce-specific (when relevant)
  if [ "$PLATFORM" = "woocommerce" ]; then
    if command -v wp >/dev/null 2>&1 && [ -d "${WP_PATH:-.}/wp-content" ]; then
      if wp plugin is-active woocommerce --path="${WP_PATH:-.}" 2>/dev/null; then
        WC_VERSION=$(wp plugin get woocommerce --field=version --path="${WP_PATH:-.}" 2>/dev/null || echo "unknown")
        pass "WooCommerce" "active (v$WC_VERSION)"
      else
        warn "WooCommerce" "not active or WP path not accessible"
      fi
    fi
  fi

fi

# ------------- Node.js / Headless placeholders -------------
# Add per-platform checks as those skills are built.

# ------------- project.json check -------------
if [ -f "./project.json" ]; then
  if command -v jq >/dev/null 2>&1; then
    if jq empty ./project.json 2>/dev/null; then
      pass "project.json" "valid JSON"

      # Check critical fields
      CLIENT_NAME=$(jq -r '.client_name // ""' ./project.json)
      if [ -n "$CLIENT_NAME" ]; then
        pass "project.json client_name" "$CLIENT_NAME"
      else
        warn "project.json client_name" "missing"
      fi

      # Outbound comms blocklist (v1.5.2 Tier A)
      BLOCKLIST_EMAILS=$(jq -r '.client_contact_blocklist.emails | length // 0' ./project.json)
      if [ "$BLOCKLIST_EMAILS" -gt 0 ]; then
        pass "Outbound comms blocklist" "$BLOCKLIST_EMAILS email(s) blocked"
      else
        warn "Outbound comms blocklist" "EMPTY. FLAG-004 protection is OFF. Add client emails to client_contact_blocklist."
      fi

    else
      fail "project.json" "invalid JSON"
    fi
  fi
else
  warn "project.json" "not found in current dir. Create per _contracts/project-json.schema.json before starting work."
fi

# ------------- Output -------------
if [ "$JSON" -eq 1 ]; then
  printf '['
  for i in "${!RESULTS[@]}"; do
    IFS='|' read -r status check detail <<< "${RESULTS[$i]}"
    printf '{"status":"%s","check":"%s","detail":"%s"}' "$status" "$check" "$detail"
    [ "$i" -lt $((${#RESULTS[@]} - 1)) ] && printf ','
  done
  printf ']\n'
else
  echo ""
  PASS_COUNT=$(printf '%s\n' "${RESULTS[@]}" | grep -c "^PASS" || true)
  WARN_COUNT=$(printf '%s\n' "${RESULTS[@]}" | grep -c "^WARN" || true)
  FAIL_COUNT=$(printf '%s\n' "${RESULTS[@]}" | grep -c "^FAIL" || true)
  log "Summary: $PASS_COUNT passed, $WARN_COUNT warning, $FAIL_COUNT failed"
  if [ "$EXIT_CODE" -ne 0 ]; then
    log "Fix the failures above before continuing."
  fi
fi

exit "$EXIT_CODE"
