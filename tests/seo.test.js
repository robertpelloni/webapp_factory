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

    // Clean up temporary credentials file if we created one
    if (tempCredsCreated && fs.existsSync(mockCredsPath)) {
      fs.unlinkSync(mockCredsPath);
      tempCredsCreated = false;
    }
  });

  const indexed = await triggerIndexing('test.utilityhub.com');
  if (!indexed) {
      console.error("Indexing trigger failed");
      process.exit(1);
  }

  it('should generate google verification meta tag when token is present', () => {
    const meta = seoPkg.generateGoogleVerificationMeta('mock-verification-token-123');
    expect(meta).toContain('<meta name="google-site-verification" content="mock-verification-token-123">');

    const emptyMeta = seoPkg.generateGoogleVerificationMeta('');
    expect(emptyMeta).toBe('');
  });

  it('should generate valid robots.txt with sitemap reference', () => {
    const robots = seoPkg.generateRobotsTxt(testSubdomain);
    expect(robots).toContain('User-agent: *');
    expect(robots).toContain('Allow: /');
    expect(robots).toContain(`Sitemap: https://${testSubdomain}/sitemap.xml`);
  });

  it('should extract sitemap URLs correctly', () => {
    seoPkg.updateSitemap(testSubdomain);
    const urls = seoPkg.getSitemapUrls();
    expect(Array.isArray(urls)).toBe(true);
    expect(urls).toContain(`https://${testSubdomain}`);
  });

  it('should update sitemap without duplicates', () => {
    // Initial update
    let content = seoPkg.updateSitemap(testSubdomain);
    expect(content).toContain(`https://${testSubdomain}`);

    // Attempt duplicate update
    let newContent = seoPkg.updateSitemap(testSubdomain);

    // Check that there is only one occurrence
    const matches = newContent.match(new RegExp(`https://${testSubdomain}`, 'g'));
    expect(matches).toHaveLength(1);
  });

  it('should fallback to mock indexing when GCP credentials are missing', async () => {
    // Ensure we don't accidentally have a fake creds file during this test
    if (fs.existsSync(mockCredsPath)) fs.unlinkSync(mockCredsPath);
    const result = await seoPkg.triggerIndexing(testSubdomain);
    expect(result.success).toBe(true);
    expect(result.method).toBe('mock');
  });

  it('should support batch indexing triggers', async () => {
    const results = await seoPkg.batchTriggerIndexing([testSubdomain, 'sub2.utilityhub.com']);
    expect(results).toHaveLength(2);
    expect(results[0].subdomain).toBe(testSubdomain);
    expect(results[0].success).toBe(true);
  });

  it('should safely catch and return failure if invalid GCP credentials are provided to Google API', async () => {
    // Create a temporary, invalid credentials file to force the API to throw an auth error
    fs.writeFileSync(mockCredsPath, JSON.stringify({ type: "service_account", invalid: "mock_data" }));
    tempCredsCreated = true;

    const result = await seoPkg.triggerIndexing(testSubdomain);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();

    // Cleanup happens in afterEach
  });
});
