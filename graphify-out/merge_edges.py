import json, os, re, yaml

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
EXTRACT_PATH = os.path.join(os.path.dirname(__file__), ".graphify_extract.json")
PROMPTS_DIR = os.path.join(BASE_DIR, "src", "content", "prompts")
COMPANIES_DIR = os.path.join(BASE_DIR, "src", "content", "companies")


def parse_frontmatter(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    m = re.match(r"^---\s*\n(.*?)\n---", content, re.DOTALL)
    if m:
        return yaml.safe_load(m.group(1))
    return {}


with open(EXTRACT_PATH, "r", encoding="utf-8") as f:
    data = json.load(f)

existing_edges = data.get("edges", [])
edge_keys = {(e["source"], e["target"], e.get("relation", "")) for e in existing_edges}

nodes = data["nodes"]
node_by_id = {n["id"]: n for n in nodes}

# Build lookup maps
company_by_slug = {}
company_by_label = {}
external_brand_nodes = {}
destino_nodes = {}
categoria_nodes = {}

for nid, n in node_by_id.items():
    sf = n.get("source_file") or ""
    label = n.get("label", "")
    if sf.startswith("src/content/companies/") and sf.endswith(".md"):
        slug = os.path.splitext(os.path.basename(sf))[0]
        company_by_slug[slug] = nid
        company_by_label[label.lower()] = nid
    elif sf.startswith("src/content/external_brands/") and sf.endswith(".md"):
        slug = os.path.splitext(os.path.basename(sf))[0]
        external_brand_nodes[slug] = nid
    elif sf.startswith("src/content/destinos/") and sf.endswith(".md"):
        slug = os.path.splitext(os.path.basename(sf))[0]
        destino_nodes[slug] = nid
    elif sf.startswith("src/content/categorias_destino/") and sf.endswith(".md"):
        slug = os.path.splitext(os.path.basename(sf))[0]
        categoria_nodes[slug] = nid

# Handle _company suffix nodes without source_file
for nid, n in node_by_id.items():
    sf = n.get("source_file") or ""
    if not sf and nid.endswith("_company"):
        slug = nid.replace("_company", "")
        company_by_slug[slug] = nid

# Ensure destino nodes by convention
for prefix, dest_key in [("destinos_cusco", "cusco"), ("cusco_destino", "cusco"),
                          ("destinos_lima", "lima"), ("lima_destino", "lima")]:
    if prefix in node_by_id and dest_key not in destino_nodes:
        destino_nodes[dest_key] = prefix

# Ensure external brand nodes by convention
for nid in node_by_id:
    if nid.startswith("external_brands_"):
        slug = nid.replace("external_brands_", "")
        if slug not in external_brand_nodes:
            external_brand_nodes[slug] = nid


def find_prompt_node(prompt_slug_u, entity_slug_u):
    cand = f"{prompt_slug_u}_{entity_slug_u}"
    if cand in node_by_id:
        return cand
    for nid, nd in node_by_id.items():
        sf = nd.get("source_file") or ""
        if "prompts" not in sf:
            continue
        if nid.startswith(prompt_slug_u) and entity_slug_u in nid:
            return nid
    return None


def make_edge(src, tgt, relation, src_file):
    key = (src, tgt, relation)
    if key not in edge_keys:
        edge_keys.add(key)
        return {
            "source": src,
            "target": tgt,
            "relation": relation,
            "confidence": "EXTRACTED",
            "source_file": src_file,
            "source_location": "frontmatter",
            "weight": 1.0
        }
    return None


new_edges = []

# --- 1. Process prompts (mentions edges) ---
for fname in os.listdir(PROMPTS_DIR):
    if not fname.endswith(".md"):
        continue
    prompt_slug = fname.replace(".md", "")
    prompt_slug_u = prompt_slug.replace("-", "_")
    src_path = os.path.join(PROMPTS_DIR, fname)
    fm = parse_frontmatter(src_path)
    brands = fm.get("brands_ai_mentions", [])
    if not brands or not isinstance(brands, list):
        continue

    for entry in brands:
        if isinstance(entry, str):
            entity_name = entry.strip()
            lower = entity_name.lower()
            src_id = None
            tgt_id = None
            for nid, nd in node_by_id.items():
                if nd.get("label", "").lower() != lower:
                    continue
                nsf = nd.get("source_file") or ""
                if "prompts" in nsf:
                    src_id = nid
                elif "companies" in nsf or "external_brands" in nsf:
                    tgt_id = nid
            if src_id and tgt_id:
                e = make_edge(src_id, tgt_id, "mentions", src_path)
                if e:
                    new_edges.append(e)
                e = make_edge(tgt_id, src_id, "mentioned_in", src_path)
                if e:
                    new_edges.append(e)

        elif isinstance(entry, dict):
            etype = entry.get("entity_type", "")
            eslug = entry.get("entity_slug", "")
            ename = entry.get("name", "")
            if not eslug:
                continue
            eslug_u = eslug.replace("-", "_")

            src_id = find_prompt_node(prompt_slug_u, eslug_u)
            if not src_id:
                continue

            tgt_id = None
            if etype == "company":
                slug_u = eslug_u
                for cand in [slug_u, f"{slug_u}_company", eslug]:
                    if cand in node_by_id:
                        tgt_id = cand
                        break
                    if cand in company_by_slug:
                        tgt_id = company_by_slug[cand]
                        break
                if not tgt_id:
                    for nid in node_by_id:
                        if nid.endswith("_company") and slug_u in nid:
                            tgt_id = nid
                            break
                if not tgt_id and ename:
                    lower = ename.lower()
                    if lower in company_by_label:
                        tgt_id = company_by_label[lower]
            elif etype == "external_brand":
                slug_u = eslug_u
                if slug_u in external_brand_nodes:
                    tgt_id = external_brand_nodes[slug_u]
                elif f"external_brands_{slug_u}" in node_by_id:
                    tgt_id = f"external_brands_{slug_u}"

            if tgt_id and tgt_id in node_by_id:
                e = make_edge(src_id, tgt_id, "mentions", src_path)
                if e:
                    new_edges.append(e)
                e = make_edge(tgt_id, src_id, "mentioned_in", src_path)
                if e:
                    new_edges.append(e)


# --- 2. Process companies (operates_in, categorized_as) ---
for nid, nd in node_by_id.items():
    sf = nd.get("source_file") or ""
    # Only process company nodes
    is_company = sf.startswith("src/content/companies/") and sf.endswith(".md")
    is_company = is_company or (not sf and nid.endswith("_company"))
    if not is_company:
        continue

    cslug = os.path.splitext(os.path.basename(sf))[0] if sf else nid.replace("_company", "")
    fpath = os.path.join(COMPANIES_DIR, f"{cslug}.md")
    if not os.path.exists(fpath):
        continue
    fm = parse_frontmatter(fpath)

    destinos = fm.get("destinos", []) or []
    for d in destinos:
        d_norm = d.strip().lower()
        tgt = destino_nodes.get(d_norm) or destino_nodes.get(d_norm.replace("-", "_"))
        if tgt and tgt in node_by_id:
            e = make_edge(nid, tgt, "operates_in", sf)
            if e:
                new_edges.append(e)

    categorias = fm.get("categorias", []) or []
    for c in categorias:
        c_norm = c.strip().lower().replace("-", "_")
        tgt = categoria_nodes.get(c_norm)
        if not tgt:
            for slug, cnid in categoria_nodes.items():
                slug_norm = slug.replace("-", "_").lower()
                if c_norm in slug_norm or slug_norm in c_norm:
                    tgt = cnid
                    break
        if tgt and tgt in node_by_id and tgt != nid:
            e = make_edge(nid, tgt, "categorized_as", sf)
            if e:
                new_edges.append(e)


# --- 3. Merge ---
existing_edges.extend(new_edges)
data["edges"] = existing_edges

with open(EXTRACT_PATH, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Added {len(new_edges)} new edges ({len(existing_edges)} total)")
for e in new_edges:
    print(f"  {e['relation']}: {e['source']} -> {e['target']}")
