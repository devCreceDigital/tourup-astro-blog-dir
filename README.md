# tourup-astro-blog

Astro-based content site and AI-optimized directory for **tourup.co**.

This repo hosts:

- The **content blog** for Tourup (long-form articles, guides, etc.).
- An AI-oriented **Peru tour companies directory**, designed for:
  - traditional SEO;
  - Answer Engine Optimization (AEO) for ChatGPT, Gemini, Claude, Perplexity, Google AI Overviews, etc.

The main booking/app experience for Tourup lives in a separate **Next.js** repo. This project focuses on content, entities, and schema.

---

## High-level goals

1. **Comprehensibility for AI engines**

- Internal knowledge graph clearly encodes relations:
  - `PromptLanding → Company / ExternalBrand`.
- Astro pages are a faithful projection of that graph via:
  - HTML structure (answer-first, lists, tables).
  - JSON-LD (`WebPage` + `ItemList` + `FAQPage`).

2. **Credibility and entity consistency**

- Brand names and URLs are consistent across:
  - `Company` / `ExternalBrand` pages.
  - `PromptLanding` pages.
  - Structured data and off-site mentions.
- Pages include:
  - concise, citable facts;
  - external sources and timestamps for freshness.

3. **Agentic workflow**

- **Graphify** builds a graph from Markdown files for AI agents (Claude, Cursor, etc.).
- A dedicated **MCP server (`travel-content`)** exposes:
  - read/write access to `content/*` and `brands-map.yaml`;
  - graph queries on the Graphify output.
- Internal agents:
  - `ContentBuilder`: CSV → PromptLanding + Company/ExternalBrand pages.
  - `AEOAuditor`: checks and improves AEO patterns and schema.

---

## Tech stack

- [Astro](https://astro.build/) (TypeScript, Content Collections)
- Markdown content:
  - `content/companies/*.md`
  - `content/external_brands/*.md`
  - `content/prompts/*.md`
- Python + Pandas:
  - scripts under `scripts/` for CSV → Markdown ingestion.
- Obsidian:
  - this repo can be used directly as a vault for human editing.
- Graphify:
  - `/graphify .` builds `graphify-out/graph.json` and reports for agents.
- MCP:
  - external Astro Docs MCP (for framework docs);
  - future internal MCP server `travel-content`.

---

## Repository structure

```text
.
README.md
OPEN_SPECS.md
.gitignore
package.json
tsconfig.json
astro.config.mjs

public/
  favicon.ico
  robots.txt
  sitemap.xml

src/
  content/
    config.ts
  layouts/
    Layout.astro
  components/
    Header.astro
    Footer.astro
    JsonLdPromptLanding.astro
  pages/
    index.astro
    blog/
      index.astro
      [slug].astro
    en/
      ai-prompts/
        [slug].astro
    companies/
      [slug].astro

content/
  companies/
  external_brands/
  prompts/
  _meta/
    brands-map.yaml

scripts/
  bootstrap_brands_map.py
  prompts_to_md.py
  brands_to_md.py

graphify-out/
  .gitkeep

.obsidian/
  app.json
```

---

## How this repo fits with the main Tourup app

- **Next.js repo** (separate):
  - main web app and booking flows.
- **This Astro repo**:
  - content/blog + AI directory, can be deployed at:
    - `blog.tourup.co`, or
    - `tourup.co/blog` via reverse proxy.

Integration points:

- Shared brand/entities:
  - same slugs/IDs for tour companies across both repos when possible.
- Shared analytics & SEO:
  - UTM / internal linking from app → content and back.

---

## Development workflow

1. **Clone repo & install**
   ```bash
   npm install
   npm run dev
   ```

2. **Use as Obsidian vault**
   - Open this folder as a vault in Obsidian.
   - Use templates for:
     - `PromptLanding`
     - `Company`
     - `ExternalBrand`

3. **Run ingestion scripts (once data is available)**
   - `bootstrap_brands_map.py`: create/update `brands-map.yaml` from AI prompt CSVs.
   - `prompts_to_md.py`: generate `content/prompts/*.md` from AI prompts CSVs.
   - `brands_to_md.py`: generate `content/companies/*.md` / `content/external_brands/*.md` from mapping + agency CSV.

4. **Build knowledge graph**
   ```bash
   /graphify .
   ```
   - Produces `graphify-out/graph.json` and reports, which agents query first.

5. **MCP integration (future step)**
   - Configure `travel-content` MCP server to:
     - list/read/write content files;
     - read the graph;
     - run ingestion/generation tools.

---

## Status

- [ ] Astro scaffolding
- [ ] Content collections wired
- [ ] Ingestion scripts stubbed
- [ ] Sample content for:
  - 1–2 `Company`
  - 1–2 `ExternalBrand`
  - 1–2 `PromptLanding`
- [ ] Graphify run & validated
- [ ] MCP `travel-content` server prototype
