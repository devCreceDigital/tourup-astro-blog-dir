#!/usr/bin/env python3
"""
prompts_to_md.py

Generate Markdown prompt landing pages from AI prompt CSVs + brands-map.yaml.
Creates content/prompts/*.md files with frontmatter and body content.

Usage:
    python scripts/prompts_to_md.py --input ai_models-*.csv --brands content/_meta/brands-map.yaml --output content/prompts/
"""

import argparse
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description="Generate prompt landing pages from CSV")
    parser.add_argument(
        "--input",
        type=str,
        default="ai_models-*.csv",
        help="Input CSV file pattern"
    )
    parser.add_argument(
        "--brands",
        type=str,
        default="content/_meta/brands-map.yaml",
        help="Path to brands-map.yaml"
    )
    parser.add_argument(
        "--output",
        type=str,
        default="content/prompts/",
        help="Output directory for generated Markdown files"
    )
    args = parser.parse_args()

    # TODO: Load brands-map.yaml and parse it
    # TODO: Read CSV rows (one prompt per row)
    # TODO: For each prompt:
    #   - Extract brand mentions and resolve using brands-map
    #   - Generate slug from prompt text or search_term
    #   - Create frontmatter with all required fields
    #   - Create Markdown body with answer, brand links, etc.
    #   - Write to content/prompts/<slug>.md
    # TODO: Support --update flag to overwrite existing files

    print(f"TODO: Parse {args.input}")
    print(f"TODO: Load {args.brands}")
    print(f"TODO: Write *.md files to {args.output}")


if __name__ == "__main__":
    main()
