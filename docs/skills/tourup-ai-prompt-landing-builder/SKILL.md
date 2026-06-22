---
name: tourup-ai-prompt-landing-builder
description: >-
  Use when building a complete prompt landing page + brand pages from a single
  AI search prompt CSV row. Converts a row of CSV into a PromptLanding .md
  (frontmatter + body wireframe), plus Company/ExternalBrand .md files for
  each mentioned brand. Keeps Prompt -> Brands relationships clear in the
  graph and usable in Astro + JSON-LD + FAQPage/ItemList.
version: 1.0.0
author: TourUp
license: MIT
metadata:
  hermes:
    tags: [content, tourup, prompts, aeo, brands, landing-page, single-prompt]
    related_skills: [tourup-ai-search-prompt-ingestion, graphify]
---

# TourUp AI Prompt -> Landing & Brands Builder

## Overview

This skill converts a single AI search prompt CSV row into:

1. **PromptLanding page** (`content/prompts/<slug>.md`) with:
   - Direct, structured answer to the prompt
   - Explicit recommended company list (ItemList-ready)
   - FAQ block ready for FAQPage schema

2. **Brand notes** (Company / ExternalBrand) consistent:
   - `content/companies/<slug>.md` for local directory brands
   - `content/external_brands/<slug>.md` for external brands
   - Both with naming and URLs coherent with brands-map and JSON-LD

The graph (Graphify) describes Prompt -> Brands relationships clearly, and
the Astro site reflects that subgraph in HTML + JSON-LD, improving
comprensibilidad and credibilidad for Googlebot/GPTBot/ClaudeBot.

## Critical Constraints (read first)

1. **No external API/backend calls.** This project has NO Django backend, NO REST API, NO localhost server. All entity inference and brand resolution is handled locally by Python scripts. Do NOT look for `localhost:8000`, `extract-entities`, `OPENCLAW_DJANGO`, `asistente-ia`, or any HTTP endpoint.

2. **No subprocess `npm` or `npx` calls inside Python exec blocks.** Use only `scripts/*.py` for pipeline work. The Astro build is only for final validation.

3. **brands-map.yaml is the SSOT for brand resolution.** If a brand is not in the map, create a provisional entry and a corresponding ExternalBrand page. Do not skip unlinked brands.

## Platform Notes (Windows)

This project runs on **Windows (PowerShell)**. Do NOT use Linux/bash commands.

**Rules for all commands:**
- **Prefer inline Python** (`exec` tool) over shell commands.
- If shell is required, use **PowerShell syntax**, not bash:
  - `&&` -> `; if ($?) { ... }`
  - Paths: use `C:\tourup-astro-blog\...` not `/c/tourup-astro-blog/...`
  - Python scripts: `python scripts/foo.py` works fine in PowerShell

**Helper for Python exec:**
```python
import subprocess, sys
result = subprocess.run(
    [sys.executable, "scripts/prompts_to_md.py", "--input", "CSV/prompts_test.csv", "--dry-run"],
    capture_output=True, text=True, cwd="C:\\tourup-astro-blog"
)
print(result.stdout[-2000:] if result.stdout else result.stderr[-2000:])
```

## When to Use

- A new AI search prompt arrives that needs its own landing page
- A prompt references brands that don't yet have Company/ExternalBrand pages
- An existing prompt needs brand resolution updated in brands-map.yaml
- The graph needs updating after adding a new PromptLanding

**Do NOT use for:**
- Batch CSV ingestion (use `tourup-ai-search-prompt-ingestion` skill instead)
- Editing existing prompt bodies (use `write_file` directly)
- Rebuilding the entire graph (use `generate_graph.py` directly)

## Pipeline Steps

### Step 1 - Normalize the CSV Row

Read the CSV row values: Prompt, Search Term, Platform, Main Intent, Secondary Intent, Brands.

1. Clean whitespace and quotes
2. Split Brands into `brands_ai_raw` list
3. Map intent to canonical values (commercial, informational, navigational, transactional)
4. Map platform to canonical names (ChatGPT, Gemini, Claude, Perplexity)

```python
from scripts.prompts_to_md import normalize_row
row = {
    "Prompt": "Best tour companies for Machu Picchu trips from the US",
    "Search Term": "peru tour companies",
    "Platform": "ChatGPT",
    "Main Intent": "Commercial",
    "Brands": "Alpaca Expeditions, REI Adventures, Intrepid Travel"
}
normalized = normalize_row(row)
# brands_ai_raw: ["Alpaca Expeditions", "REI Adventures", "Intrepid Travel"]
```

### Step 2 - Resolve Brands via brands-map.yaml

1. Load `content/_meta/brands-map.yaml` (create if absent).
2. For each `name` in `brands_ai_raw`:
   - Search by `name_csv` match
   - If found: record `entity_type` (company / external_brand) and `slug`
   - If NOT found:
     - Create provisional entry in brands-map.yaml with `entity_type: unknown`, slug generated from name
     - Default to creating an ExternalBrand page
3. Build `brands_ai_mentions` list for frontmatter:

```yaml
brands_ai_mentions:
  - name: "Alpaca Expeditions"
    entity_type: "company"
    entity_slug: "alpaca-expeditions-cusco"
```

```python
from scripts.bootstrap_brands_map import resolve_brands
brands_map_path = "content/_meta/brands-map.yaml"
mentions, new_entries = resolve_brands(
    ["Alpaca Expeditions", "REI Adventures", "Intrepid Travel"],
    brands_map_path
)
```

### Step 3 - Generate Slug and Metadata

1. Generate `slug_id` from the prompt text (first 8-10 words, kebab-case, ASCII)
2. Final slug: `/en/ai-prompts/<slug_id>/`
3. `title` = original Prompt text
4. `summary` = short explanatory phrase
5. Infer `destination_cluster` and `category_cluster` from prompt content
6. `last_ai_check_date` = current ISO date
7. Infer `destinos[]` and `categorias[]` structured arrays

```python
from scripts.prompts_to_md import infer_destinos, infer_categorias, make_slug
slug_id = make_slug("Best tour companies for Machu Picchu trips from the US")
# -> "best-tour-companies-for-machu-picchu"
destinos = infer_destinos("Best tour companies for Machu Picchu trips from the US")
# -> [{"entity_type": "destino", "entity_slug": "cusco"}, ...]
categorias = infer_categorias("tour companies")
# -> [{"entity_type": "categoria", "entity_slug": "multi-day"}, ...]
```

### Step 4 - Create/Update content/prompts/<slug_id>.md

Generate the full PromptLanding file with frontmatter + body wireframe.

**Frontmatter:**
```yaml
---
type: prompt_landing
slug: /en/ai-prompts/<slug_id>/
title: "<Prompt>"
lang: en
search_term: "<Search Term>"
ai_platforms: ["<Platform>"]
prompt_text: "<Prompt>"
primary_intent: "<Main Intent>"
secondary_intent: "<Secondary Intent or empty>"
destination_cluster: "<inferred>"
category_cluster: "<inferred>"
destinos:
  - entity_type: destino
    entity_slug: cusco
categorias:
  - entity_type: categoria
    entity_slug: multi-day
brands_ai_mentions:
  - name: "Brand Name"
    entity_type: company|external_brand
    entity_slug: brand-slug
summary: "Landing page answering the AI search prompt: '<Prompt>'..."
parent: /en/peru/
last_ai_check_date: "YYYY-MM-DD"
ai_cited_domains: []
---
```

**Body wireframe:**
```markdown
# <Prompt>

<Quick answer: 1-2 sentences, 50-70 words>

## Featured tour companies

<1-sentence intro>

1. **Brand A** - brief description (role, focus, best for)
2. **Brand B** - ...

## Compare Peru tour companies for this use case

<Table: Company, Base, Trip style, Group size, Good for>

## How to choose a Peru tour company for this scenario

<Criteria list specific to the prompt>

## Frequently asked questions

### Q1 - <question aligned with prompt>

<Answer in 40-150 words>

### Q2 - ...

### Q3 - ...
```

```python
from scripts.prompts_to_md import build_prompt_frontmatter, build_prompt_body
fm = build_prompt_frontmatter(normalized_row, slug_id, mentions, destinos, categorias)
body = build_prompt_body(normalized_row, mentions)
# Write to src/content/prompts/<slug_id>.md
```

### Step 5 - Create/Update Company and ExternalBrand Pages

For each entry in `brands_ai_mentions`:

- **If `entity_type == "company"`:**
  1. Check if `content/companies/<entity_slug>.md` exists
  2. If not, create with minimum frontmatter:
     ```yaml
     ---
     type: company
     slug: /company/<entity_slug>/
     title: "<Brand Name>"
     distribution_role: tour_operator
     sales_channel: online
     summary: "Peruvian inbound tour operator focused on Peru tours."
     contact:
       website: "<official_url if known>"
     location:
       country: Peru
     regulation: {}
     mentioned_in_prompts:
       - "<prompt-slug-id>"
     ---
     ```
  3. If exists, append prompt slug to `mentioned_in_prompts` if missing

- **If `entity_type == "external_brand"`:**
  1. Check if `content/external_brands/<entity_slug>.md` exists
  2. If not, create:
     ```yaml
     ---
     type: external_brand
     name: "<Brand Name>"
     official_url: "<url if known>"
     brand_role: "global_adventure_travel_company"
     country: "United States"
     mentioned_in_prompts:
       - "<prompt-slug-id>"
     ---
     ```
  3. If exists, append prompt slug to `mentioned_in_prompts`

### Step 6 - Sync with Graphify

After creating/editing the .md files, rebuild the graph:

```bash
python scripts/generate_graph.py
```

The resulting graph will have:
- Nodes: `prompt_landing`, `company`, `external_brand`
- Edges: Prompt -> Brand (detected via wikilinks and `brands_ai_mentions` / `mentioned_in_prompts`)

After graph rebuild, you can query Graphify:
- "What companies appear in prompts about 'family-friendly Peru tours'?"
- "Which prompts mention 'Alpaca Expeditions' and with what intent?"

## Scripts Reference

| Script | Purpose | Used In |
|--------|---------|---------|
| `scripts/prompts_to_md.py` | CSV -> prompt .md files (includes normalize, infer, build) | Steps 1-4 |
| `scripts/bootstrap_brands_map.py` | Generate/update brands-map.yaml from CSV | Step 2 |
| `scripts/generate_graph.py` | Rebuild graph.json from content | Step 6 |
| `scripts/brands_to_md.py` | Generate Company/ExternalBrand pages | Step 5 |

## Schema Reference

### PromptLanding frontmatter (`src/content/prompts/*.md`)

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

### Company frontmatter (`src/content/companies/*.md`)

```yaml
type: company
slug: string                    # /company/<slug>/
title: string
summary: string
contact:
  website: string?
  email: string?
location:
  city: string?
  country: string               # default "Peru"
regulation:
  tax_id: string?
  snapshot_date: string?
distribution_role: string       # tour_operator, travel_agency, etc.
sales_channel: string           # online, offline, omnichannel
destinos: string[]?
categorias: string[]?
mentioned_in_prompts: string[]?
```

### ExternalBrand frontmatter (`src/content/external_brands/*.md`)

```yaml
type: external_brand
name: string
official_url: string?
brand_role: string?
country: string?
mentioned_in_prompts: string[]?
```

### Graph node types

| Node type | Prefix | Source |
|-----------|--------|--------|
| Company | `company:` | `src/content/companies/*.md` |
| Destino | `destino:` | `src/content/destinos/*.md` |
| CategoriaDestino | `categoria:` | `src/content/categorias_destino/*.md` |
| PromptLanding | `prompt:` | `src/content/prompts/*.md` |
| ExternalBrand | `external_brand:` | `src/content/external_brands/*.md` |

## Comprensibilidad y Credibilidad Notes

### Comprensibilidad
- Each PromptLanding has `brands_ai_mentions` well-resolved, translated into a human list + ItemList JSON-LD
- The graph shows Prompt -> Brand relationships clearly for agent navigation

### Credibilidad
- Same brand names and URLs across:
  - brands-map.yaml
  - companies / external_brands
  - PromptLanding
  - Schema TravelAgency / ItemList / FAQPage
  - External mentions
- Each landing can include concrete data with sources (tourism statistics), the kind of "claims + citations" AI engines love to cite

## Common Pitfalls

1. **No brands-map.yaml yet:** The script creates it on first run. Without it, `entity_type` defaults to `unknown`. Run `bootstrap_brands_map.py` for initial mapping.
2. **Unlinked brands:** New brands not in the map get a provisional entry. Always verify and update `entity_type` manually.
3. **Slug collisions:** Two different prompts can produce similar slugs. Check if `<slug_id>.md` already exists before overwriting.
4. **Graph not reflecting new prompt:** Always run `generate_graph.py` after creating files. The graph is NOT auto-updated.
5. **Missing Company fields:** Company pages from the agency DB have rich data. Brand pages created by this skill have minimal frontmatter. Enrich later via `brands_to_md.py`.

## Verification Checklist

- [ ] CSV row has required fields: Prompt, Search Term, Platform, Main Intent, Brands
- [ ] All brands resolved to `entity_type` + `entity_slug` in frontmatter
- [ ] Provisional brands-map entries created for unknown brands
- [ ] Content/prompts/<slug>.md created with full frontmatter + body wireframe
- [ ] Content/companies/<slug>.md or content/external_brands/<slug>.md created for each brand
- [ ] `mentioned_in_prompts` updated on existing brand pages
- [ ] `destinos[]` and `categorias[]` reference canonical graph nodes
- [ ] Graph regenerated via `generate_graph.py`
- [ ] Body wireframe includes: quick answer, featured list, comparison table, how to choose, FAQ
