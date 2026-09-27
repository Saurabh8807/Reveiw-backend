// Critical smoke tests: sentiment + validation helpers. Run: npm test
import assert from 'assert';
import { analyzeSentiment } from './services/sentiment.js';

let pass = 0;
function t(name, fn) {
  try { fn(); pass++; console.log('PASS', name); }
  catch (e) { console.error('FAIL', name, '-', e.message); process.exitCode = 1; }
}

t('positive english', () => assert.strictEqual(analyzeSentiment('The food was delicious and delivery was fast, loved it').label, 'positive'));
t('negative english', () => assert.strictEqual(analyzeSentiment('Worst delivery, food was cold and stale, terrible').label, 'negative'));
t('hinglish positive', () => assert.strictEqual(analyzeSentiment('khana bahut badhiya tha, swadisht aur garam').label, 'positive'));
t('hinglish negative', () => assert.strictEqual(analyzeSentiment('khana kharab tha, thanda aur bekar service').label, 'negative'));
t('neutral / empty', () => assert.strictEqual(analyzeSentiment('order id 1234').label, 'neutral'));
t('mock transcript low confidence path', () => {
  const r = analyzeSentiment('[Auto-transcription unavailable — no STT credentials configured.]');
  assert.strictEqual(r.label, 'neutral');
});
console.log(`\n${pass} tests passed`);
