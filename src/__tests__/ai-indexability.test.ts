import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'node:fs/promises';
import { existsSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const PUBLIC_DIR = path.resolve('public');
const SITE = 'https://guia.tourup.co';

async function readPublicFile(filename: string): Promise<string> {
  return fs.readFile(path.join(PUBLIC_DIR, filename), 'utf-8');
}

async function fileExists(filename: string): Promise<boolean> {
  try {
    await fs.access(path.join(PUBLIC_DIR, filename));
    return true;
  } catch {
    return false;
  }
}

const slugsOf = (dir: string) =>
  new Set(readdirSync(path.resolve('src/content', dir)).filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, '')));

/** Extrae todas las URLs absolutas de un texto (markdown o plano). */
function extractUrls(content: string): string[] {
  return content.match(/https?:\/\/[^\s)<>"]+/g) ?? [];
}

/** Solo rutas que existen realmente en src/pages. */
const ROUTES: RegExp[] = [
  /^\/(es|en)\/$/,
  /^\/es\/empresas\/$/,
  /^\/en\/companies\/$/,
  /^\/(es|en)\/ai-prompts\/$/,
  /^\/(es|en)\/peru\/(preguntas-frecuentes|itinerario-7-dias|itinerario-10-dias|itinerario-14-dias)\/$/,
  /^\/(es|en)\/peru\/cusco\/tours-machu-picchu\/$/,
  /^\/(es|en)\/peru\/[a-z0-9_-]+\/$/,
  /^\/(es|en)\/peru\/[a-z0-9_-]+\/tours\/[a-z0-9_-]+\/$/,
  /^\/es\/empresas\/[^/]+\/$/,
  /^\/en\/companies\/[^/]+\/$/,
  /^\/(es|en)\/ai-prompts\/[^/]+\/$/,
  /^\/blog\/$/,
  /^\/blog\/[^/]+\/$/,
  /^\/(llms-full\.txt|sitemap-index\.xml|ai-index\.json)$/,
];

const STATIC_PERU_PAGES = /^(preguntas-frecuentes|itinerario-\d+-dias)$/;

function expectRealRoutes(content: string) {
  const urls = extractUrls(content);
  expect(urls.length).toBeGreaterThan(0);
  const destinos = { es: slugsOf('destinos'), en: slugsOf('destinos_en') };
  const companies = slugsOf('companies');
  for (const raw of urls) {
    expect(raw, raw).toMatch(/^https:\/\/guia\.tourup\.co\//);
    const p = raw.replace(SITE, '');
    expect(p, raw).not.toMatch(/\\|\/\/|\.md\/?$/);
    expect(ROUTES.some((r) => r.test(p)), `ruta inexistente: ${raw}`).toBe(true);
    const dest = p.match(/^\/(es|en)\/peru\/([a-z0-9_-]+)\/$/);
    if (dest && !STATIC_PERU_PAGES.test(dest[2])) {
      expect(destinos[dest[1] as 'es' | 'en'].has(dest[2]), `destino inexistente: ${raw}`).toBe(true);
    }
    const comp = p.match(/^\/(?:es\/empresas|en\/companies)\/([^/]+)\/$/);
    if (comp) expect(companies.has(decodeURIComponent(comp[1])), `empresa inexistente: ${raw}`).toBe(true);
  }
}

/** Parsea robots.txt en grupos { agents, rules } según RFC 9309. */
function parseRobots(content: string) {
  const groups: { agents: string[]; rules: string[] }[] = [];
  let current: { agents: string[]; rules: string[] } | null = null;
  for (const raw of content.split('\n')) {
    const line = raw.replace(/#.*/, '').trim();
    if (!line) continue;
    const [k, ...v] = line.split(':');
    const key = k.trim().toLowerCase();
    const val = v.join(':').trim();
    if (key === 'user-agent') {
      if (!current || current.rules.length > 0) {
        current = { agents: [], rules: [] };
        groups.push(current);
      }
      current.agents.push(val);
    } else if (current && (key === 'allow' || key === 'disallow')) {
      current.rules.push(`${key}: ${val}`);
    }
  }
  return groups;
}

beforeAll(() => {
  // Los archivos AEO se generan en `prebuild`; los regeneramos para que el test no dependa de un build previo.
  execFileSync('node', ['scripts/generate-llms-txt.mjs'], { stdio: 'pipe' });
  execFileSync('node', ['scripts/generate-ai-index.mjs'], { stdio: 'pipe' });
}, 120_000);

describe('AI Indexability', () => {
  describe('robots.txt', () => {
    it('exists in public/ and is the only source (no dynamic route)', async () => {
      expect(await fileExists('robots.txt')).toBe(true);
      expect(existsSync(path.resolve('src/pages/robots.txt.ts'))).toBe(false);
    });

    it.each([
      'GPTBot', 'OAI-SearchBot', 'ChatGPT-User',
      'ClaudeBot', 'Claude-Web', 'Claude-User', 'Claude-SearchBot', 'anthropic-ai',
      'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Gemini-Deep-Research',
      'meta-externalagent', 'Applebot-Extended',
    ])('allows %s', async (bot) => {
      const groups = parseRobots(await readPublicFile('robots.txt'));
      const group = groups.find((g) => g.agents.includes(bot));
      expect(group, `${bot} no tiene grupo`).toBeDefined();
      expect(group!.rules).toContain('allow: /');
    });

    it('blocks /admin/ and /api/ in the same group as every crawler', async () => {
      // Un crawler con grupo propio ignora el grupo "*", por eso las reglas deben ir en su grupo.
      const groups = parseRobots(await readPublicFile('robots.txt'));
      for (const g of groups) {
        expect(g.rules, g.agents.join(',')).toContain('disallow: /admin/');
        expect(g.rules, g.agents.join(',')).toContain('disallow: /api/');
        expect(g.rules).not.toContain('disallow: /');
      }
    });

    it('declares the real sitemap on guia.tourup.co', async () => {
      const content = await readPublicFile('robots.txt');
      expect(content).toContain(`Sitemap: ${SITE}/sitemap-index.xml`);
      expect(content).not.toMatch(/\/sitemap\.xml/);
      expect(content).not.toMatch(/https:\/\/tourup\.co/);
    });

    it('references AEO files', async () => {
      const content = await readPublicFile('robots.txt');
      expect(content).toContain('llms.txt');
      expect(content).toContain('llms-full.txt');
      expect(content).toContain('ai-index.json');
    });
  });

  describe('sitemap', () => {
    it('is produced only by @astrojs/sitemap (no custom endpoint, no stale static copy)', async () => {
      expect(existsSync(path.resolve('src/pages/sitemap.xml.ts'))).toBe(false);
      for (const stale of ['sitemap.xml', 'sitemap-llm.xml', 'docs.json', 'schema.json']) {
        expect(await fileExists(stale), `public/${stale} no debe existir`).toBe(false);
      }
    });

    it('astro.config.mjs targets guia.tourup.co and excludes admin/api', async () => {
      const cfg = await fs.readFile(path.resolve('astro.config.mjs'), 'utf-8');
      expect(cfg).toContain("site: 'https://guia.tourup.co'");
      expect(cfg).toMatch(/sitemap\(\{/);
      expect(cfg).toMatch(/admin\|api/);
      expect(cfg).not.toMatch(/aeoAstroIntegration/);
    });
  });

  describe('llms.txt', () => {
    it('exists and follows the llmstxt.org shape (H1, blockquote, H2 link lists)', async () => {
      const content = await readPublicFile('llms.txt');
      expect(content.startsWith('# TourUp')).toBe(true);
      expect(content).toContain('B2B Peru Travel Marketplace');
      expect(content).toMatch(/^> .+/m);
      expect(content).toMatch(/^## /m);
      expect(content).toMatch(/^- \[[^\]]+\]\(https:\/\/guia\.tourup\.co\/[^)]*\)/m);
    });

    it('is curated: small enough to be read whole by an LLM', async () => {
      const content = await readPublicFile('llms.txt');
      expect(content.length).toBeLessThan(50 * 1024);
    });

    it('only links to pages that exist', async () => {
      expectRealRoutes(await readPublicFile('llms.txt'));
    });

    it('lists every destination in both languages', async () => {
      const content = await readPublicFile('llms.txt');
      for (const slug of slugsOf('destinos')) expect(content).toContain(`${SITE}/es/peru/${slug}/`);
      for (const slug of slugsOf('destinos_en')) expect(content).toContain(`${SITE}/en/peru/${slug}/`);
    });

    it('has no admin pages, template placeholders or backslashes', async () => {
      const content = await readPublicFile('llms.txt');
      expect(content).not.toMatch(/\/admin\/|\[lang\]|\[slug\]|\\/);
    });
  });

  describe('llms-full.txt', () => {
    it('exists and is non-empty but bounded', async () => {
      const content = await readPublicFile('llms-full.txt');
      expect(content.length).toBeGreaterThan(100);
      expect(content.length).toBeLessThan(2 * 1024 * 1024);
    });

    it('only links to pages that exist', async () => {
      expectRealRoutes(await readPublicFile('llms-full.txt'));
    });
  });

  describe('ai-index.json', () => {
    let index: any;

    it('exists in public/', async () => {
      expect(await fileExists('ai-index.json')).toBe(true);
    });

    it('parses as valid JSON', async () => {
      const content = await readPublicFile('ai-index.json');
      index = JSON.parse(content);
      expect(index).toBeDefined();
    });

    it('has version field', async () => {
      const content = await readPublicFile('ai-index.json');
      index = JSON.parse(content);
      expect(index.version).toBeDefined();
    });

    it('has site metadata', async () => {
      const content = await readPublicFile('ai-index.json');
      index = JSON.parse(content);
      expect(index.site).toBeDefined();
      expect(index.site.title).toContain('TourUp');
      expect(index.site.url).toBe('https://guia.tourup.co');
    });

    it('has entries array', async () => {
      const content = await readPublicFile('ai-index.json');
      index = JSON.parse(content);
      expect(Array.isArray(index.entries)).toBe(true);
      expect(index.entries.length).toBeGreaterThan(0);
    });

    it('entries have required fields', async () => {
      const content = await readPublicFile('ai-index.json');
      index = JSON.parse(content);
      const entry = index.entries[0];
      expect(entry.id).toBeDefined();
      expect(entry.url).toBeDefined();
      expect(entry.title).toBeDefined();
    });

    it('entry URLs use forward slashes', async () => {
      const content = await readPublicFile('ai-index.json');
      index = JSON.parse(content);
      for (const entry of index.entries.slice(0, 50)) {
        expect(entry.url).not.toContain('\\');
      }
    });

    it('entry metadata has type field', async () => {
      const content = await readPublicFile('ai-index.json');
      index = JSON.parse(content);
      for (const entry of index.entries.slice(0, 20)) {
        if (entry.metadata) {
          expect(entry.metadata.type).toBeDefined();
        }
      }
    });

    it('company entries have summary', async () => {
      const content = await readPublicFile('ai-index.json');
      index = JSON.parse(content);
      const companies = index.entries.filter((e: any) => e.metadata?.type === 'company');
      expect(companies.length).toBeGreaterThan(0);
      for (const company of companies.slice(0, 10)) {
        expect(company.metadata.summary).toBeDefined();
        expect(company.metadata.summary.length).toBeGreaterThan(0);
      }
    });

    it('prompt entries have quick_answer or summary', async () => {
      const content = await readPublicFile('ai-index.json');
      index = JSON.parse(content);
      const prompts = index.entries.filter((e: any) => e.metadata?.type === 'prompt_landing');
      expect(prompts.length).toBeGreaterThan(0);
      for (const prompt of prompts.slice(0, 10)) {
        const hasContent = prompt.metadata.quick_answer || prompt.metadata.summary;
        expect(hasContent).toBeDefined();
      }
    });

    it('entry URLs are real routes (no .md, admin or external_brands pages)', async () => {
      index = JSON.parse(await readPublicFile('ai-index.json'));
      const routes = ROUTES.filter((r) => !/llms-full/.test(r.source));
      for (const entry of index.entries) {
        expect(entry.url, entry.url).not.toMatch(/[.]md|admin|external_brands|[\\]|[/][/]/);
        expect(routes.some((r) => r.test(entry.url)), `ruta inexistente: ${entry.url}`).toBe(true);
      }
    });

    it('entries have keywords array', async () => {
      const content = await readPublicFile('ai-index.json');
      index = JSON.parse(content);
      for (const entry of index.entries.slice(0, 20)) {
        expect(Array.isArray(entry.keywords)).toBe(true);
      }
    });
  });

  describe('.well-known/ai-plugin.json', () => {
    let plugin: any;

    it('exists in public/.well-known/', async () => {
      expect(await fileExists('.well-known/ai-plugin.json')).toBe(true);
    });

    it('parses as valid JSON', async () => {
      const content = await readPublicFile('.well-known/ai-plugin.json');
      plugin = JSON.parse(content);
      expect(plugin).toBeDefined();
    });

    it('has schema_version', async () => {
      const content = await readPublicFile('.well-known/ai-plugin.json');
      plugin = JSON.parse(content);
      expect(plugin.schema_version).toBe('v1');
    });

    it('has name_for_human', async () => {
      const content = await readPublicFile('.well-known/ai-plugin.json');
      plugin = JSON.parse(content);
      expect(plugin.name_for_human).toContain('TourUp');
    });

    it('has name_for_model', async () => {
      const content = await readPublicFile('.well-known/ai-plugin.json');
      plugin = JSON.parse(content);
      expect(plugin.name_for_model).toBeDefined();
      expect(plugin.name_for_model.length).toBeGreaterThan(0);
    });

    it('has description_for_model', async () => {
      const content = await readPublicFile('.well-known/ai-plugin.json');
      plugin = JSON.parse(content);
      expect(plugin.description_for_model).toBeDefined();
      expect(plugin.description_for_model.length).toBeGreaterThan(50);
    });

    it('has auth configuration', async () => {
      const content = await readPublicFile('.well-known/ai-plugin.json');
      plugin = JSON.parse(content);
      expect(plugin.auth).toBeDefined();
      expect(plugin.auth.type).toBeDefined();
    });

    it('has api configuration', async () => {
      const content = await readPublicFile('.well-known/ai-plugin.json');
      plugin = JSON.parse(content);
      expect(plugin.api).toBeDefined();
      expect(plugin.api.type).toBe('openapi');
    });

    it('description mentions Peru travel', async () => {
      const content = await readPublicFile('.well-known/ai-plugin.json');
      plugin = JSON.parse(content);
      expect(plugin.description_for_model.toLowerCase()).toContain('peru');
      expect(plugin.description_for_model.toLowerCase()).toContain('tour');
    });
  });

  describe('.well-known/ai-plugin-api.json', () => {
    let api: any;

    it('exists in public/.well-known/', async () => {
      expect(await fileExists('.well-known/ai-plugin-api.json')).toBe(true);
    });

    it('parses as valid JSON', async () => {
      const content = await readPublicFile('.well-known/ai-plugin-api.json');
      api = JSON.parse(content);
      expect(api).toBeDefined();
    });

    it('has OpenAPI 3.x version', async () => {
      const content = await readPublicFile('.well-known/ai-plugin-api.json');
      api = JSON.parse(content);
      expect(api.openapi).toMatch(/^3\./);
    });

    it('has info block with title', async () => {
      const content = await readPublicFile('.well-known/ai-plugin-api.json');
      api = JSON.parse(content);
      expect(api.info).toBeDefined();
      expect(api.info.title).toContain('TourUp');
    });

    it('has server URL pointing to guia.tourup.co', async () => {
      const content = await readPublicFile('.well-known/ai-plugin-api.json');
      api = JSON.parse(content);
      expect(api.servers).toBeDefined();
      expect(api.servers[0].url).toBe('https://guia.tourup.co');
    });

    it('defines company endpoint', async () => {
      const content = await readPublicFile('.well-known/ai-plugin-api.json');
      api = JSON.parse(content);
      expect(api.paths['/en/companies/{slug}/']).toBeDefined();
    });

    it('defines destination endpoint', async () => {
      const content = await readPublicFile('.well-known/ai-plugin-api.json');
      api = JSON.parse(content);
      expect(api.paths['/en/peru/{destino}/']).toBeDefined();
    });

    it('defines AI prompt endpoint', async () => {
      const content = await readPublicFile('.well-known/ai-plugin-api.json');
      api = JSON.parse(content);
      expect(api.paths['/en/ai-prompts/{slug}/']).toBeDefined();
    });

    it('each endpoint has GET operation', async () => {
      const content = await readPublicFile('.well-known/ai-plugin-api.json');
      api = JSON.parse(content);
      for (const [path, pathItem] of Object.entries(api.paths) as any) {
        expect(pathItem.get).toBeDefined();
        expect(pathItem.get.operationId).toBeDefined();
        expect(pathItem.get.summary).toBeDefined();
      }
    });
  });
});
