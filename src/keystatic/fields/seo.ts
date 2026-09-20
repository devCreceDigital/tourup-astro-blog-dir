import { fields } from '@keystatic/core';
import { bilingualText, bilingualTextarea, optionalBilingualText, optionalBilingualTextarea } from './bilingual';

export const seoFields = {
  meta_title: bilingualText({ es: 'Meta Title', en: 'Meta Title' }, { validation: { isRequired: false } }),
  meta_description: bilingualTextarea({ es: 'Meta Description', en: 'Meta Description' }, { validation: { isRequired: false } }),
  og_title: optionalBilingualText({ es: 'OG Title', en: 'OG Title' }),
  og_description: optionalBilingualTextarea({ es: 'OG Description', en: 'OG Description' }),
  og_image: fields.text({ label: 'OG Image URL', validation: { pattern: '^https?://' } }),
  twitter_card: fields.text({ label: 'Twitter Card', validation: { isRequired: false } }),
  canonical_url: fields.text({ label: 'Canonical URL', validation: { pattern: '^https?://' } }),
  noindex: fields.text({ label: 'Noindex (true/false)', validation: { isRequired: false } }),
  nofollow: fields.text({ label: 'Nofollow (true/false)', validation: { isRequired: false } }),
};