/**
 * Relaciones entre entidades del sitio (destino ↔ itinerario ↔ empresa). Los itinerarios son
 * páginas escritas a mano; las paradas de cada uno salen de su propio contenido.
 */
import { ITINERARIES } from '../data/site';
import { getLocalizedString, type Locale } from './i18n';
import { cityLabel, companyDisplayName, companyRole, hasCompanyName } from './seo';

const STOPS: Record<number, string[]> = {
  7: ['lima', 'cusco', 'machu_picchu'],
  10: ['lima', 'cusco', 'machu_picchu', 'arequipa'],
  14: ['lima', 'cusco', 'machu_picchu', 'arequipa', 'colca', 'puno'],
};

export function itineraryStops(days: number): string[] {
  return STOPS[days] ?? [];
}

/** Itinerarios que pasan por un destino. */
export function itinerariesFor(destinationSlug: string) {
  return ITINERARIES.filter((it) => itineraryStops(it.days).includes(destinationSlug));
}

interface CompanyEntry {
  id: string;
  data: Record<string, any>;
}

/**
 * Empresas que declaran operar en un destino: solo con nombre real y una por RUC (el origen
 * repite algunas empresas con el mismo RUC). Única fuente de esta cifra en todo el sitio.
 */
export function operatorsIn(companies: CompanyEntry[], destinationSlug: string, lang: Locale) {
  const seen = new Set<string>();
  return companies
    .filter((c) => c.data.destinos?.includes(destinationSlug) && hasCompanyName(getLocalizedString(c.data.title, lang)))
    .filter((c) => {
      const tid = c.data.regulation?.tax_id;
      if (!tid) return true;
      if (seen.has(tid)) return false;
      seen.add(tid);
      return true;
    })
    .map((c) => ({
      id: c.id,
      name: companyDisplayName(c.data, lang),
      city: cityLabel(c.data.location?.city),
      role: companyRole(c.data, lang),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, lang));
}

/** Destinos (slugs) en los que opera una empresa. */
export function destinationsOf(company: CompanyEntry): string[] {
  return (company.data.destinos ?? []).filter(Boolean);
}

const CATEGORY_LABELS: Record<string, Record<Locale, string>> = {
  aventura: { es: 'Aventura', en: 'Adventure' },
  arqueologico: { es: 'Arqueología', en: 'Archaeology' },
  birdwatching: { es: 'Observación de aves', en: 'Birdwatching' },
  cultural: { es: 'Cultural', en: 'Culture' },
  'tours-culturales': { es: 'Tours culturales', en: 'Cultural tours' },
  'tours-comunitarios': { es: 'Turismo comunitario', en: 'Community tourism' },
  'full-day': { es: 'Full day', en: 'Day trips' },
  'multi-day': { es: 'Varios días', en: 'Multi-day' },
  gastronomico: { es: 'Gastronomía', en: 'Food' },
  trekking: { es: 'Trekking', en: 'Trekking' },
  lujo: { es: 'Lujo', en: 'Luxury' },
  familia: { es: 'Familias', en: 'Families' },
  mice: { es: 'MICE', en: 'MICE' },
  selva: { es: 'Selva', en: 'Jungle' },
  playa: { es: 'Playa', en: 'Beach' },
  fotografia: { es: 'Fotografía', en: 'Photography' },
  navegacion: { es: 'Navegación', en: 'Boat trips' },
  bienestar: { es: 'Bienestar', en: 'Wellness' },
  educativo: { es: 'Educativo', en: 'Educational' },
};

/** Etiqueta de un tipo de tour en el idioma de la página (el dato de origen solo está en español). */
export function categoryLabel(slug: string, lang: Locale): string {
  return CATEGORY_LABELS[slug]?.[lang] ?? slug.replace(/[-_]/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
}
