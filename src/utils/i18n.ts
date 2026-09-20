/**
 * Utilidades para consumir contenido bilingüe
 * 
 * Los campos bilingües pueden venir como:
 *   title: { es: "Título ES", en: "Title EN" }
 *   summary: { es: "Resumen ES", en: "Summary EN" }
 * 
 * Estas funciones extraen el valor correcto según el idioma.
 */

export type Locale = 'es' | 'en';

export interface BilingualField {
  es: string;
  en: string;
}

export interface OptionalBilingualField {
  es?: string;
  en?: string;
}

/**
 * Obtiene el valor localizado de un campo bilingüe
 * @param field - Campo bilingüe { es: "", en: "" }
 * @param locale - Idioma actual ('es' | 'en')
 * @param fallback - Valor por defecto si no existe
 */
export function getLocalizedString(
  field: BilingualField | OptionalBilingualField | string | undefined,
  locale: Locale,
  fallback = ''
): string {
  if (!field) return fallback;
  if (typeof field === 'string') return field;
  return field[locale] ?? field.es ?? fallback;
}

/**
 * Obtiene el valor localizado de un campo bilingüe opcional
 * Retorna undefined si no hay valor en ningún idioma
 */
export function getOptionalLocalizedString(
  field: OptionalBilingualField | undefined,
  locale: Locale
): string | undefined {
  if (!field) return undefined;
  const value = field[locale] ?? field.es;
  return value && value.trim() ? value : undefined;
}

/**
 * Transforma un array de objetos con campos bilingües
 * @param items - Array de objetos con campos bilingües
 * @param locale - Idioma actual
 * @param fieldMap - Mapeo de campos a localizar { campoDestino: 'campoOrigen' }
 */
export function localizeArray<T extends Record<string, unknown>>(
  items: T[],
  locale: Locale,
  fieldMap: Record<string, string>
): T[] {
  return items.map(item => {
    const localized: Record<string, unknown> = { ...item };
    for (const [targetField, sourceField] of Object.entries(fieldMap)) {
      const value = item[sourceField];
      if (value && typeof value === 'object' && 'es' in value && 'en' in value) {
        localized[targetField] = getLocalizedString(value as BilingualField, locale);
      }
    }
    return localized as T;
  });
}

/**
 * Transforma FAQs bilingües a array simple para el frontend
 */
export interface LocalizedFAQ {
  question: string;
  answer: string;
}

export function localizeFAQs(
  faqs: Array<{ question: BilingualField; answer: BilingualField }> | undefined,
  locale: Locale
): LocalizedFAQ[] {
  if (!faqs) return [];
  return faqs.map(faq => ({
    question: getLocalizedString(faq.question, locale),
    answer: getLocalizedString(faq.answer, locale),
  }));
}

/**
 * Transforma testimoniales bilingües
 */
export interface LocalizedTestimonial {
  author: string;
  text: string;
  date?: string;
  source?: string;
}

export function localizeTestimonials(
  testimonials: Array<{ author: BilingualField; text: BilingualField; date?: string; source?: OptionalBilingualField }> | undefined,
  locale: Locale
): LocalizedTestimonial[] {
  if (!testimonials) return [];
  return testimonials.map(t => ({
    author: getLocalizedString(t.author, locale),
    text: getLocalizedString(t.text, locale),
    date: t.date,
    source: getOptionalLocalizedString(t.source, locale),
  }));
}

/**
 * Transforma licencias (solo campos de texto simple)
 */
export interface LocalizedLicense {
  type: string;
  id: string;
  issuer?: string;
}

export function localizeLicenses(
  licenses: Array<{ type: string; id: string; issuer?: OptionalBilingualField }> | undefined,
  locale: Locale
): LocalizedLicense[] {
  if (!licenses) return [];
  return licenses.map(l => ({
    type: l.type,
    id: l.id,
    issuer: getOptionalLocalizedString(l.issuer, locale),
  }));
}

/**
 * Transforma métricas de confianza
 */
export interface LocalizedTrustMetrics {
  avg_response_time_hours?: number;
  incident_rate?: number;
  group_capacity_max?: number;
  b2b_client_types: string[];
  languages: string[];
}

export function localizeTrustMetrics(
  metrics: { avg_response_time_hours?: number; incident_rate?: number; group_capacity_max?: number; b2b_client_types?: string[]; languages?: string[] } | undefined
): LocalizedTrustMetrics {
  if (!metrics) return { b2b_client_types: [], languages: [] };
  return {
    avg_response_time_hours: metrics.avg_response_time_hours,
    incident_rate: metrics.incident_rate,
    group_capacity_max: metrics.group_capacity_max,
    b2b_client_types: metrics.b2b_client_types ?? [],
    languages: metrics.languages ?? [],
  };
}

/**
 * Transforma NAP (Name, Address, Phone)
 */
export interface LocalizedNAP {
  city: string;
  country: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
}

export function localizeNAP(
  nap: { city: BilingualField; country: string; phone?: OptionalBilingualField; email?: string; website?: string; address?: OptionalBilingualField } | undefined,
  locale: Locale
): LocalizedNAP | undefined {
  if (!nap) return undefined;
  return {
    city: getLocalizedString(nap.city, locale),
    country: nap.country,
    phone: getOptionalLocalizedString(nap.phone, locale),
    email: nap.email,
    website: nap.website,
    address: getOptionalLocalizedString(nap.address, locale),
  };
}

/**
 * Transforma imagen local
 */
export interface LocalizedImage {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
}

export function localizeImage(
  image: { src: string; alt?: OptionalBilingualField; width?: number; height?: number } | undefined,
  locale: Locale
): LocalizedImage | undefined {
  if (!image) return undefined;
  return {
    src: image.src,
    alt: getOptionalLocalizedString(image.alt, locale),
    width: image.width,
    height: image.height,
  };
}

/**
 * Transforma array de imágenes
 */
export function localizeImages(
  images: Array<{ src: string; alt?: OptionalBilingualField; width?: number; height?: number }> | undefined,
  locale: Locale
): LocalizedImage[] {
  if (!images) return [];
  return images.map(img => localizeImage(img, locale)).filter(Boolean) as LocalizedImage[];
}

/**
 * Obtiene meta tags SEO localizados
 */
export interface SEOFields {
  meta_title?: string;
  meta_description?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  twitter_card?: string;
  canonical_url?: string;
  noindex?: boolean;
  nofollow?: boolean;
}

export function localizeSEO(
  seo: {
    meta_title?: BilingualField;
    meta_description?: BilingualField;
    og_title?: OptionalBilingualField;
    og_description?: OptionalBilingualField;
    og_image?: string;
    twitter_card?: string;
    canonical_url?: string;
    noindex?: string;
    nofollow?: string;
  } | undefined,
  locale: Locale
): SEOFields {
  if (!seo) return {};
  return {
    meta_title: getOptionalLocalizedString(seo.meta_title, locale),
    meta_description: getOptionalLocalizedString(seo.meta_description, locale),
    og_title: getOptionalLocalizedString(seo.og_title, locale),
    og_description: getOptionalLocalizedString(seo.og_description, locale),
    og_image: seo.og_image,
    twitter_card: seo.twitter_card,
    canonical_url: seo.canonical_url,
    noindex: seo.noindex === 'true',
    nofollow: seo.nofollow === 'true',
  };
}