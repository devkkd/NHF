import express from "express";

import {
  register,
  verifyOTP,
  resendOTP,

  login,
  sendLoginOTP,
  verifyLoginOTP,

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

/* =========================================================
   REGISTER
========================================================= */

router.post("/register", register);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);

/* =========================================================
   NORMAL LOGIN
   Email + Password
========================================================= */

router.post("/login", login);

/* =========================================================
   OTP LOGIN
   Email -> OTP -> Login
========================================================= */

router.post("/login-otp", sendLoginOTP);
router.post("/verify-login-otp", verifyLoginOTP);

/* =========================================================
   ADMIN
========================================================= */

router.post("/admin/login", adminLogin);

/* =========================================================
   GOOGLE LOGIN
========================================================= */

router.post("/google", googleLogin);

/* =========================================================
   FORGOT PASSWORD
========================================================= */

router.post("/forgot-password", forgotPassword);
router.post("/verify-forgot-otp", verifyForgotOTP);
router.post("/reset-password", resetPassword);

/* =========================================================
   SESSION
========================================================= */

router.post("/refresh", refresh);
router.post("/logout", logout);

router.post("/admin/refresh", adminRefresh);
router.post("/admin/logout", adminLogout);

/* =========================================================
   CURRENT USER
========================================================= */

router.get("/me", protect, getMe);

export default router;