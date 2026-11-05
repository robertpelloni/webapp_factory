# CHANGELOG

## [4.1.0] - 2026-11-05
### Added
- Automated factory cycle execution via CLI / Tray Controller (`node src/tray.js --run`, `node src/tray.js --dry-run`).
- Ingested 6 real-world utilities from App Store RSS into `discovery.db` (Google, Chrome, Phone Storage Cleaner, Edge, Apple Support, Verizon).
- Generated and deployed new client-side widget `unit-converter-pro.utilityhub.com` into `routes.db` and sitemap.
- Consolidated single-page monitoring dashboard UI in Next.js with high-value metric cards, real-time trigger controls, and informative tooltips.
- New dashboard backend endpoints: `/api/pipeline/run` (instant factory cycle execution & dry run) and `/api/pipeline/status` (system uptime, process memory, and database entity counts).
- Server tray & process management controller (`src/tray.js`) with support for `--status`, `--run`, `--dry-run`, `--start-all`, and `--quit`.
- New package scripts: `npm run tray`, `npm run start:all`, and `npm run stop`.

### Changed
- Refactored dashboard Tailwind and PostCSS configuration to support clean static and dynamic compilation under Next.js 14.
- Updated `start-container.sh` to align with the daemon architecture.

## [4.0.0] - 2026-07-29
### Added
- Product Hunt daily trending scraping module (`src/discovery/producthunt.js`).
- ChatGPT prompt discovery scraper (`src/discovery/prompts.js`).
- Automated markdown documentation generator via Gemini LLM (`src/docs/generator.js`).
- Automated widget ad banner injection for client-side monetization.
- Wildcard subdomain deployment via Vercel API and mock SQLite routing.

## [3.0.0] - 2026-06-30
### Added
- Single-File HTML / Tailwind / Vanilla JS widget generation with self-healing loop.
- Submodule integration for `shadcn-ui`, `platforms`, and `scrapingant`.
- Comprehensive Vitest testing suite and Playwright iframe sandbox checks.
