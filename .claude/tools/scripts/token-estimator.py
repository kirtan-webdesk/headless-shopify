#!/usr/bin/env python3
"""
token-estimator.py — v1.5.2 Tier D
Reads Claude Code JSONL transcripts and emits token usage estimates.
Updates project.json.token_used with per-session, per-agent, per-task breakdowns.

Usage:
    python3 token-estimator.py --project-dir ./projects/[client] [--session SESSION_ID]
    python3 token-estimator.py --project-dir ./projects/[client] --write-back

Outputs:
    JSON report to stdout
    Optionally updates project.json.token_used (with --write-back)
"""

import argparse
import json
import os
import sys
from pathlib import Path
from datetime import datetime
from collections import defaultdict


# Claude Sonnet 4.6 API rates (USD per 1M tokens)
# Update when rates change
RATES = {
    "input": 3.00,
    "output": 15.00,
    "cache_write": 3.75,
    "cache_read": 0.30,
}


def estimate_tokens_from_jsonl(jsonl_path: Path) -> dict:
    """
    Parses a Claude Code JSONL transcript and extracts token usage.

    JSONL format includes 'usage' fields with token counts per message.
    Falls back to byte-size estimation if 'usage' is missing.
    """
    totals = {
        "input": 0,
        "output": 0,
        "cache_read": 0,
        "cache_write": 0,
        "message_count": 0,
        "estimation_method": "exact",  # or "estimated"
    }

    if not jsonl_path.exists():
        return totals

    with open(jsonl_path) as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                entry = json.loads(line)
            except json.JSONDecodeError:
                continue

            totals["message_count"] += 1

            # Look for usage field in standard locations
            usage = None
            if "usage" in entry:
                usage = entry["usage"]
            elif "message" in entry and isinstance(entry["message"], dict):
                usage = entry["message"].get("usage")
            elif "response" in entry and isinstance(entry["response"], dict):
                usage = entry["response"].get("usage")

            if usage and isinstance(usage, dict):
                totals["input"] += usage.get("input_tokens", 0)
                totals["output"] += usage.get("output_tokens", 0)
                totals["cache_read"] += usage.get("cache_read_input_tokens", 0)
                totals["cache_write"] += usage.get("cache_creation_input_tokens", 0)
            else:
                # Fall back to rough byte-based estimation
                # ~4 chars per token typical
                totals["estimation_method"] = "estimated"
                char_count = len(line)
                token_estimate = char_count // 4
                # Heuristic: split between input/output not knowable here
                totals["input"] += token_estimate // 2
                totals["output"] += token_estimate // 2

    return totals


def calculate_cost(tokens: dict) -> dict:
    """Calculate cost breakdown from token counts."""
    return {
        "input_cost": (tokens["input"] / 1_000_000) * RATES["input"],
        "output_cost": (tokens["output"] / 1_000_000) * RATES["output"],
        "cache_read_cost": (tokens["cache_read"] / 1_000_000) * RATES["cache_read"],
        "cache_write_cost": (tokens["cache_write"] / 1_000_000) * RATES["cache_write"],
    }


def aggregate_session(session_file: Path) -> dict:
    """Aggregate one session's tokens + cost."""
    tokens = estimate_tokens_from_jsonl(session_file)
    costs = calculate_cost(tokens)
    return {
        "session_file": str(session_file),
        "session_id": session_file.stem,
        "tokens": tokens,
        "costs": costs,
        "total_cost": sum(costs.values()),
    }


def find_jsonl_files(project_dir: Path) -> list:
    """Find all JSONL session transcripts in project workspace."""
    candidates = []
    for pattern in ["sessions/*.jsonl", "transcripts/*.jsonl", "*.jsonl"]:
        candidates.extend(project_dir.glob(pattern))
    return sorted(set(candidates))


def update_project_json(project_dir: Path, total_usage: dict) -> bool:
    """Write totals back to project.json.token_used (atomic via temp file)."""
    project_json_path = project_dir / "project.json"
    if not project_json_path.exists():
        print(f"WARN: project.json not found at {project_json_path}", file=sys.stderr)
        return False

    try:
        with open(project_json_path) as f:
            project = json.load(f)
    except json.JSONDecodeError as e:
        print(f"ERROR: project.json malformed: {e}", file=sys.stderr)
        return False

    project["token_used"] = {
        "total_input": total_usage["tokens"]["input"],
        "total_output": total_usage["tokens"]["output"],
        "total_cache_read": total_usage["tokens"]["cache_read"],
        "total_cache_write": total_usage["tokens"]["cache_write"],
        "estimated_cost_usd": total_usage["total_cost"],
        "last_updated": datetime.utcnow().isoformat() + "Z",
        "estimation_method": total_usage["tokens"]["estimation_method"],
        "per_session": total_usage.get("per_session", []),
    }

    # Atomic write
    tmp_path = project_json_path.with_suffix(".json.tmp")
    with open(tmp_path, "w") as f:
        json.dump(project, f, indent=2)
    tmp_path.replace(project_json_path)

    return True


def main():
    parser = argparse.ArgumentParser(description="Estimate Claude token usage from JSONL transcripts.")
    parser.add_argument("--project-dir", required=True, help="Path to project workspace")
    parser.add_argument("--session", help="Specific session ID to analyze (optional)")
    parser.add_argument("--write-back", action="store_true", help="Write totals to project.json.token_used")
    parser.add_argument("--json", action="store_true", help="Emit JSON output (otherwise human-readable)")
    args = parser.parse_args()

    project_dir = Path(args.project_dir)
    if not project_dir.is_dir():
        print(f"ERROR: project dir not found: {project_dir}", file=sys.stderr)
        sys.exit(1)

    # Find all session transcripts
    session_files = find_jsonl_files(project_dir)
    if args.session:
        session_files = [f for f in session_files if args.session in f.stem]

    if not session_files:
        print(f"WARN: no JSONL session files found in {project_dir}", file=sys.stderr)
        sys.exit(0)

    sessions = [aggregate_session(f) for f in session_files]

    # Total across all sessions
    totals = {
        "input": sum(s["tokens"]["input"] for s in sessions),
        "output": sum(s["tokens"]["output"] for s in sessions),
        "cache_read": sum(s["tokens"]["cache_read"] for s in sessions),
        "cache_write": sum(s["tokens"]["cache_write"] for s in sessions),
        "message_count": sum(s["tokens"]["message_count"] for s in sessions),
        "estimation_method": "estimated" if any(s["tokens"]["estimation_method"] == "estimated" for s in sessions) else "exact",
    }
    total_costs = calculate_cost(totals)
    total_cost = sum(total_costs.values())

    summary = {
        "project_dir": str(project_dir),
        "session_count": len(sessions),
        "tokens": totals,
        "costs": total_costs,
        "total_cost": total_cost,
        "per_session": [
            {"session_id": s["session_id"], "tokens": s["tokens"], "total_cost": s["total_cost"]}
            for s in sessions
        ],
        "rates_used": RATES,
        "generated_at": datetime.utcnow().isoformat() + "Z",
    }

    # Optional write-back
    if args.write_back:
        success = update_project_json(project_dir, summary)
        if not success:
            print("WARN: write-back failed", file=sys.stderr)

    # Output
    if args.json:
        print(json.dumps(summary, indent=2))
    else:
        print(f"Token Usage — {project_dir.name}")
        print(f"Sessions analyzed: {len(sessions)}")
        print(f"Method: {totals['estimation_method']}")
        print(f"")
        print(f"  Input tokens:        {totals['input']:>15,}")
        print(f"  Output tokens:       {totals['output']:>15,}")
        print(f"  Cache read tokens:   {totals['cache_read']:>15,}")
        print(f"  Cache write tokens:  {totals['cache_write']:>15,}")
        print(f"  Message count:       {totals['message_count']:>15,}")
        print(f"")
        print(f"  Input cost:        ${total_costs['input_cost']:>10.2f}")
        print(f"  Output cost:       ${total_costs['output_cost']:>10.2f}")
        print(f"  Cache read cost:   ${total_costs['cache_read_cost']:>10.2f}")
        print(f"  Cache write cost:  ${total_costs['cache_write_cost']:>10.2f}")
        print(f"  --------")
        print(f"  TOTAL:             ${total_cost:>10.2f}")
        print(f"")
        if totals["cache_read"] > 100_000_000:
            print("⚠  HIGH cache read tokens — consider tiered KB loading (v1.5.2 Tier F)")
        if total_cost > 200:
            print(f"⚠  Project cost over $200 — review optimization opportunities")


if __name__ == "__main__":
    main()
