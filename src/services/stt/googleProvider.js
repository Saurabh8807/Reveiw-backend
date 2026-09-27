/** Google Cloud Speech-to-Text provider. Lazy-imports the SDK. */
import fs from 'fs';

export async function transcribeWithGoogle(filePath, language = 'en-IN') {
  // Lazy-import so the app runs without the package installed.
  const { default: speech } = await import('@google-cloud/speech');
  const client = new speech.SpeechClient();
  const audio = { content: fs.readFileSync(filePath).toString('base64') };
  const cfg = {
    encoding: 'WEBM_OPUS',
    sampleRateHertz: 48000,
    languageCode: language,
    alternativeLanguageCodes: ['en-IN', 'hi-IN', 'mr-IN'],
  };
  const [resp] = await client.recognize({ audio, config: cfg });
  const alt = resp.results?.[0]?.alternatives?.[0];
  return { text: alt?.transcript || '', confidence: alt?.confidence ?? 0.7, engine: 'google-stt', language };
}
