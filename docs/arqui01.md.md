
diseñar un wireframe estándar de “AI Prompt Landing Page” que puedas instanciar para cada prompt (fila) y enchufar directo a Astro + tu grafo.�
Voy a usar como ejemplo el prompt nº1 del primer CSV:
“Best tour companies for Machu Picchu trips from the US” con brands: Alpaca Expeditions, REI Adventures, Intrepid Travel, SAM Travel Peru, Adventures by Disney.�
Puedes aplicar el mismo patrón al resto de prompts.
1. Frontmatter / nodo del grafo para cada prompt
Archivo tipo: content/prompts/best-machu-picchu-tours-from-us.md
---
type: "prompt_landing"
slug: "/en/peru/machu-picchu/best-tour-companies-from-us/"
title: "Best tour companies for Machu Picchu trips from the US"
lang: "en"
search_term: "peru tour companies"
ai_platforms:
  - "ChatGPT"
prompt_text: "Best tour companies for Machu Picchu trips from the US"
primary_intent: "Commercial"
secondary_intent: "Informational"
destination_cluster: "Cusco, Machu Picchu"
category_cluster: "tour_operator"
brands_ai_mentions:
  - "Alpaca Expeditions"
  - "REI Adventures"
  - "Intrepid Travel"
  - "SAM Travel Peru"
  - "Adventures by Disney"
summary: "Independent overview of the best tour companies for Machu Picchu trips from the US, based on itinerary quality, safety standards, and past traveler reviews."
parent: "/en/peru/machu-picchu/"
---
Ese nodo se conecta en tu grafo:
parent → página de destino (/en/peru/machu-picchu/).
brands_ai_mentions → lista de entidades que enlazarás a sus fichas (si las tienes) o a webs externas.
2. HTML semántico (estructura de secciones)
Ejemplo como plantilla Astro (src/pages/en/peru/machu-picchu/best-tour-companies-from-us.astro), pero el HTML es estándar:
---
import Layout from "../../../../../layouts/Layout.astro";
import type { APIContext } from "astro";
import { getEntryBySlug } from "astro:content";

// Cargar frontmatter de la landing de prompt
const page = await getEntryBySlug("prompts", "best-machu-picchu-tours-from-us");

// Idealmente traer también las companies de tu grafo/collections
// aquí lo simplifico con un array fijo a modo de wireframe:
const featuredBrands = [
  {
    name: "Alpaca Expeditions",
    slug: "/company/alpaca-expeditions",
    role: "Peruvian inbound tour operator",
    focus: "Small-group trekking and classic Machu Picchu tours",
    channel: "online",
    goodFor: "Active travelers from the US looking for guided trekking"
  },
  {
    name: "REI Adventures",
    slug: "https://www.rei.com/adventures",
    role: "US-based adventure travel company",
    focus: "Guided group adventure itineraries including Peru",
    channel: "online",
    goodFor: "US travelers who prefer to book with a US brand"
  },
  // ...y así con Intrepid Travel, SAM Travel Peru, Adventures by Disney
];
---

<Layout title={page.data.title} description={page.data.summary}>
  <main>
    <!-- Hero / Answer summary -->
    <header>
      <h1>{page.data.title}</h1>
      <p>
        Planning a Machu Picchu trip from the US? Below you&apos;ll find a curated list of
        trusted tour operators that combine safe logistics, knowledgeable local guides,
        and clear booking policies.
      </p>
    </header>

    <!-- Quick answer section -->
    <section aria-label="Quick answer">
      <h2>Quick answer</h2>
      <p>
        Some of the most frequently recommended tour companies for Machu Picchu trips from the US
        include Alpaca Expeditions, REI Adventures, Intrepid Travel, SAM Travel Peru, and Adventures
        by Disney. Each of them offers guided itineraries with reliable logistics, English-speaking
        guides, and clear cancellation policies.
      </p>
    </section>

    <!-- Brand list / ItemList -->
    <section aria-label="Featured Machu Picchu tour companies">
      <h2>Featured Machu Picchu tour companies</h2>
      <ol>
        {featuredBrands.map((brand) => (
          <li>
            <article>
              <h3>
                {brand.slug.startsWith("http")
                  ? <a href={brand.slug}>{brand.name}</a>
                  : <a href={brand.slug}>{brand.name}</a>}
              </h3>
              <p><strong>Role:</strong> {brand.role}</p>
              <p><strong>Main focus:</strong> {brand.focus}</p>
              <p><strong>Sales channel:</strong> {brand.channel}</p>
              <p><strong>Best for:</strong> {brand.goodFor}</p>
            </article>
          </li>
        ))}
      </ol>
    </section>

    <!-- Comparison table -->
    <section aria-label="Comparison table">
      <h2>Compare Machu Picchu tour companies</h2>
      <table>
        <thead>
          <tr>
            <th>Company</th>
            <th>Base</th>
            <th>Trip style</th>
            <th>Group size</th>
            <th>Good for</th>
          </tr>
        </thead>
        <tbody>
          {featuredBrands.map((brand) => (
            <tr>
              <td>{brand.name}</td>
              <td>{/* Cusco / US / Global, según tu data */}</td>
              <td>{/* e.g. Small-group trekking */}</td>
              <td>{/* e.g. Small groups (max 12) */}</td>
              <td>{brand.goodFor}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>

    <!-- How to choose section -->
    <section aria-label="How to choose a Machu Picchu tour company">
      <h2>How to choose a Machu Picchu tour company from the US</h2>
      <p>
        When comparing operators, focus on safety records, guide quality, group size,
        and how clearly they communicate what&apos;s included (permits, trains, porters,
        hotels, and meals). Look for recent reviews from travelers with a similar profile to yours.
      </p>
      <ul>
        <li>Check that permits and tickets for Machu Picchu and trains are included.</li>
        <li>Look for English-speaking guides with strong local knowledge.</li>
        <li>Review cancellation and rescheduling policies in detail.</li>
        <li>Compare group size and accommodation standards across operators.</li>
      </ul>
    </section>

    <!-- FAQ section -->
    <section aria-label="Frequently asked questions">
      <h2>Frequently asked questions</h2>

      <article>
        <h3>How far in advance should I book a Machu Picchu tour?</h3>
        <p>
          For high season dates (June–August) and Inca Trail permits, booking 4–6 months in advance is recommended.
          For shoulder season, 2–3 months is often enough.
        </p>
      </article>

      <article>
        <h3>Is it better to book with a US-based company or a local Peruvian operator?</h3>
        <p>
          US-based brands can offer familiar customer service and payment options, while local operators
          may provide more flexible itineraries and better on-the-ground expertise. Many travelers compare both
          and choose based on reviews, inclusions, and overall value.
        </p>
      </article>

      <article>
        <h3>Are Machu Picchu tours suitable for first-time international travelers?</h3>
        <p>
          Yes, as long as you choose an operator with clear pre-departure guidance, acclimatization days in Cusco,
          and 24/7 support during the trip.
        </p>
      </article>
    </section>
  </main>
</Layout>
Este wireframe:
Responde rápido la intención comercial/informacional del prompt.�
Pone las brands mencionadas por los modelos en una lista y una tabla comparativa, fácil de citar.�
3. JSON-LD para esta página (WebPage + ItemList + FAQPage)
Metes este bloque en la página (Astro) dentro de <head> o justo antes de </body>:
---
const pageUrl = "https://tudominio.com/en/peru/machu-picchu/best-tour-companies-from-us/";
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": pageUrl,
      "url": pageUrl,
      "name": page.data.title,
      "inLanguage": "en",
      "description": page.data.summary,
      "isPartOf": {
        "@type": "WebSite",
        "@id": "https://tudominio.com/#website",
        "name": "Peru Tour Companies Directory",
        "url": "https://tudominio.com/"
      }
    },
    {
      "@type": "ItemList",
      "@id": pageUrl + "#recommended-tour-companies",
      "name": "Recommended Machu Picchu tour companies for travelers from the US",
      "itemListElement": featuredBrands.map((brand, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": brand.name,
        "url": brand.slug.startsWith("http")
          ? brand.slug
          : "https://tudominio.com" + brand.slug
      }))
    },
    {
      "@type": "FAQPage",
      "@id": pageUrl + "#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How far in advance should I book a Machu Picchu tour?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "For high season dates (June–August) and Inca Trail permits, booking 4–6 months in advance is recommended. For shoulder season, 2–3 months is often enough."
          }
        },
        {
          "@type": "Question",
          "name": "Is it better to book with a US-based company or a local Peruvian operator?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "US-based brands can offer familiar customer service and payment options, while local operators may provide more flexible itineraries and better on-the-ground expertise."
          }
        },
        {
          "@type": "Question",
          "name": "Are Machu Picchu tours suitable for first-time international travelers?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, as long as you choose an operator with clear pre-departure guidance, acclimatization in Cusco, and 24/7 support during the trip."
          }
        }
      ]
    }
  ]
};
---

<script type="application/ld+json">
  {JSON.stringify(jsonLd)}
</script>
Esto le dice a Googlebot/GPTBot/ClaudeBot:�
Esta página es una respuesta consolidada (WebPage) sobre un tema muy específico.
Contiene una lista explícita de compañías recomendadas (ItemList), que coincide con las marcas que ya ves en los CSV.�
Incluye FAQPage, que los answer engines usan mucho para extraer respuestas.�
4. Cómo conectar esto con tu grafo
En tu modelo:
Nodo prompt_landing (frontmatter de arriba).
Para cada brands_ai_mentions, idealmente un enlace a:
una ficha propia (/company/alpaca-expeditions), si la tienes; o
un nodo external_brand con url externa (TourRadar, TravelStride, etc.).
Las relaciones quedarían:
PromptLanding → Company (edge: recommends o mentions).
Company → PromptLanding (backlink natural en Obsidian/Graphify).
Graphify verá este subgrafo “prompt → lista de marcas” y tus agentes podrán, por ejemplo:
actualizar rankings,
generar nuevas landings para otros prompts de los CSV,
detectar qué brands salen más veces en AI models.�
5. Reutilizar el wireframe para los demás prompts
Para otro prompt del CSV, por ejemplo:
“Affordable Peru tour operators with good reviews” + brands: Inkayni Peru Tours, Kantu Peru Tours, TreXperience, Waman Adventures, Peru For Less, Alpaca Expeditions.�
Solo cambias:
slug, title, prompt_text, primary_intent, secondary_intent, brands_ai_mentions en el frontmatter.
El texto de Quick answer y 2–3 frases clave.
El array featuredBrands con las compañías relevantes.
La estructura de secciones y el JSON-LD (WebPage + ItemList + FAQPage) es la misma.