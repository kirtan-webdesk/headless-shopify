---
tier: 2
load_when: ["state-mutation"]
description: "How the orchestrator (and every other agent) reads, writes, and locks `project.json`. Single source of truth, atomically managed."
---

# 04 — State Management

> How the orchestrator (and every other agent) reads, writes, and locks `project.json`. Single source of truth, atomically managed.

---

## The single source of truth

`project.json` lives at `/projects/[client-slug]/project.json`. Schema: `/_contracts/project-json.schema.json`.

Every agent's responsibility:
1. READ `project.json` at start of every turn
2. ACQUIRE lock before any write
3. VALIDATE writes against schema before committing
4. WRITE atomically (write to temp file, rename)
5. VERSION (snapshot to `project.json.versions/`)
6. APPEND to `audit_log`
7. RELEASE lock

Skip any of these steps → state corruption → project breaks.

---

## Lock protocol

### Acquiring lock

```
lock_path = /projects/[client]/project.json.lock

if exists(lock_path):
    lock = read(lock_path)
    if lock.expires_at > now():
        FAIL — "Project locked by [lock.locked_by] until [lock.expires_at]"
    else:
        # Expired lock — safe to take over
        log_warning("Stale lock from [lock.locked_by], taking over")

write(lock_path, {
    "locked_by": "[agent_name_or_user_id]",
    "locked_at": now(),
    "expires_at": now() + 5_minutes
})
```

Lock expiration is **5 minutes**. If an agent's work exceeds 5 minutes, refresh the lock by writing a new `expires_at`. Stale locks (older than expiration) are safe to take over.

### Releasing lock

```
delete(lock_path)
```

Or set lock state to `locked: false` if you keep the file but want to mark released.

### Lock contention

If another agent or user holds the lock and it's not expired:
1. Wait 30 seconds, retry once
2. If still held, surface to developer: "Project locked by [holder] until [time]. Try again or contact [holder]."
3. Do NOT force-acquire (corruption risk)

---

## Reading `project.json`

Every agent's turn starts with:

```
1. Acquire lock (or note: read-only access)
2. Read /projects/[client]/project.json
3. Validate against /_contracts/project-json.schema.json
4. If schema validation fails: HALT — do not proceed with corrupted state
5. Extract relevant sections for your task (don't load everything into context)
6. Release lock if no write planned
```

Read-only operations (status check, audit log review) can skip the lock — but writes always require lock.

---

## Writing `project.json`

### Atomic write pattern

Never overwrite the file directly. Always:

```
1. Read current project.json into memory
2. Apply your changes to the in-memory copy
3. Validate the modified copy against schema — if FAIL, abort
4. Increment project.version by 1
5. Update project.updated_at to current ISO datetime
6. Write to temp file: project.json.tmp
7. Snapshot current file to project.json.versions/[timestamp].json
8. Atomic rename: project.json.tmp → project.json
9. Append audit_log entry describing the change
10. Release lock
```

Step 6-8 ensures no partial writes. If the agent crashes mid-write, the original file is intact.

### Schema validation before write

```
validation_result = validate(modified_project_json, schema)
if not validation_result.ok:
    abort("Schema violation: " + validation_result.errors)
    do NOT write
```

This is mandatory. Schema-invalid state corrupts the entire project.

### Version snapshot

```
snapshot_path = /projects/[client]/project.json.versions/[YYYY-MM-DDTHH-MM-SS].json
copy(project.json, snapshot_path)
```

Snapshots are append-only. Never delete. Disk usage grows but it's small (each project.json is < 50KB typically).

---

## Audit log writes

Every state change appends an entry to `project.json.audit_log[]`. Format:

```json
{
  "timestamp": "2026-05-24T14:32:00Z",
  "actor": "pm-agent",
  "actor_type": "agent",
  "action": "spec_generated",
  "details": {
    "spec_version": 2,
    "deliverable_count": 12,
    "sow_completeness_at_time": 78
  },
  "project_version_before": 5,
  "project_version_after": 6
}
```

Standard actions to log:
- `project_created`
- `sow_received`
- `sow_clarification_requested`
- `spec_generated`
- `spec_revised`
- `milestones_created`
- `estimates_calculated`
- `gate_opened`
- `gate_reminder_sent`
- `gate_escalated`
- `gate_decided`
- `gate_overridden`
- `gate_expired`
- `artifact_created`
- `artifact_revised`
- `agent_invoked`
- `bug_reported`
- `bug_fixed`
- `token_threshold_alert`
- `renegotiation_requested`
- `override_applied`
- `lock_acquired`
- `lock_released`
- `schema_validation_failed`

---

## Project-type dependency graphs

The orchestrator enforces stage prerequisites based on the project type's dependency graph. Defined here per project type:

### Linear flow (new-build, redesign, version-upgrade, version-upgrade-with-redesign)

```
intake → discovery (opt) → spec → planning → design → scaffolding → development → sprint-qa → milestone-qa → pre-launch → launch → handoff
```

No parallel stages. Each stage waits for the previous to gate-pass.

### Parallel-tracks flow (migration, b2b)

```
intake → discovery (opt) → spec → planning →
                                      ├─ Design track ────────→ Frontend dev ──┐
                                      ├─ Data track ──────────→ Data migration ┤→ Parity check → QA → Launch
                                      └─ URL/SEO track ───────→ Redirect map ──┘
```

Three tracks run in parallel. Each track has its own internal stages. Convergence at QA + Launch.

### Iterative flow (headless-build, complex new-build)

```
intake → spec → planning →
   ┌─→ Design ←─┐
   │            │
   ↓            ↑
Architecture ←→ Dev → QA → Launch
```

Design, architecture, and dev can iterate before final lock. Orchestrator enforces convergence before pre-launch gate.

### Stage prerequisite enforcement

```
def can_advance_to(stage):
    project_type = read_project_json().project.project_type
    dep_graph = load_dep_graph(project_type)
    prerequisites = dep_graph.prerequisites_of(stage)
    for prereq in prerequisites:
        if not is_stage_complete(prereq):
            return False
        if not gate_passed(prereq):
            return False
    return True
```

Orchestrator refuses to invoke an agent if `can_advance_to(target_stage) == False`. Reports back to developer with the specific prerequisite that's not met.

---

## Concurrent writes (rare, handled)

If two agents try to write at the same time:
1. First agent acquires lock
2. Second agent's lock attempt fails (lock contention)
3. Second agent waits 30s and retries
4. By then, first agent has released lock
5. Second agent reads the updated `project.json` (NOT the version it had before)
6. Second agent re-applies its intended changes against the new state
7. If conflict (the change doesn't make sense against new state), abort and surface to developer

This is "optimistic concurrency control" pattern. Works because agents are sequential within a session.

---

## State corruption recovery

If `project.json` fails schema validation OR is unreadable:

1. **Do not auto-recreate.** Halt immediately.
2. Surface to developer with specific error: "project.json corrupted at [path]. Schema errors: [list]. Latest snapshot: [path/to/latest/version]."
3. Developer manually restores from `project.json.versions/[timestamp].json`
4. Append `audit_log` entry: `recovery_from_snapshot` with details
5. Resume normal operation

---

## Cross-project state (client memory)

The PM Agent generates `/projects/[client]/client-memory.md` at project closeout. This file:
- Documents client preferences, decisions, what worked, what didn't
- Is referenced by orchestrator when starting NEW projects for the same client
- Lives outside `project.json` (it's a human-readable narrative)
- Persists across projects (not project-scoped)

When the orchestrator starts a new project, it asks: "Have we worked with [client] before? If yes, I'll load client-memory.md from previous projects."

---

Last reviewed: 2026-05-24 by Claude (initial)
Next review due: 2026-08-24
