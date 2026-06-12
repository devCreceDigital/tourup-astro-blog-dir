"""Find the one company that didn't match during migration."""
import re, unicodedata
from pathlib import Path
import yaml


def normalize(s):
    nfkd = unicodedata.normalize("NFKD", s)
    return "".join(c for c in nfkd if not unicodedata.combining(c))


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
    "huancayo": ["tarma"], "huanuco": [], "pasco": [], "ucayali": [],
    "apurimac": [], "moquegua": [], "tacna": [], "tumbes": [], "callao": ["lima"],
}
DIRECT = {
    "cusco": "cusco", "lima": "lima", "arequipa": "arequipa",
    "puno": "puno", "ica": "ica", "nazca": "nazca",
    "paracas": "paracas", "huaraz": "huaraz", "trujillo": "trujillo",
    "chiclayo": "chiclayo", "piura": "piura", "iquitos": "iquitos",
    "puerto maldonado": "puerto_maldonado", "cajamarca": "cajamarca",
    "chachapoyas": "chachapoyas", "ayacucho": "ayacucho",
    "tarapoto": "tarapoto", "colca": "colca", "manu": "manu",
    "machu picchu": "machu_picchu",
}

SRC = Path("src/content/companies")
for fp in sorted(SRC.glob("*.md")):
    raw = fp.read_bytes()
    text = raw.decode("utf-8", errors="replace")
    m = re.match(r"^---\s*\n(.*?)\n---", text, re.DOTALL)
    if not m:
        continue
    fm = yaml.safe_load(m.group(1))
    if not isinstance(fm, dict):
        continue
    if "destinos" in fm and "distribution_role" in fm:
        continue
    old_dest = str(fm.get("destination", "") or "")
    parts = [p.strip().lower() for p in old_dest.replace('"', "").split(",")] if old_dest else []
    if not parts:
        print(f"{fp.name}: NO destination")
        continue
    found = False
    if len(parts) >= 2:
        prov = normalize(parts[-1].strip().replace("province", "").replace("region", "").strip())
        if prov in PROVINCE_MAP:
            found = True
        elif prov in DIRECT:
            found = True
        elif normalize(parts[0].strip().lower()) in DIRECT:
            found = True
    elif len(parts) == 1:
        if normalize(parts[0].strip().lower()) in DIRECT:
            found = True
    if not found:
        print(f"{fp.name}: dest=\"{old_dest}\" parts={parts}")
