# Autonomous Utility Factory

A fully autonomous application factory built to dynamically discover, generate, deploy, and promote client-side web utilities based on real-time app store trends.

## Project Structure
- **/src/discovery**: Uses Playwright and ScrapingAnt to poll RSS feeds (Apple Top Charts, Product Hunt) and scrape trending prompts. Dedupes entries via SQLite/PostgreSQL.
- **/src/generator**: An LLM-powered engine (Gemini API) that writes lightweight, embed-ready Single-File Widgets (HTML / Vanilla JS / Tailwind). Includes an automated healing loop (`node -c` syntax validation).
- **/src/deployer**: Pushes generated code to the cloud dynamically via Vercel's REST API and actively manages Wildcard Subdomain Routing mapping.
- **/src/seo**: Generates meta tags, patches sitemaps programmatically, and pings the Google Search Console API.
- **/src/docs**: Utilizes an automated GitHub Actions pipeline and LLM extraction to generate markdown widget documentation.
- **/src/dashboard**: A local Next.js monitoring UI to view daemon logs, discovered backlogs, and actively deployed Vercel subdomains.

## Setup & Running Locally

Ensure you have Node.js v20+ and Docker installed.

### Standard Setup

```bash
# 1. Install Dependencies
npm install
npm run test

# 2. Setup Env Variables
cp .env.example .env
# Populate GEMINI_API_KEY, VERCEL_API_TOKEN, etc.

# 3. Boot Dashboard & Daemon Pipeline
node index.js
```

### Docker Usage
The entire factory, including headless Playwright browsers and the monitoring dashboard, is containerized.

```bash
docker-compose up --build -d
```
Access the Live Monitoring Dashboard at `http://localhost:3000`.

## Testing & Compatibility Validation
Vitest is used for E2E and Unit testing. We utilize a comprehensive Playwright Integration Test Matrix to cross-check Chromium, Firefox, and WebKit to guarantee iframe compatibility.

```bash
# Run all E2E mocking and DOM integration checks
npm run test
```

## Latest Updates (v3.0.0)
The Factory has pivoted away from generating heavy Next.js projects to generating lightning-fast **Single-File Vanilla JS** widgets. These widgets are strictly restricted from global CSS/DOM mutations to guarantee flawless integration into any legacy CMS iframe. Documentation is now fully automated.
