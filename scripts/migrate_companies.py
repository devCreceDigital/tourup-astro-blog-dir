"""
migrate_companies.py – Migrate companies from old schema to new schema.

OLD schema:  destination: "DISTRICT, PROVINCE" | category: "operador_turismo"
NEW schema:  destinos: ["cusco"] | distribution_role: "tour_operator" | categorias: []

Strategy:
  - Parse YAML frontmatter, add new fields, re-serialize
  - Map province from `destination` → canonical destinos[] using normalize()
  - Map `category` → `distribution_role`

Usage:
    python3 scripts/migrate_companies.py              # dry run
    python3 scripts/migrate_companies.py --write      # actually write
"""
import re, sys, unicodedata
from pathlib import Path
import yaml

SRC = Path("src/content/companies")


def normalize(s):
    """Remove accents/diacritics for matching."""
    nfkd = unicodedata.normalize("NFKD", s)
    return "".join(c for c in nfkd if not unicodedata.combining(c))


# Province → canonical destino slugs (keys are normalized)
PROVINCE_MAP = {
    "cusco": ["cusco"], "lima": ["lima"], "lima province": ["lima"],
    "arequipa": ["arequipa"], "puno": ["puno"], "ica": ["ica"],
    "nazca": ["nazca"], "pisco": ["paracas"], "ancash": ["huaraz"],
    "huaraz": ["huaraz"], "la libertad": ["trujillo"], "trujillo": ["trujillo"],
    "lambayeque": ["chiclayo"], "chiclayo": ["chiclayo"], "piura": ["piura"],
    "talara": ["piura"], "sullana": ["piura"], "loreto": ["iquitos"],
    "maynas": ["iquitos"], "madre de dios": ["puerto_maldonado", "manu"],
    "tambopata": ["puerto_maldonado"], "cajamarca": ["cajamarca"],
    "amazonas": ["chachapoyas"], "chachapoyas": ["chachapoyas"],
    "luya": ["chachapoyas"], "ayacucho": ["ayacucho"], "huamanga": ["ayacucho"],
    "san martin": ["tarapoto"], "moyobamba": ["tarapoto"], "lamas": ["tarapoto"],
    "junin": ["tarma"], "tarma": ["tarma"], "chanchamayo": ["tarma"],
    "huancayo": ["tarma"], "huanuco": [],     "pasco": [],  # not a primary tourist destination "ucayali": [],
    "apurimac": [], "moquegua": [], "tacna": [], "tumbes": [],
    "callao": ["lima"],
}

DIRECT_DEST_MAP = {
    "cusco": "cusco", "lima": "lima", "arequipa": "arequipa",
    "puno": "puno", "ica": "ica", "nazca": "nazca",
    "paracas": "paracas", "huaraz": "huaraz", "trujillo": "trujillo",
    "chiclayo": "chiclayo", "piura": "piura", "iquitos": "iquitos",
    "puerto maldonado": "puerto_maldonado", "cajamarca": "cajamarca",
    "chachapoyas": "chachapoyas", "ayacucho": "ayacucho",
    "tarapoto": "tarapoto", "colca": "colca", "manu": "manu",
    "machu picchu": "machu_picchu",
}

CATEGORY_TO_ROLE = {
    "operador_turismo": "tour_operator",
    "operador turístico": "tour_operator",
    "operador turistico": "tour_operator",
    "retail_travel_agency": "retail_travel_agency",
    "wholesale_travel_agency": "wholesale_travel_agency",
}

WRITE_MODE = "--write" in sys.argv


def extract_destinos(dest_str):
    """Parse old destination string into canonical destino slugs."""
    if not dest_str:
        return []
    dest_str = dest_str.replace('"', "").strip()
    if not dest_str:
        return []

    parts = [p.strip().lower() for p in dest_str.split(",")]

    if len(parts) >= 2:
        province = parts[-1].strip()
        province = province.replace("province", "").replace("region", "").strip()
        prov_key = normalize(province)

        if prov_key in PROVINCE_MAP:
            return PROVINCE_MAP[prov_key]
        if prov_key in DIRECT_DEST_MAP:
            return [DIRECT_DEST_MAP[prov_key]]

        city_key = normalize(parts[0].strip().lower())
        if city_key in DIRECT_DEST_MAP:
            return [DIRECT_DEST_MAP[city_key]]

    key = normalize(parts[0].strip().lower())
    if key in DIRECT_DEST_MAP:
        return [DIRECT_DEST_MAP[key]]

    return []


def infer_categorias(destinos):
    """Assign reasonable default categorias based on destination."""
    base = ["full-day", "tours-culturales", "aventura"]
    dest_specific = {
        "cusco": ["trekking", "arqueologico"],
        "arequipa": ["trekking"],
        "lima": ["gastronomico", "mice"],
        "huaraz": ["trekking"],
        "iquitos": ["selva", "birdwatching"],
        "puerto_maldonado": ["selva", "birdwatching"],
        "manu": ["selva", "birdwatching"],
        "tarapoto": ["selva", "aventura"],
        "piura": ["playa"],
        "ica": ["arqueologico"],
        "nazca": ["arqueologico"],
        "paracas": ["navegacion", "birdwatching"],
    }
    extras = []
    for d in destinos:
        extras.extend(dest_specific.get(d, []))
    seen = set()
    result = []
    for c in base + extras:
        if c not in seen:
            seen.add(c)
            result.append(c)
    return result


def migrate_all():
    files = sorted(SRC.glob("*.md"))
    migrated = 0
    skipped_new = 0
    skipped_no_dest = 0
    errors = []

    for fp in files:
        raw = fp.read_bytes()  # read as bytes to handle encoding issues
        # Decode with utf-8, replacing errors
        try:
            text = raw.decode("utf-8")
        except UnicodeDecodeError:
            text = raw.decode("utf-8", errors="replace")

        m = re.match(r"^---\s*\n(.*?)\n---", text, re.DOTALL)
        if not m:
            errors.append(f"{fp.name}: no frontmatter")
            continue

        frontmatter_raw = m.group(1)
        body = text[m.end():]

        # Check if already has new schema
        if "destinos:" in frontmatter_raw and "distribution_role:" in frontmatter_raw:
            skipped_new += 1
            continue

        # Parse YAML (handle encoding issues in yaml by re-encoding the raw frontmatter)
        try:
            fm = yaml.safe_load(frontmatter_raw)
        except yaml.YAMLError as e:
            errors.append(f"{fp.name}: YAML error: {e}")
            continue

        if not isinstance(fm, dict):
            errors.append(f"{fp.name}: empty frontmatter")
            continue

        # Extract old destination
        old_dest = str(fm.get("destination", "") or "")
        old_cat = str(fm.get("category", "") or "")

        destinos = extract_destinos(old_dest)
        if not destinos:
            skipped_no_dest += 1
            continue

        role = CATEGORY_TO_ROLE.get(normalize(old_cat.lower().strip()), "tour_operator")
        categorias = infer_categorias(destinos)

        # Remove old fields, add new ones
        fm.pop("destination", None)
        fm.pop("category", None)
        fm.pop("agency_class_raw", None)
        fm["destinos"] = destinos
        fm["categorias"] = categorias
        fm["distribution_role"] = role

        # Re-serialize frontmatter preserving order, block style
        new_fm = yaml.safe_dump(
            fm,
            default_flow_style=False,
            allow_unicode=True,
            sort_keys=False,
            width=200,
        ).strip()

        new_content = f"---\n{new_fm}\n---{body}"

        if WRITE_MODE:
            fp.write_text(new_content, encoding="utf-8")
            migrated += 1
        else:
            migrated += 1
            if migrated <= 5:
                print(f"\n=== {fp.name} ===")
                print(f"  old destination: '{old_dest}'")
                print(f"  old category: '{old_cat}'")
                print(f"  destinos -> {destinos}")
                print(f"  role -> {role}")
                print(f"  categorias -> {categorias[:5]}...")

    print(f"\n{'='*60}")
    print(f"Total files: {len(files)}")
    print(f"Migrated: {migrated}")
    print(f"Skipped (already new schema): {skipped_new}")
    print(f"Skipped (no destination match): {skipped_no_dest}")
    print(f"Errors: {len(errors)}")
    if errors:
        for e in errors[:10]:
            print(f"  ERROR: {e}")
    if WRITE_MODE:
        print(f"\nFiles written!")
    else:
        print(f"\nDRY RUN. Use --write to actually write files.")


if __name__ == "__main__":
    migrate_all()
