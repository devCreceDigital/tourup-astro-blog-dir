/**
 * Navegación y rutas del sitio. Inglés es el idioma principal: la home inglesa vive en `/`,
 * la española en `/es/`. Las secciones existen en los dos idiomas bajo /{lang}/.
 */
import type { Locale } from '../utils/i18n';

export const homePath = (lang: Locale) => (lang === 'en' ? '/' : '/es/');
export const destinationsPath = (lang: Locale) => (lang === 'es' ? '/es/destinos/' : '/en/destinations/');
export const destinationPath = (lang: Locale, slug: string) => `/${lang}/peru/${slug}/`;
export const directoryPath = (lang: Locale) => (lang === 'en' ? '/en/companies/' : '/es/empresas/');
// Las preguntas de viajeros solo existen traducidas en inglés; en español, "Guías" lleva a las FAQ.
export const guidesPath = (lang: Locale) => (lang === 'es' ? '/es/peru/preguntas-frecuentes/' : '/en/ai-prompts/');

export const ITINERARIES = [
  { slug: 'itinerario-7-dias', days: 7, photo: 'cusco' },
  { slug: 'itinerario-10-dias', days: 10, photo: 'titicaca' },
  { slug: 'itinerario-14-dias', days: 14, photo: 'nazca' },
] as const;

export const itineraryPath = (lang: Locale, slug: string) => `/${lang}/peru/${slug}/`;

export function navItems(lang: Locale) {
  const es = lang === 'es';
  return [
    { label: es ? 'Destinos' : 'Destinations', href: destinationsPath(lang), match: /\/(destinations|destinos)\/|\/peru\/(?!itinerario|preguntas)/ },
    { label: es ? 'Itinerarios' : 'Itineraries', href: `${homePath(lang)}#itineraries`, match: /itinerario/ },
    { label: es ? 'Guías' : 'Guides', href: guidesPath(lang), match: /ai-prompts|blog|preguntas-frecuentes/ },
    { label: es ? 'Sostenibilidad' : 'Sustainability', href: es ? '/es/sostenibilidad/' : '/en/sustainability/', match: /sustainability|sostenibilidad/ },
    { label: es ? 'Directorio de operadores' : 'Operator directory', href: directoryPath(lang), match: /companies|empresas/ },
  ];
}

/** Orden editorial de los destinos (los más visitados primero). */
export const DESTINATION_ORDER = [
  'cusco', 'machu_picchu', 'lima', 'arequipa', 'puno', 'colca', 'ica', 'paracas', 'nazca', 'huaraz',
  'iquitos', 'puerto_maldonado', 'manu', 'trujillo', 'chiclayo', 'chachapoyas', 'cajamarca',
  'ayacucho', 'tarapoto', 'piura',
];

/** Tinta de la banda de cada ficha de destino en el mosaico: rotación fija. */
export const INKS = ['magenta', 'orange', 'yellow', 'green'] as const;
