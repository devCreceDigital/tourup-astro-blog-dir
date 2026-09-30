/**
 * Medición GEO: pregunta a los buscadores con IA las preguntas de viajeros que cubre el sitio
 * y registra si la respuesta cita guide.tourup.co (y qué páginas) y qué empresas nombra.
 *
 * Uso:
 *   PERPLEXITY_API_KEY=... npm run geo:probe                 # todas las preguntas en inglés
 *   PERPLEXITY_API_KEY=... npm run geo:probe -- --limit 20   # una muestra
 *   OPENAI_API_KEY=... OPENAI_MODEL=<modelo con búsqueda web> npm run geo:probe
 *
 * Motores: Perplexity (API "sonar", devuelve las fuentes citadas) y, si se configuran
 * OPENAI_API_KEY y OPENAI_MODEL, OpenAI Responses con la herramienta web_search. Sin claves no
 * hace nada. Escribe reports/geo-probe-AAAA-MM-DD.csv (una fila por pregunta y motor).
 * Cada ejecución tiene coste en la API del proveedor.
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

const HOST = 'guide.tourup.co';
const args = process.argv.slice(2);
const limit = Number(args[args.indexOf('--limit') + 1]) || Infinity;

const prompts = readdirSync('src/content/prompts')
  .filter((f) => f.endsWith('.md'))
  .map((f) => {
    const raw = readFileSync(join('src/content/prompts', f), 'utf8');
    const title = raw.match(/^title:\s*(.+)$/m)?.[1].trim().replace(/^['"]|['"]$/g, '') ?? '';
    return { slug: basename(f, '.md'), question: title };
  })
  .filter((p) => p.question)
  .slice(0, limit);

// Nombres de empresas del directorio (para detectar menciones en el texto de la respuesta).
const companies = readdirSync('src/content/companies')
  .filter((f) => f.endsWith('.md'))
  .map((f) => readFileSync(join('src/content/companies', f), 'utf8').match(/^title:\s*(.+)$/m)?.[1].trim().replace(/^['"]|['"]$/g, ''))
  .filter((t) => t && /[\p{L}\p{N}]{4,}/u.test(t));
const companyNames = [...new Set(companies)];

async function askPerplexity(question) {
  const res = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'sonar', messages: [{ role: 'user', content: question }] }),
  });
  if (!res.ok) throw new Error(`Perplexity HTTP ${res.status}`);
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content ?? '';
  const sources = data.citations ?? data.search_results?.map((s) => s.url) ?? [];
  return { text, sources };
}

async function askOpenAI(question) {
  const res = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: process.env.OPENAI_MODEL, tools: [{ type: 'web_search' }], input: question }),
  });
  if (!res.ok) throw new Error(`OpenAI HTTP ${res.status}`);
  const data = await res.json();
  const parts = (data.output ?? []).flatMap((o) => o.content ?? []);
  const text = parts.map((c) => c.text ?? '').join('\n');
  const sources = parts.flatMap((c) => (c.annotations ?? []).filter((a) => a.url).map((a) => a.url));
  return { text, sources };
}

const engines = [];
if (process.env.PERPLEXITY_API_KEY) engines.push(['perplexity', askPerplexity]);
if (process.env.OPENAI_API_KEY && process.env.OPENAI_MODEL) engines.push(['openai', askOpenAI]);
if (!engines.length) {
  console.error('geo-probe: define PERPLEXITY_API_KEY y/o OPENAI_API_KEY + OPENAI_MODEL');
  process.exit(1);
}

const csv = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
const rows = [['date', 'engine', 'prompt_slug', 'question', 'cites_guide', 'guide_urls', 'companies_named', 'all_sources', 'error']];
const today = new Date().toISOString().slice(0, 10);
let cited = 0;
let asked = 0;

for (const p of prompts) {
  for (const [name, ask] of engines) {
    try {
      const { text, sources } = await ask(p.question);
      const guideUrls = [...new Set(sources.filter((u) => u.includes(HOST)))];
      const named = companyNames.filter((n) => text.toLowerCase().includes(n.toLowerCase())).slice(0, 20);
      asked += 1;
      if (guideUrls.length) cited += 1;
      rows.push([today, name, p.slug, p.question, guideUrls.length > 0, guideUrls.join(' '), named.join('; '), sources.join(' '), '']);
      console.log(`${name.padEnd(10)} ${guideUrls.length ? 'CITA ' : '---- '} ${p.question}`);
    } catch (e) {
      rows.push([today, name, p.slug, p.question, '', '', '', '', e.message]);
      console.log(`${name.padEnd(10)} ERROR ${p.question}: ${e.message}`);
    }
    await new Promise((r) => setTimeout(r, 1200));
  }
}

mkdirSync('reports', { recursive: true });
const out = `reports/geo-probe-${today}.csv`;
writeFileSync(out, rows.map((r) => r.map(csv).join(',')).join('\n') + '\n');
console.log(`\n${cited}/${asked} respuestas citan ${HOST}. Detalle: ${out}`);
