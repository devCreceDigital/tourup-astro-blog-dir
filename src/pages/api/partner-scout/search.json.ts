/**
 * GET /api/partner-scout/search.json
 *
 * Static build-time endpoint: returns the full companies catalog as JSON.
 * The Partner Scout page (/partner-scout/) fetches this at build time
 * and embeds the data for client-side filtering.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FUTURE: Dynamic POST endpoint (requires Astro `output: "hybrid"` + adapter)
 * ─────────────────────────────────────────────────────────────────────────────
 * When migrating to SSR, replace this file with:
 *
 *   export const prerender = false;
 *
 *   export async function POST({ request }: APIContext) {
 *     const brief: PartnerScoutBrief = await request.json();
 *     // Validate brief with Zod
 *     const results = await findCompaniesByFilters(brief);
 *     return new Response(JSON.stringify({ shortlist: results }), {
 *       headers: { 'Content-Type': 'application/json' },
 *     });
 *   }
 *
 * Request contract (PartnerScoutBrief):
 * {
 *   "destinos": ["cusco", "lima"],           // optional
 *   "categorias": ["full-day"],              // optional
 *   "rating_min": 4.0,                       // optional, 0-5
 *   "group_capacity_min": 10,               // optional
 *   "languages": ["en", "es"],              // optional, ISO 639-1
 *   "b2b_client_types": ["agencias_emisoras"] // optional
 * }
 *
 * Response contract:
 * {
 *   "shortlist": [
 *     {
 *       "slug": "explore-peru-tours",
 *       "title": "Explore Peru Tours",
 *       "summary": "...",
 *       "destinos": ["cusco", "lima"],
 *       "categorias": ["full-day", "aventura"],
 *       "rating": 4.9,
 *       "reviews_count": 512,
 *       "b2b_profile": "...",
 *       "match_reasons": ["destino: cusco", "rating 4.9/5"],
 *       "url": "/empresas/explore-peru-tours/"
 *     }
 *   ]
 * }
 *
 * This endpoint will be consumed by the OpenClaw/Hermes PartnerScout agent skill.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { APIRoute } from 'astro';
import { getAllCompaniesCatalog } from '../../../utils/graphify';

export const GET: APIRoute = async () => {
  const catalog = await getAllCompaniesCatalog();

  return new Response(
    JSON.stringify({
      version: '1.0',
      description: 'TourUp Partner Scout – companies catalog for B2B sourcing',
      count: catalog.length,
      shortlist: catalog,
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
      },
    }
  );
};
