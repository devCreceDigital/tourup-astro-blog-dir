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

    subgraph Ingestion["🔄 INGESTIÓN Python (scripts/*.py)"]
        BOOTSTRAP["bootstrap_brands_map.py<br/>CSV → brands-map.yaml"]
        BRANDS_MD["brands_to_md.py<br/>CSV + YAML → .md"]
        PROMPTS_MD["prompts_to_md.py<br/>CSV + YAML → .md"]
        EXPAND_TAX["expand_taxonomy.py<br/>Genera destinos + categorias"]
        MIGRATE_CO["migrate_companies.py<br/>Normaliza companies"]
        MIGRATE_PR["migrate_prompts_schema.py<br/>Actualiza schema prompts"]
        LINK_PR["link_prompts.py<br/>Conecta prompts ↔ brands"]
    end

    subgraph Metadata["📋 METADATA"]
        BRANDS_YAML["content/_meta/brands-map.yaml<br/>(brand → entity mapping)"]
        BRANDS_YAML_GAP["⚠️ No generado aún<br/>el script existe pero el<br/>archivo no está en disco"]
    end

    subgraph Content["📁 CONTENIDO Markdown"]
        COMPANIES["src/content/companies/*.md<br/>984 archivos<br/>type: company"]
        PROMPTS["src/content/prompts/*.md<br/>201 archivos<br/>type: prompt_landing"]
        EXTERNAL["src/content/external_brands/*.md<br/>6 archivos<br/>type: external_brand"]
        DESTINOS["src/content/destinos/*.md<br/>21 archivos<br/>type: destino"]
        CATEGORIAS["src/content/categorias_destino/*.md<br/>360 archivos<br/>type: categoria_destino"]
        POSTS["src/content/posts/*.md<br/>1 archivo<br/>type: post"]
    end

    subgraph Schemas["📐 SCHEMAS Content Collections"]
        CONFIG["src/content/config.ts<br/>6 colecciones definidas"]
        SCHEMA_CO["companies: defineCollection<br/>Journey 4 — Trust Card"]
        SCHEMA_EB["external_brands: defineCollection"]
        SCHEMA_PR["prompts: defineCollection<br/>brands_ai_mentions incluido"]
        SCHEMA_PO["posts: defineCollection"]
        SCHEMA_DE["destinos: defineCollection<br/>Geo taxonomy"]
        SCHEMA_CA["categorias_destino: defineCollection<br/>Tipo de tour por destino"]
    end

    subgraph Astro["⚡ ASTRO PAGES (Static Build)"]
        LAYOUT["src/layouts/Layout.astro"]
        HEADER["src/components/Header.astro<br/>Nav con dropdowns dinámicos"]
        FOOTER["src/components/Footer.astro<br/>5 columnas de enlaces"]
        JSONLD["src/components/JsonLdPromptLanding.astro<br/>WebPage + ItemList + FAQPage"]

        INDEX["index.astro<br/>Landing ES"]
        BLOG_LIST["blog/index.astro<br/>Lista posts"]
        BLOG_POST["blog/[slug].astro<br/>Post individual"]

        COMPANY_PAGE["companies/[slug].astro<br/>Perfil empresa EN"]
        EMPRESAS_PAGE["empresas/[slug].astro<br/>Perfil empresa ES"]
        EMPRESAS_LIST["empresas/index.astro<br/>Directorio A-Z empresas"]

        PROMPT_LIST["en/ai-prompts/index.astro<br/>Lista prompts AEO"]
        PROMPT_PAGE["en/ai-prompts/[slug].astro<br/>Prompt Landing AEO"]

        DEST_PAGE["en/peru/[slug].astro<br/>Página de destino"]
        DEST_TOURS["en/peru/[slug]/tours.astro<br/>Tours por destino"]
        DEST_CAT["en/peru/[slug]/tours/[categoria].astro<br/>Filtro por categoría"]

        PS_SCOUT["partner-scout/index.astro<br/>Partner Scout"]
        PS_SHORT["partner-scout/shortlist.astro<br/>Shortlist"]
        PS_CONFIRM["partner-scout/confirm.astro<br/>Confirm"]
        PS_BRIEF["partner-scout/brief.astro<br/>Brief"]
    end

    subgraph Graphify["🧠 KNOWLEDGE GRAPH"]
        GRAPH["graphify-out/graph.json<br/>+ graph.html<br/>(backend Gemini)"]
        COMMUNITIES["Community Detection<br/>(pending)"]
        QUERY["graphify query<br/>BFS / DFS / Path<br/>(pending)"]
        REPORT["GRAPH_REPORT.md<br/>⚠️ No generado"]
    end

    subgraph Output["🚀 OUTPUT"]
        STATIC["dist/<br/>HTML estático (2430 páginas)"]
        SITEMAP["public/sitemap.xml"]
        ROBOTS["public/robots.txt"]
        SCHEMA_JSON["JSON-LD en <head>"]
    end

    subgraph MCP["🔌 MCP LAYER (gap — no implementado)"]
        TRAVEL_MCP["travel-content MCP server<br/>read/write content · graph queries"]
        CONTENT_BUILDER["ContentBuilder Agent<br/>CSV → Markdown generator"]
        AEO_AUDITOR["AEOAuditor Agent<br/>Valida AEO + Schema"]
    end

    %% Flujo de datos principal
    CSV_AGENCIAS --> BOOTSTRAP
    CSV_PROMPTS --> BOOTSTRAP
    BOOTSTRAP -."→ (gap)".-> BRANDS_YAML

    CSV_AGENCIAS --> BRANDS_MD
    BRANDS_YAML -."→ (gap)".-> BRANDS_MD
    BRANDS_MD --> COMPANIES
    BRANDS_MD --> EXTERNAL
    CSV_PROMPTS --> PROMPTS_MD
    BRANDS_YAML -."→ (gap)".-> PROMPTS_MD
    PROMPTS_MD --> PROMPTS

    EXPAND_TAX --> DESTINOS
    EXPAND_TAX --> CATEGORIAS

    COMPANIES --> SCHEMA_CO
    EXTERNAL --> SCHEMA_EB
    PROMPTS --> SCHEMA_PR
    POSTS --> SCHEMA_PO
    DESTINOS --> SCHEMA_DE
    CATEGORIAS --> SCHEMA_CA
    CONFIG --> SCHEMA_CO
    CONFIG --> SCHEMA_EB
    CONFIG --> SCHEMA_PR
    CONFIG --> SCHEMA_PO
    CONFIG --> SCHEMA_DE
    CONFIG --> SCHEMA_CA

    SCHEMA_CO --> COMPANY_PAGE
    SCHEMA_CO --> EMPRESAS_PAGE
    SCHEMA_PR --> PROMPT_PAGE
    SCHEMA_PR --> PROMPT_LIST
    SCHEMA_PO --> BLOG_LIST
    SCHEMA_PO --> BLOG_POST
    SCHEMA_DE --> DEST_PAGE
    SCHEMA_CA --> DEST_CAT

    LAYOUT --> INDEX
    LAYOUT --> BLOG_LIST
    LAYOUT --> BLOG_POST
    LAYOUT --> COMPANY_PAGE
    LAYOUT --> EMPRESAS_PAGE
    LAYOUT --> EMPRESAS_LIST
    LAYOUT --> PROMPT_LIST
    LAYOUT --> PROMPT_PAGE
    LAYOUT --> DEST_PAGE
    LAYOUT --> DEST_TOURS
    LAYOUT --> DEST_CAT
    LAYOUT --> PS_SCOUT
    LAYOUT --> PS_SHORT
    LAYOUT --> PS_CONFIRM
    LAYOUT --> PS_BRIEF
    HEADER --> LAYOUT
    FOOTER --> LAYOUT
    JSONLD --> PROMPT_PAGE

    COMPANY_PAGE --> STATIC
    EMPRESAS_PAGE --> STATIC
    EMPRESAS_LIST --> STATIC
    PROMPT_PAGE --> STATIC
    PROMPT_LIST --> STATIC
    BLOG_LIST --> STATIC
    BLOG_POST --> STATIC
    DEST_PAGE --> STATIC
    DEST_TOURS --> STATIC
    DEST_CAT --> STATIC
    PS_SCOUT --> STATIC
    PS_SHORT --> STATIC
    PS_CONFIRM --> STATIC
    PS_BRIEF --> STATIC
    INDEX --> STATIC
    STATIC --> SCHEMA_JSON
    STATIC --> SITEMAP

    COMPANIES --> GRAPH
    PROMPTS --> GRAPH
    DESTINOS --> GRAPH
    EXTERNAL --> GRAPH
    GRAPH --> COMMUNITIES
    GRAPH --> QUERY
    GRAPH --> REPORT
    GRAPH --> TRAVEL_MCP
    BRANDS_YAML -."→ (gap)".-> TRAVEL_MCP
    COMPANIES --> TRAVEL_MCP
    PROMPTS --> TRAVEL_MCP
    TRAVEL_MCP --> CONTENT_BUILDER
    TRAVEL_MCP --> AEO_AUDITOR

    %% Clasificación de estado
    class CSV_AGENCIAS,CSV_PROMPTS,COMPANIES,PROMPTS,EXTERNAL,DESTINOS,CATEGORIAS,CONFIG,SCHEMA_CO,SCHEMA_EB,SCHEMA_PR,SCHEMA_PO,SCHEMA_DE,SCHEMA_CA,LAYOUT,HEADER,FOOTER,JSONLD,INDEX,BLOG_LIST,BLOG_POST,COMPANY_PAGE,EMPRESAS_PAGE,EMPRESAS_LIST,PROMPT_LIST,PROMPT_PAGE,DEST_PAGE,DEST_TOURS,DEST_CAT,PS_SCOUT,PS_SHORT,PS_CONFIRM,PS_BRIEF,GRAPH,STATIC,ROBOTS,SITEMAP,SCHEMA_JSON done

    class BOOTSTRAP,BRANDS_MD,PROMPTS_MD,EXPAND_TAX,MIGRATE_CO,MIGRATE_PR,LINK_PR,POSTS,COMMUNITIES,QUERY partial

    class BRANDS_YAML,BRANDS_YAML_GAP,REPORT gap

    class TRAVEL_MCP,CONTENT_BUILDER,AEO_AUDITOR gap