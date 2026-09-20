import { collection, fields } from '@keystatic/core';
import { bilingualText, bilingualTextarea, optionalBilingualText, optionalBilingualTextarea } from '../fields/bilingual';
import { seoFields } from '../fields/seo';
import { localImage } from '../fields/image';

export const destinosCollection = collection({
  label: { es: 'Destinos', en: 'Destinations' },
  slugField: 'name.es',
  path: 'src/content/destinos/*',
  format: { contentField: 'body' },
  schema: {
    name: bilingualText({ es: 'Nombre', en: 'Name' }),
    country: fields.text({ label: 'Country', defaultValue: 'Peru' }),
    region: optionalBilingualText({ es: 'Región', en: 'Region' }),
    summary: bilingualTextarea({ es: 'Resumen', en: 'Summary' }),
    parent: optionalBilingualText({ es: 'Destino Padre (slug)', en: 'Parent Destination (slug)' }),
    hero_image: localImage({ es: 'Imagen Principal', en: 'Hero Image' }),
    gallery: fields.array(
      localImage({ es: 'Imagen Galería', en: 'Gallery Image' }),
      { label: { es: 'Galería', en: 'Gallery' }, itemLabel: (props) => props.value?.alt || 'Imagen' }
    ),
    faq: fields.array(
      fields.object({
        label: { es: 'FAQ', en: 'FAQ' },
        question: bilingualText({ es: 'Pregunta', en: 'Question' }),
        answer: bilingualTextarea({ es: 'Respuesta', en: 'Answer' }),
      }),
      { label: { es: 'FAQs', en: 'FAQs' }, itemLabel: (props) => props.fields.question.es.value }
    ),
    lang: fields.text({ label: 'Idioma', defaultValue: 'es', validation: { isRequired: false } }),
    ...seoFields,
    body: fields.markdoc({ label: { es: 'Contenido', en: 'Content' } }),
  },
});

export const destinosEnCollection = collection({
  label: { es: 'Destinos EN', en: 'Destinations EN' },
  slugField: 'name.en',
  path: 'src/content/destinos_en/*',
  format: { contentField: 'body' },
  schema: {
    name: bilingualText({ es: 'Nombre ES', en: 'Name EN' }),
    country: fields.text({ label: 'Country', defaultValue: 'Peru' }),
    region: optionalBilingualText({ es: 'Región ES', en: 'Region EN' }),
    summary: bilingualTextarea({ es: 'Resumen ES', en: 'Summary EN' }),
    parent: optionalBilingualText({ es: 'Destino Padre (slug)', en: 'Parent Destination (slug)' }),
    hero_image: localImage({ es: 'Imagen Principal', en: 'Hero Image' }),
    gallery: fields.array(
      localImage({ es: 'Imagen Galería', en: 'Gallery Image' }),
      { label: { es: 'Galería', en: 'Gallery' }, itemLabel: (props) => props.value?.alt || 'Imagen' }
    ),
    faq: fields.array(
      fields.object({
        label: { es: 'FAQ', en: 'FAQ' },
        question: bilingualText({ es: 'Pregunta ES', en: 'Question EN' }),
        answer: bilingualTextarea({ es: 'Respuesta ES', en: 'Answer EN' }),
      }),
      { label: { es: 'FAQs', en: 'FAQs' }, itemLabel: (props) => props.fields.question.en.value }
    ),
    lang: fields.text({ label: 'Idioma', defaultValue: 'en', validation: { isRequired: false } }),
    ...seoFields,
    body: fields.markdoc({ label: { es: 'Contenido ES', en: 'Content EN' } }),
  },
});