---
name: tourup-ai-search-prompt-ingestion
description: >-
  Use when ingesting CSV of AI search prompts into TourUp content pipeline.
  Converts CSV rows -> structured prompt landing pages -> graph edges ->
  Gemini-enriched bodies -> AI-search-optimized SSR pages.
  Covers 8-step pipeline: validation, normalization, entity inference,
  frontmatter, graph connection, content generation, validation, publication.
version: 1.0.0
author: TourUp
license: MIT
metadata:
  hermes:
    tags: [content, tourup, prompts, aeo, csv-ingestion, pipeline, ai-search]
    related_skills: [graphify, writing-plans]
---

# TourUp AI Search Prompt Ingestion

## Overview

This skill converts CSV files of AI search prompts (from ChatGPT, Gemini, Claude, Perplexity)
into structured, graph-connected content for TourUp - a B2B Peru travel marketplace.

It implements the 8-step pipeline defined in `docs/arqui02.md.md`:

```
CSV -> normalize -> infer entities -> frontmatter -> graph -> content -> validate -> publish
```

Every step produces deterministic, structured output. No CSV row is left as "research aislado."

## Critical Constraints (read first)

1. **No external API/backend calls.** This project has NO Django backend, NO REST API, NO localhost server. All entity inference (destinos, categorias, brands) is handled locally by `scripts/prompts_to_md.py`. Do NOT look for `localhost:8000`, `extract-entities`, `OPENCLAW_DJANGO`, `asistente-ia`, or any HTTP endpoint. They do not exist in this project.

2. **No subprocess `npm` or `npx` calls inside Python exec blocks.** Use only `scripts/*.py` for pipeline steps. The Node.js/Astro build is only for final validation (step 7-8) and should be run via shell, not inline Python.

3. **Graph is regenerated locally.** `scripts/generate_graph.py` scans `src/content/` and rebuilds `graphify-out/graph.json`. No graph API exists.

## Platform Notes (Windows)

This project runs on **Windows (PowerShell)**. Do NOT use Linux/bash commands.

**Rules for all commands:**
- **Prefer inline Python** (`exec` tool) over shell commands — Python works identically on all platforms.
- If shell is required, use **PowerShell syntax**, not bash:
  - `ls` -> `Get-ChildItem`, use Python's `pathlib` instead
  - `&&` -> `; if ($?) { ... }`
  - `cd /c/...` -> just use absolute paths or Python `os.chdir()`
  - Paths: use `C:\tourup-astro-blog\...` not `/c/tourup-astro-blog/...`
  - Python scripts: `python scripts/foo.py` works fine in PowerShell

**Helper for Python exec:**
```python
import subprocess, sys
# Instead of shell cd + python, use subprocess with cwd:
result = subprocess.run(
    [sys.executable, "scripts/prompts_to_md.py", "--input", "CSV/prompts_test.csv", "--dry-run"],
    capture_output=True, text=True, cwd="C:\\tourup-astro-blog"
)
print(result.stdout[-2000:] if result.stdout else result.stderr[-2000:])
```

## When to Use

- A new batch of AI search prompts arrives as a CSV file (ChatGPT, Gemini, etc.)
- Existing prompts need content enrichment (quick answers, comparisons, FAQs)
- The graph needs rebuilding after prompt ingestion
- Validating that prompt pages are AI-search-optimized

**Do NOT use for:**
- Editing individual prompt files (use `write_file` directly)
- Generating company pages (use the dedicated `brands_to_md.py` or `bootstrap_brands_map.py`)
- Running the full pipeline without a Gemini API key configured (step 6 will be skipped)

## Pipeline Steps

### Step 1 - Read & Validate CSV

Locate the CSV. Confirm it has required columns (Prompt, Plataforma, Intencion primaria, Marcas).

```bash
python scripts/prompts_to_md.py --input ai_models-chatgpt.csv --dry-run
```

**Check:** Output shows parsed rows with inferred slugs, intents, destinos, and brands.

### Step 2-3 - Normalize & Infer Entities

Each CSV row is normalized to:
- `slug` (from prompt text, deterministic)
- `primary_intent` / `secondary_intent` (mapped to: commercial, informational, navigational, transactional)
- `ai_platforms` (mapped to: ChatGPT, Gemini, Claude, Perplexity)
- `brands_ai_mentions` (resolved via `content/_meta/brands-map.yaml` or keyword match)
- `destinos[]` and `categorias[]` as structured entity arrays

```python
from scripts.prompts_to_md import infer_destinos, infer_categorias, infer_intent
result = infer_destinos("Best Cusco tours from US", "machu picchu", ...)
# -> ["cusco", "machu_picchu"]
```

### Step 4 - Create Frontmatter

Generate YAML frontmatter for `src/content/prompts/<slug>.md`:

```yaml
---
type: prompt_landing
slug: /en/ai-prompts/<slug>/
title: "<original prompt>"
lang: en
ai_platforms: [ChatGPT]
primary_intent: commercial
secondary_intent: informational
destination_cluster: Cusco
category_cluster: tour_companies
destinos:
  - entity_type: destino
    entity_slug: cusco
categorias:
  - entity_type: categoria
    entity_slug: full-day
brands_ai_mentions:
  - name: Alpaca Expeditions
    entity_type: company
    entity_slug: alpaca-expeditions
parent: /en/peru/
---
```

### Step 5 - Connect with Graph

Rebuild `graphify-out/graph.json` so new prompt nodes and edges appear:

```bash
python scripts/generate_graph.py
```

The graph connects:
- `prompt:<slug>` -> `destino:<slug>` (via destinos[])
- `prompt:<slug>` -> `categoria:<slug>` (via categorias[])
- `prompt:<slug>` -> `company:<slug>` (via brands_ai_mentions)

### Step 6 - Generate Content (Gemini Batch)

Enrich prompt bodies with AI-generated content: quick answer, comparison table, FAQs, trust signals.

```bash
python scripts/run_pipeline.py --input ai_models-*.csv --full --gemini-key $GEMINI_API_KEY
```

The Gemini call receives batches of 5 prompts and produces structured JSON for each.

**If no API key is available**, the script generates basic template content (brand list + key considerations).

### Step 7 - Validate

```bash
npx astro check
```

Verify:
- All prompts have correct frontmatter schema
- `destinos[]` and `categorias[]` reference existing graph nodes
- `slug` matches URL pattern `/en/ai-prompts/<slug>/`
- JSON-LD is present and structurally valid

### Step 8 - Publish

```bash
npx astro build
```

Manual follow-up:
- [ ] Add new URLs to `sitemap-prompts.xml`
- [ ] Ensure canonical /en/ URLs
- [ ] Link from destino/categoria hub pages
- [ ] Add strategic pages to `/llms.txt`

## Scripts Reference

| Script | Purpose | Pipeline Step |
|--------|---------|---------------|
| `scripts/prompts_to_md.py` | CSV -> prompt .md files | 1-4 |
| `scripts/generate_graph.py` | Rebuild graph.json from content | 5 |
| `scripts/run_pipeline.py` | Orchestrator (calls all scripts) | 1-8 |
| `scripts/bootstrap_brands_map.py` | Generate brands-map from CSV | Prerequisite |
| `scripts/migrate_prompts_schema.py` | Migrate existing prompts to destinos[] | One-time |
| `scripts/link_prompts.py` | Legacy: link companies to prompts | Deprecated |

## Schema Reference

### Prompt frontmatter (`src/content/prompts/*.md`)

```yaml
type: prompt_landing
slug: string                    # /en/ai-prompts/<slug>/
title: string
lang: string                    # default "en"
search_term: string?
ai_platforms: string[]          # ChatGPT, Gemini, Claude, Perplexity
prompt_text: string
primary_intent: string?         # commercial, informational, navigational, transactional
secondary_intent: string?
destination_cluster: string?    # flat, backward-compatible
category_cluster: string?       # flat, backward-compatible
destinos:                       # structured array
  - entity_type: destino
    entity_slug: string
categorias:                     # structured array
  - entity_type: categoria
    entity_slug: string
brands_ai_mentions:
  - name: string
    entity_type: company|external_brand|unknown
    entity_slug: string?
summary: string
parent: string?
last_ai_check_date: string?
ai_cited_domains: string[]?
```

### Graph node types

| Node type | Prefix | Source |
|-----------|--------|--------|
| Company | `company:` | `src/content/companies/*.md` |
| Destino | `destino:` | `src/content/destinos/*.md` |
| CategoriaDestino | `categoria:` | `src/content/categorias_destino/*.md` |
| PromptLanding | `prompt:` | `src/content/prompts/*.md` |
| ExternalBrand | `external_brand:` | `src/content/external_brands/*.md` |

## Common Pitfalls

1. **CSV encoding:** Files exported from Excel may use cp1252 or BOM. The pipeline handles UTF-8-SIG. If garbled, re-save as UTF-8.
2. **Missing brands-map.yaml:** The brand resolver falls back to keyword matching. Run `bootstrap_brands_map.py` first for best results.
3. **Gemini rate limits:** Batch size of 5 with 2-second delay between calls keeps you under free-tier limits. Increase cautiously.
4. **Slug collisions:** Two CSV rows can produce the same slug if prompts are very similar. The script skips existing files by default; use `--force` carefully.
5. **Graph not reflecting new prompts:** Always run `generate_graph.py` after ingestion. The graph is NOT auto-updated.
6. **Forgetting to write:** Run with `--write` to actually create files. Without it, the pipeline runs dry.

## Verification Checklist

- [ ] CSV columns: Prompt, Plataforma, Intencion primaria, Marcas present
- [ ] Destinos and categorias resolved to canonical slugs
- [ ] brands_ai_mentions use `entity_type` + `entity_slug`, not raw strings
- [ ] Slug matches URL pattern `/en/ai-prompts/<slug>/`
- [ ] Graph regenerated after ingestion
- [ ] Content generated (Gemini or template fallback)
- [ ] `astro check` passes
- [ ] `astro build` succeeds
- [ ] New URLs added to sitemap
- [ ] `/llms.txt` references strategic new pages
