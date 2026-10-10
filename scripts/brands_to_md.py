#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
brands_to_md.py

Generate Company and ExternalBrand Markdown files from bd_agencias_en.csv + brands-map.yaml.
Creates content/companies/*.md and content/external_brands/*.md files.

Usage:
    python scripts/brands_to_md.py --input bd_agencias_en.csv --brands content/_meta/brands-map.yaml --output content/
    python scripts/brands_to_md.py --input bd_agencias_en.csv --brands content/_meta/brands-map.yaml --output content/ --update
"""

import argparse
import csv
import json
import re
import sys
from pathlib import Path
from typing import Any

try:
    import yaml
except ImportError:
    yaml = None


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_]+', '-', text)
    text = re.sub(r'-+', '-', text)
    return text.strip('-')


def guess_distribution_role(row: dict) -> str:
    raw = (row.get('tipo_agencia') or row.get('agency_type') or '').lower()
    mapping = {
        'tour_operator': 'tour_operator',
        'operador': 'tour_operator',
        'mayorista': 'wholesale_travel_agency',
        'minorista': 'retail_travel_agency',
        'agencia': 'retail_travel_agency',
        'dmc': 'dmc',
        'online': 'online_travel_agency',
    }
    for key, val in mapping.items():
        if key in raw:
            return val
    return 'tour_operator'


def guess_sales_channel(row: dict) -> str:
    raw = (row.get('canal_venta') or row.get('sales_channel') or '').lower()
    if 'online' in raw:
        return 'online'
    if 'offline' in raw or 'fisico' in raw or 'físico' in raw:
        return 'offline'
    return 'omnichannel'


def extract_company_frontmatter(row: dict) -> dict[str, Any]:
    name = row.get('nombre') or row.get('name') or row.get('company_name') or ''
    city = (row.get('ciudad') or row.get('city') or '').strip().upper()
    province = (row.get('provincia') or row.get('province') or '').strip().upper()
    region = (row.get('region') or row.get('region') or '').strip().upper() or province
    country = row.get('pais') or row.get('country') or 'Peru'
    parts = [p for p in [city, region if region != city else '', country] if p]
    summary = row.get('summary') or row.get('descripcion') or f"Travel Company based in {', '.join(parts)}."

    slug = slugify(name + '-' + city.lower()) if city else slugify(name)
    email = row.get('email') or ''
    website = row.get('website') or row.get('sitio_web') or ''
    phone = row.get('telefono') or row.get('phone') or ''
    tax_id = row.get('ruc') or row.get('tax_id') or ''
    license_num = row.get('licencia') or row.get('license_number') or '-'
    legal_rep = row.get('representante_legal') or row.get('legal_representative') or ''

    fm: dict[str, Any] = {
        'type': 'company',
        'slug': f'/company/{slug}',
        'title': name,
        'summary': summary,
    }

    contact = {}
    if website:
        contact['website'] = website
    if email:
        contact['email'] = email
    if phone:
        contact['phone'] = phone
    if contact:
        fm['contact'] = contact
    else:
        fm['contact'] = None

    location: dict[str, Any] = {'country': country}
    if city:
        location['city'] = city
    if province:
        location['province'] = province
    if region:
        location['region'] = region
    ubigeo = row.get('ubigeo') or row.get('ubigeo_code') or ''
    if ubigeo:
        location['ubigeo_code'] = ubigeo
    street_type = row.get('tipo_via') or row.get('street_type') or ''
    if street_type:
        location['street_type'] = street_type
    street_name = row.get('direccion') or row.get('street_name') or row.get('address') or ''
    if street_name:
        location['street_name'] = street_name
    street_number = row.get('numero') or row.get('street_number') or ''
    if street_number:
        location['street_number'] = street_number
    fm['location'] = location

    regulation: dict[str, Any] = {'tax_id': tax_id, 'license_number': license_num}
    snapshot = row.get('snapshot_date') or ''
    if snapshot:
        regulation['snapshot_date'] = snapshot
    fm['regulation'] = regulation

    if legal_rep:
        fm['legal_representative'] = legal_rep

    destinos_raw = row.get('destinos') or row.get('destino') or ''
    if destinos_raw:
        fm['destinos'] = [d.strip().lower() for d in destinos_raw.split(',') if d.strip()]
    if not fm.get('destinos'):
        fm['destinos'] = [slugify(city)] if city else []

    categorias_raw = row.get('categorias') or row.get('categoria') or ''
    if categorias_raw:
        fm['categorias'] = [c.strip().lower() for c in categorias_raw.split(',') if c.strip()]
    if not fm.get('categorias'):
        fm['categorias'] = ['full-day']

    fm['distribution_role'] = guess_distribution_role(row)
    sales = guess_sales_channel(row)
    if sales:
        fm['sales_channel'] = sales

    rating_raw = row.get('rating') or ''
    if rating_raw:
        try:
            fm['rating'] = float(rating_raw)
        except ValueError:
            pass
    reviews_raw = row.get('reviews_count') or ''
    if reviews_raw:
        try:
            fm['reviews_count'] = int(reviews_raw)
        except ValueError:
            pass

    # clean up empty values
    fm = {k: v for k, v in fm.items() if v is not None and v != '' and v != []}
    return fm


def extract_external_brand_frontmatter(row: dict) -> dict[str, Any]:
    name = row.get('nombre') or row.get('name') or row.get('brand_name') or ''
    fm: dict[str, Any] = {
        'type': 'external_brand',
        'name': name,
    }
    url = row.get('official_url') or row.get('url') or row.get('sitio_web') or row.get('website') or ''
    if url:
        fm['official_url'] = url
    role = row.get('brand_role') or ''
    if role:
        fm['brand_role'] = role
    country = row.get('pais') or row.get('country') or ''
    if country:
        fm['country'] = country
    prompts_raw = row.get('mentioned_in_prompts') or ''
    if prompts_raw:
        fm['mentioned_in_prompts'] = [p.strip() for p in prompts_raw.split(',') if p.strip()]
    return fm


def write_md(filepath: Path, frontmatter: dict, body: str = '') -> None:
    filepath.parent.mkdir(parents=True, exist_ok=True)

    lines = ['---']
    for key, val in frontmatter.items():
        lines.append(format_yaml_value(key, val))
    lines.append('---')
    if body:
        lines.append('')
        lines.append(body)
    lines.append('')

    filepath.write_text('\n'.join(lines), encoding='utf-8')
    print(f"  OK {filepath}")


def format_yaml_value(key: str, val: Any, indent: int = 0) -> str:
    prefix = '  ' * indent
    if val is None:
        return f"{prefix}{key}: null"
    if isinstance(val, bool):
        return f"{prefix}{key}: {'true' if val else 'false'}"
    if isinstance(val, str):
        if '\n' in val:
            return f"{prefix}{key}: |\n" + '\n'.join(f"  {line}" for line in val.split('\n'))
        val_stripped = val.strip()
        if not val_stripped:
            return f"{prefix}{key}: ''"
        if any(c in val for c in ':{}[]&#>|!%@`,'):
            return f"{prefix}{key}: {json.dumps(val, ensure_ascii=False)}"
        return f"{prefix}{key}: {val}"
    if isinstance(val, (int, float)):
        return f"{prefix}{key}: {val}"
    if isinstance(val, list):
        if not val:
            return f"{prefix}{key}: []"
        lines = [f"{prefix}{key}:"]
        for item in val:
            if isinstance(item, dict):
                lines.append(f"{prefix}  -")
                for k, v in item.items():
                    lines.append(format_yaml_value(k, v, indent + 3))
            else:
                formatted = json.dumps(item, ensure_ascii=False) if isinstance(item, str) and any(c in item for c in ':{}[]&#>|!%@`,') else str(item)
                lines.append(f"{prefix}  - {formatted}")
        return '\n'.join(lines)
    if isinstance(val, dict):
        if not val:
            return f"{prefix}{key}: {{}}"
        lines = [f"{prefix}{key}:"]
        for k, v in val.items():
            lines.append(format_yaml_value(k, v, indent + 1))
        return '\n'.join(lines)
    return f"{prefix}{key}: {val}"


def load_brands_map(path: Path) -> dict:
    if not path.exists():
        print(f"  !! brands-map not found at {path}, treating all entries as 'company'")
        return {}
    if yaml is None:
        print("  !! PyYAML not installed, treating all entries as 'company'")
        return {}
    with open(path, 'r', encoding='utf-8') as f:
        data = yaml.safe_load(f)
    if not isinstance(data, dict):
        return {}
    normalized = {}
    for key, val in data.items():
        if isinstance(val, dict):
            normalized[key] = val.get('type', 'company')
        elif isinstance(val, str):
            normalized[key] = val
        else:
            normalized[key] = 'company'
    return normalized


def validate_frontmatter(fm: dict, entity_type: str) -> list[str]:
    errors = []
    if entity_type == 'company':
        if not fm.get('title'):
            errors.append("Missing required field: 'title'")
        if not fm.get('summary'):
            errors.append("Missing required field: 'summary'")
        location = fm.get('location', {})
        if isinstance(location, dict) and not location.get('city'):
            errors.append("Missing required field: 'location.city'")
    elif entity_type == 'external_brand':
        if not fm.get('name'):
            errors.append("Missing required field: 'name'")
        if not fm.get('official_url'):
            errors.append("Missing required field: 'official_url'")
    return errors


def main():
    parser = argparse.ArgumentParser(description="Generate brand pages from CSV")
    parser.add_argument(
        "--input",
        type=str,
        default="bd_agencias_en.csv",
        help="Input CSV file (agency database)"
    )
    parser.add_argument(
        "--brands",
        type=str,
        default="content/_meta/brands-map.yaml",
        help="Path to brands-map.yaml"
    )
    parser.add_argument(
        "--output",
        type=str,
        default="content/",
        help="Output directory for generated Markdown files"
    )
    parser.add_argument(
        "--update",
        action="store_true",
        help="Update existing files (overwrite if slug matches)"
    )
    parser.add_argument(
        "--validate",
        action="store_true",
        help="Only validate input data, do not write files"
    )
    args = parser.parse_args()

    input_path = Path(args.input)
    brands_path = Path(args.brands)
    output_dir = Path(args.output)

    if not input_path.exists():
        print(f"X Input CSV not found: {args.input}")
        sys.exit(1)

    print(f"  Loading brands-map from {args.brands}")
    brands_map = load_brands_map(brands_path)
    print(f"  -> {len(brands_map)} brand mappings loaded")

    print(f"  Reading CSV from {args.input}")
    with open(input_path, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    print(f"  -> {len(rows)} rows loaded")

    companies_dir = output_dir / 'companies'
    external_brands_dir = output_dir / 'external_brands'

    errors = 0
    written = {'companies': 0, 'external_brands': 0, 'skipped': 0, 'errors': 0}

    for i, row in enumerate(rows):
        name = row.get('nombre') or row.get('name') or row.get('company_name') or ''
        entity_type = brands_map.get(name, 'company') if name else 'company'

        if entity_type == 'external_brand':
            fm = extract_external_brand_frontmatter(row)
        else:
            fm = extract_company_frontmatter(row)

        val_errors = validate_frontmatter(fm, entity_type)
        if val_errors:
            errors += 1
            written['errors'] += 1
            print(f"  !! [{i+1}] {name or '(no name)'}")
            for err in val_errors:
                print(f"      X {err}")
            continue

        if args.validate:
            continue

        if entity_type == 'external_brand':
            slug = slugify(fm.get('name', ''))
            filepath = external_brands_dir / f"{slug}.md"
        else:
            slug_raw = fm.get('slug', slugify(name))
            slug = slug_raw.replace('/company/', '')
            filepath = companies_dir / f"{slug}.md"

        if filepath.exists() and not args.update:
            written['skipped'] += 1
            continue

        body = ''
        if entity_type == 'company':
            body = f"# {fm.get('title', name)}\n\n{fm.get('summary', '')}"
        elif entity_type == 'external_brand':
            body = f"## About {fm.get('name', name)}\n\n"

        write_md(filepath, fm, body)
        key = 'companies' if entity_type == 'company' else 'external_brands'
        written[key] += 1

    print(f"\n{'='*60}")
    if args.validate:
        print(f"Validation complete: {errors} rows with errors out of {len(rows)}")
        sys.exit(1 if errors > 0 else 0)
    else:
        print(f"Done: {written['companies']} companies, {written['external_brands']} external_brands, "
              f"{written['skipped']} skipped (use --update to overwrite), {written['errors']} errors")


if __name__ == "__main__":
    main()
