/** Connection manager: MongoDB when MONGO_URI is set, else file store. */
const config = require('../config');

let useMongo = false;
let Models = null;

async function initDb() {
  if (config.mongoUri) {
    try {
      const mongoose = require('mongoose');
      await mongoose.connect(config.mongoUri);
      Models = require('../models');
      useMongo = true;
      console.log('[db] connected to MongoDB');
      const { seedMongo } = require('./seed');
      await seedMongo(Models);
      return;
    } catch (e) {
      console.warn('[db] MongoDB connect failed, falling back to file store:', e.message);
    }
  }
  const { ensureFileDb } = require('./fileStore');
  const { seedFile } = require('./seed');
  ensureFileDb();
  await seedFile();
}

function isMongo() {
  return useMongo;
}

function getModels() {
  return Models;
}

module.exports = { initDb, isMongo, getModels };
