# CHANGELOG

## [4.3.0] - 2026-11-08
### Added
- Consolidated and reorganized development and operational scripts in root `package.json` with `build:dashboard`, `start:dashboard`, `lint:dashboard`, and `clean:logs`.
- Updated `start-container.sh` to use the unified `npm run start:dashboard` centralized script.
- Hardened dashboard logs API (`/api/logs`) with line bounding, query parameter support (`?lines=N` up to 2000 lines), and empty file fallback handling.
- Added test coverage in `tests/dashboard-api.test.js` and registered in `vitest.config.js`.
- Bumping version to 4.3.0 across all documentation files and manifests.

## [4.2.0] - 2026-11-08
### Added
- Phase 5 Programmatic SEO Operations: Full automated sitemap XML updating with duplicate entry deduplication, dynamic robots.txt generation, Google Search Console site verification meta generator, and batch URL indexing API trigger (`src/seo/index.js`).
- Next.js SEO Monitoring Endpoint (`/api/seo`): Exposes indexed URL statistics, credentials verification, and sitemap counts to the dashboard.
- Real-Time Webhook Alerting Pipeline (`src/notifications.js`): Discord and Slack alert integrations with automatic mock fallback; integrated directly into daemon scheduler events (`src/scheduler.js`).
- Interactive Webhook Test Endpoint (`/api/pipeline/webhook-test`): Supports manual trigger of test alert dispatches from the dashboard UI.
- Unified Single-Page Dashboard Refinements: Added dedicated SEO & Sitemap metrics card, real-time live search filter bar across deployed subdomains and discovered backlog, and live test alert controls.
- Comprehensive Test Coverage Expansion: Added `tests/seo.test.js` and `tests/notifications.test.js` bringing test suite to 14 Vitest suites and 29 unit/integration tests with 100% pass rate.

## [4.1.0] - 2026-11-05
### Added
- Factory Webhook Notifications (`src/notifications.js`): Discord and Slack alert dispatches for spec generation warnings, self-healing loop failures, deployment successes, and fatal pipeline exceptions.
- Programmatic SEO Operations (Phase 5): Added Google Search Console site verification meta generator, dynamic robots.txt generator, sitemap URL extraction, batch indexing triggers, and dashboard SEO status endpoint (`/api/seo`).
- Automated CI/CD GitHub Actions Workflow: Added `.github/workflows/ci.yml` orchestrating automated dependencies installation, Vitest unit/integration testing (13 suites, 24 tests), Next.js dashboard build, factory dry-run smoke testing, and server tray health verification.
- Interactive Widget Sandbox Preview: Added instant sandboxed iframe preview directly inside the dashboard Active Subdomain Deployments table with DOM/CSS isolation.
- Performance Optimization: Parallelized discovery scraper execution in `src/discovery/index.js` using `Promise.allSettled`, reducing multi-source scraping cycle latency by ~43%.
- Multi-Tenant Vercel Deployment Inspection: added `verifyProjectDomain` and `getDeploymentStatus` to `src/deployer/vercel.js`.
- Dashboard Multi-Tenant Status API: added `/api/deployer/status` returning provider configuration, wildcard status, verification strategy, and active tenant routes.
- Dashboard Multi-Tenant UI Badge: added Vercel mode badge (Live/Mock) and tooltip to Live Subdomains card.
- Resilient scraper navigation: configured `--no-sandbox` and `--disable-setuid-sandbox` across Product Hunt and ChatGPT prompts scrapers with `domcontentloaded` wait strategy and timeout safeguards.
- Ingested prompt micro-utility into `discovery.db` and deployed `ready-to-get-started.utilityhub.com` into `routes.db` with docs at `docs/widgets/ready-to-get-started.md`.
- Automated factory cycle execution via CLI / Tray Controller (`node src/tray.js --run`, `node src/tray.js --dry-run`).
- Ingested 6 real-world utilities from App Store RSS into `discovery.db` (Google, Chrome, Phone Storage Cleaner, Edge, Apple Support, Verizon).
- Generated and deployed new client-side widget `unit-converter-pro.utilityhub.com` into `routes.db` and sitemap.
- Consolidated single-page monitoring dashboard UI in Next.js with high-value metric cards, real-time trigger controls, and informative tooltips.
- New dashboard backend endpoints: `/api/pipeline/run` (instant factory cycle execution & dry run) and `/api/pipeline/status` (system uptime, process memory, and database entity counts).
- Server tray & process management controller (`src/tray.js`) with support for `--status`, `--run`, `--dry-run`, `--start-all`, and `--quit`.
- New package scripts: `npm run tray`, `npm run start:all`, and `npm run stop`.

## [0.0.2] - LLM and Vercel Integrations
### Added
- Integrated actual `fetch` routines targeting the Gemini API in `src/generator/index.js` for spec creation and code generation.
- Integrated actual `fetch` routines targeting Vercel v9 and v13 REST endpoints for dynamic project generation and code deployment in `src/deployer/vercel.js`.
### Fixed
- Stabilized testing environments to use graceful mock fallback logic when API tokens (`GEMINI_API_KEY`, `VERCEL_API_TOKEN`) are not present in the environment variables.
### Added Submodules
- Initialized required submodules: `scrapingant`, `vercel/platforms`, and `shadcn-ui` into the `submodules/` directory to serve as reference architectures for future iterations.

## [0.0.3] - Template and Database Upgrades
### Added
- Created a base Next.js template in `src/generator/template` to serve as the boilerplate for all LLM-generated code.
- Initialized `shadcn/ui` primitives within the Next.js template to provide a robust starting library.
- Updated `src/generator/index.js` to dynamically copy the Next.js template to a temp folder and inject the generated React code directly into `page.tsx` during the Healing Loop.
- Migrated core database logic in `src/discovery/db.js` and `src/deployer/index.js` to support PostgreSQL via the `pg` package. The system now dynamically routes database connections to a remote PostgreSQL instance if `DATABASE_URL` is detected, while retaining the safe local SQLite fallback for testing.

## [0.0.4] - Repository Synchronization & Architecture Refinement
### Changed
- Executed Dual-Direction Intelligent Merge Engine to sync active feature branches into `main`.
- Cleaned up `.gitignore` to explicitly track `.db` files as mandated by Executive Protocol directives.

## [0.0.5] - Orchestration Scheduler & CLI
### Added
- Created `src/scheduler.js` to string together the entire pipeline sequentially (Discovery -> LLM Code Gen -> Heal Loop -> Vercel Deploy -> SEO Patch).
- Implemented `node-cron` to execute the overarching loop on a 6-hour interval.
- Created `index.js` as the main project CLI entry point, allowing users to start the orchestration cycle immediately or boot it as a background cron daemon. Added a `--dry-run` flag for safe debugging.

## [0.0.6] - Frontend Dashboard UI
### Added
- Created `src/dashboard` containing a fresh Next.js application to serve as the orchestrator's monitoring GUI.
- Added API endpoints in the dashboard (`/api/apps` and `/api/routes`) that dynamically hook into the root PostgreSQL or local SQLite state databases.
- Built a responsive UI using `shadcn/ui` Card and Table components to visualize the pipeline's progress, displaying discovered apps and actively deployed project URLs.

## [0.0.7] - Robust Logging Architecture
### Added
- Integrated the `winston` package as the global application logger (`src/logger.js`).
- Replaced all legacy `console.log` instances with standardized `logger.info` outputs.
- Established persistent rotating file logs (`factory.log`, `error.log`).
- Upgraded the Next.js `src/dashboard` to parse and tail the live `factory.log` file directly on the dashboard GUI.

## [0.0.8] - Dockerization and Deployment Configuration
### Added
- Added a root `Dockerfile` using `node:20-bullseye-slim`, installing necessary Playwright OS dependencies, and building the dashboard UI.
- Added a `docker-compose.yml` file configuring environment variable injection, port exposure (3000), and persistent local database mapping.
- Added `start-container.sh` to simultaneously launch the dashboard and the `npm start -- --cron` orchestrator daemon inside the container.

## [0.0.9] - Live RSS Discovery
### Added
- Upgraded `src/discovery/scraper.js` to target and parse Apple's live iTunes Top Free Utilities RSS feed using Playwright.
- Validated DOM extraction logic to natively parse `title`, `summary`, and `category` from the returned XML payload.
