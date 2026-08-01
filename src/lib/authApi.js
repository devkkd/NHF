import api from "./axios";

// Register
export const registerUser = (body) =>
  api.post("/auth/register", body);

// Verify OTP
export const verifyOTP = (body) =>
  api.post("/auth/verify-otp", body);

// Resend OTP
export const resendOTP = (body) =>
  api.post("/auth/resend-otp", body);

// Login
export const loginUser = (body) =>
  api.post("/auth/login", body);

// Google Login
export const googleLogin = (body) =>
  api.post("/auth/google", body);

// Forgot Password
export const forgotPassword = (body) =>
  api.post("/auth/forgot-password", body);

// Verify Forgot OTP
export const verifyForgotOTP = (body) =>
  api.post("/auth/verify-forgot-otp", body);

// Reset Password
export const resetPassword = (body) =>
  api.post("/auth/reset-password", body);

// Current User
export const getMe = () =>
  api.get("/auth/me");

// Logout
export const logoutUser = () =>
  api.post("/auth/logout");

// Refresh
export const refreshToken = () =>
  api.post("/auth/refresh");