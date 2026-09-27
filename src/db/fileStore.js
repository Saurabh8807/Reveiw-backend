/** Low-level JSON file-store primitives (zero-config persistence). */
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

function emptyDb() {
  return { users: [], feedbacks: [] };
}

function ensureFileDb() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify(emptyDb(), null, 2));
}

function readDb() {
  ensureFileDb();
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch {
    return emptyDb();
  }
}

function writeDb(db) {
  ensureFileDb();
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

const uid = (p = 'id') => `${p}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

module.exports = { DATA_DIR, DB_FILE, emptyDb, ensureFileDb, readDb, writeDb, uid };
