export const prerender = false;
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params, redirect }) => {
  const { lang } = params as { lang: string };
  // /{lang}/peru/ no es una página: el índice de destinos es /en/destinations/ o /es/destinos/.
  return redirect(lang === 'es' ? '/es/destinos/' : '/en/destinations/', 301);
};
