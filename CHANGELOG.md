# CHANGELOG
## [0.0.1] - Current Build
### Added
- Core pipeline architecture scaffolding.
- Discovery module with SQLite deduplication.
- Generator module with mock LLM and self-healing build loop.
- Deployer module mapping slugs to wildcard subdomains.
- SEO module for automatic metadata generation and sitemap patching.
- Vitest E2E test suite.
- Essential operational documentation (`VISION.md`, `ROADMAP.md`, `TODO.md`, `MEMORY.md`, `DEPLOY.md`, `IDEAS.md`, `CHANGELOG.md`).

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
