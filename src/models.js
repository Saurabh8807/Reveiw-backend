/**
 * Mongoose schemas — production persistence (MongoDB / PostgreSQL-equivalent).
 * The app runs by default on a zero-config JSON file store (store.js) so it
 * works without a DB. Set MONGO_URI to switch to MongoDB using these schemas.
 *
 * Collections:
 *  users { name, email(unique), passwordHash, role: user|admin, createdAt }
 *  feedbacks {
 *    userId(ref), orderId, audioUrl, mimeType, sizeBytes, durationSec,
 *    language (en-IN|hi-IN|mr-IN...), clientTranscript,
 *    transcript { text, confidence, engine, language }, sentiment { label, score, confidence },
 *    status: uploaded|transcribed|failed, adminNotes, createdAt
 *  }
 */
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true }
);

const TranscriptSchema = new mongoose.Schema(
  {
    text: { type: String, default: '' },
    confidence: { type: Number, default: 0 },
    engine: { type: String, default: 'mock' }, // google-stt | web-speech | mock
    language: { type: String, default: 'en-IN' },
  },
  { _id: false }
);

const SentimentSchema = new mongoose.Schema(
  {
    label: { type: String, enum: ['positive', 'neutral', 'negative'], default: 'neutral' },
    score: { type: Number, default: 0 }, // -1..1
    confidence: { type: Number, default: 0 },
    keywords: { type: [String], default: [] },
  },
  { _id: false }
);

const FeedbackSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderId: { type: String, default: '' },
    audioUrl: { type: String, required: true },
    mimeType: { type: String, default: 'audio/webm' },
    sizeBytes: { type: Number, default: 0 },
    durationSec: { type: Number, default: 0 },
    language: { type: String, default: 'en-IN' },
    clientTranscript: { type: String, default: '' },
    transcript: { type: TranscriptSchema, default: () => ({}) },
    sentiment: { type: SentimentSchema, default: () => ({}) },
    status: {
      type: String,
      enum: ['uploaded', 'transcribed', 'failed'],
      default: 'uploaded',
    },
    adminNotes: { type: String, default: '' },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema);
