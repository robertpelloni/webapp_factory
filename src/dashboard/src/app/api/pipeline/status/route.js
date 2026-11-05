export const dynamic = 'force-dynamic';
import os from 'os';
import path from 'path';
import fs from 'fs';
import sqlite3 from 'sqlite3';
import { Pool } from 'pg';

export async function GET() {
  const usePg = !!process.env.DATABASE_URL;
  const statusInfo = {
    uptimeSeconds: Math.floor(process.uptime()),
    hostname: os.hostname(),
    platform: os.platform(),
    nodeVersion: process.version,
    memoryUsageMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
    routesCount: 0,
    appsCount: 0,
    cronScheduled: true,
    daemonOnline: true,
    lastChecked: new Date().toISOString()
  };

  try {
    if (usePg) {
      const pgPool = new Pool({ connectionString: process.env.DATABASE_URL });
      const [routesRes, appsRes] = await Promise.all([
        pgPool.query('SELECT count(*) as cnt FROM routes').catch(() => ({ rows: [{ cnt: 0 }] })),
        pgPool.query('SELECT count(*) as cnt FROM processed_apps').catch(() => ({ rows: [{ cnt: 0 }] }))
      ]);
      await pgPool.end();
      statusInfo.routesCount = parseInt(routesRes.rows[0]?.cnt || 0, 10);
      statusInfo.appsCount = parseInt(appsRes.rows[0]?.cnt || 0, 10);
    } else {
      const routesDbPath = path.resolve(process.cwd(), '../deployer/routes.db');
      const discoveryDbPath = path.resolve(process.cwd(), '../discovery/discovery.db');

      if (fs.existsSync(routesDbPath)) {
        await new Promise((res) => {
          const db = new sqlite3.Database(routesDbPath);
          db.get('SELECT count(*) as cnt FROM routes', (err, row) => {
            db.close();
            if (!err && row) statusInfo.routesCount = row.cnt;
            res();
          });
        });
      }

      if (fs.existsSync(discoveryDbPath)) {
        await new Promise((res) => {
          const db = new sqlite3.Database(discoveryDbPath);
          db.get('SELECT count(*) as cnt FROM processed_apps', (err, row) => {
            db.close();
            if (!err && row) statusInfo.appsCount = row.cnt;
            res();
          });
        });
      }
    }

    return new Response(JSON.stringify(statusInfo), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message, ...statusInfo }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
