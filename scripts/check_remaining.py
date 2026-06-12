"""Check which companies were NOT migrated."""
import re
from pathlib import Path
import yaml

SRC = Path("src/content/companies")
remaining = []

for fp in sorted(SRC.glob("*.md")):
    text = fp.read_bytes().decode("utf-8", errors="replace")
    m = re.match(r"^---\s*\n(.*?)\n---", text, re.DOTALL)
    if not m:
        continue
    fm = yaml.safe_load(m.group(1))
    if not isinstance(fm, dict):
        continue
    has_new = "destinos" in fm and "distribution_role" in fm
    if not has_new:
        remaining.append(fp.name)
        print(fp.name)
        print(f"  destinos: {fm.get('destinos', 'MISSING')}")
        print(f"  distribution_role: {fm.get('distribution_role', 'MISSING')}")
        print(f"  destination: {fm.get('destination', 'MISSING')}")
        print()

print(f"\nRemaining without new schema: {len(remaining)}")
