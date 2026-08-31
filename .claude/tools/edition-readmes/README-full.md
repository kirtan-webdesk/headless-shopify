# WebDesk AI Delivery System — v1.11.11 (Full Release)

> Canonical bundle. All platforms + all tooling + full inventory. Multi-platform teams, onboarding, reference.
>
> For per-platform lean bundles (smaller context footprint), use one of:
> - `webdesk-shopify-v1.11.11.zip`
> - `webdesk-wp-elementor-v1.11.11.zip`
> - `webdesk-spine-only-v1.11.11.zip`

v1.11.11 highlights:
- **E5 fix (release gate wired)** — `tools/scripts/ship-bundle.sh` now runs integrity check before any zip is copied to outputs. Prevents stub-README regressions.
- **E6 fix (spine genericized)** — canonical spine files no longer contain platform-specific worked examples. Cascade worked examples moved to each platform arm's `knowledge/00-overview.md`. QA agent SKILL uses universal CRITICAL categories.
- **E7 fix (integrity check extended)** — `verify-edition-integrity.sh` now scans spine files for file-path references to non-installed platform arms (dangling loads). Fails hard.
- Bonus: `tools/edition-readmes/` registry replaces inline `cat > README.md` in packaging (prevents template regressions).

See `docs/release-notes/v1.11.11.md` for full details.
