#!/bin/bash

# Start the dashboard in the background
cd src/dashboard
npm run start &

# Return to root and start the orchestrator daemon
cd ../..
npm start -- --cron
