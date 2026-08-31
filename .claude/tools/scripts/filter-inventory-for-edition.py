#!/usr/bin/env python3
"""
filter-inventory-for-edition.py — v1.11.4

Filter the canonical decision-inventory.md down to a single platform edition.

Used at bundle-build time. Master keeps the canonical, unfiltered inventory in
its tree. Each edition bundle gets its own filtered copy with only the
D-codes relevant to that platform + all universal codes.

Categories always included (universal, shared across every edition):
  A, B, C, D (agents/architecture), E (skills/KB), F (gates),
  G (cost), H (code review), I (perf/SEO/A11Y), J (comms/client),
  K (maintenance), TOOL, SOW

Categories included ONLY for their platform's edition:
  NB, VU, B2B, MR — Shopify (only in Shopify edition)
  WP                — WordPress + WooCommerce (only in WP edition)
  BC                — BigCommerce (only in BC edition; not defined yet)
  MG                — Magento / Adobe Commerce (only in Magento edition; not defined yet)

Usage:
  filter-inventory-for-edition.py INPUT_PATH OUTPUT_PATH --edition shopify
  filter-inventory-for-edition.py INPUT_PATH OUTPUT_PATH --edition wordpress
  filter-inventory-for-edition.py INPUT_PATH OUTPUT_PATH --edition full
    (full = canonical, no filtering)
"""

import argparse
import re
import sys
from pathlib import Path

# ---------------------------------------------------------------------------
# Edition → allowed category prefixes
# ---------------------------------------------------------------------------

UNIVERSAL_PREFIXES = [
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K",
    "TOOL", "SOW",
    # D-* codes that are universal (agents, architecture, cross-cutting)
    "D-PM", "D-DES", "D-INT", "D-QA", "D-PLAT", "D-COST",
    "D-TIER", "D-FRONTMATTER", "D-MEMORY",
    "C-HEADLESS",
    "H-MOCKUP",
    "F-G0",
    "G-TIER-F",
    "B-QA",
    "J-FLAG", "J-COMM",
    "I-A11Y", "I-SEO", "I-PERF",
]

PLATFORM_PREFIXES = {
    "shopify": ["D-NB", "D-VU", "D-B2B", "D-MR", "D-SHOP-THEME"],
    "wordpress": ["D-WP"],
    "bigcommerce": ["D-BC"],
    "magento": ["D-MG"],
    "headless": ["D-HL"],
    "full": None,  # no filter
}

# Section headers to preserve/remove based on prefix membership
SHOPIFY_SECTION_HEADERS = [
    "### NB — Shopify New Build",
    "### VU — Shopify Version Upgrade",
    "### B2B — Shopify B2B Wholesale Setup",
    "### MR — Shopify Multi-region / Multi-store Setup",
    "### SHOP-THEME — Shopify arm-level theme strategy",
]

HEADLESS_SECTION_HEADERS = [
    "### HL — Headless",
]

WP_SECTION_HEADERS = [
    "### WP — WordPress + WooCommerce",
]

# ---------------------------------------------------------------------------
# Filtering
# ---------------------------------------------------------------------------

def get_allowed_section_headers(edition):
    """Return list of `### ...` section headers to KEEP for this edition."""
    if edition == "full":
        return None  # all sections kept

    keep = []
    if edition == "shopify":
        keep = SHOPIFY_SECTION_HEADERS
    elif edition == "wordpress":
        keep = WP_SECTION_HEADERS
    elif edition == "bigcommerce":
        keep = []  # no BC sections yet
    elif edition == "magento":
        keep = []  # no Magento sections yet
    elif edition == "headless":
        keep = HEADLESS_SECTION_HEADERS
    return keep


def get_forbidden_section_headers(edition):
    """Return list of `### ...` section headers to REMOVE for this edition."""
    if edition == "full":
        return []  # remove nothing

    all_platform_sections = SHOPIFY_SECTION_HEADERS + WP_SECTION_HEADERS + HEADLESS_SECTION_HEADERS
    keep = get_allowed_section_headers(edition) or []
    return [s for s in all_platform_sections if s not in keep]


def filter_inventory(content, edition):
    """Filter the canonical inventory content down to the edition's D-codes."""
    if edition == "full":
        return content

    forbidden_headers = get_forbidden_section_headers(edition)

    lines = content.split("\n")
    output_lines = []
    skip_section = False

    for line in lines:
        # Check if we're entering a section to skip
        if line.startswith("### "):
            skip_section = any(line.strip().startswith(fh) for fh in forbidden_headers)

        # Check if we're entering a NEW section (any level 2/3 header ends skipping)
        elif line.startswith("## ") or line.startswith("# "):
            skip_section = False

        if not skip_section:
            output_lines.append(line)

    filtered = "\n".join(output_lines)

    # Squash more than 2 consecutive blank lines
    filtered = re.sub(r'\n{4,}', '\n\n\n', filtered)

    return filtered


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    ap = argparse.ArgumentParser(description="Filter decision-inventory.md for a platform edition")
    ap.add_argument("input_path", help="Path to canonical decision-inventory.md")
    ap.add_argument("output_path", help="Path where filtered version will be written")
    ap.add_argument("--edition", choices=["shopify", "wordpress", "bigcommerce", "magento", "headless", "full"], required=True)
    args = ap.parse_args()

    input_path = Path(args.input_path)
    output_path = Path(args.output_path)

    if not input_path.exists():
        print(f"ERROR: input file does not exist: {input_path}", file=sys.stderr)
        sys.exit(1)

    with open(input_path, 'r', encoding='utf-8') as f:
        content = f.read()

    filtered = filter_inventory(content, args.edition)

    # Add a small edition marker at the top
    if args.edition != "full":
        marker = f"\n<!-- v1.11.4+: This inventory has been filtered for the '{args.edition}' edition. Master's canonical inventory (full) has all D-codes. -->\n"
        # Insert after the frontmatter closing ---
        parts = filtered.split("---", 2)
        if len(parts) >= 3:
            filtered = parts[0] + "---" + parts[1] + "---" + marker + parts[2]

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(filtered)

    # Report
    input_lines = content.count("\n")
    output_lines = filtered.count("\n")
    print(f"Filtered inventory:")
    print(f"  Input:   {input_path} ({input_lines} lines)")
    print(f"  Output:  {output_path} ({output_lines} lines)")
    print(f"  Edition: {args.edition}")
    print(f"  Removed: {input_lines - output_lines} lines")

if __name__ == "__main__":
    main()
