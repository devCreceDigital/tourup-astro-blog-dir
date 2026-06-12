"""Analyze current graph state: destinos, categorias, roles, prompts"""
import yaml, glob, re, json, sys
from pathlib import Path

SRC = Path("src/content")

# ── Companies ─────────────────────────────────────────────────────
company_destinos = {}
company_categorias = {}
roles = {}
new_schema = 0
old_schema = 0
companies_with_categorias = 0

for fp in glob.glob(str(SRC / "companies" / "*.md")):
    c = Path(fp).read_text(encoding="utf-8", errors="replace")
    m = re.match(r"^---\s*\n(.*?)\n---", c, re.DOTALL)
    if not m:
        continue
    fm = yaml.safe_load(m.group(1))
    if not fm:
        continue

    if fm.get("destinos"):
        new_schema += 1
        for d in fm["destinos"]:
            if d:
                key = d.lower().strip()
                company_destinos[key] = company_destinos.get(key, 0) + 1
    if fm.get("categorias"):
        companies_with_categorias += 1
        for c in fm["categorias"]:
            if c:
                key = c.lower().strip()
                company_categorias[key] = company_categorias.get(key, 0) + 1
    if fm.get("distribution_role"):
        r = fm["distribution_role"]
        roles[r] = roles.get(r, 0) + 1

    if fm.get("destination"):
        old_schema += 1
        dest = str(fm["destination"]).strip().upper()
        parts = dest.split(",")
        city = parts[0].strip().lower()
        company_destinos[city] = company_destinos.get(city, 0) + 1

    if fm.get("category"):
        cat = str(fm["category"]).strip().lower()
        company_categorias[cat] = company_categorias.get(cat, 0) + 1

total = new_schema + old_schema
print(f"Total company files: {total}")
print(f"New schema (destinos[]): {new_schema}")
print(f"Old schema (destination): {old_schema}")
print(f"Companies with categorias[]: {companies_with_categorias}")
print(f"Companies with distribution_role: {len(roles)}")
print()

# ── Existing content files ────────────────────────────────────────
existing_destinos = {Path(fp).stem for fp in glob.glob(str(SRC / "destinos" / "*.md"))}
existing_categorias = {Path(fp).stem for fp in glob.glob(str(SRC / "categorias_destino" / "*.md"))}
existing_prompts = {Path(fp).stem for fp in glob.glob(str(SRC / "prompts" / "*.md"))}

print(f"Existing destino files: {len(existing_destinos)} -> {sorted(existing_destinos)}")
print(f"Existing categoria_destino files: {len(existing_categorias)} -> {sorted(existing_categorias)}")
print(f"Existing prompt files: {len(existing_prompts)}")
print()

# ── Top destinos from companies ───────────────────────────────────
print("=== DESTINOS from companies (top 50) ===")
for d, count in sorted(company_destinos.items(), key=lambda x: -x[1])[:50]:
    exists = "(exists)" if d in existing_destinos else "(MISSING)"
    print(f"  {d}: {count} {exists}")

print()
print("=== CATEGORIAS from companies (all) ===")
for c, count in sorted(company_categorias.items(), key=lambda x: -x[1]):
    # Check if any categoria_destino file references this category
    ref_files = []
    for fp in glob.glob(str(SRC / "categorias_destino" / "*.md")):
        txt = Path(fp).read_text(encoding="utf-8", errors="replace")
        if f"categoria: {c}" in txt or f"categoria: \"{c}\"" in txt:
            ref_files.append(Path(fp).stem)
    exists = f"(refs: {ref_files})" if ref_files else "(MISSING)"
    print(f"  {c}: {count} {exists}")

print()
print("=== ROLES ===")
for r, count in sorted(roles.items(), key=lambda x: -x[1]):
    print(f"  {r}: {count}")

print()

# ── Prompts with brands_ai_mentions ──────────────────────────────
with_mentions = 0
with_structured = 0
empty_structured = 0
total_prompts = 0

for fp in glob.glob(str(SRC / "prompts" / "*.md")):
    c = Path(fp).read_text(encoding="utf-8", errors="replace")
    m = re.match(r"^---\s*\n(.*?)\n---", c, re.DOTALL)
    if not m:
        continue
    fm = yaml.safe_load(m.group(1))
    if not fm:
        continue
    total_prompts += 1
    mentions = fm.get("brands_ai_mentions") or []
    if mentions:
        with_mentions += 1
        has_entity_slug = any(
            isinstance(m, dict) and m.get("entity_slug")
            for m in mentions
        )
        if has_entity_slug:
            with_structured += 1
        else:
            empty_structured += 1

print(f"Total prompts: {total_prompts}")
print(f"With brands_ai_mentions: {with_mentions}")
print(f"  - with entity_slug (structured): {with_structured}")
print(f"  - without entity_slug: {empty_structured}")
print(f"Missing mentions entirely: {total_prompts - with_mentions}")

# ── Existing graph state ─────────────────────────────────────────
graph_path = Path("graphify-out/graph.json")
if graph_path.exists():
    graph = json.loads(graph_path.read_text(encoding="utf-8"))
    nodes = graph.get("nodes", [])
    edges = graph.get("edges", [])
    types = {}
    for n in nodes:
        t = n.get("type", "unknown")
        types[t] = types.get(t, 0) + 1
    print(f"\n=== Current graph ({len(nodes)} nodes, {len(edges)} edges) ===")
    for t, count in sorted(types.items(), key=lambda x: -x[1]):
        print(f"  {t}: {count}")
    confidences = {}
    for e in edges:
        conf = e.get("confidence", "unknown")
        confidences[conf] = confidences.get(conf, 0) + 1
    print(f"  Edge confidences: {confidences}")
