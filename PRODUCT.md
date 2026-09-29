# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Travelers from Europe and the United States** planning a trip to Peru. They arrive from search engines and AI assistants (ChatGPT, Gemini, Perplexity, Grok, Claude) after asking questions such as "best tour operators in Cusco" or "7-day Peru itinerary", and want a trustworthy, readable answer.
- **Travel agencies and DMCs abroad** looking for a receptive partner in Peru. They use the company directory to find registered Peruvian operators and check their legal data (RUC tax ID, address, contact) before working with them. The directory is B2B.
- **AI crawlers and answer engines** (GPTBot, OAI-SearchBot, PerplexityBot, ClaudeBot, Googlebot, Bingbot) are a first-class audience: every page must be citable as static HTML.

## Product Purpose

guia.tourup.co is TourUp's Peru travel guide and operator directory. It exists to become the reference source that AI assistants and search engines cite when people ask about travelling in Peru or about Peruvian tour companies. Success is being cited and linked (guia.tourup.co/…) in AI answers for the tracked prompts, and agencies reaching the operator profiles.

## Positioning

A single source that connects editorial travel guidance (destinations, itineraries, answers to real traveler questions) with a directory of registered Peruvian travel companies backed by official data (RUC, address, contact). Guides link to the operators that work in each place; each operator profile links back to the destinations and questions it appears in.

## Operating Context

- Content lives as Markdown in `src/content` (companies, destinos, destinos_en, categorias_destino, prompts, prompts_es, external_brands, posts) and is edited in git.
- Pages are prerendered by Astro; the build also generates `llms.txt`, `llms-full.txt`, `ai-index.json` and the sitemap.
- AI-prompt pages come from a list of tracked queries; brand mentions come from an external AI-monitoring export.

## Capabilities and Constraints

- Language: **English is primary**, Spanish (`/es/`) is secondary and only indexed where content is actually translated.
- Content scope: guides, destinations, itineraries, the company directory and AI-prompt guide pages. Anything else (admin CMS, partner scout, generic blog) is out of scope for the public site.
- Must stay fully static HTML: content readable without JavaScript, one `<h1>` per page, JSON-LD kept valid.
- Known data gaps (do not paper over them): 195 of 201 prompts carry the same default brand list; company `categorias` are auto-assigned; `prompts_es` are untranslated copies; ~1,800 company profiles have ~60 words of real data.
- Domain: `guia.tourup.co` (subdomain of tourup.co).

## Brand Commitments

- Name: **TourUp** (TourUp Guía / TourUp Guide). The site must not imitate other Peru travel brands' names, logos or copy.
- Voice: factual and verifiable; never claim verification, ratings, reviews or AI recommendations the data does not support.

## Evidence on Hand

- 985 company files (≈900 with a real name) with RUC, address, website and email where the source provides them.
- 21 destinations (ES and EN), 3 itineraries (7, 10, 14 days), a Peru FAQ page, 201 English AI-prompt pages.
- Photography: free-licence stock (Pexels/Unsplash) only; some destinations already reference Pexels images. No own photography, no testimonials, no press, no ratings of our own. Do not fabricate any of these.

## Product Principles

1. Citable first: every claim on a page is backed by data in the repo, stated plainly enough for an AI to quote.
2. Connect entities: guide ↔ destination ↔ itinerary ↔ operator, always with real links.
3. Travelers read, agencies verify: editorial pages serve travelers; operator profiles serve B2B verification.
4. Minimal platform: static pages, no server, nothing that isn't guide, destination, itinerary or directory.
