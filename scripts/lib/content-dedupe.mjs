import { basename } from 'node:path';

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
