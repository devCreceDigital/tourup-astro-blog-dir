# Skill: TourUp AI Search Prompt Ingestion

## PropÃ³sito

Esta skill sirve para convertir archivos CSV de prompts de IA en contenido estructurado y utilizable por el grafo de TourUp, de forma consistente con una estrategia de marketplace B2B optimizado para AI Search.

Se usa cuando el objetivo es:

- ingerir CSVs de prompts de ChatGPT, Gemini, Claude o Perplexity,
- transformarlos en archivos src/content/prompts/*.md,
- mapearlos a entidades del grafo (company, destino, categoria, external_brand),
- generar contenido indexable por GPTBot, Gbot, ClaudeBot y otros crawlers,
- mantener coherencia entre frontmatter, URLs, schema.org y grafo interno.

---

## QuÃ© problema resuelve

Sin una skill clara, el flujo suele romperse en tres puntos:

1. el CSV queda como dato suelto sin convertirse en contenido reutilizable,
2. los prompts se guardan como texto libre sin relaciones estructuradas,
3. el contenido generado no queda alineado con el grafo ni con AI Search.

Esta skill fuerza un pipeline comÃºn y repetible.

---

## Resultado esperado

Al usar esta skill, cada fila del CSV debe terminar convertida en:

1. un *nodo prompt* estructurado,
2. un archivo Markdown en src/content/prompts/,
3. relaciones explÃ­citas con destino, categoria, company y external_brand,
4. una base lista para generar una pÃ¡gina HTML/SSR en inglÃ©s por defecto,
5. una pieza de contenido usable por el agente de TourUp.

---

## Entradas esperadas

### Entrada mÃ­nima

Un CSV con columnas como:

- TÃ©rmino de bÃºsqueda
- Plataforma
- Prompt
- IntenciÃ³n primaria
- IntenciÃ³n secundaria
- Marcas

### Entrada ideal

AdemÃ¡s del CSV, esta skill asume acceso a:

- catÃ¡logo oficial de destinos,
- catÃ¡logo oficial de categorias,
- catÃ¡logo de external_brands,
- inventario companies/*.md,
- reglas de slugs canÃ³nicos,
- graph.json o consulta equivalente al grafo interno.

---

## Reglas base de la skill

1. *El inglÃ©s es el idioma por defecto* para prompts y pÃ¡ginas orientadas a AI Search.
2. *El dominio canÃ³nico es tourup.co*.
3. Toda relaciÃ³n debe guardarse con objetos estructurados, nunca como texto libre:

yaml
- entity_type: company
  entity_slug: explore-peru-tours


4. El CSV *no genera el contenido final por sÃ­ solo*; primero genera estructura.
5. El contenido principal debe ser indexable sin depender de JavaScript.
6. Toda salida debe quedar alineada con:
   - el grafo,
   - los slugs,
   - las URLs,
   - y el JSON-LD.

---

## Flujo paso a paso

## Paso 1 â€” Leer y validar el CSV

### Objetivo

Asegurarse de que el archivo tenga las columnas necesarias antes de iniciar la transformaciÃ³n.

### QuÃ© hacer

- Verificar encoding UTF-8.
- Detectar separador correcto.
- Confirmar presencia de estas columnas mÃ­nimas:
  - Prompt
  - Plataforma
  - IntenciÃ³n primaria
- Normalizar nombres de columnas si vienen con variantes.

### Salida de este paso

Un dataset limpio listo para mapear.

---

## Paso 2 â€” Normalizar cada fila

### Objetivo

Transformar cada fila del CSV en un objeto estÃ¡ndar de TourUp.

### QuÃ© hacer por fila

- Crear slug desde Prompt.
- Mapear Plataforma a enum canÃ³nico (chatgpt, gemini, claude, perplexity).
- Convertir IntenciÃ³n primaria y IntenciÃ³n secundaria a taxonomÃ­a interna:
  - commercial
  - informational
  - navigational
  - transactional
- Parsear Marcas como lista.
- Limpiar caracteres raros, comillas, espacios dobles y puntuaciÃ³n redundante.

### Ejemplo de salida intermedia

yaml
prompt_text: "Best guided tours to explore Machu Picchu from the US"
slug: best-guided-tours-machu-picchu-from-us
platform: chatgpt
primary_intent: commercial
secondary_intent: informational
raw_brands:
  - Intrepid Travel
  - TourRadar
  - Alpaca Expeditions


---

## Paso 3 â€” Inferir entidades

### Objetivo

Traducir texto libre del prompt a entidades del grafo.

### QuÃ© hacer

Inferir y mapear:

- *Destinos*: Machu Picchu, Cusco, Peru, Nazca, Lake Titicaca, Amazon, etc.
- *CategorÃ­as*: trekking, luxury, family, cultural, full-day, all-inclusive, photography, sustainable, etc.
- *Brands externas*: TourRadar, Intrepid Travel, Road Scholar, etc.

### Regla crÃ­tica

Todo debe resolverse a *slugs canÃ³nicos*.

### Ejemplo

yaml
destinos:
  - entity_type: destino
    entity_slug: machu-picchu
  - entity_type: destino
    entity_slug: cusco

categorias:
  - entity_type: categoria
    entity_slug: trekking
  - entity_type: categoria
    entity_slug: multi-day-tours

brands_ai_mentions:
  - entity_type: external_brand
    entity_slug: tourradar
  - entity_type: external_brand
    entity_slug: intrepid-travel


---

## Paso 4 â€” Crear frontmatter del prompt

### Objetivo

Generar un archivo prompt consistente con el schema del proyecto.

### Plantilla recomendada

md
---
slug: best-guided-tours-machu-picchu-from-us
title: "Best guided tours to explore Machu Picchu from the US"
language: en
search_term: "tour peru"
llm_platform: chatgpt
primary_intent: commercial
secondary_intent: informational
destinos:
  - entity_type: destino
    entity_slug: machu-picchu
  - entity_type: destino
    entity_slug: cusco
categorias:
  - entity_type: categoria
    entity_slug: trekking
  - entity_type: categoria
    entity_slug: multi-day-tours
brands_ai_mentions:
  - entity_type: external_brand
    entity_slug: tourradar
  - entity_type: external_brand
    entity_slug: intrepid-travel
---

# Best guided tours to explore Machu Picchu from the US


### Regla

En esta fase no se redacta todavÃ­a el cuerpo completo, solo se deja la base estructural correcta.

---

## Paso 5 â€” Conectar el prompt con el grafo

### Objetivo

Usar el frontmatter para crear edges reales, no inferencias frÃ¡giles.

### QuÃ© relaciones deben crearse

- prompt -> destino
- prompt -> categoria
- prompt -> external_brand
- prompt -> company (cuando aplique y estÃ© resuelto explÃ­citamente)

### RecomendaciÃ³n

Evitar name-matching cuando sea posible. Si el sistema necesita inferencia, debe hacerlo una sola vez y persistir el resultado estructurado en el archivo.

---

## Paso 6 â€” Generar el contenido

### Objetivo

Convertir el prompt estructurado en una pÃ¡gina Ãºtil para AI Search.

### CÃ³mo debe trabajar el agente de contenido

El agente debe:

1. leer el frontmatter del prompt,
2. consultar el grafo para encontrar companies relevantes,
3. priorizar operadores alineados con destino + categorÃ­a + intenciÃ³n,
4. generar una pÃ¡gina en inglÃ©s con:
   - respuesta directa arriba,
   - comparaciÃ³n de operadores,
   - FAQs,
   - seÃ±ales de confianza,
   - links internos.

### Tipo de contenido segÃºn intenciÃ³n

| IntenciÃ³n primaria | Tipo de pÃ¡gina recomendada |
|---|---|
| commercial | landing comparativa / shortlist de operadores |
| informational | guÃ­a explicativa / FAQ / how-to |
| navigational | pÃ¡gina de comparaciÃ³n / hub / listados |
| transactional | pÃ¡gina con CTA claro hacia contacto o cotizaciÃ³n |

---

## Paso 7 â€” AÃ±adir JSON-LD y semÃ¡ntica HTML

### Objetivo

Asegurar que GPTBot, Gbot y otros crawlers puedan parsear la relaciÃ³n empresa â†’ destino â†’ categorÃ­a sin inferencia.

### Requisitos mÃ­nimos

- HTML SSR o estÃ¡tico.
- <main>, <article>, <section>, <nav> bien estructurados.
- BreadcrumbList.
- ItemList para listados.
- FAQPage cuando haya preguntas frecuentes.
- TourOperator / TravelAgency / LocalBusiness en pÃ¡ginas de empresa.

### Regla

La misma entidad debe coincidir en:

- slug del archivo,
- URL,
- JSON-LD,
- y grafo interno.

---

## Paso 8 â€” Publicar y conectar con AI Search

### Objetivo

Hacer que el contenido generado sea accesible para bots y agentes.

### QuÃ© hacer

- AÃ±adir la nueva URL al sitemap correcto.
- Asegurar canonical en inglÃ©s.
- AÃ±adir enlaces desde hubs de destino y categorÃ­a.
- Incluir la pÃ¡gina o el resumen correspondiente en /llms.txt o /ai/*.md si es estratÃ©gica.

---

## Prioridad de automatizaciÃ³n

### Fase 1 â€” Obligatoria

- CSV â†’ frontmatter correcto
- slugs canÃ³nicos
- mapeo a destinos/categorÃ­as/brands
- archivos prompts/*.md

### Fase 2 â€” Recomendada

- consulta al grafo para sugerir companies
- generaciÃ³n automÃ¡tica de borrador del contenido
- FAQs por intenciÃ³n

### Fase 3 â€” Avanzada

- priorizaciÃ³n segÃºn oportunidad de AI Search
- refresco automÃ¡tico al detectar nuevos prompts
- score de cobertura por destino/categorÃ­a

---

## Criterios de calidad

Una ingesta estÃ¡ bien hecha si:

- no crea duplicados por slug,
- no deja relaciones en texto libre,
- no inventa destinos ni categorÃ­as fuera del catÃ¡logo,
- no depende de name-matching para siempre,
- deja un archivo listo para que Graphify lo convierta en edges,
- deja el contenido listo para indexaciÃ³n por bots de IA.

---

## QuÃ© no hacer

- No publicar directamente el CSV como contenido.
- No guardar brands_ai_mentions como string si ya se puede resolver a slug.
- No mezclar espaÃ±ol e inglÃ©s en pÃ¡ginas canÃ³nicas orientadas a AI Search.
- No generar HTML que dependa del cliente para renderizar contenido clave.
- No separar la estrategia de contenido de la arquitectura del grafo.

---

## CÃ³mo usar esta skill paso a paso

### Caso de uso tÃ­pico

*Objetivo:* convertir un CSV nuevo de prompts de IA sobre tours en PerÃº en archivos reutilizables para TourUp.

### Secuencia recomendada

1. *Cargar el CSV* y revisar sus columnas.
2. *Aplicar esta skill* para normalizar filas, slugs, intenciones y marcas.
3. *Mapear entidades* al catÃ¡logo oficial (destinos, categorias, external_brands).
4. *Crear o actualizar* archivos src/content/prompts/*.md.
5. *Regenerar el grafo* para que aparezcan los nuevos edges.
6. *Pasar esos prompts al agente de contenido* para redactar pÃ¡ginas HTML/SSR optimizadas para AI Search.
7. *Publicar* con schema.org, sitemap y enlaces internos.

### Si el usuario pide â€œsolo analizar el CSVâ€

La skill debe:

- revisar una muestra inicial,
- detectar patrones de intenciÃ³n,
- proponer taxonomÃ­as,
- y recomendar el pipeline,
- *sin ejecutar creaciÃ³n de archivos*.

### Si el usuario pide â€œprocesarlo todoâ€

La skill debe:

- convertir todo el CSV a prompts estructurados,
- documentar errores de mapeo,
- seÃ±alar entidades no resueltas,
- y dejar listo el lote para generaciÃ³n de contenido.

---

## Resumen operativo

Esta skill convierte un CSV de prompts IA en una tuberÃ­a ordenada:

text
CSV de prompts
â†’ normalizaciÃ³n
â†’ slugs + intenciones + marcas
â†’ entidades estructuradas
â†’ archivos prompts/*.md
â†’ grafo
â†’ contenido SSR en inglÃ©s
â†’ AI Search


objetivo Si se sigue esta skill, TourUp evita que los prompts queden como research aislado y los transforma en un sistema de contenido escalable y grafo-first.