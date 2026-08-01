import express from "express";

import {
  register,
  verifyOTP,
  resendOTP,
  login,
  adminLogin,
  googleLogin,
  forgotPassword,
  verifyForgotOTP,
  resetPassword,
  refresh,
  adminRefresh,
  logout,
  adminLogout,
  getMe,
} from "../controllers/authController.js";

import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Authentication
router.post("/register", register);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/login", login);
router.post("/admin/login", adminLogin);
router.post("/google", googleLogin);

// Forgot Password
router.post("/forgot-password", forgotPassword);
router.post("/verify-forgot-otp", verifyForgotOTP);
router.post("/reset-password", resetPassword);

// Session
router.post("/refresh", refresh);
router.post("/logout", logout);
router.post("/admin/refresh", adminRefresh);
router.post("/admin/logout", adminLogout);

// Current User
router.get("/me", protect, getMe);

export default router;