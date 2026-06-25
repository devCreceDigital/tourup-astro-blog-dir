sequenceDiagram
    %% Actores principales
    actor U as Usuario (Juan)
    participant Ob as Obsidian Vault<br/>(repo local tourup-astro-blog)
    participant Git as GitHub Repo
    participant Bolt as Bolt.new<br/>(Astro dev agent)
    participant MCP as MCP Server<br/>"travel-content"
    participant CB as ContentBuilder Agent
    participant AE as AEOAuditor Agent
    participant Gf as Graphify CLI<br/>(backend Gemini)
    participant Astro as Astro Build/Runtime

    %% 1. Edición humana en Obsidian
    U->>Ob: Crea/edita notas<br/>companies/, external_brands/, prompts/, OPEN_SPECS.md
    U->>Ob: Guarda cambios en archivos .md

    %% 2. Sincronización con GitHub
    U->>Git: git add/commit/push
    Git-->>Bolt: Repo actualizado (pull desde Bolt)

    %% 3. Desarrollo de la app Astro en Bolt
    Bolt->>Astro: Modifica src/, content config.ts,<br/>páginas [slug].astro, JsonLdPromptLanding
    Bolt->>Git: Commit & push de cambios de código
    Git-->>Ob: git pull en local para sincronizar con vault

    %% 4. Construcción / actualización del grafo con Graphify + Gemini
    U->>Gf: Ejecuta graphify . --backend gemini en el repo
    Gf->>Ob: Lee código + docs + contenido Markdown
    Gf->>Gf: Llama a Gemini API usando GEMINI_API_KEY<br/>para análisis semántico de docs
    Gf->>Ob: Escribe graphify-out/graph.json<br/>+ GRAPH_REPORT.md + otros artefactos

    %% 5. Agente ContentBuilder generando nuevas landings desde CSV
    U->>CB: Pide procesar nuevos CSV de AI prompts<br/>(ai_models-*.csv, bd_agencias_en.csv)
    CB->>MCP: Llama tool sync_brands_map(brands_from_csv)
    MCP->>Ob: Actualiza content/_meta/brands-map.yaml
    CB->>MCP: Llama generate_prompt_landing_md(row, brands_resueltas)
    MCP->>Ob: Crea/actualiza content/prompts/*.md
    CB->>MCP: Llama generate_company_from_csv / generate_external_brand_md
    MCP->>Ob: Crea/actualiza companies/.md y external_brands/.md
    CB->>Gf: Solicita reindexado rápido graphify . --backend gemini --update
    Gf->>Ob: Actualiza graph.json con nuevos nodos y edges

    %% 6. Agente AEOAuditor revisando AEO y schema
    U->>AE: Pide auditar un PromptLanding o cluster
    AE->>MCP: read_content(prompts/<slug>.md)
    AE->>MCP: read_graph() para Prompt↔️Brands
    AE->>AE: Analiza BLUF, ItemList, FAQPage, consistencia de entidades
    AE->>MCP: update_brand_mentions / actualiza frontmatter<br/>(summary, last_ai_check_date, ai_cited_domains)
    MCP->>Ob: Escribe cambios en .md
    AE->>Gf: Opcionalmente dispara graphify . --update

    %% 7. Build y publicación de Astro
    U->>Astro: Ejecuta npm run build / despliega en hosting (Vercel, Netlify, etc.)
    Astro->>Git: Usa el contenido y código del repo (collections, páginas)
    Astro-->>U: Sirve páginas /blog, /en/ai-prompts/, /companies/*<br/>con HTML + JSON-LD (WebPage, ItemList, FAQPage)

    %% 8. Consumo por LLMs externos vía web + MCP
    U->>MCP: (futuro) Otros agentes llaman travel-content<br/>para leer graph.json y contenido
    Astro-->>LLM: LLMs (ChatGPT, Gemini, Claude, etc.) rastrean el sitio<br/>y usan el contenido + schema para respuestas

=========

graph TB
    classDef done fill:#18a34a,stroke:#0f6930,color:#fff,font-weight:bold
    classDef partial fill:#facc15,stroke:#ca8a04,color:#000
    classDef gap fill:#f97373,stroke:#b91c1c,color:#fff

    subgraph Fuentes["📥 FUENTES DE DATOS"]
        CSV_AGENCIAS["bd_agencias_en.csv<br/>(Agencias Perú)"]
        CSV_PROMPTS["ai_models-*.csv<br/>(Prompts IA)"]
    end

    subgraph Ingestion["🔄 INGESTIÓN Python"]
        BOOTSTRAP["bootstrap_brands_map.py<br/>CSV → brands-map.yaml"]
        BRANDS_MD["brands_to_md.py<br/>CSV + YAML → .md"]
        PROMPTS_MD["prompts_to_md.py<br/>CSV + YAML → .md"]
    end

    subgraph Metadata["📋 METADATA"]
        BRANDS_YAML["content/_meta/brands-map.yaml<br/>(brand → entity mapping)"]
    end

    subgraph Content["📁 CONTENIDO Markdown"]
        COMPANIES["src/content/companies/*.md<br/>908 archivos<br/>type: company"]
        PROMPTS["src/content/prompts/*.md<br/>200 archivos<br/>type: prompt_landing"]
        EXTERNAL["content/external_brands/*.md<br/>(planned)"]
        POSTS["src/content/posts/*.md<br/>(planned)"]
    end

    subgraph Schemas["📐 SCHEMAS Content Collections"]
        CONFIG["src/content/config.ts<br/>(pending)"]
        SCHEMA_CO["companies: defineCollection"]
        SCHEMA_EB["external_brands: defineCollection"]
        SCHEMA_PR["prompts: defineCollection"]
        SCHEMA_PO["posts: defineCollection"]
    end

    subgraph Astro["⚡ ASTRO PAGES (Static Build)"]
        LAYOUT["src/layouts/Layout.astro"]
        HEADER["Header.astro"]
        FOOTER["Footer.astro"]
        JSONLD["JsonLdPromptLanding.astro<br/>WebPage + ItemList + FAQPage"]

        INDEX["index.astro<br/>Landing ES"]
        BLOG_LIST["blog/index.astro<br/>Lista posts"]
        BLOG_POST["blog/[slug].astro<br/>Post individual"]
        COMPANY_PAGE["companies/[slug].astro<br/>Perfil empresa"]
        PROMPT_PAGE["en/ai-prompts/[slug].astro<br/>Prompt Landing AEO"]
    end

    subgraph Graphify["🧠 KNOWLEDGE GRAPH"]
        GRAPH["graphify-out/graph.json<br/>(planned, backend Gemini)"]
        COMMUNITIES["Community Detection"]
        QUERY["graphify query<br/>BFS / DFS / Path"]
        REPORT["GRAPH_REPORT.md"]
    end

    subgraph Output["🚀 OUTPUT"]
        STATIC["dist/<br/>HTML estático"]
        SITEMAP["public/sitemap.xml"]
        ROBOTS["public/robots.txt"]
        SCHEMA_JSON["JSON-LD en <head>"]
    end

    subgraph MCP["🔌 MCP LAYER (planned)"]
        TRAVEL_MCP["travel-content MCP server<br/>read/write content · graph queries"]
        CONTENT_BUIDER["ContentBuilder Agent<br/>CSV → Markdown generator"]
        AEO_AUDITOR["AEOAuditor Agent<br/>Valida AEO + Schema"]
    end

    %% Flujo de datos (igual que tu diagrama)
    CSV_AGENCIAS --> BOOTSTRAP
    CSV_PROMPTS --> BOOTSTRAP
    BOOTSTRAP --> BRANDS_YAML

    CSV_AGENCIAS --> BRANDS_MD
    BRANDS_YAML --> BRANDS_MD
    BRANDS_MD --> COMPANIES
    BRANDS_YAML --> EXTERNAL
    CSV_PROMPTS --> PROMPTS_MD
    BRANDS_YAML --> PROMPTS_MD
    PROMPTS_MD --> PROMPTS

    COMPANIES --> SCHEMA_CO
    EXTERNAL --> SCHEMA_EB
    PROMPTS --> SCHEMA_PR
    POSTS --> SCHEMA_PO
    CONFIG --> SCHEMA_CO
    CONFIG --> SCHEMA_EB
    CONFIG --> SCHEMA_PR
    CONFIG --> SCHEMA_PO

    SCHEMA_CO --> COMPANY_PAGE
    SCHEMA_PR --> PROMPT_PAGE
    SCHEMA_PO --> BLOG_LIST
    SCHEMA_PO --> BLOG_POST

    LAYOUT --> INDEX
    LAYOUT --> BLOG_LIST
    LAYOUT --> BLOG_POST
    LAYOUT --> COMPANY_PAGE
    LAYOUT --> PROMPT_PAGE
    HEADER --> LAYOUT
    FOOTER --> LAYOUT
    JSONLD --> PROMPT_PAGE

    COMPANY_PAGE --> STATIC
    PROMPT_PAGE --> STATIC
    BLOG_LIST --> STATIC
    BLOG_POST --> STATIC
    INDEX --> STATIC
    STATIC --> SCHEMA_JSON
    STATIC --> SITEMAP

    COMPANIES --> GRAPH
    PROMPTS --> GRAPH
    GRAPH --> COMMUNITIES
    GRAPH --> QUERY
    GRAPH --> REPORT
    GRAPH --> TRAVEL_MCP
    BRANDS_YAML --> TRAVEL_MCP
    COMPANIES --> TRAVEL_MCP
    PROMPTS --> TRAVEL_MCP
    TRAVEL_MCP --> CONTENT_BUIDER
    TRAVEL_MCP --> AEO_AUDITOR

    %% Clasificación de estado
    class CSV_AGENCIAS,CSV_PROMPTS,COMPANIES,PROMPTS,LAYOUT,HEADER,FOOTER,INDEX,robots,SITEMAP,STATIC done
    class BRANDS_YAML partial

    class BOOTSTRAP,BRANDS_MD,PROMPTS_MD,EXTERNAL,POSTS,CONFIG,SCHEMA_CO,SCHEMA_EB,SCHEMA_PR,SCHEMA_PO,JSONLD,BLOG_LIST,BLOG_POST,COMPANY_PAGE,PROMPT_PAGE,GRAPH,COMMUNITIES,QUERY,REPORT partial

    class TRAVEL_MCP,CONTENT_BUIDER,AEO_AUDITOR gap