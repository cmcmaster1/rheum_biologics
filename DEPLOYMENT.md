# Railway Deployment Guide

This guide will help you deploy the Rheumatology Biologics application to Railway.

## Prerequisites

1. GitHub repository created (✅ Done: https://github.com/cmcmaster1/rheum_biologics)
2. Railway account (sign up at https://railway.app)
3. Railway CLI installed (✅ Done)

## Deployment Steps

### 1. Login to Railway

```bash
railway login
```

Follow the prompts to authenticate with your Railway account.

### 2. Create a New Project

```bash
railway new
```

Choose a name for your project (e.g., "rheum-biologics") and select the GitHub repository when prompted.

### 3. Add PostgreSQL Database

```bash
railway add postgresql
```

This will create a PostgreSQL database service in your Railway project.

### 4. Deploy the Backend

**Option A: Deploy Backend Service**
1. In Railway dashboard, create a new service
2. Select "Deploy from GitHub repo"
3. Choose your repository
4. Set **Root Directory** to `backend`
5. Railway will use the `backend/nixpacks.toml` configuration

**Option B: Use CLI (if working)**
```bash
railway up
```

### 5. Configure Environment Variables

In the Railway dashboard, go to your backend service and add the following environment variables:

#### Required Environment Variables:

```
DATABASE_URL=<automatically provided by Railway PostgreSQL>
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.railway.app
BIOLOGICS_INGEST_ENABLED=true
BIOLOGICS_INGEST_CRON=0 4 1 * *
BIOLOGICS_INGEST_TZ=Australia/Sydney
BIOLOGICS_INGEST_LOOKBACK=3
# Note: No external API tokens required - data is sourced directly from PBS website
```

#### Optional Environment Variables:

```
CORS_ORIGIN=*  # For development, restrict in production
```

### 6. Run Database Migrations

After the backend is deployed, run the database migrations:

```bash
railway run psql $DATABASE_URL -f backend/db/migrations/001_init.sql
railway run psql $DATABASE_URL -f backend/db/migrations/002_alter_column_lengths.sql
```

### 7. Deploy the Frontend

Create a new service for the frontend:

1. In Railway dashboard, click **"+ New"** → **"Service"**
2. Select **"Deploy from GitHub repo"**
3. Choose your repository
4. Set **Root Directory** to `frontend`
5. Railway will automatically use the `frontend/nixpacks.toml` configuration

### 8. Configure Frontend Environment Variables

In the Railway dashboard, go to your frontend service and add:

```
VITE_API_BASE_URL=https://your-backend-domain.railway.app/api
```

### 9. Run Initial Data Ingestion

After both services are deployed, run the initial data ingestion:

```bash
railway run --service backend npm run ingest:run
```

## Alternative: Deploy via Railway Dashboard (Recommended)

**IMPORTANT**: This is a monorepo with separate backend and frontend services. You need to deploy them as separate services.

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your `rheum_biologics` repository
5. **Add PostgreSQL Database**:
   - Click "+ New" → "Database" → "PostgreSQL"
6. **Deploy Backend Service**:
   - Click "+ New" → "Service" → "Deploy from GitHub repo"
   - Select your `rheum_biologics` repository
   - **Set Root Directory to `backend`**
   - Railway will use `backend/nixpacks.toml`
7. **Deploy Frontend Service**:
   - Click "+ New" → "Service" → "Deploy from GitHub repo"
   - Select your `rheum_biologics` repository
   - **Set Root Directory to `frontend`**
   - Railway will use `frontend/nixpacks.toml`
8. Configure environment variables as listed above

## Monitoring and Logs

- View logs: `railway logs`
- View logs for specific service: `railway logs --service backend`
- Monitor in dashboard: https://railway.app/dashboard

## Custom Domains

To add custom domains:

1. Go to your service in Railway dashboard
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Configure DNS records as instructed

## Troubleshooting

### Common Issues:

1. **Database Connection Issues**: Ensure `DATABASE_URL` is set correctly
2. **CORS Issues**: Check `CORS_ORIGIN` matches your frontend URL
3. **Build Failures**: Check logs for missing dependencies or build errors
4. **Ingestion Failures**: Check that PBS website is accessible and CSV files are available

### Useful Commands:

```bash
# Check service status
railway status

# View environment variables
railway variables

# Connect to database
railway connect postgresql

# Run commands in service
railway run --service backend npm run ingest:run
```

## Production Considerations

1. **Security**: Set up proper CORS origins for production
2. **Monitoring**: Enable Railway's monitoring features
3. **Backups**: Configure automatic database backups
4. **Scaling**: Consider Railway's scaling options for high traffic
5. **SSL**: Railway provides automatic SSL certificates

## Cost Optimization

- Use Railway's free tier for development
- Monitor usage in the dashboard
- Consider upgrading plans based on traffic and resource usage
