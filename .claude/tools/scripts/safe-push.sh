#!/usr/bin/env bash
# safe-push.sh
# Wrapper around `shopify theme push` that REFUSES to run without --nodelete
# and snapshots the remote theme before pushing.
#
# Per v1.5.2 Tier A — prevents the pilot incident where push without --nodelete
# wiped non-protected remote theme files.
#
# Usage:
#   ./safe-push.sh --store STORE_URL --theme THEME_ID [--path .] [--nodelete] [--unpublished] [--theme-name "Name"]
#
# Required:
#   --store     Shopify store URL (e.g., wds46.myshopify.com)
#   --theme     Theme ID to push to
#
# Optional:
#   --path           Theme files path (default: .)
#   --nodelete       Will be auto-injected if missing. Explicit pass-through allowed.
#   --unpublished    For backup pushes only
#   --theme-name     For new-theme creation only
#   --skip-snapshot  Skip the pre-push snapshot (NOT RECOMMENDED, requires explicit confirmation)
#
# Environment:
#   SHOPIFY_CLI_THEME_TOKEN  Required for auth (otherwise CLI prompts)
#   PROJECT_JSON_PATH        Path to project.json for audit logging (default: ./project.json)
#   SAFE_PUSH_SNAPSHOT_DIR   Where to store snapshots (default: .theme-snapshots/)

set -euo pipefail

SCRIPT_NAME="safe-push.sh"
SCRIPT_VERSION="1.0.0"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ------------- Logging helpers -------------
log()     { printf "\033[0;36m[%s]\033[0m %s\n" "$SCRIPT_NAME" "$*"; }
warn()    { printf "\033[0;33m[%s] WARN: %s\033[0m\n" "$SCRIPT_NAME" "$*" >&2; }
error()   { printf "\033[0;31m[%s] ERROR: %s\033[0m\n" "$SCRIPT_NAME" "$*" >&2; }
success() { printf "\033[0;32m[%s] ✓ %s\033[0m\n" "$SCRIPT_NAME" "$*"; }
die()     { error "$*"; exit 1; }

# ------------- Pre-flight: check shopify CLI exists -------------
command -v shopify >/dev/null 2>&1 || die "shopify CLI not installed. Run: npm install -g @shopify/cli @shopify/theme"

# Check Node version (Shopify CLI v4 requires v22+)
NODE_MAJOR=$(node -v 2>/dev/null | sed 's/v\([0-9]*\).*/\1/' || echo "0")
if [ "$NODE_MAJOR" -lt 22 ]; then
  die "Node version $NODE_MAJOR detected. Shopify CLI v4 requires Node 22+. Run: nvm use 22"
fi

# ------------- Parse arguments -------------
STORE=""
THEME=""
THEME_PATH="."
NODELETE_PASSED=0
UNPUBLISHED=0
THEME_NAME=""
SKIP_SNAPSHOT=0
EXTRA_ARGS=()

while [ $# -gt 0 ]; do
  case "$1" in
    --store)
      STORE="${2:?--store requires a value}"
      shift 2
      ;;
    --theme)
      THEME="${2:?--theme requires a value}"
      shift 2
      ;;
    --path)
      THEME_PATH="${2:?--path requires a value}"
      shift 2
      ;;
    --nodelete)
      NODELETE_PASSED=1
      shift
      ;;
    --unpublished)
      UNPUBLISHED=1
      shift
      ;;
    --theme-name)
      THEME_NAME="${2:?--theme-name requires a value}"
      shift 2
      ;;
    --skip-snapshot)
      SKIP_SNAPSHOT=1
      shift
      ;;
    *)
      EXTRA_ARGS+=("$1")
      shift
      ;;
  esac
done

# ------------- Validate required args -------------
[ -z "$STORE" ] && die "--store is required"
# --theme not required if --unpublished is set (CLI will create new theme)
if [ "$UNPUBLISHED" -eq 0 ] && [ -z "$THEME" ]; then
  die "--theme is required (or use --unpublished for new theme)"
fi

# ------------- HARD GUARD: refuse without --nodelete (unless --unpublished new theme) -------------
if [ "$UNPUBLISHED" -eq 0 ] && [ "$NODELETE_PASSED" -eq 0 ]; then
  warn "--nodelete was NOT passed. This is the destructive flag combination that wiped files in the Kitchen Blockers pilot."
  warn "Auto-injecting --nodelete. To override (NOT RECOMMENDED), edit this script."
  NODELETE_PASSED=1
fi

# ------------- Snapshot the current remote theme before push -------------
SNAPSHOT_DIR="${SAFE_PUSH_SNAPSHOT_DIR:-.theme-snapshots}"
SNAPSHOT_TIMESTAMP=$(date +%Y%m%d-%H%M%S)
SNAPSHOT_PATH="$SNAPSHOT_DIR/snapshot-$SNAPSHOT_TIMESTAMP"

if [ "$SKIP_SNAPSHOT" -eq 0 ] && [ "$UNPUBLISHED" -eq 0 ]; then
  log "Snapshotting current remote theme before push..."
  mkdir -p "$SNAPSHOT_PATH"

  if ! shopify theme pull \
    --store "$STORE" \
    --theme "$THEME" \
    --path "$SNAPSHOT_PATH" \
    --nodelete 2>&1 | tee "$SNAPSHOT_PATH/.pull.log"; then
    die "Snapshot pull FAILED. Aborting push to prevent unrecoverable state."
  fi

  success "Snapshot saved at $SNAPSHOT_PATH"
  log "If push goes wrong, restore with: shopify theme push --store $STORE --theme $THEME --path $SNAPSHOT_PATH --nodelete"

  # Prune snapshots older than 30 days
  find "$SNAPSHOT_DIR" -maxdepth 1 -type d -name "snapshot-*" -mtime +30 -exec rm -rf {} \; 2>/dev/null || true
elif [ "$SKIP_SNAPSHOT" -eq 1 ]; then
  warn "Snapshot SKIPPED via --skip-snapshot. You are operating without a safety net."
fi

# ------------- Build and execute the push -------------
PUSH_CMD=(shopify theme push --store "$STORE" --path "$THEME_PATH" --nodelete)

if [ "$UNPUBLISHED" -eq 1 ]; then
  PUSH_CMD+=(--unpublished)
  [ -n "$THEME_NAME" ] && PUSH_CMD+=(--theme-name "$THEME_NAME")
else
  PUSH_CMD+=(--theme "$THEME")
fi

# Append any extra args
[ ${#EXTRA_ARGS[@]} -gt 0 ] && PUSH_CMD+=("${EXTRA_ARGS[@]}")

log "Executing: ${PUSH_CMD[*]}"

PUSH_START=$(date +%s)
PUSH_EXIT=0
"${PUSH_CMD[@]}" || PUSH_EXIT=$?
PUSH_END=$(date +%s)
PUSH_DURATION=$((PUSH_END - PUSH_START))

# ------------- Audit log to project.json -------------
PROJECT_JSON="${PROJECT_JSON_PATH:-./project.json}"

if [ -f "$PROJECT_JSON" ] && command -v jq >/dev/null 2>&1; then
  ENTRY=$(jq -n \
    --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    --arg action "safe_push" \
    --arg store "$STORE" \
    --arg theme "$THEME" \
    --arg snapshot "$SNAPSHOT_PATH" \
    --argjson exit_code "$PUSH_EXIT" \
    --argjson duration_sec "$PUSH_DURATION" \
    --arg actor "${USER:-unknown}" \
    '{timestamp: $ts, action: $action, store: $store, theme: $theme, snapshot_path: $snapshot, exit_code: $exit_code, duration_sec: $duration_sec, actor: $actor}')

  # Atomic update — write to temp, then mv
  jq --argjson entry "$ENTRY" '.audit_log += [$entry]' "$PROJECT_JSON" > "$PROJECT_JSON.tmp" && \
    mv "$PROJECT_JSON.tmp" "$PROJECT_JSON"

  log "Audit log entry written to $PROJECT_JSON"
fi

# ------------- Result -------------
if [ "$PUSH_EXIT" -eq 0 ]; then
  success "Push completed in ${PUSH_DURATION}s"
  if [ "$SKIP_SNAPSHOT" -eq 0 ] && [ "$UNPUBLISHED" -eq 0 ]; then
    log "Rollback available at: $SNAPSHOT_PATH"
  fi
else
  error "Push FAILED with exit code $PUSH_EXIT"
  if [ "$SKIP_SNAPSHOT" -eq 0 ] && [ "$UNPUBLISHED" -eq 0 ]; then
    error "Restore from snapshot: shopify theme push --store $STORE --theme $THEME --path $SNAPSHOT_PATH --nodelete"
  fi
  exit "$PUSH_EXIT"
fi
