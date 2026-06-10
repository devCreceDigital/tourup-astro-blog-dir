#!/usr/bin/env python3
"""
brands_to_md.py

Generate Company and ExternalBrand Markdown files from bd_agencias_en.csv + brands-map.yaml.
Creates content/companies/*.md and content/external_brands/*.md files.

Usage:
    python scripts/brands_to_md.py --input bd_agencias_en.csv --brands content/_meta/brands-map.yaml --output content/
"""

import argparse
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description="Generate brand pages from CSV")
    parser.add_argument(
        "--input",
        type=str,
        default="bd_agencias_en.csv",
        help="Input CSV file (agency database)"
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
        default="content/",
        help="Output directory for generated Markdown files"
    )
    args = parser.parse_args()

    # TODO: Load brands-map.yaml
    # TODO: Read CSV (bd_agencias_en.csv) - agency/company database
    # TODO: For each row:
    #   - Look up in brands-map to determine entity type (company/external_brand)
    #   - Extract fields: name, RUC/tax_id, location, contact, etc.
    #   - Generate slug from name or RUC
    #   - Create appropriate frontmatter (companies or external_brands schema)
    #   - Create Markdown body with company description, services, etc.
    #   - Write to content/companies/<slug>.md or content/external_brands/<slug>.md
    # TODO: Support --update flag
    # TODO: Validate that all required frontmatter fields are present

    print(f"TODO: Parse {args.input}")
    print(f"TODO: Load {args.brands}")
    print(f"TODO: Write *.md files to {args.output}")


if __name__ == "__main__":
    main()
