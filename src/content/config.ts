import { defineCollection, z, getDataEntryById } from 'astro:content';

const companies = defineCollection({
	type: 'content',
	schema: z.object({
		type: z.literal('company'),
		title: z.string(),
		distribution_role: z.enum([
			'tour_operator',
			'retail_travel_agency',
			'wholesale_travel_agency',
			'online_travel_agency',
			'dmc',
			'mixed_agency'
		]),
		sales_channel: z.enum(['online', 'offline', 'omnichannel']).optional(),
		summary: z.string(),
		contact: z.object({
			website: z.string().url().optional(),
			email: z.string().email().optional(),
			phone: z.string().optional(),
			phone_alt_1: z.string().optional(),
			phone_alt_2: z.string().optional(),
		}).optional(),
		location: z.object({
			city: z.string().optional(),
			province: z.string().optional(),
			region: z.string().optional(),
			country: z.string().default('Peru'),
			ubigeo_code: z.string().optional(),
		}).optional(),
		regulation: z.object({
			tax_id: z.string().optional(),
			license_number: z.string().optional(),
			license_issue_date: z.string().optional(),
		}).optional(),
		legal_representative: z.string().optional(),
		mentioned_in_prompts: z.array(z.string()).optional(),
	}),
});

const external_brands = defineCollection({
	type: 'content',
	schema: z.object({
		type: z.literal('external_brand'),
		name: z.string(),
		official_url: z.string().url(),
		brand_role: z.string().optional(),
		country: z.string().optional(),
		mentioned_in_prompts: z.array(z.string()).optional(),
	}),
});

const prompts = defineCollection({
	type: 'content',
	schema: z.object({
		type: z.literal('prompt_landing'),
		title: z.string(),
		lang: z.string().default('en'),
		search_term: z.string().optional(),
		ai_platforms: z.array(z.string()),
		prompt_text: z.string(),
		primary_intent: z.string().optional(),
		secondary_intent: z.string().optional(),
		destination_cluster: z.string().optional(),
		category_cluster: z.string().optional(),
		brands_ai_mentions: z.array(
			z.object({
				name: z.string(),
				entity_type: z.enum(['company', 'external_brand', 'unknown']),
				entity_slug: z.string().optional(),
			})
		),
		summary: z.string(),
		parent: z.string().optional(),
		last_ai_check_date: z.string().optional(),
		ai_cited_domains: z.array(z.string()).optional(),
	}),
});

const posts = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		description: z.string(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		heroImage: z.string().optional(),
		tags: z.array(z.string()),
	}),
});

export const collections = {
	companies,
	external_brands,
	prompts,
	posts,
};
