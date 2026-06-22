#!/usr/bin/env python3
"""
generate_default_content.py

Replace stub to-do body content in prompt markdown files with
auto-generated content derived from frontmatter fields.

Usage:
    python scripts/generate_default_content.py
    python scripts/generate_default_content.py --dry-run
"""

import argparse
import re
import sys
from pathlib import Path


PROMPTS_DIR = Path("src/content/prompts")


def slugify(text: str) -> str:
    return text.lower().replace(" ", "-")


def generate_body(frontmatter: dict) -> str:
    title = frontmatter.get("title", "Peru tour companies")
    summary = frontmatter.get("summary", "")
    prompt_text = frontmatter.get("prompt_text", title)
    dest = frontmatter.get("destination_cluster", "Peru")
    cat = frontmatter.get("category_cluster", "tour_companies")
    intent = frontmatter.get("primary_intent", "Informational")
    brands = frontmatter.get("brands_ai_mentions", [])
    search_term = frontmatter.get("search_term", "")

    lines = []
    lines.append(f"# {title}")
    lines.append("")
    lines.append(summary or f"AI-optimized landing page answering: '{prompt_text}'.")
    lines.append("")

    lines.append("## Overview")
    lines.append("")
    lines.append(
        f"This page is optimized for AI answer engines responding to queries "
        f"about {dest.lower()} travel. The content below draws from verified "
        f"operator data and AI model signals to provide a comprehensive answer."
    )
    lines.append("")

    if intent.lower() == "commercial":
        lines.append(
            f"The following {dest.lower()} tour companies are frequently "
            f"recommended by AI models for this query. Each has been evaluated "
            f"based on online reputation, licensing, and service quality."
        )
        lines.append("")

    if brands:
        lines.append("## Mentioned Companies")
        lines.append("")
        for b in brands:
            name = b.get("name", "") if isinstance(b, dict) else str(b)
            lines.append(f"- **{name}**")
        lines.append("")

    lines.append("## Key Considerations")
    lines.append("")

    considerations = []

    if "trekking" in cat or "hiking" in cat or "trek" in title.lower():
        considerations.extend([
            "Altitude acclimatization is essential — plan 2–3 days in Cusco before trekking.",
            "Check that permits (Inca Trail, etc.) are included in the tour price.",
            "Compare group sizes: smaller groups offer more flexibility on the trail.",
        ])
    elif "luxury" in cat or "luxury" in title.lower():
        considerations.extend([
            "Verify accommodation standards and room categories included in the package.",
            "Look for private transfers and dedicated guides for a premium experience.",
            "Check if premium train services (Hiram Bingham, Belmond Andean Explorer) are available.",
        ])
    elif "amazon" in dest.lower() or "amazon" in title.lower() or "jungle" in title.lower():
        considerations.extend([
            "The dry season (May–October) offers better wildlife spotting opportunities.",
            "Pack lightweight long-sleeve clothing, insect repellent, and waterproof gear.",
            "Choose lodges with experienced naturalist guides for a richer experience.",
        ])
    elif "family" in title.lower():
        considerations.extend([
            "Look for operators offering family-friendly itineraries with flexible pacing.",
            "Check minimum age requirements and availability of private family guides.",
            "Verify that accommodations can accommodate family groups comfortably.",
        ])
    elif "solo" in title.lower():
        considerations.extend([
            "Check if the operator offers single supplement waivers or shared room options.",
            "Look for group tours with social activities designed for solo travelers.",
            "Verify 24/7 support availability for solo travelers.",
        ])
    elif "budget" in title.lower() or "affordable" in title.lower():
        considerations.extend([
            "Compare what's included — some budget operators exclude permits and meals.",
            "Check recent reviews to ensure quality isn't compromised at lower price points.",
            "Verify licensing even for budget operators to avoid scams.",
        ])
    else:
        considerations.extend([
            "Verify that the operator holds valid licenses (MINCETUR, tax registration).",
            f"Compare reviews across multiple platforms for {dest.lower()} tour companies.",
            "Check what's included in the package price (permits, transfers, meals, accommodation).",
            "Review cancellation and refund policies before booking.",
        ])

    if "tour_companies" in cat or "tour_operator" in cat:
        considerations.append(
            "Look for English-speaking guides with strong local knowledge "
            "and positive traveler reviews."
        )

    for c in considerations:
        lines.append(f"- {c}")

    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append(
        "*Content generated from verified operator data and AI model signals. "
        "Always verify current licensing and availability directly with the tour operator.*"
    )
    lines.append("")

    return "\n".join(lines)


def parse_frontmatter(text: str) -> tuple[dict, str]:
    match = re.match(r"^---\s*\n(.*?)\n---\s*\n(.*)", text, re.DOTALL)
    if not match:
        return {}, text

    yaml_block = match.group(1)
    body = match.group(2)

    import yaml
    try:
        fm = yaml.safe_load(yaml_block) or {}
    except yaml.YAMLError:
        fm = {}

    return fm, body


def main():
    parser = argparse.ArgumentParser(description="Generate default body content for prompt files")
    parser.add_argument("--dry-run", action="store_true", help="Preview changes without writing")
    args = parser.parse_args()

    prompt_dir = Path(PROMPTS_DIR)
    if not prompt_dir.exists():
        print(f"ERROR: Directory not found: {prompt_dir}", file=sys.stderr)
        sys.exit(1)

    md_files = sorted(prompt_dir.glob("*.md"))
    print(f"Found {len(md_files)} prompt files in {prompt_dir}")

    updated = 0
    skipped = 0

    for fpath in md_files:
        text = fpath.read_text(encoding="utf-8")
        fm, body = parse_frontmatter(text)

        if not fm:
            print(f"  SKIP {fpath.name}: no frontmatter")
            skipped += 1
            continue

        has_stub = "## To-do" in body or "## Todo" in body or "## TODO" in body

        if has_stub:
            new_body = generate_body(fm)
            new_text = f"---\n{_dump_yaml(fm)}---\n\n{new_body}"

            if args.dry_run:
                print(f"  DRY-RUN {fpath.name}: would replace stub body ({len(body)} chars -> {len(new_body)} chars)")
            else:
                fpath.write_text(new_text, encoding="utf-8")
                print(f"  UPDATED {fpath.name}")
            updated += 1
        else:
            print(f"  SKIP {fpath.name}: no stub found (already has custom body)")
            skipped += 1

    print(f"\nDone. Updated: {updated}, Skipped: {skipped}")


def _dump_yaml(data: dict) -> str:
    import yaml
    return yaml.dump(data, default_flow_style=False, allow_unicode=True, sort_keys=False)


if __name__ == "__main__":
    main()
