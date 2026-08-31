#!/usr/bin/env python3
"""
milestone-token-report.py

Per A11 — generates token usage report per milestone.
Reads from project.json's budget.review_costs + agent invocation logs.
Outputs a milestone-specific report for review.

Usage:
  python milestone-token-report.py --project-json [path] --milestone-id M2 --output [report.md]
"""

import argparse
import json
from collections import defaultdict
from pathlib import Path
from datetime import datetime


def load_project_json(path):
    """Load project.json data."""
    return json.loads(Path(path).read_text())


def compute_milestone_costs(project, milestone_id):
    """Aggregate all costs incurred during the milestone window."""
    # Find milestone
    milestone = None
    for m in project.get("milestones", []):
        if m.get("id") == milestone_id:
            milestone = m
            break

    if not milestone:
        return None

    sprints = milestone.get("sprints", [])
    sprint_ids = {s.get("id") for s in sprints}

    # Aggregate costs from audit_log entries that match milestone scope
    audit_log = project.get("audit_log", [])

    # Token costs from review_costs
    review_costs = project.get("budget", {}).get("review_costs", [])

    # Per-sprint breakdown
    by_sprint = defaultdict(lambda: {"reviews": 0, "review_cost_usd": 0, "agent_invocations": 0, "tokens": 0})

    for entry in audit_log:
        if entry.get("actor_type") == "agent":
            details = entry.get("details", {})
            sprint = details.get("sprint_id")
            if sprint in sprint_ids:
                by_sprint[sprint]["agent_invocations"] += 1
                by_sprint[sprint]["tokens"] += details.get("tokens", 0)

    for review in review_costs:
        # Match review to sprint via PR title or commit SHA if available
        # For now, just aggregate
        pass

    return {
        "milestone": milestone,
        "by_sprint": dict(by_sprint),
        "total_reviews": len(review_costs),
        "total_review_cost": sum(r.get("total_cost_usd", 0) for r in review_costs),
    }


def format_report(milestone_data, project):
    """Format the milestone token report as markdown."""
    if not milestone_data:
        return "# Milestone not found\n"

    milestone = milestone_data["milestone"]
    by_sprint = milestone_data["by_sprint"]
    total_reviews = milestone_data["total_reviews"]
    total_review_cost = milestone_data["total_review_cost"]

    body = f"# Milestone Token Report — {milestone.get('name', milestone['id'])}\n\n"
    body += f"**Project:** {project.get('project', {}).get('name', 'Unknown')}\n"
    body += f"**Milestone ID:** {milestone['id']}\n"
    body += f"**Status:** {milestone.get('status', 'unknown')}\n"
    body += f"**Sprints:** {len(milestone.get('sprints', []))}\n\n"

    body += "## Token spending\n\n"

    # Total project budget
    total_budget = project.get("budget", {})
    body += f"- Project token cap: {total_budget.get('token_cap', 'N/A')}\n"
    body += f"- Project tokens used so far: {total_budget.get('token_used', 0)}\n"
    body += f"- Review API spend so far: ${sum(r.get('total_cost_usd', 0) for r in total_budget.get('review_costs', [])):.4f}\n\n"

    # Per-sprint breakdown
    if by_sprint:
        body += "## Per-sprint breakdown\n\n"
        body += "| Sprint | Agent invocations | Reviews | Estimated tokens |\n"
        body += "|--------|------------------:|--------:|------------------:|\n"
        for sprint_id, data in sorted(by_sprint.items()):
            body += f"| {sprint_id} | {data['agent_invocations']} | {data['reviews']} | {data['tokens']} |\n"
        body += "\n"

    # Estimation accuracy
    estimated_hours = milestone.get("estimated_hours", 0)
    actual_hours = sum(s.get("actual_hours", 0) for s in milestone.get("sprints", []))

    if estimated_hours and actual_hours:
        variance = (actual_hours - estimated_hours) / estimated_hours * 100
        body += "## Estimation accuracy\n\n"
        body += f"- Estimated hours: {estimated_hours}\n"
        body += f"- Actual hours: {actual_hours}\n"
        body += f"- Variance: {variance:+.1f}%\n\n"

        if abs(variance) > 25:
            body += f"⚠ Variance > 25% — investigate root cause.\n\n"

    # Bug analysis
    bugs = [b for b in project.get("bugs", []) if b.get("found_in_milestone") == milestone["id"]]
    body += "## Bugs found this milestone\n\n"
    body += f"- P1: {sum(1 for b in bugs if b.get('severity') == 'P1')}\n"
    body += f"- P2: {sum(1 for b in bugs if b.get('severity') == 'P2')}\n"
    body += f"- P3: {sum(1 for b in bugs if b.get('severity') == 'P3')}\n"
    body += f"- P4: {sum(1 for b in bugs if b.get('severity') == 'P4')}\n\n"

    # Quality flags
    body += "## Notes\n\n"
    p2_or_more = sum(1 for b in bugs if b.get("severity") in ["P1", "P2"])
    if p2_or_more > 3:
        body += f"⚠ {p2_or_more} P1/P2 bugs found this milestone (> 3). Possible quality concern — consider retrospective review.\n\n"

    if not by_sprint:
        body += "ℹ Agent invocation data not available in audit log. Token tracking may need to be added.\n\n"

    body += "---\n\n"
    body += f"*Generated: {datetime.utcnow().isoformat()}Z*\n"

    return body


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--project-json", required=True)
    parser.add_argument("--milestone-id", required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    project = load_project_json(args.project_json)
    milestone_data = compute_milestone_costs(project, args.milestone_id)
    report = format_report(milestone_data, project)

    Path(args.output).write_text(report)
    print(f"Report saved to: {args.output}")


if __name__ == "__main__":
    main()
