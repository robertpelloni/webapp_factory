const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { Pool } = require('pg');

let db;
let pgPool;
const usePg = !!process.env.DATABASE_URL;

if (usePg) {
  pgPool = new Pool({ connectionString: process.env.DATABASE_URL });
} else {
  const dbPath = process.env.NODE_ENV === 'test' ? ':memory:' : path.resolve(__dirname, 'discovery.db');
  db = new sqlite3.Database(dbPath);
}

function initDb() {
  return new Promise(async (resolve, reject) => {
    if (usePg) {
      try {
        await pgPool.query(`
          CREATE TABLE IF NOT EXISTS processed_apps (
            id SERIAL PRIMARY KEY,
            app_name TEXT UNIQUE NOT NULL,
            processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        resolve();
      } catch (err) {
        reject(err);
      }
    } else {
      db.serialize(() => {
        db.run(`
          CREATE TABLE IF NOT EXISTS processed_apps (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            app_name TEXT UNIQUE NOT NULL,
            processed_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
  });
}

function isAppProcessed(appName) {
  return new Promise(async (resolve, reject) => {
    if (usePg) {
      try {
        const res = await pgPool.query(`SELECT 1 FROM processed_apps WHERE app_name = $1`, [appName]);
        resolve(res.rowCount > 0);
      } catch (err) {
        reject(err);
      }
    } else {
      db.get(`SELECT 1 FROM processed_apps WHERE app_name = ?`, [appName], (err, row) => {
        if (err) reject(err);
        else resolve(!!row);
      });
    }
  });
}

function markAppProcessed(appName) {
  return new Promise(async (resolve, reject) => {
    if (usePg) {
       try {
         await pgPool.query(`INSERT INTO processed_apps (app_name) VALUES ($1) ON CONFLICT DO NOTHING`, [appName]);
         resolve();
       } catch (err) {
         reject(err);
       }
    } else {
      db.run(`INSERT OR IGNORE INTO processed_apps (app_name) VALUES (?)`, [appName], (err) => {
        if (err) reject(err);
        else resolve();
      });
    }
  });
}

function closeDb() {
    return new Promise(async (resolve, reject) => {
        if (usePg) {
            await pgPool.end();
            resolve();
        } else {
            db.close((err) => {
                if (err) reject(err);
                else resolve();
            });
        }
    });
}

module.exports = {
  db,
  pgPool,
  initDb,
  isAppProcessed,
  markAppProcessed,
  closeDb
};
