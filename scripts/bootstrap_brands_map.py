#!/usr/bin/env python3
"""
bootstrap_brands_map.py — Generate brands-map.yaml from CSV + existing companies.

Scans CSV files for brand/company mentions, cross-references against
src/content/companies/*.md titles, and produces a canonical mapping.

Usage:
    python scripts/bootstrap_brands_map.py --input ai_models-*.csv
    python scripts/bootstrap_brands_map.py --input data/*.csv --merge
    python scripts/bootstrap_brands_map.py --list  # list unlinked brands
"""
import argparse, csv, glob, re, sys, unicodedata
from pathlib import Path
from collections import OrderedDict
import yaml

SRC_CONTENT = Path("src/content")
COMPANIES_DIR = SRC_CONTENT / "companies"
EXTERNAL_BRANDS_DIR = SRC_CONTENT / "external_brands"
OUTPUT_PATH = Path("content/_meta/brands-map.yaml")


def normalize(s):
    nfkd = unicodedata.normalize("NFKD", s)
    return "".join(c for c in nfkd if not unicodedata.combining(c)).lower().strip()


def load_companies():
    index = {}
    for fp in COMPANIES_DIR.glob("*.md"):
        text = fp.read_bytes().decode("utf-8", errors="replace")
        m = re.match(r"^---\s*\n(.*?)\n---", text, re.DOTALL)
        if not m:
            continue
        try:
            fm = yaml.safe_load(m.group(1))
        except yaml.YAMLError:
            continue
        if not isinstance(fm, dict):
            continue
        title = fm.get("title", fp.stem)
        slug = fp.stem
        norm = normalize(title)
        index[norm] = {"slug": slug, "title": title, "entity_type": "company"}
    return index


def load_existing_map():
    if OUTPUT_PATH.exists():
        raw = OUTPUT_PATH.read_text(encoding="utf-8")
        return yaml.safe_load(raw) or {}
    return {}


def extract_brands_from_csv(csv_path):
    brands = set()
    try:
        with open(csv_path, encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            for row in reader:
                for key in row:
                    kl = key.lower().strip()
                    if "marca" in kl or "brand" in kl or "company" in kl or "agencia" in kl:
                        val = row[key].strip()
                        if val and val != "-":
                            brands.add(val)
    except Exception as e:
        print(f"  [WARN] Error reading {csv_path}: {e}", file=sys.stderr)
    return brands


def resolve_brand(name, company_index):
    norm = normalize(name)
    if norm in company_index:
        return company_index[norm]
    best = None
    best_score = 0
    for cn, info in company_index.items():
        if norm in cn or cn in norm:
            score = max(len(norm) / len(cn), len(cn) / len(norm))
            if score > best_score:
                best_score = score
                best = info
    if best and best_score > 0.6:
        return best
    return None


def main():
    parser = argparse.ArgumentParser(description="Bootstrap brands mapping from CSV files")
    parser.add_argument("--input", type=str, default="ai_models-*.csv",
                        help="Input CSV file pattern (glob)")
    parser.add_argument("--output", type=str, default=str(OUTPUT_PATH),
                        help="Output YAML file path")
    parser.add_argument("--merge", action="store_true",
                        help="Merge with existing brands-map.yaml")
    parser.add_argument("--list", action="store_true",
                        help="Only list unlinked brands, don't write")
    args = parser.parse_args()

    company_index = load_companies()
    existing = load_existing_map() if args.merge else {}

    csv_files = glob.glob(args.input)
    if not csv_files:
        print(f"No files found matching: {args.input}")
        sys.exit(1)

    all_brands = set()
    for fp in sorted(csv_files):
        print(f"Scanning: {fp}")
        brands = extract_brands_from_csv(fp)
        all_brands.update(brands)
        print(f"  Found {len(brands)} brand names")

    linked = {}
    unlinked = []
    for name in sorted(all_brands):
        resolved = resolve_brand(name, company_index)
        if resolved:
            linked[name] = resolved
        else:
            unlinked.append(name)

    print(f"\nSummary:")
    print(f"  Linked: {len(linked)}")
    print(f"  Unlinked: {len(unlinked)}")
    if unlinked:
        print(f"  Unlinked brands (will become external_brand):")
        for b in unlinked[:20]:
            print(f"    - {b}")
        if len(unlinked) > 20:
            print(f"    ... and {len(unlinked) - 20} more")

    if args.list:
        return

    mapping = dict(existing)
    for name, info in linked.items():
        canonical = info["slug"]
        if canonical not in mapping:
            mapping[canonical] = {
                "name": info["title"],
                "entity_type": "company",
                "slug": canonical,
                "aliases": [name],
            }
        else:
            existing_aliases = mapping[canonical].get("aliases", [])
            if name not in existing_aliases:
                mapping[canonical]["aliases"] = existing_aliases + [name]

    for name in unlinked:
        slug = normalize(name).replace(" ", "-").replace("--", "-").strip("-")
        if slug not in mapping:
            mapping[slug] = {
                "name": name,
                "entity_type": "external_brand",
                "slug": slug,
                "aliases": [name],
            }

    output_dir = Path(args.output).parent
    output_dir.mkdir(parents=True, exist_ok=True)
    with open(args.output, "w", encoding="utf-8") as f:
        yaml.dump(dict(sorted(mapping.items())), f, allow_unicode=True, sort_keys=False,
                  default_flow_style=False, width=200)
    print(f"\nWritten: {args.output} ({len(mapping)} entries)")


if __name__ == "__main__":
    main()
