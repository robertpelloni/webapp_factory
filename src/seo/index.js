const fs = require('fs');
const path = require('path');
const logger = require('../logger');

function generateMetadata(appName, category) {
  const title = `${appName} - Free Online ${category} Tool`;
  const description = `Use our free online ${appName}. No download required, fast, and secure client-side execution.`;

  return `
export const metadata = {
  title: "${title}",
  description: "${description}",
  openGraph: {
    title: "${title}",
    description: "${description}"
  }
};
  `;
}

function injectMetadataIntoLayout(tempDir, metadataString) {
    const layoutPath = path.resolve(tempDir, 'src/app/layout.js');
    if (fs.existsSync(layoutPath)) {
        let layoutContent = fs.readFileSync(layoutPath, 'utf8');

        // Remove existing simplistic metadata export if present
        layoutContent = layoutContent.replace(/export const metadata = \{[^}]+\};/s, '');

        // Append the new rich metadata block right before the RootLayout export
        layoutContent = layoutContent.replace('export default function RootLayout', `${metadataString}\nexport default function RootLayout`);

        fs.writeFileSync(layoutPath, layoutContent);
        logger.info(`[SEO] Injected rich Next.js metadata into layout.`);
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
