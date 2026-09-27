/** Seed demo accounts for both persistence backends. */
const bcrypt = require('bcryptjs');
const { readDb, writeDb, uid } = require('./fileStore');

const SEEDS = [
  { name: 'Admin (BakeHouse Mumbai)', email: 'admin@bakers.in', password: 'Admin123!', role: 'admin' },
  { name: 'Demo Customer', email: 'user@demo.in', password: 'User123!', role: 'user' },
];

async function seedFile() {
  const db = readDb();
  for (const s of SEEDS) {
    if (!db.users.find((u) => u.email === s.email)) {
      db.users.push({
        id: uid('u'),
        name: s.name,
        email: s.email,
        passwordHash: bcrypt.hashSync(s.password, 10),
        role: s.role,
        createdAt: new Date().toISOString(),
      });
    }
  }
  writeDb(db);
  console.log('[db] file store ready (data/db.json). Seeded admin@bakers.in / Admin123!');
}

async function seedMongo(Models) {
  for (const s of SEEDS) {
    if (!(await Models.User.findOne({ email: s.email }))) {
      await Models.User.create({
        name: s.name,
        email: s.email,
        passwordHash: bcrypt.hashSync(s.password, 10),
        role: s.role,
      });
    }
  }
}

module.exports = { seedFile, seedMongo };
