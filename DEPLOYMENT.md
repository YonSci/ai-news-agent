# Deployment Guide

## Recommended Stack

- Backend API + worker: Render or Railway
- Frontend (dashboard): Vercel or Netlify
- Storage: persistent disk/volume for `data/` and `logs/`

## Option A: Render + Vercel (recommended)

### One-click Render Blueprint

- Use [render.yaml](render.yaml) at the repository root.
- It provisions:
  - a Docker web service for the API
  - a persistent disk mounted at `/app/data`
  - all required environment variable placeholders

### Scheduler note (important)

- This blueprint intentionally deploys API only.
- Render persistent disks are service-scoped, so API and worker should not assume they can share one writable local disk.
- Run pipeline jobs manually for now (`python src/orchestrator.py pipeline`) or move shared state to managed services (Postgres + object storage) before adding a cloud worker.

### 1. Push repo to GitHub

- Create a GitHub repo and push this project.

### 2. Deploy backend on Render

- Create a **Web Service** from this repo.
- Environment: `Docker`
- Root: project root
- Build/Start: use `Dockerfile` (auto-detected)
- Expose port `5000`
- Add env vars from `.env.example`.
- Add a Persistent Disk and mount at `/app/data`.

### 3. Run pipeline jobs

- Use manual runs while API is deployed:
  - `python src/orchestrator.py pipeline`
  - `python src/orchestrator.py video`
  - `python src/orchestrator.py publish`
- Optional: add a worker later after moving from local disk sharing to managed storage.

### 4. Deploy frontend on Vercel

- Import `dashboard/` as project root.
- Build command: `npm run build`
- Output directory: `dist`
- Add env var: `VITE_API_URL=https://<your-backend-domain>/api`

### 5. Validate

- Open frontend and verify dashboard loads from live API.
- Run backend endpoint check:
  - `GET /api/content`
  - `GET /api/stats/dashboard`

## Option B: Railway (backend + worker) + Vercel

- Deploy backend using Dockerfile.
- Add a second Railway service for worker with command:
  - `python src/orchestrator.py schedule`
- Attach persistent volume for `/app/data`.
- Deploy dashboard on Vercel with `VITE_API_URL` set.

## Option C: Single VM (DigitalOcean/AWS Lightsail)

- Install Docker + Docker Compose.
- Copy `.env.example` to `.env` and fill values.
- Run API:
  - `docker compose up -d api`
- Run scheduler:
  - `docker compose --profile worker up -d scheduler`
- Put Nginx/Caddy in front with HTTPS.

## Local Production-like Test

- `copy .env.example .env` (Windows)
- `docker compose up --build -d api`
- `curl http://127.0.0.1:5000/api/content`
- `docker compose --profile worker up -d scheduler`

## Important Notes

- `config/client_secrets.json` (YouTube OAuth) is required only for YouTube upload.
- TikTok auto-upload requires approved TikTok developer app and valid access token.
- If TikTok auto-upload is not configured, publish stage falls back to creating a manual package in `data/approved/tiktok_ready`.
