import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const isTokenConfigured = !!process.env.VERCEL_API_TOKEN && process.env.VERCEL_API_TOKEN !== 'mock_token';
    const dbPath = path.resolve(process.cwd(), '../deployer/routes.db');

    let routesCount = 0;
    try {
      const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);
      routesCount = await new Promise((resolve) => {
        db.get('SELECT COUNT(*) as count FROM routes', (err, row) => {
          db.close();
          if (err) resolve(0);
          else resolve(row ? row.count : 0);
        });
      });
    } catch (e) {
      routesCount = 0;
    }

    return NextResponse.json({
      success: true,
      data: {
        provider: 'Vercel Multi-Tenant Platforms',
        mode: isTokenConfigured ? 'live-api' : 'simulated-mock',
        tokenConfigured: isTokenConfigured,
        wildcardDomain: '*.utilityhub.com',
        verificationStrategy: 'CNAME delegation (cname.vercel-dns.com)',
        sslStatus: 'Auto-provisioned Let\'s Encrypt Wildcard',
        activeTenantRoutes: routesCount,
        framework: 'Single-file HTML/JS (framework: null)'
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
