const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { createVercelProject, deployToVercel } = require('./vercel');

const dbPath = process.env.NODE_ENV === 'test' ? ':memory:' : path.resolve(__dirname, 'routes.db');
const db = new sqlite3.Database(dbPath);

function initDeployDb() {
  return new Promise((resolve, reject) => {
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
  });
}

function saveRoute(slug, subdomain) {
  return new Promise((resolve, reject) => {
    db.run(`INSERT OR REPLACE INTO routes (slug, subdomain) VALUES (?, ?)`, [slug, subdomain], function(err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
}

function getRoute(slug) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT subdomain FROM routes WHERE slug = ?`, [slug], (err, row) => {
            if (err) reject(err);
            else resolve(row ? row.subdomain : null);
        });
    });
}

async function deployApp(appName, code) {
  await initDeployDb();

  const slug = appName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const subdomain = `${slug}.utilityhub.com`;

  // Wire up Vercel API
  const token = process.env.VERCEL_API_TOKEN || 'mock_token';
  const project = await createVercelProject(slug, token);
  const deployedUrl = await deployToVercel(project.projectId, code, token);

  console.log(`[Deployer] Vercel returned deployment URL: ${deployedUrl}`);

  await saveRoute(slug, subdomain);
  console.log(`[Deployer] Successfully mapped ${appName} to ${subdomain}`);

  return { slug, subdomain, deployedUrl };
}

module.exports = {
  initDeployDb,
  saveRoute,
  getRoute,
  deployApp
};
