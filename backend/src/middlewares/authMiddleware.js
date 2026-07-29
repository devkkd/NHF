import jwt from 'jsonwebtoken';
import User from '../models/User.js';
export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ ok: false, error: 'No token' });
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ ok: false, error: 'User not found' });
    next();
  } catch { res.status(401).json({ ok: false, error: 'Invalid token' }); }
};
export const admin = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ ok: false, error: 'Admin only' });
  next();
};
