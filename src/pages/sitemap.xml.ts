export const prerender = false;
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  try {
    const siteUrl = 'https://tourup.co';
    const urls: string[] = [];

    urls.push(siteUrl + '/');
    urls.push(siteUrl + '/en/');
    urls.push(siteUrl + '/blog/');

    const collections = ['companies', 'destinos', 'destinos_en', 'prompts', 'prompts_es', 'posts', 'external_brands'] as const;
    for (const name of collections) {
      try {
        const entries = await getCollection(name);
        for (const entry of entries) {
          let path = '';
          if (name === 'companies') path = `/en/companies/${entry.id}/`;
          else if (name === 'destinos') path = `/es/peru/${entry.id}/`;
          else if (name === 'destinos_en') path = `/en/peru/${entry.id}/`;
          else if (name === 'prompts') path = `/en/ai-prompts/${entry.id}/`;
          else if (name === 'prompts_es') path = `/es/ai-prompts/${entry.id}/`;
          else if (name === 'posts') path = `/blog/${entry.id}/`;
          else if (name === 'external_brands') continue;
          if (path) urls.push(siteUrl + path);
        }
      } catch {}
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${u}</loc></url>`).join('\n')}
</urlset>`;

    return new Response(xml, {
      headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    });
  } catch {
    return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
      headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    });
  }
};
