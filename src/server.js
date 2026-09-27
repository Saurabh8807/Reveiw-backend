/** Bootstrap: init persistence, then listen. */
import config from './config.js';
import { initDb } from './db/connection.js';
import { createApp } from './app.js';

const app = createApp();

initDb().then(() => {
  app.listen(config.port, () => console.log(`[backend] listening on :${config.port}`));
});

export default app;
