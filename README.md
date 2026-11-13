# Autonomous Utility Factory (`webapp_factory`)

An application factory that discovers trending web-utility ideas, generates single-file widgets with an LLM, deploys them to Vercel, and promotes them via programmatic SEO — intended to run as an autonomous daemon with a local monitoring dashboard.

## Status

**Active prototype (v4.3.0).** Last significant activity: **2026-11-12** — merge of a consolidated-dashboard/tray feature branch (Protocol #281). v4.3.0 (Nov 8, 2026) added a unified dashboard, SEO suite, Discord/Slack webhook alerts, and a CI/CD pipeline workflow.

The previous README described v3.0.0 and called the factory "fully autonomous" with "guaranteed" iframe compatibility — those are aspirations, not verified facts. There is no evidence in the repo of live deployed widgets or revenue; the pipeline is code plus tests, not a proven production system.

## Project structure

- `src/discovery` — Playwright + ScrapingAnt polling of RSS feeds (Apple Top Charts, Product Hunt) and trending prompts; dedupes via SQLite/PostgreSQL
- `src/generator` — LLM-powered engine (Gemini API) that writes lightweight, embed-ready Single-File Widgets (HTML / Vanilla JS / Tailwind); automated healing loop (`node -c` syntax validation)
- `src/deployer` — pushes generated code to Vercel via REST API; manages wildcard subdomain routing
- `src/seo` — meta tags, programmatic sitemap patching, Google Search Console API pings
- `src/docs` — automated GitHub Actions pipeline + LLM extraction generating markdown widget documentation
- `src/dashboard` — local Next.js monitoring UI for daemon logs, discovered backlogs, and deployed Vercel subdomains

## Setup & running

Node.js v20+ and Docker required.

```bash
npm install
npm run test
cp .env.example .env   # populate GEMINI_API_KEY, VERCEL_API_TOKEN, etc.
node index.js
```

Docker:

```bash
docker-compose up --build -d
```

Dashboard at `http://localhost:3000`.

## Testing

Vitest for unit/E2E tests; Playwright integration matrix across Chromium, Firefox, and WebKit for iframe compatibility checks. Run with `npm run test`. See `CI_COVERAGE_REPORT.md` for the current coverage picture.
