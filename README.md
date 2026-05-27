# AI News Agent

Daily AI/ML news automation for YouTube Shorts and TikTok.

## Setup

1. Clone repo
2. Run `python -m venv .venv`
3. Activate: `.venv\Scripts\activate.bat`
4. Install: `pip install -r requirements.txt`

## Run Locally

1. API: `python src/api_server.py`
2. Dashboard: `cd dashboard && npm install && npm run dev`
3. Pipeline: `python src/orchestrator.py pipeline`
4. Video: `python src/orchestrator.py video`
5. Publish: `python src/orchestrator.py publish`

## Deployment

- Full production guide: [DEPLOYMENT.md](DEPLOYMENT.md)
- Docker API entrypoint: [Dockerfile](Dockerfile)
- Railway backend config: [railway.json](railway.json)
- Compose stack: [docker-compose.yml](docker-compose.yml)
- Backend env template: [.env.example](.env.example)
- Frontend prod env template: [dashboard/.env.production.example](dashboard/.env.production.example)
