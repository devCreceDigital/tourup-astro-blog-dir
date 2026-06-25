// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
	site: 'https://tourup.co',
	output: 'static',
	trailingSlash: 'always',
	integrations: [
		sitemap({
			serialize: (entry) => {
				// Lower priority for paginated/deep pages
				if (entry.url.includes('/partner-scout/')) {
					entry.priority = 0.3;
				} else if (entry.url.match(/\/(?:en|es)\/peru\/[^/]+\/tours\/[^/]+\/?$/)) {
					entry.priority = 0.5;
				} else if (entry.url.match(/\/(?:en|es)\/ai-prompts\/[^/]+\/?$/)) {
					entry.priority = 0.7;
				} else if (entry.url.match(/\/blog\/[^/]+\/?$/)) {
					entry.priority = 0.6;
				} else if (entry.url === 'https://tourup.co/') {
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
});
