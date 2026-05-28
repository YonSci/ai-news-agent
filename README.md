# AI News Traker Agent

A real-time dashboard tracking AI news from Anthropic, OpenAI, Google Gemini, and popular AI CLI tools.
Aggregates content from Hacker News, GitHub Releases, and RSS feeds from free, public data sources with no API keys required.

A modern, AI-powered news dashboard built with Next.js, React, and TypeScript.
Visualize, filter, and personalize news from global sources with advanced analytics and summaries.
Stay informed with AI-powered news insights, interactive visualizations, and personalized content from around the world.

## Data Sources

HN Top 500 stories filtered by AI keywords (claude, openai, gemini, chatgpt, copilot, llm, agentic, etc.) via the Firebase API.

### GitHub Releases

Tracked repositories:

- anthropics/claude-code
- openai/codex
- getcursor/cursor
- paul-gauthier/aider
- cline/cline
- continuedev/continue
- google-gemini/gemini-cli

### RSS Feeds

- Anthropic News (scraped from anthropic.com/news)
- OpenAI News
- Google AI Blog (DeepMind)
- TechCrunch AI
- The Verge AI
- Ars Technica AI
- VentureBeat AI

## How It Works

The system continuously aggregates public AI news signals, deduplicates and scores them,
then serves them to the dashboard for filtering, personalization, and real-time tracking.

## Local Development

1. Clone repo
2. Run `python -m venv .venv`
3. Activate: `.venv\Scripts\activate.bat`
4. Install backend requirements: `pip install -r requirements.txt`
5. Run API: `python src/api_server.py`
6. Run dashboard: `cd dashboard && npm install && npm run dev`

## Features

### Interactive Charts

Visualize news trends with pie charts, bar graphs, and timeline analytics.

### AI Summaries

Get concise AI-powered summaries of articles using advanced language models.

### Global Coverage

Access news from multiple regions and filter by country, topic, and date range.

### Smart Filtering

Advanced search and filtering capabilities to find exactly what you need.

## Tech Stack

- Next.js, React, TypeScript
- Flask + Python APIs
- SQLite persistence
- TanStack Query + Zustand
- Netlify + Railway deployment

## License

Refer to the repository license file for usage terms.
