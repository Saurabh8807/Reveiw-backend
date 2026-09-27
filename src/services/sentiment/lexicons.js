/** Multilingual sentiment lexicons (EN + Hindi/Marathi transliteration + Devanagari). */
const POSITIVE = [
  'good', 'great', 'excellent', 'amazing', 'awesome', 'love', 'loved', 'tasty', 'delicious',
  'fresh', 'fast', 'quick', 'best', 'nice', 'perfect', 'wonderful', 'super', 'thank', 'thanks',
  'shukriya', 'achha', 'accha', 'acha', 'badhiya', 'badiya', 'mast', 'swadisht', 'swad',
  'tasty', 'fresh', 'garam', 'badia', 'sundar', 'khub', 'chan', 'chhan',
  'अच्छा', 'बढ़िया', 'स्वादिष्ट', 'धन्यवाद', 'शुक्रिया', 'मस्त', 'ताज़ा', 'छान',
].map((s) => s.toLowerCase());

const NEGATIVE = [
  'bad', 'worst', 'terrible', 'awful', 'hate', 'hated', 'late', 'slow', 'cold', 'stale',
  'spicy', 'salty', 'soggy', 'burnt', 'raw', 'refund', 'complaint', 'rude', 'wrong',
  'missing', 'leak', 'dirty', 'smell', 'poor', 'disappoint', 'never', 'waste',
  'bekar', 'bekaar', 'kharab', 'kharaab', 'ganda', 'thanda', 'late', 'der',
  'kharaab', 'bevakoof', 'ghatiya', 'bakwas',
  'खराब', 'बेकार', 'घटिया', 'बकवास', 'ठंडा', 'देर', 'गंदा',
].map((s) => s.toLowerCase());

module.exports = { POSITIVE, NEGATIVE };
