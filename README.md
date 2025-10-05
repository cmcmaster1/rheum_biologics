# Rheumatology Biologics Lookup

A modern, server-hosted web application for rheumatologists to explore Pharmaceutical Benefits Scheme (PBS) biologics data. The system replaces the legacy Gradio prototype with a modular architecture consisting of a TypeScript/Express API, PostgreSQL storage, a React + MUI frontend, and an in-process Node.js ingestion job that pulls PBS CSV exports directly into the biologics database.

## Project Structure

- `backend/` – Express + TypeScript API, PostgreSQL schema, REST endpoints, and scheduled ingestion jobs
- `frontend/` – React (Vite) client with React Query, MUI, and Zustand filters
- `data_old.py` / `old_app.py` – legacy scripts retained for reference
- `AGENTS.md` – planning brief used to scope this rebuild

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### 1. Database

```bash
createdb rheum_biologics
psql rheum_biologics -f backend/db/migrations/001_init.sql
psql rheum_biologics -f backend/db/migrations/002_alter_column_lengths.sql
```

### 2. Backend API & Ingestion Job

```bash
cd backend
cp .env.example .env # Update DATABASE_URL / PORT / scheduling variables as needed
npm install
npm run dev
```

The backend automatically schedules a monthly ingestion (default: 04:00 on the 1st, Australia/Sydney). Configuration is controlled via:

- `BIOLOGICS_INGEST_ENABLED` – toggle the scheduler
- `BIOLOGICS_INGEST_CRON` – cron expression
- `BIOLOGICS_INGEST_TZ` – timezone string for node-cron
- `BIOLOGICS_INGEST_LOOKBACK` – months to look back if the current schedule is unavailable

Run an ingestion manually at any time:

```bash
npm run ingest:run            # fetch latest available schedule
npm run ingest:run -- --date=2025-10  # ingest a specific schedule (YYYY-MM)
```

Key API endpoints (prefixed with `/api`):

- `GET /api/schedules`
- `GET /api/combinations`
- `GET /api/drugs`
- `GET /api/indications`
- `GET /api/brands`
- `GET /api/formulations`
- `GET /api/treatment-phases`
- `GET /api/hospital-types`

### 3. Frontend

```bash
cd frontend
cp .env.example .env # Ensure VITE_API_BASE_URL matches backend
npm install
npm run dev
```

## Next Steps

- Configure CI/CD (tests, lint, deploy) for backend and frontend packages
- Containerise services with Docker Compose for reproducible environments
- Implement authentication and bookmarking (Phase 5 roadmap)
- Add PDF/CSV export services and offline caching (Phase 3/5 roadmap)
- Integrate observability (logging, metrics, alerts) and ingestion run monitoring

## Licensing

Pending project licensing decision.
