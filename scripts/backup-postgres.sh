#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE=${COMPOSE_FILE:-docker-compose.digitalocean.yml}
BACKUP_DIR=${BACKUP_DIR:-./backups/postgres}
RETENTION_DAYS=${RETENTION_DAYS:-14}

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

mkdir -p "$BACKUP_DIR"

timestamp=$(date -u +"%Y%m%dT%H%M%SZ")
backup_file="$BACKUP_DIR/rheum_biologics_$timestamp.sql.gz"

docker compose --env-file .env -f "$COMPOSE_FILE" exec -T postgres \
  pg_dump -U "${POSTGRES_USER:-rheum}" "${POSTGRES_DB:-rheum_biologics}" \
  | gzip > "$backup_file"

find "$BACKUP_DIR" -type f -name 'rheum_biologics_*.sql.gz' -mtime +"$RETENTION_DAYS" -delete

echo "$backup_file"
