# Open Specs – Tourup Astro Blog & AI Directory

This document is the **single source of truth** for the Tourup content site and knowledge graph. It defines contracts between:

- Markdown content (Obsidian-friendly, `src/content/**/*.md`)
- Astro Content Collections (`src/content/config.ts`)
- CSV ingestion scripts (`scripts/`)
- Graphify knowledge graph (`graphify-out/graph.json`)
- MCP server `travel-content`
- Internal agents: `ContentBuilder`, `AEOAuditor`, `PartnerScout`
- OpenClaw/Hermes skills: `GraphNavigator`, `ContentBuilder`, `AEOAuditor`

---

## 1. Architecture Overview

```
Obsidian Vault (= this repo)
  ├─ src/content/
  │   ├─ companies/       →  Journey 4 Trust Cards (/empresas/[slug]/)
  │   ├─ destinos/        →  Geo taxonomy (Home → Destino → Categoria → Empresa)
  │   ├─ categorias_destino/ → Category-by-destination taxonomy
  │   ├─ external_brands/ →  Third-party platforms (TourRadar, REI, etc.)
  │   ├─ prompts/         →  AEO prompt landings (/en/ai-prompts/[slug]/)
  │   └─ posts/           →  Blog articles (/blog/[slug]/)
  ├─ graphify-out/
  │   └─ graph.json       →  Graphify knowledge graph (run: graphify . --backend gemini)
  └─ src/utils/
      └─ graphify.ts      →  findCompaniesByFilters() helper (graph-first, fallback to collection)
```

**Rule for all agents:**
> Consult `graphify-out/graph.json` first via `GraphNavigator`. Open individual `.md` files only if the graph context is insufficient.

---

## 2. User Journeys

### Journey 4 – Validación de confianza

**Scenario:** An agency or advanced traveler already has a specific provider in mind and wants to verify: "Can I trust this operator?"

**Implementation:**
- Page: `/empresas/[slug]/` (`src/pages/empresas/[slug].astro`)
- Data source: `companies` content collection
- JSON-LD: `TravelAgency`/`LocalBusiness` + `AggregateRating` (if rating present) + `FAQPage`
- AEO pattern: answer-first BLUF summary, consistent NAP, trust-focused FAQs

### Journey 5 – Partner Scout (B2B Sourcing)

**Scenario:** A professional buyer (emisora, DMC, hotel chain, B2B marketplace) needs to find local Peruvian operators matching specific sourcing criteria.

**Implementation:**
- Page: `/partner-scout/` (`src/pages/partner-scout/index.astro`)
- Filter inputs: destinos, categorias, rating_min, group_capacity_min, languages, b2b_client_types
- Static mode: filters in-browser using catalog embedded at build time
- SSR mode (future): fetch POST `/api/partner-scout/search.json` → shortlist + match reasons
- Utility: `src/utils/graphify.ts` → `findCompaniesByFilters(filters)` (graph-first)

---

## 3. Content Collections Schema

### 3.1 `companies` – Tour operators and agencies

```yaml
type: "company"
title: string                  # brand name (display)
distribution_role: enum[
  "tour_operator",
  "retail_travel_agency",
  "wholesale_travel_agency",
  "online_travel_agency",
  "dmc",
  "mixed_agency"
]
sales_channel: enum["online","offline","omnichannel"]?
summary: string                # 1-2 sentence BLUF for AEO

# Taxonomy (connect to Graphify graph nodes)
destinos: string[]?            # e.g. ["cusco", "lima"]
categorias: string[]?          # e.g. ["tours-comunitarios", "full-day"]

# Trust signals (Journey 4)
rating: number?                # 0–5
reviews_count: number?
testimonials:
  - author: string
    text: string
    date: string?              # ISO date
    source: string?            # e.g. "TripAdvisor"

licenses:
  - type: string               # "MINCETUR", "RUC", "IATA"
    id: string
    issuer: string?

nap:
  address: string?
  city: string
  country: string              # default "Peru"
  phone: string?
  email: string?
  website: string?

b2b_profile: string?           # e.g. "Receptivo comunitario, grupos 2-12 pax"

faq:
  - question: string
    answer: string

trust_metrics:
  avg_response_time_hours: number?
  incident_rate: number?       # 0–1 ratio (e.g. 0.02 = 2%)
  group_capacity_max: number?
  b2b_client_types: string[]?  # ["agencias_emisoras", "dmc", "ota"]
  languages: string[]?         # ISO 639-1: ["es", "en", "fr"]

# Legacy fields (kept for backward compat)
contact: { website?, email?, phone?, phone_alt_1?, phone_alt_2? }?
location: { city?, province?, region?, country?, ubigeo_code? }?
regulation: { tax_id?, license_number?, license_issue_date? }?
legal_representative: string?
mentioned_in_prompts: string[]?
```

### 3.2 `destinos` – Geographic taxonomy nodes

```yaml
type: "destino"
name: string
country: string                # default "Peru"
region: string?
summary: string
parent: string?                # parent destino slug (e.g. "peru")
seo_title: string?
faq:
  - question: string
    answer: string
```

### 3.3 `categorias_destino` – Category-by-destination taxonomy

```yaml
type: "categoria_destino"
destino_slug: string           # e.g. "cusco"
categoria: string              # e.g. "tours-comunitarios"
name: string
summary: string
faq:
  - question: string
    answer: string
```

### 3.4 `external_brands`

```yaml
type: "external_brand"
name: string
official_url: string
brand_role: string?
country: string?
mentioned_in_prompts: string[]?
```

### 3.5 `prompts` – AEO prompt landings

```yaml
type: "prompt_landing"
title: string
lang: string                   # default "en"
search_term: string?
ai_platforms: string[]
prompt_text: string
primary_intent: string?
secondary_intent: string?
destination_cluster: string?
category_cluster: string?
brands_ai_mentions:
  - name: string
    entity_type: enum["company","external_brand","unknown"]
    entity_slug: string?
summary: string
parent: string?
last_ai_check_date: string?
ai_cited_domains: string[]?
```

---

## 4. Graph Model (Graphify)

Node types and edges used in `graphify-out/graph.json`:

```yaml
node_types:
  Company:       src/content/companies/*.md
  Destino:       src/content/destinos/*.md
  CategoriaDestino: src/content/categorias_destino/*.md
  PromptLanding: src/content/prompts/*.md
  ExternalBrand: src/content/external_brands/*.md

edges:
  OPERATES_IN:      Company     → Destino         (via company.destinos[])
  OFFERS:           Company     → CategoriaDestino (via company.categorias[])
  BELONGS_TO:       CategoriaDestino → Destino    (via categorias_destino.destino_slug)
  MENTIONS:         PromptLanding → Company       (via brands_ai_mentions where entity_type=company)
  MENTIONS_EXTERNAL: PromptLanding → ExternalBrand
  MENTIONED_IN:     Company|ExternalBrand → PromptLanding (via mentioned_in_prompts[])
```

**Graphify command:**
```bash
graphify . --backend gemini --update
# Add to package.json: "graphify": "graphify . --backend gemini --update"
```

---

## 5. Partner Scout API Contract

### Endpoint
```
GET  /api/partner-scout/search.json   (static mode – returns full catalog)
POST /api/partner-scout/search.json   (SSR mode – requires output: "hybrid")
```

### Request (POST, SSR only)
```json
{
  "destinos": ["cusco", "lima"],
  "categorias": ["full-day", "tours-comunitarios"],
  "rating_min": 4.0,
  "group_capacity_min": 10,
  "languages": ["en", "es"],
  "b2b_client_types": ["agencias_emisoras", "dmc"]
}
```

All fields are optional. An empty body returns the full catalog.

### Response
```json
{
  "version": "1.0",
  "count": 3,
  "shortlist": [
    {
      "slug": "explore-peru-tours",
      "title": "Explore Peru Tours",
      "summary": "Lima-based receptive operator...",
      "destinos": ["cusco", "lima"],
      "categorias": ["full-day", "aventura", "lujo"],
      "rating": 4.9,
      "reviews_count": 512,
      "b2b_profile": "Receptivo especializado en grupos internacionales 2–30 pax...",
      "match_reasons": ["destino: cusco", "rating 4.9/5", "idioma: en, es"],
      "url": "/empresas/explore-peru-tours/"
    }
  ]
}
```

`match_reasons` is a human-readable list explaining why the company was selected. It will be used by the PartnerScout agent to generate natural-language explanations.

---

## 6. Agent Skills for OpenClaw / Hermes

### Rule (mandatory for all skills)
> **Primero el grafo, luego los archivos.**
> Always query `graphify-out/graph.json` before opening individual `.md` files.
> Use `GraphNavigator` to resolve node context, then open specific files only if needed.

---

### 6.1 Skill: GraphNavigator

```
# GraphNavigator – Knowledge graph navigation

## Role
Navigate the Tourup knowledge graph. Use Graphify before touching any files.

## Graph location
graphify-out/graph.json  (run `graphify . --backend gemini --update` to refresh)

## Node types
- Company       → src/content/companies/*.md
- Destino       → src/content/destinos/*.md
- CategoriaDestino → src/content/categorias_destino/*.md
- PromptLanding → src/content/prompts/*.md
- ExternalBrand → src/content/external_brands/*.md

## Rules
1. For every user or agent query:
   - Query graph first: find nodes matching the question.
   - Use graph context (nodes, edges, communities) to decide which files to open.
2. Open individual .md files only if graph context is insufficient.
3. Do NOT traverse the filesystem exhaustively if the graph provides the answer.

## Typical tasks
- "All companies operating in Cusco" → find Company nodes with OPERATES_IN → Destino:cusco
- "Prompts mentioning Alpaca Expeditions" → MENTIONS edges to Company:alpaca-expeditions
- "Orphaned companies not linked to any destino" → Company nodes with no OPERATES_IN edge
```

---

### 6.2 Skill: ContentBuilder

```
# ContentBuilder – CSV to Markdown ingestion

## Role
Transform CSV data (bd_agencias_en.csv, ai_models-*.csv) into structured Markdown
following OPEN_SPECS.md schemas. Update brands-map.yaml accordingly.

## Graphify usage
1. Before creating new content:
   - graphify query "existing nodes for <brand>" --graph graphify-out/graph.json
   - If node exists: UPDATE the .md file, don't create a duplicate.
2. After bulk ingestion: trigger graphify . --backend gemini --update

## Content rules
- Frontmatter must exactly match schemas in OPEN_SPECS.md section 3.
- Never invent regulatory data (RUC, licenses); leave fields empty if missing from CSV.
- For companies: populate destinos, categorias, nap, and b2b_profile when data is available.
- For PromptLanding: fill brands_ai_mentions from brands-map.yaml + GraphNavigator.
- Body structure: H1, BLUF answer, sections, FAQs (for prompts: ItemList of brands).

## Scripts
- python scripts/bootstrap_brands_map.py  → update brands-map.yaml
- python scripts/prompts_to_md.py         → generate prompts from CSV
- python scripts/brands_to_md.py          → generate companies from CSV
```

---

### 6.3 Skill: AEOAuditor

```
# AEOAuditor – Answer Engine Optimization audit

## Role
Maximize the probability that Tourup pages appear as AI answers in ChatGPT,
Gemini, Claude, Perplexity, and Google AI Overviews.

## Graphify usage
1. Before auditing any page:
   - Query graph for the node (Company, PromptLanding, Destino).
   - Understand its position: Home → Destino → CategoriaDestino → Company.
   - Check connected PromptLanding nodes.
2. Open the .md file only after graph context is established.

## Audit checklist
- [ ] BLUF: direct answer in first paragraph of PromptLanding / company summary.
- [ ] ItemList: HTML list brands = brands_ai_mentions = graph MENTIONS edges.
- [ ] FAQPage: 3–7 trust-focused questions, 1-3 sentence answers.
- [ ] JSON-LD:
        Companies: TravelAgency + AggregateRating (if rating) + FAQPage
        PromptLandings: WebPage + ItemList + FAQPage
        Destinos/Categorias: CollectionPage + FAQPage
- [ ] NAP: consistent Name/Address/Phone in frontmatter nap field.
- [ ] last_ai_check_date: update after each audit pass.

## Allowed actions
- Propose edits to summary, faq fields in .md frontmatter.
- Adjust brands_ai_mentions, mentioned_in_prompts, ai_cited_domains.
- Suggest new "pillar" destino/categoria pages when graph shows large clusters
  with no hub node.

## Restrictions
- Never delete graph nodes unilaterally; flag inconsistencies for human review.
- Never rename slugs without producing a redirect proposal.
```

---

### 6.4 Skill: PartnerScout (Journey 5)

```
# PartnerScout – B2B operator sourcing agent

## Role
Given a structured brief from a professional buyer (emisora, DMC, hotel chain),
find and explain a shortlist of Peruvian receptive operators that match.

## Tool chain
1. GraphNavigator: query graph for Company nodes matching destino + categoria.
2. src/utils/graphify.ts: findCompaniesByFilters(brief) for precise filtering.
3. GET /api/partner-scout/search.json: fetch full catalog if graph is unavailable.

## Brief schema (input)
{
  destinos: string[],
  categorias: string[],
  rating_min: number,
  group_capacity_min: number,
  languages: string[],
  b2b_client_types: string[]
}

## Output format
For each company in the shortlist, provide:
- Company name + URL (/empresas/[slug]/)
- Match reasons (specific fields that matched)
- 1-sentence B2B positioning (from b2b_profile)
- Rating + reviews count
- Relevant licenses (MINCETUR, etc.)

## Caveat (mandatory)
Always include: "La decisión final es del comprador. Esta preselección es orientativa
y se basa en los datos del directorio TourUp. Verifica licencias vigentes directamente."
```

---

## 7. URL Routes

| Route | Source | Journey |
|-------|--------|---------|
| `/` | `src/pages/index.astro` | Landing |
| `/blog/` | `src/pages/blog/index.astro` | Blog |
| `/blog/[slug]/` | `src/pages/blog/[slug].astro` | Blog |
| `/en/ai-prompts/` | `src/pages/en/ai-prompts/index.astro` | AEO directory |
| `/en/ai-prompts/[slug]/` | `src/pages/en/ai-prompts/[slug].astro` | AEO prompt |
| `/empresas/[slug]/` | `src/pages/empresas/[slug].astro` | J4 Trust Card |
| `/companies/[slug]/` | `src/pages/companies/[slug].astro` | Legacy (kept) |
| `/partner-scout/` | `src/pages/partner-scout/index.astro` | J5 B2B sourcing |
| `/api/partner-scout/search.json` | `src/pages/api/partner-scout/search.json.ts` | J5 API |

---

## 8. MCP Server `travel-content` (conceptual)

### Resources

| Resource | Description |
|----------|-------------|
| `list_content` | List entries by collection |
| `read_content` | Read a .md or .yaml file |
| `read_graph` | Read graphify-out/graph.json |

### Tools

| Tool | Description |
|------|-------------|
| `generate_prompt_landing_md` | Generate PromptLanding .md from CSV row + brands |
| `generate_company_from_csv` | Create Company .md from bd_agencias_en.csv |
| `generate_external_brand_md` | Create ExternalBrand .md |
| `update_brand_mentions` | Ensure backlink in mentioned_in_prompts |
| `sync_brands_map` | Merge CSV brand names into brands-map.yaml |
| `partner_scout_search` | Run findCompaniesByFilters(brief) → shortlist |

---

## 9. Implementation Checklist

- [x] Astro project scaffolded
- [x] Content Collections configured (`src/content/config.ts`)
- [x] `companies`, `external_brands`, `prompts`, `posts` collections
- [x] `destinos`, `categorias_destino` collections (taxonomy nodes)
- [x] Sample content: `explore-peru-tours`, `tourradar`, `best-peru-tour-companies-for-families`
- [x] Sample destinos: `cusco`, `lima`
- [x] Sample categorias: `cusco-tours-comunitarios`, `cusco-full-day`
- [x] Layout, Header, Footer, JsonLdPromptLanding components
- [x] Pages: index, blog, en/ai-prompts/[slug], en/ai-prompts/index
- [x] Journey 4: `/empresas/[slug]/` with Trust Card + JSON-LD
- [x] Journey 5: `/partner-scout/` with B2B form + client-side shortlist
- [x] Static API: `/api/partner-scout/search.json`
- [x] `src/utils/graphify.ts`: `findCompaniesByFilters()` (graph-first + fallback)
- [x] Python scripts stubbed: `bootstrap_brands_map.py`, `prompts_to_md.py`, `brands_to_md.py`
- [ ] Graphify configured with Gemini backend (`GEMINI_API_KEY` in env)
- [ ] `npm run graphify` script in `package.json`
- [ ] MCP server `travel-content` implementation
- [ ] ContentBuilder agent wired to MCP
- [ ] AEOAuditor agent wired to MCP
- [ ] PartnerScout agent (POST endpoint + Hermes skill)
