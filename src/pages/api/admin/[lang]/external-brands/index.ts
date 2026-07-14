export const prerender = false;
import type { APIRoute } from 'astro';
import { listEntries, createEntry, readEntry } from '../../../../../utils/content';
import { externalBrandSchema } from '../../../../../utils/validation';
import { slugify } from '../../../../../utils/slugify';

export const GET: APIRoute = async ({ url }) => {
  const q = url.searchParams.get('q');

  let slugs = await listEntries('external_brands');
  let entries = (
    await Promise.all(
      slugs.map(async (slug) => {
        try {
          const entry = await readEntry('external_brands', slug);
          return { slug, ...entry.data } as Record<string, unknown>;
        } catch {
          return null;
        }
      })
    )
  ).filter(Boolean) as Record<string, unknown>[];

  if (q) {
    const lower = q.toLowerCase();
    entries = entries.filter((e: any) => String(e.name ?? '').toLowerCase().includes(lower));
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

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();

  const result = externalBrandSchema.safeParse(body);
  if (!result.success) {
    const errors = result.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
    return new Response(JSON.stringify({ errors }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let slug = slugify(result.data.name);
  const existing = await listEntries('external_brands');
  if (existing.includes(slug)) {
    let counter = 1;
    while (existing.includes(`${slug}-${counter}`)) {
      counter++;
    }
    slug = `${slug}-${counter}`;
  }

  const created = await createEntry('external_brands', slug, { ...result.data, slug }, '');

  return new Response(JSON.stringify(created), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
};
