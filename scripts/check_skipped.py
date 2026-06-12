"""Check why companies were skipped during migration."""
import re
from pathlib import Path

PROVINCE_MAP = {
    "cusco":1,"lima":1,"lima province":1,"arequipa":1,"puno":1,"ica":1,
    "nazca":1,"pisco":1,"ancash":1,"huaraz":1,"la libertad":1,"trujillo":1,
    "lambayeque":1,"chiclayo":1,"piura":1,"talara":1,"sullana":1,"loreto":1,
    "maynas":1,"madre de dios":1,"tambopata":1,"cajamarca":1,"amazonas":1,
    "chachapoyas":1,"luya":1,"ayacucho":1,"huamanga":1,"san martin":1,
    "moyobamba":1,"lamas":1,"junin":1,"tarma":1,"chanchamayo":1,"huancayo":1,
}
DIRECT = {
    "cusco":1,"lima":1,"arequipa":1,"puno":1,"ica":1,"nazca":1,
    "paracas":1,"huaraz":1,"trujillo":1,"chiclayo":1,"piura":1,"iquitos":1,
    "puerto maldonado":1,"cajamarca":1,"chachapoyas":1,"ayacucho":1,
    "tarapoto":1,"colca":1,"manu":1,"machu picchu":1,
}

SRC = Path("src/content/companies")
extras = []
for fp in sorted(SRC.glob("*.md")):
    raw = fp.read_text(encoding="utf-8", errors="replace")
    m = re.match(r"^---\s*\n(.*?)\n---", raw, re.DOTALL)
    if not m:
        continue
    fm = m.group(1)
    if "destinos:" in fm:
        continue
    old_dest = ""
    dm = re.search(r'^destination:\s*"?(.+?)"?\s*$', fm, re.MULTILINE)
    if dm:
        old_dest = dm.group(1).strip()
    parts = [p.strip().lower() for p in old_dest.replace('"', "").split(",")] if old_dest else []
    if len(parts) >= 2:
        prov = parts[-1].strip()
        if prov not in PROVINCE_MAP:
            extras.append((fp.name, old_dest, prov, "province not mapped"))
    elif len(parts) == 1:
        city = parts[0].strip()
        if city not in DIRECT:
            extras.append((fp.name, old_dest, city, "city not in direct map"))
    else:
        extras.append((fp.name, old_dest, "EMPTY", "no destination field"))

# Show destos by frequency
from collections import Counter
unmapped = Counter()
for _, dest, prov, reason in extras:
    unmapped[prov] += 1

print(f"Total unmatched: {len(extras)}")
print(f"\n=== Unique unmatched provinces/cities ===")
for val, count in unmapped.most_common():
    print(f"  {val}: {count}")

print(f"\n=== Sample files ===")
for name, dest, prov, reason in extras[:15]:
    print(f"  {name}: dest='{dest}' -> '{prov}' ({reason})")
