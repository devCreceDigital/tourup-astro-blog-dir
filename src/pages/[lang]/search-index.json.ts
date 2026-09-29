/**
 * Índice estático de búsqueda por idioma (/en/search-index.json, /es/search-index.json).
 * Solo páginas indexables: destinos, itinerarios, guías, preguntas en inglés y fichas con nombre.
 */
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { getLocalizedString, type Locale } from '../../utils/i18n';
import { cityLabel, companyDisplayName, companyPath, companyRole, hasCompanyName } from '../../utils/seo';
import { ITINERARIES, destinationPath, itineraryPath } from '../../data/site';

export function getStaticPaths() {
  return [{ params: { lang: 'en' } }, { params: { lang: 'es' } }];
}

export const GET: APIRoute = async ({ params }) => {
  const lang = (params.lang === 'es' ? 'es' : 'en') as Locale;
  const es = lang === 'es';
  const [destinos, companies, prompts] = await Promise.all([
    getCollection(es ? 'destinos' : 'destinos_en'),
    getCollection('companies'),
    getCollection('prompts'),
  ]);

  const items: { k: string; t: string; u: string; s: string }[] = [];
  for (const d of destinos) {
    const slug = d.id.replace(/\.md$/i, '');
    items.push({ k: 'destination', t: getLocalizedString(d.data.name, lang), u: destinationPath(lang, slug), s: getLocalizedString(d.data.summary, lang) });
  }
  for (const it of ITINERARIES) {
    items.push({ k: 'itinerary', t: es ? `Itinerario de ${it.days} días` : `${it.days}-day Peru itinerary`, u: itineraryPath(lang, it.slug), s: '' });
  }
  items.push(
    { k: 'guide', t: es ? 'Tours a Machu Picchu desde Cusco' : 'Machu Picchu tours from Cusco', u: `/${lang}/peru/cusco/tours-machu-picchu/`, s: '' },
    { k: 'guide', t: es ? 'Preguntas frecuentes sobre viajar a Perú' : 'Peru travel FAQ', u: `/${lang}/peru/preguntas-frecuentes/`, s: '' },
  );
  for (const p of prompts) {
    items.push({ k: 'question', t: getLocalizedString(p.data.title, 'en'), u: `/en/ai-prompts/${p.id.replace(/\.md$/i, '')}/`, s: '' });
  }
  for (const c of companies) {
    if (!hasCompanyName(getLocalizedString(c.data.title, lang))) continue;
    const city = cityLabel(c.data.location?.city);
    items.push({ k: 'company', t: companyDisplayName(c.data, lang), u: companyPath(lang, c.id), s: [companyRole(c.data, lang), city].filter(Boolean).join(' · ') });
  }

  return new Response(JSON.stringify(items), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
