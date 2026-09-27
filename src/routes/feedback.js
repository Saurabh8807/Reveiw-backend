/** Feedback routes: thin wiring of middleware -> controller. */
import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import {
  uploadErrorMessage,
  uploadFeedback,
  listMyFeedback,
  listAllFeedback,
  getFeedback,
  reviewFeedback,
  removeFeedback,
  streamAudio,
} from '../controllers/feedbackController.js';

const router = express.Router();

// POST /api/feedback/upload (user or admin can submit)
router.post('/upload', requireAuth, (req, res) => {
  upload.single('audio')(req, res, async (err) => {
    if (err) return res.status(413).json({ error: uploadErrorMessage(err) });
    await uploadFeedback(req, res);
  });
});

// GET /api/feedback/my — current user's feedbacks
router.get('/my', requireAuth, listMyFeedback);

// GET /api/feedback — admin list with filters
router.get('/', requireAuth, requireRole('admin'), listAllFeedback);

// GET single (owner or admin)
router.get('/:id', requireAuth, getFeedback);

// PUT /api/feedback/:id/review — admin corrects transcript / notes (re-runs sentiment)
router.put('/:id/review', requireAuth, requireRole('admin'), reviewFeedback);

// DELETE — admin
router.delete('/:id', requireAuth, requireRole('admin'), removeFeedback);

// Stream audio: /api/feedback/audio/:filename
router.get('/audio/:filename', streamAudio);

export default router;
