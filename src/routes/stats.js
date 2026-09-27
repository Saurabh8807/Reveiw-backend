import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { listFeedbacks } from '../repositories/feedbackRepository.js';

const router = express.Router();

router.get('/summary', requireAuth, requireRole('admin'), async (_req, res) => {
  const items = await listFeedbacks({});
  const by = { positive: 0, neutral: 0, negative: 0 };
  let lowConf = 0;
  for (const f of items) {
    const l = f.sentiment?.label || 'neutral';
    if (by[l] !== undefined) by[l]++;
    if ((f.transcript?.confidence ?? 0) < 0.5) lowConf++;
  }
  res.json({
    total: items.length,
    bySentiment: by,
    lowConfidenceTranscripts: lowConf,
    latest: items.slice(0, 5).map((f) => ({ id: f.id, sentiment: f.sentiment?.label, createdAt: f.createdAt })),
  });
});

export default router;
