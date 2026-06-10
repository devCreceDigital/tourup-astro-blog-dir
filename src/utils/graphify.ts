/**
 * graphify.ts – Local helper for querying the Graphify knowledge graph.
 *
 * Usage by agents (GraphNavigator, PartnerScout):
 *   1. Attempt to load graphify-out/graph.json (produced by `graphify . --backend gemini`)
 *   2. If the graph is available, filter Company nodes by destino / categoria / rating edges.
 *   3. If the graph is missing or the query returns 0 results, fall back to
 *      filtering the `companies` content collection directly.
 *
 * This module is meant to be called at build time (Astro SSG) or inside
 * server routes (Astro hybrid/server, Next.js). It uses Node's `fs` module
 * and must NOT be imported on the client side.
 */

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { getCollection } from 'astro:content';

// ── Types ────────────────────────────────────────────────────────────────────

export interface CompanyFilters {
  destinos?: string[];        // e.g. ["cusco", "lima"]
  categorias?: string[];      // e.g. ["tours-comunitarios", "full-day"]
  rating_min?: number;        // inclusive, 0–5
  group_capacity_min?: number;
  languages?: string[];       // ISO 639-1 codes: "en", "es"
  b2b_client_types?: string[];
  distribution_role?: string;
}

export interface CompanyResult {
  slug: string;
  title: string;
  summary: string;
  destinos: string[];
  categorias: string[];
  rating?: number;
  reviews_count?: number;
  b2b_profile?: string;
  trust_metrics?: Record<string, unknown>;
  match_reasons: string[];   // human-readable explanation for the shortlist
  url: string;
}

// ── Graph types (minimal subset we need from graphify-out/graph.json) ────────

interface GraphNode {
  id: string;
  type: string;
  label?: string;
  properties?: Record<string, unknown>;
}

interface GraphEdge {
  source: string;
  target: string;
  type: string;
}

interface GraphJson {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// ── Graph loader ─────────────────────────────────────────────────────────────

function loadGraph(): GraphJson | null {
  const graphPath = join(process.cwd(), 'graphify-out', 'graph.json');
  if (!existsSync(graphPath)) return null;
  try {
    const raw = readFileSync(graphPath, 'utf-8');
    return JSON.parse(raw) as GraphJson;
  } catch {
    return null;
  }
}

// ── Graph-based filtering (primary path) ────────────────────────────────────

function filterViaGraph(graph: GraphJson, filters: CompanyFilters): CompanyResult[] {
  const companyNodes = graph.nodes.filter((n) => n.type === 'Company' || n.type === 'company');
  const results: CompanyResult[] = [];

  for (const node of companyNodes) {
    const props = node.properties ?? {};
    const reasons: string[] = [];

    const nodeDestinos = (props.destinos as string[] | undefined) ?? [];
    const nodeCategorias = (props.categorias as string[] | undefined) ?? [];
    const nodeRating = props.rating as number | undefined;
    const nodeMetrics = props.trust_metrics as Record<string, unknown> | undefined;
    const nodeLanguages = (nodeMetrics?.languages as string[] | undefined) ?? [];
    const nodeClientTypes = (nodeMetrics?.b2b_client_types as string[] | undefined) ?? [];

    // Destino filter
    if (filters.destinos?.length) {
      const matched = filters.destinos.filter((d) => nodeDestinos.includes(d));
      if (!matched.length) continue;
      reasons.push(`destino: ${matched.join(', ')}`);
    }

    // Categoria filter
    if (filters.categorias?.length) {
      const matched = filters.categorias.filter((c) => nodeCategorias.includes(c));
      if (!matched.length) continue;
      reasons.push(`categoría: ${matched.join(', ')}`);
    }

    // Rating filter
    if (filters.rating_min !== undefined) {
      if (!nodeRating || nodeRating < filters.rating_min) continue;
      reasons.push(`rating ${nodeRating}/5`);
    }

    // Language filter
    if (filters.languages?.length) {
      const matched = filters.languages.filter((l) => nodeLanguages.includes(l));
      if (!matched.length) continue;
      reasons.push(`idioma: ${matched.join(', ')}`);
    }

    // B2B client type filter
    if (filters.b2b_client_types?.length) {
      const matched = filters.b2b_client_types.filter((t) => nodeClientTypes.includes(t));
      if (!matched.length) continue;
      reasons.push(`cliente: ${matched.join(', ')}`);
    }

    // Group capacity filter
    if (filters.group_capacity_min !== undefined) {
      const cap = nodeMetrics?.group_capacity_max as number | undefined;
      if (!cap || cap < filters.group_capacity_min) continue;
      reasons.push(`capacidad ≥ ${filters.group_capacity_min} pax`);
    }

    results.push({
      slug: node.id.replace('company:', ''),
      title: (props.title as string) ?? node.label ?? node.id,
      summary: (props.summary as string) ?? '',
      destinos: nodeDestinos,
      categorias: nodeCategorias,
      rating: nodeRating,
      reviews_count: props.reviews_count as number | undefined,
      b2b_profile: props.b2b_profile as string | undefined,
      trust_metrics: nodeMetrics,
      match_reasons: reasons,
      url: `/empresas/${node.id.replace('company:', '')}/`,
    });
  }

  return results;
}

// ── Content-collection fallback (used when graph.json is absent) ─────────────

async function filterViaCollection(filters: CompanyFilters): Promise<CompanyResult[]> {
  const all = await getCollection('companies');
  const results: CompanyResult[] = [];

  for (const entry of all) {
    const d = entry.data;
    const reasons: string[] = [];

    const nodeDestinos = d.destinos ?? [];
    const nodeCategorias = d.categorias ?? [];
    const nodeLanguages = d.trust_metrics?.languages ?? [];
    const nodeClientTypes = d.trust_metrics?.b2b_client_types ?? [];

    if (filters.destinos?.length) {
      const matched = filters.destinos.filter((x) => nodeDestinos.includes(x));
      if (!matched.length) continue;
      reasons.push(`destino: ${matched.join(', ')}`);
    }

    if (filters.categorias?.length) {
      const matched = filters.categorias.filter((x) => nodeCategorias.includes(x));
      if (!matched.length) continue;
      reasons.push(`categoría: ${matched.join(', ')}`);
    }

    if (filters.rating_min !== undefined) {
      if (!d.rating || d.rating < filters.rating_min) continue;
      reasons.push(`rating ${d.rating}/5`);
    }

    if (filters.languages?.length) {
      const matched = filters.languages.filter((l) => nodeLanguages.includes(l));
      if (!matched.length) continue;
      reasons.push(`idioma: ${matched.join(', ')}`);
    }

    if (filters.b2b_client_types?.length) {
      const matched = filters.b2b_client_types.filter((t) => nodeClientTypes.includes(t));
      if (!matched.length) continue;
      reasons.push(`cliente B2B: ${matched.join(', ')}`);
    }

    if (filters.group_capacity_min !== undefined) {
      const cap = d.trust_metrics?.group_capacity_max;
      if (!cap || cap < filters.group_capacity_min) continue;
      reasons.push(`capacidad ≥ ${filters.group_capacity_min} pax`);
    }

    results.push({
      slug: entry.slug,
      title: d.title,
      summary: d.summary,
      destinos: nodeDestinos,
      categorias: nodeCategorias,
      rating: d.rating,
      reviews_count: d.reviews_count,
      b2b_profile: d.b2b_profile,
      trust_metrics: d.trust_metrics as Record<string, unknown> | undefined,
      match_reasons: reasons.length ? reasons : ['match general'],
      url: `/empresas/${entry.slug}/`,
    });
  }

  return results;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Find companies matching the given filters.
 *
 * Strategy:
 *   1. Try graphify-out/graph.json (preferred – used by GraphNavigator agent).
 *   2. Fallback: filter content collection directly (development / no graph).
 *
 * To be called by:
 *   - Partner Scout API endpoint (/api/partner-scout/search)
 *   - Partner Scout page (build-time embedding)
 *   - Any OpenClaw/Hermes agent that needs a shortlist
 */
export async function findCompaniesByFilters(
  filters: CompanyFilters
): Promise<CompanyResult[]> {
  const graph = loadGraph();

  if (graph) {
    const fromGraph = filterViaGraph(graph, filters);
    // If the graph has company nodes and returned results, trust them.
    if (fromGraph.length > 0) return fromGraph;
  }

  // Fallback: filter content collection at build time.
  return filterViaCollection(filters);
}

/**
 * Load all companies as a lightweight catalog for client-side filtering.
 * Used by the Partner Scout page to embed data at build time.
 */
export async function getAllCompaniesCatalog(): Promise<CompanyResult[]> {
  return findCompaniesByFilters({});
}
