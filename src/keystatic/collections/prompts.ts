import { collection, fields } from '@keystatic/core';
import { bilingualText, bilingualTextarea, optionalBilingualText, optionalBilingualTextarea } from '../fields/bilingual';
import { seoFields } from '../fields/seo';
import { localImage } from '../fields/image';

export const promptsCollection = collection({
  label: { es: 'Prompts EN', en: 'Prompts EN' },
  slugField: 'title.en',
  path: 'src/content/prompts/*',
  format: { contentField: 'body' },
  schema: {
    title: bilingualText({ es: 'Título ES', en: 'Title EN' }),
    lang: fields.text({ label: 'Idioma', defaultValue: 'en', validation: { isRequired: false } }),
    search_term: optionalBilingualText({ es: 'Término Búsqueda ES', en: 'Search Term EN' }),
    quick_answer: optionalBilingualTextarea({ es: 'Respuesta Rápida ES', en: 'Quick Answer EN' }),
    faq: fields.array(
      fields.object({
        label: { es: 'FAQ', en: 'FAQ' },
        question: bilingualText({ es: 'Pregunta ES', en: 'Question EN' }),
        answer: bilingualTextarea({ es: 'Respuesta ES', en: 'Answer EN' }),
      }),
      { label: { es: 'FAQs', en: 'FAQs' }, itemLabel: (props) => props.fields.question.en.value }
    ),
    ai_platforms: fields.array(
      fields.text({ label: { es: 'Plataforma IA', en: 'AI Platform' } }),
      { label: { es: 'Plataformas IA', en: 'AI Platforms' }, itemLabel: (props) => props.value }
    ),
    prompt_text: bilingualTextarea({ es: 'Texto Prompt ES', en: 'Prompt Text EN' }),
    primary_intent: optionalBilingualText({ es: 'Intención Principal ES', en: 'Primary Intent EN' }),
    secondary_intent: optionalBilingualText({ es: 'Intención Secundaria ES', en: 'Secondary Intent EN' }),
    destination_cluster: optionalBilingualText({ es: 'Cluster Destino ES', en: 'Destination Cluster EN' }),
    category_cluster: optionalBilingualText({ es: 'Cluster Categoría ES', en: 'Category Cluster EN' }),
    brands_ai_mentions: fields.array(
      fields.object({
        label: { es: 'Mención IA', en: 'AI Mention' },
        name: fields.text({ label: { es: 'Nombre', en: 'Name' } }),
        entity_type: fields.select({
          label: { es: 'Tipo Entidad', en: 'Entity Type' },
          options: [
            { label: 'Company', value: 'company' },
            { label: 'External Brand', value: 'external_brand' },
            { label: 'Unknown', value: 'unknown' },
          ],
          defaultValue: 'unknown',
        }),
        entity_slug: optionalBilingualText({ es: 'Slug Entidad', en: 'Entity Slug' }),
      }),
      { label: { es: 'Menciones IA', en: 'AI Mentions' }, itemLabel: (props) => props.fields.name.value }
    ),
    summary: bilingualTextarea({ es: 'Resumen ES', en: 'Summary EN' }),
    parent: optionalBilingualText({ es: 'Prompt Padre (slug)', en: 'Parent Prompt (slug)' }),
    last_ai_check_date: fields.text({ label: 'Última Verificación IA', validation: { isRequired: false } }),
    ai_cited_domains: fields.array(
      fields.text({ label: { es: 'Dominio Citado', en: 'Cited Domain' } }),
      { label: { es: 'Dominios Citados', en: 'Cited Domains' }, itemLabel: (props) => props.value }
    ),
    hero_image: localImage({ es: 'Imagen Principal', en: 'Hero Image' }),
    gallery: fields.array(
      localImage({ es: 'Imagen Galería', en: 'Gallery Image' }),
      { label: { es: 'Galería', en: 'Gallery' }, itemLabel: (props) => props.value?.alt || 'Imagen' }
    ),
    ...seoFields,
    body: fields.markdoc({ label: { es: 'Contenido ES', en: 'Content EN' } }),
  },
});