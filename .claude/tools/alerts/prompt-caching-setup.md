# Anthropic Prompt Caching Setup

> Per A8 — prompt caching is enabled across all agent calls. 90% discount on cached content. Single biggest cost optimization.

---

## What prompt caching does

When you call Claude API with the same prompt prefix repeatedly:
- First call: full price (input tokens billed normally)
- Subsequent calls within 5 minutes: 90% discount on cached portion

The cache key is the literal content prefix of the prompt. As long as the prefix is identical, cache hits.

---

## What to cache in our system

### Always cache (large + stable)
- KB files (e.g., `forbidden.md`, `coding-standards.md`)
- Schema definitions
- Spec documents
- Pattern reference implementations

### Sometimes cache (medium + semi-stable)
- Active project's `project.json` (changes per session, but stable within a turn)
- Sprint brief
- Section maps

### Don't cache (small or unique)
- User input
- Specific PR diffs
- Generated artifacts

---

## How to implement in code

### Using the Messages API

```python
import anthropic

client = anthropic.Anthropic(api_key=os.environ['ANTHROPIC_API_KEY'])

response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=4000,
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "[Large stable content — e.g., KB files, schemas]",
                    # Cache this content
                    "cache_control": {"type": "ephemeral"},
                },
                {
                    "type": "text",
                    "text": "[Dynamic content — e.g., user request, diff]",
                    # Don't cache
                },
            ],
        }
    ]
)
```

### Cache hits in response

```python
# Check how many tokens hit the cache
input_tokens = response.usage.input_tokens
cached_tokens = getattr(response.usage, 'cache_read_input_tokens', 0)

# Calculate actual cost
fresh_input_cost = (input_tokens - cached_tokens) * 0.000003  # $3/M
cached_input_cost = cached_tokens * 0.0000003  # 90% discount
output_cost = response.usage.output_tokens * 0.000015  # $15/M
total = fresh_input_cost + cached_input_cost + output_cost
```

---

## Cache duration

Default: **5 minutes** from last cache hit.

This means:
- Multiple calls within 5 min: subsequent calls cached
- 5+ min gap: cache expires, full price next call

For our agents:
- Code Review Agent: cache hits across PRs reviewed close together
- Frontend Agent in same session: cache hits across sprint work
- Different days: cache misses (acceptable)

---

## Cache strategy per agent

### Code Review Agent
Cache:
- KB files (forbidden.md, coding-standards.md, etc.)
- CODEOWNERS file
- Project conventions

Don't cache:
- Specific PR diff (changes per PR)
- PR metadata

Expected savings: ~60-80% on input costs.

### PM Agent
Cache:
- Spec template
- Clarification question bank
- Risk patterns

Don't cache:
- Specific SOW content
- Specific project data

### Frontend Agent
Cache:
- Pattern library examples (the 3 reference sections)
- Web components reference
- Coding standards

Don't cache:
- Specific section being built
- Design tokens for current project

### Designer Agent
Cache:
- Brand questionnaire
- Design path decisions
- Section pattern library references

Don't cache:
- Specific brand brief
- Industry research findings

---

## When NOT to cache

### When content is small (< 1024 tokens)
Caching overhead may not be worth it. Cache savings only matter on large content.

### When content is highly dynamic
If content changes every call, cache hits are 0% — pointless.

### Across sessions / users
Cache is per-organization. Don't try to share cache across organizations.

---

## Monitoring cache hit rate

In Anthropic Console:
- Usage → Cache hit rate
- Should be > 50% for our agents
- < 50% suggests caching not enabled or content too dynamic

In our scripts:
```python
# In run-code-review.py
cache_hit_rate = cached_tokens / input_tokens
if cache_hit_rate < 0.5:
    print(f"⚠ Cache hit rate low: {cache_hit_rate:.1%}")
```

---

## Effects on our cost estimates

Without caching:
- Code review PR: ~$0.50-1.00
- 30 reviews per project: ~$15-30
- 50 projects/year: $750-1,500

With caching:
- Code review PR: ~$0.10-0.30 (60-70% reduction)
- 30 reviews per project: ~$3-9
- 50 projects/year: $150-450

**Difference: $600-1,000/year saved on code review alone.**

Multiplied across all agent invocations: substantial.

---

## Anti-patterns

1. **Not enabling caching.** Just paying 10x more. Always enable.

2. **Caching dynamic content.** Wastes the cache feature.

3. **Cache content too granularly.** If everything is broken into tiny cache blocks, each one needs separate storage. Combine into larger cacheable chunks.

4. **Not monitoring hit rate.** If caching is enabled but you're not measuring hits, you don't know if it's working.

5. **Stripping cache_control when refactoring.** Re-add when touching agent code.

---

## Future: longer cache TTL

Anthropic may release longer-lived caches (1 hour, 24 hours, etc.) at different price points. When available:
- Use 1-hour cache for KB files
- Use 5-minute cache for project-specific content

Watch Anthropic changelog: https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching

---

Last reviewed: 2026-05-25 by Claude (initial)
Next review due: 2026-08-25
