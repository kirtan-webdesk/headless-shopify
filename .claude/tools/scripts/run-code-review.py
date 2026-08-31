#!/usr/bin/env python3
"""
run-code-review.py

Code Review Agent's Claude API review script.
Runs in GitHub Actions on every PR.
Per H4 + _spine/code-review-agent/knowledge/05-github-action-workflow.md

Inputs:
  --diff: path to PR diff file
  --context: path to KB context directory
  --pr-number: GitHub PR number
  --output: where to write structured result JSON

Outputs:
  JSON file with:
    - status: PASS | PASS_WITH_FLAGS | FAIL
    - findings: array of structured findings (severity, file, line, issue, recommendation)
    - comment: formatted markdown for PR comment
    - cost_usd: API cost incurred
"""

import argparse
import json
import os
import sys
from pathlib import Path

try:
    import anthropic
except ImportError:
    print("ERROR: anthropic package required. Install: pip install anthropic")
    sys.exit(1)

# Per-PR cost threshold from cost guardrails (H4)
PER_PR_THRESHOLD_USD = 2.00
MAX_OUTPUT_TOKENS = 4000

REVIEW_PROMPT = """You are the Code Review Agent for WebDesk Solution.

Review the following pull request diff against project standards. Your output is structured JSON only.

## Project KB context (cached)

{kb_context}

## PR diff

```diff
{pr_diff}
```

## Your task

Run these checks against the diff (per Code Review Agent's review-checks):

1. **Hallucinated APIs / Imports** — Are any function calls, methods, or imports referencing things that don't exist in the platform's actual API?

2. **Forbidden patterns** — Does the code violate any rule in forbidden.md? Reference rule ID (e.g., LIQ-001, JS-003, etc.)

3. **Security** — Look for: inline scripts (where forbidden), eval/Function(), exposed credentials, XSS vectors, SQL injection, missing CSRF tokens.

4. **Performance impact** — Image attribute issues (missing width/height, wrong loading attribute), render-blocking scripts, layout-thrashing animations, new heavy dependencies.

5. **Accessibility regressions** — Missing alt text, non-semantic interactive elements (div as button), missing form labels, hidden focus indicators, heading hierarchy issues, improper ARIA usage.

6. **SEO compliance** — Missing meta tags on new pages, missing schema where required, heading hierarchy, URL structure issues.

For each finding:
- severity: P1 / P2 / P3 / P4
- category: hallucinated-api / forbidden-pattern / security / performance / accessibility / seo
- file: path/to/file
- line: line number
- issue: description (1-2 sentences)
- recommendation: specific fix (with code snippet if helpful)

Severity classification:
- P1: Critical — code will fail in production OR severe security risk (hallucinated APIs, exposed credentials, eval())
- P2: Major — forbidden pattern violation, security risk, accessibility violation, render-blocking, missing schema where required
- P3: Minor — best practice violation, optimization opportunity, missing OG tags
- P4: Polish — style preference, naming, polish

## Output format (strict JSON only, no other text)

{{
  "status": "PASS" | "PASS_WITH_FLAGS" | "FAIL",
  "findings": [
    {{
      "severity": "P1",
      "category": "hallucinated-api",
      "file": "sections/aurora-cart.liquid",
      "line": 23,
      "issue": "Description of the issue",
      "recommendation": "Specific fix with code"
    }}
  ],
  "summary": "Brief overall summary (1-3 sentences)",
  "sensitive_paths_touched": ["list of sensitive paths in diff per CODEOWNERS"]
}}

Status determination:
- "FAIL": any P1 OR P2 finding
- "PASS_WITH_FLAGS": only P3 or P4 findings
- "PASS": no findings

If you find nothing wrong, status is PASS with empty findings array. Don't manufacture findings.
"""


def load_kb_context(context_dir):
    """Load all .md files from context directory as concatenated text."""
    if not Path(context_dir).exists():
        return "(no KB context loaded)"

    sections = []
    for kb_file in sorted(Path(context_dir).glob("*.md")):
        content = kb_file.read_text(encoding='utf-8')
        sections.append(f"=== {kb_file.name} ===\n{content}")

    if not sections:
        return "(no KB context loaded — files not found)"

    return "\n\n".join(sections)


def estimate_cost(input_tokens, output_tokens, cached_tokens=0):
    """Estimate cost in USD per Anthropic Sonnet pricing (input $3/M, output $15/M, cached 90% off)."""
    fresh_input_cost = (input_tokens - cached_tokens) * 0.000003
    cached_input_cost = cached_tokens * 0.0000003  # 90% discount
    output_cost = output_tokens * 0.000015
    return round(fresh_input_cost + cached_input_cost + output_cost, 4)


def run_review(diff, kb_context, model="claude-sonnet-4-6"):
    """Call Claude API with diff + KB context. Return structured review."""
    client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

    if not os.environ.get("ANTHROPIC_API_KEY"):
        return {
            "status": "FAIL",
            "findings": [],
            "summary": "ERROR: ANTHROPIC_API_KEY not configured in GitHub Secrets.",
            "sensitive_paths_touched": [],
            "cost_usd": 0,
            "error": "missing_api_key",
        }

    # Use prompt caching for KB context
    messages = [
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": REVIEW_PROMPT.format(
                        kb_context=kb_context,
                        pr_diff=diff[:50000],  # Cap diff size to prevent runaway costs
                    ),
                    # Cache the prompt + KB context (90% discount on subsequent reviews)
                    "cache_control": {"type": "ephemeral"},
                }
            ],
        }
    ]

    try:
        response = client.messages.create(
            model=model,
            max_tokens=MAX_OUTPUT_TOKENS,
            messages=messages,
        )

        # Get token counts
        input_tokens = response.usage.input_tokens
        output_tokens = response.usage.output_tokens
        cached_tokens = getattr(response.usage, "cache_read_input_tokens", 0)

        # Calculate cost
        cost = estimate_cost(input_tokens, output_tokens, cached_tokens)

        # Parse response (should be JSON)
        raw_text = response.content[0].text.strip()

        # Strip markdown code fences if Claude wraps the JSON
        if raw_text.startswith("```"):
            raw_text = raw_text.split("```")[1]
            if raw_text.startswith("json"):
                raw_text = raw_text[4:]
            raw_text = raw_text.strip()

        review_data = json.loads(raw_text)
        review_data["cost_usd"] = cost
        review_data["tokens"] = {
            "input": input_tokens,
            "cached_input": cached_tokens,
            "output": output_tokens,
        }

        return review_data

    except json.JSONDecodeError as e:
        return {
            "status": "FAIL",
            "findings": [],
            "summary": f"ERROR: Could not parse Claude's response as JSON: {e}",
            "sensitive_paths_touched": [],
            "cost_usd": 0,
            "raw_response": raw_text[:1000] if 'raw_text' in dir() else "(not available)",
            "error": "json_parse_error",
        }
    except Exception as e:
        return {
            "status": "FAIL",
            "findings": [],
            "summary": f"ERROR: API call failed: {e}",
            "sensitive_paths_touched": [],
            "cost_usd": 0,
            "error": str(e),
        }


def format_comment(review_data):
    """Format review data as PR comment markdown."""
    status = review_data.get("status", "UNKNOWN")
    findings = review_data.get("findings", [])
    cost = review_data.get("cost_usd", 0)
    summary = review_data.get("summary", "")
    sensitive = review_data.get("sensitive_paths_touched", [])

    body = f"# 🤖 AI Code Review — {status}\n\n"
    body += f"**Cost:** ${cost:.4f}\n"
    body += f"**Findings:** {len(findings)}\n\n"

    if summary:
        body += f"## Summary\n\n{summary}\n\n"

    if findings:
        # Group by severity
        by_severity = {"P1": [], "P2": [], "P3": [], "P4": []}
        for f in findings:
            sev = f.get("severity", "P4")
            by_severity.setdefault(sev, []).append(f)

        for severity in ["P1", "P2", "P3", "P4"]:
            if by_severity.get(severity):
                body += f"## {severity} Issues ({len(by_severity[severity])})\n\n"
                for finding in by_severity[severity]:
                    file = finding.get("file", "?")
                    line = finding.get("line", "?")
                    category = finding.get("category", "?")
                    issue = finding.get("issue", "")
                    recommendation = finding.get("recommendation", "")

                    body += f"### {file}:{line} — {category}\n\n"
                    body += f"**Issue:** {issue}\n\n"
                    body += f"**Recommendation:** {recommendation}\n\n"
                    body += "---\n\n"

    if sensitive:
        body += "## ⚠ Sensitive Paths Touched\n\n"
        body += "These paths require senior dev review per CODEOWNERS:\n"
        for path in sensitive:
            body += f"- `{path}`\n"
        body += "\n"

    body += "---\n\n"
    body += "_Reviewed by Code Review Agent (Claude Sonnet). "
    body += f"Status: **{status}**._\n"

    return body


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--diff", required=True)
    parser.add_argument("--context", required=True)
    parser.add_argument("--pr-number", required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    # Read diff
    diff = Path(args.diff).read_text(encoding='utf-8') if Path(args.diff).exists() else ""

    # Load KB context
    kb_context = load_kb_context(args.context)

    # Run review
    print(f"Running review on PR #{args.pr_number}...")
    review_data = run_review(diff, kb_context)

    # Format PR comment
    review_data["comment"] = format_comment(review_data)

    # Save result
    Path(args.output).write_text(json.dumps(review_data, indent=2))
    print(f"Review complete. Status: {review_data.get('status')}. Cost: ${review_data.get('cost_usd', 0):.4f}")
    print(f"Result saved to: {args.output}")


if __name__ == "__main__":
    main()
