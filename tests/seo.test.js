const { generateMetadata, updateSitemap, triggerIndexing } = require('../src/seo/index');
const fs = require('fs');

async function test() {
  const meta = generateMetadata("Percentage Calculator", "Math");
  if (!meta.includes("<title>Percentage Calculator")) {
    console.error("Meta generation failed");
    process.exit(1);
  }

  const sitemapPath = 'src/seo/sitemap.xml';
  if (fs.existsSync(sitemapPath)) fs.unlinkSync(sitemapPath);

  updateSitemap('test.utilityhub.com');
  const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');

  if (!sitemapContent.includes('https://test.utilityhub.com')) {
    console.error("Sitemap update failed");
    process.exit(1);
  }

  const indexed = await triggerIndexing('test.utilityhub.com');
  if (!indexed) {
      console.error("Indexing trigger failed");
      process.exit(1);
  }

  console.log("SEO pipeline verified successfully.");
}

test();
