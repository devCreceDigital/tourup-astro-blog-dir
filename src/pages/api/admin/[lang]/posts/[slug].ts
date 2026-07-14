export const prerender = false;
import type { APIRoute } from 'astro';
import { readEntry, updateEntry, deleteEntry } from '../../../../../utils/content';
import { postSchema } from '../../../../../utils/validation';

export const GET: APIRoute = async ({ params }) => {
  const { slug } = params as { slug: string };
  try {
    const entry = await readEntry('posts', slug);
    return new Response(JSON.stringify({ slug, ...entry.data, body: entry.content }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
  }
};

export const PUT: APIRoute = async ({ params, request }) => {
  const { slug } = params as { slug: string };

  try {
    await readEntry('posts', slug);
  } catch {
    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
  }

  const body = await request.json();
  const { body: markdown, ...data } = body;

  const result = postSchema.partial().safeParse(data);
  if (!result.success) {
    const errors = result.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
    return new Response(JSON.stringify({ errors }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  await updateEntry('posts', slug, result.data, markdown);

  return new Response(JSON.stringify({ slug }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const DELETE: APIRoute = async ({ params }) => {
  const { slug } = params as { slug: string };
  try {
    await deleteEntry('posts', slug);
    return new Response(JSON.stringify({ deleted: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
  }
};
