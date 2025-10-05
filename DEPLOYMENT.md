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

```bash
railway up
```

This will deploy the backend service using the configuration in `railway.json` and `nixpacks.toml`.

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
HF_TOKEN=your_huggingface_token_here
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

```bash
railway service
```

Select "New Service" and choose "Deploy from GitHub repo". Select your repository and configure:

- **Build Command**: `cd frontend && npm run build`
- **Start Command**: `cd frontend && npx serve -s dist -l 3000`
- **Root Directory**: `frontend`

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

## Alternative: Deploy via Railway Dashboard

If you prefer using the web interface:

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your `rheum_biologics` repository
5. Railway will automatically detect the configuration files
6. Add the PostgreSQL service
7. Configure environment variables as listed above
8. Deploy both services

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
4. **Ingestion Failures**: Verify `HF_TOKEN` is valid and has access to the dataset

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
