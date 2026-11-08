import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sitemapPath = path.resolve(process.cwd(), '../../src/seo/sitemap.xml');
    let urls = [];
    let sitemapExists = false;

    if (fs.existsSync(sitemapPath)) {
      sitemapExists = true;
      const content = fs.readFileSync(sitemapPath, 'utf8');
      const matches = content.match(/<loc>(.*?)<\/loc>/g);
      if (matches) {
        urls = matches.map(loc => loc.replace('<loc>', '').replace('</loc>', '').trim());
      }
    }

    const gcpCredentialsPath = path.resolve(process.cwd(), '../../gcp-service-account.json');
    const hasGcpCredentials = fs.existsSync(gcpCredentialsPath);

    return NextResponse.json({
      success: true,
      seo: {
        sitemapExists,
        urlCount: urls.length,
        urls,
        indexingMode: hasGcpCredentials ? 'Google Search Console API' : 'Mock Ping Fallback',
        googleVerificationConfigured: Boolean(process.env.GOOGLE_SITE_VERIFICATION),
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
