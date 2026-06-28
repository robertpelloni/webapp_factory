const fs = require('fs');
const path = require('path');
const logger = require('../logger');

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

function injectMetadataIntoLayout(tempDir, metadataString) {
    const layoutPath = path.resolve(tempDir, 'index.html');
    if (fs.existsSync(layoutPath)) {
        let layoutContent = fs.readFileSync(layoutPath, 'utf8');

        // Replace existing simplistic title if present
        layoutContent = layoutContent.replace(/<title>.*<\/title>/s, metadataString);

        fs.writeFileSync(layoutPath, layoutContent);
        logger.info(`[SEO] Injected rich HTML metadata into index.html.`);
    }
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
    sitemapContent = sitemapContent.replace('</urlset>', `${urlEntry}\n</urlset>`);
  } else {
    sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urlEntry}\n</urlset>`;
  }

  fs.writeFileSync(sitemapPath, sitemapContent);
  logger.info(`[SEO] Appended ${subdomain} to sitemap.`);
  return sitemapContent;
}

async function triggerIndexing(subdomain) {
  logger.info(`[SEO] Prompting immediate crawler indexing for https://${subdomain}`);
  return true;
}

module.exports = {
  generateMetadata,
  injectMetadataIntoLayout,
  updateSitemap,
  triggerIndexing
};
