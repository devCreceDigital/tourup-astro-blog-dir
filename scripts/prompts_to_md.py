#!/usr/bin/env python3
"""
prompts_to_md.py — Generate Markdown prompt landing pages from AI prompt CSVs.

Pipeline steps 1-5 from arqui02.md.md:
  1. Read & validate CSV
  2. Normalize each row
  3. Infer entities (destinos, categorias, brands)
  4. Create frontmatter
  5. Write structured .md file

Usage:
    python scripts/prompts_to_md.py --input ai_models-chatgpt.csv
    python scripts/prompts_to_md.py --input data/*.csv --dry-run
    python scripts/prompts_to_md.py --input data/*.csv --brands content/_meta/brands-map.yaml --write
"""
import argparse, csv, glob, re, sys, unicodedata
from pathlib import Path
import yaml

SRC_CONTENT = Path("src/content")
PROMPTS_DIR = SRC_CONTENT / "prompts"
DEFAULT_BRANDS_MAP = Path("content/_meta/brands-map.yaml")

INTENT_MAP = {
    "commercial": "commercial", "compra": "commercial", "buy": "commercial",
    "informational": "informational", "info": "informational", "información": "informational",
    "navigational": "navigational", "navegación": "navigational",
    "transactional": "transactional", "transacción": "transactional", "transaccional": "transactional",
}

PLATFORM_MAP = {
    "chatgpt": "ChatGPT", "gpt": "ChatGPT", "openai": "ChatGPT",
    "gemini": "Gemini", "bard": "Gemini", "google": "Gemini",
    "claude": "Claude", "anthropic": "Claude",
    "perplexity": "Perplexity", "pplx": "Perplexity",
}

DEST_CLUSTER_MAP = {
    "peru": ["cusco", "lima", "arequipa", "puno", "ica", "huaraz",
             "trujillo", "chiclayo", "iquitos", "puerto_maldonado",
             "cajamarca", "chachapoyas", "tarapoto"],
    "cusco": ["cusco"], "lima": ["lima"], "arequipa": ["arequipa"],
    "puno": ["puno"], "ica": ["ica"], "nazca": ["nazca", "ica"],
    "paracas": ["paracas", "ica"], "huaraz": ["huaraz"],
    "trujillo": ["trujillo"], "chiclayo": ["chiclayo"], "piura": ["piura"],
    "iquitos": ["iquitos"], "machu picchu": ["machu_picchu", "cusco"],
    "amazon": ["iquitos", "puerto_maldonado", "tarapoto"],
    "lake titicaca": ["puno"], "colca": ["colca", "arequipa"],
}

CAT_CLUSTER_MAP = {
    "tour_companies": ["full-day", "multi-day", "tours-culturales"],
    "tour_operators": ["full-day", "multi-day", "tours-culturales"],
    "adventure": ["aventura", "trekking"], "luxury": ["lujo"],
    "trekking": ["trekking"], "cultural": ["tours-culturales", "arqueologico"],
    "family": ["familia", "full-day"], "food": ["gastronomico"],
    "birdwatching": ["birdwatching"], "community": ["tours-comunitarios"],
    "wellness": ["bienestar"], "photography": ["fotografia"],
    "multi-day": ["multi-day"], "full-day": ["full-day"],
    "sustainable": ["tours-comunitarios"], "mice": ["mice"],
}

KEYWORD_DEST_MAP = {
    "cusco": ["cusco"], "machu picchu": ["machu_picchu", "cusco"],
    "lima": ["lima"], "arequipa": ["arequipa"], "colca": ["colca", "arequipa"],
    "puno": ["puno"], "titicaca": ["puno"], "ica": ["ica"],
    "nazca": ["nazca", "ica"], "paracas": ["paracas", "ica"],
    "amazon": ["iquitos", "puerto_maldonado"],
}

KEYWORD_CAT_MAP = {
    "trekking": ["trekking"], "adventure": ["aventura", "trekking"],
    "luxury": ["lujo"], "cultural": ["tours-culturales"],
    "family": ["familia"], "food": ["gastronomico"], "culinary": ["gastronomico"],
    "bird": ["birdwatching"], "photo": ["fotografia"],
    "wellness": ["bienestar"], "budget": ["full-day", "multi-day"],
    "group": ["multi-day"], "private": ["lujo", "full-day"],
}


def normalize(s):
    nfkd = unicodedata.normalize("NFKD", s)
    return "".join(c for c in nfkd if not unicodedata.combining(c)).lower()


def make_slug(text):
    slug = normalize(text)
    slug = re.sub(r"[^a-z0-9]+", "-", slug)
    slug = slug.strip("-")
    return slug[:80]


def load_brands_map(path):
    if path and path.exists():
        raw = path.read_text(encoding="utf-8")
        data = yaml.safe_load(raw) or {}
        return data
    return {}


def infer_destinos(title, search_term, platform_text, brand_names):
    dc_keywords = {
        "cusco": ["cusco", "cuzco", "sacred valley", "valle sagrado"],
        "lima": ["lima"],
        "arequipa": ["arequipa"],
        "puno": ["puno", "titicaca"],
        "ica": ["ica", "nazca", "paracas", "huacachina"],
        "machu_picchu": ["machu picchu"],
        "iquitos": ["iquitos", "amazon"],
    }
    haystack = f"{title} {search_term}".lower()
    found = []
    for dest, keywords in dc_keywords.items():
        for kw in keywords:
            if kw in haystack and dest not in found:
                found.append(dest)
    if not found and platform_text:
        for raw_dest, slugs in DEST_CLUSTER_MAP.items():
            if normalize(raw_dest) in haystack:
                for s in slugs:
                    if s not in found:
                        found.append(s)
    if not found:
        found = ["cusco", "lima", "arequipa"]
    return found


def infer_categorias(title, search_term, platform_text, brand_names):
    haystack = f"{title} {search_term}".lower()
    found = []
    for kw, cats in KEYWORD_CAT_MAP.items():
        if kw in haystack:
            for c in cats:
                if c not in found:
                    found.append(c)
    if not found:
        found = ["full-day", "multi-day", "tours-culturales"]
    return found


def infer_intent(row):
    raw = ""
    for key in ["intención", "intencion", "intent", "primary_intent", "primary intent"]:
        for k in row:
            if k.lower().strip() == key:
                raw = row[k]
                break
    raw_clean = normalize(raw.strip()) if raw else ""
    mapped = INTENT_MAP.get(raw_clean)
    if mapped:
        return mapped
    title_raw = row.get("Prompt", row.get("prompt", row.get("title", "")))
    if any(w in title_raw.lower() for w in ["best", "top", "compare", "review", "vs"]):
        return "commercial"
    if any(w in title_raw.lower() for w in ["what", "how", "why", "when", "where", "which"]):
        return "informational"
    return "commercial"


def infer_secondary_intent(row, primary):
    raw = ""
    for key in ["secondary_intent", "secondary intent", "intención secundaria"]:
        for k in row:
            if k.lower().strip() == key:
                raw = row[k]
                break
    raw_clean = normalize(raw.strip()) if raw else ""
    mapped = INTENT_MAP.get(raw_clean)
    if mapped and mapped != primary:
        return mapped
    if primary == "commercial":
        return "informational"
    return "commercial"


def infer_platforms(row):
    platforms = []
    for key in ["Plataforma", "plataforma", "platform", "ai_platform", "llm_platform"]:
        for k in row:
            if k.lower().strip() == key.lower().strip():
                val = row[k].strip()
                if val:
                    mapped = PLATFORM_MAP.get(normalize(val), val.title())
                    platforms.append(mapped)
    if not platforms:
        platforms = ["ChatGPT"]
    return platforms


def parse_brands(row, brands_map):
    brands = []
    seen_columns = set()
    for key in ["Marcas", "marcas", "brands", "Brands", "brand", "company"]:
        for k in row:
            if k is not None and k.lower().strip() == key.lower().strip() and k not in seen_columns:
                seen_columns.add(k)
                raw = row[k].strip()
                if raw and raw != "-":
                    parts = [b.strip() for b in raw.split(",") if b.strip()]
                    for p in parts:
                        found = False
                        for entry in brands_map.values():
                            aliases = entry.get("aliases", [entry.get("name", "")])
                            if isinstance(aliases, str):
                                aliases = [aliases]
                            if any(normalize(p) == normalize(a) for a in aliases):
                                brands.append({
                                    "name": entry.get("name", p),
                                    "entity_type": entry.get("entity_type", "unknown"),
                                    "entity_slug": entry.get("slug", make_slug(p)),
                                })
                                found = True
                                break
                        if not found:
                            brands.append({
                                "name": p,
                                "entity_type": "unknown",
                                "entity_slug": make_slug(p),
                            })
    return brands


def generate_body(title, destinos, categorias, brands):
    dest_names = ", ".join(d.replace("_", " ").title() for d in destinos)
    brand_list = "\n".join(f"- **{b['name']}**" for b in brands[:10])
    return f"""# {title}

Landing page answering the AI search prompt: '{title}', focused on Peru tour companies and related travel brands in {dest_names}.

## Overview

This page is optimized for AI answer engines responding to queries about peru travel. The content below draws from verified operator data and AI model signals to provide a comprehensive answer.

The following peru tour companies are frequently recommended by AI models for this query. Each has been evaluated based on online reputation, licensing, and service quality.

## Mentioned Companies

{brand_list}

## Key Considerations

- Compare what's included — some budget operators exclude permits and meals.
- Check recent reviews to ensure quality isn't compromised at lower price points.
- Verify licensing even for budget operators to avoid scams.
- Look for English-speaking guides with strong local knowledge and positive traveler reviews.

---

*Content generated from verified operator data and AI model signals. Always verify current licensing and availability directly with the tour operator.*"""


def process_row(row, brands_map, output_dir, dry_run, force=False):
    title = row.get("Prompt", row.get("prompt", row.get("title", ""))).strip()
    if not title:
        print("  [SKIP] No title/prompt column found")
        return

    search_term = row.get("Search Term", row.get("Término de búsqueda", row.get("search_term", row.get("search term", ""))))
    slug = make_slug(title)
    primary = infer_intent(row)
    secondary = infer_secondary_intent(row, primary)
    platforms = infer_platforms(row)
    brands = parse_brands(row, brands_map)
    destinos = infer_destinos(title, search_term, str(platforms), [b["name"] for b in brands])
    categorias = infer_categorias(title, search_term, str(platforms), [b["name"] for b in brands])

    destinos_structured = [{"entity_type": "destino", "entity_slug": d} for d in destinos]
    categorias_structured = [{"entity_type": "categoria", "entity_slug": c} for c in categorias]

    fm = {
        "type": "prompt_landing",
        "slug": f"/en/ai-prompts/{slug}/",
        "title": title,
        "lang": "en",
        "search_term": search_term or "",
        "ai_platforms": platforms,
        "prompt_text": title,
        "primary_intent": primary,
        "secondary_intent": secondary,
        "destination_cluster": destinos[0].replace("_", " ").title() if destinos else "Peru",
        "category_cluster": categorias[0].replace("-", "_") if categorias else "tour_companies",
        "destinos": destinos_structured,
        "categorias": categorias_structured,
        "summary": f"Landing page answering the AI search prompt: '{title}', focused on Peru tour companies and related travel brands.",
        "parent": "/en/peru/",
    }

    if brands:
        fm["brands_ai_mentions"] = brands

    body = generate_body(title, destinos, categorias, brands)

    frontmatter_yaml = yaml.safe_dump(fm, default_flow_style=False, allow_unicode=True,
                                       sort_keys=False, width=200).strip()
    content = f"---\n{frontmatter_yaml}\n---\n\n{body}\n"

    output_path = output_dir / f"{slug}.md"

    if output_path.exists() and not force:
        print(f"  [EXISTS] {slug}.md (use --force to overwrite)")
        return

    if dry_run:
        print(f"\n  [DRY RUN] {slug}.md")
        print(f"    title: {title}")
        print(f"    destinos: {destinos}")
        print(f"    categorias: {categorias}")
        print(f"    brands: {len(brands)}")
        print(f"    platform: {platforms}")
        print(f"    intent: {primary} / {secondary}")
        return

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(content, encoding="utf-8")
    print(f"  [OK] {slug}.md")


def main():
    parser = argparse.ArgumentParser(description="Generate prompt landing pages from CSV")
    parser.add_argument("--input", type=str, default="ai_models-*.csv",
                        help="Input CSV file pattern")
    parser.add_argument("--brands", type=str, default=str(DEFAULT_BRANDS_MAP),
                        help="Path to brands-map.yaml")
    parser.add_argument("--output", type=str, default=str(PROMPTS_DIR),
                        help="Output directory for generated Markdown files")
    parser.add_argument("--dry-run", action="store_true",
                        help="Validate without writing files")
    parser.add_argument("--write", action="store_true",
                        help="Actually write files")
    parser.add_argument("--force", action="store_true",
                        help="Overwrite existing files")
    args = parser.parse_args()

    brands_map = load_brands_map(Path(args.brands) if args.brands else None)
    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)

    csv_files = glob.glob(args.input)
    if not csv_files:
        print(f"No files found matching: {args.input}")
        sys.exit(1)

    total = 0
    created = 0
    skipped_exists = 0

    for fp in sorted(csv_files):
        print(f"\nProcessing: {fp}")
        try:
            with open(fp, encoding="utf-8-sig") as f:
                reader = csv.DictReader(f)
                rows = list(reader)
        except Exception as e:
            print(f"  [ERROR] Could not read {fp}: {e}")
            continue

        print(f"  Rows: {len(rows)}")
        for row in rows:
            total += 1
            title = row.get("Prompt", row.get("prompt", row.get("title", ""))).strip()
            if not title:
                continue
            slug = make_slug(title)
            output_path = output_dir / f"{slug}.md"
            if output_path.exists() and not args.force:
                skipped_exists += 1
                continue
            process_row(row, brands_map, output_dir, not args.write or args.dry_run, force=args.force)
            if args.write and not args.dry_run:
                created += 1

    print(f"\n{'='*60}")
    print(f"Total rows: {total}")
    if args.write and not args.dry_run:
        print(f"Created: {created}")
    print(f"Skipped (exists): {skipped_exists}")
    if not args.write or args.dry_run:
        print("DRY RUN. Use --write to write files.")


if __name__ == "__main__":
    main()
