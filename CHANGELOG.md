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
