/**
 * generate-llms-txt.mjs
 *
 * Genera public/llms.txt (índice corto y curado, formato llmstxt.org) y
 * public/llms-full.txt (contenido ampliado) a partir de src/content.
 *
 * Reemplaza a aeo.js + postbuild-aeo-fix.mjs, que producían URLs de archivo
 * (`/categorias_destino/x`, `//index`, backslashes) que no existen como páginas.
 *
 * Debe ejecutarse ANTES de `astro build` (Astro copia public/ a dist/ durante el build).
 *
 * Uso: node scripts/generate-llms-txt.mjs
 */
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import matter from 'gray-matter';
import { isOrphanDuplicate, isNamelessTitle, untranslatedEsPromptSlugs } from './lib/content-dedupe.mjs';

export const SITE = (process.env.SITE_URL || 'https://guia.tourup.co').replace(/\/$/, '');
const CONTENT = 'src/content';
const PUBLIC_DIR = 'public';

const TITLE = 'TourUp Guía — B2B Peru Travel Marketplace';
const SUMMARY =
  'Directorio bilingüe (ES/EN) de operadores turísticos en Perú: agencias, DMC y mayoristas, destinos, categorías de tours y respuestas a las consultas más frecuentes de los viajeros en buscadores de IA.';

// ── Helpers ─────────────────────────────────────────────────────
/** Campo string o bilingüe { es, en } → string para el idioma pedido. */
export function loc(value, lang) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') return value[lang] ?? value.es ?? value.en ?? '';
  return String(value);
}

/** Una línea, sin saltos, recortada en límite de palabra. */
export function clip(text, max = 180) {
  const flat = String(text ?? '').replace(/\s+/g, ' ').trim();
  if (flat.length <= max) return flat;
  return flat.slice(0, max).replace(/\s+\S*$/, '') + '…';
}

function readCollection(name) {
  const dir = join(CONTENT, name);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .sort()
    .map((file) => {
      const { data, content } = matter(readFileSync(join(dir, file), 'utf-8'));
      return { slug: basename(file, '.md'), data, body: content.trim() };
    })
    .filter((e) => !(name === 'companies' && (isOrphanDuplicate(e.data.slug, e.slug) || isNamelessTitle(String(e.data.title ?? '')))));
}

const link = (label, url, note) => `- [${label}](${url})${note ? `: ${note}` : ''}`;

// ── URLs (deben coincidir con src/pages) ────────────────────────
export const urls = {
  // El inglés es el idioma principal: su portada es `/` (/en/ redirige allí).
  home: (lang) => (lang === 'en' ? `${SITE}/` : `${SITE}/es/`),
  destino: (lang, slug) => `${SITE}/${lang}/peru/${slug}/`,
  categoria: (lang, destino, cat) => `${SITE}/${lang}/peru/${destino}/tours/${cat}/`,
  company: (lang, slug) => `${SITE}/${lang}/${lang === 'es' ? 'empresas' : 'companies'}/${encodeURIComponent(slug)}/`,
  prompt: (lang, slug) => `${SITE}/${lang}/ai-prompts/${slug}/`,
};

// ── Datos ───────────────────────────────────────────────────────
const destinos = { es: readCollection('destinos'), en: readCollection('destinos_en') };
const categorias = readCollection('categorias_destino');
const companies = readCollection('companies');
// Los prompts /es/ sin traducir son noindex: no se anuncian a los LLM.
const untranslatedEs = untranslatedEsPromptSlugs(join(CONTENT, 'prompts_es'), join(CONTENT, 'prompts'));
const prompts = {
  en: readCollection('prompts'),
  es: readCollection('prompts_es').filter((p) => !untranslatedEs.has(p.slug)),
};

// ── llms.txt (curado, corto) ────────────────────────────────────
function buildLlmsTxt() {
  const out = [];
  out.push(`# ${TITLE}`, '', `> ${SUMMARY}`, '');
  out.push(
    'The guide is in English (primary) and Spanish (`/es/`). Company profiles show registry data (RUC tax ID, address, contact). Sustainability data (certifications and recognised destinations) comes from the TourVerificado registry, with each certifier as source. Full detail in `llms-full.txt`.',
    '',
  );

  out.push('## Secciones principales', '');
  out.push(
    link('Home (EN)', urls.home('en')),
    link('Inicio (ES)', urls.home('es')),
    link('Destinations in Peru', `${SITE}/en/destinations/`, 'every destination guide, with the registered companies operating there'),
    link('Destinos de Perú', `${SITE}/es/destinos/`),
    link('Sustainable travel in Peru', `${SITE}/en/sustainability/`, 'companies with a valid sustainability certification, Green Destinations recognitions, sustainable itineraries'),
    link('Turismo sostenible en Perú', `${SITE}/es/sostenibilidad/`),
    link('Sustainable itinerary: 1 day', `${SITE}/en/sustainability/1-day/`),
    link('Sustainable itinerary: 7 days (northern Peru)', `${SITE}/en/sustainability/7-days/`),
    link('Sustainable itinerary: 14 days (southern Peru)', `${SITE}/en/sustainability/14-days/`),
    link('Company directory', `${SITE}/en/companies/`, 'tour operators, agencies and DMCs in Peru (B2B)'),
    link('Directorio de empresas', `${SITE}/es/empresas/`, 'operadores, agencias y DMC de Perú'),
    link('AI prompts (EN)', `${SITE}/en/ai-prompts/`, 'frequent traveller queries and the brands AI assistants cite'),
    link('Preguntas frecuentes sobre Perú', `${SITE}/es/peru/preguntas-frecuentes/`),
    link('Peru FAQ', `${SITE}/en/peru/preguntas-frecuentes/`),
    link('Itinerario de 7 días', `${SITE}/es/peru/itinerario-7-dias/`),
    link('Itinerario de 10 días', `${SITE}/es/peru/itinerario-10-dias/`),
    link('Itinerario de 14 días', `${SITE}/es/peru/itinerario-14-dias/`),
    link('Tours a Machu Picchu desde Cusco', `${SITE}/es/peru/cusco/tours-machu-picchu/`),
    link('Guides', `${SITE}/blog/`),
    '',
  );

  for (const [lang, heading] of [['es', 'Destinos'], ['en', 'Destinations']]) {
    out.push(`## ${heading} (${lang.toUpperCase()})`, '');
    for (const d of destinos[lang]) {
      out.push(link(loc(d.data.name, lang) || d.slug, urls.destino(lang, d.slug), clip(loc(d.data.summary, lang), 160)));
    }
    out.push('');
  }

  out.push(
    '## Optional',
    '',
    link('llms-full.txt', `${SITE}/llms-full.txt`, 'destinos, categorías, empresas y prompts con resumen'),
    link('sitemap-index.xml', `${SITE}/sitemap-index.xml`, 'todas las URLs indexables'),
    link('ai-index.json', `${SITE}/ai-index.json`, 'índice estructurado para agentes'),
    '',
  );
  return out.join('\n');
}

// ── llms-full.txt ───────────────────────────────────────────────
function buildLlmsFullTxt() {
  const out = [`# ${TITLE}`, '', `> ${SUMMARY}`, ''];
  const destName = (lang, slug) => {
    const d = destinos[lang].find((x) => x.slug === slug);
    return d ? loc(d.data.name, lang) || slug : slug;
  };

  for (const lang of ['es', 'en']) {
    out.push(`## ${lang === 'es' ? 'Destinos' : 'Destinations'} (${lang.toUpperCase()})`, '');
    for (const d of destinos[lang]) {
      out.push(`### ${loc(d.data.name, lang) || d.slug}`, `URL: ${urls.destino(lang, d.slug)}`, '');
      const summary = loc(d.data.summary, lang);
      if (summary) out.push(summary, '');
      for (const f of d.data.faq ?? []) {
        out.push(`**${loc(f.question, lang)}**`, loc(f.answer, lang), '');
      }
    }

    out.push(`## ${lang === 'es' ? 'Categorías de tours por destino' : 'Tour categories by destination'} (${lang.toUpperCase()})`, '');
    for (const c of categorias) {
      const { destino_slug, categoria } = c.data;
      out.push(link(loc(c.data.name, lang) || `${categoria} ${destino_slug}`, urls.categoria(lang, destino_slug, categoria), `${destName(lang, destino_slug)} — ${clip(loc(c.data.summary, lang), 140)}`));
    }
    out.push('');
  }

  out.push('## Empresas / Companies', '');
  for (const c of companies) {
    const d = c.data;
    const city = loc(d.nap?.city ?? d.location?.city, 'es');
    const meta = [d.distribution_role?.replace(/_/g, ' '), city].filter(Boolean).join(', ');
    out.push(link(loc(d.title, 'es') || c.slug, urls.company('en', c.slug), [meta, clip(loc(d.summary, 'en'), 200)].filter(Boolean).join(' — ')));
  }
  out.push('');

  for (const lang of ['en', 'es']) {
    out.push(`## ${lang === 'en' ? 'AI prompts (EN)' : 'Prompts de IA (ES)'}`, '');
    for (const p of prompts[lang]) {
      const answer = clip(loc(p.data.quick_answer, lang) || loc(p.data.summary, lang), 200);
      out.push(link(loc(p.data.title, lang) || p.slug, urls.prompt(lang, p.slug), answer));
    }
    out.push('');
  }
  return out.join('\n');
}

// ── Main ────────────────────────────────────────────────────────
if (process.argv[1] && basename(process.argv[1]) === 'generate-llms-txt.mjs') {
  const llms = buildLlmsTxt();
  const full = buildLlmsFullTxt();
  writeFileSync(join(PUBLIC_DIR, 'llms.txt'), llms, 'utf-8');
  writeFileSync(join(PUBLIC_DIR, 'llms-full.txt'), full, 'utf-8');
  console.log(`llms.txt       ${(llms.length / 1024).toFixed(1)} KB`);
  console.log(`llms-full.txt  ${(full.length / 1024).toFixed(1)} KB`);
}

export { buildLlmsTxt, buildLlmsFullTxt };
