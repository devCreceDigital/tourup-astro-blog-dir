"""
generate_graph.py – Bootstrap graph.json from Astro content collections.

Produces graphify-out/graph.json in the same schema expected by
src/utils/graphify.ts, so that findCompaniesByFilters() can use it
immediately without needing the real Graphify + Gemini pipeline.

When you run `npm run graphify` (python -m graphify ...) later, the AI-enriched
version will overwrite this bootstrap file with richer semantic edges.

Usage:
    python3 scripts/generate_graph.py            # from project root
    npm run graph:bootstrap                      # same via npm script
"""

import json
import os
import re
import sys
from pathlib import Path

import yaml  # pip install PyYAML


CONTENT_ROOT = Path("src/content")
OUTPUT_PATH = Path("graphify-out/graph.json")


def parse_frontmatter(md_path: Path) -> dict:
    """Extract YAML frontmatter from a Markdown file."""
    text = md_path.read_text(encoding="utf-8")
    match = re.match(r"^---\r?\n(.*?)\r?\n---", text, re.DOTALL)
    if not match:
        return {}
    try:
        return yaml.safe_load(match.group(1)) or {}
    except yaml.YAMLError as e:
        print(f"  [WARN] YAML parse error in {md_path}: {e}", file=sys.stderr)
        return {}


def slug_from_path(md_path: Path) -> str:
    return md_path.stem


def build_graph() -> dict:
    nodes: list[dict] = []
    edges: list[dict] = []
    node_ids: set[str] = set()

    def add_node(node_id: str, node_type: str, label: str, properties: dict):
        if node_id not in node_ids:
            nodes.append({"id": node_id, "type": node_type, "label": label, "properties": properties})
            node_ids.add(node_id)

    def add_edge(source: str, target: str, edge_type: str):
        edges.append({"source": source, "target": target, "type": edge_type})

    # ── Companies ──────────────────────────────────────────────────────────────
    companies_dir = CONTENT_ROOT / "companies"
    company_count = 0
    if companies_dir.exists():
        for md in sorted(companies_dir.glob("*.md")):
            fm = parse_frontmatter(md)
            if fm.get("type") != "company":
                continue
            slug = slug_from_path(md)
            node_id = f"company:{slug}"
            title = fm.get("title", slug)
            add_node(node_id, "Company", title, {
                "title": title,
                "summary": fm.get("summary", ""),
                "distribution_role": fm.get("distribution_role", ""),
                "destinos": fm.get("destinos") or [],
                "categorias": fm.get("categorias") or [],
                "rating": fm.get("rating"),
                "reviews_count": fm.get("reviews_count"),
                "b2b_profile": fm.get("b2b_profile"),
                "trust_metrics": fm.get("trust_metrics"),
                "mentioned_in_prompts": fm.get("mentioned_in_prompts") or [],
                # Legacy fields (NAP resolved from nap or contact/location)
                "contact": fm.get("contact"),
                "location": fm.get("location"),
                "nap": fm.get("nap"),
                "regulation": fm.get("regulation"),
            })
            company_count += 1

            # OPERATES_IN edges: company → destino
            for destino in (fm.get("destinos") or []):
                dest_node_id = f"destino:{destino}"
                add_edge(node_id, dest_node_id, "OPERATES_IN")

            # OFFERS edges: company → categoria_destino (cross-product of destinos × categorias)
            for destino in (fm.get("destinos") or []):
                for cat in (fm.get("categorias") or []):
                    cat_node_id = f"categoria_destino:{destino}-{cat}"
                    add_edge(node_id, cat_node_id, "OFFERS")

            # MENTIONED_IN edges (backlinks)
            for prompt_slug in (fm.get("mentioned_in_prompts") or []):
                add_edge(node_id, f"prompt:{prompt_slug}", "MENTIONED_IN")

    # ── Destinos ───────────────────────────────────────────────────────────────
    destinos_dir = CONTENT_ROOT / "destinos"
    if destinos_dir.exists():
        for md in sorted(destinos_dir.glob("*.md")):
            fm = parse_frontmatter(md)
            slug = slug_from_path(md)
            node_id = f"destino:{slug}"
            add_node(node_id, "Destino", fm.get("name", slug), {
                "name": fm.get("name", slug),
                "country": fm.get("country", "Peru"),
                "region": fm.get("region"),
                "summary": fm.get("summary", ""),
                "parent": fm.get("parent"),
                "faq": fm.get("faq") or [],
            })

    # ── Categorias Destino ────────────────────────────────────────────────────
    cats_dir = CONTENT_ROOT / "categorias_destino"
    if cats_dir.exists():
        for md in sorted(cats_dir.glob("*.md")):
            fm = parse_frontmatter(md)
            slug = slug_from_path(md)
            node_id = f"categoria_destino:{fm.get('destino_slug', 'unknown')}-{fm.get('categoria', slug)}"
            add_node(node_id, "CategoriaDestino", fm.get("name", slug), {
                "name": fm.get("name", slug),
                "destino_slug": fm.get("destino_slug", ""),
                "categoria": fm.get("categoria", slug),
                "summary": fm.get("summary", ""),
                "faq": fm.get("faq") or [],
            })
            # BELONGS_TO edge: categoria → destino
            if fm.get("destino_slug"):
                add_edge(node_id, f"destino:{fm['destino_slug']}", "BELONGS_TO")

    # ── External Brands ───────────────────────────────────────────────────────
    ext_dir = CONTENT_ROOT / "external_brands"
    if ext_dir.exists():
        for md in sorted(ext_dir.glob("*.md")):
            fm = parse_frontmatter(md)
            slug = slug_from_path(md)
            node_id = f"external_brand:{slug}"
            add_node(node_id, "ExternalBrand", fm.get("name", slug), {
                "name": fm.get("name", slug),
                "official_url": fm.get("official_url", ""),
                "brand_role": fm.get("brand_role"),
                "country": fm.get("country"),
                "mentioned_in_prompts": fm.get("mentioned_in_prompts") or [],
            })
            # MENTIONED_IN edges
            for prompt_slug in (fm.get("mentioned_in_prompts") or []):
                add_edge(node_id, f"prompt:{prompt_slug}", "MENTIONED_IN")

    # ── Prompt Landings ───────────────────────────────────────────────────────
    prompts_dir = CONTENT_ROOT / "prompts"
    if prompts_dir.exists():
        for md in sorted(prompts_dir.glob("*.md")):
            fm = parse_frontmatter(md)
            slug = slug_from_path(md)
            node_id = f"prompt:{slug}"
            add_node(node_id, "PromptLanding", fm.get("title", slug), {
                "title": fm.get("title", slug),
                "summary": fm.get("summary", ""),
                "ai_platforms": fm.get("ai_platforms") or [],
                "destination_cluster": fm.get("destination_cluster"),
                "category_cluster": fm.get("category_cluster"),
                "brands_ai_mentions": fm.get("brands_ai_mentions") or [],
            })
            # MENTIONS / MENTIONS_EXTERNAL edges
            for brand in (fm.get("brands_ai_mentions") or []):
                b_type = brand.get("entity_type", "unknown")
                b_slug = brand.get("entity_slug")
                if not b_slug:
                    continue
                if b_type == "company":
                    add_edge(node_id, f"company:{b_slug}", "MENTIONS")
                elif b_type == "external_brand":
                    add_edge(node_id, f"external_brand:{b_slug}", "MENTIONS_EXTERNAL")

    return {"nodes": nodes, "edges": edges}


def main():
    print("[generate_graph] Scanning src/content ...")
    os.makedirs(OUTPUT_PATH.parent, exist_ok=True)
    graph = build_graph()

    companies = [n for n in graph["nodes"] if n["type"] == "Company"]
    destinos  = [n for n in graph["nodes"] if n["type"] == "Destino"]
    prompts   = [n for n in graph["nodes"] if n["type"] == "PromptLanding"]
    ext       = [n for n in graph["nodes"] if n["type"] == "ExternalBrand"]

    print(f"[generate_graph] Nodes  : {len(graph['nodes'])} total")
    print(f"                 Company : {len(companies)}")
    print(f"                 Destino : {len(destinos)}")
    print(f"                 Prompt  : {len(prompts)}")
    print(f"                 ExtBrand: {len(ext)}")
    print(f"[generate_graph] Edges  : {len(graph['edges'])}")

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(graph, f, ensure_ascii=False, indent=2)

    print(f"[generate_graph] Written -> {OUTPUT_PATH}")
    print("[generate_graph] Done. Run `npm run graphify` to upgrade with Gemini AI edges.")


if __name__ == "__main__":
    main()
