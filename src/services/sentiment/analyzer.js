/** Rule-based sentiment analyzer. Swap with Google Cloud NL without changing this shape. */
import { POSITIVE, NEGATIVE } from './lexicons.js';

export function analyzeSentiment(text = '') {
  const lower = String(text).toLowerCase();
  const words = lower.split(/[^a-z\u0900-\u097F]+/).filter(Boolean);
  let pos = 0;
  let neg = 0;
  const keywords = [];
  for (const w of words) {
    if (POSITIVE.includes(w)) { pos++; if (keywords.length < 8) keywords.push(w); }
    if (NEGATIVE.includes(w)) { neg++; if (keywords.length < 8) keywords.push(w); }
  }
  // intensifiers / negations (simple)
  if (/\b(not|nahi|nahin|mat)\b/.test(lower) && pos > 0 && neg === 0) {
    const t = pos; pos = neg; neg = t;
  }
  const total = pos + neg;
  let label = 'neutral';
  let score = 0;
  let confidence = 0.55;
  if (total > 0) {
    score = (pos - neg) / Math.max(1, total);
    score = Math.round(score * 100) / 100;
    if (score >= 0.25) label = 'positive';
    else if (score <= -0.25) label = 'negative';
    else label = 'neutral';
    confidence = Math.min(0.95, 0.6 + total * 0.08);
    confidence = Math.round(confidence * 100) / 100;
  } else if (lower.includes('[auto-transcription unavailable')) {
    label = 'neutral'; score = 0; confidence = 0.2;
  }
  return { label, score, confidence, keywords };
}
