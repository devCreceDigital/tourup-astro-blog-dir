import { basename, join } from 'node:path';
import { readdirSync, readFileSync } from 'node:fs';

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
