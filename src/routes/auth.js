import express from 'express';
import bcrypt from 'bcryptjs';
import { findUserByEmail, createUser, sanitizeUser } from '../repositories/userRepository.js';
import { signToken, requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ error: 'name, email, password required' });
    if (String(password).length < 6) return res.status(400).json({ error: 'password must be >= 6 chars' });
    const existing = await findUserByEmail(email);
    if (existing) return res.status(409).json({ error: 'email already registered' });
    // Prevent privilege escalation: only allow 'user' via public register.
    const safeRole = role === 'admin' ? 'user' : 'user';
    const user = await createUser({
      name: String(name).trim(),
      email: String(email).toLowerCase().trim(),
      passwordHash: bcrypt.hashSync(String(password), 10),
      role: safeRole,
    });
    const token = signToken(user);
    res.status(201).json({ token, user: sanitizeUser(user) });
  } catch (e) {
    res.status(500).json({ error: 'registration failed' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email, password required' });
  const user = await findUserByEmail(email);
  if (!user) return res.status(401).json({ error: 'invalid credentials' });
  const ok = bcrypt.compareSync(String(password), user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'invalid credentials' });
  res.json({ token: signToken(user), user: sanitizeUser(user) });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
});

export default router;
