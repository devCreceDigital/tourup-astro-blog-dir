export const prerender = false;
import type { APIRoute } from 'astro';
import { getSettings } from '../lib/settings';

export const GET: APIRoute = async () => {
  try {
    const settings = await getSettings();
    const content = settings.advanced?.robotsTxt || 'User-agent: *\nAllow: /\n\nSitemap: https://tourup.co/sitemap-index.xml';
    return new Response(content, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch {
    return new Response('User-agent: *\nAllow: /\n', {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
};
