const { initDb, isAppProcessed, markAppProcessed } = require('./db.js');
const { scrapeTrendingApps } = require('./scraper.js');

async function scrapeAppStore() {
  // Now utilizing the Playwright shell
  return await scrapeTrendingApps();
}

async function scrapeProductHunt() {
  return []; // Placeholder
}

function checkFeasibility(app) {
  const rejectedKeywords = ['complex', 'cloud', 'massive', 'database'];
  const descriptionLower = app.description.toLowerCase();

  for (const keyword of rejectedKeywords) {
    if (descriptionLower.includes(keyword)) {
      return false;
    }
  }
  return true;
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
        await markAppProcessed(app.name);
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
