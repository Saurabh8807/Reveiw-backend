/** Feedback request handlers (no routing or multer config here). */
const fs = require('fs');
const path = require('path');
const config = require('../config');
const {
  createFeedback,
  updateFeedback,
  getFeedbackById,
  listFeedbacks,
  deleteFeedback,
} = require('../repositories/feedbackRepository');
const { analyzeSentiment } = require('../services/sentiment');
const { runAnalysisPipeline } = require('../services/pipeline');

function currentUserId(req) {
  return String(req.user._id || req.user.id);
}

function uploadErrorMessage(err) {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return `File too large. Max ${config.maxAudioMB}MB / ${config.maxDurationSec}s.`;
  }
  return err.message;
}

async function uploadFeedback(req, res) {
  if (!req.file) return res.status(400).json({ error: 'audio file field required' });
  try {
    const { orderId = '', language = 'en-IN', clientTranscript = '', durationSec = 0 } = req.body || {};
    const dur = Math.min(parseFloat(durationSec) || 0, config.maxDurationSec);
    if (dur > config.maxDurationSec) {
      // Local files live on disk; Cloudinary files need an API delete.
      if (req.file.path && !String(req.file.path).startsWith('http')) fs.unlink(req.file.path, () => {});
      else if (req.file.filename) require('../middleware/upload').deleteStoredAudio(req.file.filename, req.file.path);
      return res.status(413).json({ error: `Recording too long. Max ${config.maxDurationSec}s.` });
    }
    // Cloudinary: req.file.path is the https URL, filename is the public_id.
    // Local: path is disk path, serve via /api/feedback/audio/:filename.
    const isRemote = req.file.path && String(req.file.path).startsWith('http');
    const audioUrl = isRemote ? req.file.path : `/api/feedback/audio/${req.file.filename}`;
    const localPath = isRemote ? null : req.file.path; // Google STT needs a local file
    const fb = await createFeedback({
      userId: currentUserId(req),
      orderId: String(orderId).slice(0, 60),
      audioUrl,
      fileName: req.file.filename,
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
      durationSec: Math.round(dur * 10) / 10,
      language,
      clientTranscript: String(clientTranscript).slice(0, 4000),
    });

    runAnalysisPipeline({ feedbackId: fb.id, filePath: localPath, remoteUrl: isRemote ? req.file.path : null, language, clientTranscript });

    res.status(201).json({ feedback: fb, message: 'Upload received. Transcription running.' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'upload failed' });
  }
}

async function listMyFeedback(req, res) {
  res.json({ feedbacks: await listFeedbacks({ userId: currentUserId(req) }) });
}

async function listAllFeedback(req, res) {
  const { sentiment, search } = req.query;
  res.json({ feedbacks: await listFeedbacks({ sentiment, search }) });
}

async function getFeedback(req, res) {
  const fb = await getFeedbackById(req.params.id);
  if (!fb) return res.status(404).json({ error: 'not found' });
  if (req.user.role !== 'admin' && String(fb.userId) !== currentUserId(req)) {
    return res.status(403).json({ error: 'forbidden' });
  }
  res.json({ feedback: fb });
}

async function reviewFeedback(req, res) {
  const fb = await getFeedbackById(req.params.id);
  if (!fb) return res.status(404).json({ error: 'not found' });
  const { correctedTranscript, adminNotes } = req.body || {};
  const patch = {};
  if (typeof adminNotes === 'string') patch.adminNotes = adminNotes.slice(0, 2000);
  if (typeof correctedTranscript === 'string' && correctedTranscript.trim()) {
    patch.transcript = { ...(fb.transcript || {}), text: correctedTranscript.trim(), engine: 'manual-correction', confidence: 1 };
    patch.sentiment = analyzeSentiment(correctedTranscript);
  }
  res.json({ feedback: await updateFeedback(fb.id || req.params.id, patch) });
}

async function removeFeedback(req, res) {
  const fb = await getFeedbackById(req.params.id);
  if (!fb) return res.status(404).json({ error: 'not found' });
  await require('../middleware/upload').deleteStoredAudio(fb.fileName, fb.audioUrl);
  await deleteFeedback(req.params.id);
  res.json({ ok: true });
}

async function streamAudio(req, res) {
  const fp = path.join(config.uploadDir, path.basename(req.params.filename));
  if (!fs.existsSync(fp)) return res.status(404).json({ error: 'audio not found' });
  res.sendFile(path.resolve(fp));
}

module.exports = {
  uploadErrorMessage,
  uploadFeedback,
  listMyFeedback,
  listAllFeedback,
  getFeedback,
  reviewFeedback,
  removeFeedback,
  streamAudio,
};
