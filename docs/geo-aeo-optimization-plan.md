# Plan de Optimización GEO / AEO — TourUp Peru

> **Fecha:** 22 de junio de 2026
> **Auditoría:** Análisis estructural y de contenido para posicionamiento en ChatGPT, Gemini, Google AI Overviews y Bing Copilot.
> **Base:** docs/agent.md (plantillas GEO), arquitectura actual del sitio, colecciones de contenido.

---

## Resumen Ejecutivo

El sitio **cumple parcialmente** con requisitos GEO/AEO. Tiene bases sólidas (FAQPage en empresas, ItemList en prompts, robots.txt con AI crawlers, sitemaps por tipo de contenido), pero presenta **12 brechas críticas** que impiden un posicionamiento óptimo en motores generativos.

**Puntaje estimado actual:** ~35/100 en preparación GEO.
**Puntaje objetivo post-plan:** ~85/100.

---

## 1. Auditoría de Brechas (Gap Analysis)

### 1.1 Brechas Críticas (Alto Impacto)

| # | Brecha | Impacto GEO | Impacto AEO | Ubicación Actual |
|---|--------|:-----------:|:-----------:|-----------------|
| G1 | Sin etiquetas `<link rel="canonical">` en ninguna página | 🔴 Alto | 🔴 Alto | Layout.astro |
| G2 | Sin Open Graph / Twitter Cards | 🔴 Alto | 🟡 Medio | Layout.astro |
| G3 | Sin JSON-LD en páginas de destino (`/en/peru/[slug]/`) | 🔴 Alto | 🔴 Alto | en/peru/[slug].astro |
| G4 | Sin JSON-LD en páginas de categoría (`/en/peru/[slug]/tours/[categoria]/`) | 🔴 Alto | 🔴 Alto | en/peru/[slug]/tours/[categoria].astro |
| G5 | Sin JSON-LD en homepage | 🔴 Alto | 🟡 Medio | index.astro |
| G6 | Sin JSON-LD en blog (Article/BlogPosting) | 🟡 Medio | 🔴 Alto | blog/[slug].astro |
| G7 | Contenido de destinos muy delgado (14-34 líneas, enfoque B2B) | 🔴 Alto | 🔴 Alto | content/destinos/*.md |
| G8 | Sin páginas de itinerario (7/10/14 días) ni hub de FAQs | 🔴 Alto | 🔴 Alto | No existen |
| G9 | 360 páginas de categoría sin cuerpo (frontmatter-only) | 🟡 Medio | 🔴 Alto | content/categorias_destino/*.md |
| G10 | Sin BreadcrumbList JSON-LD en ninguna página | 🟡 Medio | 🟡 Medio | Todas las páginas |
| G11 | Sin Organization/WebSite JSON-LD (marca TourUp) | 🟡 Medio | 🟡 Medio | Layout.astro |
| G12 | Sin hreflang (lang="en" hardcodeado, sitio bilingüe Español/Inglés) | 🟡 Medio | 🟢 Bajo | Layout.astro |

### 1.2 Brechas Medias

| # | Brecha | Impacto |
|---|--------|:------:|
| G13 | Blog posts no incluidos en sitemap | 🟡 Medio |
| G14 | 360 páginas de categoría no incluidas en sitemap | 🟡 Medio |
| G15 | Sin TouristTrip / TouristAttraction / Place schema | 🟡 Medio |
| G16 | Schema de empresa duplicado: `/companies/[slug]/` sin JSON-LD vs `/empresas/[slug]/` con JSON-LD | 🟡 Medio |
| G17 | Sin `@astrojs/sitemap` (sitemaps estáticos manuales) | 🟡 Medio |
| G18 | Faltan Partner Scout y rutas alternas en sitemap | 🟡 Medio |

### 1.3 Brechas Bajas / Potenciales

| # | Brecha | Impacto |
|---|--------|:------:|
| G19 | JSON-LD en prompts separado en 3 scripts (WebPage + ItemList + FAQPage) en vez de `@graph` | 🟢 Bajo |
| G20 | Sin Product schema para tours individuales | 🟢 Bajo |
| G21 | Sin meta robots tag (no crítico si robots.txt está bien) | 🟢 Bajo |
| G22 | Sin esquema de imágenes (ImageObject) | 🟢 Bajo |

---

## 2. Análisis de Diagnóstico por Motor

### 2.1 ChatGPT / GPTBot

```
Fortalezas actuales:
✅ robots.txt permite GPTBot explícitamente
✅ prompts tienen search_term + answer-first content
✅ empresas tienen TravelAgency + FAQPage + AggregateRating
✅ FAQ data disponible en destinos y categorías

Debilidades:
❌ Sin canonical → riesgo de contenido duplicado
❌ Destinos sin TouristAttraction schema → ChatGPT no asocia "Cusco" con entidad turística
❌ Contenido B2B en lugar de B2C → ChatGPT prioriza contenido orientado al viajero
❌ Sin páginas de itinerario → pierde consultas "plan 10 días Perú"
```

### 2.2 Google AI Overviews

```
Fortalezas actuales:
✅ FAQPage schema presente en empresas y prompts
✅ ItemList schema para listas de operadores
✅ Content collections con datos estructurados (NAP, ratings, licencias)

Debilidades:
❌ Sin BreadcrumbList → Overviews no puede mostrar rutas de navegación
❌ Sin Article schema en blog → Overviews no prioriza contenido editorial
❌ Destinos sin cuerpo narrativo → Overviews extrae de texto visible, no de frontmatter
❌ Sin Organization → Google no asocia el sitio con una entidad verificada
```

### 2.3 Gemini / Google Search

```
Fortalezas actuales:
✅ Sitemaps separados por tipo de contenido
✅ URLs limpias sin parámetros
✅ contenido estático HTML (rápido de rastrear)

Debilidades:
❌ Sin hreflang → Gemini no sabe qué idioma priorizar
❌ Sin Open Graph → pobre presentación en sharing y en resultados enriquecidos
❌ Contenido delgado en 21 destinos y 360 categorías
❌ Sin TouristTrip schema → Gemini no reconoce relación viajero-destino
```

### 2.4 Bing Copilot

```
Fortalezas actuales:
✅ Datos de licencias MINCETUR (autoridad)
✅ robots.txt bien configurado
✅ rich data en empresas (TravelAgency)

Debilidades:
❌ Mismas que Google + Bing prioriza autoridad de dominio
❌ Sin backlinks ni señales de autoridad externa (fuera del alcance técnico)
❌ Sin FAQ hub centralizado
```

---

## 3. Plan de Acción Priorizado

### Fase 1 — Fundamentos Técnicos (Días 1-3)
*Impacto inmediato en rastreo, indexación y compatibilidad con LLMs*

| ID | Acción | Archivos | Dificultad |
|----|--------|----------|:----------:|
| **P1** | Agregar `<link rel="canonical">` dinámico al Layout.astro | `Layout.astro` | Baja |
| **P2** | Agregar Open Graph + Twitter Cards al Layout.astro | `Layout.astro` | Baja |
| **P3** | Agregar Organization + WebSite JSON-LD al Layout.astro | `Layout.astro` | Baja |
| **P4** | Agregar BreadcrumbList JSON-LD dinámico (basado en currentPath) | `Layout.astro` | Media |
| **P5** | Agregar hreflang dinámico al Layout.astro | `Layout.astro` | Media |
| **P6** | Revisar y unificar sitemaps: agregar categorías, blog posts, partner-scout | `public/sitemap-*.xml` | Media |

### Fase 2 — Páginas de Destino (Días 4-7)
*Contenido narrativo rico + schema Tourism — impacto directo en consultas informacionales*

| ID | Acción | Archivos | Dificultad |
|----|--------|----------|:----------:|
| **P7** | Reescribir contenido de destinos clave siguiendo plantilla agent.md (Cusco, Lima, Arequipa, Machu Picchu, Peru, Puno, Iquitos) | `content/destinos/cusco.md` + 6 más | Alta |
| **P8** | Agregar TouristAttraction + Place + FAQPage JSON-LD a páginas de destino | `en/peru/[slug].astro` | Alta |
| **P9** | Agregar ItemList schema en páginas de tours por destino | `en/peru/[slug]/tours.astro` | Media |
| **P10** | Expandir contenido de categorías (360 archivos) con cuerpo narrativo + FAQ | `content/categorias_destino/*.md` | Alta |

### Fase 3 — Nuevas Páginas GEO (Días 8-10)
*Páginas que responden a patrones de consulta específicos en LLMs*

| ID | Acción | Ruta Propuesta | Dificultad |
|----|--------|---------------|:----------:|
| **P11** | Crear página "Itinerario 7 días por Perú" | `/en/peru/itinerario-7-dias/` | Media |
| **P12** | Crear página "Itinerario 10 días por Perú" | `/en/peru/itinerario-10-dias/` | Media |
| **P13** | Crear página "Itinerario 14 días por Perú" | `/en/peru/itinerario-14-dias/` | Media |
| **P14** | Crear hub de FAQs | `/en/peru/preguntas-frecuentes-viajar-a-peru/` | Media |
| **P15** | Crear página "Mejores tours a Machu Picchu" | `/en/peru/cusco/tours-machu-picchu/` | Media |

### Fase 4 — Páginas de Empresa y Blog (Días 11-12)
*Cierre de brechas en schema y contenido*

| ID | Acción | Archivos | Dificultad |
|----|--------|----------|:----------:|
| **P16** | Agregar JSON-LD a `/companies/[slug]/` o canonical a `/empresas/[slug]/` | `companies/[slug].astro` | Baja |
| **P17** | Agregar Article + FAQPage JSON-LD a blog posts | `blog/[slug].astro` | Baja |
| **P18** | Agregar WebPage + BreadcrumbList JSON-LD a homepage | `index.astro` | Baja |
| **P19** | Unificar los 3 scripts JSON-LD en JsonLdPromptLanding en un solo `@graph` | `JsonLdPromptLanding.astro` | Baja |

### Fase 5 — Consolidación y Monitoreo (Día 13+)
*Afinamiento continuo*

| ID | Acción | Dificultad |
|----|--------|:----------:|
| **P20** | Implementar `@astrojs/sitemap` para generación automática de sitemaps | Media |
| **P21** | Agregar Google Search Console + Bing Webmaster Tools verification meta tags | Baja |
| **P22** | Agregar meta robots condicional (noindex en páginas delgadas) | Baja |
| **P23** | Crear script de validación GEO que verifique presencia de schema requerido por tipo de página | Media |

---

## 4. Arquitectura de Schema Recomendada

### 4.1 Por Tipo de Página

| Tipo de Página | Schema Requerido | Prioridad |
|----------------|------------------|:---------:|
| Homepage | `WebSite` + `Organization` + `WebPage` + `BreadcrumbList` | Alta |
| Destino (`/en/peru/cusco/`) | `WebPage` + `BreadcrumbList` + `Place`/`TouristAttraction` + `FAQPage` | Crítica |
| Tours listing (`/en/peru/cusco/tours/`) | `WebPage` + `BreadcrumbList` + `ItemList` + `FAQPage` | Alta |
| Categoría (`/en/peru/cusco/tours/aventura/`) | `WebPage` + `BreadcrumbList` + `ItemList` + `FAQPage` | Alta |
| Empresa (`/empresas/slug/`) | `TravelAgency` + `LocalBusiness` + `AggregateRating` + `FAQPage` + `BreadcrumbList` | Ya existe (mejorar) |
| Prompt landing (`/en/ai-prompts/slug/`) | `WebPage` + `ItemList` + `FAQPage` + `BreadcrumbList` | Ya existe (unificar) |
| Blog post (`/blog/slug/`) | `Article` + `BreadcrumbList` + `FAQPage` | Alta |
| Itinerario | `WebPage` + `BreadcrumbList` + `ItemList` + `FAQPage` | Alta |
| FAQ hub | `FAQPage` + `WebPage` + `BreadcrumbList` | Alta |

### 4.2 Modelo @graph Unificado

```
{
  "@context": "https://schema.org",
  "@graph": [
    { Organization: marca TourUp },
    { WebSite: con searchAction },
    { WebPage: página actual con url canónica },
    { BreadcrumbList: navegación },
    ...schema específico por tipo de página
  ]
}
```

---

## 5. Roadmap de Contenido GEO

### 5.1 Destinos Prioritarios para Reescribir (orden)

| Prioridad | Destino | Vol. Búsqueda Estimado | Estado Actual |
|:---------:|---------|:---------------------:|:-------------:|
| 1 | Peru (guía país) | Máximo | 14 líneas, sin cuerpo |
| 2 | Cusco | Muy alto | B2B, 34 líneas |
| 3 | Machu Picchu | Muy alto | 25 líneas, delgado |
| 4 | Lima | Alto | 31 líneas, B2B |
| 5 | Arequipa | Alto | B2B |
| 6 | Puno / Lago Titicaca | Alto | B2B |
| 7 | Iquitos / Amazonía | Alto | B2B |

### 5.2 Nuevas Páginas a Crear

| Página | Consulta Target | Motor Primario |
|--------|----------------|:-------------:|
| Itinerario 7 días | "7 days in Peru itinerary" | ChatGPT, Gemini |
| Itinerario 10 días | "10 days Peru itinerary" | ChatGPT, Gemini |
| Itinerario 14 días | "2 weeks Peru itinerary" | ChatGPT, Gemini |
| FAQ hub | "travel to Peru requirements" | Google AI, Bing |
| Mejores tours MP | "best Machu Picchu tours 2026" | Todos |

### 5.3 Plantilla de Contenido por Tipo (según agent.md)

Cada destino reescrito debe seguir la estructura exacta de `docs/agent.md`:

```
H1: Viajar a [Destino]: guía completa para planificar tu viaje a Perú
H2: Resumen rápido: por qué viajar a [Destino]      ← BLUF (answer nugget)
H2: Cuándo es la mejor época para visitar [Destino]
  H3: Temporada alta, media y baja
  H3: Clima por meses y recomendaciones de equipaje
H2: Qué ver y hacer en [Destino]
  H3: Imprescindibles
  H3: Excursiones cercanas
H2: Cuántos días necesitas en [Destino]
  H3: Escala rápida (2-3 días)
  H3: Viaje clásico (4-5 días)
  H3: Itinerario extendido
H2: Presupuesto orientativo
  H3: Económico / Estándar / Premium
H2: Consejos de altura, seguridad y salud
  H3: Mal de altura
  H3: Zonas seguras y estafas
H2: Mejores tours y experiencias en [Destino]       ← enlaces internos
H2: Preguntas frecuentes sobre viajar a [Destino]    ← 7+ FAQs AEO
```

---

## 6. Estimación de Esfuerzo

| Fase | Acciones | Días Estimados | Dependencias | Impacto Esperado |
|------|----------|:--------------:|:------------:|:----------------:|
| Fase 1 — Técnico | P1-P6 | 3 | Ninguna | 🟢 +40% rastreabilidad |
| Fase 2 — Destinos | P7-P10 | 4 | Fase 1 | 🟢 +60% consultas informacionales |
| Fase 3 — Nuevas páginas | P11-P15 | 3 | Fase 2 | 🟢 +30% cobertura de consultas |
| Fase 4 — Empresa/Blog | P16-P19 | 2 | Fase 1 | 🟡 +15% schema coverage |
| Fase 5 — Consolidación | P20-P23 | Continuo | Fases 1-4 | 🟡 Monitoreo |

---

## 7. Riesgos y Consideraciones

1. **Cambio de enfoque B2B → B2C:** El contenido actual está escrito para agencias emisoras. Para GEO se necesita contenido orientado al viajero final. Esto implica una decisión de producto: ¿el sitio es B2B, B2C, o ambos? Se recomienda mantener ambos pero etiquetar con schema diferente.

2. **Volumen de categorías (360):** Reescribir 360 archivos de categoría es inviable manualmente. Alternativa: generarlos por script con plantilla parametrizada (destino + categoría).

3. **Canibalización:** `/empresas/[slug]/` y `/companies/[slug]/` tienen el mismo contenido pero diferente ruta. Definir canonical a `/empresas/[slug]/`.

4. **Bilingüismo:** Evaluar si crear versiones en español para destinos y prompts, o si el mercado objetivo (B2B internacional) prefiere inglés. La estructura actual (destinos en /en/, empresas sin prefijo de idioma) sugiere audiencia mixta.

---

## 8. Checklist de Verificación GEO

```
[ ] canonical URL presente en todas las páginas
[ ] Open Graph + Twitter Cards en Layout
[ ] BreadcrumbList JSON-LD en todas las páginas
[ ] Organization + WebSite JSON-LD en Layout
[ ] TouristAttraction/Place schema en páginas de destino
[ ] FAQPage schema en páginas de destino, empresa, prompts y blog
[ ] Article schema en blog posts
[ ] Product/ItemList schema en páginas de tours
[ ] hreflang configurado (es/en)
[ ] Sitemaps incluyen todas las rutas públicas
[ ] robots.txt permite todos los AI crawlers ✓ (ya OK)
[ ] Contenido de destinos ≥ 500 palabras siguiendo plantilla agent.md
[ ] Páginas de itinerario creadas (7/10/14 días)
[ ] FAQ hub creado
[ ] Sin etiquetas duplicadas (canonical resuelve /companies/ vs /empresas/)
[ ] Schema combinado en @graph (no scripts separados)
```
