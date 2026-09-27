/**
 * Transcription facade (stable API — add new providers without touching callers).
 * Selection: Google Cloud STT (if creds) -> Web Speech client transcript -> mock.
 * To add a provider (e.g. Whisper): add `services/stt/<name>Provider.js` and
 * insert it into the selection chain below.
 */
import fs from 'fs';
import { transcribeWithGoogle } from './googleProvider.js';
import { transcribeWithWebSpeech, mockPlaceholder } from './fallbackProviders.js';

export async function transcribe({ filePath, language = 'en-IN', clientTranscript = '' }) {
  const lang = language || 'en-IN';
  // Cloudinary uploads have no local file — skip Google STT (needs disk) and use fallback.
  if (filePath && fs.existsSync(filePath) && process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      return await transcribeWithGoogle(filePath, lang);
    } catch (e) {
      console.warn('[stt] Google STT failed, falling back:', e.message);
    }
  }
  return transcribeWithWebSpeech(clientTranscript, lang) || mockPlaceholder(lang);
}
