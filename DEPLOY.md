# DEPLOYMENT INSTRUCTIONS
To deploy the overarching factory orchestration script:
1. Provision a VPS (e.g., Ubuntu on Hetzner or DigitalOcean).
2. Clone the repository and run `npm install`.
3. Set environment variables: `VERCEL_API_TOKEN`, `GEMINI_API_KEY`, `PLAYWRIGHT_BROWSERS_PATH`.
4. Run the factory on a cron job: `0 0 * * * cd /app && npm run start-factory`.
(Note: Actual factory start script and API tokens are pending in Phase 3/4).
