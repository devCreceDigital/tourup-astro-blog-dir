---
version: 1
slug: "src-pages-index-astro"
primary_target: "src/pages/index.astro"
related_targets: ["src/pages/[lang]/index.astro","src/pages/[lang]/peru/[slug].astro","src/layouts/Layout.astro"]
---

# Surface brief: home + destinations (guia.tourup.co)

Scope: `/` (English home), `/es/` (Spanish home), `/{lang}/peru/` (destinations hub, list layout), `/{lang}/peru/{slug}/` (destination page), plus the shared masthead, nav and footer that every page inherits.
Mode: Read. Visitors are European and US travelers arriving from search or an AI answer; agencies reach the B2B operator directory from the nav.
Pinned by the user: structure of an online travel magazine (brand-color masthead bar, dark nav strip, full-bleed photo hero with centered wordmark and search, "Most popular" grid, destination mosaic with a colored band and city name, list-style category page, dark multi-column footer). Do not copy any other brand's name, logo, copy or photos.
Content truth: only guides, destinations, itineraries, the operator directory and AI-prompt guide pages. Photos are Wikimedia Commons (CC) with visible credit.

## Direction contract

THESIS: A Peru travel magazine that speaks in the voice of Lima's chicha street posters: stacked, condensed, fluorescent lettering on black bands over big photographs. It refuses the category default of cream paper, italic serif display and muted terracotta.

OWN-WORLD: Black poster ink (#121212) owns every band, nav and footer; four flat fluorescent inks (magenta, orange, yellow, green) are used as whole blocks and one ink per word-line, never as gradients; TourUp teal (#00C9B1) is the masthead bar only. Reading ground is plain white. Display and labels in a black condensed poster face, all caps, tight leading; body in a sturdy text serif. Buttons are outlined condensed caps that flood with yellow. Section breaks are the poster strip: stacked 6px bars of the four inks.

STORY: The visitor sees Peru as vivid and specific in one glance, picks a destination, itinerary or guide from the most-read grid or the mosaic, reads plain factual guidance, and (if an agency) reaches registered operators with their RUC and contact.

FIRST VIEWPORT: 56px teal masthead with the TourUp Guide logotype left and EN/ES switch right; 48px black nav strip centered: Destinations · Itineraries · Guides · Operator directory. Below, a full-bleed Machu Picchu photograph at ~78vh; centered on it a black poster band carrying stacked lettering PERU / THE GUIDE (each line one ink, ~7rem), and directly under the band a white search field with a condensed-caps button. Photo credit bottom-right. Primary action is the search; the scroll cue sits at the bottom edge.

FORM: Chicha poster (cartel chicha), position 3 on the ordered list (1 magazine canon, 2 1950s airline poster, 3 chicha poster, 4 Andean textile bands, 5 expedition field notebook, 6 Peru postage stamps, 7 railway timetable); seed key da59825b. Signature interaction: on destination tiles the ink band rises from the lower third to flood the tile on hover/focus (clip-path), revealing the one-line summary.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
