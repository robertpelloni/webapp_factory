const logger = require('../logger');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { Pool } = require('pg');
const { createVercelProject, deployToVercel } = require('./vercel');

let db;
let pgPool;
const usePg = !!process.env.DATABASE_URL;

if (usePg) {
  pgPool = new Pool({ connectionString: process.env.DATABASE_URL });
} else {
  const dbPath = process.env.NODE_ENV === 'test' ? ':memory:' : path.resolve(__dirname, 'routes.db');
  db = new sqlite3.Database(dbPath);
}

function initDeployDb() {
  return new Promise(async (resolve, reject) => {
    if (usePg) {
        try {
           await pgPool.query(`
              CREATE TABLE IF NOT EXISTS routes (
                id SERIAL PRIMARY KEY,
                slug TEXT UNIQUE NOT NULL,
                subdomain TEXT UNIQUE NOT NULL,
                deployed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
              )
           `);
           resolve();
        } catch (err) {
           reject(err);
        }
    } else {
      db.serialize(() => {
        db.run(`
          CREATE TABLE IF NOT EXISTS routes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            slug TEXT UNIQUE NOT NULL,
            subdomain TEXT UNIQUE NOT NULL,
            deployed_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
  });
}

function saveRoute(slug, subdomain) {
  return new Promise(async (resolve, reject) => {
    if (usePg) {
        try {
           const res = await pgPool.query(`
              INSERT INTO routes (slug, subdomain) VALUES ($1, $2)
              ON CONFLICT (slug) DO UPDATE SET subdomain = EXCLUDED.subdomain
              RETURNING id
           `, [slug, subdomain]);
           resolve(res.rows[0].id);
        } catch (err) {
           reject(err);
        }
    } else {
      db.run(`INSERT OR REPLACE INTO routes (slug, subdomain) VALUES (?, ?)`, [slug, subdomain], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    }
  });
}

function getRoute(slug) {
    return new Promise(async (resolve, reject) => {
        if (usePg) {
           try {
              const res = await pgPool.query(`SELECT subdomain FROM routes WHERE slug = $1`, [slug]);
              resolve(res.rows[0] ? res.rows[0].subdomain : null);
           } catch(err) {
              reject(err);
           }
        } else {
            db.get(`SELECT subdomain FROM routes WHERE slug = ?`, [slug], (err, row) => {
                if (err) reject(err);
                else resolve(row ? row.subdomain : null);
            });
        }
    });
}

async function deployApp(appName, code, tempDir = null) {
  await initDeployDb();

  const slug = appName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const subdomain = `${slug}.utilityhub.com`;

  const token = process.env.VERCEL_API_TOKEN || 'mock_token';
  const project = await createVercelProject(slug, token);
  const deployedUrl = await deployToVercel(project.projectId, tempDir, token);

  logger.info(`[Deployer] Vercel returned deployment URL: ${deployedUrl}`);

  await saveRoute(slug, subdomain);
  logger.info(`[Deployer] Successfully mapped ${appName} to ${subdomain}`);

  return { slug, subdomain, deployedUrl };
}

module.exports = {
  initDeployDb,
  saveRoute,
  getRoute,
  deployApp,
  pgPool
};
