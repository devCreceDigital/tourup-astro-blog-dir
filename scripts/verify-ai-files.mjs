/**
 * postbuild: los archivos para IA (llms.txt, llms-full.txt, ai-index.json) se generan antes
 * del build, a partir de los .md. Hay fichas duplicadas con y sin tilde (`…kosñipata.md` y
 * `…kosipata.md`) y Astro publica solo una de las dos, así que el generador puede apuntar a la
 * que no tiene página. Este paso corrige cada URL de ficha hacia su gemela publicada y hace
 * fallar el build si queda algún enlace a una página que no existe en dist/.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const OUT = 'dist/client';
const SITE = 'https://guide.tourup.co';
const exists = (path) => existsSync(join(OUT, decodeURIComponent(path), 'index.html')) || existsSync(join(OUT, decodeURIComponent(path)));
const stripAccents = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ñ/g, 'n');
// Las gemelas publicadas pierden la letra acentuada entera (kosñipata → kosipata).
const dropAccented = (s) => s.normalize('NFC').replace(/[^\x00-\x7f]/g, '');

function fixUrl(url) {
  const path = url.slice(SITE.length);
  if (exists(path)) return url;
  const decoded = decodeURIComponent(path);
  for (const candidate of [dropAccented(decoded), stripAccents(decoded)]) {
    if (candidate !== decoded && exists(candidate)) return SITE + encodeURI(candidate);
  }
  return null;
}

let fixed = 0;
const broken = [];
for (const file of ['llms.txt', 'llms-full.txt', 'ai-index.json']) {
  const path = join(OUT, file);
  if (!existsSync(path)) continue;
  const text = readFileSync(path, 'utf8').replace(/https:\/\/guide\.tourup\.co\/[^\s)"'<>\]]*/g, (url) => {
    const ok = fixUrl(url);
    if (!ok) {
      broken.push(`${file}: ${url}`);
      return url;
    }
    if (ok !== url) fixed += 1;
    return ok;
  });
  writeFileSync(path, text);
}

console.log(`verify-ai-files: ${fixed} URLs corregidas hacia su página publicada`);
if (broken.length) {
  console.error(`verify-ai-files: ${broken.length} enlaces a páginas que no existen:\n${broken.slice(0, 20).join('\n')}`);
  process.exit(1);
}
