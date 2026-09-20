import { collection, fields } from '@keystatic/core';
import { bilingualText, optionalBilingualText } from '../fields/bilingual';
import { seoFields } from '../fields/seo';
import { localImage } from '../fields/image';

export const externalBrandsCollection = collection({
  label: { es: 'Marcas Externas', en: 'External Brands' },
  slugField: 'name',
  path: 'src/content/external_brands/*',
  format: { contentField: 'body' },
  schema: {
    name: fields.text({ label: { es: 'Nombre', en: 'Name' } }),
    official_url: fields.text({ label: { es: 'URL Oficial', en: 'Official URL' }, validation: { pattern: '^https?://' } }),
    brand_role: optionalBilingualText({ es: 'Rol de Marca', en: 'Brand Role' }),
    country: optionalBilingualText({ es: 'País', en: 'Country' }),
    logo: localImage({ es: 'Logo', en: 'Logo' }),
    mentioned_in_prompts: fields.array(
      fields.text({ label: { es: 'Prompt slug', en: 'Prompt slug' } }),
      { label: { es: 'Mencionado en Prompts', en: 'Mentioned in Prompts' }, itemLabel: (props) => props.value }
    ),
    ...seoFields,
    body: fields.markdoc({ label: { es: 'Contenido', en: 'Content' } }),
  },
});