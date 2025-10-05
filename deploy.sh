#!/bin/bash

# Rheumatology Biologics Railway Deployment Script
# This script helps automate the deployment process to Railway

set -e

echo "🚀 Starting Railway deployment for Rheumatology Biologics..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI is not installed. Please install it first:"
    echo "   npm install -g @railway/cli"
    exit 1
fi

# Check if user is logged in to Railway
if ! railway whoami &> /dev/null; then
    echo "🔐 Please login to Railway first:"
    echo "   railway login"
    exit 1
fi

echo "✅ Railway CLI is installed and user is logged in"

# Create new Railway project
echo "📦 Creating new Railway project..."
railway new

# Add PostgreSQL database
echo "🗄️  Adding PostgreSQL database..."
railway add postgresql

# Deploy backend
echo "🚀 Deploying backend service..."
railway up

echo "✅ Backend deployment initiated!"

echo ""
echo "📋 Next steps:"
echo "1. Go to Railway dashboard to configure environment variables"
echo "2. Run database migrations:"
echo "   railway run psql \$DATABASE_URL -f backend/db/migrations/001_init.sql"
echo "   railway run psql \$DATABASE_URL -f backend/db/migrations/002_alter_column_lengths.sql"
echo "3. Deploy frontend service from Railway dashboard"
echo "4. Run initial data ingestion:"
echo "   railway run --service backend npm run ingest:run"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"
