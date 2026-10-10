import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { hreflangAlternates, breadcrumbTrail, companyDescription, companyDisplayName, hasCompanyName, shortTitle, SITE_URL } from '../utils/seo';

const read = (rel: string) => fs.readFileSync(path.resolve(rel), 'utf-8');

describe('hreflangAlternates', () => {
  it('home: la inglesa es `/` (idioma principal) y la española `/es/`', () => {
    expect(hreflangAlternates('/')).toEqual({
      es: `${SITE_URL}/es/`,
      en: `${SITE_URL}/`,
      xDefault: `${SITE_URL}/`,
    });
  });

  it('intercambia el idioma manteniendo el path', () => {
    const a = hreflangAlternates('/es/peru/cusco/')!;
    expect(a.es).toBe(`${SITE_URL}/es/peru/cusco/`);
    expect(a.en).toBe(`${SITE_URL}/en/peru/cusco/`);
    expect(a.xDefault).toBe(a.en);
  });

  it('empresas (es) ↔ companies (en), incluyendo el índice y las fichas', () => {
    const detail = hreflangAlternates('/es/empresas/alpaca-expeditions-cusco/')!;
    expect(detail.es).toBe(`${SITE_URL}/es/empresas/alpaca-expeditions-cusco/`);
    expect(detail.en).toBe(`${SITE_URL}/en/companies/alpaca-expeditions-cusco/`);
    const index = hreflangAlternates('/en/companies/')!;
    expect(index.es).toBe(`${SITE_URL}/es/empresas/`);
    expect(index.en).toBe(`${SITE_URL}/en/companies/`);
  });

  it('no inventa alternates para páginas sin versión por idioma (blog)', () => {
    expect(hreflangAlternates('/blog/')).toBeNull();
    expect(hreflangAlternates('/blog/getting-started-with-peru-travel/')).toBeNull();
  });
});

describe('breadcrumbTrail', () => {
  it('no incluye el idioma como miga ("En") y usa etiquetas legibles', () => {
    const t = breadcrumbTrail('/en/companies/alpaca-expeditions-cusco/', 'en', 'Alpaca Expeditions');
    expect(t.map((c) => c.name)).toEqual(['Home', 'Companies', 'Alpaca Expeditions']);
    expect(t[0].url).toBe(`${SITE_URL}/`);
  });

  it('localiza la miga raíz', () => {
    expect(breadcrumbTrail('/es/ai-prompts/x/', 'es', 'X')[0].name).toBe('Inicio');
  });

  it('la miga "Destinos" de /{lang}/peru/x/ apunta al índice de destinos del idioma', () => {
    const cusco = breadcrumbTrail('/es/peru/cusco/', 'es', 'Cusco');
    expect(cusco.map((c) => c.url)).toEqual([`${SITE_URL}/es/`, `${SITE_URL}/es/destinos/`, `${SITE_URL}/es/peru/cusco/`]);
    expect(cusco[1].name).toBe('Destinos');
    const hub = breadcrumbTrail('/en/destinations/', 'en', 'Destinations');
    expect(hub.map((c) => c.url)).toEqual([`${SITE_URL}/`, `${SITE_URL}/en/destinations/`]);
  });

  it('destinations (en) ↔ destinos (es) en hreflang', () => {
    const a = hreflangAlternates('/es/destinos/')!;
    expect(a.en).toBe(`${SITE_URL}/en/destinations/`);
    expect(a.es).toBe(`${SITE_URL}/es/destinos/`);
  });

  it('páginas sin prefijo de idioma cuelgan de la raíz', () => {
    const t = breadcrumbTrail('/blog/post/', 'es', 'Post');
    expect(t.map((c) => c.url)).toEqual([`${SITE_URL}/`, `${SITE_URL}/blog/`, `${SITE_URL}/blog/post/`]);
  });

  it('la home no tiene migas adicionales', () => {
    expect(breadcrumbTrail('/', 'es')).toHaveLength(1);
  });
});

describe('shortTitle', () => {
  it('quita el sufijo de marca del <title>', () => {
    expect(shortTitle('Alpaca Expeditions | TourUp')).toBe('Alpaca Expeditions');
    expect(shortTitle('Cusco – TourUp Peru')).toBe('Cusco – TourUp Peru');
    expect(shortTitle('Viajar a Cusco | TourUp Peru')).toBe('Viajar a Cusco');
    expect(shortTitle('Sin sufijo')).toBe('Sin sufijo');
  });
});

describe('companyDescription', () => {
  it('antepone el nombre al summary genérico para que cada descripción sea única', () => {
    expect(companyDescription({ title: 'X', summary: 'Hola' }, 'es')).toBe('X — Hola');
    expect(companyDescription({ title: 'X', summary: { es: 'Hola', en: 'Hi' } }, 'en')).toBe('X — Hi');
    const a = companyDescription({ title: 'A1 Travel', summary: 'Travel Company based in CUSCO, CUSCO, Peru.' }, 'en');
    const b = companyDescription({ title: 'Inka Tours', summary: 'Travel Company based in CUSCO, CUSCO, Peru.' }, 'en');
    expect(a).not.toBe(b);
  });

  it('en español no reutiliza el summary en inglés de origen', () => {
    const d = { title: 'A1 Travel', summary: 'Retail Travel Agency based in LIMA, LIMA, Peru.', distribution_role: 'retail_travel_agency', location: { city: 'LIMA' } };
    const es = companyDescription(d, 'es');
    expect(es).not.toMatch(/based in/i);
    expect(es).toContain('A1 Travel');
    expect(es).toContain('LIMA');
    expect(companyDescription(d, 'en')).toBe('A1 Travel — Retail Travel Agency based in LIMA, LIMA, Peru.');
  });

  it('no repite el nombre si el summary ya lo contiene', () => {
    expect(companyDescription({ title: 'Alpaca', summary: 'Alpaca es un DMC en Cusco.' }, 'es')).toBe('Alpaca es un DMC en Cusco.');
  });

  it("genera una descripción cuando summary es '' (caso de las 985 empresas)", () => {
    const es = companyDescription({ title: 'Alpaca', summary: '', distribution_role: 'dmc', location: { city: 'Cusco' } }, 'es');
    expect(es).toContain('Alpaca');
    expect(es).toContain('Cusco');
    expect(es.length).toBeGreaterThan(40);
    const en = companyDescription({ title: 'Alpaca', summary: '' }, 'en');
    expect(en).toContain('Peru');
  });

  it('no afirma verificación, licencias ni reseñas que quizá no existan', () => {
    const d = companyDescription({ title: 'A', summary: '' }, 'es');
    expect(d).not.toMatch(/verificad|licenci|reseñ|rating/i);
  });
});

describe('companyDisplayName / hasCompanyName', () => {
  it('detecta títulos sin nombre real', () => {
    expect(hasCompanyName('-')).toBe(false);
    expect(hasCompanyName('  ')).toBe(false);
    expect(hasCompanyName('A1 Travel')).toBe(true);
    expect(hasCompanyName('Ñandú Tours')).toBe(true);
  });

  it('usa una etiqueta descriptiva (no un nombre inventado) cuando el título es "-"', () => {
    const d = { title: '-', distribution_role: 'retail_travel_agency', location: { city: 'ATE' } };
    expect(companyDisplayName(d, 'es')).toBe('Agencia de viajes minorista en ATE');
    expect(companyDisplayName(d, 'en')).toBe('Retail travel agency in ATE');
    expect(companyDisplayName({ title: 'Alpaca' }, 'es')).toBe('Alpaca');
  });

  it('la descripción de una ficha sin nombre no antepone la etiqueta al summary', () => {
    const d = { title: '-', summary: 'Retail Travel Agency based in ATE, LIMA, Peru.', location: { city: 'ATE' } };
    expect(companyDescription(d, 'en')).toBe('Retail Travel Agency based in ATE, LIMA, Peru.');
  });
});

describe('JSON-LD: sin marcado engañoso ni duplicado', () => {
  const promptLd = read('src/components/JsonLdPromptLanding.astro');
  const siteLd = read('src/components/SiteJsonLd.astro');

  it('los prompts no usan SpecialAnnouncement ni HowTo con pasos inventados', () => {
    expect(promptLd).not.toMatch(/'@type':\s*'(SpecialAnnouncement|HowTo|HowToStep)'/);
    expect(promptLd).not.toMatch(/Consider \$\{/);
  });

  it('los prompts no duplican WebPage/BreadcrumbList del layout', () => {
    expect(promptLd).not.toMatch(/'@type':\s*'(WebPage|BreadcrumbList)'/);
  });

  it('el grafo base no declara un SearchAction sin buscador ni datos sin verificar', () => {
    expect(siteLd).not.toMatch(/SearchAction|foundingDate/);
  });

  it('WebPage/Organization/WebSite/BreadcrumbList tienen @id estables', () => {
    for (const t of ['Organization', 'WebSite', 'WebPage', 'BreadcrumbList']) {
      expect(siteLd).toContain(`'@type': '${t}'`);
    }
    expect(siteLd).toContain('#organization');
    expect(siteLd).toContain('#webpage');
  });

  it('todas las páginas emiten el mismo grafo desde Layout', () => {
    expect(read('src/layouts/Layout.astro')).toContain('<SiteJsonLd');
  });

  it('el sitio es 100 % estático: sin adaptador ni rutas SSR', () => {
    expect(read('astro.config.mjs')).not.toMatch(/adapter:|@astrojs\/node/);
    expect(read('astro.config.mjs')).toContain("output: 'static'");
  });
});

describe('fichas de empresa', () => {
  const f = 'src/components/site/CompanyProfile.astro';
  const src = read(f);
  it('las dos rutas usan la misma plantilla', () => {
    for (const r of ['src/pages/[lang]/companies/[slug].astro', 'src/pages/[lang]/empresas/[slug].astro']) {
      expect(read(r)).toContain('<CompanyProfile');
    }
  });
  it('canonical propio: la página de cada idioma se declara a sí misma (nunca la del otro idioma)', () => {
    expect(src).toMatch(/const path = es \? `\/es\/empresas\/\$\{id\}\/` : `\/en\/companies\/\$\{id\}\/`/);
    expect(src).toContain('currentPath={path}');
    expect(src).not.toMatch(/canonicalUrl=/);
  });
  it('el nodo de empresa no comparte @id con el WebPage', () => {
    expect(src).toContain('#company');
    expect(src).not.toMatch(/'@id':\s*pageUrl,/);
  });
  it('sin microdata duplicado del JSON-LD', () => {
    expect(src).not.toMatch(/itemscope|itemprop=|itemtype=/);
  });
  it('no muestra el representante legal (dato personal)', () => {
    expect(src).not.toContain('legal_representative');
  });
});
