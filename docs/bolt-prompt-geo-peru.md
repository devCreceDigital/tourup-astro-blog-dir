# Bolt.new — Open Spec: GEO Blog Agéntico para Turismo en Perú
## Stack: Astro 4 · TypeScript · Tailwind CSS · Anthropic API

---

## 1. Objetivo del proyecto

Construir un sitio de contenido turístico para Perú con **generación agéntica de páginas GEO** (Generative Engine Optimization). El agente recibe variables de entrada y produce HTML semántico listo para publicar en Astro como página estática. El sitio está optimizado para ser citado por ChatGPT, Gemini y Perplexity.

---

## 2. Stack técnico

| Capa | Tecnología |
|---|---|
| Framework | Astro 4 (output: static + SSR híbrido) |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS v3 |
| LLM | Anthropic API (`claude-sonnet-4-6`) |
| Schema.org | JSON-LD manual en cada layout |
| Despliegue | Vercel / Netlify (adapter según destino) |

---

## 3. Estructura de archivos

```
/
├── src/
│   ├── pages/
│   │   ├── index.astro                        ← Homepage
│   │   ├── peru/
│   │   │   ├── index.astro                    ← /peru/ (guía país)
│   │   │   ├── cusco/
│   │   │   │   ├── index.astro                ← /peru/cusco/
│   │   │   │   └── tours-machu-picchu.astro   ← /peru/cusco/tours-machu-picchu/
│   │   │   ├── lima/
│   │   │   │   └── index.astro                ← /peru/lima/
│   │   │   ├── arequipa/
│   │   │   │   └── index.astro                ← /peru/arequipa/
│   │   │   ├── itinerario-7-dias.astro        ← /peru/itinerario-7-dias/
│   │   │   ├── itinerario-10-dias.astro       ← /peru/itinerario-10-dias/
│   │   │   └── preguntas-frecuentes-viajar-a-peru.astro
│   │   └── tours/
│   │       └── [slug].astro                   ← /tours/[slug]/
│   ├── layouts/
│   │   ├── BaseLayout.astro                   ← head, nav, footer, schema
│   │   └── PageLayout.astro                   ← main wrapper con breadcrumb
│   ├── components/
│   │   ├── GeoContent.astro                   ← renderiza HTML generado
│   │   ├── SchemaOrg.astro                    ← JSON-LD según tipo_pagina
│   │   ├── Breadcrumb.astro
│   │   ├── TourCard.astro
│   │   ├── FaqBlock.astro
│   │   └── SidebarLinks.astro
│   ├── lib/
│   │   ├── geoAgent.ts                        ← llama a Anthropic API
│   │   ├── systemPrompt.ts                    ← system prompt completo GEO
│   │   ├── pageTypes.ts                       ← tipos TypeScript
│   │   └── schemaTemplates.ts                 ← plantillas JSON-LD
│   └── content/
│       └── pages/                             ← colección de Astro Content
│           ├── cusco.json
│           ├── lima.json
│           └── machu-picchu-tours.json
├── public/
│   └── robots.txt
├── astro.config.mjs
├── tailwind.config.mjs
└── .env                                       ← ANTHROPIC_API_KEY
```

---

## 4. Variables de entorno

```env
ANTHROPIC_API_KEY=sk-ant-...
```

---

## 5. Tipos TypeScript (`src/lib/pageTypes.ts`)

```typescript
export type TipoPagina =
  | "destino"
  | "mejores_tours"
  | "ciudad_entrada"
  | "tour_individual"
  | "itinerario_dias"
  | "faqs_peru";

export interface GeoPageInput {
  tipo_pagina: TipoPagina;
  destino: string;
  url: string;
  anio_referencia: string;
  datos_contexto?: string;
}

export interface GeoPageOutput {
  html: string;
  h1: string;
  meta_description: string;
}
```

---

## 6. System prompt (`src/lib/systemPrompt.ts`)

```typescript
export const SYSTEM_PROMPT = `
Rol:
Eres un experto en GEO (Generative Engine Optimization), AEO y SEO técnico
para sitios turísticos construidos con Astro (SSR/HTML estático). Tu objetivo
es generar contenido listo para producción que sea:
- Fácil de citar por ChatGPT, Gemini y otros motores de respuesta.
- Fácil de rastrear por bots (HTML semántico, sin JS innecesario).
- Claro para el usuario final que quiere viajar a Perú.

Instrucciones generales:
- Escribe SIEMPRE en español neutro.
- Usa tono experto pero cercano, evitando adjetivos vacíos.
- Usa frases claras orientadas a "answer nuggets" que los modelos de IA puedan
  leer casi literal.
- No inventes datos sensibles (precios exactos, restricciones oficiales).
- Respeta exactamente la estructura H1/H2/H3 indicada para cada tipo_pagina.
- No añadas secciones extra fuera de la plantilla.

Salida:
- Devuelve ÚNICAMENTE un objeto JSON con esta forma exacta:
  { "html": "...", "h1": "...", "meta_description": "..." }
- El campo "html" contiene solo el contenido del <main>: etiquetas
  <h1>–<h3>, <p>, <ul>, <ol>, <table>. Sin <html>, <head>, <body>.
- Una sola etiqueta <h1> por página.
- El campo "meta_description" tiene entre 140 y 160 caracteres.

[PLANTILLAS POR TIPO DE PÁGINA — ver documentación completa en /src/lib/systemPrompt.ts]

tipo_pagina = "destino":
  H1: "Viajar a {destino}: guía completa para planificar tu viaje a Perú"
  H2 en orden: Resumen rápido | Cuándo visitar (H3: temporadas, H3: clima) |
  Qué ver/hacer (H3: imprescindibles, H3: excursiones) | Cuántos días
  (H3: 2-3d, H3: 4-5d, H3: extendido) | Presupuesto (H3: niveles) |
  Consejos altura/salud (H3: mal de altura, H3: seguridad) |
  Mejores tours | FAQs (≥7, respuestas 1-3 frases)

tipo_pagina = "mejores_tours":
  H1: "Mejores tours a {destino} desde {ciudad_base} ({anio})"
  H2: Qué tour elegir | Top tours (tabla) | Cómo funciona la entrada |
  Consejos (H3: grupal vs privado, H3: transporte) | FAQs

tipo_pagina = "ciudad_entrada":
  H1: "{ciudad}, puerta de entrada a Perú: qué hacer antes y después de tu viaje"
  H2: Resumen | Qué ver en 1/2/3 días | Barrios alojamiento |
  Ruta gastronómica | Cómo combinar | FAQs + aeropuerto

tipo_pagina = "tour_individual":
  H1: "Tour a {destino} full day desde {ciudad_base}"
  H2: Resumen | Itinerario detallado | Incluye/no incluye |
  Dificultad y requisitos | Precios/cancelación | FAQs

tipo_pagina = "itinerario_dias":
  H1: "Itinerario de {n} días por Perú: {destinos principales}"
  H2: Para quién | Día a día (H3 por día) | Presupuesto | Variantes | FAQs

tipo_pagina = "faqs_peru":
  H1: "Preguntas frecuentes sobre viajar a Perú"
  H2: Entrada/visados/vacunas | Seguridad/transporte |
  Dinero/tarjetas | Propinas/costumbres | Seguro de viaje
`;
```

---

## 7. Agente GEO (`src/lib/geoAgent.ts`)

```typescript
import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "./systemPrompt";
import type { GeoPageInput, GeoPageOutput } from "./pageTypes";

const client = new Anthropic({
  apiKey: import.meta.env.ANTHROPIC_API_KEY,
});

export async function generateGeoPage(
  input: GeoPageInput
): Promise<GeoPageOutput> {
  const userMessage = `
tipo_pagina: ${input.tipo_pagina}
destino: ${input.destino}
url: ${input.url}
anio_referencia: ${input.anio_referencia}
${input.datos_contexto ? `datos_contexto:\n${input.datos_contexto}` : ""}

Genera el contenido GEO completo para esta página.
`.trim();

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const raw = response.content[0].type === "text"
    ? response.content[0].text
    : "";

  const clean = raw.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(clean) as GeoPageOutput;
  return parsed;
}
```

---

## 8. Colección de contenido Astro (`src/content/pages/cusco.json`)

```json
{
  "tipo_pagina": "destino",
  "destino": "Cusco",
  "url": "/peru/cusco/",
  "anio_referencia": "2026",
  "datos_contexto": "- Temporada seca: mayo–octubre (mejor época)\n- Temporada lluviosa: noviembre–abril\n- Altitud: 3,400 msnm (aclimatarse 24–48h)\n- Principal puerta de entrada a Machu Picchu\n- Aeropuerto Alejandro Velasco Astete (CUZ)"
}
```

---

## 9. Página Astro (`src/pages/peru/cusco/index.astro`)

```astro
---
import BaseLayout from "@/layouts/BaseLayout.astro";
import PageLayout from "@/layouts/PageLayout.astro";
import GeoContent from "@/components/GeoContent.astro";
import SchemaOrg from "@/components/SchemaOrg.astro";
import SidebarLinks from "@/components/SidebarLinks.astro";
import { generateGeoPage } from "@/lib/geoAgent";
import cuscoData from "@/content/pages/cusco.json";

const page = await generateGeoPage(cuscoData);
---

<BaseLayout
  title={page.h1}
  description={page.meta_description}
  canonical="/peru/cusco/"
>
  <SchemaOrg
    tipo={cuscoData.tipo_pagina}
    destino={cuscoData.destino}
    url={cuscoData.url}
  />
  <PageLayout breadcrumb={["Inicio", "Perú", "Cusco"]}>
    <GeoContent html={page.html} />
    <SidebarLinks
      slot="sidebar"
      links={[
        { label: "Tours en Cusco", href: "/peru/cusco/tours/" },
        { label: "Tours a Machu Picchu", href: "/peru/cusco/tours-machu-picchu/" },
        { label: "Itinerario 10 días", href: "/peru/itinerario-10-dias/" },
      ]}
    />
  </PageLayout>
</BaseLayout>
```

---

## 10. Componente GeoContent (`src/components/GeoContent.astro`)

```astro
---
interface Props { html: string; }
const { html } = Astro.props;
---

<article
  class="prose prose-neutral max-w-none"
  set:html={html}
/>
```

---

## 11. SchemaOrg (`src/components/SchemaOrg.astro`)

```astro
---
import { buildSchema } from "@/lib/schemaTemplates";
interface Props { tipo: string; destino: string; url: string; }
const { tipo, destino, url } = Astro.props;
const schema = buildSchema(tipo, destino, url);
---

<script type="application/ld+json" set:html={JSON.stringify(schema)} />
```

---

## 12. Plantillas Schema.org (`src/lib/schemaTemplates.ts`)

```typescript
export function buildSchema(tipo: string, destino: string, url: string) {
  const base = { "@context": "https://schema.org" };
  const fullUrl = `https://tusitio.com${url}`;

  const schemas: Record<string, object> = {
    destino: {
      ...base,
      "@type": "TouristDestination",
      name: destino,
      url: fullUrl,
      touristType: ["Adventure", "Cultural", "Heritage"],
    },
    mejores_tours: {
      ...base,
      "@type": "ItemList",
      name: `Mejores tours a ${destino}`,
      url: fullUrl,
    },
    ciudad_entrada: {
      ...base,
      "@type": "City",
      name: destino,
      url: fullUrl,
    },
    tour_individual: {
      ...base,
      "@type": "Product",
      name: `Tour a ${destino}`,
      url: fullUrl,
      category: "Tour",
    },
    itinerario_dias: {
      ...base,
      "@type": "Trip",
      name: `Itinerario por ${destino}`,
      url: fullUrl,
    },
    faqs_peru: {
      ...base,
      "@type": "FAQPage",
      name: "Preguntas frecuentes sobre viajar a Perú",
      url: fullUrl,
    },
  };

  return schemas[tipo] ?? { ...base, "@type": "WebPage", url: fullUrl };
}
```

---

## 13. `astro.config.mjs`

```javascript
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel/serverless";

export default defineConfig({
  output: "server",
  adapter: vercel(),
  integrations: [tailwind()],
  site: "https://tusitio.com",
});
```

---

## 14. URLs canónicas a implementar

| Ruta | tipo_pagina | Destino |
|---|---|---|
| `/peru/` | destino | Perú |
| `/peru/cusco/` | destino | Cusco |
| `/peru/cusco/tours-machu-picchu/` | mejores_tours | Machu Picchu |
| `/peru/lima/` | ciudad_entrada | Lima |
| `/peru/arequipa/` | destino | Arequipa |
| `/peru/itinerario-7-dias/` | itinerario_dias | Perú |
| `/peru/itinerario-10-dias/` | itinerario_dias | Perú |
| `/peru/preguntas-frecuentes-viajar-a-peru/` | faqs_peru | Perú |
| `/tours/cusco-machu-picchu-full-day/` | tour_individual | Machu Picchu |

---

## 15. Checklist de implementación

- [ ] Inicializar proyecto con `npm create astro@latest`
- [ ] Instalar dependencias: `@astrojs/tailwind`, `@anthropic-ai/sdk`, `@astrojs/vercel`
- [ ] Copiar `SYSTEM_PROMPT` completo a `src/lib/systemPrompt.ts`
- [ ] Crear archivos `.json` de contenido en `src/content/pages/`
- [ ] Implementar `geoAgent.ts` con manejo de errores y caché
- [ ] Crear layouts `BaseLayout.astro` y `PageLayout.astro`
- [ ] Implementar `SchemaOrg.astro` con JSON-LD
- [ ] Crear todas las páginas en `src/pages/peru/`
- [ ] Configurar `robots.txt` y `sitemap.xml`
- [ ] Añadir `ANTHROPIC_API_KEY` en variables de entorno
- [ ] Deploy a Vercel o Netlify

---

## 16. Notas de implementación

- El agente se llama en **build time** (getStaticPaths o top-level await en Astro).
  Las páginas se sirven como HTML estático: sin latencia de API en producción.
- Para regenerar una página, re-deployar el sitio o usar ISR (Incremental Static
  Regeneration) si el adapter lo soporta.
- Caché recomendada: guardar el output del agente en un archivo `.json` local y
  leerlo primero; solo llamar a la API si no existe o tiene más de N días.
- El `set:html` de Astro sanitiza el HTML del agente antes de renderizarlo.
