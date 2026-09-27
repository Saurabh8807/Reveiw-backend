/** Fallback providers: browser Web Speech transcript + low-confidence mock. */

export function transcribeWithWebSpeech(clientTranscript = '', language = 'en-IN') {
  if (clientTranscript && clientTranscript.trim().length > 1) {
    return { text: clientTranscript.trim(), confidence: 0.85, engine: 'web-speech', language };
  }
  return null;
}

export function mockPlaceholder(language = 'en-IN') {
  return {
    text: '[Auto-transcription unavailable — no STT credentials configured. Admin: play audio and add corrected transcript via Review.]',
    confidence: 0.2,
    engine: 'mock',
    language,
  };
}
