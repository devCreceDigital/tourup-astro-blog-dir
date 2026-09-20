import { collection, fields } from '@keystatic/core';
import { bilingualText, bilingualTextarea, optionalBilingualText } from '../fields/bilingual';
import { seoFields } from '../fields/seo';
import { localImage } from '../fields/image';

export const postsCollection = collection({
  label: { es: 'Posts', en: 'Posts' },
  slugField: 'title.es',
  path: 'src/content/posts/*',
  format: { contentField: 'body' },
  schema: {
    title: bilingualText({ es: 'Título', en: 'Title' }),
    description: bilingualTextarea({ es: 'Descripción', en: 'Description' }),
    pubDate: fields.date({ label: { es: 'Fecha Publicación', en: 'Publish Date' } }),
    updatedDate: fields.date({ label: { es: 'Fecha Actualización', en: 'Updated Date' }, validation: { isRequired: false } }),
    heroImage: localImage({ es: 'Imagen Principal', en: 'Hero Image' }),
    tags: fields.array(
      fields.text({ label: { es: 'Etiqueta', en: 'Tag' } }),
      { label: { es: 'Etiquetas', en: 'Tags' }, itemLabel: (props) => props.value }
    ),
    lang: fields.text({ label: 'Idioma', defaultValue: 'es', validation: { isRequired: false } }),
    ...seoFields,
    body: fields.markdoc({ label: { es: 'Contenido', en: 'Content' } }),
  },
});