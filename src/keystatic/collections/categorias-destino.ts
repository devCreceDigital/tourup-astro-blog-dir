import { collection, fields } from '@keystatic/core';
import { bilingualText, bilingualTextarea, optionalBilingualText } from '../fields/bilingual';
import { seoFields } from '../fields/seo';
import { localImage } from '../fields/image';

export const categoriasDestinoCollection = collection({
  label: { es: 'Categorías de Destino', en: 'Destination Categories' },
  slugField: 'categoria',
  path: 'src/content/categorias_destino/*',
  format: { contentField: 'body' },
  schema: {
    destino_slug: fields.text({ label: { es: 'Slug Destino', en: 'Destination Slug' } }),
    categoria: fields.text({ label: { es: 'Slug Categoría', en: 'Category Slug' } }),
    name: bilingualText({ es: 'Nombre', en: 'Name' }),
    summary: bilingualTextarea({ es: 'Resumen', en: 'Summary' }),
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
    ...seoFields,
    body: fields.markdoc({ label: { es: 'Contenido', en: 'Content' } }),
  },
});