
crea una Skill completa para lograr esto :
tomar un prompt concreto de los CSV,
generar el .md completo (frontmatter + body wireframe) para prompts/,
y un ejemplo de companies/.md + external_brands/.md para una de las marcas AI mencionadas, todo alineado con estos esquemas.
Comprensibilidad:
Tu grafo define claramente Prompt → Brands, y Astro refleja ese subgrafo en HTML + JSON‑LD (WebPage + ItemList + FAQPage).
Credibilidad:
Mismo naming y URLs en Company/ExternalBrand, PromptLanding, schema y menciones externas, con datos citables y timestamps de actualización.

Te dejo una “Skill” completa en formato que puedes pegar tal cual en tu hermes agent y/o Obsidian Skills. Está pensada para:

- Leer una fila de tus CSV de prompts.  
- Resolver marcas vía brands-map.  
- Generar:
  - content/prompts/*.md (PromptLanding completo).  
  - content/companies/*.md o content/external_brands/*.md si faltan.  
- Mantener la relación Prompt → Brands clara en el grafo y utilizable en Astro + JSON‑LD + FAQPage/ItemList para maximizar citabilidad.[1][2]

*

## Skill: AI Prompt → Landing & Brands Builder

### 0. Propósito

Convertir automáticamente un prompt de AI search (fila de CSV) en:

1. Una landing PromptLanding (content/prompts/*.md) que:
   - Responde de forma directa y estructurada al prompt.  
   - Incluye lista explícita de compañías recomendadas (ItemList).  
   - Incluye bloque FAQ listo para exponerse como FAQPage schema.[3][4][1]

2. Notas de marca (Company / ExternalBrand) consistentes:
   - content/companies/*.md para marcas del directorio.  
   - content/external_brands/*.md para marcas externas.  
   Ambas con naming y URLs coherentes con el brands-map y el JSON‑LD.  

De esta forma el grafo (Graphify) describe claramente las relaciones Prompt → Brands y la web Astro refleja ese subgrafo en HTML + JSON‑LD, mejorando comprensibilidad y credibilidad ante Googlebot/GPTBot/ClaudeBot.[2][5]

*

### 1. Supuestos y contexto

- Repositorio con estructura:

txt
content/
  prompts/
  companies/
  external_brands/
  _meta/
    brands-map.yaml


- Astro config con collections:
  - prompts, companies, external_brands (según esquemas ya definidos).  
- brands-map.yaml contiene mapeos name_csv → entity_type + slug (+ official_url).  
- Graphify está instalado y se ejecuta sobre el repo (/graphify .), generando graphify-out/graph.json.  

*

### 2. Inputs de la Skill

- Una fila de cualquiera de los CSV ai_models-*.csv con, como mínimo:
  - Prompt (texto del prompt).  
  - Search Term.  
  - Platform.  
  - Main Intent.  
  - Secondary Intent (opcional).  
  - Brands (lista separada por comas, puede estar vacía).  

Opcionalmente:

- destination_cluster y category_cluster si quieres forzar cluster.  
- lang (por defecto "en").  

*

### 3. Output de la Skill

1. Crear o actualizar un archivo Markdown:

txt
content/prompts/<slug>.md


conteniendo:

- Frontmatter válido para la collection prompts.  
- Body con wireframe (hero, quick answer, listas, tabla, FAQ).  

2. Crear o actualizar (solo si no existe):

txt
content/companies/<slug>.md           # para entity_type: company
content/external_brands/<slug>.md     # para entity_type: external_brand


3. (Opcional) Actualizar brands-map.yaml si se detectan nuevas marcas no mapeadas.

*

### 4. Pasos detallados de la Skill

#### Paso 1 – Normalizar la fila de CSV

1. Leer valores: Prompt, Search Term, Platform, Main Intent, Secondary Intent, Brands.  
2. Limpiar espacios y comillas.  
3. Separar Brands en lista brands_ai_raw (["Alpaca Expeditions", "REI Adventures", ...]).  

#### Paso 2 – Resolver marcas via brands-map.yaml

1. Cargar content/_meta/brands-map.yaml.  
2. Para cada name en brands_ai_raw:
   - Buscar entrada con name_csv == name.  
   - Si existe:
     - Guardar entity_type (company / external_brand) y slug.  
   - Si no existe:
     - Crear una entrada provisional en brands-map.yaml con:
       yaml
       - name_csv: "<Brand Name>"
         entity_type: "unknown"
         slug: "<brand-name-slug>"
       
     - Considerar crear external_brand por defecto con official_url vacío.  

3. Construir brands_ai_mentions para el frontmatter:

yaml
brands_ai_mentions:
  - name: "Alpaca Expeditions"
    entity_type: "company"
    entity_slug: "alpaca-expeditions"
  - name: "REI Adventures"
    entity_type: "external_brand"
    entity_slug: "rei-adventures"
  # etc.


#### Paso 3 – Generar slug y metadatos de PromptLanding

1. Generar slug_id a partir del prompt (primeras 8–10 palabras, kebab-case).  
2. slug final: /en/peru/<slug_id>/ o la ruta que hayas decidido.  
3. title = Prompt.  
4. summary = frase corta explicativa:

> “Landing page answering the AI search prompt: ‘Best tour companies for Machu Picchu trips from the US’, listing recommended brands and explaining how to choose the right operator.”

5. Asignar:

yaml
destination_cluster: inferido (ej. "cusco_machu_picchu" si el prompt menciona Machu Picchu)
category_cluster: "peru_tour_companies" (por defecto, o variaciones como "family_friendly", "budget", etc.)


6. last_ai_check_date = fecha actual ISO.  

#### Paso 4 – Crear/actualizar content/prompts/<slug_id>.md

Frontmatter:

yaml
---
type: "prompt_landing"
slug: "/en/ai-prompts/<slug_id>/"
title: "<Prompt>"
lang: "en"
search_term: "<Search Term>"
ai_platforms: ["<Platform>"]
prompt_text: "<Prompt>"
primary_intent: "<Main Intent>"
secondary_intent: "<Secondary Intent or empty>"
destination_cluster: "<destination_cluster>"
category_cluster: "<category_cluster>"
brands_ai_mentions:
  - name: "..."
    entity_type: "company"
    entity_slug: "..."
  # ...
summary: "<summary>"
parent: "/en/peru/"
last_ai_check_date: "YYYY-MM-DD"
ai_cited_domains: []
---


Body (wireframe inicial):

markdown
# <Prompt>

<Quick answer: 1–2 frases que responden directamente el prompt, 50–70 palabras.>

## Featured tour companies

<Introducción de 1 frase.>

1. **Brand A** – breve descripción (rol, foco, para quién es mejor).
2. **Brand B** – ...
3. ...

## Compare Peru tour companies for this use case

<Tabla con columnas: Company, Base, Trip style, Group size, Good for.>

## How to choose a Peru tour company for this scenario

<Lista de criterios específicos para el prompt (precio, reviews, tipo de viaje, etc.).>

## Frequently asked questions

### Q1 – (pregunta alineada con el prompt)

Respuesta en 40–150 palabras.

### Q2 – ...

### Q3 – ...


Más adelante, otro agente puede refinar el texto a partir de tus datos internos.

#### Paso 5 – Crear/actualizar Company y ExternalBrand

Para cada entrada en brands_ai_mentions:

- Si entity_type == "company":
  1. Buscar content/companies/<entity_slug>.md.  
  2. Si no existe, crear con frontmatter mínimo:

     markdown
     ---
     type: "company"
     slug: "/company/<entity_slug>/"
     title: "<Brand Name>"
     distribution_role: "tour_operator"        # o el que corresponda
     sales_channel: "online"                   # online/offline/omnichannel
     summary: "Peruvian inbound tour operator focused on Peru tours."
     contact:
       website: "<official website if known>"
     location:
       country: "Peru"
     regulation: {}
     mentioned_in_prompts:
       - "<prompt slug>"
     ---
     
     # <Brand Name>
     
     <Short description.>
     

  3. Si ya existe, añadir prompt slug a mentioned_in_prompts si no está.  

- Si entity_type == "external_brand":
  1. Buscar content/external_brands/<entity_slug>.md.  
  2. Si no existe, crear:

     markdown
     ---
     type: "external_brand"
     slug: "rei-adventures"
     name: "REI Adventures"
     official_url: "https://www.rei.com/adventures"
     brand_role: "global_adventure_travel_company"
     country: "United States"
     mentioned_in_prompts:
       - "<prompt slug>"
     ---
     
     # REI Adventures
     
     Global adventure travel company offering guided itineraries worldwide, including Peru.
     

  3. Si ya existe, agregar el prompt slug a mentioned_in_prompts.  

#### Paso 6 – Sincronizar con Graphify

- Tras crear/editar los .md, correr:

  - graphify update . (más rápido) o /graphify . según setup.  

- El grafo resultante tendrá:

  - Nodos prompt_landing, company, external_brand.  
  - Edges detectados por wikilinks y por campos como mentioned_in_prompts (según tu contrato conceptual).  

Así tus agentes pueden preguntar a Graphify:

- “¿Qué compañías salen en prompts sobre ‘family-friendly Peru tours’?”  
- “¿Qué prompts mencionan ‘Alpaca Expeditions’ y con qué intención (Commercial/Informational)?”

*

## 6. Notas para comprensibilidad y credibilidad

- *Comprensibilidad:*  
  - Cada PromptLanding tiene brands_ai_mentions bien resuelto y se traduce a una lista humana + ItemList JSON‑LD.  
  - El grafo muestra claramente la relación Prompt → Brand, que tus agentes pueden navegar para actualizar rankings y contenido.[6][2]

- *Credibilidad:*  
  - Mismos nombres de marca y URLs en:
    - brands-map.yaml,  
    - companies / external_brands,  
    - PromptLanding,  
    - schema TravelAgency / ItemList / FAQPage,  
    - y menciones externas (que irás trabajando).  
  - Cada landing puede incluir datos concretos con fuente (ej. estadísticas de turismo), que son el tipo de “claims + citations” que AI engines adoran citar