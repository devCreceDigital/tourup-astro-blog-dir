"""
link_prompts.py – Build deterministic brands_ai_mentions for all prompts.

For each prompt without brands_ai_mentions, infer relevant companies based on:
  - destination_cluster → match companies in that destino
  - category_cluster → match companies with that categoria
  - search_term/title → keyword match on company title

Strategy:
  1. Parse all companies → build index by destino and categoria
  2. For each prompt, find matching companies
  3. Write structured brands_ai_mentions with entity_type + entity_slug

Usage:
    python3 scripts/link_prompts.py              # dry run
    python3 scripts/link_prompts.py --write      # write
    python3 scripts/link_prompts.py --write --force  # overwrite existing mentions
"""
import re, sys, unicodedata, json, math
from pathlib import Path
from collections import defaultdict
import yaml

SRC = Path("src/content")
PROMPTS_DIR = SRC / "prompts"
COMPANIES_DIR = SRC / "companies"

WRITE_MODE = "--write" in sys.argv
FORCE_MODE = "--force" in sys.argv

# ── Normalize ─────────────────────────────────────────────────────
def normalize(s):
    nfkd = unicodedata.normalize("NFKD", s)
    return "".join(c for c in nfkd if not unicodedata.combining(c)).lower()


# ── Cluster → canonical slug mapping ──────────────────────────────
# Prompt destination_cluster values → canonical destino slugs
DEST_CLUSTER_MAP = {
    "peru_national": ["cusco", "lima", "arequipa", "puno", "ica", "huaraz",
                      "trujillo", "chiclayo", "iquitos", "puerto_maldonado",
                      "cajamarca", "chachapoyas", "tarapoto"],
    "peru": ["cusco", "lima", "arequipa", "puno", "ica", "huaraz",
             "trujillo", "chiclayo", "iquitos", "puerto_maldonado",
             "cajamarca", "chachapoyas", "tarapoto"],
    "cusco": ["cusco"],
    "lima": ["lima"],
    "arequipa": ["arequipa"],
    "puno": ["puno"],
    "ica": ["ica"],
    "nazca": ["nazca", "ica"],
    "paracas": ["paracas", "ica"],
    "huaraz": ["huaraz"],
    "trujillo": ["trujillo"],
    "chiclayo": ["chiclayo"],
    "piura": ["piura"],
    "iquitos": ["iquitos"],
    "madre de dios": ["puerto_maldonado", "manu"],
    "machu_picchu": ["machu_picchu", "cusco"],
    "machu picchu": ["machu_picchu", "cusco"],
    "amazon": ["iquitos", "puerto_maldonado", "tarapoto"],
    "amazon rainforest": ["iquitos", "puerto_maldonado", "tarapoto"],
    "amazonas": ["iquitos", "puerto_maldonado", "chachapoyas", "tarapoto"],
    "lake titicaca": ["puno"],
    "colca": ["colca", "arequipa"],
    "colca canyon": ["colca", "arequipa"],
}

CAT_CLUSTER_MAP = {
    "tour_companies": ["full-day", "multi-day", "tours-culturales"],
    "tour_operators": ["full-day", "multi-day", "tours-culturales"],
    "adventure": ["aventura", "trekking"],
    "luxury": ["lujo"],
    "trekking": ["trekking"],
    "hiking": ["trekking"],
    "cultural": ["tours-culturales", "arqueologico"],
    "family": ["familia", "full-day"],
    "family travel": ["familia", "full-day"],
    "food": ["gastronomico"],
    "culinary": ["gastronomico"],
    "birdwatching": ["birdwatching"],
    "community": ["tours-comunitarios"],
    "community tourism": ["tours-comunitarios"],
    "wellness": ["bienestar"],
    "photography": ["fotografia"],
    "multi-day": ["multi-day"],
    "full-day": ["full-day"],
    "sustainable": ["tours-comunitarios"],
    "eco": ["tours-comunitarios"],
    "mice": ["mice"],
    "corporate": ["mice"],
    "educational": ["educativo", "tours-culturales"],
}

# ── Keyword → destination mapping (for search_term matching) ──────
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
    "family": ["familia"], "food": ["gastronomico"],
    "culinary": ["gastronomico"], "cooking": ["gastronomico"],
    "bird": ["birdwatching"], "birding": ["birdwatching"],
    "community": ["tours-comunitarios"], "volunteer": ["tours-comunitarios", "educativo"],
    "sustainable": ["tours-comunitarios"],
    "photography": ["fotografia"], "photo": ["fotografia"],
    "wellness": ["bienestar"], "spa": ["bienestar"],
    "solo": ["full-day", "multi-day"],
    "disability": ["full-day"],
    "accessible": ["full-day"],
    "budget": ["full-day", "multi-day"],
    "affordable": ["full-day", "multi-day"],
    "private": ["lujo", "full-day"],
    "group": ["multi-day", "full-day"],
    "small group": ["multi-day", "full-day"],
    "senior": ["full-day", "lujo"],
    "cruise": ["navegacion"],
    "boat": ["navegacion"],
    "train": ["full-day", "lujo"],
    "archaeology": ["arqueologico", "tours-culturales"],
    "archaeological": ["arqueologico", "tours-culturales"],
    "history": ["tours-culturales", "arqueologico"],
    "shopping": ["full-day", "lujo"],
    "night": ["full-day"],
    "short": ["full-day"],
    "multi-day": ["multi-day"],
    "custom": ["multi-day"],
    "customize": ["multi-day"],
    "bespoke": ["lujo", "multi-day"],
    "mice": ["mice"],
    "corporate": ["mice"],
    "business": ["mice"],
}


def get_destinos_from_prompt(fm):
    """Extract canonical destinos from a prompt's metadata."""
    dc = fm.get("destination_cluster", "")
    if dc:
        key = normalize(dc.strip())
        if key in DEST_CLUSTER_MAP:
            return DEST_CLUSTER_MAP[key]

    # Try searching title and search_term for destination keywords
    haystack = f"{fm.get('title', '')} {fm.get('search_term', '')}".lower()
    for kw, dests in KEYWORD_DEST_MAP.items():
        if kw in haystack:
            return dests

    return []


def get_categorias_from_prompt(fm):
    """Extract canonical categorias from a prompt's metadata."""
    cc = fm.get("category_cluster", "")
    if cc:
        key = normalize(cc.strip())
        if key in CAT_CLUSTER_MAP:
            return CAT_CLUSTER_MAP[key]

    # Try searching title and search_term for category keywords
    haystack = f"{fm.get('title', '')} {fm.get('search_term', '')}".lower()
    for kw, cats in KEYWORD_CAT_MAP.items():
        if kw in haystack:
            return cats

    return []


# ── Build company index ───────────────────────────────────────────
def build_company_index():
    """Index companies by destino and categoria."""
    by_destino = defaultdict(list)
    by_categoria = defaultdict(list)
    all_companies = []

    for fp in sorted(COMPANIES_DIR.glob("*.md")):
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

        slug = fp.stem
        title = fm.get("title", slug)
        destinos = fm.get("destinos") or []
        categorias = fm.get("categorias") or []
        rating = fm.get("rating") or 0

        entry = {"slug": slug, "title": title, "rating": rating,
                 "destinos": destinos, "categorias": categorias}
        all_companies.append(entry)

        for d in destinos:
            by_destino[d].append(entry)
        for c in categorias:
            by_categoria[c].append(entry)

    return all_companies, by_destino, by_categoria


def find_companies(prompt_fm, all_companies, by_destino, by_categoria):
    """Find companies relevant to this prompt."""
    target_destinos = get_destinos_from_prompt(prompt_fm)
    target_categorias = get_categorias_from_prompt(prompt_fm)

    if not target_destinos and not target_categorias:
        return []

    # Collect candidates
    candidates = set()
    for d in target_destinos:
        for c in by_destino.get(d, []):
            candidates.add(c["slug"])
    for c in target_categorias:
        for co in by_categoria.get(c, []):
            candidates.add(co["slug"])

    if not candidates:
        return []

    # Score and rank
    slug_info = {c["slug"]: c for c in all_companies}
    scored = []
    for slug in candidates:
        info = slug_info.get(slug, {})
        score = 0
        # Bonus for destino match
        info_destinos = set(info.get("destinos", []))
        for d in target_destinos:
            if d in info_destinos:
                score += 10
        # Bonus for categoria match
        info_cats = set(info.get("categorias", []))
        for c in target_categorias:
            if c in info_cats:
                score += 5
        # Bonus for rating
        score += (info.get("rating") or 0) * 2
        scored.append((score, slug))

    scored.sort(key=lambda x: -x[0])

    # Return top matches (max 10)
    top = scored[:10]
    return top


def link_all():
    # Build index
    print("Building company index...")
    all_companies, by_destino, by_categoria = build_company_index()
    print(f"  Companies indexed: {len(all_companies)}")
    print(f"  By destino: {len(by_destino)} keys")
    print(f"  By categoria: {len(by_categoria)} keys")

    # Process prompts
    prompts = sorted(PROMPTS_DIR.glob("*.md"))
    updated = 0
    skipped_has_mentions = 0
    skipped_no_match = 0
    errors = []

    for fp in prompts:
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
            continue

        # Skip if already has brands_ai_mentions (unless --force)
        existing = fm.get("brands_ai_mentions") or []
        if existing and not FORCE_MODE:
            skipped_has_mentions += 1
            continue

        # Find matching companies
        matches = find_companies(fm, all_companies, by_destino, by_categoria)

        if not matches:
            skipped_no_match += 1
            continue

        # Build structured mentions
        mentions = []
        for score, slug in matches:
            info = {c["slug"]: c for c in all_companies}.get(slug, {})
            mentions.append({
                "name": info.get("title", slug),
                "entity_type": "company",
                "entity_slug": slug,
            })

        # Update frontmatter
        lines = frontmatter_raw.split("\n")
        new_lines = []
        in_mentions = False
        mentions_added = False

        for line in lines:
            # Skip old mentions block entirely
            if line.strip().startswith("brands_ai_mentions:"):
                in_mentions = True
                continue
            if in_mentions:
                if line.strip().startswith("-") or line.strip() == "":
                    continue
                else:
                    in_mentions = False

            new_lines.append(line)

        # Find position to insert (after summary or last_ai_check_date)
        insert_pos = len(new_lines)
        for i, line in enumerate(new_lines):
            if line.startswith("summary:"):
                insert_pos = i + 1
            if line.startswith("last_ai_check_date:"):
                insert_pos = i + 1

        # YAML block for brands_ai_mentions
        mentions_yaml = yaml.safe_dump(
            mentions, default_flow_style=False, allow_unicode=True, sort_keys=False
        ).strip()
        mentions_block = f"brands_ai_mentions:\n"
        for line in mentions_yaml.split("\n"):
            mentions_block += f"  {line}\n"
        mentions_block = mentions_block.rstrip()

        new_lines.insert(insert_pos, mentions_block)

        new_frontmatter = "\n".join(new_lines)
        new_content = f"---\n{new_frontmatter}\n---{body}"

        if WRITE_MODE:
            fp.write_text(new_content, encoding="utf-8")

        updated += 1
        if updated <= 3 or not WRITE_MODE:
            title = fm.get("title", fp.stem)
            print(f"\n=== {fp.name} ===")
            print(f"  title: {title}")
            print(f"  destination_cluster: {fm.get('destination_cluster', 'N/A')}")
            print(f"  category_cluster: {fm.get('category_cluster', 'N/A')}")
            print(f"  matches: {len(matches)} companies")
            for score, slug in matches[:3]:
                info = {c["slug"]: c for c in all_companies}.get(slug, {})
                print(f"    {slug} (score={score})")

    print(f"\n{'='*60}")
    print(f"Total prompts: {len(prompts)}")
    print(f"Updated: {updated}")
    print(f"Skipped (already has mentions): {skipped_has_mentions}")
    print(f"Skipped (no matching companies): {skipped_no_match}")
    print(f"Errors: {len(errors)}")
    if errors:
        for e in errors[:5]:
            print(f"  ERROR: {e}")
    if WRITE_MODE:
        print(f"\nFiles written!")
    else:
        print(f"\nDRY RUN. Use --write to write files. Use --force to overwrite existing mentions.")


if __name__ == "__main__":
    link_all()
