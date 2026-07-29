import jwt from 'jsonwebtoken';
import User from '../models/User.js';
const genToken = (id) => jwt.sign({ id }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
const genRefresh = (id) => jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ ok: false, error: 'Invalid credentials' });
    const accessToken = genToken(user._id);
    const refreshToken = genRefresh(user._id);
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7*24*60*60*1000 });
    res.json({ ok: true, data: { accessToken, user: { id: user._id, name: user.name, email: user.email, role: user.role } } });
  } catch (err) { next(err); }
};
export const refresh = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ ok: false, error: 'No refresh token' });
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const accessToken = genToken(decoded.id);
    res.json({ ok: true, data: { accessToken } });
  } catch { res.status(401).json({ ok: false, error: 'Invalid refresh token' }); }
};
export const logout = (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ ok: true, data: { message: 'Logged out' } });
};
export const getMe = async (req, res) => {
  res.json({ ok: true, data: { user: req.user } });
};
