# webapp_factory

**This repository contains no code.** Its only file is the document that
used to be this README: a plan for an automated "software factory", plus a
detailed execution plan written for Google Jules to build it. The factory
was never built (one session, two commits, 2026-06-24).

## The design in the document

A self-replicating pipeline that treats app-store charts as a demand map
and mass-produces web versions of simple utilities:

1. **Trend scraper** — App Store top charts (RSS/Playwright), Product Hunt
   API, GitHub trending; an LLM feasibility filter keeps micro-utilities
   (calculator, unit converter, image compressor) and rejects platforms
   and backend-heavy apps.
2. **Spec agent** — deconstructs the target app into a rigid JSON spec
   (app name, Next.js/Tailwind framework, component list, allowed
   libraries only).
3. **Code engine** — component-by-component generation, then a self-healing
   loop: build in Docker, pipe errors back to the coding model, max 3
   patch attempts before human alert. Hard cost guardrail: pause any app
   that burns more than ~$2 of generation tokens.
4. **Repo & deploy** — GitHub API creates a repo per app; deploy via
   Vercel/Hetzner; Cloudflare API provisions subdomains (or a cheap TLD
   for high trend scores).
5. **Promotion engine** — programmatic SEO (generated meta/schema/landing
   copy, Search Console URL submission), directory submissions
   (AlternativeTo, Product Hunt), and social-thread discovery for
   "web alternative to X?" questions.
6. **Guardrails** — no original app names in titles/URLs (trademark),
   client-side-only execution for generated apps handling user files
   (sandboxing + cost).

The second half of the transcript converts all of this into a
Jules-ready execution plan (repo layout, `AGENTS.md` contents, workflow
spec, submodule references) — preserved in git history.

## Status

Blueprint only. Nothing here scrapes, generates, deploys, or promotes
anything; it is a plan for a system that would do those things, with the
cost and platform-abuse risks named in its own challenges section.
