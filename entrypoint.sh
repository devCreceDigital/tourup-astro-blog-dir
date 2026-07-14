#!/bin/sh
set -e

DB_LINK="/app/tourup-cms.db"
DB_DATA="/app/data/tourup-cms.db"

if [ ! -f "$DB_DATA" ]; then
  touch "$DB_DATA"
fi

if [ ! -L "$DB_LINK" ]; then
  ln -sf "$DB_DATA" "$DB_LINK"
fi

exec "$@"
