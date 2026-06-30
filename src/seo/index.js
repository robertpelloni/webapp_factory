const logger = require('../logger');
const fs = require('fs');
const path = require('path');

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
    // Simple mock append before the closing tag
    sitemapContent = sitemapContent.replace('</urlset>', `${urlEntry}\n</urlset>`);
  } else {
    sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urlEntry}
</urlset>`;
  }

  fs.writeFileSync(sitemapPath, sitemapContent);
  logger.info(`[SEO] Appended ${subdomain} to sitemap.`);
  return sitemapContent; // Return for testing
}

async function triggerIndexing(subdomain) {
  // Mock Google Search Console URL Submission API
  logger.info(`[SEO] Prompting immediate crawler indexing for https://${subdomain}`);
  return true;
}

module.exports = {
  generateMetadata,
  updateSitemap,
  triggerIndexing
};
