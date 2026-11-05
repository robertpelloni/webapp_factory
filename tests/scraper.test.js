const { scrapeTrendingApps } = require('../src/discovery/scraper');

async function test() {
  console.log("Running scraper shell test...");
  const apps = await scrapeTrendingApps();

  if (apps.length === 0) {
      console.error("Failed to scrape any apps using Playwright.");
      process.exit(1);
  }

  console.log("Scraped Apps:");
  apps.forEach(app => console.log(`- ${app.name}`));
  console.log("Playwright Scraper shell successfully verified.");
}

test();
