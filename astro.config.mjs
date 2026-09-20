// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
	site: 'https://guia.tourup.co',
	output: 'static',
	adapter: node({ mode: 'standalone' }),
	trailingSlash: 'always',
	integrations: [
		// @astrojs/sitemap es la ÚNICA fuente del sitemap (sitemap-index.xml + sitemap-N.xml).
		// robots.txt, llms.txt y llms-full.txt los genera scripts/generate-llms-txt.mjs / public/robots.txt.
		// aeo.js se retiró: generaba sitemap/llms con rutas de archivos (backslashes, /categorias_destino/x)
		// que no existen como páginas.
		sitemap({
			filter: (page) => !/\/(admin|api)\//.test(page),
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
