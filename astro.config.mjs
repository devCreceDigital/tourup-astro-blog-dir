// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';
import { namelessCompanySlugs, untranslatedEsPromptSlugs } from './scripts/lib/content-dedupe.mjs';

// Fichas sin nombre real en el dato de origen (título "-"): se publican con noindex, no van al sitemap.
const nameless = namelessCompanySlugs('src/content/companies');
// Prompts /es/ que son copia sin traducir del inglés: noindex, fuera del sitemap.
const untranslatedEs = untranslatedEsPromptSlugs('src/content/prompts_es', 'src/content/prompts');

// El cuerpo Markdown de fichas y prompts trae su propio `# Título`, que duplicaba el <h1> de la página.
// Se degrada a <h2> para que cada página tenga un único <h1>.
function rehypeDemoteH1() {
	return (tree) => {
		const walk = (node) => {
			if (node.type === 'element' && node.tagName === 'h1') node.tagName = 'h2';
			node.children?.forEach(walk);
		};
		walk(tree);
	};
}

// https://astro.build/config
export default defineConfig({
	site: 'https://guia.tourup.co',
	output: 'static',
	adapter: node({ mode: 'standalone' }),
	trailingSlash: 'always',
	// El inglés es el idioma principal: su portada es `/`.
	redirects: { '/en/': '/' },
	markdown: { rehypePlugins: [rehypeDemoteH1] },
	integrations: [
		// @astrojs/sitemap es la ÚNICA fuente del sitemap (sitemap-index.xml + sitemap-N.xml).
		// robots.txt, llms.txt y llms-full.txt los genera scripts/generate-llms-txt.mjs / public/robots.txt.
		// aeo.js se retiró: generaba sitemap/llms con rutas de archivos (backslashes, /categorias_destino/x)
		// que no existen como páginas.
		sitemap({
			filter: (page) => {
				if (/\/(admin|api|search)\//.test(page)) return false;
				const m = page.match(/\/(?:companies|empresas)\/([^/]+)\/$/);
				if (m && nameless.has(decodeURIComponent(m[1]))) return false;
				const p = page.match(/\/es\/ai-prompts\/([^/]+)\/$/);
				return !(p && untranslatedEs.has(decodeURIComponent(p[1])));
			},
			serialize: (entry) => {
				if (entry.url.match(/\/(?:en|es)\/peru\/[^/]+\/tours\/[^/]+\/?$/)) {
					entry.priority = 0.5;
				} else if (entry.url.match(/\/(?:en|es)\/ai-prompts\/[^/]+\/?$/)) {
					entry.priority = 0.7;
				} else if (entry.url.match(/\/blog\/[^/]+\/?$/)) {
					entry.priority = 0.6;
				} else if (entry.url === 'https://guia.tourup.co/') {
					entry.priority = 1.0;
				} else if (entry.url.match(/\/(?:en|es)\/peru\/[^/]+\/?$/)) {
					entry.priority = 0.8;
				} else {
					entry.priority = 0.5;
				}
				return entry;
			},
		}),
	],
	vite: {
		server: {
			hmr: { timeout: 120000 }, // 2 min
		},
	},
});
