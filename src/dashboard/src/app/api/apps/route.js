export const dynamic = 'force-dynamic';
import sqlite3 from 'sqlite3';
import { Pool } from 'pg';
import path from 'path';

export async function GET() {
  const usePg = !!process.env.DATABASE_URL;

  try {
    if (usePg) {
      const pgPool = new Pool({ connectionString: process.env.DATABASE_URL });
      const result = await pgPool.query('SELECT * FROM processed_apps ORDER BY processed_at DESC');
      await pgPool.end();
      return new Response(JSON.stringify(result.rows), { status: 200, headers: { 'Content-Type': 'application/json' }});
    } else {
      // Navigate up to the root discovery.db
      const dbPath = path.resolve(process.cwd(), '../discovery/discovery.db');
      const db = new sqlite3.Database(dbPath);

      return new Promise((resolve) => {
          db.all('SELECT * FROM processed_apps ORDER BY processed_at DESC', (err, rows) => {
             db.close();
             if (err) {
                 resolve(new Response(JSON.stringify({ error: err.message }), { status: 500 }));
             } else {
                 resolve(new Response(JSON.stringify(rows || []), { status: 200, headers: { 'Content-Type': 'application/json' }}));
             }
          });
      });
    }
  } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
