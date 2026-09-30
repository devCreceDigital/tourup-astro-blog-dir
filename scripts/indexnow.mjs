/**
 * Notifica a IndexNow (Bing, Yandex, Seznam… comparten el aviso) todas las URLs de
 * dist/client/sitemap-guide.xml. Bing alimenta la búsqueda de ChatGPT y de Copilot.
 *
 * Uso, SOLO después de desplegar (las URLs deben responder ya en producción):
 *   npm run build && <desplegar> && npm run indexnow
 *   npm run indexnow -- --dry-run      # muestra qué enviaría, sin enviar nada
 *
 * La clave es el archivo public/<clave>.txt (se publica en la raíz del sitio, como exige el
 * protocolo). Para cambiarla, borra ese archivo y crea otro con una clave nueva.
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';

const HOST = 'guide.tourup.co';
const SITEMAP = 'dist/client/sitemap-guide.xml';
const dryRun = process.argv.includes('--dry-run');

const keyFile = readdirSync('public').find((f) => /^[0-9a-f]{32}\.txt$/.test(f));
if (!keyFile) {
  console.error('indexnow: no hay archivo de clave public/<32 hex>.txt');
  process.exit(1);
}
const key = readFileSync(`public/${keyFile}`, 'utf8').trim();
if (!existsSync(SITEMAP)) {
  console.error(`indexnow: falta ${SITEMAP}; ejecuta antes npm run build`);
  process.exit(1);
}

const urls = [...readFileSync(SITEMAP, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
console.log(`indexnow: ${urls.length} URLs de ${SITEMAP}, clave ${keyFile}`);

// El protocolo admite hasta 10.000 URLs por petición.
for (let i = 0; i < urls.length; i += 10000) {
  const body = {
    host: HOST,
    key,
    keyLocation: `https://${HOST}/${keyFile}`,
    urlList: urls.slice(i, i + 10000),
  };
  if (dryRun) {
    console.log(`[dry-run] enviaría ${body.urlList.length} URLs (primera: ${body.urlList[0]})`);
    continue;
  }
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  });
  console.log(`indexnow: lote ${i / 10000 + 1} → HTTP ${res.status} ${res.statusText}`);
  if (res.status >= 400) process.exitCode = 1;
}
