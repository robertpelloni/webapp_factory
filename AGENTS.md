# Target Objective: Build the Autonomous Utility Factory

You are tasked with building an asynchronous web application factory. The core app must run on a schedule (Cron), discover top-trending mobile/web utilities, write specifications for clean React/Next.js implementations, generate the code, verify the build, deploy via Vercel API, and trigger programmatic SEO pages.

## Module Breakdown to Implement

### 1. Discovery Pipeline (`/src/discovery/`)
*   Implement a robust scraper utilizing Playwright/ScrapingAnt to poll:
    *   Apple App Store Top Free Utilities RSS Feed.
    *   Google Play Store Top Free Productivity Charts.
    *   Product Hunt Daily Trending API.
*   **Deduplication Filter:** Build a PostgreSQL or SQLite tracking layer to prevent processing an application that has already been generated.
*   **Feasibility Guardrail:** Use a lightweight Gemini 2.5 Flash call to parse the description. Reject apps requiring persistent custom user backends or databases. Focus exclusively on client-side state utilities (Calculators, Converters, Formatters, Mini-Games, CSS Generative tools).

### 2. Spec Writer & Isolation Chamber (`/src/generator/`)
*   Input: Filtered App Data.
*   Output: A structured `spec.json` defining component architecture.
*   **Code Generation:** Implement an internal agent routine that reads `spec.json` and uses the latest Gemini 3 Pro model to generate single-file Next.js App Router endpoints utilizing Tailwind CSS and Lucid React icons.
*   **The Healing Loop:**
    *   Write a script that drops generated code into an isolated local node directory.
    *   Programmatically execute `npm run build`.
    *   If the compiler catches linting errors, type mismatches, or build breaks, catch the standard error output (`stderr`) and feed it back to the model for a continuous correction loop (capped at 3 attempts).

### 3. Dynamic Multi-Tenant Deployment (`/src/deployer/`)
*   Instead of creating thousands of unique Vercel projects, utilize the architecture found in `submodules/platforms`.
*   Configure the project to handle dynamic multi-tenancy via Wildcard Subdomains.
*   When a code build passes, save the source code to a dedicated directory or database layer mapping the slug (e.g., `apps/calculator`) to the active sub-domain routing table (`calculator.utilityhub.com`).

### 4. Automated Indexing Engine (`/src/seo/`)
*   **Metadata Generation:** For every successful app, auto-generate high-intent semantic target tags (`<title>`, `<meta name="description">`, OpenGraph images).
*   **Sitemap Patching:** Write an automated utility that updates a global `sitemaps.xml` across the multi-tenant routing structure.
*   **Instant Indexing:** Hook up the Google Search Console URL Submission API to automatically prompt immediate crawler indexing of the freshly deployed route.

## Verification Requirements (Definition of Done)
1. Provide unit tests (`vitest`) for the discovery scrapers ensuring correct parsing of titles and categories.
2. Build an E2E mocking suite where a mock `spec.json` for a "Percentage Calculator" is fed into the pipeline, passes through the build validator, and correctly flags syntax errors if deliberately injected.
