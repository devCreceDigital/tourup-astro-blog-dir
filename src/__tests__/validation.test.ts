import { describe, it, expect } from 'vitest';
import {
  companySchema,
  destinoSchema,
  postSchema,
  categorySchema,
  externalBrandSchema,
  promptLandingSchema,
} from '../utils/validation';

describe('Validation schemas', () => {
  describe('companySchema', () => {
    const valid = {
      type: 'company',
      title: 'Test Agency',
      distribution_role: 'tour_operator',
      sales_channel: 'online',
      destinos: ['cusco', 'lima'],
      summary: 'A'.repeat(50),
      canonical_answer: 'B'.repeat(30),
    };

    it('passes with valid data', () => {
      const r = companySchema.safeParse(valid);
      expect(r.success).toBe(true);
    });

    it('rejects missing title', () => {
      const r = companySchema.safeParse({ ...valid, title: '' });
      expect(r.success).toBe(false);
    });

    it('rejects invalid distribution_role', () => {
      const r = companySchema.safeParse({ ...valid, distribution_role: 'invalid' });
      expect(r.success).toBe(false);
    });

    it('accepts optional fields', () => {
      const r = companySchema.safeParse({ ...valid, rating: 4.5, reviews_count: 100, b2b_profile: 'B2B text' });
      expect(r.success).toBe(true);
    });

    it('rejects rating out of range', () => {
      const r = companySchema.safeParse({ ...valid, rating: 6 });
      expect(r.success).toBe(false);
    });
  });

  describe('postSchema', () => {
    const valid = {
      title: 'My Blog Post Title',
      description: 'A valid description that is at least twenty characters long',
      pubDate: '2024-01-01T00:00:00.000Z',
      tags: ['travel', 'peru'],
      summary: 'A'.repeat(50),
      canonical_answer: 'B'.repeat(30),
    };

    it('passes with valid data', () => {
      const r = postSchema.safeParse(valid);
      expect(r.success).toBe(true);
    });

    it('rejects short title', () => {
      const r = postSchema.safeParse({ ...valid, title: 'AB' });
      expect(r.success).toBe(false);
    });

    it('accepts optional heroImage', () => {
      const r = postSchema.safeParse({ ...valid, heroImage: 'https://example.com/img.jpg' });
      expect(r.success).toBe(true);
    });
  });

  describe('categorySchema', () => {
    it('passes with valid data', () => {
      const r = categorySchema.safeParse({
        type: 'categoria_destino',
        destino_slug: 'cusco',
        categoria: 'tours-comunitarios',
        name: 'Tours Comunitarios',
        summary: 'A summary that is at least twenty characters long for validation',
      });
      expect(r.success).toBe(true);
    });

    it('rejects missing destino_slug', () => {
      const r = categorySchema.safeParse({
        type: 'categoria_destino',
        categoria: 'tours',
        name: 'Tours',
        summary: 'Short',
      });
      expect(r.success).toBe(false);
    });
  });

  describe('externalBrandSchema', () => {
    it('passes with valid data', () => {
      const r = externalBrandSchema.safeParse({
        type: 'external_brand',
        name: 'ACME Corp',
        official_url: 'https://acme.com',
      });
      expect(r.success).toBe(true);
    });

    it('accepts minimal data', () => {
      const r = externalBrandSchema.safeParse({
        type: 'external_brand',
        name: 'ACME',
      });
      expect(r.success).toBe(true);
    });
  });

  describe('promptLandingSchema', () => {
    const valid = {
      type: 'prompt_landing',
      lang: 'en',
      title: 'Best Peru tours for adventure travelers 2024',
      ai_platforms: ['ChatGPT', 'Gemini'],
      prompt_text: 'What are the best tour operators in Cusco for adventure travel?',
      primary_intent: 'commercial',
      summary: 'A'.repeat(50),
      canonical_answer: 'B'.repeat(30),
    };

    it('passes with valid data', () => {
      const r = promptLandingSchema.safeParse(valid);
      expect(r.success).toBe(true);
    });

    it('rejects invalid ai_platform', () => {
      const r = promptLandingSchema.safeParse({ ...valid, ai_platforms: ['Bing'] });
      expect(r.success).toBe(false);
    });
  });
});
