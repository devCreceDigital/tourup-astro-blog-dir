import { execFileSync } from 'node:child_process';
import { basename } from 'node:path';

/**
 * Fecha del último commit que tocó cada archivo de src/content, en una sola llamada a git.
 * Alimenta el <lastmod> del sitemap: es la fecha real del contenido, no la del build.
 * Devuelve un Map vacío si git no está disponible (el sitemap sale sin lastmod).
 */
export function contentDates() {
  const dates = new Map();
  let out = '';
  try {
    out = execFileSync('git', ['-c', 'core.quotepath=off', 'log', '--format=@%cI', '--name-only', '--', 'src/content'], {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    });
  } catch {
    return dates;
  }
  let current = null;
  for (const line of out.split(/\r?\n/)) {
    if (line.startsWith('@')) current = line.slice(1);
    else if (line && current && !dates.has(line.normalize('NFC'))) dates.set(line.normalize('NFC'), current);
  }
  return dates;
}

/** Archivo de contenido del que sale cada URL pública (o null si no depende de uno solo). */
export function sourceFileForUrl(url) {
  return sourcePath(url)?.normalize('NFC') ?? null;
}

function sourcePath(url) {
  const path = new URL(url).pathname;
  let m = path.match(/^\/(?:en\/companies|es\/empresas)\/([^/]+)\/$/);
  if (m) return `src/content/companies/${decodeURIComponent(m[1])}.md`;
  m = path.match(/^\/(en|es)\/peru\/([^/]+)\/$/);
  if (m) return `src/content/${m[1] === 'en' ? 'destinos_en' : 'destinos'}/${m[2]}.md`;
  m = path.match(/^\/(en|es)\/ai-prompts\/([^/]+)\/$/);
  if (m) return `src/content/${m[1] === 'en' ? 'prompts' : 'prompts_es'}/${decodeURIComponent(m[2])}.md`;
  m = path.match(/^\/blog\/([^/]+)\/$/);
  if (m) return `src/content/posts/${m[1]}.md`;
  return null;
}

export const fileSlug = (file) => basename(file, '.md');
