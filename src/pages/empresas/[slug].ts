export const prerender = false;
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params, redirect }) => {
  const { slug } = params as { slug: string };
  return redirect(`/en/companies/${slug}/`, 301);
};
