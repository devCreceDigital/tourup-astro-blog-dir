export const prerender = false;
import type { APIRoute } from 'astro';
import { readEntry, updateEntry, deleteEntry } from '../../../../../utils/content';
import { promptLandingSchema } from '../../../../../utils/validation';

function getCollection(lang: string): string {
  return lang === 'en' ? 'prompts' : 'prompts_es';
}

export const GET: APIRoute = async ({ params }) => {
  const { lang, slug } = params as { lang: string; slug: string };
  try {
    const entry = await readEntry(getCollection(lang), slug);
    return new Response(JSON.stringify({ slug, ...entry.data, body: entry.content }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
  }
};

export const PUT: APIRoute = async ({ params, request }) => {
  const { lang, slug } = params as { lang: string; slug: string };
  const body = await request.json();

  try {
    await readEntry(getCollection(lang), slug);
  } catch {
    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
  }

  const result = promptLandingSchema.partial().safeParse({ ...body, lang });
  if (!result.success) {
    const errors = result.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
    return new Response(JSON.stringify({ errors }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  await updateEntry(getCollection(lang), slug, result.data);

  return new Response(JSON.stringify({ slug }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const DELETE: APIRoute = async ({ params }) => {
  const { lang, slug } = params as { lang: string; slug: string };
  try {
    await deleteEntry(getCollection(lang), slug);
    return new Response(JSON.stringify({ deleted: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
  }
};
