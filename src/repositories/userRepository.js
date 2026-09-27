/** User data-access: same API over MongoDB or the JSON file store. */
const { isMongo, getModels } = require('../db/connection');
const { readDb, writeDb, uid } = require('../db/fileStore');

async function findUserByEmail(email) {
  email = String(email).toLowerCase().trim();
  if (isMongo()) return getModels().User.findOne({ email }).lean();
  return readDb().users.find((u) => u.email === email) || null;
}

async function findUserById(id) {
  if (isMongo()) return getModels().User.findById(id).lean();
  return readDb().users.find((u) => u.id === String(id) || u._id === String(id)) || null;
}

async function createUser({ name, email, passwordHash, role }) {
  if (isMongo()) {
    const u = await getModels().User.create({ name, email, passwordHash, role });
    return u.toObject();
  }
  const db = readDb();
  const user = { id: uid('u'), name, email, passwordHash, role, createdAt: new Date().toISOString() };
  db.users.push(user);
  writeDb(db);
  return user;
}

function sanitizeUser(u) {
  if (!u) return null;
  const id = String(u._id || u.id);
  return { id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt };
}

module.exports = { findUserByEmail, findUserById, createUser, sanitizeUser };
