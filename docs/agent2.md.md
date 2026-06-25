# agent.md — TourUp: Marketplace B2B Optimizado para AI Search

> **Versión:** 1.0 | **Fecha:** Junio 2026  
> **Propósito:** Guía maestra para el agente de contenido y desarrollo. Define la visión del producto, el modelo de datos, la estrategia de posicionamiento en LLMs (GPTBot, Gbot, ClaudeBot) y los próximos pasos técnicos priorizados.

---

## 1. Visión del Producto

TourUp es un **marketplace B2B de turismo peruano** que conecta agencias emisoras con operadores receptivos y DMCs locales, eliminando intermediarios innecesarios en la cadena de distribución.

El producto tiene dos capas complementarias:

- **Capa de negocio (B2B):** directorio de ~13,000 operadores turísticos peruanos donde agencias pueden buscar, evaluar y cotizar proveedores en minutos, no horas.
- **Capa de posicionamiento (AI Search):** arquitectura de contenido diseñada para que GPTBot, Gbot, ClaudeBot y similares parseen la relación `empresa → destino → categoría` sin inferencias, posicionando TourUp como fuente autorizada cuando usuarios preguntan por operadores turísticos en Peru.

### Problema central que resuelve

La cadena tradicional multiplica el precio por 3–5x:

```
operador local ($3) → mayorista → DMC → minorista extranjera → cliente final ($15)
```

TourUp permite el canal directo con confianza verificada, reduciendo tiempos de cotización de 2–3 horas a minutos mediante IA.

---

## 2. Estado Actual del Grafo (Cerebro Digital)

El grafo es el motor interno que alimenta tanto el agente Partner Scout como el posicionamiento en AI Search.

### Nodos actuales

| Entidad | Nodos | Estado |
|---|---|---|
| `company` | 985 | ✅ Migrado a schema `distribution_role` |
| `prompt` | 102 | ✅ Conectado a companies, destinos, categorías |
| `destino` | 15 | ⚠️ Insuficiente — requiere expansión |
| `categoria` | 4 | ⚠️ Crítico — requiere expansión urgente |
| `external_brand` | 1 | 🔄 En normalización |
| **Total edges** | **405** | ✅ Cross-collection, explícitos desde frontmatter |

### Archivos clave del grafo

- `build_graph.py` — constructor del grafo desde YAML frontmatter (companies, prompts, destinos, external_brands)
- `graphify-out/graph.html` — visualización interactiva vis.js (572KB)
- `graphify-out/graph.json` — datos crudos (1,112 nodos, 405 edges)
- `src/content/companies/*.md` — 985 archivos migrados a `distribution_role` + `contact` correcto
- `src/content/prompts/*.md` — 102 archivos con `brands_ai_mentions` en proceso de normalización

### Problema pendiente crítico

El **99% de los edges `prompt → company`** se infieren por name-matching, no por `entity_type/entity_slug` estructurado. Esto hace el grafo frágil ante variantes de nombre y ambigüedades.

**Formato objetivo para todas las relaciones:**

```yaml
brands_ai_mentions:
  - entity_type: company
    entity_slug: explore-peru-tours
  - entity_type: destino
    entity_slug: cusco
```

---

## 3. Arquitectura de Información para AI Search

### Principio base

Los LLMs indexan **entidades y relaciones explícitas**, no solo texto. La arquitectura URL + schema.org + grafo interno deben ser coherentes entre sí.

### Estructura de URLs (canónica)

```
/                                          → Home del directorio
/en/                                       → Versión inglés
/en/peru/                                     → País
/en/peru/cusco/                               → Destino (City)
/en/peru/cusco/tours/                         → Categoría en destino
/en/peru/cusco/tours/explore-peru-tours/      → Ficha de empresa
/en/companies/[slug]                       → Ruta migrada (pendiente)
/en/ai-prompts/[slug]                      → Prompts para AI Search
```

**Regla:** máximo 3 clics desde home a cualquier ficha de empresa. Esto optimiza crawl budget para GPTBot y Gbot.

### Jerarquía de entidades schema.org

| Página | Tipo principal | Tipos secundarios |
|---|---|---|
| Home | `Organization` + `WebSite` | `ItemList` de destinos |
| Destino (`/en/peru/cusco/`) | `City` + `TouristDestination` | `BreadcrumbList`, `FAQPage` |
| Categoría (`/cusco/tours/`) | `ItemList` | `BreadcrumbList`, `FAQPage` |
| Ficha empresa | `TourOperator` o `TravelAgency` | `LocalBusiness`, `AggregateRating` |
| Prompt/Guía | `Article` | `FAQPage`, `BreadcrumbList` |

---

## 4. Implementación JSON-LD (Plantillas Listas)

### 4.1 Ficha de empresa (TourOperator + LocalBusiness)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": ["TourOperator", "LocalBusiness"],
  "name": "Explore Peru Tours",
  "url": "https://tourup.co/en/peru/cusco/tours/explore-peru-tours/",
  "description": "Operador receptivo en Cusco especializado en tours culturales y trekking para agencias emisoras nacionales e internacionales.",
  "telephone": "+51 84 123456",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Cusco",
    "addressRegion": "Cusco",
    "addressCountry": "PE"
  },
  "areaServed": [
    {"@type": "City", "name": "Cusco"},
    {"@type": "Place", "name": "Valle Sagrado"},
    {"@type": "Place", "name": "Machu Picchu"}
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Tours y servicios",
    "itemListElement": [
      {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "Full Day Cusco + Valle Sagrado"}},
      {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "Trekking Camino Inca 4D/3N"}}
    ]
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "156"
  },
  "additionalProperty": [
    {"@type": "PropertyValue", "name": "distribution_role", "value": "receptivo"},
    {"@type": "PropertyValue", "name": "verified", "value": "true"}
  ]
}
</script>
```

### 4.2 Página de categoría (ItemList + BreadcrumbList)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "TourUp", "item": "https://tourup.co/"},
        {"@type": "ListItem", "position": 2, "name": "Peru", "item": "https://tourup.co/en/peru/"},
        {"@type": "ListItem", "position": 3, "name": "Cusco", "item": "https://tourup.co/en/peru/cusco/"},
        {"@type": "ListItem", "position": 4, "name": "Tours in Cusco", "item": "https://tourup.co/en/peru/cusco/tours/"}
      ]
    },
    {
      "@type": "ItemList",
      "name": "Mejores operadores de tours en Cusco",
      "description": "Directorio verificado de operadores de tours en Cusco con ratings, especialidades y contacto directo para agencias.",
      "numberOfItems": 87,
      "itemListElement": [
        {"@type": "ListItem", "position": 1, "url": "https://tourup.co/en/peru/cusco/tours/explore-peru-tours/"},
        {"@type": "ListItem", "position": 2, "url": "https://tourup.co/en/peru/cusco/tours/inka-trail-adventures/"}
      ]
    }
  ]
}
</script>
```

### 4.3 FAQPage por destino (AEO — Answer Engine Optimization)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "¿Cuáles son los mejores operadores de tours en Cusco para agencias?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Los mejores operadores receptivos en Cusco para agencias emisoras incluyen especialistas en Camino Inca, Valle Sagrado y Machu Picchu. TourUp mantiene un directorio verificado con ratings por volumen de ventas, tiempo de respuesta y calidad de servicio."
      }
    },
    {
      "@type": "Question",
      "name": "¿Cómo verificar que un operador turístico en Peru es confiable?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Un operador confiable en Peru debe tener RUC vigente, licencia MINCETUR, reseñas verificadas y tiempo de respuesta menor a 2 horas. TourUp valida estos criterios antes de listar cualquier operador."
      }
    },
    {
      "@type": "Question",
      "name": "¿Cuánto cuesta un full day en Cusco para grupos de agencias?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Un full day en Cusco con circuito Valle Sagrado cuesta entre $45–$80 USD por persona en precio neto para agencias, dependiendo del operador y nivel de servicio (estándar o premium)."
      }
    }
  ]
}
</script>
```

---

## 5. HTML Semántico Base (Plantillas)

### 5.1 Category page: "Tours in Cusco"

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Tour Operators in Cusco for Travel Agencies | TourUp</title>
  <meta name="description" content="B2B directory of tour operators in Cusco: net rates, verified ratings, and direct contact. Built for outbound travel agencies." />
  <link rel="canonical" href="https://tourup.co/en/peru/cusco/tours/" />
</head>
<body>
  <header>
    <nav aria-label="Breadcrumb">
      <ol>
        <li><a href="/">TourUp</a></li>
        <li><a href="/en/peru/">Peru</a></li>
        <li><a href="/en/peru/cusco/">Cusco</a></li>
        <li aria-current="page">Tours in Cusco</li>
      </ol>
    </nav>
    <h1>Operadores de Tours in Cusco: directorio B2B verificado</h1>
    <p>87 inbound operators in Cusco with net rates for agencies, verified ratings, and direct contact.</p>
  </header>

  <main>
    <section aria-labelledby="tipos-tours">
      <h2 id="tipos-tours">What types of tours do operators in Cusco offer?</h2>
      <ul>
        <li>Sacred Valley + Machu Picchu full-day tours</li>
        <li>Inca Trail trekking (4D/3N and alternative routes)</li>
        <li>Cultural tours and city tours</li>
        <li>Community-based and rural tourism experiences</li>
        <li>Premium and luxury tours for VIP groups</li>
      </ul>
    </section>

    <section aria-labelledby="listado">
      <h2 id="listado">Verified operator directory</h2>
      <!-- Loop de <article> por operador -->
      <article>
        <h3><a href="/en/peru/cusco/tours/explore-peru-tours/">Explore Peru Tours</a></h3>
        <p>Inbound operator specialized in cultural tours and trekking. Replies in under 1 hour. Rating: 4.8/5.</p>
        <ul>
          <li>Destinations: Cusco, Sacred Valley, Machu Picchu</li>
          <li>Categories: Cultural, Trekking, Full Day</li>
          <li>Role: B2B inbound operator</li>
        </ul>
      </article>
    </section>

    <section aria-labelledby="faq">
      <h2 id="faq">Frequently asked questions for agencies</h2>
      <article>
        <h3>How do I get net rates as an agency?</h3>
        <p>Register on TourUp as a verified agency and access net rates directly in the directory, without intermediaries.</p>
      </article>
      <article>
        <h3>Does TourUp verify listed operators?</h3>
        <p>Yes. TourUp verifies tax ID, MINCETUR licenses, response time, and operating track record before listing any supplier.</p>
      </article>
    </section>
  </main>
</body>
</html>
```

---

## 6. Estrategia llms.txt y archivos /ai/

### 6.1 Estructura de `/llms.txt`

```markdown
# TourUp — B2B Peru Travel Marketplace

TourUp es el marketplace B2B líder de turismo en Peru. Conecta agencias emisoras con operadores receptivos y DMCs locales verificados, con foco en Cusco, Lima, Arequipa, Machu Picchu y destinos emergentes.

## Primary resources for language models

### Directory overview
- https://tourup.co/ai/overview.md

### Main destinations
- https://tourup.co/ai/peru-cusco.md
- https://tourup.co/ai/peru-lima.md
- https://tourup.co/ai/peru-arequipa.md
- https://tourup.co/ai/peru-machu-picchu.md
- https://tourup.co/ai/peru-puno.md
- https://tourup.co/ai/peru-amazonas.md

### Service categories
- https://tourup.co/ai/tours-trekking.md
- https://tourup.co/ai/tours-culturales.md
- https://tourup.co/ai/tours-lujo.md
- https://tourup.co/ai/tours-comunitarios.md
- https://tourup.co/ai/agencias-dmc.md

### Guides for agencies
- https://tourup.co/ai/como-trabajar-con-operadores-peru.md
- https://tourup.co/ai/validar-operadores-peru.md
- https://tourup.co/ai/precios-tours-peru-2026.md

## Usage notes
- /ai/*.md files are structured summaries optimized for agent consumption.
- For full company data, use the HTML profile linked from each .md file.
- Data refreshed every 30 days from the TourUp internal graph.
```

### 6.2 Ejemplo de `/ai/peru-cusco.md`

```markdown
# Cusco — B2B tour operator guide

Cusco es el principal destino receptivo de Peru. Concentra el mayor número de operadores especializados en trekking, Machu Picchu y experiencias culturales andinas.

## Key facts

- Verified operators on TourUp: 87
- Main categories: trekking, full day, cultural, luxury, community-based
- Average response time: < 2 hours
- Average net full-day rate: $45–$80 USD per traveler

## What types of operators are in Cusco?

- **B2B inbound operators:** serve outbound agencies and usually do not sell retail
- **Local DMCs:** design multi-destination custom itineraries
- **Trekking specialists:** Inca Trail, Salkantay, Ausangate, Choquequirao
- **Premium operators:** VIP groups, luxury services, bilingual guides

## Destinations covered from Cusco as a hub

- Machu Picchu y Aguas Calientes
- Valle Sagrado (Pisac, Ollantaytambo, Moray)
- Camino Inca y rutas alternativas
- Chinchero, Maras, salineras
- Comunidades de Pisac y Chinchero

## Frequently asked questions for agencies

### How much does a Sacred Valley full-day tour cost for groups?
A Sacred Valley full-day tour with transport, guide, and tickets costs about $45–$65 USD per traveler in net agency rates for volume buyers. Premium operators charge around $80–$120 USD per traveler.

### How do you choose between an inbound operator and a DMC in Cusco?
An inbound operator runs specific services such as transfers, full days, and trekking. A DMC designs the full multi-destination itinerary. For agencies with defined groups and programs, inbound operators are usually more price-efficient.

### What documents should a verified operator in Cusco have?
An active tax ID, MINCETUR travel license, liability insurance, and Inca Trail permit authorization when relevant.

## Featured operator directory

See the full directory: https://tourup.co/en/peru/cusco/tours/
```

---

## 7. Configuración Técnica para Crawlers de IA

### 7.1 robots.txt

```txt
User-agent: *
Disallow: /admin/
Disallow: /api/private/
Allow: /

# Permitir todos los crawlers de IA explícitamente
User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot
Allow: /

User-agent: PerplexityBot
Allow: /

Sitemap: https://tourup.co/sitemap-index.xml
Sitemap: https://tourup.co/sitemap-companies.xml
Sitemap: https://tourup.co/sitemap-destinos.xml
Sitemap: https://tourup.co/sitemap-prompts.xml
```

### 7.2 Sitemaps segmentados

Mantener sitemaps separados por tipo de contenido permite que los crawlers prioricen correctamente:

- `sitemap-index.xml` — índice maestro
- `sitemap-companies.xml` — fichas de las ~985 empresas
- `sitemap-destinos.xml` — páginas de destino (ciudad, región)
- `sitemap-prompts.xml` — páginas de prompts/guías editoriales

---

## 8. Próximos Pasos Priorizados

### Fase 1 — Grafo (urgente)

- [ ] **Normalizar `brands_ai_mentions`** a formato `{entity_type, entity_slug}` en los 102 prompts → edges 100% determinísticos
- [ ] **Expandir catálogo de destinos** de 15 a ~40–50 nodos (Arequipa, Lima, Puno, Amazonas, Trujillo, Ica, Chachapoyas, Colca, etc.)
- [ ] **Expandir catálogo de categorías** de 4 a ~15–20 (aventura, lujo, familia, comunitario, trekking, gastronómico, birdwatching, religioso, etc.)
- [ ] **Agregar `distribution_role` como atributo de nodo** en el grafo (receptivo, emisor, dmc, mayorista)
- [ ] Regenerar `build_graph.py` y verificar edges cross-collection

### Fase 2 — Contenido AI Search

- [ ] **Implementar JSON-LD** en todas las páginas de companies y prompts (ver plantillas sección 4)
- [ ] **Crear archivos `/ai/*.md`** por destino (empezar con Cusco, Lima, Arequipa, Machu Picchu)
- [ ] **Crear `/llms.txt`** en el dominio raíz (ver sección 6.1)
- [ ] **Añadir sección FAQPage** en páginas de destino y categoría (ver plantillas sección 4.3)
- [ ] Configurar HTML semántico en templates de Astro (ver plantillas sección 5)

### Fase 3 — URLs e i18n

- [ ] Migrar `/companies/[slug]` → `/en/companies/[slug]`
- [ ] Verificar `hreflang` en páginas en español e inglés
- [ ] Asegurar `canonical` correcto en todas las páginas

### Fase 4 — Travel Media y Agente B2B

- [ ] Conectar grafo con agente Partner Scout (Journey 5)
- [ ] Implementar "Ficha de Confianza B2B" por operador (Journey 4)
- [ ] Instrumentar comportamiento de agencias para personalización (Travel Media)

---

## 9. Modelo de Negocio Alineado con AI Search

| Canal | Monetización | Relación con AI Search |
|---|---|---|
| Agencias emisoras | Gratis (gancho de adopción) | Son el usuario que llega desde ChatGPT/Gemini |
| Operadores receptivos | Suscripción mensual por visibilidad | Su ficha bien optimizada es la que aparece en AI Search |
| DMCs / mayoristas | Suscripción + lead fees | Ficha + JSON-LD + categoría expande su visibilidad |
| Travel Media | Operadores pagan por aparecer primero ante agencias relevantes | Datos de comportamiento del grafo alimentan el targeting |

---

## 10. Principios del Agente de Contenido

Cuando este archivo se use como contexto para un agente de contenido, el agente debe:

1. **Priorizar relaciones explícitas** sobre texto descriptivo — siempre conectar empresa → destino → categoría en el frontmatter
2. **Usar vocabulario controlado** — destinos y categorías deben ser slugs del catálogo oficial, nunca texto libre
3. **Generar FAQ orientadas a respuesta directa** — formato pregunta + respuesta de 1–3 frases, sin rodeos
4. **Incluir JSON-LD en cada página generada** usando las plantillas de la sección 4
5. **Evitar dependencias de JS** para contenido principal — todo lo que deba indexar GPTBot debe estar en el HTML estático
6. **Mantener coherencia grafo ↔ URL ↔ schema.org** — el slug de la empresa en el frontmatter debe coincidir exactamente con su URL y con el `@id` en JSON-LD

---

*Documento vivo. Actualizar cada vez que cambie el schema del grafo, se expandan catálogos de destinos/categorías o se implementen nuevas páginas de contenido.*
