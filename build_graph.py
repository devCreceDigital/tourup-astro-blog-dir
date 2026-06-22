import yaml
import glob
import re
import json
import os
from pathlib import Path

import networkx as nx
from networkx.algorithms.community import louvain_communities

# ── 1. Parse all frontmatter ──────────────────────────────────────────────
def parse_frontmatter(filepath):
    with open(filepath, encoding='utf-8') as f:
        content = f.read()
    parts = content.split('---', 2)
    if len(parts) < 3:
        return None
    try:
        return yaml.safe_load(parts[1])
    except:
        return None

def slug_to_id(slug):
    """Convert a slug like '/company/foo-bar' or '/en/ai-prompts/foo/' to clean id"""
    slug = slug.strip('/')
    parts = slug.split('/')
    return parts[-1]

# ── 2. Collect entities ───────────────────────────────────────────────────
G = nx.Graph()

companies = {}
prompts = {}
destinos = {}
external_brands = {}
categorias = set()
destino_names = set()

# Companies
for fp in glob.glob('src/content/companies/*.md'):
    fm = parse_frontmatter(fp)
    if not fm:
        continue
    sid = slug_to_id(fm.get('slug', ''))
    if not sid:
        continue
    node_id = f'company:{sid}'
    title = fm.get('title', sid)
    role = fm.get('distribution_role') or fm.get('category', '')
    companies[node_id] = {
        'title': title,
        'distribution_role': role,
        'sales_channel': fm.get('sales_channel'),
        'destinos': fm.get('destinos') or [],
        'categorias': fm.get('categorias') or [],
        'destination': fm.get('destination', ''),
    }
    G.add_node(node_id, label=title, type='company', distribution_role=role,
               title=title, group=1)
    for d in companies[node_id]['destinos']:
        destino_names.add(d.lower().strip())
    for c in companies[node_id]['categorias']:
        categorias.add(c.lower().strip())

# Prompts
for fp in glob.glob('src/content/prompts/*.md'):
    fm = parse_frontmatter(fp)
    if not fm:
        continue
    sid = slug_to_id(fm.get('slug', ''))
    if not sid:
        continue
    node_id = f'prompt:{sid}'
    mentions = fm.get('brands_ai_mentions') or []
    prompts[node_id] = {
        'title': fm.get('title', sid),
        'search_term': fm.get('search_term', ''),
        'brands_ai_mentions': mentions,
        'destination_cluster': fm.get('destination_cluster'),
        'category_cluster': fm.get('category_cluster'),
    }
    G.add_node(node_id, label=fm.get('title', sid), type='prompt',
               title=fm.get('title', sid), group=2)
    dc = prompts[node_id]['destination_cluster']
    cc = prompts[node_id]['category_cluster']
    if dc:
        destino_names.add(dc.lower().strip())
    if cc:
        categorias.add(cc.lower().strip())

# External brands (from source files)
for fp in glob.glob('src/content/external_brands/*.md'):
    fm = parse_frontmatter(fp)
    if not fm:
        continue
    sid = Path(fp).stem
    node_id = f'external_brand:{sid}'
    external_brands[node_id] = {
        'name': fm.get('name', sid),
        'mentioned_in': fm.get('mentioned_in_prompts') or [],
    }
    G.add_node(node_id, label=fm.get('name', sid), type='external_brand',
               title=fm.get('name', sid), group=4)

# Virtual external_brand nodes: collect all external_brand slugs referenced in prompts
for nid, data in prompts.items():
    for mention in data['brands_ai_mentions']:
        if isinstance(mention, dict) and mention.get('entity_type') == 'external_brand':
            eslug = slug_to_id(mention.get('entity_slug', ''))
            if not eslug:
                continue
            eid = f'external_brand:{eslug}'
            if eid not in G:
                label = eslug.replace('-', ' ').title()
                external_brands[eid] = {'name': label, 'mentioned_in': []}
                G.add_node(eid, label=label, type='external_brand',
                           title=label, group=4)

# Destinations
for fp in glob.glob('src/content/destinos/*.md'):
    fm = parse_frontmatter(fp)
    if not fm:
        continue
    name = fm.get('name', '')
    if name:
        node_id = f'destino:{name.lower().strip()}'
        destinos[node_id] = {'name': name}
        G.add_node(node_id, label=name, type='destino', title=name, group=3)

# Also add destino nodes that were referenced but have no source file
for d in destino_names:
    node_id = f'destino:{d}'
    if node_id not in destinos and node_id not in G:
        G.add_node(node_id, label=d.title(), type='destino', title=d.title(), group=3)

# Categorias Destino: read from content collection (per-destino-per-categoria)
for fp in glob.glob('src/content/categorias_destino/*.md'):
    fm = parse_frontmatter(fp)
    if not fm:
        continue
    ds = fm.get('destino_slug', '').lower().strip()
    cat = fm.get('categoria', '')
    if ds and cat:
        node_id = f'categoria_destino:{ds}-{cat}'
        if node_id not in G:
            name = fm.get('name', f'{cat} en {ds}')
            G.add_node(node_id, label=name, type='categoria_destino',
                       title=name, group=5)
        categorias.discard(cat)

# Virtual categoria nodes for legacy flat references (category_cluster, entity_type:categoria)
for c in categorias:
    node_id = f'categoria:{c}'
    if node_id not in G:
        G.add_node(node_id, label=c.replace('-', ' ').title(), type='categoria',
                   title=c.replace('-', ' ').title(), group=5)

# ── 3. Build edges ────────────────────────────────────────────────────────
edge_count = 0
cross_collection = 0

# company → destino
for nid, data in companies.items():
    for d in data['destinos']:
        target = f'destino:{d.lower().strip()}'
        if target in G:
            G.add_edge(nid, target, relation='operates_in', confidence='EXTRACTED')
            edge_count += 1
            cross_collection += 1

# company → categoria_destino (cross-product of destinos × categorias)
for nid, data in companies.items():
    for d in data['destinos']:
        for c in data['categorias']:
            target = f'categoria_destino:{d.lower().strip()}-{c.lower().strip()}'
            if target in G:
                G.add_edge(nid, target, relation='categorized_as', confidence='EXTRACTED')
                edge_count += 1
                cross_collection += 1

# Build lookup: company title → node_id (for string-only mentions)
company_title_to_id = {}
for nid in companies:
    title = companies[nid].get('title', '').lower().strip()
    if title:
        company_title_to_id[title] = nid

# prompt → company (via brands_ai_mentions)
for nid, data in prompts.items():
    for mention in data['brands_ai_mentions']:
        if isinstance(mention, str):
            # String-only mention — try to match by name
            ml = mention.lower().strip()
            # Direct match
            target = company_title_to_id.get(ml)
            if target and target in G:
                G.add_edge(nid, target, relation='mentions', confidence='INFERRED')
                edge_count += 1
                cross_collection += 1
            continue
        e_type = mention.get('entity_type', '')
        e_slug = mention.get('entity_slug', '')
        if e_type == 'company' and e_slug:
            target = f'company:{slug_to_id(e_slug)}'
            if target in G:
                G.add_edge(nid, target, relation='mentions', confidence='EXTRACTED')
                edge_count += 1
                cross_collection += 1
        elif e_type == 'external_brand' and e_slug:
            target = f'external_brand:{slug_to_id(e_slug)}'
            if target in G:
                G.add_edge(nid, target, relation='mentions', confidence='EXTRACTED')
                edge_count += 1
                cross_collection += 1
        elif e_type == 'destino' and e_slug:
            target = f'destino:{slug_to_id(e_slug)}'
            if target in G:
                G.add_edge(nid, target, relation='targets_destination', confidence='EXTRACTED')
                edge_count += 1
                cross_collection += 1
        elif e_type == 'categoria' and e_slug:
            target = f'categoria:{slug_to_id(e_slug)}'
            if target in G:
                G.add_edge(nid, target, relation='targets_category', confidence='EXTRACTED')
                edge_count += 1
                cross_collection += 1

# prompt → destination_cluster
for nid, data in prompts.items():
    dc = data.get('destination_cluster')
    if dc:
        target = f'destino:{dc.lower().strip()}'
        if target in G:
            G.add_edge(nid, target, relation='targets_destination', confidence='EXTRACTED')
            edge_count += 1
            cross_collection += 1
    cc = data.get('category_cluster')
    if cc:
        target = f'categoria:{cc.lower().strip()}'
        if target in G:
            G.add_edge(nid, target, relation='targets_category', confidence='EXTRACTED')
            edge_count += 1
            cross_collection += 1

# external_brand → prompt (reverse of mention)
for nid, data in external_brands.items():
    for prompt_slug in data['mentioned_in']:
        target = f'prompt:{slug_to_id(prompt_slug)}'
        if target in G:
            G.add_edge(nid, target, relation='mentioned_in', confidence='EXTRACTED')
            edge_count += 1
            cross_collection += 1

print(f'Nodes: {G.number_of_nodes()}')
print(f'Edges: {G.number_of_edges()}')
print(f'Cross-collection edges: {cross_collection}')

# ── 4. Community detection ────────────────────────────────────────────────
from networkx.algorithms.community import louvain_communities
# Louvain works best on connected graphs; take the giant component
components = list(nx.connected_components(G))
if components:
    giant = G.subgraph(max(components, key=len))
    communities = louvain_communities(giant, seed=42)
else:
    communities = []

# Build community map
node_to_community = {}
for cid, members in enumerate(communities):
    for node in members:
        node_to_community[node] = cid

# Assign community to all nodes
for node in G.nodes():
    G.nodes[node]['community'] = node_to_community.get(node, -1)

# ── 5. Build graphify-compatible graph JSON ───────────────────────────────
# Map node_id -> numeric index
node_ids = list(G.nodes())
node_index = {nid: i for i, nid in enumerate(node_ids)}

out_nodes = []
for nid in node_ids:
    d = G.nodes[nid]
    out_nodes.append({
        'id': nid,
        'label': d.get('label', nid),
        'type': d.get('type', 'unknown'),
        'community': d.get('community', -1),
        'title': d.get('title', ''),
        'distribution_role': d.get('distribution_role', ''),
    })

out_edges = []
for u, v, d in G.edges(data=True):
    out_edges.append({
        'source': u,
        'target': v,
        'relation': d.get('relation', ''),
        'confidence': d.get('confidence', 'EXTRACTED'),
    })

graph_json = {
    'nodes': out_nodes,
    'edges': out_edges,
}

os.makedirs('graphify-out', exist_ok=True)
with open('graphify-out/graph.json', 'w', encoding='utf-8') as f:
    json.dump(graph_json, f, indent=2, ensure_ascii=False)

print(f'Written to graphify-out/graph.json')

# ── 6. Generate HTML visualization ────────────────────────────────────────
# Try using graphify's to_html, fall back to custom vis.js template
try:
    from graphify.export import to_html
    communities_dict = {}
    for cid, members in enumerate(communities):
        communities_dict[cid] = list(members)
    to_html(G, communities_dict, 'graphify-out/graph.html',
            community_labels=None, node_limit=2000)
    print('HTML generated via graphify.export.to_html')
except ImportError:
    print('graphify.export.to_html not available, generating custom HTML...')
    # ── Generate vis.js HTML directly ──────────────────────────────────────
    node_json = json.dumps([{
        'id': nid,
        'label': G.nodes[nid].get('label', nid)[:30],
        'title': f"<b>{G.nodes[nid].get('label', nid)}</b><br/>Type: {G.nodes[nid].get('type', '')}<br/>Community: {G.nodes[nid].get('community', -1)}",
        'group': G.nodes[nid].get('community', -1),
    } for nid in G.nodes()], ensure_ascii=False)

    edge_json = json.dumps([{
        'from': u, 'to': v,
        'title': d.get('relation', ''),
        'arrows': 'to',
    } for u, v, d in G.edges(data=True)], ensure_ascii=False)

    type_counts = {}
    for nid in G.nodes():
        t = G.nodes[nid].get('type', 'unknown')
        type_counts[t] = type_counts.get(t, 0) + 1

    html = f'''<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>Content Graph - Cross-Collection Visualization</title>
<style>
  body {{ margin:0; padding:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; background:#0f172a; color:#e2e8f0; }}
  #mynetwork {{ width:100%; height:90vh; border:none; }}
  #stats {{ padding:8px 16px; background:#1e293b; border-bottom:1px solid #334155; display:flex; gap:24px; flex-wrap:wrap; font-size:13px; }}
  #stats span {{ color:#94a3b8; }}
  #stats strong {{ color:#f1f5f9; }}
  .legend {{ display:flex; gap:12px; flex-wrap:wrap; }}
  .legend-item {{ display:flex; align-items:center; gap:4px; }}
  .legend-dot {{ width:12px; height:12px; border-radius:50%; display:inline-block; }}
  #search {{ margin-left:auto; padding:4px 8px; border-radius:6px; border:1px solid #334155; background:#0f172a; color:#e2e8f0; }}
</style>
</head>
<body>
<div id="stats">
  <span>Nodes: <strong>{G.number_of_nodes()}</strong></span>
  <span>Edges: <strong>{G.number_of_edges()}</strong></span>
  <span>Cross-collection edges: <strong>{cross_collection}</strong></span>
  <div class="legend">
    {"".join(f'<span class="legend-item"><span class="legend-dot" style="background:{['#3b82f6','#f59e0b','#10b981','#8b5cf6','#ec4899','#64748b'][i%6]}"></span>{t}({c})</span>' for i,(t,c) in enumerate(sorted(type_counts.items())))}
  </div>
  <input id="search" placeholder="Search nodes..." />
</div>
<div id="mynetwork"></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/vis-network/9.1.6/vis-network.min.js"></script>
<script>
  var nodes = new vis.DataSet({node_json});
  var edges = new vis.DataSet({edge_json});
  var container = document.getElementById('mynetwork');
  var data = {{ nodes: nodes, edges: edges }};
  var options = {{
    nodes: {{
      shape: 'dot',
      size: 10,
      font: {{ color: '#e2e8f0', size: 11, face: 'sans-serif' }},
      borderWidth: 1,
      shadow: true,
    }},
    edges: {{
      width: 1,
      color: {{ color: '#475569', highlight: '#60a5fa', hover: '#60a5fa' }},
      smooth: {{ type: 'continuous' }},
      font: {{ size: 9, color: '#64748b', strokeWidth: 0 }},
    }},
    physics: {{
      solver: 'forceAtlas2Based',
      forceAtlas2Based: {{
        gravitationalConstant: -80,
        centralGravity: 0.005,
        springLength: 160,
        springConstant: 0.02,
        damping: 0.4,
      }},
      stabilization: {{ iterations: 200 }},
    }},
    interaction: {{
      hover: true,
      tooltipDelay: 100,
      navigationButtons: true,
      keyboard: true,
    }},
    groups: {{
      {",".join(f'{cid}:{{color:{{background:"{["#3b82f6","#f59e0b","#10b981","#8b5cf6","#ec4899","#06b6d4","#f97316","#14b8a6","#a855f7","#ef4444","#84cc16","#6366f1"][cid%12]}"}},}}' for cid in range(len(communities)))}
    }},
  }};
  var network = new vis.Network(container, data, options);

  // Search
  document.getElementById('search').addEventListener('input', function(e) {{
    var q = e.target.value.toLowerCase();
    if (!q) {{ nodes.forEach(function(n) {{ nodes.update({{id:n.id, opacity:1.0}}); }}); return; }}
    nodes.forEach(function(n) {{
      var match = n.label.toLowerCase().includes(q) || n.id.toLowerCase().includes(q);
      nodes.update({{id:n.id, opacity: match ? 1.0 : 0.08}});
    }});
  }});
</script>
</body>
</html>'''

    with open('graphify-out/graph.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print('Custom HTML visualization generated')

print('Done!')
