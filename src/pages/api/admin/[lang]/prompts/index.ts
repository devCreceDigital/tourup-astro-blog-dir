export const prerender = false;
import type { APIRoute } from 'astro';
import { listEntries, createEntry, readEntry } from '../../../../../utils/content';
import { promptLandingSchema } from '../../../../../utils/validation';
import { slugify } from '../../../../../utils/slugify';

function getCollection(lang: string): string {
  return lang === 'en' ? 'prompts' : 'prompts_es';
}

export const GET: APIRoute = async ({ params, url }) => {
  const { lang } = params as { lang: string };
  const intent = url.searchParams.get('intent');
  const platform = url.searchParams.get('platform');

  const slugs = await listEntries(getCollection(lang));
  let entries = (
    await Promise.all(
      slugs.map(async (slug) => {
        try {
          const entry = await readEntry(getCollection(lang), slug);
          return { slug, ...entry.data } as Record<string, unknown>;
        } catch {
          return null;
        }
      })
    )
  ).filter(Boolean) as Record<string, unknown>[];

  if (intent) {
    entries = entries.filter((e: any) => e.primary_intent === intent);
  }
  if (platform) {
    entries = entries.filter((e: any) => e.ai_platforms?.includes(platform));
  }

  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(url.searchParams.get('pageSize') || '20', 10)));
  const total = entries.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const paginatedData = entries.slice((page - 1) * pageSize, page * pageSize);

  return new Response(JSON.stringify({ data: paginatedData, total, page, pageSize, totalPages }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ params, request }) => {
  const { lang } = params as { lang: string };
  const body = await request.json();

  const result = promptLandingSchema.safeParse({ ...body, lang });
  if (!result.success) {
    const errors = result.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
    return new Response(JSON.stringify({ errors }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let slug = slugify(result.data.title);
  const existing = await listEntries(getCollection(lang));
  if (existing.includes(slug)) {
    let counter = 1;
    while (existing.includes(`${slug}-${counter}`)) {
      counter++;
    }
    slug = `${slug}-${counter}`;
  }

  const created = await createEntry(getCollection(lang), slug, { ...result.data, slug }, '');

  return new Response(JSON.stringify(created), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
};
