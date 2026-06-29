import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * Protect routes by verifying JWT in Authorization header
 */
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header: "Bearer <token>"
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET || "fallback_access_secret_123"
      );

      // Get user from the token, exclude password
      req.user = await User.findById(decoded.id);

      if (!req.user) {
        return res.status(401).json({
          ok: false,
          error: "Not authorized, user not found",
          code: "UNAUTHORIZED",
        });
      }

      next();
    } catch (error) {
      console.error("JWT verification failed:", error.message);
      return res.status(401).json({
        ok: false,
        error: "Not authorized, token failed",
        code: "UNAUTHORIZED",
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      ok: false,
      error: "Not authorized, no token provided",
      code: "UNAUTHORIZED",
    });
  }
};

/**
 * Limit access to specific roles (e.g. admin)
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        ok: false,
        error: `User role '${req.user?.role || "none"}' is not authorized to access this route`,
        code: "FORBIDDEN",
      });
    }
    next();
  };
};

/**
 * Admin specific access middleware shorthand
 */
export const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      ok: false,
      error: "Not authorized as an admin",
      code: "FORBIDDEN",
    });
  }
};
