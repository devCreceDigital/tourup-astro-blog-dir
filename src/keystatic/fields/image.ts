import { fields } from '@keystatic/core';

export const localImage = (label: { es: string; en: string }) => fields.image({
  label,
  directory: 'uploads',
  publicPath: '/uploads/',
});

export const cloudinaryImage = (label: { es: string; en: string }) => ({
  // Placeholder for future Cloudinary integration
  // For now, use localImage and sync manually
  local: localImage(label),
  cloudinary_public_id: fields.text({ label: { es: 'Cloudinary Public ID', en: 'Cloudinary Public ID' } }),
  cloudinary_url: fields.text({ label: { es: 'Cloudinary URL', en: 'Cloudinary URL' }, validation: { pattern: '^https?://' } }),
});