const { chromium } = require('playwright');
const logger = require('../logger');

/**
 * Scrapes trending ChatGPT prompts.
 * Designed to target and discover popular prompt concepts to turn into micro-UIs.
 */
async function scrapeTrendingPrompts() {
  const targetUrl = 'https://prompts.chat/'; // A known open-source repo of awesome ChatGPT prompts

  logger.info(`[Scraper] Launching headless browser to scrape trending prompts from ${targetUrl}`);

  let browser;
  try {
    if (process.env.NODE_ENV === 'test') {
       return [
         { name: "Act as an English Translator and Improver", description: "I want you to act as an English translator, spelling corrector and improver.", category: "Productivity" },
         { name: "Act as a Travel Guide", description: "I want you to act as a travel guide. I will write you my location and you will suggest a place to visit near my location.", category: "Travel" }
       ];
    }

    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(targetUrl);

    // Evaluate the DOM to extract prompts
    const prompts = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h2[id^="act-as"]'));
      return headings.map(heading => {
        let name = heading.textContent.replace('#', '').trim();
        let description = '';
        let nextEl = heading.nextElementSibling;
        while (nextEl && nextEl.tagName !== 'H2') {
            if (nextEl.tagName === 'P' || nextEl.tagName === 'BLOCKQUOTE') {
                description += nextEl.textContent.trim() + ' ';
            }
            nextEl = nextEl.nextElementSibling;
        }

        return {
          name: name,
          description: description.substring(0, 300).trim(), // Limit description length
          category: 'AI Prompt Utility'
        };
      }).filter(p => p.name && p.description);
    });

    // Limit to top 10 for processing
    const topPrompts = prompts.slice(0, 10);
    logger.info(`[Scraper] Successfully extracted ${topPrompts.length} trending prompts.`);
    return topPrompts;

  } catch (error) {
    logger.error(`[Scraper] Error during prompt scraping: ${error.message}`);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = {
  scrapeTrendingPrompts
};
