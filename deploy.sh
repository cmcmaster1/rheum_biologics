#!/usr/bin/env bash

# Rheumatology Biologics Railway Deployment Script (monorepo)
# - Creates/links a Railway project
# - Provisions Postgres
# - Deploys backend (./backend) and optionally frontend (./frontend)

set -euo pipefail

PROJECT_NAME=${PROJECT_NAME:-rheum-biologics}
ENVIRONMENT=${ENVIRONMENT:-production}
TEAM=${TEAM:-}
PROJECT_ID=${PROJECT_ID:-}
BACKEND_SERVICE=${BACKEND_SERVICE:-backend}
FRONTEND_SERVICE=${FRONTEND_SERVICE:-frontend}
SKIP_FRONTEND=${SKIP_FRONTEND:-false}
CREATE_DB=${CREATE_DB:-true}

echo "🚀 Starting Railway deployment for Rheumatology Biologics..."

# Check prerequisites
if ! command -v railway >/dev/null 2>&1; then
  echo "❌ Railway CLI is not installed. Install with:"
  echo "   npm install -g @railway/cli"
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "ℹ️  'jq' not found; JSON parsing steps will be skipped."
fi

# Check login
if ! railway whoami >/dev/null 2>&1; then
  echo "🔐 Please login to Railway first:"
  echo "   railway login"
  exit 1
fi

echo "✅ Railway CLI is installed and user is logged in"

# Try to detect if we're already linked
set +e
LINKED_OUTPUT=$(railway status 2>&1)
LINKED_EXIT=$?
set -e

if echo "$LINKED_OUTPUT" | grep -qi "No linked project"; then
  echo "🔗 No linked project detected. Linking/initializing..."
  if [[ -n "$PROJECT_ID" ]]; then
    # Link to an existing project
    if [[ -n "$TEAM" ]]; then
      railway link --project "$PROJECT_ID" --environment "$ENVIRONMENT" --team "$TEAM"
    else
      railway link --project "$PROJECT_ID" --environment "$ENVIRONMENT"
    fi
  else
    # Create a new project non-interactively
    if [[ -n "$TEAM" ]]; then
      echo "📦 Creating new Railway project '$PROJECT_NAME' (team: $TEAM)..."
      railway init --name "$PROJECT_NAME"
      # Team selection in CLI may still be interactive; fallback to dashboard if needed
    else
      echo "📦 Creating new Railway project '$PROJECT_NAME'..."
      railway init --name "$PROJECT_NAME"
    fi
  fi
else
  echo "🔗 Project already linked. Proceeding..."
fi

# Optionally provision Postgres (idempotent-ish: will skip if a Postgres service exists when detectable)
if [[ "$CREATE_DB" == "true" ]]; then
  SHOULD_CREATE_DB=true
  if command -v jq >/dev/null 2>&1; then
    # Attempt to detect existing postgres service
    set +e
    STATUS_JSON=$(railway status --json 2>/dev/null)
    set -e || true
    if [[ -n "${STATUS_JSON:-}" ]]; then
      if echo "$STATUS_JSON" | jq -e '.services[]?.plugins[]? | select(.name|test("postgres"; "i"))' >/dev/null 2>&1; then
        echo "🗄️  Existing Postgres detected; skipping creation."
        SHOULD_CREATE_DB=false
      fi
    fi
  fi
  if [[ "$SHOULD_CREATE_DB" == "true" ]]; then
    echo "🗄️  Adding PostgreSQL database service..."
    railway add --database postgres --service postgres || true
  fi
else
  echo "⏭️  Skipping database provisioning (CREATE_DB=false)"
fi

# Ensure backend service exists and deploy
echo "🚀 Deploying backend service ('$BACKEND_SERVICE') from ./backend ..."
# Ensure a named service exists (no-op if it already exists)
railway add --service "$BACKEND_SERVICE" >/dev/null 2>&1 || true
railway service "$BACKEND_SERVICE" >/dev/null 2>&1 || true

# Prefer running from inside the service directory to avoid path prefix issues
if ! (cd backend && railway up --service "$BACKEND_SERVICE" --environment "$ENVIRONMENT"); then
  echo "⚠️  Backend deploy from inside folder failed; retrying with explicit path..."
  railway up ./backend --service "$BACKEND_SERVICE" --environment "$ENVIRONMENT" || {
    echo "❌ Backend deployment failed. Check logs with: railway logs --service $BACKEND_SERVICE";
    exit 1;
  }
fi

echo "✅ Backend deployment initiated"

# Optionally set some common backend variables (safe defaults)
echo "🔧 You may want to set backend variables (PORT, CORS_ORIGIN, BIOLOGICS_*) via dashboard or CLI. Examples:"
echo "   railway variables --service $BACKEND_SERVICE --set 'PORT=3001'"
echo "   railway variables --service $BACKEND_SERVICE --set 'NODE_ENV=production'"
echo "   railway variables --service $BACKEND_SERVICE --set 'CORS_ORIGIN=https://rheum-biologics.up.railway.app'"
echo "   railway variables --service $BACKEND_SERVICE --set 'BIOLOGICS_INGEST_ENABLED=true'"
echo "   railway variables --service $BACKEND_SERVICE --set 'BIOLOGICS_INGEST_CRON=0 4 1 * *'"
echo "   railway variables --service $BACKEND_SERVICE --set 'BIOLOGICS_INGEST_TZ=Australia/Sydney'"
echo "   railway variables --service $BACKEND_SERVICE --set 'BIOLOGICS_INGEST_LOOKBACK=3'"

if [[ "$SKIP_FRONTEND" != "true" ]]; then
  echo "🚀 Deploying frontend service ('$FRONTEND_SERVICE') from ./frontend ..."
  railway add --service "$FRONTEND_SERVICE" >/dev/null 2>&1 || true
  railway service "$FRONTEND_SERVICE" >/dev/null 2>&1 || true
  if ! (cd frontend && railway up --service "$FRONTEND_SERVICE" --environment "$ENVIRONMENT"); then
    echo "⚠️  Frontend deploy from inside folder failed; retrying with explicit path..."
    railway up ./frontend --service "$FRONTEND_SERVICE" --environment "$ENVIRONMENT" || {
      echo "❌ Frontend deployment failed. Check logs with: railway logs --service $FRONTEND_SERVICE";
      exit 1;
    }
  fi
  echo "✅ Frontend deployment initiated"
else
  echo "⏭️  Skipping frontend deployment (SKIP_FRONTEND=true)"
fi

echo
echo "📋 Next steps:"
echo "1) Configure environment variables in Railway dashboard (or via 'railway variables')."
echo "2) Run database migrations for the backend service:"
echo "   railway run --service $BACKEND_SERVICE psql \$DATABASE_URL -f backend/db/migrations/001_init.sql"
echo "   railway run --service $BACKEND_SERVICE psql \$DATABASE_URL -f backend/db/migrations/002_alter_column_lengths.sql"
echo "3) If you deployed the frontend, set its API base URL:"
echo "   railway variables --service $FRONTEND_SERVICE --set 'VITE_API_BASE_URL=https://<your-backend>.railway.app/api'"
echo "4) (Optional) Run initial data ingestion from the backend:"
echo "   railway run --service $BACKEND_SERVICE npm run ingest:run"
echo
echo "📖 See DEPLOYMENT.md for detailed instructions"
