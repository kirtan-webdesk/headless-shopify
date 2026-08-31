#!/usr/bin/env bash
# validate-frontmatter.sh — wrapper around validate-frontmatter.py
# Usage: tools/scripts/validate-frontmatter.sh [path] [--strict] [--json]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PY_SCRIPT="$SCRIPT_DIR/validate-frontmatter.py"

if [[ ! -f "$PY_SCRIPT" ]]; then
    echo "ERROR: validate-frontmatter.py not found at $PY_SCRIPT" >&2
    exit 2
fi

# Default path is the repo root (2 levels up from tools/scripts/)
DEFAULT_PATH="$(cd "$SCRIPT_DIR/../.." && pwd)/skills"

if [[ $# -eq 0 ]]; then
    exec python3 "$PY_SCRIPT" "$DEFAULT_PATH"
else
    exec python3 "$PY_SCRIPT" "$@"
fi
