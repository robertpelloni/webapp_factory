# Release Notes - v3.0.0

## Overview
We are thrilled to announce the completion of Phase 3 and Phase 4 of the Autonomous Web Application Factory! The core LLM Generator loop has been successfully pivoted to output lightweight, embed-ready Single-File Widgets, completely replacing the heavy Next.js generation pipeline.

## Key Features
* **Zero Dependencies:** Generated widgets rely solely on Vanilla JS and CDN-delivered Tailwind CSS, requiring no build step or node package installations on the host platform.
* **Embed Ready & Isolated:** All generated components include isolated scopes, guaranteeing they do not bleed CSS styling or conflict with the host's DOM environment.
* **Vercel Multi-Tenant Deployments:** The deployment pipeline now actively uses Vercel's v9/v13 APIs to seamlessly assign custom domains to the generated HTML payloads.
* **Automated Monetization:** A universal, unintrusive ad banner is automatically injected during the generation phase for immediate monetization.
* **Syntax Guardrails:** A self-healing loop runs `node -c` against extracted `<script>` blocks to ensure no fatal JS syntax errors are shipped to production.
* **Automated Documentation:** A custom GitHub action and LLM documentation generator have been scaffolded to automatically generate markdown docs parsing the widget's API structure.

## Limitations & Constraints
* **Global Overrides Forbidden:** Widgets are strictly prohibited from mutating global styles (e.g., `body { ... !important }`) or global DOM events (e.g., overriding `window.onload`). While this guarantees iframe compatibility, it restricts overly complex widget interactions.
* **Single File Structure:** Everything (HTML, CSS, JS) must live within one file. Complex component splitting or heavy application logic isn't suited for this architectural pattern.

## Testing & Validation
All testing phases (E2E mocking, unit discovery, SEO logic, documentation generation, and deep Playwright DOM integration across a cross-browser matrix of Chromium, Firefox, and WebKit) are fully passing as of this v3.0.0 release.
