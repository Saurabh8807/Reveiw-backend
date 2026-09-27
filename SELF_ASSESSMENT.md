# Self-Assessment

## Voice processing flow
1. Browser `MediaRecorder` captures Opus/webm audio; optional Web Speech API produces a
   live interim transcript tagged with the chosen language (en-IN/hi-IN/mr-IN).
2. `POST /api/feedback/upload` validates MIME/size/duration, saves the file, creates a
   `feedback` row with `status=uploaded`, and returns 201 immediately.
3. Background pipeline: `transcribe()` (Google STT if credentials, else client transcript,
   else low-confidence mock) → `analyzeSentiment()` → row updated to `transcribed`.
4. Admin dashboard streams audio via `/api/feedback/audio/:filename`, shows transcript +
   engine/confidence + sentiment chip; corrections via `PUT /:id/review` re-run sentiment.

## Technical bottlenecks
- **STT latency & cost**: Google STT adds seconds per clip; mitigated by async pipeline
  and immediate 201. Production needs a queue (BullMQ) + object-store events.
- **Large files**: 10MB cap + streaming serve; uploads buffer to disk via multer — fine
  for demo, but resumable uploads (tus/S3 multipart) needed at scale.
- **File store**: JSON file has no concurrency control; MongoDB path already defined for
  production (`MONGO_URI` + `models.js`).

## Accuracy challenges
- **Noise**: no VAD/denoise yet — low-confidence (<0.5) clips are flagged and counted for
  manual review instead of silently trusted.
- **Accents / code-switching (Hinglish/Marathi-English)**: lexicon covers transliterated
  positive/negative words and Devanagari, plus `alternativeLanguageCodes` for GCP; but
  mixed-language sentences still degrade both STT and sentiment — admin correction loop
  is the safety net.
- **Rule-based sentiment**: fast and free but misses sarcasm/negation beyond simple
  handling; confidence scales with keyword hits so sparse texts stay `neutral`.

## Planned enhancements
1. Real Google STT + Cloud NL behind feature flags, BullMQ queue, S3/GCS storage.
2. Audio preprocessing (noise suppression, chunking >5 min, VAD).
3. Marathi/Hindi-first models + human-in-the-loop correction dataset.
4. Analytics: sentiment trends per dish/rider, keyword cloud, alerts on negative spikes.
5. PWA offline recording with background sync; push notification when transcript ready.
