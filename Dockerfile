# Base image
FROM node:20-bullseye-slim

# Install necessary OS packages for Playwright
RUN apt-get update && apt-get install -y \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpango-1.0-0 \
    libcairo2 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy dependency graphs
COPY package*.json ./

# Install main application dependencies
RUN npm install

# Install Playwright browsers
RUN npx playwright install chromium

# Copy the rest of the application code
COPY . .

# Build the dashboard inside the container
WORKDIR /app/src/dashboard
RUN npm install
RUN npm run build

# Return to root for execution
WORKDIR /app

# Expose the dashboard port
EXPOSE 3000

# Start both the dashboard and the factory cron daemon using concurrently or sequentially
# For simplicity in this container, we will execute a shell script that boots both
COPY start-container.sh ./
RUN chmod +x start-container.sh

CMD ["./start-container.sh"]
