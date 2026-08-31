---
tier: 2
load_when: ["destructive-op"]
---

# Destructive Operations Protocol

> v1.5.2 Tier A — every destructive operation snapshots first, with rollback path. Prevents the Kitchen Blockers pilot incident (push without `--nodelete` wiped non-protected files).

---

## What counts as a destructive operation

ANY operation that can lose or overwrite data without a built-in undo:

1. **Theme pushes** that can delete remote files (`shopify theme push` without `--nodelete`)
2. **Git force-pushes** that rewrite history (`git push --force`, `git push --force-with-lease`)
3. **File deletes** in production paths (`rm -rf`, `unlink`)
4. **Database operations** that drop/truncate (`DROP TABLE`, `TRUNCATE`, `DELETE FROM` without WHERE)
5. **Metafield deletions** via Shopify Admin API (bulk delete operations)
6. **Bulk redirect changes** in Shopify Admin (replacing redirect map)
7. **CDN cache purges** that affect production (full purges, not surgical)
8. **App uninstalls** from production stores
9. **Theme deletions** (any theme delete via API or admin)
10. **Backup deletions** (yes — deleting backups is itself destructive)

If you're not sure whether something is destructive, **assume it is and follow the protocol**.

---

## The protocol — every destructive op MUST

### Step 1: Snapshot before
Capture a recoverable copy of the target state. Examples:

| Operation | Snapshot |
|-----------|----------|
| Theme push (live) | `shopify theme pull` to `.theme-snapshots/snapshot-<TIMESTAMP>/` |
| Theme push (staging) | Same — staging matters for client review history |
| Git force-push | Create backup branch: `git branch backup/<branch-name>-<TIMESTAMP>` |
| Bulk metafield delete | Export current values to JSON before delete |
| Bulk redirect change | Export current redirect map to CSV |
| Database operation | `pg_dump` / `mysqldump` to timestamped file |
| App uninstall | Document current configuration + uninstall reason |
| Theme deletion | `shopify theme pull` to `.theme-snapshots/deleted-<TIMESTAMP>/` |

The snapshot location MUST be:
- Outside the file or branch being modified
- Persisted to disk (not in-memory only)
- Reachable for at least 30 days
- Indexed so it can be found (timestamp in path or audit log entry)

### Step 2: Log the operation to project.json audit_log

```json
{
  "audit_log": [
    {
      "timestamp": "2026-05-27T14:32:00Z",
      "action": "destructive_op",
      "operation": "theme_push_live",
      "target": "wds46.myshopify.com / theme 145012129910",
      "snapshot_path": ".theme-snapshots/snapshot-20260527-143200/",
      "actor": "John (Tech Lead)",
      "approver": "Internal PM",
      "rationale": "M5 launch — per launch runbook",
      "rollback_command": "shopify theme push --store wds46.myshopify.com --theme 145012129910 --path .theme-snapshots/snapshot-20260527-143200 --nodelete"
    }
  ]
}
```

The `rollback_command` field is critical — it captures the EXACT command needed to restore.

### Step 3: Execute with safety flags

| Operation | Required flags |
|-----------|---------------|
| `shopify theme push` | `--nodelete` always (use `safe-push.sh` wrapper) |
| `git push` | Prefer `--force-with-lease` over `--force` |
| `rm` | Prefer `mv` to a `.trash/` directory over `rm` |
| `DROP TABLE` | Prefer `RENAME` to `<table>_archived_<DATE>` before any drop |
| Bulk API operations | Batch with confirmation prompts every 100 items |

### Step 4: Verify the snapshot is valid before proceeding

A snapshot you can't restore from is worse than no snapshot — it gives false confidence.

```bash
# Example: verify theme snapshot is restorable
if [ ! -d "$SNAPSHOT_PATH/sections" ] || [ ! -d "$SNAPSHOT_PATH/templates" ]; then
  die "Snapshot incomplete. Aborting destructive operation."
fi
```

### Step 5: Execute the destructive op

Now — and only now — run the operation.

### Step 6: Post-op verification

After the op, verify the target state matches expectation:
- Theme push → fetch homepage, check 200 status + expected content
- Git force-push → check branch HEAD matches local
- DB operation → check row counts / schema

If post-op verification fails: **roll back immediately using the rollback_command from audit_log.**

---

## Snapshot retention

| Operation type | Retention |
|----------------|-----------|
| Live theme push | 90 days minimum, 1 year recommended |
| Staging theme push | 30 days |
| Dev theme push | 7 days |
| Git backup branches | 30 days (then auto-prune) |
| Database dumps | Per data classification policy (often 90+ days) |
| Metafield/redirect exports | Project lifetime |

Implement retention via cron job or CI workflow that prunes older snapshots.

---

## Manual operations — same protocol applies

If a human developer runs a destructive op manually (not via agent), they're STILL responsible for the protocol. The system enforces via:

1. **`safe-push.sh` wrapper** — refuses `shopify theme push` without `--nodelete`, snapshots automatically
2. **Pre-commit hook** — warns if `git push --force` is being attempted on protected branches
3. **CI workflow** — `live-publish.yml` already enforces backup-before-publish; this protocol extends the pattern to other destructive ops
4. **Periodic audit** — Code Review Agent reviews recent commits for destructive op patterns; flags any missing snapshots

---

## Forbidden patterns (added to forbidden.md as SEC-004 onward)

These will be wired into Code Review Agent and pre-commit hooks. See `09-forbidden.md` for full definitions.

- `SEC-004` — Never run `shopify theme push` without `--nodelete` flag (use `safe-push.sh`)
- `SEC-005` — Never run destructive ops without snapshot to `audit_log`
- `SEC-006` — Never delete backups < 30 days old without explicit approval
- `SEC-007` — Never use `git push --force` on `main`, `develop`, or `release/*` branches
- `SEC-008` — Never delete `.theme-snapshots/` directory programmatically

---

## When snapshots can be skipped (rare)

Only with explicit OVERRIDE in `project.json.audit_log`:

- Snapshot would exceed disk quota AND op is non-critical (e.g., dev theme cleanup)
- Snapshot would expose data that legally cannot be persisted (regulatory)
- Snapshot mechanism itself is being tested

Each skip MUST have:
- Reason
- Approver name (different from requester — self-approval prohibition)
- Expiration (single-op or duration)

Without an approved skip in audit_log, the agent/script defaults to BLOCK.

---

## Rollback runbook

If a destructive op went wrong, the rollback flow is:

1. **Locate the snapshot** — find `snapshot_path` in `project.json.audit_log`
2. **Verify snapshot integrity** — check it has expected directory structure
3. **Run rollback command** — exact command stored in `audit_log[].rollback_command`
4. **Verify rollback succeeded** — run post-op verification on restored state
5. **Document the incident** — append to `failure-modes.md` with FM-NNN entry
6. **Capture as KB candidate** — what could prevent this next time?

---

## Integration with existing v1.5.1 pieces

- **`live-publish.yml`** — already enforces backup before live push. This protocol extends the pattern.
- **`safe-push.sh`** — implements snapshot + audit log for theme pushes (Tier A item 1)
- **`project-json-lock.sh`** — atomic project.json updates so audit_log writes are safe
- **`failure-modes.md`** — receives FM-NNN entries when rollbacks happen
- **K4 feedback loop** — recurring rollback patterns become forbidden.md rules

---

## Anti-patterns

1. **"It's just a small change"** — small changes have wiped entire themes. Snapshot anyway.

2. **"I tested it on staging first"** — staging != production. Snapshot prod anyway.

3. **"The snapshot takes too long"** — snapshot pulls take 2-3 min. A wiped theme takes 6+ hours to rebuild. Math.

4. **Snapshotting AFTER the op** — that's not a snapshot, that's a copy of the broken state.

5. **No verification step** — skipping post-op verification means you only find out it's broken when the client emails.

6. **Snapshots stored on the same disk as the original** — if the disk dies, you lose both. Cross-system retention recommended for critical ops.

7. **"We have git, that's our backup"** — git doesn't know about your Shopify remote state. Different layer.

---

Last reviewed: 2026-05-27 by Claude (v1.5.2 Tier A)
Next review due: 2026-08-27
