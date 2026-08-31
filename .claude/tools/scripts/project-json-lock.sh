#!/bin/bash
# project-json-lock.sh
#
# File locking + atomic write + versioning for project.json.
# Per _spine/orchestrator/knowledge/04-state-management.md
#
# Usage:
#   ./project-json-lock.sh acquire [project-path] [actor-name]
#   ./project-json-lock.sh release [project-path]
#   ./project-json-lock.sh write [project-path] [json-content-file]
#
# Exit codes:
#   0 - Success
#   1 - Lock contention (already held)
#   2 - Schema validation failed
#   3 - Other error

set -e

ACTION="$1"
PROJECT_PATH="${2:-.}"
LOCK_FILE="$PROJECT_PATH/project.json.lock"
PROJECT_JSON="$PROJECT_PATH/project.json"
VERSIONS_DIR="$PROJECT_PATH/project.json.versions"

# Lock timeout (5 minutes per state-management.md)
LOCK_TIMEOUT_SECONDS=300

acquire_lock() {
    local actor_name="$1"

    if [ -z "$actor_name" ]; then
        echo "ERROR: actor name required for acquire"
        exit 3
    fi

    # Check if lock exists
    if [ -f "$LOCK_FILE" ]; then
        # Read lock info
        LOCK_DATA=$(cat "$LOCK_FILE")
        LOCKED_AT=$(echo "$LOCK_DATA" | jq -r '.locked_at // empty')
        LOCKED_BY=$(echo "$LOCK_DATA" | jq -r '.locked_by // empty')

        if [ -n "$LOCKED_AT" ]; then
            # Calculate age
            LOCKED_AT_EPOCH=$(date -d "$LOCKED_AT" +%s 2>/dev/null || gdate -d "$LOCKED_AT" +%s 2>/dev/null || echo "0")
            NOW_EPOCH=$(date +%s)
            AGE=$((NOW_EPOCH - LOCKED_AT_EPOCH))

            if [ "$AGE" -lt "$LOCK_TIMEOUT_SECONDS" ]; then
                echo "ERROR: Lock held by $LOCKED_BY for ${AGE}s (expires in $((LOCK_TIMEOUT_SECONDS - AGE))s)"
                exit 1
            else
                echo "WARNING: Stale lock from $LOCKED_BY (${AGE}s old). Taking over."
            fi
        fi
    fi

    # Acquire lock
    NOW=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    EXPIRES=$(date -u -d "+$LOCK_TIMEOUT_SECONDS seconds" +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || gdate -u -d "+$LOCK_TIMEOUT_SECONDS seconds" +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || echo "")

    cat > "$LOCK_FILE" <<EOF
{
  "locked_by": "$actor_name",
  "locked_at": "$NOW",
  "expires_at": "$EXPIRES",
  "pid": $$
}
EOF

    echo "✓ Lock acquired by $actor_name at $NOW"
}

release_lock() {
    if [ -f "$LOCK_FILE" ]; then
        rm "$LOCK_FILE"
        echo "✓ Lock released"
    else
        echo "No lock to release"
    fi
}

write_with_lock() {
    local new_content_file="$1"

    if [ -z "$new_content_file" ] || [ ! -f "$new_content_file" ]; then
        echo "ERROR: content file required and must exist"
        exit 3
    fi

    # Verify lock is held
    if [ ! -f "$LOCK_FILE" ]; then
        echo "ERROR: No lock held. Acquire first."
        exit 1
    fi

    # Read new content
    NEW_CONTENT=$(cat "$new_content_file")

    # Validate JSON
    echo "$NEW_CONTENT" | jq empty 2>/dev/null || {
        echo "ERROR: Invalid JSON in $new_content_file"
        exit 2
    }

    # Create versions dir if not exists
    mkdir -p "$VERSIONS_DIR"

    # Snapshot current version (if exists)
    if [ -f "$PROJECT_JSON" ]; then
        TIMESTAMP=$(date -u +"%Y-%m-%dT%H-%M-%SZ")
        cp "$PROJECT_JSON" "$VERSIONS_DIR/$TIMESTAMP.json"
        echo "✓ Snapshot saved: $VERSIONS_DIR/$TIMESTAMP.json"
    fi

    # Atomic write: write to .tmp then rename
    echo "$NEW_CONTENT" > "$PROJECT_JSON.tmp"
    mv "$PROJECT_JSON.tmp" "$PROJECT_JSON"
    echo "✓ project.json updated"
}

case "$ACTION" in
    acquire)
        acquire_lock "$3"
        ;;
    release)
        release_lock
        ;;
    write)
        write_with_lock "$3"
        ;;
    *)
        echo "Usage: $0 acquire <project-path> <actor-name>"
        echo "       $0 release <project-path>"
        echo "       $0 write <project-path> <new-content-file>"
        exit 3
        ;;
esac
