const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.NODE_ENV === 'test' ? ':memory:' : path.resolve(__dirname, 'discovery.db');
const db = new sqlite3.Database(dbPath);

function initDb() {
  return new Promise((resolve, reject) => {
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
  });
}

function isAppProcessed(appName) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT 1 FROM processed_apps WHERE app_name = ?`, [appName], (err, row) => {
      if (err) reject(err);
      else resolve(!!row);
    });
  });
}

function markAppProcessed(appName) {
  return new Promise((resolve, reject) => {
    db.run(`INSERT OR IGNORE INTO processed_apps (app_name) VALUES (?)`, [appName], (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function closeDb() {
    return new Promise((resolve, reject) => {
        db.close((err) => {
            if (err) reject(err);
            else resolve();
        })
    })
}

module.exports = {
  db,
  initDb,
  isAppProcessed,
  markAppProcessed,
  closeDb
};
