/** Express app factory (importable without booting — e.g. for tests). */
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config');

const authRoutes = require('./routes/auth');
const feedbackRoutes = require('./routes/feedback');
const statsRoutes = require('./routes/stats');

function createApp() {
  const app = express();
  app.use(cors({ origin: [config.frontendUrl, 'http://localhost:5173', 'http://localhost:3000'], credentials: true }));
  app.use(express.json({ limit: '2mb' }));
  app.use(morgan('dev'));

  app.get('/api/health', (_req, res) => res.json({ ok: true, storage: config.storageMode, maxAudioMB: config.maxAudioMB }));
  app.use('/api/auth', authRoutes);
  app.use('/api/feedback', feedbackRoutes);
  app.use('/api/stats', statsRoutes);

  // central error handler
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    console.error('[error]', err.message);
    res.status(err.status || 500).json({ error: err.message || 'server error' });
  });

  return app;
}

module.exports = { createApp };
