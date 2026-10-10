/**
 * postbuild: genera dist/sitemap-guide.xml, un único <urlset> con todas las URLs del
 * sitemap que produce @astrojs/sitemap (sitemap-index.xml → sitemap-N.xml). Es el sitemap que
 * se declara en robots.txt y el que puede referenciar el sitemap principal de tourup.co.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const OUT_DIR = 'dist';
const indexPath = join(OUT_DIR, 'sitemap-index.xml');
if (!existsSync(indexPath)) {
  console.error('sitemap-guide: falta dist/sitemap-index.xml (¿se ejecutó el build?)');
  process.exit(1);
}

const children = [...readFileSync(indexPath, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const urls = [];
for (const url of children) {
  const file = join(OUT_DIR, new URL(url).pathname);
  if (!existsSync(file)) {
    console.error(`sitemap-guide: no existe ${file}`);
    process.exit(1);
  }
  urls.push(...readFileSync(file, 'utf8').match(/<url>[\s\S]*?<\/url>/g) ?? []);
}

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls,
  '</urlset>',
  '',
].join('\n');
writeFileSync(join(OUT_DIR, 'sitemap-guide.xml'), xml);
console.log(`sitemap-guide.xml: ${urls.length} URLs`);
