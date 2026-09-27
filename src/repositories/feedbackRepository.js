/** Feedback data-access: same API over MongoDB or the JSON file store. */
const { isMongo, getModels } = require('../db/connection');
const { readDb, writeDb, uid } = require('../db/fileStore');

function normalizeFeedback(f) {
  if (!f) return f;
  const id = String(f._id || f.id);
  return { ...f, id };
}

async function createFeedback(doc) {
  if (isMongo()) {
    const f = await getModels().Feedback.create({ ...doc, userId: doc.userId });
    return normalizeFeedback((await getModels().Feedback.findById(f._id).lean()));
  }
  const db = readDb();
  const fb = {
    id: uid('f'),
    status: 'uploaded',
    transcript: { text: '', confidence: 0, engine: 'mock', language: doc.language || 'en-IN' },
    sentiment: { label: 'neutral', score: 0, confidence: 0, keywords: [] },
    adminNotes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...doc,
  };
  db.feedbacks.unshift(fb);
  writeDb(db);
  return fb;
}

async function updateFeedback(id, patch) {
  if (isMongo()) {
    await getModels().Feedback.findByIdAndUpdate(id, { $set: patch });
    const f = await getModels().Feedback.findById(id).lean();
    return normalizeFeedback(f);
  }
  const db = readDb();
  const i = db.feedbacks.findIndex((f) => f.id === String(id));
  if (i === -1) return null;
  db.feedbacks[i] = { ...db.feedbacks[i], ...patch, updatedAt: new Date().toISOString() };
  writeDb(db);
  return db.feedbacks[i];
}

async function getFeedbackById(id) {
  if (isMongo()) {
    const f = await getModels().Feedback.findById(id).lean();
    return f ? normalizeFeedback(f) : null;
  }
  return readDb().feedbacks.find((f) => f.id === String(id)) || null;
}

async function findUserBrief(userId, fileUsers) {
  if (isMongo()) {
    const u = await getModels().User.findById(userId).lean().catch(() => null);
    return u ? { name: u.name, email: u.email } : null;
  }
  const u = fileUsers.find((x) => String(x.id) === String(userId));
  return u ? { name: u.name, email: u.email } : null;
}

async function listFeedbacks({ sentiment, search, userId } = {}) {
  let items;
  if (isMongo()) {
    const q = {};
    if (userId) q.userId = userId;
    if (sentiment) q['sentiment.label'] = sentiment;
    items = await getModels().Feedback.find(q).sort({ createdAt: -1 }).limit(200).lean();
    items = items.map(normalizeFeedback);
  } else {
    items = [...readDb().feedbacks];
    if (userId) items = items.filter((f) => String(f.userId) === String(userId));
    if (sentiment) items = items.filter((f) => f.sentiment?.label === sentiment);
  }
  if (search) {
    const s = search.toLowerCase();
    items = items.filter((f) =>
      [f.transcript?.text, f.clientTranscript, f.orderId, f.adminNotes]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(s)
    );
  }
  // attach user email/name for admin view
  const fileUsers = isMongo() ? null : readDb().users;
  const out = [];
  for (const f of items) {
    out.push({ ...f, user: await findUserBrief(f.userId, fileUsers) });
  }
  return out;
}

async function deleteFeedback(id) {
  if (isMongo()) {
    const f = await getModels().Feedback.findByIdAndDelete(id).lean();
    return f ? normalizeFeedback(f) : null;
  }
  const db = readDb();
  const i = db.feedbacks.findIndex((f) => f.id === String(id));
  if (i === -1) return null;
  const [removed] = db.feedbacks.splice(i, 1);
  writeDb(db);
  return removed;
}

module.exports = {
  createFeedback,
  updateFeedback,
  getFeedbackById,
  listFeedbacks,
  deleteFeedback,
  normalizeFeedback,
};
