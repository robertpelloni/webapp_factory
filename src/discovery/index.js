const { initDb, isAppProcessed, markAppProcessed } = require('./db.js');
const { scrapeTrendingApps } = require('./scraper.js');
const logger = require('../logger');

// We reuse the callGemini pattern from generator, but implement it locally to avoid circular dependencies
async function checkFeasibilityWithGemini(app) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
      // Fallback to basic string check if no API key
      const rejectedKeywords = ['complex', 'cloud', 'massive', 'database', 'network', 'vpn', 'vpn'];
      const descriptionLower = app.description.toLowerCase();
      for (const keyword of rejectedKeywords) {
        if (descriptionLower.includes(keyword)) return false;
      }
      return true;
  }

  try {
    const prompt = `
      Analyze the following application description and determine if it can be built entirely as a client-side (browser-based) web utility without a dedicated backend database or server infrastructure.
      Respond ONLY with the word "TRUE" if it is feasible, or "FALSE" if it requires complex backends.
      App: ${app.name}
      Description: ${app.description}
    `;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await response.json();
    const result = data.candidates[0].content.parts[0].text.trim().toUpperCase();
    return result === 'TRUE';
  } catch (err) {
      logger.error(`[Feasibility] Error calling Gemini: ${err.message}`);
      return false; // Safely reject on error
  }
}

async function scrapeAppStore() {
  return await scrapeTrendingApps();
}

async function scrapeProductHunt() {
  return [];
}

async function runDiscovery() {
  await initDb();

  const apps = await scrapeAppStore();
  const feasibleApps = [];

  for (const app of apps) {
    const isFeasible = await checkFeasibilityWithGemini(app);
    if (isFeasible) {
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
  checkFeasibilityWithGemini,
  runDiscovery
};
