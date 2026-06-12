"""
publish_assets.py – Generate sitemaps, /ai/*.md, and agent artifacts.

Run from project root:
    python3 scripts/publish_assets.py

Generates:
    - public/sitemap-companies.xml
    - public/sitemap-destinos.xml
    - public/sitemap-prompts.xml
    - public/sitemap-index.xml
    - public/ai/*.md (per destination, per category)
"""
import re, os, json
from pathlib import Path
from collections import defaultdict
import yaml

SRC = Path("src/content")
PUBLIC = Path("public")
AI_DIR = PUBLIC / "ai"
SITE = "https://tourup.co"


# ── Helpers ──────────────────────────────────────────────────────
def parse_yaml(fp):
    raw = fp.read_bytes().decode("utf-8", errors="replace")
    m = re.match(r"^---\s*\n(.*?)\n---", raw, re.DOTALL)
    if not m:
        return {}
    try:
        return yaml.safe_load(m.group(1)) or {}
    except yaml.YAMLError:
        return {}


# ── Sitemaps ─────────────────────────────────────────────────────
def generate_sitemaps():
    # Companies
    companies = sorted(SRC.glob("companies/*.md"))
    comp_urls = []
    for fp in companies:
        slug = fp.stem
        comp_urls.append(f"""  <url>
    <loc>{SITE}/empresas/{slug}/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>""")
    comp_xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{chr(10).join(comp_urls)}
</urlset>"""
    (PUBLIC / "sitemap-companies.xml").write_text(comp_xml, encoding="utf-8")
    print(f"  sitemap-companies.xml: {len(companies)} URLs")

    # Destinos
    destinos = sorted(SRC.glob("destinos/*.md"))
    dest_urls = []
    for fp in destinos:
        slug = fp.stem
        dest_urls.append(f"""  <url>
    <loc>{SITE}/en/peru/{slug}/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>""")
        # Categoria pages
        dest_urls.append(f"""  <url>
    <loc>{SITE}/en/peru/{slug}/tours/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>""")
    dest_xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{chr(10).join(dest_urls)}
</urlset>"""
    (PUBLIC / "sitemap-destinos.xml").write_text(dest_xml, encoding="utf-8")
    print(f"  sitemap-destinos.xml: {len(destinos)} destinos + category pages")

    # Prompts
    prompts = sorted(SRC.glob("prompts/*.md"))
    prompt_urls = []
    for fp in prompts:
        slug = fp.stem
        prompt_urls.append(f"""  <url>
    <loc>{SITE}/en/ai-prompts/{slug}/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>""")
    prompt_xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{chr(10).join(prompt_urls)}
</urlset>"""
    (PUBLIC / "sitemap-prompts.xml").write_text(prompt_xml, encoding="utf-8")
    print(f"  sitemap-prompts.xml: {len(prompts)} URLs")

    # Index
    index_xml = """<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://tourup.co/sitemap-companies.xml</loc>
    <lastmod>2026-06-10</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://tourup.co/sitemap-destinos.xml</loc>
    <lastmod>2026-06-10</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://tourup.co/sitemap-prompts.xml</loc>
    <lastmod>2026-06-10</lastmod>
  </sitemap>
</sitemapindex>"""
    (PUBLIC / "sitemap-index.xml").write_text(index_xml, encoding="utf-8")
    print(f"  sitemap-index.xml: 3 sub-sitemaps")


# ── /ai/*.md files ───────────────────────────────────────────────
def generate_ai_files():
    AI_DIR.mkdir(parents=True, exist_ok=True)

    # ─ Overvie w ─
    overview = """# TourUp — B2B Peru Travel Marketplace

TourUp conecta agencias emisoras con operadores receptivos peruanos verificados, eliminando intermediarios en la cadena de distribución turística.

## Platform facts

- Verified tour operators: ~985
- Active destinations: 20
- Tour categories: 18
- Coverage: all regions of Peru
- Average operator rating: 4.2/5

## How it works

1. Agency registers on TourUp (free)
2. Searches by destination, category, rating, capacity
3. Gets matched shortlist with verified operators
4. Contacts operators directly for net rates

## Key destinations
- Cusco (Machu Picchu, Sacred Valley, Inca Trail)
- Lima (gastronomy, MICE, coastal)
- Arequipa (Colca Canyon, white city)
- Puno (Lake Titicaca)
- Ica / Nazca / Paracas (Nazca Lines, desert)
- Huaraz (trekking, Huascaran)
- Iquitos / Puerto Maldonado (Amazon rainforest)
"""
    (AI_DIR / "overview.md").write_text(overview, encoding="utf-8")

    # ─ Per-destination AI files ─
    for fp in sorted(SRC.glob("destinos/*.md")):
        fm = parse_yaml(fp)
        name = fm.get("name", fp.stem)
        slug = fp.stem

        # Count companies in this destino
        companies_in_dest = []
        for cfp in sorted(SRC.glob("companies/*.md")):
            cfm = parse_yaml(cfp)
            destinos = cfm.get("destinos") or []
            if slug in destinos:
                companies_in_dest.append({
                    "slug": cfp.stem,
                    "title": cfm.get("title", cfp.stem),
                    "rating": cfm.get("rating", 0),
                    "reviews_count": cfm.get("reviews_count", 0),
                    "b2b_profile": cfm.get("b2b_profile", ""),
                })

        # Get categories in this destino
        cats_in_dest = []
        for cfp in sorted(SRC.glob(f"categorias_destino/{slug}-*.md")):
            cfm = parse_yaml(cfp)
            if cfm:
                cats_in_dest.append({
                    "slug": cfp.stem,
                    "categoria": cfm.get("categoria", ""),
                    "name": cfm.get("name", ""),
                })

        content = f"""# {name} — B2B tour operator guide (Peru)

{name} es un destino turístico clave en Perú. Esta guía proporciona información estructurada para agencias B2B que buscan operadores receptivos verificados en {name}.

## Key facts

- Verified operators on TourUp: {len(companies_in_dest)}
- Main categories: {', '.join(c['categoria'] for c in cats_in_dest[:5])}
- Average rating: {sum(c['rating'] for c in companies_in_dest if c['rating']) / max(len([c for c in companies_in_dest if c['rating']]), 1):.1f}/5

## Tour categories available in {name}

{chr(10).join(f'- **{c["categoria"]}**: {c["name"]}' for c in cats_in_dest[:8])}

## Featured operators in {name}

{chr(10).join(f'- [{c["title"]}]({SITE}/empresas/{c["slug"]}/) — Rating: {c["rating"]}/5' + (f' — {c["b2b_profile"][:80]}' if c["b2b_profile"] else '') for c in sorted(companies_in_dest, key=lambda x: -(x['rating'] or 0))[:15])}

## Frequently asked questions for agencies

### How do I find verified operators in {name}?
Use TourUp's Partner Scout to filter by rating, capacity, languages, and B2B client types. All listed operators have verified MINCETUR licenses.

### What types of operators are available in {name}?
Operators include receptive tour operators, DMCs, retail agencies, and wholesalers, each serving different B2B needs.

### How do I get net rates for {name}?
Register on TourUp as a verified agency and contact operators directly for net rates and availability.

## Full directory

See the complete verified directory: {SITE}/en/peru/{slug}/tours/
"""
        (AI_DIR / f"peru-{slug}.md").write_text(content, encoding="utf-8")
        print(f"  ai/peru-{slug}.md: {len(companies_in_dest)} companies")

    # ─ Category AI files ─
    categories_info = {
        "trekking": "Trekking y caminatas",
        "tours-culturales": "Tours culturales",
        "lujo": "Tours de lujo",
        "tours-comunitarios": "Turismo comunitario",
        "birdwatching": "Observación de aves",
        "gastronomico": "Turismo gastronómico",
        "aventura": "Turismo de aventura",
        "full-day": "Tours full day",
        "multi-day": "Tours multi-día",
        "familia": "Turismo familiar",
        "mice": "Turismo corporativo (MICE)",
    }
    for cat_slug, cat_name in categories_info.items():
        # Find companies offering this category
        comps = []
        for cfp in sorted(SRC.glob("companies/*.md")):
            cfm = parse_yaml(cfp)
            if cat_slug in (cfm.get("categorias") or []):
                comps.append({
                    "slug": cfp.stem,
                    "title": cfm.get("title", cfp.stem),
                    "rating": cfm.get("rating", 0),
                })
        content = f"""# {cat_name} en Peru — Guía B2B para agencias

Guía estructurada sobre {cat_name.lower()} en Perú para agencias emisoras y compradores B2B.

## Key facts

- Operators offering this category: {len(comps)}
- Available in: {', '.join(fp.stem for fp in sorted(SRC.glob('destinos/*.md'))[:5])} and more

## Featured operators

{chr(10).join(f'- [{c['title']}]({SITE}/empresas/{c['slug']}/) — Rating: {c['rating']}/5' for c in sorted(comps, key=lambda x: -(x['rating'] or 0))[:10])}

## How this category works for B2B

Agencies can filter by this category on TourUp to find operators with verified expertise in {cat_name.lower()}.
"""
        (AI_DIR / f"{cat_slug}.md").write_text(content, encoding="utf-8")
        print(f"  ai/{cat_slug}.md: {len(comps)} companies")

    # ─ Guides ─
    guides = {
        "como-trabajar-con-operadores-peru": """# Cómo trabajar con operadores turísticos en Perú — Guía B2B

## Steps
1. Verify MINCETUR license
2. Check rating and reviews
3. Request net rates
4. Sign service agreement
5. Confirm group details
6. Coordinate logistics

## Key considerations
- Average response time: < 2 hours for top operators
- Net rates are 30-50% below retail
- Most operators accept USD payments
- Cancellation policies vary by operator
""",
        "validar-operadores-peru": """# Cómo validar operadores turísticos en Perú

## Verification checklist
- [ ] MINCETUR license (verify on MINCETUR portal)
- [ ] RUC (tax ID) active in SUNAT
- [ ] Rating above 4.0 on verified platforms
- [ ] Response time under 2 hours
- [ ] Active liability insurance
- [ ] Physical office in Peru
""",
        "precios-tours-peru-2026": """# Precios de tours en Perú 2026 — Guía B2B

## Estimated net rates (per person, USD)

| Tour type | Budget | Standard | Premium |
|-----------|--------|----------|---------|
| Full day Cusco | $45-65 | $65-90 | $90-150 |
| Inca Trail 4D | $350-500 | $500-700 | $700-1200 |
| Amazon lodge 3D | $300-450 | $450-650 | $650-1000 |
| Colca Canyon 2D | $80-120 | $120-180 | $180-300 |

*Prices are net B2B rates for agencies. Retail prices are typically 2-3x higher.*
""",
    }
    for slug, body in guides.items():
        (AI_DIR / f"{slug}.md").write_text(body, encoding="utf-8")
        print(f"  ai/{slug}.md: guide")

    print(f"\n  Total AI files: {len(list(AI_DIR.glob('*.md')))}")


if __name__ == "__main__":
    os.makedirs(PUBLIC, exist_ok=True)
    print("=== Generating sitemaps ===")
    generate_sitemaps()
    print("\n=== Generating /ai/*.md files ===")
    generate_ai_files()
    print("\nDone!")
