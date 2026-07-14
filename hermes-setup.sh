#!/bin/sh
set -e

echo "=== Hermes Agent + TourUp CMS - Setup ==="
echo ""

# 1. Crear .env.hermes si no existe
if [ ! -f .env.hermes ]; then
  cp .env.hermes.example .env.hermes
  echo "[1] Creado .env.hermes desde .env.hermes.example"
  echo "    Edítalo con tu API key antes de continuar."
  echo "    Luego ejecuta: docker compose run --rm hermes setup"
  exit 0
fi

# 2. Setup wizard de Hermes (primera vez)
echo "[2] Ejecutando setup wizard de Hermes..."
docker compose run --rm hermes setup

# 3. Sincronizar skills de TourUp
echo "[3] Sincronizando skills de TourUp..."
docker compose run --rm hermes hermes skill sync

# 4. Iniciar todo
echo ""
echo "[4] Iniciando servicios..."
docker compose up -d

echo ""
echo "=== Listo ==="
echo "  CMS:       http://localhost:8080"
echo "  Hermes:    http://localhost:8642 (gateway)"
echo "  Dashboard: http://localhost:9119"
echo ""
echo "Para ver logs: docker compose logs -f"
