import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { hreflangAlternates, breadcrumbTrail, companyDescription, shortTitle, SITE_URL } from '../utils/seo';

const read = (rel: string) => fs.readFileSync(path.resolve(rel), 'utf-8');

describe('hreflangAlternates', () => {
  it('home: es, en y x-default apuntan a páginas reales', () => {
    expect(hreflangAlternates('/')).toEqual({
      es: `${SITE_URL}/es/`,
      en: `${SITE_URL}/en/`,
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
    expect(t[0].url).toBe(`${SITE_URL}/en/`);
  });

  it('localiza la miga raíz', () => {
    expect(breadcrumbTrail('/es/ai-prompts/x/', 'es', 'X')[0].name).toBe('Inicio');
  });

  it('/{lang}/peru/ es una redirección: la miga apunta a /{lang}/peru/peru/ sin duplicarse', () => {
    const t = breadcrumbTrail('/es/peru/peru/', 'es', 'Perú – TourUp');
    expect(t.map((c) => c.url)).toEqual([`${SITE_URL}/es/`, `${SITE_URL}/es/peru/peru/`]);
    const cusco = breadcrumbTrail('/es/peru/cusco/', 'es', 'Cusco');
    expect(cusco[1].url).toBe(`${SITE_URL}/es/peru/peru/`);
    expect(cusco[2].url).toBe(`${SITE_URL}/es/peru/cusco/`);
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
  it('usa el summary cuando existe (y lo localiza si es bilingüe)', () => {
    expect(companyDescription({ title: 'X', summary: 'Hola' }, 'es')).toBe('Hola');
    expect(companyDescription({ title: 'X', summary: { es: 'Hola', en: 'Hi' } }, 'en')).toBe('Hi');
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

  it('Layout y SettingsHead comparten el mismo grafo', () => {
    expect(read('src/layouts/Layout.astro')).toContain('<SiteJsonLd');
    expect(read('src/components/SettingsHead.astro')).toContain('<SiteJsonLd');
  });
});

describe('fichas de empresa', () => {
  for (const f of ['src/pages/[lang]/companies/[slug].astro', 'src/pages/[lang]/empresas/[slug].astro']) {
    const src = read(f);
    it(`${f}: canonical propio (nunca el de otro idioma)`, () => {
      expect(src).toContain('canonicalUrl={pageUrl}');
      expect(src).not.toMatch(/canonicalUrl=\{canonical(En|Es)\}/);
    });
    it(`${f}: el nodo de empresa no comparte @id con el WebPage`, () => {
      expect(src).toContain('#company');
      expect(src).not.toMatch(/'@id':\s*pageUrl,/);
    });
    it(`${f}: sin microdata duplicado del JSON-LD`, () => {
      expect(src).not.toMatch(/itemscope|itemprop=|itemtype=/);
    });
  }
});
