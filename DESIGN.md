---
name: TourUp Guide
description: A Peru travel magazine and operator directory, lettered like a Lima chicha street poster.
colors:
  poster-ink: "#121212"
  paper: "#ffffff"
  paper-2: "#f3f3f1"
  masthead-teal: "#00c9b1"
  ink-magenta: "#ff1f8e"
  ink-orange: "#ff6a00"
  ink-yellow: "#ffe000"
  ink-green: "#22e07a"
  text: "#161616"
  text-2: "#4a4a48"
  text-3: "#6b6b68"
  link-magenta: "#b3005c"
  rule: "#d9d9d4"
  on-ink: "#ffffff"
  on-ink-2: "#c9c9c4"
  ink-rule: "#3a3a3a"
typography:
  display:
    fontFamily: "'Big Shoulders Display', 'Arial Narrow', sans-serif"
    fontSize: "clamp(4rem, 12vw, 8.25rem)"
    fontWeight: 900
    lineHeight: 0.86
    letterSpacing: "0.01em"
  headline:
    fontFamily: "'Big Shoulders Display', 'Arial Narrow', sans-serif"
    fontSize: "clamp(2.75rem, 7vw, 5.5rem)"
    fontWeight: 900
    lineHeight: 0.95
    letterSpacing: "0.005em"
  title:
    fontFamily: "'Big Shoulders Display', 'Arial Narrow', sans-serif"
    fontSize: "clamp(2rem, 4.5vw, 3.25rem)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "0.005em"
  subtitle:
    fontFamily: "'Big Shoulders Display', 'Arial Narrow', sans-serif"
    fontSize: "clamp(1.4rem, 2.4vw, 1.85rem)"
    fontWeight: 800
    lineHeight: 1
  body:
    fontFamily: "'Source Serif 4 Variable', 'Source Serif 4', Georgia, serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "'Big Shoulders Display', 'Arial Narrow', sans-serif"
    fontSize: "1.05rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.06em"
  caption:
    fontFamily: "'Source Serif 4 Variable', 'Source Serif 4', Georgia, serif"
    fontSize: "0.72rem"
    fontWeight: 400
    lineHeight: 1.3
rounded:
  none: "0px"
spacing:
  space-2: "1rem"
  space-3: "1.5rem"
  space-4: "2.5rem"
  space-5: "4rem"
  space-6: "6rem"
  gutter: "clamp(1rem, 4vw, 2.5rem)"
  wrap: "1240px"
  measure: "68ch"
components:
  button-poster:
    backgroundColor: "transparent"
    textColor: "{colors.poster-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0.45em 1.1em 0.4em"
  button-poster-hover:
    backgroundColor: "{colors.ink-yellow}"
    textColor: "{colors.poster-ink}"
  button-poster-on-ink:
    backgroundColor: "transparent"
    textColor: "{colors.on-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0.45em 1.1em 0.4em"
  button-poster-on-ink-hover:
    backgroundColor: "{colors.ink-yellow}"
    textColor: "{colors.poster-ink}"
  button-search:
    backgroundColor: "{colors.ink-yellow}"
    textColor: "{colors.poster-ink}"
    rounded: "{rounded.none}"
    padding: "0 1.4rem"
  button-search-hover:
    backgroundColor: "{colors.ink-magenta}"
    textColor: "{colors.poster-ink}"
  input-search:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.text}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "0.8rem 1rem"
  masthead-bar:
    backgroundColor: "{colors.masthead-teal}"
    textColor: "{colors.poster-ink}"
    height: "56px"
  nav-strip:
    backgroundColor: "{colors.poster-ink}"
    textColor: "{colors.on-ink}"
    typography: "{typography.label}"
    padding: "0.8rem 1.35rem 0.7rem"
  poster-label:
    backgroundColor: "{colors.poster-ink}"
    textColor: "{colors.ink-magenta}"
    typography: "{typography.title}"
    padding: "0.12em 0.3em 0.02em"
  status-badge:
    backgroundColor: "{colors.ink-green}"
    textColor: "{colors.poster-ink}"
    rounded: "{rounded.none}"
    padding: "0.1rem 0.5rem 0.05rem"
  place-chip:
    backgroundColor: "transparent"
    textColor: "{colors.poster-ink}"
    rounded: "{rounded.none}"
    padding: "0.2rem 0.7rem 0.15rem"
  place-chip-hover:
    backgroundColor: "{colors.ink-yellow}"
  photo-credit-tab:
    backgroundColor: "{colors.poster-ink}"
    textColor: "{colors.on-ink-2}"
    typography: "{typography.caption}"
    padding: "0.25rem 0.55rem"
---

<!-- Recorded from the shipped build on 2026-09-29 (src/styles/global.css, src/components/site/*, src/pages/index.astro, src/pages/[lang]/peru/[slug].astro). Review status: the finish review returned "fix"; a verdict pass confirmed 7 of 8 fixes; the last two (photo-credit ink tab, per-line h2 bands) are in the code but their final verdict pass did not complete. This system has NOT passed review. -->

# Design System: TourUp Guide

## Overview

**Creative North Star: "The Chicha Poster Magazine"**

The guide speaks in the voice of Lima's chicha street posters: stacked, condensed, all-caps lettering in flat fluorescent inks, set on black bands, laid over big photographs of Peru. It is a travel magazine in structure (teal masthead bar, black nav strip, full-bleed photo hero, most-read grid, destination mosaic, list hub, dark multi-column footer) and a street poster in voice. Reading happens on plain white; everything that announces, navigates or frames happens in black ink.

Density is magazine-loose: sections breathe on a 4rem to 6rem vertical rhythm, and each is sealed off by the poster strip. Colour is never a tint or a wash. An ink either owns a whole block (a yellow directory band, a magenta tile band) or a whole word-line of a stacked title. The system rejects the category default of cream paper, italic serif display and muted terracotta; it also has no rounded corners and no drop shadows anywhere.

**Key Characteristics:**
- Black poster ink (#121212) for every band, nav strip, footer, table head and photo-credit tab.
- Four flat fluorescent inks (magenta, orange, yellow, green) used as whole blocks or one ink per title line.
- TourUp teal appears on the masthead bar, the footer logotype and one status badge; nowhere else.
- Big Shoulders Display, black weight, all caps, leading under 1, for every heading and label; Source Serif 4 for reading.
- Square corners throughout; depth comes from ink bands, not shadows.
- The poster strip (four stacked 6px ink bars) is the section break.

## Colors

A black-and-white page lettered with four fluorescent poster inks and a single brand teal.

### Primary
- **Poster Ink** (poster-ink): the structural colour. Masthead nav strip, footer, hero title band, itinerary section, guide header band, poster-label backgrounds, table header cells, the photo-credit tab and the 2px outlines of buttons and chips. Also the ground behind the poster strip.

### Secondary
- **Chicha Magenta** (ink-magenta): the first ink. First line of the hero title, nav hover underline, the global focus outline (3px), the scroll cue and arrow glyphs in lists, the first poster-label in each rotation.
- **Chicha Yellow** (ink-yellow): the action ink. Every button floods to yellow on hover and focus; the search button is solid yellow; the active nav item; the guide page title on ink; the B2B directory section is a full yellow block; text selection.
- **Chicha Orange** (ink-orange) and **Chicha Green** (ink-green): rotation inks for mosaic tiles, hub-row edges, poster labels and title lines. Green is also the "valid" certification badge and the label colour for sidebar headings on ink.

### Tertiary
- **TourUp Teal** (masthead-teal): the brand bar. The 56px masthead, the footer logotype, and the "valid, undated" certification badge. It is never a section fill, button or text colour on white.

### Neutral
- **Paper** (paper): the reading ground for all body content.
- **Paper Grey** (paper-2): only as an image placeholder behind loading photos and as the muted fill of expired or not-certified badges. Never a section field.
- **Text** (text), **Text Secondary** (text-2), **Text Tertiary** (text-3): body copy, supporting copy and meta, placeholder text respectively, all at AA on white.
- **Link Magenta** (link-magenta): inline links on white; a deeper magenta so it passes AA where the fluorescent ink would not. On hover the link turns ink and its underline thickens to 3px in fluorescent magenta.
- **Rule** (rule): 1px hairlines between list rows, table rows, hub rows.
- **On Ink** (on-ink) and **On Ink Secondary** (on-ink-2): text on black; secondary for credits, routes and footer copy.
- **Ink Rule** (ink-rule): 1px dividers between items on black (nav items, itinerary columns).

### Named Rules
**The Flat Ink Rule.** An ink is a whole block or a whole word-line. Never a gradient, tint, transparency wash or partial fill. The only gradient in the build is the black photo scrim under the hero, and it is ink over photo, not colour.

**The Teal Stays Up Top Rule.** Teal is the TourUp brand bar. It does not become an accent, a button or a link.

**The White Reading Ground Rule.** Body text sits on plain white. Paper Grey is never used to fill a section or a card.

## Typography

**Display Font:** Big Shoulders Display, self-hosted at 700, 800 and 900 (fallback Arial Narrow, sans-serif)
**Body Font:** Source Serif 4, variable with optical sizing (fallback Georgia, serif)

**Character:** A black condensed poster grotesque that shouts in stacked capitals, paired with a sturdy, calm text serif that does the actual explaining. The contrast is the voice: the poster announces, the serif is factual.

### Hierarchy
- **Display** (900, clamp(4rem, 12vw, 8.25rem), 0.86): stacked poster titles, one ink per line: hero PERU / THE GUIDE, section titles such as WHERE / TO GO, destination and hub titles (clamp up to 7.5rem).
- **Headline** (900, clamp(2.75rem, 7vw, 5.5rem), 0.95): page h1 outside the poster stacks; guide page titles set yellow on ink.
- **Title** (800, clamp(2rem, 4.5vw, 3.25rem), 0.95): h2. Inside articles it is a poster label (see Components).
- **Subtitle** (800, clamp(1.4rem, 2.4vw, 1.85rem), 1): h3, story-card titles (1.5rem), itinerary names.
- **Body** (400, 1.0625rem, 1.65): all reading text, capped at a 68ch measure.
- **Label** (800, about 1rem to 1.12rem, 0.04em to 0.08em tracking, uppercase): nav items, buttons, chips, badges, table heads, meta lines.
- **Caption** (400 serif, 0.72rem, 1.3): photo credits only.

### Named Rules
**The Poster Caps Rule.** Every heading, button, nav item, badge and label is Big Shoulders Display in uppercase. Serif never sets a heading; the poster face never sets a paragraph.

**The One Ink Per Line Rule.** A stacked title gives each line its own ink (magenta, yellow, orange, green, or white/black against the ground). Two inks never share a line.

## Layout

A single centred column (max 1240px, fluid gutter clamp(1rem, 4vw, 2.5rem)) holds most sections; the destination mosaic runs wider (max 1440px) and edge to edge on smaller screens; the hero and all ink sections are full bleed. Reading text is held to 68ch.

Vertical rhythm is a five-step scale (1rem, 1.5rem, 2.5rem, 4rem, 6rem); sections open with 6rem and close with 4rem to 6rem, then hand off through a poster strip. Grids: most-read is a sticky stacked title beside a 4-column story grid (2 columns under 1020px, compact photo-left rows under 480px); the mosaic is N columns of 5:8 tiles (2 columns of 4:5 under 760px, an odd last tile spans full width at 16:9); the destinations hub is a list of 360px photo + text rows; guides are an article with an optional 19rem sticky aside. The nav strip centres its items and wraps to two centred rows under 720px rather than scrolling. The footer is 1.4fr + three columns, then two, then one.

## Elevation & Depth

The system is flat. There are no drop shadows. Depth is made by ink: a black band laid over a photograph, a poster label sitting on white, a flooded mosaic tile. The only shadow-property use is an inset 4px bottom bar on nav items (magenta on hover, yellow when current), which reads as an underline, not a lift.

### Named Rules
**The Ink Not Shadow Rule.** To separate a layer, lay a black band or a flat ink block. Never a box-shadow, blur or glow.

## Shapes

Every corner is square (0px): buttons, inputs, chips, badges, tiles, photos, bands. Outlines are 2px ink (buttons, chips, the active language switch), 3px ink around the search field. Hairlines are 1px (rule on white, ink-rule on black); list openers use a 2px ink top rule. The recurring silhouette is the horizontal band: a black rectangle hugging text, the six-pixel poster-strip bars, the ink band across a tile.

## Components

### Buttons
Outlined condensed capitals that flood with yellow.
- **Shape:** square, 2px ink border.
- **Poster button:** transparent, ink text, label type, padding 0.45em 1.1em 0.4em.
- **Hover / Focus:** background floods yellow over 180ms (ease-out cubic-bezier(0.16, 1, 0.3, 1)); text stays ink. Inside the yellow directory section the flood inverts to ink with yellow text.
- **On ink:** white text and white border; on hover the border turns yellow and the fill floods yellow with ink text.
- **Search button:** the one filled button: solid yellow, 900 weight, 1.2rem, fused to the right of the search field; hover turns magenta.

### Chips
- **Place chips** (operator profiles): outlined like the poster button, smaller (0.2rem 0.7rem padding), flood yellow on hover.
- **Status badges** (certification lists): solid ink blocks with ink text: green valid, yellow expiring, teal valid-undated, Paper Grey with secondary text for expired, terminated or not certified.

### Cards / Containers
- **Corner Style:** square.
- **Story cards:** no box; a 4:3 photo (1.04 zoom on hover, 500ms), a subtitle-weight poster title, serif summary in text-2, a poster button.
- **Hub rows:** 360px 16:11 photo with an ink edge at its base (a 22px bar scaled to about 8px that rises to full height on hover), title up to 3.25rem, uppercase meta line, serif summary; rows divided by rule hairlines.
- **Ink rows** (itineraries, sustainable itineraries): black blocks on or as the ground, huge 900-weight day numbers (up to 7.5rem) in an ink, the name turning yellow on hover.
- **Border:** none on cards; separation by hairline rules and whitespace.

### Inputs / Fields
- **Search field:** white field, 3px ink border, serif 1.05rem text, text-3 placeholder, padding 0.8rem 1rem.
- **Focus:** 3px magenta outline drawn inside the field (offset -3px). Site-wide focus is a 3px magenta outline at 3px offset.

### Navigation
- **Masthead bar:** 56px teal; TourUp logotype in 900-weight caps with "GUIDE" as a yellow-on-ink block; EN/ES switch at right, current language outlined 2px ink, hover inverts to ink with teal text.
- **Nav strip:** black, centred items in label type (1.12rem, 0.06em tracking), white text, separated by 1px ink-rule; hover turns text yellow with a 4px magenta bottom bar; current page is yellow text with a yellow bar. Under 720px it wraps into two centred rows at 1rem, nothing clipped.
- **Footer:** black, teal 900-weight logotype, yellow column headings, white links that turn yellow with a magenta underline on hover, legal line above a 1px divider.

### Poster Strip
The section break: a 24px band of four stacked 6px bars, magenta, orange, yellow, green, top to bottom. It sits between every major section, under the masthead of guide and hub pages and above the footer.

### Poster Label (article h2)
Article h2s are black bands carrying the heading in an ink that rotates magenta, orange, green, yellow by position. Markdown headings are wrapped in a span by a build step so the band is painted line by line and hugs the text (box-decoration-break: clone, line-height 1.22) instead of filling the column.

### Destination Mosaic (signature)
Photo tiles with the destination name centred in 900-weight caps on a band of the tile's ink (90% opacity) clipped to the middle strip (inset 38% top and bottom). On hover or keyboard focus the band floods the whole tile via clip-path over 520ms, the photo zooms to 1.06, the name lifts 2.5rem and the one-line summary fades up beneath it. Focus draws an ink outline inset 6px. Under 760px the summary is hidden and the name does not move.

### Photo Credit Tab
Every hero and header photograph carries its CC credit: serif caption in on-ink-2 on a black tab, bottom-right of the photo, so it reads over pale stone or sky. Photos without a visible credit are listed on the photo-credits page linked from every footer.

## Do's and Don'ts

### Do:
- **Do** set every heading and label in Big Shoulders Display caps, weight 800 to 900, leading 0.86 to 1.
- **Do** give each line of a stacked title its own ink, and each poster label its own ink in the magenta, orange, green, yellow rotation.
- **Do** close sections with the poster strip (four stacked 6px bars, magenta, orange, yellow, green).
- **Do** make buttons 2px ink outlines in condensed caps that flood with yellow on hover and focus.
- **Do** put photo credits on a black ink tab over the photo, and list every photo on the photo-credits page.
- **Do** use link magenta (#b3005c) for inline links on white; keep fluorescent inks for blocks, lines and bars.
- **Do** keep every corner square.

### Don't:
- **Don't** use gradients, tints or transparency washes of the four inks; the only gradient is the black scrim under the hero photo.
- **Don't** use teal beyond the masthead bar, footer logotype and the undated-valid badge.
- **Don't** fill sections or cards with grey; reading ground is plain white.
- **Don't** add drop shadows, glows or rounded corners.
- **Don't** set fluorescent ink text on white for body copy or links; it fails contrast. On white, inks live as backgrounds or as display-size title lines.
- **Don't** use cream paper, italic serif display or muted terracotta.
