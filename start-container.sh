#!/bin/bash

# Start the dashboard in the background using the centralized root script
npm run start:dashboard &

# Start the orchestrator daemon in cron mode
npm start -- --cron
