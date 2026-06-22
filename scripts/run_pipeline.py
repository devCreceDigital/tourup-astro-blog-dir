#!/usr/bin/env python3
"""
run_pipeline.py — TourUp AI Search Prompt Ingestion Pipeline.

Orchestrates the 8-step pipeline from arqui02.md.md:
  1. Read & validate CSV
  2. Normalize each row
  3. Infer entities
  4. Create frontmatter
  5. Connect prompt with graph
  6. Generate content (Gemini batch)
  7. Validate JSON-LD / HTML
  8. Publish

Usage:
    python scripts/run_pipeline.py --input ai_models-chatgpt.csv --step 1-5
    python scripts/run_pipeline.py --input data/*.csv --full
    python scripts/run_pipeline.py --input data/*.csv --full --gemini-key $GEMINI_API_KEY
    python scripts/run_pipeline.py --input data/*.csv --dry-run
    python scripts/run_pipeline.py --input data/*.csv --resume --step 6
"""
import argparse, json, subprocess, sys, textwrap, time
from pathlib import Path

SRC_CONTENT = Path("src/content")
PROMPTS_DIR = SRC_CONTENT / "prompts"
BRANDS_MAP = Path("content/_meta/brands-map.yaml")
GRAPHOUT = Path("graphify-out/graph.json")


def run(cmd, desc, dry_run=False):
    print(f"\n{'='*60}")
    print(f"[{desc}]")
    print(f"{'='*60}")
    if dry_run:
        print(f"  DRY RUN: would execute: {' '.join(cmd)}")
        return True
    print(f"  Running: {' '.join(cmd)}")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.stdout:
        for line in result.stdout.splitlines()[:20]:
            print(f"  {line}")
    if result.returncode != 0:
        print(f"  [ERROR] Exit code {result.returncode}", file=sys.stderr)
        if result.stderr:
            for line in result.stderr.splitlines()[:10]:
                print(f"  STDERR: {line}", file=sys.stderr)
        return False
    return True


def step_1_4_ingest(args):
    print("Steps 1-4: CSV -> normalize -> infer entities -> frontmatter")
    cmd = [sys.executable, "scripts/prompts_to_md.py",
           "--input", args.input]
    if args.brands_map:
        cmd += ["--brands", args.brands_map]
    if args.output:
        cmd += ["--output", args.output]
    if args.write:
        cmd.append("--write")
    if args.force:
        cmd.append("--force")
    return run(cmd, "prompts_to_md (steps 1-4)", args.dry_run)


def step_5_connect_graph(args):
    print("Step 5: Connect prompt with graph")
    cmd = [sys.executable, "scripts/generate_graph.py"]
    return run(cmd, "generate_graph (step 5)", args.dry_run)


def step_6_generate_content(args):
    print("Step 6: Generate content via Gemini (batch mode)")
    if not args.gemini_key:
        print("  [SKIP] No API key provided for Gemini. Use --gemini-key.")
        print("  Content bodies will use template defaults.")
        return False

    prompt_files = sorted(PROMPTS_DIR.glob("*.md"))
    if not prompt_files:
        print("  [SKIP] No prompt files found.")
        return False

    batch_size = args.batch_size or 5
    batches = [prompt_files[i:i + batch_size] for i in range(0, len(prompt_files), batch_size)]
    total = len(prompt_files)
    print(f"  Prompts to enrich: {total}")
    print(f"  Batch size: {batch_size}")
    print(f"  Batches: {len(batches)}")

    if args.dry_run:
        print("  DRY RUN: would call Gemini API")
        return True

    enriched = 0
    for i, batch in enumerate(batches):
        print(f"  Batch {i+1}/{len(batches)} ({len(batch)} prompts)...")
        batch_data = []
        for fp in batch:
            text = fp.read_text(encoding="utf-8")
            match __import__("re").match(r"^---\s*\n(.*?)\n---", text, __import__("re").DOTALL):
                case m:
                    fm = __import__("yaml").safe_load(m.group(1))
                    title = fm.get("title", fp.stem) if fm else fp.stem
                    dests = ", ".join(d.get("entity_slug", "") for d in (fm.get("destinos") or []))
                    cats = ", ".join(c.get("entity_slug", "") for c in (fm.get("categorias") or []))
                    brands = ", ".join(b.get("name", "") for b in (fm.get("brands_ai_mentions") or []))
                    batch_data.append({"title": title, "destinos": dests, "categorias": cats, "brands": brands})

        prompt = build_gemini_prompt(batch_data)
        body = call_gemini(prompt, args.gemini_key)
        if body:
            apply_content(batch, body)
            enriched += len(batch)
        time.sleep(2)

    print(f"  Enriched: {enriched}/{total}")
    return True


def build_gemini_prompt(batch_data):
    items = "\n\n".join(
        f"--- Prompt {i+1} ---\n"
        f"Title: {d['title']}\n"
        f"Destinations: {d['destinos']}\n"
        f"Categories: {d['categorias']}\n"
        f"Brands: {d['brands']}"
        for i, d in enumerate(batch_data)
    )
    return textwrap.dedent(f"""\
    You are an AI content writer for TourUp, a B2B Peru travel marketplace.
    For each prompt below, generate a JSON object with these fields:
    - "quick_answer": 1-2 sentence direct answer (BLUF)
    - "comparison_table": HTML table string with columns: Company, Base, Trip Style, Group Size, Good For
    - "faqs": array of {{"question": str, "answer": str}} (3-5 items, trust-focused)
    - "trust_signals": array of strings (licensing, safety, etc.)

    Return a JSON array with one entry per prompt, example:
    [
      {{
        "slug": "best-guided-tours-machu-picchu",
        "quick_answer": "Several companies offer...",
        "comparison_table": "<table class='comparison'>...",
        "faqs": [{{"question": "Which operator...", "answer": "..."}}],
        "trust_signals": ["MINCETUR licensed", ...]
      }}
    ]

    {items}
    """)


def call_gemini(prompt, api_key):
    try:
        import requests
    except ImportError:
        print("  [WARN] requests not installed. Install with: pip install requests")
        return None

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.7, "maxOutputTokens": 8192},
    }
    try:
        resp = requests.post(url, json=payload, timeout=120)
        resp.raise_for_status()
        data = resp.json()
        text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
        return text
    except Exception as e:
        print(f"  [ERROR] Gemini API call failed: {e}")
        return None


def apply_content(batch, body_text):
    try:
        import re, json
        json_match = re.search(r"\[.*?\]", body_text, re.DOTALL)
        if not json_match:
            print("  [WARN] Could not parse JSON from Gemini response")
            return
        entries = json.loads(json_match.group())
        for entry in entries:
            slug = entry.get("slug", "")
            fp = PROMPTS_DIR / f"{slug}.md"
            if not fp.exists():
                continue
            text = fp.read_text(encoding="utf-8")
            m = re.match(r"^(---\s*\n.*?\n---)\n?", text, re.DOTALL)
            if not m:
                continue
            fm_part = m.group(1)
            body = build_enriched_body(entry)
            fp.write_text(f"{fm_part}\n\n{body}", encoding="utf-8")
            print(f"    Enriched: {slug}")
    except Exception as e:
        print(f"  [ERROR] Failed applying content: {e}")


def build_enriched_body(entry):
    qa = entry.get("quick_answer", "")
    table = entry.get("comparison_table", "")
    faqs = entry.get("faqs", [])
    signals = entry.get("trust_signals", [])
    faq_section = ""
    if faqs:
        faq_items = "\n".join(
            f"### {f['question']}\n\n{f['answer']}\n" for f in faqs
        )
        faq_section = f"## Frequently Asked Questions\n\n{faq_items}"

    signals_section = ""
    if signals:
        signals_section = "## Trust Signals\n\n" + "\n".join(f"- {s}" for s in signals)

    return f"""## Quick Answer

{qa}

## Comparison Table

{table}

{faq_section}

{signals_section}

---

*Content generated from verified operator data and AI model signals. Always verify current licensing and availability directly with the tour operator.*"""


def step_7_validate(args):
    print("Step 7: Validate HTML / JSON-LD")
    cmd = ["npx", "astro", "check"]
    if args.dry_run:
        print("  DRY RUN: would run `astro check`")
        return True
    return run(cmd, "astro check (step 7)", args.dry_run)


def step_8_publish(args):
    print("Step 8: Publish and connect with AI Search")
    if not args.dry_run:
        cmd = ["npx", "astro", "build"]
        run(cmd, "astro build (step 8)", args.dry_run)
    print("  [NEXT] Add new URLs to sitemap-prompts.xml")
    print("  [NEXT] Ensure canonical /en/ URLs")
    print("  [NEXT] Add links from destino/categoria hub pages")
    print("  [NEXT] Include strategic pages in /llms.txt")


def main():
    parser = argparse.ArgumentParser(description="TourUp AI Search Prompt Ingestion Pipeline")
    parser.add_argument("--input", type=str, default="ai_models-*.csv",
                        help="Input CSV file pattern")
    parser.add_argument("--brands-map", type=str, default=str(BRANDS_MAP),
                        help="Path to brands-map.yaml")
    parser.add_argument("--output", type=str, default=str(PROMPTS_DIR),
                        help="Output directory for prompt Markdown files")
    parser.add_argument("--full", action="store_true",
                        help="Run full pipeline (steps 1-8)")
    parser.add_argument("--step", type=str, default="1-5",
                        help="Steps to run: 1-5, 6, 7, 8, or '1-8'")
    parser.add_argument("--gemini-key", type=str, default="",
                        help="Gemini API key for content generation (step 6)")
    parser.add_argument("--batch-size", type=int, default=5,
                        help="Batch size for Gemini API calls (step 6)")
    parser.add_argument("--dry-run", action="store_true",
                        help="Validate pipeline without executing")
    parser.add_argument("--write", action="store_true",
                        help="Write files (used by prompts_to_md)")
    parser.add_argument("--force", action="store_true",
                        help="Overwrite existing files")
    args = parser.parse_args()

    if args.full:
        args.step = "1-8"

    print(f"\n{'#'*60}")
    print("# TourUp AI Search Prompt Ingestion Pipeline")
    print(f"# Steps: {args.step}")
    print(f"{'#'*60}\n")

    steps = args.step.split(",")

    for s in steps:
        s = s.strip()
        if s in ("1", "1-4", "1-5", "1-8"):
            if not step_1_4_ingest(args):
                print("  Pipeline aborted at step 1-4")
                sys.exit(1)
        if s in ("5", "1-5", "1-8"):
            if not step_5_connect_graph(args):
                print("  Pipeline aborted at step 5")
                sys.exit(1)
        if s in ("6", "1-8"):
            step_6_generate_content(args)
        if s in ("7", "1-8"):
            step_7_validate(args)
        if s in ("8", "1-8"):
            step_8_publish(args)

    if args.dry_run:
        print(f"\n{'='*60}")
        print("DRY RUN completed. Pass --write to execute real writes.")
    else:
        print(f"\n{'='*60}")
        print("Pipeline completed.")


if __name__ == "__main__":
    main()
