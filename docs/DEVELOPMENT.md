# Development Guide — TourUp Geo CMS

**Stack:** Astro 5 · TypeScript · sql.js · Alpine.js · gray-matter · Zod
**Output:** `static` (admin pages opt-in with `export const prerender = false`)
**Content:** Markdown files in `src/content/{collection}/*.md` via Astro Content Collections

---

## Architecture

```
src/
├── content/           # Astro Content Collections (source of truth)
│   ├── config.ts      # defineCollection schemas
│   ├── companies/     # ~908 .md (type: company)
│   ├── destinos/      # ES destination guides
│   ├── destinos_en/   # EN destination guides
│   ├── prompts/       # EN prompt landings
│   ├── prompts_es/    # ES prompt landings
│   ├── posts/         # Blog posts
│   ├── categorias_destino/
│   └── external_brands/
├── components/admin/  # Admin UI components
│   ├── Layout.astro
│   ├── Sidebar.astro
│   ├── TopBar.astro
│   ├── MetricCard.astro
│   └── DataTable.astro
├── lib/
│   └── auth.ts        # sql.js + crypto (sessions, users, password hashing)
├── pages/
│   ├── admin/[lang]/  # Dashboard, companies, destinos, prompts, posts, etc.
│   └── api/admin/     # RESTful CRUD (auth, companies, destinos, prompts, etc.)
├── utils/
│   ├── content.ts     # read/write .md via gray-matter
│   ├── validation.ts  # Zod schemas (company, destino, prompt, post, etc.)
│   └── slugify.ts     # deterministic slug generation
└── middleware.ts       # Session-based auth guard
scripts/
├── brands_to_md.py    # CSV + YAML → companies/*.md + external_brands/*.md
└── generate_graph.py  # Graph bootstrap
graphify-out/
└── graph.json         # Knowledge graph (community detection, queryable)
```

### Key difference from PRD

The PRD (`docs/tourup-geo-cms-PRD.md`) describes a **lucia-auth + hybrid output** system. The actual codebase uses **custom sql.js auth + static output with per-route `export const prerender = false`**. The `@astrojs/node` adapter is installed but the site remains `output: static`.

---

## Auth System

- **`src/lib/auth.ts`**: Custom implementation using `sql.js` (SQLite WASM) + Node `crypto`
  - Password hashing: `scryptSync` with random 16-byte salt
  - Sessions: UUID-based, 30-day expiry with auto-renewal on validation
  - DB file: `tourup-cms.db` (auto-created, gitignored)
- **`src/middleware.ts`**: Protects `/admin/*` and `/api/admin/*` routes
  - Reads `session` cookie, validates against SQLite
  - Redirects to login for pages, returns 401 JSON for API
- **Auth API**: `POST /api/admin/auth/login`, `POST /api/admin/auth/logout`, `GET /api/admin/auth/session`

## Admin Pages (SSR per-route)

All admin pages use `export const prerender = false` and `<AdminLayout>`:

| Route | Component |
|-------|-----------|
| `/admin/[lang]/login` | `login.astro` |
| `/admin/[lang]/dashboard` | `dashboard.astro` — metric cards |
| `/admin/[lang]/companies` | `companies.astro` + `new.astro` + `[slug]/edit.astro` |
| `/admin/[lang]/destinos` | `destinos.astro` + `new.astro` + `[slug]/edit.astro` |
| `/admin/[lang]/prompts` | `prompts.astro` + `new.astro` + `[slug]/edit.astro` |
| `/admin/[lang]/posts` | `posts.astro` + `new.astro` + `[slug]/edit.astro` |
| `/admin/[lang]/categorias` | `categorias.astro` + `new.astro` + `[slug]/edit.astro` |
| `/admin/[lang]/external-brands` | `external-brands.astro` + `new.astro` + `[slug]/edit.astro` |
| `/admin/[lang]/media` | `media.astro` (read-only Cloudinary grid) |
| `/admin/[lang]/settings` | `settings.astro` |

## API Routes

All under `/api/admin/[lang]/`. Every write endpoint validates with Zod before writing `.md` files.

| Resource | Endpoints |
|----------|-----------|
| Auth | `POST login`, `POST logout`, `GET session` |
| Companies | `GET/POST index`, `GET/PUT/DELETE [slug]` |
| Destinos | `GET/POST index`, `GET/PUT/DELETE [slug]` |
| Prompts | `GET/POST index`, `GET/PUT/DELETE [slug]` |
| Posts | `GET/POST index`, `GET/PUT/DELETE [slug]` |
| Categorias | `GET/POST index`, `GET/PUT/DELETE [slug]` |
| External Brands | `GET/POST index`, `GET/PUT/DELETE [slug]` |
| Media | `GET index` (list), `GET [publicId]` (detail) |
| Settings | `PUT index` (update hub settings) |

### Error format
```json
{ "errors": [{ "field": "summary", "message": "String must contain at least 50 character(s)" }] }
```

## Content Collections (src/content/config.ts)

All schemas use `zod`. GEO-required fields: `summary`, `canonical_answer`, `faq`.

- **companies**: `type: 'company'`, `title`, `distribution_role`, `sales_channel`, `destinos`, `nap`, `faq`, `rating`, `b2b_profile`, etc.
- **destinos/destinos_en**: `type: 'destino'`, `name`, `summary`, `faq`, `parent`, `lang`
- **categorias_destino**: `type: 'categoria_destino'`, `destino_slug`, `categoria`, `name`, `summary`
- **prompts/prompts_es**: `type: 'prompt_landing'`, `title`, `search_term`, `ai_platforms`, `brands_ai_mentions`, `summary`
- **external_brands**: `type: 'external_brand'`, `name`, `official_url`, `brand_role`, `country`
- **posts**: `title`, `description`, `pubDate`, `heroImage`, `tags`

## Scripts

### `scripts/brands_to_md.py`
```bash
python scripts/brands_to_md.py \
  --input bd_agencias_en.csv \
  --brands content/_meta/brands-map.yaml \
  --output content/
```
Generates `companies/*.md` and `external_brands/*.md` from CSV + YAML brand mappings.
- Supports `--update` (overwrite existing), `--validate` (dry-run)
- Handles both `name: type` and `name: {type: ...}` YAML formats

## Content File I/O (`src/utils/content.ts`)

```typescript
readEntry(collection, slug)     → matter object
createEntry(collection, slug, frontmatter, body) → { slug, filePath }
updateEntry(collection, slug, partialFrontmatter, body?)
deleteEntry(collection, slug)
listEntries(collection)          → slug[]
```

## Knowledge Graph

Generated by Graphify over `src/content/`:
- `graphify-out/graph.json` — full graph with communities
- `graphify-out/GRAPH_REPORT.md` — audit report
- `graphify-out/graph.html` — interactive visualization

Query: `graphify query "question"` or `graphify path "NodeA" "NodeB"`

## Seed Admin User

```bash
npx tsx scripts/seed-admin.ts
```

## Common Commands

```bash
npm run dev           # Astro dev server
npm run build         # Static build
npm run preview       # Preview production build
npm test              # Vitest
npm run seed          # Seed admin user
npm run graphify      # Rebuild knowledge graph
```

## Key Dependencies

| Package | Purpose |
|---------|---------|
| astro ^5.2.5 | Framework |
| @astrojs/node | Adapter (standalone) |
| @astrojs/sitemap | Sitemap generation |
| gray-matter | .md frontmatter parsing |
| zod | Schema validation |
| sql.js | SQLite WASM for auth |
| alpine.js | Admin UI interactivity |
| cloudinary | Media library |
