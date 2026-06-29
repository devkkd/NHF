import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Helper to generate access token
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_ACCESS_SECRET || "fallback_access_secret_123",
    { expiresIn: "15m" } // Access token expires in 15 minutes
  );
};

// Helper to generate refresh token
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_REFRESH_SECRET || "fallback_refresh_secret_456",
    { expiresIn: "7d" } // Refresh token expires in 7 days
  );
};

// Cookie options helper
const getCookieOptions = () => {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax", // Lax is fine since both run on localhost
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  };
};

/**
 * @desc    Login Admin & get access token + HTTP-Only cookie refresh token
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate request
    if (!email || !password) {
      return res.status(400).json({
        ok: false,
        error: "Please provide an email and password",
        code: "BAD_REQUEST",
      });
    }

    // Check if user exists (include password since select is false in model)
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        ok: false,
        error: "Invalid email or password",
        code: "UNAUTHORIZED",
      });
    }

    // Check password match
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        ok: false,
        error: "Invalid email or password",
        code: "UNAUTHORIZED",
      });
    }

    // Check if user is admin
    if (user.role !== "admin") {
      return res.status(403).json({
        ok: false,
        error: "Access denied. Admins only.",
        code: "FORBIDDEN",
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Set refresh token in HTTP-only cookie
    res.cookie("refreshToken", refreshToken, getCookieOptions());

    // Send success response
    res.status(200).json({
      ok: true,
      data: {
        accessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get new access token using refresh token in cookie
 * @route   POST /api/v1/auth/refresh
 * @access  Public (Uses cookie validation)
 */
export const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        ok: false,
        error: "No refresh token, access denied",
        code: "UNAUTHORIZED",
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || "fallback_refresh_secret_456"
      );
    } catch (err) {
      return res.status(401).json({
        ok: false,
        error: "Session expired or invalid refresh token",
        code: "UNAUTHORIZED",
      });
    }

    // Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        ok: false,
        error: "Admin user associated with this session no longer exists",
        code: "UNAUTHORIZED",
      });
    }

    // Check role is admin
    if (user.role !== "admin") {
      return res.status(403).json({
        ok: false,
        error: "Access denied. Admins only.",
        code: "FORBIDDEN",
      });
    }

    // Generate new tokens (optional refresh token rotation, let's keep current cookie or refresh maxAge)
    const accessToken = generateAccessToken(user);
    
    // Optionally refresh cookie life
    res.cookie("refreshToken", refreshToken, getCookieOptions());

    res.status(200).json({
      ok: true,
      data: {
        accessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Clear HTTP-Only cookie & logout
 * @route   POST /api/v1/auth/logout
 * @access  Public
 */
export const logout = async (req, res, next) => {
  try {
    // Clear cookie options (must match set configurations exactly except maxAge/expires)
    const clearOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    };

    res.clearCookie("refreshToken", clearOptions);

    res.status(200).json({
      ok: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};
