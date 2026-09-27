/** Feedback routes: thin wiring of middleware -> controller. */
const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const c = require('../controllers/feedbackController');

const router = express.Router();

// POST /api/feedback/upload (user or admin can submit)
router.post('/upload', requireAuth, (req, res) => {
  upload.single('audio')(req, res, async (err) => {
    if (err) return res.status(413).json({ error: c.uploadErrorMessage(err) });
    await c.uploadFeedback(req, res);
  });
});

// GET /api/feedback/my — current user's feedbacks
router.get('/my', requireAuth, c.listMyFeedback);

// GET /api/feedback — admin list with filters
router.get('/', requireAuth, requireRole('admin'), c.listAllFeedback);

// GET single (owner or admin)
router.get('/:id', requireAuth, c.getFeedback);

// PUT /api/feedback/:id/review — admin corrects transcript / notes (re-runs sentiment)
router.put('/:id/review', requireAuth, requireRole('admin'), c.reviewFeedback);

// DELETE — admin
router.delete('/:id', requireAuth, requireRole('admin'), c.removeFeedback);

// Stream audio: /api/feedback/audio/:filename
router.get('/audio/:filename', c.streamAudio);

module.exports = router;
