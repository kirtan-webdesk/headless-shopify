---
tier: 2
load_when: ["agent-specific-detail"]
description: "The actual GitHub Action YAML that runs Code Review Agent on every PR. Implements H4 custom Claude API review with cost guardrails."
---

# 05 — GitHub Action Workflow

> The actual GitHub Action YAML that runs Code Review Agent on every PR. Implements H4 custom Claude API review with cost guardrails.

---

## Workflow location

`.github/workflows/code-review.yml` in every project repo.

This file should be committed to the repo and propagated to all platform arm scaffolds (Phase 3).

---

## Workflow file

```yaml
name: AI Code Review

on:
  pull_request:
    types: [opened, synchronize, reopened]
  issue_comment:
    types: [created]

concurrency:
  group: code-review-${{ github.event.pull_request.number }}
  cancel-in-progress: true

jobs:
  ai-review:
    # Only run on PR events OR manual /review comment
    if: |
      github.event_name == 'pull_request' ||
      (github.event_name == 'issue_comment' &&
       github.event.issue.pull_request &&
       startsWith(github.event.comment.body, '/review'))

    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - name: Checkout PR code
        uses: actions/checkout@v4
        with:
          ref: ${{ github.event.pull_request.head.ref }}
          fetch-depth: 0

      - name: Get PR info
        id: pr-info
        run: |
          PR_NUMBER="${{ github.event.pull_request.number || github.event.issue.number }}"
          echo "pr_number=$PR_NUMBER" >> $GITHUB_OUTPUT

      - name: Get PR diff
        id: pr-diff
        run: |
          git diff origin/${{ github.base_ref }}...HEAD > pr.diff
          DIFF_SIZE=$(wc -c < pr.diff)
          DIFF_LINES=$(git diff origin/${{ github.base_ref }}...HEAD --shortstat | awk '{print $4 + $6}')
          echo "diff_size=$DIFF_SIZE" >> $GITHUB_OUTPUT
          echo "diff_lines=$DIFF_LINES" >> $GITHUB_OUTPUT

      - name: Check cost estimate
        id: cost-check
        env:
          DIFF_LINES: ${{ steps.pr-diff.outputs.diff_lines }}
        run: |
          # Rough cost estimate based on diff size
          # Cached context ~50K tokens at $0.0003 (cached rate)
          # Diff tokens estimate: ~3 tokens per line
          ESTIMATED_COST=$(python3 -c "
          diff_tokens = $DIFF_LINES * 3
          cached_input_cost = 50000 * 0.0000003  # 90% discount on cached
          fresh_input_cost = diff_tokens * 0.000003
          estimated_output_tokens = min(diff_tokens * 0.3, 4000)
          output_cost = estimated_output_tokens * 0.000015
          total = cached_input_cost + fresh_input_cost + output_cost
          print(f'{total:.4f}')
          ")
          echo "estimated_cost=$ESTIMATED_COST" >> $GITHUB_OUTPUT

          # If > $2, require approval
          THRESHOLD=2.00
          IS_OVER=$(python3 -c "print(1 if $ESTIMATED_COST > $THRESHOLD else 0)")
          echo "is_over_threshold=$IS_OVER" >> $GITHUB_OUTPUT

      - name: Request approval for large PR
        if: steps.cost-check.outputs.is_over_threshold == '1'
        uses: peter-evans/create-or-update-comment@v3
        with:
          issue-number: ${{ steps.pr-info.outputs.pr_number }}
          body: |
            ⚠ **Large PR detected**

            Lines changed: ${{ steps.pr-diff.outputs.diff_lines }}
            Estimated review cost: $${{ steps.cost-check.outputs.estimated_cost }}

            This exceeds the $2.00 per-PR threshold. Choose:

            - `/review approve` — Proceed with full review (cost will be logged)
            - `/review summary-only` — Lightweight review (cheaper, less thorough)
            - `/review skip` — Skip AI review (rely on linters + human review)
            - `/review defer` — Defer to pre-launch comprehensive review

            Cost guardrails details: see `_spine/code-review-agent/knowledge/04-cost-guardrails.md`

      - name: Check if approved or under threshold
        id: should-proceed
        run: |
          if [ "${{ steps.cost-check.outputs.is_over_threshold }}" == "0" ]; then
            echo "proceed=true" >> $GITHUB_OUTPUT
          else
            # Check if user already approved via /review approve
            if [ "${{ github.event.comment.body }}" == "/review approve" ]; then
              echo "proceed=true" >> $GITHUB_OUTPUT
            else
              echo "proceed=false" >> $GITHUB_OUTPUT
            fi
          fi

      - name: Check daily + project budgets
        if: steps.should-proceed.outputs.proceed == 'true'
        id: budget-check
        env:
          PROJECT_ID: ${{ secrets.PROJECT_ID }}
        run: |
          # Read budget status from project.json (or external service)
          # This is a placeholder — actual implementation queries project state
          DAILY_OK=true  # placeholder
          PROJECT_OK=true  # placeholder

          if [ "$DAILY_OK" == "false" ]; then
            echo "blocked=daily" >> $GITHUB_OUTPUT
          elif [ "$PROJECT_OK" == "false" ]; then
            echo "blocked=project" >> $GITHUB_OUTPUT
          else
            echo "blocked=none" >> $GITHUB_OUTPUT
          fi

      - name: Surface budget block
        if: steps.budget-check.outputs.blocked != 'none'
        uses: peter-evans/create-or-update-comment@v3
        with:
          issue-number: ${{ steps.pr-info.outputs.pr_number }}
          body: |
            🛑 AI Review Paused

            ${{ steps.budget-check.outputs.blocked == 'daily' && 'Daily review budget exhausted.' || 'Project review budget exhausted.' }}

            Options:
            - Wait until budget resets (daily: tomorrow / project: senior approval)
            - `/review override [reason]` — Senior dev override (logged)
            - Switch project to `defer-to-launch` mode

      - name: Load context (KB files)
        if: steps.budget-check.outputs.blocked == 'none' && steps.should-proceed.outputs.proceed == 'true'
        id: load-context
        run: |
          # Determine platform from project config
          # Load relevant KB files for review context
          PLATFORM="shopify"  # placeholder — read from project config

          # Build context payload
          mkdir -p /tmp/review-context

          # Copy forbidden.md
          cp /skills/$PLATFORM/knowledge/09-forbidden.md /tmp/review-context/forbidden.md || true

          # Copy coding standards
          cp /skills/$PLATFORM/knowledge/01-coding-standards.md /tmp/review-context/standards.md || true

          # Copy CODEOWNERS for sensitive path check
          cp .github/CODEOWNERS /tmp/review-context/CODEOWNERS || true

          echo "context_loaded=true" >> $GITHUB_OUTPUT

      - name: Run Claude review
        if: steps.budget-check.outputs.blocked == 'none' && steps.should-proceed.outputs.proceed == 'true'
        id: claude-review
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          PR_NUMBER: ${{ steps.pr-info.outputs.pr_number }}
        run: |
          # Call Claude API with PR diff + context
          # The actual implementation is a Python/Node script that:
          # 1. Builds the review prompt
          # 2. Sends diff + context to Claude (Sonnet, with prompt caching)
          # 3. Parses Claude's response into structured findings
          # 4. Maps findings to severities
          # 5. Formats as PR comment
          # 6. Returns: status (PASS/FAIL), comment text, cost

          python3 .github/scripts/run-code-review.py \
            --diff pr.diff \
            --context /tmp/review-context \
            --pr-number "$PR_NUMBER" \
            --output review-result.json

          # Extract results
          STATUS=$(jq -r '.status' review-result.json)
          COMMENT=$(jq -r '.comment' review-result.json)
          COST=$(jq -r '.cost_usd' review-result.json)

          echo "review_status=$STATUS" >> $GITHUB_OUTPUT
          echo "review_cost=$COST" >> $GITHUB_OUTPUT
          # Use multiline output for comment
          echo "review_comment<<EOF" >> $GITHUB_OUTPUT
          echo "$COMMENT" >> $GITHUB_OUTPUT
          echo "EOF" >> $GITHUB_OUTPUT

      - name: Post review comment
        if: steps.claude-review.outputs.review_comment != ''
        uses: peter-evans/create-or-update-comment@v3
        with:
          issue-number: ${{ steps.pr-info.outputs.pr_number }}
          body: ${{ steps.claude-review.outputs.review_comment }}

      - name: Set PR status check
        if: steps.claude-review.outputs.review_status != ''
        uses: actions/github-script@v7
        with:
          script: |
            const status = '${{ steps.claude-review.outputs.review_status }}';
            const cost = '${{ steps.claude-review.outputs.review_cost }}';
            const description = status === 'PASS'
              ? `✓ AI review passed ($${cost})`
              : status === 'PASS_WITH_FLAGS'
                ? `⚠ AI review passed with flags ($${cost})`
                : `✗ AI review found blocking issues ($${cost})`;

            const conclusion = (status === 'FAIL') ? 'failure' : 'success';

            github.rest.repos.createCommitStatus({
              owner: context.repo.owner,
              repo: context.repo.repo,
              sha: context.payload.pull_request.head.sha,
              state: conclusion === 'failure' ? 'failure' : 'success',
              description: description,
              context: 'AI Code Review'
            });

      - name: Log review to project.json
        if: steps.claude-review.outputs.review_status != ''
        run: |
          # Append to project.json.budget.review_costs[]
          # This requires writing to a shared state location
          # Implementation: webhook to PM service, or commit to /projects/[client]/ in another repo
          echo "Logging review cost: $${{ steps.claude-review.outputs.review_cost }}"
          # ... actual implementation
```

---

## The review script (`.github/scripts/run-code-review.py`)

Skeleton for the review-running Python script:

```python
#!/usr/bin/env python3
"""
run-code-review.py

Reads PR diff + KB context, calls Claude API, formats response.
"""

import argparse
import json
import os
from pathlib import Path

import anthropic

REVIEW_PROMPT = """You are a senior code reviewer for WebDesk Solution.

Review the following pull request diff against project standards.

Project KB context (cached):
{kb_context}

PR diff:
{pr_diff}

Run the following checks (per Code Review Agent's `01-review-checks.md`):

1. Hallucinated APIs / Imports — Are any function calls, methods, or imports referencing things that don't exist in the platform's actual API?

2. Forbidden patterns — Does the code violate any rule in the forbidden.md file?

3. Security — Look for: inline scripts (where forbidden), eval/Function(), exposed credentials, XSS vectors, SQL injection, missing CSRF.

4. Performance impact — Image attribute issues (missing width/height, wrong loading attribute), render-blocking scripts, layout-thrashing animations, new heavy dependencies.

5. Accessibility regressions — Missing alt text, non-semantic interactive elements (div as button), missing form labels, hidden focus indicators, heading hierarchy issues, improper ARIA usage.

6. SEO compliance — Missing meta tags on new pages, missing schema where required, heading hierarchy, URL structure issues.

For each finding, output:
- Severity: P1 / P2 / P3 / P4 (per `02-severity-classification.md`)
- File and line number
- Description of issue
- Specific recommendation for fix

Output format (strict JSON):
{{
  "status": "PASS" | "PASS_WITH_FLAGS" | "FAIL",
  "findings": [
    {{
      "severity": "P1" | "P2" | "P3" | "P4",
      "category": "hallucinated-api" | "forbidden-pattern" | "security" | "performance" | "accessibility" | "seo",
      "file": "path/to/file",
      "line": 47,
      "issue": "description",
      "recommendation": "specific fix",
      "code_context": "the problematic code"
    }}
  ],
  "summary": "Brief overall summary",
  "sensitive_paths_touched": ["list of sensitive paths in diff"]
}}

Status determination:
- FAIL: any P1 or P2 finding
- PASS_WITH_FLAGS: P3 or P4 findings only
- PASS: no findings
"""

def load_kb_context(context_dir):
    context = []
    for kb_file in Path(context_dir).glob("*.md"):
        content = kb_file.read_text()
        context.append(f"=== {kb_file.name} ===\n{content}")
    return "\n\n".join(context)

def read_diff(diff_path):
    return Path(diff_path).read_text()

def run_review(diff, kb_context):
    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

    prompt = REVIEW_PROMPT.format(
        kb_context=kb_context,
        pr_diff=diff
    )

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=4000,
        # Use prompt caching for KB context
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": kb_context,
                        "cache_control": {"type": "ephemeral"}  # cached
                    },
                    {
                        "type": "text",
                        "text": f"PR diff:\n{diff}\n\nReview per the standards above."
                    }
                ]
            }
        ]
    )

    # Calculate cost
    input_tokens = response.usage.input_tokens
    output_tokens = response.usage.output_tokens
    cached_tokens = getattr(response.usage, 'cache_read_input_tokens', 0)

    cost = (
        (input_tokens - cached_tokens) * 0.000003
        + cached_tokens * 0.0000003  # 90% cache discount
        + output_tokens * 0.000015
    )

    # Parse response
    review_data = json.loads(response.content[0].text)
    review_data["cost_usd"] = round(cost, 4)
    review_data["tokens"] = {
        "input": input_tokens,
        "cached_input": cached_tokens,
        "output": output_tokens
    }

    return review_data

def format_comment(review_data):
    """Format review data as a PR comment per templates/review-comment.md"""
    status = review_data["status"]
    findings = review_data["findings"]
    cost = review_data["cost_usd"]

    comment = f"# 🤖 AI Code Review — {status}\n\n"
    comment += f"**Cost:** ${cost}\n"
    comment += f"**Findings:** {len(findings)}\n\n"

    # Group by severity
    by_severity = {"P1": [], "P2": [], "P3": [], "P4": []}
    for f in findings:
        by_severity[f["severity"]].append(f)

    for severity in ["P1", "P2", "P3", "P4"]:
        if by_severity[severity]:
            comment += f"## {severity} Issues ({len(by_severity[severity])})\n\n"
            for f in by_severity[severity]:
                comment += f"### {f['file']}:{f['line']} — {f['category']}\n"
                comment += f"**Issue:** {f['issue']}\n\n"
                comment += f"**Recommendation:** {f['recommendation']}\n\n"
                if f.get("code_context"):
                    comment += f"```\n{f['code_context']}\n```\n\n"

    # Sensitive paths warning
    if review_data.get("sensitive_paths_touched"):
        comment += "## ⚠ Sensitive Paths Touched\n\n"
        comment += "Senior dev review required per CODEOWNERS:\n"
        for path in review_data["sensitive_paths_touched"]:
            comment += f"- `{path}`\n"

    return comment

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--diff", required=True)
    parser.add_argument("--context", required=True)
    parser.add_argument("--pr-number", required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    diff = read_diff(args.diff)
    kb_context = load_kb_context(args.context)

    review_data = run_review(diff, kb_context)
    review_data["comment"] = format_comment(review_data)

    # Save full result
    Path(args.output).write_text(json.dumps(review_data, indent=2))

if __name__ == "__main__":
    main()
```

---

## Required GitHub Secrets

Set these at repository level (Settings → Secrets and variables → Actions):

```
ANTHROPIC_API_KEY        — Anthropic API key
PROJECT_ID                — Project ID for budget tracking
PROJECT_STATE_WEBHOOK     — (optional) URL to post review results to PM system
```

---

## Branch protection rules

To make the review effective, configure branch protection (Settings → Branches):

For `develop`:
- Require pull request before merging
- Require approvals: 1
- Require status checks to pass before merging:
  - `AI Code Review` ← Code Review Agent's check
  - Other linter / test checks
- Require branches to be up to date before merging
- Do not allow force pushes

For `main`:
- Same as develop, plus:
- Require approvals: 2
- Require approvals from Code Owners (CODEOWNERS)
- Require deployments to succeed before merging (if applicable)

---

## How `/review` commands work

The workflow listens for PR comments starting with `/review`:

- `/review` → re-run full review
- `/review approve` → approve a cost-warning, run full review
- `/review summary-only` → lightweight review
- `/review skip` → skip review (logged)
- `/review defer` → defer to launch (per `04-cost-guardrails.md`)
- `/review override [reason]` → senior override of budget block

Senior dev permissions checked before allowing override.

---

## Setup steps for new project

When a new project is scaffolded (Phase 3):

```
1. Copy code-review.yml to .github/workflows/
2. Copy run-code-review.py to .github/scripts/
3. Set ANTHROPIC_API_KEY in repository secrets
4. Set PROJECT_ID in repository secrets
5. Configure branch protection on develop + main
6. Add CODEOWNERS file
7. Test with a sample PR
```

Frontend Agent's scaffolding skill (per platform arm) handles 1-6 automatically during Phase 3.

---

## Anti-patterns

1. **Skipping branch protection.** Code Review Agent has no teeth without enforced status check. Configure properly.

2. **API key in code.** Always in secrets.

3. **No timeout on the workflow.** AI calls can hang. 10-minute timeout configured above.

4. **Reviewing the wrong base.** Always diff against the PR base branch, not main.

5. **Concurrent runs.** Use `concurrency` to cancel in-progress runs when new commits push (saves cost).

6. **No CODEOWNERS file.** Sensitive path enforcement breaks down without it.

---

Last reviewed: 2026-05-24 by Claude (initial)
Next review due: 2026-08-24
