# Open Specs – Tourup Astro Blog & AI Directory

This document defines the **open specifications** and high-level SDD for the Astro-based content site and knowledge graph powering Tourup's Peru tour companies directory.

It is the contract between:

- Markdown content (Obsidian-friendly),
- Astro (rendering, routing, JSON-LD),
- CSV ingestion scripts (Python),
- Graphify (knowledge graph),
- MCP server `travel-content`,
- Internal agents `ContentBuilder` and `AEOAuditor`.

---

## 1. Architecture Overview

### Core

- **Repository (System of Record)**
  - `content/companies/*.md`
  - `content/external_brands/*.md`
  - `content/prompts/*.md`
  - `content/_meta/brands-map.yaml`
  - CSVs: `bd_agencias_en.csv`, `ai_models-*.csv`

- **Astro Site**
  - Uses Content Collections (`src/content/config.ts`).
  - Renders:
    - blog posts (`blog/[slug].astro`),
    - prompt landings (`en/ai-prompts/[slug].astro`),
    - company/external brand pages (optional route).
  - Injects JSON-LD (`WebPage` + `ItemList` + `FAQPage`) for Answer Engine Optimization.

- **Graphify**
  - Converts the repo into a queryable knowledge graph (`graphify-out/graph.json`).
  - Nodes: `Company`, `ExternalBrand`, `PromptLanding`.
  - Edges: Prompt → Brands, Brands → Prompt.

### MCP Layer

- **MCP server: `travel-content`**
  - Exposes the repo and graph as tools over MCP.
  - Capabilities:
    - list/read/write content files,
    - read the graph (`graph.json`),
    - helper tools for:
      - generating prompt landings from CSV rows,
      - generating Company/ExternalBrand markdown,
      - syncing `brands-map.yaml`.

### Internal agents

- **ContentBuilder Agent**
  - Uses `travel-content` tools to:
    - ingest AI prompt CSVs,
    - update `brands-map.yaml`,
    - generate/update `PromptLanding`, `Company` and `ExternalBrand` pages.

- **AEOAuditor Agent**
  - Uses `travel-content` tools + graph to:
    - verify AEO patterns (answer-first, ItemList, FAQPage),
    - adjust content and schema,
    - track AI citation status and freshness.

---

## 2. Domain Model (Open Spec)

```yaml
entities:

  Company:
    id: "company:<slug>"
    markdown_path: "content/companies/<slug>.md"
    fields:
      type: "company"
      slug: string           # e.g. "/company/alpaca-expeditions/"
      title: string          # brand name
      distribution_role: enum[
        "tour_operator",
        "retail_travel_agency",
        "wholesale_travel_agency",
        "online_travel_agency",
        "dmc",
        "mixed_agency"
      ]
      sales_channel: enum["online","offline","omnichannel"]?
      summary: string
      contact:
        website: string?
        email: string?
        phone: string?
        phone_alt_1: string?
        phone_alt_2: string?
      location:
        city: string?
        province: string?
        region: string?
        country: string = "Peru"
        ubigeo_code: string?
      regulation:
        tax_id: string?
        license_number: string?
        license_issue_date: string?
      legal_representative: string?
      mentioned_in_prompts: string[]?  # slugs of PromptLanding

  ExternalBrand:
    id: "external_brand:<slug>"
    markdown_path: "content/external_brands/<slug>.md"
    fields:
      type: "external_brand"
      slug: string           # e.g. "rei-adventures"
      name: string
      official_url: string   # external URL
      brand_role: string?    # e.g. "online_travel_agency", "global_adventure_travel_company"
      country: string?
      mentioned_in_prompts: string[]?

  PromptLanding:
    id: "prompt:<slug>"
    markdown_path: "content/prompts/<slug>.md"
    fields:
      type: "prompt_landing"
      slug: string           # e.g. "/en/ai-prompts/best-peru-tour-companies-for-families/"
      title: string          # equals Prompt text or close variant
      lang: string           # default "en"
      search_term: string?   # from CSV
      ai_platforms: string[] # e.g. ["ChatGPT"]
      prompt_text: string    # original AI prompt
      primary_intent: string?
      secondary_intent: string?
      destination_cluster: string?   # e.g. "cusco_machu_picchu"
      category_cluster: string?      # e.g. "peru_tour_companies"
      brands_ai_mentions:
        - name: string              # brand name from CSV
          entity_type: enum["company","external_brand","unknown"]
          entity_slug: string?      # slug if known
      summary: string
      parent: string?               # parent page slug (e.g. "/en/peru/")
      last_ai_check_date: string?   # ISO date when prompts were last checked
      ai_cited_domains: string[]?   # domains seen cited by AI engines for this prompt

  BrandMapping:   # not a page, but a meta file
    yaml_path: "content/_meta/brands-map.yaml"
    fields:
      - name_csv: string            # as appears in CSV/AI models
        entity_type: enum["company","external_brand","unknown"]
        slug: string                # canonical slug used in markdown_path
        official_url: string?       # for external brands
        brand_role: string?         # semantics for external brand
```

### Graph relations

```yaml
edges:
  - name: "MENTIONS"
    from: PromptLanding
    to:   Company
    description: "Prompt landing mentions / recommends this internal company."

  - name: "MENTIONS_EXTERNAL"
    from: PromptLanding
    to:   ExternalBrand
    description: "Prompt landing mentions / recommends this external brand."

  - name: "MENTIONED_IN_PROMPT"
    from: Company|ExternalBrand
    to:   PromptLanding
    description: "Brand appears in this prompt landing."
```

Implementation signals:

- `brands_ai_mentions` in PromptLanding (primary).
- `mentioned_in_prompts` in Company/ExternalBrand (optional backlink).
- Obsidian wikilinks in bodies (optional).

---

## 3. Astro Content Collections

`src/content/config.ts` must define:

```ts
collections:

  companies:
    type: "content"
    schema:
      type: literal("company")
      slug: string
      title: string
      distribution_role: enum["tour_operator","retail_travel_agency","wholesale_travel_agency","online_travel_agency","dmc","mixed_agency"]
      sales_channel: enum["online","offline","omnichannel"]?
      summary: string
      contact: object? { website?, email?, phone?, phone_alt_1?, phone_alt_2? }
      location: object? { city?, province?, region?, country?, ubigeo_code? }
      regulation: object? { tax_id?, license_number?, license_issue_date? }
      legal_representative: string?
      mentioned_in_prompts: string[]?

  external_brands:
    type: "content"
    schema:
      type: literal("external_brand")
      slug: string
      name: string
      official_url: string
      brand_role: string?
      country: string?
      mentioned_in_prompts: string[]?

  prompts:
    type: "content"
    schema:
      type: literal("prompt_landing")
      slug: string
      title: string
      lang: string
      search_term: string?
      ai_platforms: string[]
      prompt_text: string
      primary_intent: string?
      secondary_intent: string?
      destination_cluster: string?
      category_cluster: string?
      brands_ai_mentions: Array<{ name, entity_type, entity_slug? }>
      summary: string
      parent: string?
      last_ai_check_date: string?
      ai_cited_domains: string[]?

  posts:
    type: "content"
    schema:
      title: string
      description: string
      pubDate: date
      updatedDate: date?
      heroImage: string?
      tags: string[]
```

Implement using Astro's `defineCollection` + Zod.

---

## 4. MCP Server `travel-content` (conceptual spec)

### Resources

```yaml
resources:

  list_content:
    description: "List Markdown content entries by collection."
    params:
      collection: enum["companies","external_brands","prompts","posts"]
    returns:
      - slug: string
        path: string

  read_content:
    description: "Read a Markdown or YAML file from the repo."
    params:
      path: string
    returns:
      content: string

  read_graph:
    description: "Read the Graphify graph JSON."
    params: {}
    returns:
      graph_json: string
```

### Tools

```yaml
tools:

  generate_prompt_landing_md:
    description: "Generate or update a PromptLanding .md file from a CSV row + resolved brands."
    params:
      prompt_text: string
      search_term: string?
      platform: string?
      main_intent: string?
      secondary_intent: string?
      destination_cluster: string?
      category_cluster: string?
      brands:
        - name: string
          entity_type: enum["company","external_brand","unknown"]
          entity_slug: string?
    returns:
      path: string
      markdown: string

  update_brand_mentions:
    description: "Ensure that a brand markdown file lists a given prompt in mentioned_in_prompts."
    params:
      entity_type: enum["company","external_brand"]
      entity_slug: string
      prompt_slug: string
    returns:
      updated: boolean

  sync_brands_map:
    description: "Merge a list of AI/CSV brand names into brands-map.yaml (creating unknown entries if missing)."
    params:
      brand_names: string[]
    returns:
      created: string[]
      existing: string[]

  generate_company_from_csv:
    description: "Create a Company markdown file from bd_agencias_en.csv + brand mapping."
    params:
      brand_slug: string
      brand_name: string
    returns:
      path: string
      markdown: string

  generate_external_brand_md:
    description: "Create an ExternalBrand markdown from mapping entry."
    params:
      slug: string
      name: string
      official_url: string?
      brand_role: string?
    returns:
      path: string
      markdown: string
```

All agents must use these tools instead of writing files directly.

---

## 5. Scripts & Pipelines (batch, outside MCP)

- `scripts/bootstrap_brands_map.py`
  - Reads AI prompt CSVs, builds `brands-map.yaml`.

- `scripts/prompts_to_md.py`
  - Reads AI prompt CSVs + `brands-map.yaml`.
  - Generates `content/prompts/*.md` with frontmatter + wireframe body.

- `scripts/brands_to_md.py`
  - Reads `brands-map.yaml` + `bd_agencias_en.csv`.
  - Generates `content/companies/*.md` and `content/external_brands/*.md`.

---

## 6. Graphify Contract (conceptual)

```yaml
node_types:
  prompt_landing:
    pattern: "content/prompts/*.md"
    id_prefix: "prompt:"
  company:
    pattern: "content/companies/*.md"
    id_prefix: "company:"
  external_brand:
    pattern: "content/external_brands/*.md"
    id_prefix: "external_brand:"

edges:
  - name: "MENTIONS"
    from: "prompt_landing"
    to: "company"
    detect:
      - "frontmatter.brands_ai_mentions where entity_type = company"

  - name: "MENTIONS_EXTERNAL"
    from: "prompt_landing"
    to: "external_brand"
    detect:
      - "frontmatter.brands_ai_mentions where entity_type = external_brand"

  - name: "MENTIONED_IN_PROMPT"
    from: "company|external_brand"
    to: "prompt_landing"
    detect:
      - "frontmatter.mentioned_in_prompts"
```

Agents should query `graphify-out/graph.json` first, then open specific files only if needed.

---

## 7. Implementation Steps

1. Scaffold Astro project & content collections.
2. Implement minimal layouts/pages (`index`, `blog`, `en/ai-prompts/[slug]`).
3. Stub Python scripts.
4. Add sample markdown for:
   - one `Company`,
   - one `ExternalBrand`,
   - one `PromptLanding`.
5. Run Graphify and validate the graph.
6. Prototype MCP server `travel-content` around this repo.
7. Define prompts/skills for ContentBuilder and AEOAuditor agents using the MCP tools and graph.

This Open Spec should remain the single source of truth for all tools and agents working on this repo.
