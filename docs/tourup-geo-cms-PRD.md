# PRD — tourup-geo-cms
## Agentic Content Hub for GEO/AEO/AAIO Tourism Platform
**Version:** 1.0.0 · **Status:** Draft · **Owner:** TourUp Engineering  
**Stack:** Astro 5 · TypeScript · Astro DB / SQLite · Alpine.js · lucia-auth  
**Agent:** Hermes (skills: `seo-ia-geo`, `tourup-ai-prompt-landing-builder`, `tourup-ai-search-prompt-ingestion`)

---

## 1. Executive Summary

`tourup-geo-cms` is a lightweight, agent-native Content Management System built on top of an existing Astro 5 static site. It extends the site from `output: static` to `output: hybrid`, exposing admin UI pages and JSON API routes that allow human editors and the Hermes AI agent to create, read, update, and delete `.md` content entries across all content collections.

The system prioritizes three outcomes:

1. **GEO citability** — every page rendered from a CMS entry must satisfy the answer-nugget, BLUF, and schema.org requirements defined in the `seo-ia-geo` skill.
2. **Agent-first pipeline** — the Hermes agent must be able to add new entries via structured API calls without human intervention, following the pipeline defined in `tourup-ai-search-prompt-ingestion` and `tourup-ai-prompt-landing-builder`.
3. **Brand safety** — all writes are validated through Zod schemas before any `.md` file is modified, preventing hallucinated or malformed frontmatter from entering the content graph.

---

## 2. Problem Statement

### 2.1 Current Pain Points

| Pain point | Impact |
|---|---|
| `output: static` blocks server-side auth and API routes | Admin UI impossible without external CMS |
| Content lives only in `.md` files on disk | No audit trail, no conflict resolution, no draft workflow |
| Hermes agent writes `.md` files via Python scripts only | No structured API contract; errors are silent |
| No admin UI | Non-technical editors cannot contribute content |
| No GEO compliance enforcement at write time | Entries can be published without canonical_answer, FAQPage schema, or BLUF |
| Brand resolution scattered in `brands-map.yaml` + Python | No single admin surface to manage the brand graph |

### 2.2 Opportunity

Astro 5's hybrid output mode enables API routes and SSR pages without abandoning the static rendering model for public-facing content. This allows a thin admin layer to sit alongside the production site, sharing the same content collections, without introducing a separate CMS service.

---

## 3. Goals & Non-Goals

### Goals

- Implement a secure admin UI (login, dashboard, CRUD for all collections) using Astro pages + Alpine.js.
- Expose RESTful JSON API routes at `/api/admin/*` that the Hermes agent calls directly.
- Enforce GEO/AEO compliance via Zod at the API boundary (required fields: `canonical_answer`, `summary`, `faq`, `llm_intent`).
- Write validated content to `src/content/{collection}/{slug}.md` via `gray-matter`.
- Support the existing i18n pattern (`lang: 'en' | 'es'`) across all admin routes.
- Maintain full SSG for all public-facing pages; only `/admin/*` and `/api/*` are SSR.

### Non-Goals

- Real-time collaborative editing.
- Media transformation or CDN upload (media library is read-only in v1).
- Full Git integration or CI trigger (covered by existing deployment pipeline).
- Public API (all `/api/admin/*` routes are protected by session middleware).
- Replacing the Hermes Python scripts (they remain; the API is additive).

---

## 4. User Stories

### Human Editor

> As a content editor, I want to log in to `/admin/es/dashboard` and see a summary of all content collections, so I know what's published and what's missing.

> As a content editor, I want to create a new company entry with a form that enforces required fields (title, summary, distribution_role, destinos), so I don't accidentally publish incomplete data.

> As a content editor, I want to edit an existing destino's FAQ block visually, so I don't have to touch YAML directly.

> As a content editor, I want to upload or link a hero image for a post entry and see a character-count on the SEO description, exactly as shown in the `editor_de_artículos_screen` reference.

### Hermes Agent

> As the Hermes agent, I want to call `POST /api/admin/en/prompts` with a JSON body derived from a CSV row, and receive a `201` with the created slug, so I can run the full ingestion pipeline without manual steps.

> As the Hermes agent, I want to call `GET /api/admin/en/companies?destino=cusco` and receive a filtered JSON array, so I can resolve brands for a PromptLanding without reading the filesystem.

> As the Hermes agent, I want validation errors returned as structured JSON (field → message), so I can self-correct and retry without human intervention.

---

## 5. Design System & UI Reference

All admin UI follows the **Achromatic Swiss Grid** design system (`DESIGN_achromatic_swiss_grid.md`).

### 5.1 Design Tokens (summary)

| Token | Value |
|---|---|
| Primary | `#000000` |
| Surface | `#f9f9f9` |
| Hairline border | `#e5e5e5` (1px solid) |
| Secondary text | `#737373` |
| Font | Geist (via Google Fonts) |
| Base radius | 10px (inputs/buttons), 14px (cards) |
| Tag radius | 26px (pill) |
| Nav height | 64px |
| Max content width | 1200px |
| Grid gap | 8px (elements), 48px (sections) |

### 5.2 Screen References

Four reference screens define the admin UI layout:

**`dashboard_de_contenidos_screen`** — Sidebar nav (240px fixed) + main content area. Sidebar shows: logo + version, nav links (DASHBOARD / CONTENT / ANALYTICS / MEDIA / SETTINGS), "+ Create New" primary button, SUPPORT + LOGOUT at bottom. Main area: page title H1 + subtitle, metric cards in a 4-col grid.

**`editor_de_artículos_screen`** — Split layout: editor (70%) + settings sidebar (30%). Editor: large ghost H1 input for article title, slug input + category select below, rich-text toolbar (B / I / U / H1 / H2 / bullet / numbered / link / image), full-height textarea. Settings sidebar: "Article Settings" heading, Featured Image uploader, SEO Description textarea (0/160 counter), Tags input with removable pills.

**`biblioteca_de_medios_screen`** — Full-width grid layout with search bar in top nav. Page title "Library" + subtitle. Filter + Upload buttons. 4-column masonry grid of media cards (thumbnail, filename, file size). Selectable state shown with checkmark badge.

**`configuración_del_hub_screen`** — Settings page: full-width sections separated by card containers (1px border, 14px radius). Each section has a title + subtitle, then setting rows with label + description on the left, toggle/select on the right. Footer: CANCEL + SAVE CHANGES buttons.

### 5.3 Component Inventory

```
components/admin/
  Layout.astro          — Shell: sidebar + main slot
  Sidebar.astro         — Nav links, Create New CTA, logo
  TopBar.astro          — Search, notifications, user avatar
  MetricCard.astro      — Stat card: label + large number
  DataTable.astro       — Sortable table with row actions (Edit / Delete)
  FormField.astro       — Label + input/select/textarea + error message
  MarkdownEditor.astro  — Toolbar + textarea (Alpine.js state)
  ImagePicker.astro     — Upload zone + URL input
  TagInput.astro        — Comma-separated pill input (Alpine.js)
  Toggle.astro          — Settings toggle switch
  GeoScore.astro        — GEO compliance indicator (0–100)
  BrandResolver.astro   — Inline brand-map lookup widget
  FAQBlock.astro        — Add/remove/edit FAQ rows
  LanguageToggle.astro  — ES ↔ EN switcher (affects /admin/[lang]/*)
```

---

## 6. Technical Architecture

### 6.1 Astro Config Change

```typescript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://tourup.co',
  output: 'hybrid',           // ← CRITICAL CHANGE from 'static'
  adapter: node({ mode: 'standalone' }),
  trailingSlash: 'always',
  integrations: [sitemap(/* existing config */)],
});
```

All existing `getStaticPaths()` pages remain fully static. Only pages under `src/pages/admin/` and `src/pages/api/` are SSR.

### 6.2 Authentication (lucia-auth + SQLite)

```typescript
// src/lib/auth.ts
import { lucia } from 'lucia';
import { astro } from 'lucia/middleware';
import { betterSqlite3 } from '@lucia-auth/adapter-sqlite';
import Database from 'better-sqlite3';

const db = new Database('tourup-cms.db');
db.exec(`
  CREATE TABLE IF NOT EXISTS users (id TEXT, username TEXT, hashed_password TEXT);
  CREATE TABLE IF NOT EXISTS user_session (id TEXT, user_id TEXT, active_expires INTEGER, idle_expires INTEGER);
  CREATE TABLE IF NOT EXISTS user_key (id TEXT, user_id TEXT, hashed_password TEXT);
`);

export const auth = lucia({
  adapter: betterSqlite3(db, {
    user: 'users',
    session: 'user_session',
    key: 'user_key',
  }),
  middleware: astro(),
  sessionCookie: { secure: import.meta.env.PROD },
});
```

```typescript
// src/middleware.ts
import { auth } from './lib/auth';
import type { MiddlewareHandler } from 'astro';

export const onRequest: MiddlewareHandler = async (ctx, next) => {
  const { pathname } = new URL(ctx.request.url);
  const isAdminRoute = pathname.startsWith('/admin/');
  const isLoginRoute = /^\/admin\/[^/]+\/login\/?$/.test(pathname);
  const isApiAuth = pathname.startsWith('/api/admin/auth/');

  if (isAdminRoute && !isLoginRoute) {
    const authRequest = auth.handleRequest(ctx);
    const session = await authRequest.validate();
    if (!session) return ctx.redirect(`/admin/es/login`);
    ctx.locals.session = session;
  }
  return next();
};
```

### 6.3 File I/O Layer

```typescript
// src/utils/content.ts
import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

const CONTENT_DIR = path.resolve('src/content');

export async function readEntry(collection: string, slug: string) {
  const filePath = path.join(CONTENT_DIR, collection, `${slug}.md`);
  const raw = await fs.readFile(filePath, 'utf-8');
  return matter(raw);
}

export async function createEntry(
  collection: string,
  slug: string,
  frontmatter: Record<string, unknown>,
  body = ''
) {
  const filePath = path.join(CONTENT_DIR, collection, `${slug}.md`);
  await fs.writeFile(filePath, matter.stringify(body, frontmatter), 'utf-8');
  return { slug, filePath };
}

export async function updateEntry(
  collection: string,
  slug: string,
  frontmatter: Partial<Record<string, unknown>>,
  body?: string
) {
  const existing = await readEntry(collection, slug);
  const merged = { ...existing.data, ...frontmatter };
  const filePath = path.join(CONTENT_DIR, collection, `${slug}.md`);
  await fs.writeFile(filePath, matter.stringify(body ?? existing.content, merged), 'utf-8');
}

export async function deleteEntry(collection: string, slug: string) {
  await fs.unlink(path.join(CONTENT_DIR, collection, `${slug}.md`));
}

export async function listEntries(collection: string) {
  const dir = path.join(CONTENT_DIR, collection);
  const files = await fs.readdir(dir);
  return files.filter(f => f.endsWith('.md')).map(f => f.replace('.md', ''));
}
```

### 6.4 Zod Validation Schemas

All API inputs are validated with Zod before any file write. GEO-required fields are explicitly marked.

```typescript
// src/utils/validation.ts
import { z } from 'zod';

// GEO compliance baseline (shared by all content types)
const geoBase = z.object({
  summary:          z.string().min(50).max(300), // BLUF requirement
  canonical_answer: z.string().min(30).max(500), // AEO answer nugget
  llm_intent:       z.string().optional(),       // primary intent signal
  last_updated:     z.string().datetime().optional(),
});

export const companySchema = geoBase.extend({
  type:              z.literal('company'),
  title:             z.string().min(2),
  distribution_role: z.enum(['tour_operator','retail_travel_agency','dmc','wholesaler','other']),
  sales_channel:     z.enum(['online','offline','omnichannel']),
  destinos:          z.array(z.string()).min(1),
  categorias:        z.array(z.string()).default([]),
  rating:            z.number().min(0).max(5).optional(),
  reviews_count:     z.number().int().optional(),
  nap:               z.object({
    city: z.string(), country: z.string(),
    phone: z.string().optional(), email: z.string().email().optional(),
  }).optional(),
  contact:           z.object({ website: z.string().url().optional() }).optional(),
  faq:               z.array(z.object({ question: z.string(), answer: z.string() })).default([]),
  b2b_profile:       z.string().optional(),
});

export const destinoSchema = geoBase.extend({
  type:        z.literal('destino'),
  lang:        z.enum(['es','en']),
  name:        z.string().min(2),
  country:     z.string().default('Peru'),
  region:      z.string().optional(),
  parent:      z.string().default('peru'),
  seo_title:   z.string().optional(),
  faq:         z.array(z.object({ question: z.string(), answer: z.string() })).default([]),
});

export const promptLandingSchema = geoBase.extend({
  type:                z.literal('prompt_landing'),
  lang:                z.enum(['es','en']),
  title:               z.string().min(10),
  search_term:         z.string().optional(),
  ai_platforms:        z.array(z.enum(['ChatGPT','Gemini','Claude','Perplexity'])),
  prompt_text:         z.string().min(10),
  primary_intent:      z.enum(['commercial','informational','navigational','transactional']),
  secondary_intent:    z.string().optional(),
  destination_cluster: z.string().optional(),
  category_cluster:    z.string().optional(),
  destinos:            z.array(z.object({
    entity_type: z.string(), entity_slug: z.string(),
  })).default([]),
  brands_ai_mentions:  z.array(z.object({
    name: z.string(),
    entity_type: z.enum(['company','external_brand','unknown']),
    entity_slug: z.string().optional(),
  })).default([]),
  parent:              z.string().optional(),
  last_ai_check_date:  z.string().optional(),
});

export const postSchema = geoBase.extend({
  type:        z.literal('post').optional(),
  title:       z.string().min(5),
  description: z.string().min(20).max(300),
  pubDate:     z.string().datetime(),
  updatedDate: z.string().datetime().optional(),
  heroImage:   z.string().url().optional(),
  tags:        z.array(z.string()).default([]),
  lang:        z.enum(['es','en']).default('es'),
});

export const categorySchema = z.object({
  type:           z.literal('categoria_destino'),
  destino_slug:   z.string(),
  categoria:      z.string(),
  name:           z.string(),
  summary:        z.string().min(20),
  canonical_answer: z.string().optional(),
});

export const externalBrandSchema = z.object({
  type:          z.literal('external_brand'),
  name:          z.string(),
  official_url:  z.string().url().optional(),
  brand_role:    z.string().optional(),
  country:       z.string().optional(),
  mentioned_in_prompts: z.array(z.string()).default([]),
});
```

---

## 7. Route Specification

### 7.1 Admin UI Pages (SSR, protected)

| Route | Component | Description |
|---|---|---|
| `/admin/[lang]/login` | `login.astro` | Username + password form. Redirects to dashboard on success. |
| `/admin/[lang]/dashboard` | `dashboard.astro` | Metric cards: total companies, destinos, prompts, posts. Recent activity list. |
| `/admin/[lang]/companies` | `companies/index.astro` | DataTable: title, destinos, rating, distribution_role, Edit/Delete actions. Filter by destino. |
| `/admin/[lang]/companies/new` | `companies/new.astro` | Create form. GeoScore indicator. |
| `/admin/[lang]/companies/[slug]/edit` | `companies/[slug]/edit.astro` | Edit form pre-populated from `.md`. |
| `/admin/[lang]/destinos` | `destinos/index.astro` | DataTable: name, lang, faq count. |
| `/admin/[lang]/destinos/new` | `destinos/new.astro` | Create form. |
| `/admin/[lang]/destinos/[slug]/edit` | `destinos/[slug]/edit.astro` | Edit form. |
| `/admin/[lang]/prompts` | `prompts/index.astro` | DataTable: title, ai_platforms, primary_intent, brands count. |
| `/admin/[lang]/prompts/new` | `prompts/new.astro` | Create form. BrandResolver widget. |
| `/admin/[lang]/prompts/[slug]/edit` | `prompts/[slug]/edit.astro` | Edit form. |
| `/admin/[lang]/posts` | `posts/index.astro` | DataTable: title, pubDate, tags. |
| `/admin/[lang]/posts/new` | `posts/new.astro` | MarkdownEditor + ImagePicker + SEO sidebar (editor_de_artículos_screen pattern). |
| `/admin/[lang]/posts/[slug]/edit` | `posts/[slug]/edit.astro` | Edit form. |
| `/admin/[lang]/categorias` | `categorias/index.astro` | DataTable: name, destino_slug. |
| `/admin/[lang]/external-brands` | `external-brands/index.astro` | DataTable: name, brand_role, mentioned_in_prompts count. |
| `/admin/[lang]/media` | `media/index.astro` | Read-only grid view (biblioteca_de_medios_screen). Upload to `/public/media/`. |
| `/admin/[lang]/settings` | `settings/index.astro` | Hub settings: language, timezone, public access toggle (configuración_del_hub_screen). |

`getStaticPaths` for all admin pages returns `[{ params: { lang: 'en' } }, { params: { lang: 'es' } }]`.

### 7.2 JSON API Routes (SSR, protected)

All routes accept and return `application/json`. All write operations require `Content-Type: application/json`.

#### Authentication

| Method | Route | Description |
|---|---|---|
| POST | `/api/admin/auth/login` | `{ username, password }` → session cookie |
| POST | `/api/admin/auth/logout` | Clears session cookie |
| GET | `/api/admin/auth/session` | Returns `{ userId, username }` or 401 |

#### Companies

| Method | Route | Body / Params | Response |
|---|---|---|---|
| GET | `/api/admin/[lang]/companies` | `?destino=cusco&q=search&page=1` | `{ data: Company[], total, page }` |
| POST | `/api/admin/[lang]/companies` | `CompanyInput` (Zod validated) | `{ slug, filePath }` or `{ errors }` |
| GET | `/api/admin/[lang]/companies/[slug]` | — | `Company` frontmatter + body |
| PUT | `/api/admin/[lang]/companies/[slug]` | Partial `CompanyInput` | `{ slug }` |
| DELETE | `/api/admin/[lang]/companies/[slug]` | — | `{ deleted: true }` |

#### Destinos

| Method | Route | Body / Params | Response |
|---|---|---|---|
| GET | `/api/admin/[lang]/destinos` | `?q=` | `{ data: Destino[], total }` |
| POST | `/api/admin/[lang]/destinos` | `DestinoInput` | `{ slug }` or `{ errors }` |
| GET | `/api/admin/[lang]/destinos/[slug]` | — | Destino entry |
| PUT | `/api/admin/[lang]/destinos/[slug]` | Partial `DestinoInput` | `{ slug }` |
| DELETE | `/api/admin/[lang]/destinos/[slug]` | — | `{ deleted: true }` |

#### Prompts

| Method | Route | Body / Params | Response |
|---|---|---|---|
| GET | `/api/admin/[lang]/prompts` | `?intent=commercial&platform=ChatGPT` | `{ data: PromptLanding[], total }` |
| POST | `/api/admin/[lang]/prompts` | `PromptLandingInput` | `{ slug }` or `{ errors }` |
| GET | `/api/admin/[lang]/prompts/[slug]` | — | PromptLanding entry |
| PUT | `/api/admin/[lang]/prompts/[slug]` | Partial input | `{ slug }` |
| DELETE | `/api/admin/[lang]/prompts/[slug]` | — | `{ deleted: true }` |

#### Posts, Categories, External Brands

Same REST pattern as above for:
- `/api/admin/[lang]/posts`
- `/api/admin/[lang]/categorias`
- `/api/admin/[lang]/external-brands`

#### Error Response Shape (all routes)

```json
{
  "errors": [
    { "field": "summary", "message": "String must contain at least 50 character(s)" },
    { "field": "canonical_answer", "message": "Required" }
  ]
}
```

---

## 8. GEO Compliance Gate

Every POST and PUT to a content API route passes through the **GEO Compliance Gate** before writing to disk.

### 8.1 Required Fields by Collection

| Collection | GEO-Required Fields |
|---|---|
| `companies` | `summary` (50–300), `canonical_answer` (30–500), `faq` (min 3 items) |
| `destinos` | `summary`, `canonical_answer`, `faq` (min 7 items per `seo-ia-geo` skill) |
| `prompts` | `summary`, `canonical_answer`, `primary_intent`, `brands_ai_mentions` |
| `posts` | `summary` (as `description`), `canonical_answer` |
| `categorias` | `summary` |

### 8.2 GeoScore Calculation

The admin UI displays a `GeoScore` badge (0–100) computed client-side as:

```
score = 0
+ 20 if summary.length >= 50
+ 20 if canonical_answer.length >= 30
+ 20 if faq.length >= 3
+ 20 if llm_intent is set
+ 20 if last_updated within 90 days
```

A score below 60 shows a warning; below 40 blocks publication (API returns 422 with `geo_score` in the error body).

---

## 9. Hermes Agent Integration

### 9.1 Agent API Contract

The Hermes agent uses the same JSON API as human editors. The following environment variable must be set:

```
TOURUP_ADMIN_SESSION_TOKEN=<lucia session token>
```

The agent authenticates via `POST /api/admin/auth/login` on startup and stores the session cookie for subsequent requests.

### 9.2 Prompt Ingestion Flow (agent calls)

This replaces the Python-only pipeline with a hybrid API + Python flow:

```
CSV row
  → Python: normalize_row() + resolve_brands()   [existing scripts]
  → HTTP POST /api/admin/en/prompts               [new]
  ← { slug } or { errors }
  → If errors: agent self-corrects and retries (max 3)
  → HTTP PUT /api/admin/en/external-brands/{slug} [if new brand]
  → Python: generate_graph.py                     [existing]
```

### 9.3 Skill Trigger Conditions

The Hermes agent activates the following skills when calling the CMS API:

| Skill | Trigger |
|---|---|
| `tourup-ai-prompt-landing-builder` | POST to `/api/admin/[lang]/prompts` |
| `tourup-ai-search-prompt-ingestion` | Batch processing CSV files |
| `seo-ia-geo` | Reviewing GeoScore < 60 on any entry |

### 9.4 Agent-Readable Endpoints

For agent navigation without human intervention:

- `GET /api/admin/en/companies?destino={slug}` — brand resolution lookup
- `GET /api/admin/en/prompts?intent=commercial` — find existing prompts to avoid slug collision
- `GET /api/admin/auth/session` — health check before batch operations

---

## 10. File Structure

```
tourup-geo-cms (delta on existing project)
│
├── astro.config.mjs                    ← output: 'hybrid', adapter: node
├── tourup-cms.db                       ← lucia-auth SQLite (gitignored)
│
├── src/
│   ├── middleware.ts                   ← auth guard for /admin/*
│   ├── lib/
│   │   └── auth.ts                     ← lucia instance
│   │
│   ├── utils/
│   │   ├── content.ts                  ← read/write .md files
│   │   ├── slugify.ts                  ← deterministic slug generation
│   │   └── validation.ts              ← Zod schemas (all collections)
│   │
│   ├── components/admin/
│   │   ├── Layout.astro
│   │   ├── Sidebar.astro
│   │   ├── TopBar.astro
│   │   ├── MetricCard.astro
│   │   ├── DataTable.astro
│   │   ├── FormField.astro
│   │   ├── MarkdownEditor.astro
│   │   ├── ImagePicker.astro
│   │   ├── TagInput.astro
│   │   ├── Toggle.astro
│   │   ├── GeoScore.astro
│   │   ├── BrandResolver.astro
│   │   ├── FAQBlock.astro
│   │   └── LanguageToggle.astro
│   │
│   ├── pages/
│   │   ├── admin/
│   │   │   └── [lang]/
│   │   │       ├── login.astro
│   │   │       ├── dashboard.astro
│   │   │       ├── companies/
│   │   │       │   ├── index.astro
│   │   │       │   ├── new.astro
│   │   │       │   └── [slug]/edit.astro
│   │   │       ├── destinos/
│   │   │       │   ├── index.astro
│   │   │       │   ├── new.astro
│   │   │       │   └── [slug]/edit.astro
│   │   │       ├── prompts/
│   │   │       │   ├── index.astro
│   │   │       │   ├── new.astro
│   │   │       │   └── [slug]/edit.astro
│   │   │       ├── posts/
│   │   │       │   ├── index.astro
│   │   │       │   ├── new.astro
│   │   │       │   └── [slug]/edit.astro
│   │   │       ├── categorias/index.astro
│   │   │       ├── external-brands/index.astro
│   │   │       ├── media/index.astro
│   │   │       └── settings/index.astro
│   │   │
│   │   └── api/
│   │       └── admin/
│   │           ├── auth/
│   │           │   ├── login.ts
│   │           │   ├── logout.ts
│   │           │   └── session.ts
│   │           └── [lang]/
│   │               ├── companies/
│   │               │   ├── index.ts       ← GET/POST
│   │               │   └── [slug].ts      ← GET/PUT/DELETE
│   │               ├── destinos/
│   │               │   ├── index.ts
│   │               │   └── [slug].ts
│   │               ├── prompts/
│   │               │   ├── index.ts
│   │               │   └── [slug].ts
│   │               ├── posts/
│   │               │   ├── index.ts
│   │               │   └── [slug].ts
│   │               ├── categorias/
│   │               │   ├── index.ts
│   │               │   └── [slug].ts
│   │               └── external-brands/
│   │                   ├── index.ts
│   │                   └── [slug].ts
│   │
│   └── content/                        ← existing (unchanged)
│       ├── config.ts
│       ├── companies/*.md
│       ├── destinos/*.md
│       ├── destinos_en/*.md
│       ├── prompts/*.md
│       ├── prompts_es/*.md
│       ├── posts/*.md
│       ├── categorias_destino/*.md
│       └── external_brands/*.md
```

---

## 11. Dependencies

```bash
# Production
npm install @astrojs/node
npm install lucia @lucia-auth/adapter-sqlite
npm install better-sqlite3
npm install arctic
npm install gray-matter
npm install alpinejs

# Dev
npm install -D @types/better-sqlite3
```

### Package versions (pinned for compatibility with Astro 5)

| Package | Version |
|---|---|
| `@astrojs/node` | ^9.0.0 |
| `lucia` | ^3.0.0 |
| `@lucia-auth/adapter-sqlite` | ^3.0.0 |
| `better-sqlite3` | ^9.0.0 |
| `arctic` | ^1.0.0 |
| `gray-matter` | ^4.0.3 |
| `alpinejs` | ^3.13.0 |

---

## 12. Security Requirements

| Requirement | Implementation |
|---|---|
| All `/admin/*` routes require session | `src/middleware.ts` — lucia session check |
| All API routes require session | Same middleware; return 401 JSON on failure |
| CSRF protection | `SameSite=Strict` cookie + origin check on state-changing requests |
| Zod validation on all writes | `src/utils/validation.ts` — applied at API route, not just UI |
| Output sanitization | All form fields HTML-escaped before rendering in templates |
| Rate limiting on auth routes | 5 attempts / 15 min per IP (implemented in `login.ts`) |
| Slug path traversal prevention | `slugify()` strips `..`, `/`, and non-ASCII before constructing file path |
| Session HTTP-only | lucia default — cookie is `HttpOnly; Secure; SameSite=Strict` |

---

## 13. i18n Pattern

Admin pages use the existing project i18n helper:

```typescript
// All admin .astro pages
const { lang } = Astro.params as { lang: 'es' | 'en' };
const t = (es: string, en: string) => lang === 'en' ? en : es;
```

`getStaticPaths` for all admin pages:
```typescript
export function getStaticPaths() {
  return [{ params: { lang: 'en' } }, { params: { lang: 'es' } }];
}
```

Content collection mapping by language:
- `lang === 'es'` → reads/writes `destinos/`, `prompts_es/`
- `lang === 'en'` → reads/writes `destinos_en/`, `prompts/`
- `companies/`, `posts/`, `categorias_destino/`, `external_brands/` are language-agnostic

---

## 14. Deployment

### Local development

```bash
npm run dev   # Astro dev server with HMR; /admin/* routes work via SSR
```

### Production (standalone Node)

```bash
npm run build
node dist/server/entry.mjs
```

### Vercel / Netlify

Swap adapter:
```typescript
// astro.config.mjs
import vercel from '@astrojs/vercel/serverless';
adapter: vercel()
```

### Environment variables

```
# Required
TOURUP_ADMIN_SESSION_SECRET=<32-char random string>

# Optional (for Hermes agent)
TOURUP_ADMIN_SESSION_TOKEN=<lucia session token for agent>

# Production
PROD=true
```

---

## 15. Acceptance Criteria

### AC-1: Authentication
- [ ] `POST /api/admin/auth/login` with valid credentials returns `Set-Cookie` with session
- [ ] Accessing `/admin/es/dashboard` without session redirects to `/admin/es/login`
- [ ] `POST /api/admin/auth/logout` clears session and redirects to login

### AC-2: Company CRUD
- [ ] `POST /api/admin/en/companies` with valid body creates `src/content/companies/{slug}.md`
- [ ] `POST /api/admin/en/companies` with missing `summary` returns `{ errors: [{ field: 'summary', ... }] }`
- [ ] `PUT /api/admin/en/companies/{slug}` merges frontmatter (does not overwrite body)
- [ ] `DELETE /api/admin/en/companies/{slug}` removes file; returns 404 if not found

### AC-3: GEO Gate
- [ ] Entry with `faq.length < 3` (company) returns 422 with `geo_score: 40`
- [ ] Entry with all GEO fields populated returns 201 with `geo_score: 100`
- [ ] GeoScore badge in admin UI updates in real time as form fields change

### AC-4: Hermes Agent Pipeline
- [ ] Agent can authenticate and call `POST /api/admin/en/prompts` with CSV-normalized payload
- [ ] Validation errors are returned as structured JSON (agent can parse and retry)
- [ ] Created `.md` file has correct frontmatter matching `promptLandingSchema`

### AC-5: UI Fidelity
- [ ] Dashboard shows metric cards matching `dashboard_de_contenidos_screen` layout
- [ ] Post editor shows split layout (editor 70% / settings 30%) matching `editor_de_artículos_screen`
- [ ] Media library shows 4-col grid matching `biblioteca_de_medios_screen`
- [ ] Settings page shows card-grouped toggles matching `configuración_del_hub_screen`
- [ ] All UI uses Geist font, #000000 primary, #e5e5e5 hairline borders (Achromatic Swiss Grid)

### AC-6: Static Pages Unaffected
- [ ] `npm run build` succeeds with all existing `getStaticPaths` pages generating HTML
- [ ] No public-facing page gains SSR overhead from the admin layer

---

## 16. Open Questions

| # | Question | Owner | Due |
|---|---|---|---|
| OQ-1 | Should media uploads write to `public/media/` (served statically) or to an external CDN? | Product | Sprint 1 |
| OQ-2 | Does the agent need a webhook to trigger graph regeneration, or is a manual script call acceptable for v1? | Engineering | Sprint 1 |
| OQ-3 | Should draft/publish state be stored in frontmatter (`status: draft|published`) or as a separate SQLite table? | Product | Sprint 1 |
| OQ-4 | Is OAuth (Google) needed for admin auth, or username/password sufficient for the v1 team size? | Product | Sprint 0 |

---

## 17. Roadmap

### Sprint 0 (Setup)
- [ ] Change `output: static` → `output: hybrid` in `astro.config.mjs`
- [ ] Install dependencies and configure lucia-auth + SQLite
- [ ] Create `src/middleware.ts` auth guard
- [ ] Seed admin user via `scripts/seed-admin.ts`

### Sprint 1 (Core CRUD)
- [ ] Implement `src/utils/content.ts` file I/O
- [ ] Implement `src/utils/validation.ts` Zod schemas
- [ ] Build API routes for companies, destinos, prompts (GET/POST/PUT/DELETE)
- [ ] Build auth API routes (login/logout/session)
- [ ] Build `Layout.astro`, `Sidebar.astro`, `DataTable.astro`

### Sprint 2 (Admin UI)
- [ ] Dashboard with metric cards
- [ ] Companies list + create/edit forms
- [ ] Destinos list + create/edit forms
- [ ] Prompts list + create/edit forms (with BrandResolver)

### Sprint 3 (Post Editor + Media)
- [ ] Post editor with MarkdownEditor + ImagePicker + SEO sidebar
- [ ] Media library (read-only, upload to `/public/media/`)
- [ ] GeoScore component

### Sprint 4 (Agent Integration + Hardening)
- [ ] Document agent API contract
- [ ] End-to-end test: Hermes agent → POST prompt → verify `.md` created
- [ ] Security audit (CSRF, rate limiting, path traversal)
- [ ] Settings page
- [ ] Production deployment guide

---

*Document maintained by TourUp Engineering. Last updated: 2026-06-25.*
