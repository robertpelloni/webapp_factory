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
