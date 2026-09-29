import { describe, it, expect } from 'vitest';
import {
  directoryStats,
  indexCompanies,
  isTranslated,
  mentionSignature,
  placeholderSignatures,
  quickAnswer,
  resolveMentions,
} from '../utils/prompts';
import { cityLabel, companyPath } from '../utils/seo';

const company = (id: string, title: string, city = 'CUSCO', role = 'tour_operator', slug?: string) => ({
  id: `${id}.md`,
  slug,
  data: { title, distribution_role: role, location: { city }, summary: `Travel Company based in ${city}, Peru.` },
});

const companies = [
  company('explore-peru-tours', 'Explore Peru Tours'),
  company('feel-perú-travel-josé-luis-bustamante-y-rivero', 'Feel Perú Travel', 'AREQUIPA', 'retail_travel_agency', '/company/feel-per-travel-jos-luis-bustamante-y-rivero'),
  company('ate', '-', 'ATE', 'retail_travel_agency'),
];

describe('companyPath / cityLabel', () => {
  it('construye la ruta en el idioma de la página, sin .md', () => {
    expect(companyPath('es', 'x.md')).toBe('/es/empresas/x/');
    expect(companyPath('en', 'x')).toBe('/en/companies/x/');
  });
  it('pasa la ciudad de mayúsculas a formato legible', () => {
    expect(cityLabel('SAN JERÓNIMO')).toBe('San Jerónimo');
    expect(cityLabel('')).toBe('');
  });
});

describe('resolveMentions', () => {
  const idx = indexCompanies(companies);

  it('encuentra la ficha aunque el id de la colección lleve .md (bug original)', () => {
    const [m] = resolveMentions([{ name: 'Explore', entity_type: 'company', entity_slug: 'explore-peru-tours' }], idx, [], 'es');
    expect(m.found).toBe(true);
    expect(m.url).toBe('/es/empresas/explore-peru-tours/');
  });

  it('encuentra la ficha con o sin tildes en el slug citado', () => {
    const conTilde = resolveMentions([{ name: 'Feel', entity_type: 'company', entity_slug: 'feel-perú-travel-josé-luis-bustamante-y-rivero' }], idx, [], 'en');
    const sinTilde = resolveMentions([{ name: 'Feel', entity_type: 'company', entity_slug: 'feel-per-travel-jos-luis-bustamante-y-rivero' }], idx, [], 'en');
    expect(conTilde[0].url).toBe('/en/companies/feel-perú-travel-josé-luis-bustamante-y-rivero/');
    expect(sinTilde[0].url).toBe(conTilde[0].url);
  });

  it('no enlaza fichas sin nombre (noindex) ni slugs inexistentes', () => {
    const r = resolveMentions(
      [
        { name: 'Ate', entity_type: 'company', entity_slug: 'ate' },
        { name: 'Nope', entity_type: 'company', entity_slug: 'no-existe' },
      ],
      idx, [], 'es',
    );
    expect(r.every((m) => !m.found)).toBe(true);
  });

  it('las marcas externas enlazan a su web oficial', () => {
    const [m] = resolveMentions(
      [{ name: 'Kantu', entity_type: 'external_brand', entity_slug: 'kantu' }],
      idx, [{ id: 'kantu.md', data: { name: 'Kantu', official_url: 'https://kantu.example' } }], 'en',
    );
    expect(m).toMatchObject({ found: true, external: true, url: 'https://kantu.example' });
  });
});

describe('placeholderSignatures', () => {
  const def = [{ entity_type: 'company', entity_slug: 'a' }, { entity_type: 'company', entity_slug: 'b' }];
  const real = [{ entity_type: 'external_brand', entity_slug: 'kantu' }];

  it('marca como relleno la lista que comparten casi todos los prompts', () => {
    const all = [...Array(9).fill(def), real];
    const ph = placeholderSignatures(all);
    expect(ph.has(mentionSignature(def))).toBe(true);
    expect(ph.has(mentionSignature(real))).toBe(false);
  });

  it('ignora destinos y categorías en la firma (se repiten en todos)', () => {
    expect(mentionSignature([...def, { entity_type: 'destino', entity_slug: 'cusco' }])).toBe(mentionSignature(def));
  });
});

describe('quickAnswer', () => {
  const stats = directoryStats(companies, 'es');

  it('las estadísticas excluyen fichas sin nombre', () => {
    expect(stats.total).toBe(2);
    expect(stats.regions.map((c) => c.label)).toEqual(expect.arrayContaining(['Cusco', 'Arequipa']));
    expect(stats.roles.map((r) => r.label)).toContain('operadores turísticos');
  });

  it('con la lista por defecto no afirma que la IA mencionó a nadie', () => {
    const mentions = resolveMentions([{ name: 'Explore', entity_type: 'company', entity_slug: 'explore-peru-tours' }], indexCompanies(companies), [], 'es');
    const a = quickAnswer({ question: '¿X?', lang: 'es', mentions, realMentions: false, platforms: ['ChatGPT'], stats });
    expect(a).not.toMatch(/mencion|ChatGPT/i);
    expect(a).toContain('2 empresas');
  });

  it('con menciones reales nombra las empresas y la plataforma', () => {
    const mentions = resolveMentions([{ name: 'Explore', entity_type: 'company', entity_slug: 'explore-peru-tours' }], indexCompanies(companies), [], 'en');
    const a = quickAnswer({ question: 'Which Cusco operators?', lang: 'en', mentions, realMentions: true, platforms: ['ChatGPT'], stats: directoryStats(companies, 'en') });
    expect(a).toContain('ChatGPT');
    expect(a).toContain('Explore Peru Tours (Cusco)');
    expect(a).not.toMatch(/verified|evaluated|best/i);
  });

  it('con menciones reales nombra también las marcas citadas que no tienen ficha', () => {
    const mentions = resolveMentions(
      [
        { name: 'Explore', entity_type: 'company', entity_slug: 'explore-peru-tours' },
        { name: 'Peru For Less', entity_type: 'external_brand', entity_slug: 'peru-for-less' },
      ],
      indexCompanies(companies), [], 'en',
    );
    const a = quickAnswer({ question: 'Q', lang: 'en', mentions, realMentions: true, platforms: ['ChatGPT'], stats: directoryStats(companies, 'en') });
    expect(a).toContain('Peru For Less');
  });
});

describe('isTranslated', () => {
  it('una página /es/ con el mismo título que la inglesa no está traducida', () => {
    expect(isTranslated('Best Peru tours', 'Best Peru tours')).toBe(false);
    expect(isTranslated('Mejores tours en Perú', 'Best Peru tours')).toBe(true);
    expect(isTranslated('Solo en español', undefined)).toBe(true);
  });
});
