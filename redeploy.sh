#!/usr/bin/env bash
set -euo pipefail

# Redeploy helper that prompts for SMTP password and pushes variables to Railway
# Usage: ./redeploy.sh [--skip-frontend]

SKIP_FRONTEND=${1:-}

if ! command -v railway >/dev/null 2>&1; then
  echo "Railway CLI not found. Install with: npm i -g @railway/cli" >&2
  exit 1
fi

if ! railway whoami >/dev/null 2>&1; then
  echo "Please login to Railway first: railway login" >&2
  exit 1
fi

BACKEND_SERVICE=${BACKEND_SERVICE:-backend}
FRONTEND_SERVICE=${FRONTEND_SERVICE:-frontend}

SMTP_HOST_DEFAULT=${SMTP_HOST:-mail.privateemail.com}
SMTP_PORT_DEFAULT=${SMTP_PORT:-465}
SMTP_USER_DEFAULT=${SMTP_USER:-admin@rheumai.com}
MAIL_FROM_DEFAULT=${MAIL_FROM:-admin@rheumai.com}
MAIL_TO_DEFAULT=${MAIL_TO:-admin@rheumai.com}

echo "Configuring backend SMTP variables on Railway ($BACKEND_SERVICE)"
read -r -p "SMTP host [$SMTP_HOST_DEFAULT]: " SMTP_HOST_INPUT || true
SMTP_HOST=${SMTP_HOST_INPUT:-$SMTP_HOST_DEFAULT}

read -r -p "SMTP port [$SMTP_PORT_DEFAULT]: " SMTP_PORT_INPUT || true
SMTP_PORT=${SMTP_PORT_INPUT:-$SMTP_PORT_DEFAULT}

read -r -p "SMTP user [$SMTP_USER_DEFAULT]: " SMTP_USER_INPUT || true
SMTP_USER=${SMTP_USER_INPUT:-$SMTP_USER_DEFAULT}

read -r -p "MAIL FROM [$MAIL_FROM_DEFAULT]: " MAIL_FROM_INPUT || true
MAIL_FROM=${MAIL_FROM_INPUT:-$MAIL_FROM_DEFAULT}

read -r -p "MAIL TO [$MAIL_TO_DEFAULT]: " MAIL_TO_INPUT || true
MAIL_TO=${MAIL_TO_INPUT:-$MAIL_TO_DEFAULT}

if [[ -z "${SMTP_PASS:-}" ]]; then
  read -s -p "SMTP password: " SMTP_PASS_INPUT; echo
else
  SMTP_PASS_INPUT=$SMTP_PASS
fi

echo "Setting variables in Railway (without echoing secrets)..."
# Note: Railway requires one --set per key=value
railway variables --service "$BACKEND_SERVICE" \
  --set "SMTP_HOST=$SMTP_HOST" \
  --set "SMTP_PORT=$SMTP_PORT" \
  --set "SMTP_USER=$SMTP_USER" \
  --set "MAIL_FROM=$MAIL_FROM" \
  --set "MAIL_TO=$MAIL_TO" >/dev/null

# Set password separately to avoid shell expansion issues
railway variables --service "$BACKEND_SERVICE" --set "SMTP_PASS=$SMTP_PASS_INPUT" >/dev/null

unset SMTP_PASS_INPUT

echo "Triggering backend deploy from ./backend ..."
(cd backend && railway up --service "$BACKEND_SERVICE")

if [[ "$SKIP_FRONTEND" == "--skip-frontend" ]]; then
  echo "Frontend deploy skipped."
else
  echo "\nConfigure frontend API base URL (VITE_API_BASE_URL)"
  CURRENT_FRONTEND_API=""
  if command -v jq >/dev/null 2>&1; then
    set +e
    CURRENT_FRONTEND_API=$(railway variables --service "$FRONTEND_SERVICE" --json 2>/dev/null | jq -r '.[] | select(.key=="VITE_API_BASE_URL") | .value' | head -n1)
    set -e || true
  fi
  read -r -p "VITE_API_BASE_URL [${CURRENT_FRONTEND_API:-unset}]: " FRONTEND_API_INPUT || true
  if [[ -n "${FRONTEND_API_INPUT:-}" ]]; then
    railway variables --service "$FRONTEND_SERVICE" --set "VITE_API_BASE_URL=$FRONTEND_API_INPUT" >/dev/null
  fi

  echo "Triggering frontend deploy from ./frontend ..."
  (cd frontend && railway up --service "$FRONTEND_SERVICE")
fi

echo "Done."
