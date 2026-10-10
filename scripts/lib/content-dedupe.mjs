import { basename, join } from 'node:path';
import { readdirSync, readFileSync } from 'node:fs';
import matter from 'gray-matter';

/**
 * Hay fichas de empresa duplicadas cuyo nombre de archivo perdió los acentos
 * (`...-brea.md` junto a `...-breña.md`) y comparten el mismo `slug:` en el frontmatter.
 * Astro solo genera la página de la que coincide con su `slug:`; las demás no tienen URL.
 * Devuelve true si el archivo es una de esas copias sin página y debe omitirse de sitemaps/llms/índices.
 */
export function isOrphanDuplicate(frontmatterSlug, fileSlug) {
  if (!frontmatterSlug) return false;
  return basename(String(frontmatterSlug)) !== fileSlug;
}

/**
 * Hay fichas cuyo `title` de origen es "-" o vacío (sin ninguna letra ni número): no tienen
 * nombre real. Se publican con etiqueta descriptiva y `noindex`, así que se omiten del sitemap
 * y de los índices para IA.
 */
export function isNamelessTitle(title) {
  return typeof title === 'string' && !/[\p{L}\p{N}]/u.test(title);
}

const titleOf = (file) => {
  const m = readFileSync(file, 'utf8').match(/^title:(.*)$/m);
  return m ? m[1].trim().replace(/^['"]|['"]$/g, '') : '';
};

/**
 * Prompts de `esDir` cuyo título es idéntico al del mismo archivo en `enDir`: son copias sin
 * traducir, se publican con noindex y no van al sitemap ni a los índices para IA.
 * Debe coincidir con isTranslated() de src/utils/prompts.ts.
 */
export function untranslatedEsPromptSlugs(esDir, enDir) {
  const out = new Set();
  for (const file of readdirSync(esDir)) {
    if (!file.endsWith('.md')) continue;
    let en = '';
    try { en = titleOf(join(enDir, file)); } catch { continue; }
    const es = titleOf(join(esDir, file));
    if (es.normalize('NFC').toLowerCase() === en.normalize('NFC').toLowerCase()) out.add(basename(file, '.md'));
  }
  return out;
}

/** Nombres de archivo (sin .md) de las fichas de `dir` cuyo título no tiene nombre real. */
export function namelessCompanySlugs(dir) {
  const out = new Set();
  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.md')) continue;
    const m = readFileSync(join(dir, file), 'utf8').match(/^title:(.*)$/m);
    if (!m) continue;
    const title = m[1].trim().replace(/^['"]|['"]$/g, '');
    if (isNamelessTitle(title)) out.add(basename(file, '.md'));
  }
  return out;
}

/**
 * Prompts cuya lista de marcas es el valor por defecto que comparten casi todos (195 de 201):
 * no son menciones reales de una IA para esa pregunta, y sus páginas son casi idénticas. Se
 * publican con noindex y quedan fuera del sitemap y de los índices para IA. Misma regla que
 * placeholderSignatures() de src/utils/prompts.ts: una firma repetida en más del 20 % de los
 * prompts es relleno. Cuando se regeneren las menciones por pregunta, dejan de contar solas.
 */
export function placeholderPromptSlugs(dir, threshold = 0.2) {
  const sigOf = (mentions) =>
    (mentions ?? [])
      .map((m) => (typeof m === 'string' ? m : `${m.entity_type}:${m.entity_slug ?? m.name}`))
      .filter((x) => !/^(destino|categoria):/.test(x))
      .sort()
      .join('|');
  const entries = readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => ({ slug: basename(f, '.md'), sig: sigOf(matter(readFileSync(join(dir, f), 'utf8')).data.brands_ai_mentions) }));
  const counts = new Map();
  for (const e of entries) if (e.sig) counts.set(e.sig, (counts.get(e.sig) ?? 0) + 1);
  const min = Math.max(2, entries.length * threshold);
  const filler = new Set([...counts].filter(([, n]) => n > min).map(([sig]) => sig));
  return new Set(entries.filter((e) => filler.has(e.sig)).map((e) => e.slug));
}
