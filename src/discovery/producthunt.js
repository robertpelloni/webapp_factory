const { chromium } = require('playwright');
const logger = require('../logger');

/**
 * Scrapes trending apps from Product Hunt.
 * Focuses on extracting the top products of the day to evaluate for utility micro-generation.
 */
async function scrapeProductHunt() {
  const targetUrl = 'https://www.producthunt.com/';

  logger.info(`[Scraper] Launching headless browser to scrape ${targetUrl}`);

  let browser;
  try {
    if (process.env.NODE_ENV === 'test') {
       return [
         { name: "CSS Gradient Generator", description: "Generate beautiful CSS gradients visually.", category: "Developer Tools" },
         { name: "Markdown Table Editor", description: "Easily build and format markdown tables.", category: "Productivity" }
       ];
    }

    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    // Product Hunt relies heavily on client-side rendering. Wait for the main feed to load.
    await page.goto(targetUrl, { waitUntil: 'networkidle' });

    // Evaluate the DOM to extract the top products of the day
    const apps = await page.evaluate(() => {
      // Product Hunt typically uses data-test attributes for list items
      const items = Array.from(document.querySelectorAll('[data-test^="post-item-"]'));

      return items.map(item => {
        // These selectors are heuristic based on common PH layouts and might need updating if they change DOM structure
        const nameEl = item.querySelector('a > div > h3, a > h3, h3');
        const descEl = item.querySelector('a > div > p, a > p, p');
        const categoryTags = Array.from(item.querySelectorAll('a[href^="/categories/"]'));

        let category = 'Technology';
        if (categoryTags.length > 0) {
            category = categoryTags[0].textContent.trim();
        }

        return {
          name: nameEl ? nameEl.textContent.trim() : null,
          description: descEl ? descEl.textContent.trim() : 'No description provided.',
          category: category
        };
      }).filter(app => app.name !== null); // Filter out empty parses
    });

    const topApps = apps.slice(0, 10);
    logger.info(`[Scraper] Successfully extracted ${topApps.length} trending apps from Product Hunt.`);
    return topApps;

  } catch (error) {
    logger.error(`[Scraper] Error during Product Hunt scraping: ${error.message}`);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = {
  scrapeProductHunt
};
