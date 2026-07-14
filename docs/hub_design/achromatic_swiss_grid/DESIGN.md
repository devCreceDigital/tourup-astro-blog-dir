---
name: Achromatic Swiss Grid
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f4'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#444748'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f0f1f1'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b1b'
  on-primary-container: '#858383'
  inverse-primary: '#c9c6c5'
  secondary: '#5e5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e3e2e2'
  on-secondary-container: '#646464'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1d1b1a'
  on-tertiary-container: '#868381'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c9c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474646'
  secondary-fixed: '#e3e2e2'
  secondary-fixed-dim: '#c7c6c6'
  on-secondary-fixed: '#1b1c1c'
  on-secondary-fixed-variant: '#464747'
  tertiary-fixed: '#e6e1df'
  tertiary-fixed-dim: '#cac6c3'
  on-tertiary-fixed: '#1d1b1a'
  on-tertiary-fixed-variant: '#484645'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
  pure-black: '#000000'
  carbon: '#171717'
  ash: '#a1a1a1'
  smoke: '#b9b9b9'
  hairline: '#e5e5e5'
  mist: '#f2f2f2'
  chalk: '#ffffff'
typography:
  display-xl:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.05em
  display-xl-mobile:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.04em
  headline-sm:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '600'
    lineHeight: '1.5'
    letterSpacing: -0.45px
  body-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.43'
    letterSpacing: -0.025em
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.5'
    letterSpacing: '0'
  caption:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.5'
    letterSpacing: '0'
  code:
    fontFamily: Geist Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.43'
    letterSpacing: '0'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  gap-element: 8px
  gap-nav: 10px
  padding-card: 16px
  gap-section: 48px
  nav-height: 64px
  max-width: 1200px
---

## Brand & Style

This design system is rooted in **Swiss Brutalism**, prioritizing structural integrity, architectural gravity, and objective clarity. It is designed for high-density information environments where content is the primary focus, and the interface acts as a silent, high-precision scaffolding.

The aesthetic is defined by:
- **Functional Objectivity:** A rejection of decorative elements, gradients, and shadows in favor of 1px structural hairlines.
- **Architectural Layout:** A border-first approach where every container is defined by sharp, visible perimeters.
- **Utilitarian Precision:** High-contrast monochromaticity and tight typographic tracking create a "drafting table" feel.
- **Compact Density:** Efficient use of space through a modular grid system, ideal for technical documentation and content hubs.

## Colors

The palette is strictly achromatic, leveraging the scale of grays to define hierarchy rather than emotion.

- **Primary (#0a0a0a):** Used for high-emphasis components like primary buttons, navigation links, and selected states. It should feel like a solid block of ink.
- **Neutral/Surface (#ffffff):** The base canvas for all cards and page backgrounds.
- **Secondary (#737373):** Reserved for meta-information, captions, and secondary icons.
- **Structural (#e5e5e5):** The "Hairline" color used for all borders, dividers, and table rules. This is the most frequently appearing color in the UI.
- **Surface Muted (#f2f2f2):** Used for hover states on ghost buttons and secondary backgrounds like tags.

## Typography

Typography is the primary vehicle for identity. We use **Geist** for its geometric, technical character.

- **Drama & Scale:** Display headings use tight line-height and negative letter-spacing to create "architectural gravity."
- **Readability:** Body text is set at 14px with a slightly generous line-height to ensure legibility despite high-density layouts.
- **Technicality:** `Geist Mono` is utilized for technical micro-copy, status labels, or any metadata requiring a monospaced feel.
- **OpenType Features:** Always enable `cv11` (single-story 'a') and `ss01` for the most clinical appearance.

## Layout & Spacing

This design system uses a **Fixed Swiss Grid** with a maximum content width of 1200px.

- **Rhythm:** A base 4px/8px unit governs the internal spacing of components.
- **Borders as Spacing:** Because borders are visible (1px Hairline), they serve as the primary delimiter between elements rather than whitespace alone.
- **Density:** The layout is intentionally compact. Gaps between related elements should not exceed 8px.
- **Responsiveness:** On mobile, the 1200px container collapses to 100% width with 16px side margins. Section gaps reduce from 48px to 32px to maintain momentum.

## Elevation & Depth

This system rejects all traditional shadows and blurs. Depth is achieved strictly through:

- **Border Stacking:** Elements are separated by 1px solid `#e5e5e5` (Hairline) borders. 
- **Z-Index by Context:** While surfaces remain flat, modals and dropdowns are defined by high-contrast black borders or slight tonal shifts.
- **Inverted Focus Rings:** For accessibility and focus states, we utilize a 2px white ring (`#ffffff`) placed atop a 2px black border to create high-visibility "outline-on-outline" depth without soft shadows.

## Shapes

The shape language is precisely controlled to balance the harshness of the grid with functional softness.

- **Functional Elements (10px):** Buttons, text inputs, and search bars use a 10px radius to feel ergonomic.
- **Structural Containers (14px):** Cards and content blocks use a 14px radius to provide a clear visual distinction from smaller UI components.
- **Informational Accents (26px/Pill):** Tags and badges use higher roundedness to denote their interactive or secondary nature.

## Components

### Buttons
- **Primary:** Solid `#0a0a0a` fill with `#ffffff` text. No border. 10px radius.
- **Ghost:** Transparent background with 1px `#e5e5e5` border. Hover state fills background with `#f2f2f2`.
- **Label:** `label-md` uppercase or medium weight.

### Inputs
- **Text Fields:** 1px `#e5e5e5` border, `#ffffff` background. 10px radius. Use `Geist Mono` for placeholder text to emphasize the technical nature.
- **Focus State:** 2px `#000000` border with an internal 2px white "hairline" buffer.

### Cards
- **Base:** 1px `#e5e5e5` border, `#ffffff` surface, 14px radius. 16px internal padding.
- **Inverted:** `#171717` background with `#ffffff` text for high-impact callouts.

### Chips & Tags
- **Style:** 1px `#e5e5e5` border, `#f2f2f2` fill, 26px radius.
- **Text:** `caption` level, typically `#737373` for secondary info.

### Navigation
- **Top Bar:** 64px height, bottom border 1px `#e5e5e5`. 
- **Links:** 10px spacing between items. Active links use a 2px bottom border in `#000000` rather than color shifts.