const { initDb, isAppProcessed, markAppProcessed } = require('./db');

// Mock data representing scraped trending apps
const mockTrendingApps = [
  { name: "Complex Photoshop Clone", description: "A massive photo editor with cloud accounts", category: "Graphics" },
  { name: "Simple Percentage Calculator", description: "A quick client-side calculator for percentages", category: "Utilities" },
  { name: "Duplicate File Finder", description: "Finds duplicates on your machine using local file system API", category: "Productivity" }
];

async function scrapeAppStore() {
  // In a real app, this would use Playwright/ScrapingAnt
  return mockTrendingApps;
}

async function scrapeProductHunt() {
  return []; // Mock
}

// Lightweight guardrail function simulating Gemini 2.5 Flash logic
function checkFeasibility(app) {
  const rejectedKeywords = ['complex', 'cloud', 'massive', 'database'];
  const descriptionLower = app.description.toLowerCase();

  for (const keyword of rejectedKeywords) {
    if (descriptionLower.includes(keyword)) {
      return false; // Reject apps with these keywords
    }
  }
  return true; // Feasible client-side utility
}

async function runDiscovery() {
  await initDb();

  const apps = await scrapeAppStore();
  const feasibleApps = [];

  for (const app of apps) {
    if (checkFeasibility(app)) {
      const processed = await isAppProcessed(app.name);
      if (!processed) {
        feasibleApps.push(app);
        await markAppProcessed(app.name); // Mark as processed so we don't pick it up next time
      }
    }
  }

  return feasibleApps;
}

module.exports = {
  scrapeAppStore,
  scrapeProductHunt,
  checkFeasibility,
  runDiscovery
};
