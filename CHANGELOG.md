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

## [0.0.9] - Live RSS Discovery
### Added
- Upgraded `src/discovery/scraper.js` to target and parse Apple's live iTunes Top Free Utilities RSS feed using Playwright.
- Validated DOM extraction logic to natively parse `title`, `summary`, and `category` from the returned XML payload.

## [0.1.0] - Phase 3 & 4 Completion

### Added
- **Single-File Widget Generation**: The LLM code generator (`src/generator/index.js`) now exclusively outputs lightweight Vanilla JS/HTML/Tailwind CSS files instead of heavy Next.js boilerplates.
- **Cross-Browser Playwright Integration Matrix**: Added `tests/embed-integration.test.js` to physically simulate widget embedding in Chromium, Firefox, and WebKit, verifying isolation against global DOM events and CSS bleeds.
- **Vercel Multi-Tenant Domain Mapping**: The deployer module (`src/deployer/vercel.js`) actively calls Vercel API v9/v13 endpoints to map wildcard subdomains dynamically.
- **Automated Documentation Generator**: Added a new GitHub Actions workflow and `src/docs/generator.js` module to parse widget code and auto-generate structured Markdown documentation summarizing props, methods, and events.
- **SEO Scaffolding**: Added duplicate prevention logic to `sitemap.xml` management and scaffolded the Google Search Console index API logic.

### Changed
- Refactored Next.js Dashboard into a unified, single-page UI with shadcn/ui tooltips for better daemon log, discovery backlog, and deployment monitoring.
- Updated Dashboard API routes to be `force-dynamic` to prevent static build caching during Docker deployment.
- Enhanced Vitest testing suite timeouts to smoothly handle headless browser CI execution.

### Fixed
- Stabilized LLM self-healing build loops by extracting `<script>` tags to run `node -c` validations directly instead of relying on heavy build runners.
- Patched Vercel API mock fallbacks to handle API rate limiting smoothly.

## [3.0.0] - Widget Generator & Validation Completion
### Added
- Successfully finalized the integration of the Vanilla-JS widget generator to output exclusively single-file, embed-ready payloads.
- Added comprehensive cross-browser validation checks (Chromium, Firefox) utilizing Playwright inside the CI pipeline (`tests/embed-integration.test.js`) to strictly enforce DOM event encapsulation and prevent CSS bleed.
- Integrated dashboard UI updates to allow the frontend team one-click copying of `<iframe>` snippets for generated utilities.

### Fixed
- Cleaned up the local repository state, deleting all stale PR tracking and feature branches (e.g., `temp_branch`, `feat/embed-test-harness`, `feat/phase-5-seo-ops`).
- Finalized version bump and explicit release tag synchronization to `v3.0.0`.

### Post-v3.0.0 Refinements & CI Validation
- Executed full test matrix covering 10 test suites via Vitest and Playwright.
- Drafted `CI_COVERAGE_REPORT.md` tracking remaining non-blocking coverage gaps in the Next.js Dashboard UI, `node-cron` orchestrator mocking, and explicit `prompts.chat` scraper tests for future triage.

### Fixed (Post-v3.0.0 Triage)
- Resolved the dynamic data validation gap identified in `FEAT_PHASE3_REFINEMENT_TICKET.md`.
- Implemented `tests/dynamic-data.test.js` to assert that all LLM-generated widget payloads inherently contain `try/catch` boundaries and graceful UI state rendering for asynchronous DOM updates, eliminating uncaught browser crashes on embedded iframes.

## [4.0.0] - Phase 5 Completion & Autonomous Loop Finalization
### Added
- Successfully integrated the `googleapis` library.
- Completed Phase 5 (Programmatic SEO Operations) by wiring `src/seo/index.js` into the live Google Search Console URL Submission API. The daemon now actively pings Google for instant indexing of new payloads when valid GCP credentials are provided.
### Fixed
- Stabilized GitHub Actions workflow to safely escape string execution characters during automated PR commits.

### Fixed (Post-v4.0.0 Triage)
- Developed and executed load testing suite (`tests/load.test.js`) which simultaneously simulated 1,000+ asynchronous discovery logging interactions alongside Vercel deployments to completely validate backend database architecture resilience.
- Confirmed SQLite architectures securely handled asynchronous scaling via serialized transactions with zero database deadlocks or data corruption instances.

### Added (Phase 6 Triage)
- Implemented `tests/dashboard.test.js` to natively sandbox and validate Next.js clipboard interactions via Playwright.
- Upgraded `tests/seo.test.js` to simulate invalid credentials explicitly failing inside the `googleapis` library.

### Post-v4.0.0 Validation
- Conducted full CI suite run explicitly validating 19 test cases across 12 test suites, ensuring total compliance for dynamic postMessage injections, staging deployment routing, cross-browser embed constraints, Next.js clipboard interactions, and concurrent database load tests.

### Post-Release Refinements & CI Execution
- Triggered final integration suite validation (19 fully compliant tests across 12 E2E matrices) following the latest branch sync.
- Validated all Next.js Sandbox interactions and Google API credentials boundaries successfully.

### Post-v4.0.0 Triage Finalization
- Re-executed full test matrix post-cleanup: 19 test cases successfully validated.
- Concurrency logic, single-file widget constraints, auto-healing thresholds, staging mocks, and Google API auth fallbacks verified stable against `main`.
