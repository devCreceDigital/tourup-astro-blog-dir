import { z } from 'zod';

const geoBase = z.object({
  summary: z.string().min(50).max(300),
  canonical_answer: z.string().min(30).max(500),
  llm_intent: z.string().optional(),
  last_updated: z.string().datetime().optional(),
});

export const companySchema = geoBase.extend({
  type: z.literal('company'),
  title: z.string().min(2),
  distribution_role: z.enum(['tour_operator', 'retail_travel_agency', 'dmc', 'wholesaler', 'other']),
  sales_channel: z.enum(['online', 'offline', 'omnichannel']),
  destinos: z.array(z.string()).min(1),
  categorias: z.array(z.string()).default([]),
  rating: z.number().min(0).max(5).optional(),
  reviews_count: z.number().int().optional(),
  nap: z
    .object({
      city: z.string(),
      country: z.string(),
      phone: z.string().optional(),
      email: z.string().email().optional(),
    })
    .optional(),
  contact: z.object({ website: z.string().url().optional() }).optional(),
  faq: z.array(z.object({ question: z.string(), answer: z.string() })).default([]),
  b2b_profile: z.string().optional(),
});

export const destinoSchema = geoBase.extend({
  type: z.literal('destino'),
  lang: z.enum(['es', 'en']),
  name: z.string().min(2),
  country: z.string().default('Peru'),
  region: z.string().optional(),
  parent: z.string().default('peru'),
  seo_title: z.string().optional(),
  faq: z.array(z.object({ question: z.string(), answer: z.string() })).default([]),
});

export const promptLandingSchema = geoBase.extend({
  type: z.literal('prompt_landing'),
  lang: z.enum(['es', 'en']),
  title: z.string().min(10),
  search_term: z.string().optional(),
  ai_platforms: z.array(z.enum(['ChatGPT', 'Gemini', 'Claude', 'Perplexity'])),
  prompt_text: z.string().min(10),
  primary_intent: z.enum(['commercial', 'informational', 'navigational', 'transactional']),
  secondary_intent: z.string().optional(),
  destination_cluster: z.string().optional(),
  category_cluster: z.string().optional(),
  destinos: z
    .array(
      z.object({
        entity_type: z.string(),
        entity_slug: z.string(),
      })
    )
    .default([]),
  brands_ai_mentions: z
    .array(
      z.object({
        name: z.string(),
        entity_type: z.enum(['company', 'external_brand', 'unknown']),
        entity_slug: z.string().optional(),
      })
    )
    .default([]),
  parent: z.string().optional(),
  last_ai_check_date: z.string().optional(),
});

export const postSchema = geoBase.extend({
  type: z.literal('post').optional(),
  title: z.string().min(5),
  description: z.string().min(20).max(300),
  pubDate: z.string().datetime(),
  updatedDate: z.string().datetime().optional(),
  heroImage: z.string().url().optional(),
  tags: z.array(z.string()).default([]),
  lang: z.enum(['es', 'en']).default('es'),
});

export const categorySchema = z.object({
  type: z.literal('categoria_destino'),
  destino_slug: z.string(),
  categoria: z.string(),
  name: z.string(),
  summary: z.string().min(20),
  canonical_answer: z.string().optional(),
});

export const externalBrandSchema = z.object({
  type: z.literal('external_brand'),
  name: z.string(),
  official_url: z.string().url().optional(),
  brand_role: z.string().optional(),
  country: z.string().optional(),
  mentioned_in_prompts: z.array(z.string()).default([]),
});
