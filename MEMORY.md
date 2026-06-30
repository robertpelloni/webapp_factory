# MEMORY
- **Architecture Notes**: The system is designed as a monolithic Node.js orchestrator that spins up individual, ephemeral Next.js apps. We use a local SQLite instance (`discovery.db` and `routes.db`) for tracking state during local execution, specifically bypassing disk I/O issues in sandboxed environments by using in-memory databases (`:memory:`) during tests.
- **Design Preferences**: We prefer strictly client-side Javascript execution for generated apps to avoid malware, security vulnerabilities, and server-side backend maintenance.
- **Testing**: We use Vitest for E2E tests and unit tests. The `npm test` script is aliased to `vitest run`.

## Submodule Map
- **ScrapingAnt**: `submodules/scrapingant` (https://github.com/ScrapingAnt/scrapingant-client-python.git) - Used for reference Python cloud-bypassing scrapers if Playwright fails.
- **Vercel Platforms**: `submodules/platforms` (https://github.com/vercel/platforms.git) - Multi-tenant boilerplate reference.
- **shadcn-ui**: `submodules/shadcn-ui` (https://github.com/shadcn-ui/ui.git) - Component library reference.
