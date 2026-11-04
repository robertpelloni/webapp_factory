# DEPLOYMENT INSTRUCTIONS

## Quick Start
1. Clone the repository and initialize submodules:
   ```bash
   git submodule update --init --recursive
   npm install
   cd src/dashboard && npm install && npm run build && cd ../..
   ```

2. Configure environment variables in `.env`:
   - `GEMINI_API_KEY`: Google Gemini API key for spec and widget code generation.
   - `VERCEL_API_TOKEN`: Vercel API token for wildcard multi-tenant project deployments.
   - `DATABASE_URL`: Optional PostgreSQL connection string (falls back to local SQLite databases if unset).

3. Starting the Factory & Dashboard:
   - **Interactive Process Manager / Tray**:
     ```bash
     npm run tray -- --status
     npm run start:all
     npm run stop
     ```
   - **Direct Docker Deployment**:
     ```bash
     docker-compose up --build -d
     ```
   - Access the Consolidated Monitoring Dashboard at `http://localhost:3000`.
