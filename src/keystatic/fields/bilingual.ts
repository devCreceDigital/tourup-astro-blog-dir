import { fields } from '@keystatic/core';

export const bilingualText = (label: { es: string; en: string }, options?: { validation?: { isRequired?: boolean } }) => ({
  es: fields.text({ label: label.es, validation: { isRequired: options?.validation?.isRequired ?? true } }),
  en: fields.text({ label: label.en, validation: { isRequired: options?.validation?.isRequired ?? true } }),
});

export const bilingualTextarea = (label: { es: string; en: string }, options?: { validation?: { isRequired?: boolean } }) => ({
  es: fields.text({ label: label.es, multiline: true, validation: { isRequired: options?.validation?.isRequired ?? true } }),
  en: fields.text({ label: label.en, multiline: true, validation: { isRequired: options?.validation?.isRequired ?? true } }),
});

export const bilingualSlug = (label: { es: string; en: string }, options?: { validation?: { isRequired?: boolean } }) => ({
  es: fields.slug({ label: label.es, validation: { isRequired: options?.validation?.isRequired ?? true } }),
  en: fields.slug({ label: label.en, validation: { isRequired: options?.validation?.isRequired ?? true } }),
});

export const optionalBilingualText = (label: { es: string; en: string }) => ({
  es: fields.text({ label: label.es }),
  en: fields.text({ label: label.en }),
});

export const optionalBilingualTextarea = (label: { es: string; en: string }) => ({
  es: fields.text({ label: label.es, multiline: true }),
  en: fields.text({ label: label.en, multiline: true }),
});