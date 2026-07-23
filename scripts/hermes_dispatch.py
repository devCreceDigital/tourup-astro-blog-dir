#!/usr/bin/env python3
"""
hermes_dispatch.py — Hermes skill dispatcher for TourUp.

Sends skill execution requests to the Hermes agent on Maritime cloud via its
webhook. The webhook is fire-and-forget: it wakes the agent and delivers the
message, but does NOT return the agent's response. Use --chat (with an API key)
for synchronous responses.

Usage (PowerShell-friendly, no shell features required):

    # List available skills
    python scripts/hermes_dispatch.py --list

    # Dispatch a skill (fire-and-forget via webhook)
    python scripts/hermes_dispatch.py --skill tourup-ai-search-prompt-ingestion \
        --params '{"input":"CSV/prompts_test.csv","dry_run":true}'

    # Dispatch with synchronous chat (requires Maritime API key)
    python scripts/hermes_dispatch.py --skill seo-ia-geo \
        --params '{"page":"/en/peru/cusco"}' \
        --chat --api-key mk_xxxxxxxxxxxx

    # Dry run — print the payload without sending
    python scripts/hermes_dispatch.py --skill tourup-ai-prompt-landing-builder \
        --params '{"csv_row":2}' --dry-run

Skill registry:
    seo-ia-geo                         SEO/AEO/GEO consultant + auditor
    tourup-ai-prompt-landing-builder   Single-prompt CSV row -> PromptLanding page
    tourup-ai-search-prompt-ingestion  Batch CSV ingestion pipeline
"""
import argparse
import json
import sys
import urllib.request
import urllib.error
from pathlib import Path

WEBHOOK_URL = (
    "https://api.maritime.sh/api/webhooks/"
    "8751dc17-b4f8-46dd-8f2e-d2280c5da158"
)
CHAT_URL_TEMPLATE = (
    "https://api.maritime.sh/api/agents/"
    "8751dc17-b4f8-46dd-8f2e-d2280c5da158/chat"
)

SKILLS = {
    "seo-ia-geo": {
        "doc": "docs/skills/seo-ia-geo/SKILL.md",
        "summary": "SEO IA consultant/executor for GEO, AEO, AAIO",
        "params_example": {"page": "/en/peru/cusco", "audit_type": "aeo"},
    },
    "tourup-ai-prompt-landing-builder": {
        "doc": "docs/skills/tourup-ai-prompt-landing-builder/SKILL.md",
        "summary": "Single-prompt CSV row -> PromptLanding + Company/Brand pages",
        "params_example": {"csv_file": "CSV/prompts_test.csv", "row": 2},
    },
    "tourup-ai-search-prompt-ingestion": {
        "doc": "docs/skills/tourup-ai-search-prompt-ingestion/SKILL.md",
        "summary": "Batch CSV ingestion of AI search prompts into content pipeline",
        "params_example": {
            "input": "CSV/prompts_test.csv",
            "dry_run": True,
            "steps": "1-5",
        },
    },
}


def build_message(skill_name, params):
    lines = [
        f"[SKILL EXECUTION REQUEST]",
        f"skill: {skill_name}",
    ]
    if params:
        lines.append(f"params: {json.dumps(params)}")
    lines.append("")
    lines.append(f"Activate the '{skill_name}' skill and execute it")
    if params:
        lines.append("with the following parameters:")
        lines.append("")
        for k, v in params.items():
            lines.append(f"  {k}: {v}")
    else:
        lines.append("with default parameters.")
    lines.append("")
    lines.append("Follow the SKILL.md instructions exactly.")
    lines.append("Report results when complete.")
    return "\n".join(lines)


def send_webhook(message):
    payload = json.dumps({"message": message}).encode("utf-8")
    req = urllib.request.Request(
        WEBHOOK_URL,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = resp.read().decode("utf-8")
            return resp.status, body
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8")
    except urllib.error.URLError as e:
        return 0, str(e)


def send_chat(message, api_key, conversation_id=None):
    payload = {"message": message}
    if conversation_id:
        payload["conversation_id"] = conversation_id
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        CHAT_URL_TEMPLATE,
        data=data,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            body = resp.read().decode("utf-8")
            return resp.status, body
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8")
    except urllib.error.URLError as e:
        return 0, str(e)


def list_skills():
    print(f"\n{'='*60}")
    print("TourUp Hermes Skills")
    print(f"{'='*60}\n")
    for name, info in SKILLS.items():
        doc_path = Path(info["doc"])
        exists = "OK" if doc_path.exists() else "MISSING"
        print(f"  {name}")
        print(f"    {info['summary']}")
        print(f"    doc: {info['doc']} [{exists}]")
        print(f"    example params: {json.dumps(info['params_example'])}")
        print()
    print(f"Webhook: {WEBHOOK_URL}")
    print(f"Chat:    {CHAT_URL_TEMPLATE} (requires --api-key)")
    print()


def main():
    parser = argparse.ArgumentParser(
        description="Hermes skill dispatcher for TourUp"
    )
    parser.add_argument("--list", action="store_true", help="List available skills")
    parser.add_argument("--skill", type=str, help="Skill to execute")
    parser.add_argument(
        "--params",
        type=str,
        default="",
        help="JSON string of parameters for the skill",
    )
    parser.add_argument(
        "--chat",
        action="store_true",
        help="Use authenticated chat endpoint for synchronous response",
    )
    parser.add_argument(
        "--api-key",
        type=str,
        default="",
        help="Maritime API key (mk_xxx) for --chat mode",
    )
    parser.add_argument(
        "--conversation-id",
        type=str,
        default="",
        help="Conversation ID for threading (chat mode only)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print payload without sending",
    )
    args = parser.parse_args()

    if args.list:
        list_skills()
        return

    if not args.skill:
        parser.error("--skill is required (or use --list)")

    skill_name = args.skill.strip()
    if skill_name not in SKILLS:
        print(f"ERROR: Unknown skill '{skill_name}'", file=sys.stderr)
        print(f"Available: {', '.join(SKILLS.keys())}", file=sys.stderr)
        sys.exit(1)

    params = {}
    if args.params:
        try:
            params = json.loads(args.params)
        except json.JSONDecodeError as e:
            print(f"ERROR: Invalid JSON in --params: {e}", file=sys.stderr)
            sys.exit(1)

    message = build_message(skill_name, params)

    print(f"\nSkill:  {skill_name}")
    print(f"Params: {json.dumps(params) if params else '(none)'}")
    print(f"Mode:   {'chat (sync)' if args.chat else 'webhook (fire-and-forget)'}")
    print(f"\n--- Message ---\n{message}\n--- End Message ---\n")

    if args.dry_run:
        print("[DRY RUN] No request sent.")
        return

    if args.chat:
        if not args.api_key:
            print("ERROR: --chat requires --api-key", file=sys.stderr)
            sys.exit(1)
        conv = args.conversation_id or None
        status, body = send_chat(message, args.api_key, conv)
    else:
        status, body = send_webhook(message)

    print(f"HTTP Status: {status}")
    print(f"Response:")

    try:
        parsed = json.loads(body)
        print(json.dumps(parsed, indent=2))
    except (json.JSONDecodeError, TypeError):
        print(body)

    if status == 200 and not args.chat:
        print("\n[OK] Message delivered to Hermes. The agent will process it.")
        print("    The webhook is fire-and-forget — it does not return the")
        print("    agent's response. Check the Hermes dashboard or use --chat")
        print("    with an API key for synchronous replies.")
    elif status == 200 and args.chat:
        print("\n[OK] Synchronous response received.")


if __name__ == "__main__":
    main()
