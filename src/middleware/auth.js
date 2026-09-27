import jwt from 'jsonwebtoken';
import config from '../config.js';
import { findUserById } from '../repositories/userRepository.js';

export function signToken(user) {
  const id = String(user._id || user.id);
  return jwt.sign({ sub: id, role: user.role, email: user.email }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing auth token' });
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    const user = await findUserById(payload.sub);
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden: insufficient role' });
    next();
  };
}
