export const prerender = false;
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params, redirect }) => {
  const { lang } = params as { lang: string };
  return redirect(`/${lang}/peru/peru/`, 301);
};
