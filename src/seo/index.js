const logger = require('../logger');
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

function generateMetadata(appName, category) {
  const title = `${appName} - Free Online ${category} Tool`;
  const description = `Use our free online ${appName}. No download required, fast, and secure client-side execution.`;

  return `
    <title>${title}</title>
    <meta name="description" content="${description}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
  `;
}

function updateSitemap(subdomain) {
  const sitemapPath = path.resolve(__dirname, 'sitemap.xml');
  const urlEntry = `
  <url>
    <loc>https://${subdomain}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;

  let sitemapContent = '';
  if (fs.existsSync(sitemapPath)) {
    sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
    // Ensure we don't add duplicate entries
    if (!sitemapContent.includes(`https://${subdomain}`)) {
      sitemapContent = sitemapContent.replace('</urlset>', `${urlEntry}\n</urlset>`);
      fs.writeFileSync(sitemapPath, sitemapContent);
      logger.info(`[SEO] Appended ${subdomain} to sitemap.`);
    } else {
        logger.info(`[SEO] ${subdomain} already exists in sitemap, skipping append.`);
    }
  } else {
    sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urlEntry}
</urlset>`;
    fs.writeFileSync(sitemapPath, sitemapContent);
    logger.info(`[SEO] Created new sitemap and appended ${subdomain}.`);
  }
  return sitemapContent; // Return for testing
}

async function triggerIndexing(subdomain) {
  logger.info(`[SEO] Preparing indexing request for https://${subdomain}`);

  // Scaffolding for Google Search Console API Indexing
  const credentialsPath = path.resolve(process.cwd(), 'gcp-service-account.json');

  if (fs.existsSync(credentialsPath)) {
      try {
        const auth = new google.auth.GoogleAuth({
            keyFile: credentialsPath,
            scopes: ['https://www.googleapis.com/auth/indexing']
        });

        const indexing = google.indexing({ version: 'v3', auth });

        const res = await indexing.urlNotifications.publish({
            requestBody: {
               url: `https://${subdomain}`,
               type: 'URL_UPDATED'
            }
        });

        logger.info(`[SEO] Validated GCP credentials. Successfully pinged Google Indexing API for https://${subdomain}. Status: ${res.status}`);
        return { success: true, method: 'API', data: res.data };
      } catch (error) {
          logger.error(`[SEO] Failed to ping Google Indexing API: ${error.message}`);
          return { success: false, error: error.message };
      }
  } else {
      logger.warn(`[SEO] gcp-service-account.json not found. Falling back to simple ping/mock indexing for https://${subdomain}`);
      return { success: true, method: 'mock' };
  }
}

module.exports = {
  generateMetadata,
  updateSitemap,
  triggerIndexing
};
