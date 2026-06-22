"""
migrate_prompts_schema.py — Migrate prompts to structured destinos[] / categorias[] schema.

Adds structured entity arrays while keeping flat destination_cluster / category_cluster
fields for backward compatibility. Reuses keyword maps from link_prompts.py.

Usage:
    python3 scripts/migrate_prompts_schema.py              # dry run
    python3 scripts/migrate_prompts_schema.py --write      # write files
    python3 scripts/migrate_prompts_schema.py --write --force  # regenerate even if exists
"""
import re, sys, unicodedata, json
from pathlib import Path
import yaml

SRC = Path("src/content/prompts")

WRITE_MODE = "--write" in sys.argv
FORCE_MODE = "--force" in sys.argv

def normalize(s):
    nfkd = unicodedata.normalize("NFKD", s)
    return "".join(c for c in nfkd if not unicodedata.combining(c)).lower()

DEST_CLUSTER_MAP = {
    "peru_national": ["cusco", "lima", "arequipa", "puno", "ica", "huaraz",
                      "trujillo", "chiclayo", "iquitos", "puerto_maldonado",
                      "cajamarca", "chachapoyas", "tarapoto"],
    "peru": ["cusco", "lima", "arequipa", "puno", "ica", "huaraz",
             "trujillo", "chiclayo", "iquitos", "puerto_maldonado",
             "cajamarca", "chachapoyas", "tarapoto"],
    "cusco": ["cusco"], "lima": ["lima"], "arequipa": ["arequipa"],
    "puno": ["puno"], "ica": ["ica"], "nazca": ["nazca", "ica"],
    "paracas": ["paracas", "ica"], "huaraz": ["huaraz"], "trujillo": ["trujillo"],
    "chiclayo": ["chiclayo"], "piura": ["piura"], "iquitos": ["iquitos"],
    "madre de dios": ["puerto_maldonado", "manu"],
    "machu_picchu": ["machu_picchu", "cusco"], "machu picchu": ["machu_picchu", "cusco"],
    "amazon": ["iquitos", "puerto_maldonado", "tarapoto"],
    "amazon rainforest": ["iquitos", "puerto_maldonado", "tarapoto"],
    "amazonas": ["iquitos", "puerto_maldonado", "chachapoyas", "tarapoto"],
    "lake titicaca": ["puno"], "colca": ["colca", "arequipa"],
    "colca canyon": ["colca", "arequipa"],
}

CAT_CLUSTER_MAP = {
    "tour_companies": ["full-day", "multi-day", "tours-culturales"],
    "tour_operators": ["full-day", "multi-day", "tours-culturales"],
    "adventure": ["aventura", "trekking"], "luxury": ["lujo"],
    "trekking": ["trekking"], "hiking": ["trekking"],
    "cultural": ["tours-culturales", "arqueologico"],
    "family": ["familia", "full-day"], "family travel": ["familia", "full-day"],
    "food": ["gastronomico"], "culinary": ["gastronomico"],
    "birdwatching": ["birdwatching"], "community": ["tours-comunitarios"],
    "community tourism": ["tours-comunitarios"], "wellness": ["bienestar"],
    "photography": ["fotografia"], "multi-day": ["multi-day"],
    "full-day": ["full-day"], "sustainable": ["tours-comunitarios"],
    "eco": ["tours-comunitarios"], "mice": ["mice"],
    "corporate": ["mice"], "educational": ["educativo", "tours-culturales"],
}

KEYWORD_DEST_MAP = {
    "cusco": ["cusco"], "machu picchu": ["machu_picchu", "cusco"],
    "lima": ["lima"], "arequipa": ["arequipa"], "colca": ["colca", "arequipa"],
    "puno": ["puno"], "titicaca": ["puno"], "ica": ["ica"],
    "nazca": ["nazca", "ica"], "paracas": ["paracas", "ica"],
    "huacachina": ["ica"], "huaraz": ["huaraz"], "trujillo": ["trujillo"],
    "chiclayo": ["chiclayo"], "piura": ["piura"], "mancora": ["piura"],
    "iquitos": ["iquitos"], "amazon": ["iquitos", "puerto_maldonado"],
    "tambopata": ["puerto_maldonado"], "manu": ["manu", "puerto_maldonado"],
    "cajamarca": ["cajamarca"], "chachapoyas": ["chachapoyas"],
    "kuelap": ["chachapoyas"], "gocta": ["chachapoyas"],
    "ayacucho": ["ayacucho"], "tarapoto": ["tarapoto"],
}

KEYWORD_CAT_MAP = {
    "trekking": ["trekking"], "hiking": ["trekking"],
    "inca trail": ["trekking"], "adventure": ["aventura", "trekking"],
    "luxury": ["lujo"], "cultural": ["tours-culturales", "arqueologico"],
    "family": ["familia"], "food": ["gastronomico"], "culinary": ["gastronomico"],
    "bird": ["birdwatching"], "birding": ["birdwatching"],
    "community": ["tours-comunitarios"], "sustainable": ["tours-comunitarios"],
    "photography": ["fotografia"], "photo": ["fotografia"],
    "wellness": ["bienestar"], "spa": ["bienestar"],
    "budget": ["full-day", "multi-day"], "affordable": ["full-day", "multi-day"],
    "private": ["lujo", "full-day"], "group": ["multi-day", "full-day"],
    "small group": ["multi-day", "full-day"],
    "multi-day": ["multi-day"], "full-day": ["full-day"],
    "mice": ["mice"], "corporate": ["mice"],
}


def infer_destinos(fm):
    dc = fm.get("destination_cluster", "")
    if dc:
        key = normalize(dc.strip())
        if key in DEST_CLUSTER_MAP:
            return DEST_CLUSTER_MAP[key]
    haystack = f"{fm.get('title', '')} {fm.get('search_term', '')}".lower()
    seen = []
    for kw, dests in KEYWORD_DEST_MAP.items():
        if kw in haystack:
            for d in dests:
                if d not in seen:
                    seen.append(d)
    return seen


def infer_categorias(fm):
    cc = fm.get("category_cluster", "")
    if cc:
        key = normalize(cc.strip())
        if key in CAT_CLUSTER_MAP:
            return CAT_CLUSTER_MAP[key]
    haystack = f"{fm.get('title', '')} {fm.get('search_term', '')}".lower()
    seen = []
    for kw, cats in KEYWORD_CAT_MAP.items():
        if kw in haystack:
            for c in cats:
                if c not in seen:
                    seen.append(c)
    return seen


def migrate_all():
    files = sorted(SRC.glob("*.md"))
    updated = 0
    skipped_has_both = 0
    skipped_parse = 0
    errors = []

    for fp in files:
        text = fp.read_bytes().decode("utf-8", errors="replace")
        m = re.match(r"^---\s*\n(.*?)\n---", text, re.DOTALL)
        if not m:
            errors.append(f"{fp.name}: no frontmatter")
            continue

        frontmatter_raw = m.group(1)
        body = text[m.end():]

        try:
            fm = yaml.safe_load(frontmatter_raw)
        except yaml.YAMLError as e:
            errors.append(f"{fp.name}: YAML error: {e}")
            continue

        if not isinstance(fm, dict):
            skipped_parse += 1
            continue

        has_destinos = "destinos" in fm and fm["destinos"]
        has_categorias = "categorias" in fm and fm["categorias"]

        if has_destinos and has_categorias and not FORCE_MODE:
            skipped_has_both += 1
            continue

        new_fields_added = False

        if not has_destinos or FORCE_MODE:
            inferred = infer_destinos(fm)
            if inferred:
                destinos_entities = [
                    {"entity_type": "destino", "entity_slug": d}
                    for d in inferred
                ]
                fm["destinos"] = destinos_entities
                new_fields_added = True

        if not has_categorias or FORCE_MODE:
            inferred = infer_categorias(fm)
            if inferred:
                categorias_entities = [
                    {"entity_type": "categoria", "entity_slug": c}
                    for c in inferred
                ]
                fm["categorias"] = categorias_entities
                new_fields_added = True

        if not new_fields_added:
            skipped_has_both += 1
            continue

        new_frontmatter = yaml.safe_dump(
            fm, default_flow_style=False, allow_unicode=True, sort_keys=False, width=200
        ).strip()
        new_content = f"---\n{new_frontmatter}\n---{body}"

        if WRITE_MODE:
            fp.write_text(new_content, encoding="utf-8")

        updated += 1
        if updated <= 5 or not WRITE_MODE:
            title = fm.get("title", fp.stem)
            print(f"\n=== {fp.name} ===")
            print(f"  title: {title}")
            print(f"  destination_cluster: {fm.get('destination_cluster', 'N/A')}")
            print(f"  destinos[]: {fm.get('destinos', [])}")
            print(f"  category_cluster: {fm.get('category_cluster', 'N/A')}")
            print(f"  categorias[]: {fm.get('categorias', [])}")

    print(f"\n{'='*60}")
    print(f"Total prompts: {len(files)}")
    print(f"Updated: {updated}")
    print(f"Skipped (already has both): {skipped_has_both}")
    print(f"Skipped (parse error): {skipped_parse}")
    print(f"Errors: {len(errors)}")
    if errors:
        for e in errors[:5]:
            print(f"  ERROR: {e}")
    if WRITE_MODE:
        print("Files written!")
    else:
        print("DRY RUN. Use --write to write files.")


if __name__ == "__main__":
    migrate_all()
