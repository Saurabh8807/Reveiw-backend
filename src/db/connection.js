/** Connection manager: MongoDB when MONGO_URI is set, else file store. */
import config from '../config.js';

let useMongo = false;
let Models = null;

export async function initDb() {
  if (config.mongoUri) {
    try {
      const { default: mongoose } = await import('mongoose');
      await mongoose.connect(config.mongoUri);
      Models = await import('../models.js');
      useMongo = true;
      console.log('[db] connected to MongoDB');
      const { seedMongo } = await import('./seed.js');
      await seedMongo(Models);
      return;
    } catch (e) {
      console.warn('[db] MongoDB connect failed, falling back to file store:', e.message);
    }
  }
  const { ensureFileDb } = await import('./fileStore.js');
  const { seedFile } = await import('./seed.js');
  ensureFileDb();
  await seedFile();
}

export function isMongo() {
  return useMongo;
}

export function getModels() {
  return Models;
}
