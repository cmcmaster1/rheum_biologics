#!/usr/bin/env bash
set -euo pipefail

# Redeploy helper that prompts for GitHub token and pushes variables to Railway
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

# GitHub configuration (hardcoded)
GITHUB_OWNER="cmcmaster"
GITHUB_REPO="rheum_biologics"

echo "Configuring backend GitHub variables on Railway ($BACKEND_SERVICE)"
echo "GitHub Owner: $GITHUB_OWNER"
echo "GitHub Repo: $GITHUB_REPO"

if [[ -z "${GITHUB_TOKEN:-}" ]]; then
  read -s -p "GitHub Personal Access Token: " GITHUB_TOKEN_INPUT; echo
else
  GITHUB_TOKEN_INPUT=$GITHUB_TOKEN
fi

echo "Setting GitHub variables in Railway (without echoing secrets)..."
# Note: Railway requires one --set per key=value
railway variables --service "$BACKEND_SERVICE" \
  --set "GITHUB_OWNER=$GITHUB_OWNER" \
  --set "GITHUB_REPO=$GITHUB_REPO" >/dev/null

# Set token separately to avoid shell expansion issues
railway variables --service "$BACKEND_SERVICE" --set "GITHUB_TOKEN=$GITHUB_TOKEN_INPUT" >/dev/null

unset GITHUB_TOKEN_INPUT

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
