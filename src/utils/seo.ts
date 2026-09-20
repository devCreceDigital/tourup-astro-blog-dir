import { getLocalizedString, type Locale } from './i18n';

export const SITE_URL = 'https://guia.tourup.co';

/**
 * Perfiles oficiales de la marca (LinkedIn, Google Business, Wikidata, Instagram…).
 * Alimentan `Organization.sameAs`, que es lo que los motores de IA usan para resolver la
 * entidad "TourUp". RELLENAR con URLs reales: no se inventan.
 */
export const ORG_SAME_AS: string[] = [];

// ── hreflang ────────────────────────────────────────────────────
export interface Alternates {
  es: string;
  en: string;
  xDefault: string;
}

/**
 * Alternates hreflang SOLO hacia URLs que existen:
 * - `/`                  → /es/, /en/ (x-default `/`)
 * - `/es|en/...`         → mismo path en el otro idioma; `empresas` (es) ↔ `companies` (en)
 * - resto (blog, admin)  → null: no tienen versión por idioma, así que no se emite hreflang.
 */
export function hreflangAlternates(currentPath: string, siteUrl = SITE_URL): Alternates | null {
  if (currentPath === '/') {
    return { es: `${siteUrl}/es/`, en: `${siteUrl}/en/`, xDefault: `${siteUrl}/` };
  }
  const m = currentPath.match(/^\/(?:es|en)(\/.*)?$/);
  if (!m) return null;
  const rest = m[1] ?? '/';
  const forLang = (lang: Locale) =>
    `${siteUrl}/${lang}${rest.replace(/^\/(empresas|companies)(?=\/|$)/, lang === 'es' ? '/empresas' : '/companies')}`;
  return { es: forLang('es'), en: forLang('en'), xDefault: forLang('en') };
}

// ── Breadcrumbs ─────────────────────────────────────────────────
const LABELS: Record<string, Record<Locale, string>> = {
  peru: { es: 'Perú', en: 'Peru' },
  empresas: { es: 'Empresas', en: 'Companies' },
  companies: { es: 'Empresas', en: 'Companies' },
  'ai-prompts': { es: 'Prompts de IA', en: 'AI prompts' },
  blog: { es: 'Blog', en: 'Blog' },
  tours: { es: 'Tours', en: 'Tours' },
};

const titleCase = (slug: string) => slug.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

/** Quita el sufijo de marca (" | TourUp…") del <title> para usarlo como nombre de miga. */
export function shortTitle(title: string): string {
  return title.replace(/[ ]*[|][ ]*TourUp.*$/i, '').trim() || title;
}

export interface Crumb {
  name: string;
  url: string;
}

/**
 * Migas de pan con etiquetas legibles y en el idioma de la página. El segmento de idioma
 * no es una miga ("En"): la raíz es Inicio/Home → /es/ o /en/. `/{lang}/peru/` es una
 * redirección, así que esa miga apunta a la página real `/{lang}/peru/peru/`.
 */
export function breadcrumbTrail(currentPath: string, lang: Locale, title?: string, siteUrl = SITE_URL): Crumb[] {
  const parts = currentPath.split('/').filter(Boolean);
  const prefixed = parts[0] === 'es' || parts[0] === 'en';
  const segs = prefixed ? parts.slice(1) : parts;
  const base = prefixed ? `/${parts[0]}/` : '/';

  const crumbs: Crumb[] = [{ name: lang === 'en' ? 'Home' : 'Inicio', url: `${siteUrl}${base}` }];
  let acc = base;
  segs.forEach((seg, i) => {
    acc += `${seg}/`;
    const isLast = i === segs.length - 1;
    const url = `${siteUrl}${seg === 'peru' && i === 0 ? `${base}peru/peru/` : acc}`;
    const name = isLast && title ? title : LABELS[seg]?.[lang] ?? titleCase(seg);
    const prev = crumbs[crumbs.length - 1];
    if (prev.url === url) {
      if (isLast) prev.name = name; // p. ej. /en/peru/peru/: una sola miga
    } else {
      crumbs.push({ name, url });
    }
  });
  return crumbs;
}

// ── Empresas ────────────────────────────────────────────────────
const ROLES: Record<string, Record<Locale, string>> = {
  tour_operator: { es: 'Operador turístico', en: 'Tour operator' },
  retail_travel_agency: { es: 'Agencia de viajes minorista', en: 'Retail travel agency' },
  wholesale_travel_agency: { es: 'Agencia de viajes mayorista', en: 'Wholesale travel agency' },
  online_travel_agency: { es: 'Agencia de viajes online', en: 'Online travel agency' },
  dmc: { es: 'DMC (gestor de destino)', en: 'Destination management company' },
  mixed_agency: { es: 'Agencia mixta', en: 'Mixed travel agency' },
};

/**
 * Meta description de una ficha de empresa. Hoy las 985 fichas tienen `summary: ''`,
 * lo que dejaba la meta description vacía; se genera una descripción veraz con datos reales.
 */
export function companyDescription(d: any, lang: Locale): string {
  const summary = getLocalizedString(d.summary, lang).trim();
  if (summary) return summary;
  const title = getLocalizedString(d.title, lang);
  const city = getLocalizedString(d.nap?.city ?? d.location?.city, lang).trim();
  const role = ROLES[d.distribution_role]?.[lang] ?? ROLES.tour_operator[lang];
  return lang === 'en'
    ? `${title} — ${role.toLowerCase()} in ${city || 'Peru'}. B2B profile in the TourUp directory of Peru travel operators.`
    : `${title} — ${role.toLowerCase()} en ${city || 'Perú'}. Ficha B2B en el directorio de operadores turísticos de TourUp.`;
}
