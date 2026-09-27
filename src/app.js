/** Express app factory (importable without booting — e.g. for tests). */
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import config from './config.js';

import authRoutes from './routes/auth.js';
import feedbackRoutes from './routes/feedback.js';
import statsRoutes from './routes/stats.js';

export function createApp() {
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
