/** Low-level JSON file-store primitives (zero-config persistence). */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const DATA_DIR = path.join(__dirname, '..', '..', 'data');
export const DB_FILE = path.join(DATA_DIR, 'db.json');

export function emptyDb() {
  return { users: [], feedbacks: [] };
}

export function ensureFileDb() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify(emptyDb(), null, 2));
}

export function readDb() {
  ensureFileDb();
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch {
    return emptyDb();
  }
}

export function writeDb(db) {
  ensureFileDb();
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

export const uid = (p = 'id') => `${p}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
