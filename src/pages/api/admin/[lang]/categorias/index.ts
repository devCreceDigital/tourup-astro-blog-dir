export const prerender = false;
import type { APIRoute } from 'astro';
import { listEntries, createEntry, readEntry } from '../../../../../utils/content';
import { categorySchema } from '../../../../../utils/validation';

export const GET: APIRoute = async ({ url }) => {
  const destino = url.searchParams.get('destino');
  const q = url.searchParams.get('q');

  let slugs = await listEntries('categorias_destino');
  let entries = (
    await Promise.all(
      slugs.map(async (slug) => {
        try {
          const entry = await readEntry('categorias_destino', slug);
          return { slug, ...entry.data } as Record<string, unknown>;
        } catch {
          return null;
        }
      })
    )
  ).filter(Boolean) as Record<string, unknown>[];

  if (destino) {
    entries = entries.filter((e: any) => e.destino_slug === destino);
  }
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

  const result = categorySchema.safeParse(body);
  if (!result.success) {
    const errors = result.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
    return new Response(JSON.stringify({ errors }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const slug = result.data.destino_slug + '-' + result.data.categoria;
  const created = await createEntry('categorias_destino', slug, { ...result.data, slug }, '');

  return new Response(JSON.stringify(created), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
};
