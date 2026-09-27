/** Bootstrap: init persistence, then listen. */
const config = require('./config');
const { initDb } = require('./db/connection');
const { createApp } = require('./app');

const app = createApp();

initDb().then(() => {
  app.listen(config.port, () => console.log(`[backend] listening on :${config.port}`));
});

module.exports = app;
