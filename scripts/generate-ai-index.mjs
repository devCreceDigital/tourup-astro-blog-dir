/**
 * generate-ai-index.mjs
 *
 * Standalone AI index generator — replaces aeo.js's aiIndex generator
 * to avoid ENOSPC (no markdown file copying overhead).
 *
 * Reads markdown from src/content, generates structured ai-index.json
 * with enrichment metadata for LLM consumption.
 *
 * Usage: node scripts/generate-ai-index.mjs
 */
import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'fs';
import { join, relative, basename } from 'path';
import { createHash } from 'crypto';
import { isOrphanDuplicate, isNamelessTitle, untranslatedEsPromptSlugs } from './lib/content-dedupe.mjs';

const SITE = 'https://guia.tourup.co';
const SRC_CONTENT = 'src/content';
// Prompts /es/ que son copia sin traducir del inglés: noindex, no se incluyen en el índice.
const untranslatedEs = untranslatedEsPromptSlugs(join(SRC_CONTENT, 'prompts_es'), join(SRC_CONTENT, 'prompts'));
const PUBLIC_DIR = 'public';
const SKIP_DIRS = new Set(['node_modules', 'public', 'dist', '.git', '__tests__']);

// ── Helpers ────────────────────────────────────────────────────
function parseFrontmatter(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)/);
  if (!match) return { frontmatter: {}, body: content };

  const yaml = match[1];
  const body = match[2].trim();
  const fm = {};
  const lines = yaml.split('\n');

  let currentTopKey = null;
  let currentObj = {};
  let currentObjKey = null;

  for (const line of lines) {
    const rawIndent = line.length - line.trimStart().length;

    // Top-level key (indent 0)
    if (rawIndent === 0) {
      // Flush previous nested object
      if (currentTopKey) {
        if (Object.keys(currentObj).length > 0) {
          fm[currentTopKey] = currentObj;
        }
        currentObj = {};
        currentObjKey = null;
      }

      const kvMatch = line.match(/^(\w[\w_]*):\s*(.*)/);
      if (kvMatch) {
        currentTopKey = kvMatch[1];
        const value = kvMatch[2].trim();

        if (value === '' || value === '{}' || value === '[]') {
          // Nested — will be filled by indented lines
        } else if (value.startsWith('{')) {
          // Inline object: {es: "x", en: "y"}
          const obj = {};
          const inner = value.match(/\{([^}]+)\}/);
          if (inner) {
            for (const pair of inner[1].split(',')) {
              const [k, ...vParts] = pair.split(':');
              if (k && vParts.length > 0) {
                obj[k.trim()] = vParts.join(':').trim().replace(/^['"]|['"]$/g, '');
              }
            }
          }
          fm[currentTopKey] = obj;
          currentTopKey = null;
        } else {
          fm[currentTopKey] = value.replace(/^['"]|['"]$/g, '');
          currentTopKey = null;
        }
      }
    } else if (currentTopKey && rawIndent >= 2) {
      // Indented line — part of nested object
      const kvMatch = line.trimStart().match(/^(\w[\w_]*):\s*(.*)/);
      if (kvMatch) {
        const subKey = kvMatch[1];
        const subValue = kvMatch[2].trim();

        if (subValue === '' || subValue === '{}' || subValue === '[]') {
          // Further nested — could be location.city: {es: ..., en: ...}
          currentObjKey = subKey;
        } else if (subValue.startsWith('{')) {
          // Inline nested object
          const obj = {};
          const inner = subValue.match(/\{([^}]+)\}/);
          if (inner) {
            for (const pair of inner[1].split(',')) {
              const [k, ...vParts] = pair.split(':');
              if (k && vParts.length > 0) {
                obj[k.trim()] = vParts.join(':').trim().replace(/^['"]|['"]$/g, '');
              }
            }
          }
          currentObj[subKey] = obj;
          currentObjKey = null;
        } else {
          currentObj[subKey] = subValue.replace(/^['"]|['"]$/g, '');
          currentObjKey = null;
        }
      } else if (currentObjKey && rawIndent >= 4) {
        // Deeper indent — sub-sub key (e.g. location.city.es)
        const kvMatch2 = line.trimStart().match(/^(\w[\w_]*):\s*(.*)/);
        if (kvMatch2) {
          if (!currentObj[currentObjKey]) currentObj[currentObjKey] = {};
          currentObj[currentObjKey][kvMatch2[1]] = kvMatch2[2].trim().replace(/^['"]|['"]$/g, '');
        }
      }
    }
  }

  // Flush last nested
  if (currentTopKey && Object.keys(currentObj).length > 0) {
    fm[currentTopKey] = currentObj;
  }

  return { frontmatter: fm, body };
}

function extractTitle(body) {
  const h1 = body.match(/^#\s+(.+)$/m);
  if (h1) return h1[1];
  const h2 = body.match(/^##\s+(.+)$/m);
  if (h2) return h2[1];
  return body.split('\n')[0]?.slice(0, 100) || '';
}

function extractKeywords(body, max = 10) {
  const words = body.normalize('NFC').toLowerCase().match(/[\p{L}\p{N}\p{M}]+(?:[-'][\p{L}\p{N}\p{M}]+)*/gu) || [];
  const counts = {};
  for (const w of words) {
    if (Array.from(w).length < 4) continue;
    counts[w] = (counts[w] || 0) + 1;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, max).map(([w]) => w);
}

function chunkContent(body, maxLen = 2000) {
  const chunks = [];
  const paragraphs = body.split('\n\n');
  let current = '';
  for (const p of paragraphs) {
    if (current.length + p.length > maxLen && current.length > 0) {
      chunks.push(current.trim());
      current = '';
    }
    current += p + '\n\n';
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

/**
 * Devuelve la ruta real de la página (debe coincidir con src/pages) o null si el
 * contenido no tiene página pública (p. ej. external_brands) y no debe indexarse.
 */
function contentPathToUrl(relativePath, lang, frontmatter = {}) {
  const slug = basename(relativePath, '.md');
  const dir = relativePath.split('/').slice(0, -1).join('/');

  if (dir === 'companies') return `/en/companies/${encodeURIComponent(slug)}/`;
  if (dir === 'destinos') return `/es/peru/${slug}/`;
  if (dir === 'destinos_en') return `/en/peru/${slug}/`;
  if (dir === 'prompts') return `/en/ai-prompts/${slug}/`;
  if (dir === 'prompts_es') return `/es/ai-prompts/${slug}/`;
  if (dir === 'posts' || dir === 'blog') return `/blog/${slug}/`;
  if (dir.startsWith('categorias_destino')) {
    const { destino_slug, categoria } = frontmatter;
    return destino_slug && categoria ? `/en/peru/${destino_slug}/tours/${categoria}/` : null;
  }
  return null;
}

function detectType(dirSegment, frontmatter) {
  if (dirSegment === 'companies') return 'company';
  if (dirSegment === 'prompts' || dirSegment === 'prompts_es') return 'prompt_landing';
  if (dirSegment === 'destinos' || dirSegment === 'destinos_en') return 'destination';
  if (dirSegment === 'blog' || dirSegment === 'posts') return 'blog_post';
  if (dirSegment.startsWith('categorias_destino')) return 'category';
  return 'page';
}

function langFromDir(dir) {
  return dir.endsWith('_es') || dir === 'destinos' ? 'es' : 'en';
}

function getLocalizedString(field, lang) {
  if (!field) return '';
  if (typeof field === 'string') return field;
  if (typeof field === 'object') return field[lang] || field.en || Object.values(field)[0] || '';
  return '';
}

// ── Collect and generate ──────────────────────────────────────
function walkDir(dir, base = dir, entries) {
  if (!existsSync(dir)) return;

  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    try {
      const s = statSync(full);
      if (s.isDirectory() && !entry.startsWith('.') && !SKIP_DIRS.has(entry)) {
        walkDir(full, base, entries);
      } else if (s.isFile() && (entry.endsWith('.md') || entry.endsWith('.mdx'))) {
        const rel = relative(base, full).replace(/\\/g, '/');
        const raw = readFileSync(full, 'utf-8');
        const { frontmatter, body } = parseFrontmatter(raw);

        const dirSegment = rel.split('/')[0] || '';
        if (dirSegment === 'companies' && (isOrphanDuplicate(frontmatter.slug, basename(full, '.md')) || isNamelessTitle(String(frontmatter.title ?? '')))) continue;
        if (dirSegment === 'prompts_es' && untranslatedEs.has(basename(full, '.md'))) continue;
        const lang = langFromDir(dirSegment);
        const type = detectType(dirSegment, frontmatter);
        const url = contentPathToUrl(rel, lang, frontmatter);
        if (!url) continue;

        const title = getLocalizedString(frontmatter.title, lang) || extractTitle(body);
        const description = getLocalizedString(frontmatter.description, lang);
        // Las fichas de empresa suelen venir con `summary: ''`; damos un resumen mínimo y veraz.
        const summary =
          getLocalizedString(frontmatter.summary, lang) ||
          (type === 'company' ? `${title} — travel company listed in the TourUp directory, Peru.` : '');

        const chunks = chunkContent(body);
        const keywords = extractKeywords(body);

        chunks.forEach((chunk, idx) => {
          const id = createHash('sha256').update(`${url}-${idx}`).digest('hex').slice(0, 16);

          const entry = {
            id,
            url,
            title: chunks.length > 1 ? `${title} (Part ${idx + 1})` : title,
            content: chunk,
            description,
            keywords: [...keywords],
            metadata: {
              type,
              lang,
              chunkIndex: idx,
              totalChunks: chunks.length,
              sourcePath: rel,
              slug: basename(full, '.md'),
              summary,
            },
          };

          if (type === 'company') {
            const city = getLocalizedString(frontmatter.location?.city, lang);
            entry.metadata.city = city;
            entry.keywords.push(
              `tour operator ${title} peru`,
              `${title} ${city} peru`,
              `travel agency ${city}`,
              `best tour companies in ${city} peru`,
              `verified operators ${city} peru`,
            );
            entry.keywords = entry.keywords.slice(0, 20);
          }

          if (type === 'prompt_landing') {
            entry.metadata.quick_answer = chunk.substring(0, 200);
            entry.metadata.primary_intent = 'informational';
            entry.metadata.secondary_intent = 'commercial';
            entry.metadata.search_term = title;
            entry.metadata.prompt_text = title;
            entry.keywords.push(
              title.toLowerCase(),
              `${title} peru tour`,
              `best ${title.toLowerCase()}`,
              `${title.toLowerCase()} comparison`,
            );
            entry.keywords = entry.keywords.slice(0, 15);
          }

          entries.push(entry);
        });
      }
    } catch {
      // skip unreadable
    }
  }
}

// ── Main ──────────────────────────────────────────────────────
console.log('=== Generating ai-index.json ===\n');

const entries = [];
walkDir(SRC_CONTENT, SRC_CONTENT, entries);

const seen = new Set();
const unique = entries.filter(e => {
  if (seen.has(e.id)) return false;
  seen.add(e.id);
  return true;
});

const index = {
  version: '1.0',
  generated: new Date().toISOString(),
  site: {
    title: 'TourUp — B2B Peru Travel Marketplace',
    description: 'Directorio de operadores turísticos en Perú: agencias, tours, destinos y prompts de AI search verificados, optimizados para AI overviews.',
    url: SITE,
  },
  entries: unique.sort((a, b) => a.id.localeCompare(b.id)),
  metadata: {
    totalEntries: unique.length,
    generator: 'generate-ai-index.mjs',
  },
};

const outPath = join(PUBLIC_DIR, 'ai-index.json');
writeFileSync(outPath, JSON.stringify(index, null, 2), 'utf-8');
console.log(`✓ Generated ai-index.json (${unique.length} entries)`);
