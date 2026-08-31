#!/usr/bin/env bash
# mockup-preview-server.sh
# Serves /projects/[client]/mockups/ via HTTP for stakeholder review.
# Per v1.5.2 D-DES-01 — mockups are HTML/CSS/JS, previewed in-browser, not Figma.
#
# Usage:
#   ./mockup-preview-server.sh --client kitchen-blockers [--port 8080] [--tunnel]
#
# Options:
#   --client    Required. Client slug.
#   --port      Default 8080. If busy, picks next free.
#   --tunnel    Optional. Expose via Cloudflare tunnel for client review.
#   --watch     Optional. Auto-reload on file changes (requires entr or watchexec).

set -euo pipefail

SCRIPT_NAME="mockup-preview-server.sh"
CLIENT=""
PORT=8080
TUNNEL=0
WATCH=0
PROJECTS_ROOT="${PROJECTS_ROOT:-./projects}"

log()     { printf "\033[0;36m[%s]\033[0m %s\n" "$SCRIPT_NAME" "$*"; }
warn()    { printf "\033[0;33m[%s] WARN: %s\033[0m\n" "$SCRIPT_NAME" "$*" >&2; }
error()   { printf "\033[0;31m[%s] ERROR: %s\033[0m\n" "$SCRIPT_NAME" "$*" >&2; }
success() { printf "\033[0;32m[%s] ✓ %s\033[0m\n" "$SCRIPT_NAME" "$*"; }
die()     { error "$*"; exit 1; }

# ------------- Args -------------
while [ $# -gt 0 ]; do
  case "$1" in
    --client)
      CLIENT="${2:?--client requires a value}"
      shift 2
      ;;
    --port)
      PORT="${2:?--port requires a value}"
      shift 2
      ;;
    --tunnel)
      TUNNEL=1
      shift
      ;;
    --watch)
      WATCH=1
      shift
      ;;
    *)
      die "Unknown arg: $1"
      ;;
  esac
done

[ -z "$CLIENT" ] && die "--client is required"

MOCKUP_DIR="$PROJECTS_ROOT/$CLIENT/mockups"
[ -d "$MOCKUP_DIR" ] || die "Mockup directory not found: $MOCKUP_DIR"
[ -f "$MOCKUP_DIR/index.html" ] || warn "No index.html in $MOCKUP_DIR — preview will list directory contents"

# ------------- Find free port if requested one is busy -------------
while lsof -i ":$PORT" >/dev/null 2>&1; do
  warn "Port $PORT is busy, trying $((PORT + 1))"
  PORT=$((PORT + 1))
done

# ------------- Pre-flight validations -------------
log "Pre-flight checks on $MOCKUP_DIR..."

# Check for inline <style> blocks (DES-003 violation)
INLINE_STYLES=$(grep -rl --include="*.html" "<style>" "$MOCKUP_DIR" 2>/dev/null || true)
if [ -n "$INLINE_STYLES" ]; then
  warn "Inline <style> blocks found (DES-003 violation) in:"
  echo "$INLINE_STYLES" | sed 's/^/  /'
fi

# Check for inline <script> blocks (LIQ-001 / mockup standards J2 violation)
INLINE_SCRIPTS=$(grep -rl --include="*.html" "<script>" "$MOCKUP_DIR" 2>/dev/null | xargs -I{} grep -l "^[[:space:]]*<script>[^/]" {} 2>/dev/null || true)
if [ -n "$INLINE_SCRIPTS" ]; then
  warn "Inline <script> blocks found (no src=) in:"
  echo "$INLINE_SCRIPTS" | sed 's/^/  /'
fi

# Check tokens.css exists
if [ ! -f "$MOCKUP_DIR/assets/tokens.css" ]; then
  warn "Missing $MOCKUP_DIR/assets/tokens.css — section CSS files probably hardcoding colors"
fi

# ------------- Start server -------------
log "Starting preview server on port $PORT..."
log "Serving: $MOCKUP_DIR"
log "Preview URL: http://localhost:$PORT/"

# Choose server based on available tools
if command -v python3 >/dev/null 2>&1; then
  SERVER_CMD=(python3 -m http.server "$PORT" --directory "$MOCKUP_DIR")
elif command -v python >/dev/null 2>&1; then
  SERVER_CMD=(python -m SimpleHTTPServer "$PORT")
else
  die "python3 not found. Install python or use a different server."
fi

# ------------- Optional tunnel -------------
TUNNEL_PID=""
TUNNEL_URL=""
if [ "$TUNNEL" -eq 1 ]; then
  if command -v cloudflared >/dev/null 2>&1; then
    log "Starting Cloudflare tunnel for client review..."
    cloudflared tunnel --url "http://localhost:$PORT" > /tmp/mockup-tunnel.log 2>&1 &
    TUNNEL_PID=$!
    sleep 5
    TUNNEL_URL=$(grep -oE "https://[a-z0-9-]+\.trycloudflare\.com" /tmp/mockup-tunnel.log | head -n1 || echo "")
    if [ -n "$TUNNEL_URL" ]; then
      success "Tunnel URL: $TUNNEL_URL"
      log "Share this URL with Internal PM. Do NOT email it directly to client (FLAG-004)."
    else
      warn "Tunnel URL extraction failed. Check /tmp/mockup-tunnel.log"
    fi
  elif command -v ngrok >/dev/null 2>&1; then
    log "Starting ngrok tunnel..."
    ngrok http "$PORT" > /tmp/mockup-tunnel.log 2>&1 &
    TUNNEL_PID=$!
    sleep 5
    log "Check ngrok dashboard at http://localhost:4040 for tunnel URL"
  else
    warn "No tunnel tool found (cloudflared or ngrok). Skipping --tunnel."
  fi
fi

# ------------- Watch mode -------------
if [ "$WATCH" -eq 1 ]; then
  if command -v entr >/dev/null 2>&1; then
    log "Watch mode enabled (entr) — server restart on file changes"
    find "$MOCKUP_DIR" -type f | entr -r "${SERVER_CMD[@]}"
  else
    warn "entr not installed; running without watch. Install: brew install entr"
    "${SERVER_CMD[@]}"
  fi
else
  # ------------- Cleanup on exit -------------
  trap 'echo ""; log "Shutting down..."; [ -n "$TUNNEL_PID" ] && kill "$TUNNEL_PID" 2>/dev/null || true; exit 0' INT TERM

  "${SERVER_CMD[@]}"
fi
