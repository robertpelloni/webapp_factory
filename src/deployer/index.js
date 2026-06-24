const sqlite3 = require('sqlite3').verbose();
const path = require('path');

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

// Mock deployment trigger
async function deployApp(appName, code) {
  await initDeployDb();

  // Create a URL slug (e.g., "Percentage Calculator" -> "percentage-calculator")
  const slug = appName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const subdomain = `${slug}.utilityhub.com`;

  await saveRoute(slug, subdomain);

  console.log(`[Deployer] Successfully deployed ${appName} to ${subdomain}`);

  return { slug, subdomain };
}

module.exports = {
  initDeployDb,
  saveRoute,
  getRoute,
  deployApp
};
