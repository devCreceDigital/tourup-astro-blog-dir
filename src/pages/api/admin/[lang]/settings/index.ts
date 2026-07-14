export const prerender = false;
import type { APIRoute } from 'astro';
import { z } from 'zod';
import { getSettingsMasked, updateSettings } from '../../../../../lib/settings';

const settingsSchema = z.object({
  seo: z.object({
    siteTitle: z.string().max(200).optional(),
    description: z.string().max(500).optional(),
    ogImage: z.string().max(500).optional(),
    canonicalUrl: z.string().max(500).optional(),
    metaKeywords: z.string().max(500).optional(),
  }).optional(),
  advanced: z.object({
    customCss: z.string().max(10000).optional(),
    customJsHead: z.string().max(10000).optional(),
    customJsBody: z.string().max(10000).optional(),
    inlineStyles: z.string().max(10000).optional(),
    robotsTxt: z.string().max(5000).optional(),
  }).optional(),
  integrations: z.object({
    googleAnalyticsId: z.string().max(100).optional(),
    facebookPixelId: z.string().max(100).optional(),
    crmUrl: z.string().max(500).optional(),
    crmApiKey: z.string().max(500).optional(),
    crmEnabled: z.boolean().optional(),
  }).optional(),
});

export const GET: APIRoute = async () => {
  try {
    const settings = await getSettingsMasked();
    return new Response(JSON.stringify(settings), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const PUT: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const parsed = settingsSchema.parse(body);
    const updated = await updateSettings(parsed);
    return new Response(JSON.stringify(updated), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return new Response(JSON.stringify({ errors: err.issues.map(i => ({ field: i.path.join('.'), message: i.message })) }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
