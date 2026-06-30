const { chromium } = require('playwright');
const logger = require('../logger');

/**
 * Scrapes trending apps from a given mock/real URL.
 * Designed to target utilities and single-purpose tools via real RSS endpoints.
 */
async function scrapeTrendingApps() {
  // Targeting Apple's public iTunes RSS feed for Top Free iOS Apps in the "Utilities" category (category 6002)
  const targetUrl = 'https://itunes.apple.com/us/rss/topfreeapplications/limit=10/genre=6002/xml';

  logger.info(`[Scraper] Launching headless browser to scrape ${targetUrl}`);

  let browser;
  try {
    if (process.env.NODE_ENV === 'test') {
       return [
         { name: "Complex Photoshop Clone", description: "A massive photo editor with cloud accounts", category: "Graphics" },
         { name: "Simple Percentage Calculator", description: "A quick client-side calculator for percentages", category: "Utilities" },
         { name: "Duplicate File Finder", description: "Finds duplicates on your machine using local file system API", category: "Productivity" }
       ];
    }

    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(targetUrl);

    // Evaluate the XML inside the browser context
    const apps = await page.evaluate(() => {
      const entries = Array.from(document.querySelectorAll('entry'));
      return entries.map(entry => {
        const titleEl = entry.querySelector('title');
        const summaryEl = entry.querySelector('summary');
        const categoryEl = entry.querySelector('category');

        return {
          name: titleEl ? titleEl.textContent : 'Unknown Utility',
          description: summaryEl ? summaryEl.textContent : 'No description provided.',
          category: categoryEl ? categoryEl.getAttribute('term') : 'Utilities'
        };
      });
    });

    logger.info(`[Scraper] Successfully extracted ${apps.length} apps from RSS.`);
    return apps;

  } catch (error) {
    logger.error(`[Scraper] Error during scraping: ${error.message}`);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = {
  scrapeTrendingApps
};
