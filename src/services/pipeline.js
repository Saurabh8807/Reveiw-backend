/**
 * Feedback analysis pipeline: transcribe -> sentiment -> persist.
 * Fire-and-forget from the upload handler so large-file uploads never
 * block on slow STT. Swap in a queue (BullMQ) here when scaling.
 */
const { transcribe } = require('./transcription');
const { analyzeSentiment } = require('./sentiment');
const { updateFeedback } = require('../repositories/feedbackRepository');

function runAnalysisPipeline({ feedbackId, filePath, language, clientTranscript }) {
  (async () => {
    try {
      const t = await transcribe({ filePath, language, clientTranscript });
      const s = analyzeSentiment(t.text);
      await updateFeedback(feedbackId, { transcript: t, sentiment: s, status: 'transcribed' });
    } catch (e) {
      console.warn('[pipeline] failed:', e.message);
      await updateFeedback(feedbackId, { status: 'failed' });
    }
  })();
}

module.exports = { runAnalysisPipeline };
