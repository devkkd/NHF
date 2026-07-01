import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ── Token helpers ─────────────────────────────────────────
const generateAccessToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_ACCESS_SECRET || "fallback_access_secret_123",
    { expiresIn: "15m" }
  );

const generateRefreshToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_REFRESH_SECRET || "fallback_refresh_secret_456",
    { expiresIn: "7d" }
  );

const cookieOpts = () => ({
  httpOnly: true,
  secure:   process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days
});

const clearCookieOpts = () => ({
  httpOnly: true,
  secure:   process.env.NODE_ENV === "production",
  sameSite: "lax",
});

// ── POST /api/v1/auth/login ───────────────────────────────
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ ok: false, error: "Email and password are required", code: "BAD_REQUEST" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ ok: false, error: "Invalid email or password", code: "UNAUTHORIZED" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ ok: false, error: "Invalid email or password", code: "UNAUTHORIZED" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ ok: false, error: "Access denied. Admins only.", code: "FORBIDDEN" });
    }

    const accessToken  = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie("refreshToken", refreshToken, cookieOpts());

    return res.status(200).json({
      ok:   true,
      data: {
        accessToken,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      },
    });
  } catch (err) { next(err); }
};

// ── POST /api/v1/auth/refresh ─────────────────────────────
export const refresh = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({ ok: false, error: "No refresh token.", code: "UNAUTHORIZED" });
    }

    // Verify — if expired or invalid, clear the cookie and return 401
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || "fallback_refresh_secret_456");
    } catch {
      res.clearCookie("refreshToken", clearCookieOpts());
      return res.status(401).json({ ok: false, error: "Session expired. Please log in again.", code: "UNAUTHORIZED" });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      res.clearCookie("refreshToken", clearCookieOpts());
      return res.status(401).json({ ok: false, error: "User no longer exists.", code: "UNAUTHORIZED" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ ok: false, error: "Access denied. Admins only.", code: "FORBIDDEN" });
    }

    // Issue fresh access token, extend cookie life
    const accessToken = generateAccessToken(user);
    res.cookie("refreshToken", token, cookieOpts());

    return res.status(200).json({
      ok:   true,
      data: {
        accessToken,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      },
    });
  } catch (err) { next(err); }
};

// ── POST /api/v1/auth/logout ──────────────────────────────
export const logout = async (_req, res, next) => {
  try {
    res.clearCookie("refreshToken", clearCookieOpts());
    return res.status(200).json({ ok: true, message: "Logged out successfully." });
  } catch (err) { next(err); }
};
