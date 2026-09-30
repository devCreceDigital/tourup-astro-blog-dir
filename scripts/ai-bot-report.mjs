/**
 * Informe de rastreo de bots de IA a partir de logs de acceso (formato "combined" de nginx o
 * Apache). Cuenta visitas por bot, códigos de estado y las páginas más rastreadas.
 *
 * Uso:  npm run bots:report -- /ruta/access.log [/ruta/access.log.1 ...]
 * (en el servidor: sudo cat /var/log/nginx/access.log > access.log y pásale ese archivo)
 */
import { readFileSync } from 'node:fs';

const BOTS = [
  ['OAI-SearchBot', /OAI-SearchBot/i],
  ['ChatGPT-User', /ChatGPT-User/i],
  ['GPTBot', /GPTBot/i],
  ['PerplexityBot', /PerplexityBot/i],
  ['Perplexity-User', /Perplexity-User/i],
  ['Claude-SearchBot', /Claude-SearchBot/i],
  ['Claude-User', /Claude-User/i],
  ['ClaudeBot', /ClaudeBot/i],
  ['Google-Extended', /Google-Extended/i],
  ['Googlebot', /Googlebot/i],
  ['Bingbot', /bingbot/i],
  ['Applebot', /Applebot/i],
  ['meta-externalagent', /meta-externalagent/i],
  ['Amazonbot', /Amazonbot/i],
  ['CCBot', /CCBot/i],
  ['Bytespider', /Bytespider/i],
];

const files = process.argv.slice(2);
if (!files.length) {
  console.error('uso: npm run bots:report -- <access.log> [...]');
  process.exit(1);
}

// "GET /path HTTP/1.1" 200 1234 "referer" "user agent"
const LINE = /"(?:GET|HEAD) (\S+) [^"]*" (\d{3}) \S+ "[^"]*" "([^"]*)"/;
const stats = new Map();
for (const f of files) {
  for (const line of readFileSync(f, 'utf8').split('\n')) {
    const m = line.match(LINE);
    if (!m) continue;
    const [, path, status, ua] = m;
    const bot = BOTS.find(([, re]) => re.test(ua))?.[0];
    if (!bot) continue;
    const s = stats.get(bot) ?? { hits: 0, status: {}, paths: new Map() };
    s.hits += 1;
    s.status[status] = (s.status[status] ?? 0) + 1;
    s.paths.set(path, (s.paths.get(path) ?? 0) + 1);
    stats.set(bot, s);
  }
}

if (!stats.size) {
  console.log('Ningún bot de IA o buscador en estos logs.');
  process.exit(0);
}
for (const [bot, s] of [...stats].sort((a, b) => b[1].hits - a[1].hits)) {
  const top = [...s.paths].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([p, n]) => `${n} ${p}`);
  console.log(`\n${bot}: ${s.hits} visitas · estados ${JSON.stringify(s.status)}`);
  for (const t of top) console.log(`   ${t}`);
}
const blocked = [...stats].filter(([, s]) => Object.keys(s.status).some((c) => c === '403' || c === '429'));
if (blocked.length) {
  console.log(`\nAVISO: ${blocked.map(([b]) => b).join(', ')} reciben 403/429: revisa el firewall o la protección de bots de Cloudflare.`);
}
