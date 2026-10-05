# Hermes × TourUp Skills Integration

## Overview

The three skills in `docs/skills/` are executed by the **Hermes agent** (NousResearch self-improving Python AI agent) deployed on Maritime cloud. Hermes receives skill execution requests through its webhook, wakes up, loads the relevant SKILL.md, and carries out the pipeline using its tools (Python exec, shell commands, file I/O).

## Architecture

```
TourUp repo (this project)          Maritime cloud
┌──────────────────────┐           ┌──────────────────────┐
│  scripts/             │           │  Hermes Agent         │
│  hermes_dispatch.py   │──POST───▶│  (Firecracker microVM)│
│                       │  webhook  │                       │
│  docs/skills/         │           │  ~/.hermes/skills/    │
│  ├── seo-ia-geo/      │◀─skills── │  ├── seo-ia-geo/      │
│  ├── tourup-ai-...    │  installed │  ├── tourup-ai-...    │
│  └── tourup-ai-...    │            │  └── tourup-ai-...    │
└──────────────────────┘            └──────────────────────┘
```

## The Webhook

**Endpoint:** `POST https://api.maritime.sh/api/webhooks/8751dc17-b4f8-46dd-8f2e-d2280c5da158`

**Behavior:** Fire-and-forget. The webhook delivers a message to Hermes and returns agent metadata JSON (id, name, status, invocationCount). It does NOT return the agent's response. The agent processes the message asynchronously and replies through its connected channels (dashboard, Telegram, email).

**Payload format:**
```json
{
  "message": "[SKILL EXECUTION REQUEST]\nskill: tourup-ai-search-prompt-ingestion\nparams: {\"input\":\"CSV/prompts_test.csv\"}\n\nActivate the 'tourup-ai-search-prompt-ingestion' skill..."
}
```

## Synchronous Chat (optional)

For synchronous responses, use the authenticated chat endpoint:

**Endpoint:** `POST https://api.maritime.sh/api/agents/8751dc17-b4f8-46dd-8f2e-d2280c5da158/chat`

**Headers:** `Authorization: Bearer mk_xxxxxxxxxxxx`

**Response:** `{"response": "..."}`

Get an API key with: `maritime keys create`

## Skill Registry

| Skill | Purpose | Key Scripts |
|-------|---------|-------------|
| `seo-ia-geo` | SEO/AEO/GEO consulting + auditing | (advisory, no scripts) |
| `tourup-ai-prompt-landing-builder` | Single CSV row → PromptLanding page | `prompts_to_md.py`, `bootstrap_brands_map.py`, `generate_graph.py` |
| `tourup-ai-search-prompt-ingestion` | Batch CSV ingestion pipeline | `run_pipeline.py`, `prompts_to_md.py`, `generate_graph.py` |

## Dispatcher Usage

### List available skills
```powershell
python scripts/hermes_dispatch.py --list
```

### Fire-and-forget (webhook)
```powershell
python scripts/hermes_dispatch.py --skill tourup-ai-search-prompt-ingestion `
  --params '{\"input\":\"CSV/prompts_test.csv\",\"dry_run\":true}'
```

### Synchronous (chat, requires API key)
```powershell
python scripts/hermes_dispatch.py --skill seo-ia-geo `
  --params '{\"page\":\"/en/peru/cusco\"}' `
  --chat --api-key mk_xxxxxxxxxxxx
```

### Dry run (print payload, don't send)
```powershell
python scripts/hermes_dispatch.py --skill tourup-ai-prompt-landing-builder `
  --params '{\"csv_file\":\"CSV/prompts_test.csv\",\"row\":2}' --dry-run
```

## Skill Installation on Hermes

Skills must be installed at `~/.hermes/skills/` on the Hermes agent's filesystem. The SKILL.md files in this repo are the source of truth — copy them to the agent:

```
~/.hermes/skills/
├── seo-ia-geo/
│   └── SKILL.md
├── tourup-ai-prompt-landing-builder/
│   └── SKILL.md
└── tourup-ai-search-prompt-ingestion/
    └── SKILL.md
```

To install from the Hermes dashboard (native TUI): use the Skills tab to add or update skills, pointing at the SKILL.md content.

## How Hermes Executes a Skill

1. **Webhook delivers message** → Hermes wakes up
2. **Message identifies skill** by name (e.g., `skill: tourup-ai-search-prompt-ingestion`)
3. **Hermes loads SKILL.md** from `~/.hermes/skills/<name>/SKILL.md`
4. **Hermes follows the pipeline** using its tools:
   - 🐍 exec — Run Python code inline
   - 💻 $ — Run shell commands (PowerShell on Windows)
   - 📖 read — Read files
   - 🔎 find — Find files
5. **Hermes operates on the TourUp repo** at the path configured in its environment
6. **Results reported** through connected channels (dashboard, Telegram, etc.)

## Critical Constraints (from SKILL.md files)

- **No external API/backend calls** — no Django, no REST API, no localhost server
- **No subprocess npm/npx** inside Python exec blocks — use only `scripts/*.py`
- **`brands-map.yaml` is the SSOT** for brand resolution
- **Platform: Windows (PowerShell)** — prefer inline Python exec over shell commands
- **Graph-first rule** — always query `graphify-out/graph.json` before opening individual .md files

## Agent Metadata

- **Agent ID:** `8751dc17-b4f8-46dd-8f2e-d2280c5da158`
- **Name:** Hermes Agent
- **Framework:** hermes
- **Tier:** smart
- **Status:** active
- **LLM:** OpenRouter `openai/gpt-5.4-nano`
- **Dashboard:** Available via Maritime UI proxy (Hermes Dashboard button)

## Related Files

- `scripts/hermes_dispatch.py` — Dispatcher script
- `docs/skills/seo-ia-geo/SKILL.md` — SEO/AEO/GEO skill spec
- `docs/skills/tourup-ai-prompt-landing-builder/SKILL.md` — Landing builder skill spec
- `docs/skills/tourup-ai-search-prompt-ingestion/SKILL.md` — Batch ingestion skill spec
- `OPEN_SPECS.md` section 6 — Original Hermes/OpenClaw skill architecture
