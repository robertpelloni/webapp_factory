# MEMORY
- **Architecture Notes**: The system is designed as a monolithic Node.js orchestrator that discovers trends, generates isolated single-file HTML/JS widgets, and monitors operations through a unified Next.js dashboard. Local SQLite instances (`discovery.db` and `routes.db`) track state during local execution, using in-memory databases (`:memory:`) during Vitest suites.
- **Design Preferences**: We prefer strictly client-side Javascript execution for generated apps to avoid malware, security vulnerabilities, and server-side backend maintenance.
- **Testing**: We use Vitest for E2E tests and unit tests (`npm test` aliased to `vitest run`). All 13 test files and 20 tests pass.
- **Process Management**: A dedicated tray script `src/tray.js` manages starting, stopping, and inspecting factory services (`npm run tray`, `npm run start:all`, `npm run stop`).
- **Dashboard UI**: Consolidated into a single, high-value page at `src/dashboard/src/app/page.js` with live stats, interactive cycle execution (`/api/pipeline/run`), route embed snippets, and streaming daemon logs.

## Submodule Map
- **ScrapingAnt**: `submodules/scrapingant` (https://github.com/ScrapingAnt/scrapingant-client-python.git) - Used for reference Python cloud-bypassing scrapers if Playwright fails.
- **Vercel Platforms**: `submodules/platforms` (https://github.com/vercel/platforms.git) - Multi-tenant boilerplate reference.
- **shadcn-ui**: `submodules/shadcn-ui` (https://github.com/shadcn-ui/ui.git) - Component library reference.
