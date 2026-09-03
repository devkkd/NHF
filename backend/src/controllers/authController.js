import jwt from "jsonwebtoken";
import User from "../models/User.js";
import OTP from "../models/OTP.js";
import bcrypt from "bcryptjs";
import sendMail from "../utils/sendMail.js";
import { OAuth2Client } from "google-auth-library";
import { generateOTP } from "../utils/generateOTP.js";
import { otpTemplate } from "../utils/emailTemplates.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/* =========================================================
   TOKEN HELPERS
========================================================= */

const generateAccessToken = (userId) => {
  return jwt.sign(
    {
      id: userId,
    },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: "15m",
    }
  );
};

const generateRefreshToken = (userId) => {
  return jwt.sign(
    {
      id: userId,
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

/* =========================================================
   COOKIE OPTIONS
========================================================= */

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
};

/* =========================================================
   EMAIL NORMALIZER
========================================================= */

const normalizeEmail = (email) => {
  return String(email || "").trim().toLowerCase();
};

/* =========================================================
   REGISTER
========================================================= */

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const normalizedEmail = normalizeEmail(email);

    if (!name || !normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered.",
      });
    }

    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password,
      provider: "email",
      isVerified: false,
    });

    const otp = generateOTP();

    await OTP.deleteMany({
      email: normalizedEmail,
      purpose: "register",
    });

    await OTP.create({
      email: normalizedEmail,
      otp,
      purpose: "register",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    await sendMail({
      to: normalizedEmail,
      subject: "Verify your account",
      html: otpTemplate(user.name, otp),
    });

    return res.status(201).json({
      success: true,
      message: "OTP sent successfully.",
      email: normalizedEmail,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   VERIFY REGISTER OTP
========================================================= */

export const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required.",
      });
    }

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const otpData = await OTP.findOne({
      email: normalizedEmail,
      otp: String(otp).trim(),
      purpose: "register",
      expiresAt: {
        $gt: new Date(),
      },
    });

    if (!otpData) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP.",
      });
    }

    user.isVerified = true;
    user.lastLogin = new Date();

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;

    await user.save();

    await OTP.deleteMany({
      email: normalizedEmail,
      purpose: "register",
    });

    res.cookie("refreshToken", refreshToken, cookieOptions);

    return res.status(200).json({
      success: true,
      message: "Account verified successfully.",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   RESEND REGISTER OTP
========================================================= */

export const resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Account already verified.",
      });
    }

    const otp = generateOTP();

    await OTP.deleteMany({
      email: normalizedEmail,
      purpose: "register",
    });

    await OTP.create({
      email: normalizedEmail,
      otp,
      purpose: "register",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    await sendMail({
      to: normalizedEmail,
      subject: "Resend Verification OTP",
      html: otpTemplate(user.name, otp),
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully.",
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   NORMAL LOGIN
   Email + Password
========================================================= */

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = normalizeEmail(email);

    console.log("==== PASSWORD LOGIN ====");
    console.log("Email:", normalizedEmail);

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and Password are required.",
      });
    }

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    console.log(
      "User:",
      user
        ? {
            id: user._id,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            provider: user.provider,
          }
        : null
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Please login from admin panel.",
      });
    }

    if (user.provider === "google") {
      return res.status(400).json({
        success: false,
        message:
          "This account was created using Google. Please login with Google.",
      });
    }

    const isMatch = await user.matchPassword(password);

    console.log("Password Match:", isMatch);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    /*
      Normally password login requires verified email.
      OTP login below can verify the email automatically.
    */
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email first or login using OTP.",
      });
    }

    user.lastLogin = new Date();

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;

    await user.save();

    res.cookie("refreshToken", refreshToken, cookieOptions);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   SEND LOGIN OTP
   User enters only email
========================================================= */

export const sendLoginOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const user = await User.findOne({
      email: normalizedEmail,
    });

    /*
      IMPORTANT:
      We don't allow OTP login to create an account.
      User must already exist.
    */
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email.",
      });
    }

    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Please login from admin panel.",
      });
    }

    if (user.provider === "google") {
      return res.status(400).json({
        success: false,
        message:
          "This account uses Google Sign-In. Please login with Google.",
      });
    }

    const otp = generateOTP();

    await OTP.deleteMany({
      email: normalizedEmail,
      purpose: "login",
    });

    await OTP.create({
      email: normalizedEmail,
      otp,
      purpose: "login",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    await sendMail({
      to: normalizedEmail,
      subject: "Your Login OTP",
      html: otpTemplate(user.name, otp),
    });

    return res.status(200).json({
      success: true,
      message: "Login OTP sent successfully.",
      email: normalizedEmail,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   VERIFY LOGIN OTP
========================================================= */

export const verifyLoginOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required.",
      });
    }

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email.",
      });
    }

    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Please login from admin panel.",
      });
    }

    if (user.provider === "google") {
      return res.status(400).json({
        success: false,
        message:
          "This account uses Google Sign-In. Please login with Google.",
      });
    }

    const otpData = await OTP.findOne({
      email: normalizedEmail,
      otp: String(otp).trim(),
      purpose: "login",
      expiresAt: {
        $gt: new Date(),
      },
    });

    if (!otpData) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP.",
      });
    }

    /*
      OTP has verified ownership of the email.
      Therefore account becomes verified.
    */
    user.isVerified = true;
    user.lastLogin = new Date();

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;

    await user.save();

    /*
      OTP should be one-time use.
    */
    await OTP.deleteMany({
      email: normalizedEmail,
      purpose: "login",
    });

    res.cookie("refreshToken", refreshToken, cookieOptions);

    return res.status(200).json({
      success: true,
      message: "OTP login successful.",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   FORGOT PASSWORD
========================================================= */

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email.",
      });
    }

    if (user.provider === "google") {
      return res.status(400).json({
        success: false,
        message:
          "This account uses Google Sign-In. Please login with Google.",
      });
    }

    const otp = generateOTP();

    await OTP.deleteMany({
      email: normalizedEmail,
      purpose: "forgot-password",
    });

    await OTP.create({
      email: normalizedEmail,
      otp,
      purpose: "forgot-password",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    await sendMail({
      to: normalizedEmail,
      subject: "Reset Password OTP",
      html: otpTemplate(user.name, otp),
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully.",
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   VERIFY FORGOT PASSWORD OTP
========================================================= */

export const verifyForgotOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required.",
      });
    }

    const otpData = await OTP.findOne({
      email: normalizedEmail,
      otp: String(otp).trim(),
      purpose: "forgot-password",
      expiresAt: {
        $gt: new Date(),
      },
    });

    if (!otpData) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully.",
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   RESET PASSWORD
========================================================= */

export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, password } = req.body;

    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !otp || !password) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP and new password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    const otpData = await OTP.findOne({
      email: normalizedEmail,
      otp: String(otp).trim(),
      purpose: "forgot-password",
      expiresAt: {
        $gt: new Date(),
      },
    });

    if (!otpData) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP.",
      });
    }

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.provider === "google") {
      return res.status(400).json({
        success: false,
        message:
          "This account uses Google Sign-In. Please login with Google.",
      });
    }

    /*
      User model pre-save hook hashes password.
    */
    user.password = password;

    /*
      Successful OTP verification proves email ownership.
    */
    user.isVerified = true;

    await user.save();

    await OTP.deleteMany({
      email: normalizedEmail,
      purpose: "forgot-password",
    });

    return res.status(200).json({
      success: true,
      message: "Password changed successfully. You can login now.",
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   GOOGLE LOGIN
========================================================= */

export const googleLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: "Google ID Token is required.",
      });
    }

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return res.status(400).json({
        success: false,
        message: "Invalid Google account.",
      });
    }

    const {
      email,
      name,
      sub: googleId,
      picture: avatar,
    } = payload;

    const normalizedEmail = normalizeEmail(email);

    let user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      user = await User.create({
        name: name || "Google User",
        email: normalizedEmail,
        googleId,
        avatar: avatar || "",
        provider: "google",
        isVerified: true,
      });
    } else {
      if (!user.googleId) {
        user.googleId = googleId;
      }

      if (!user.avatar && avatar) {
        user.avatar = avatar;
      }

      user.provider = "google";
      user.isVerified = true;
    }

    user.lastLogin = new Date();

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;

    await user.save();

    res.cookie("refreshToken", refreshToken, cookieOptions);

    return res.status(200).json({
      success: true,
      message: "Google login successful.",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    if (
      error.message?.includes("Wrong recipient") ||
      error.message?.includes("Token used too late")
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired Google token.",
      });
    }

    next(error);
  }
};

/* =========================================================
   REFRESH USER TOKEN
========================================================= */

export const refresh = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Refresh token missing.",
      });
    }

    let decoded;

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_REFRESH_SECRET
      );
    } catch {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token.",
      });
    }

    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== token) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token.",
      });
    }

    const accessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;

    await user.save();

    res.cookie(
      "refreshToken",
      newRefreshToken,
      cookieOptions
    );

    return res.json({
      success: true,
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   ADMIN REFRESH
========================================================= */

export const adminRefresh = async (req, res, next) => {
  try {
    const token = req.cookies.adminRefreshToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Admin refresh token missing.",
      });
    }

    let decoded;

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_REFRESH_SECRET
      );
    } catch {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token.",
      });
    }

    const user = await User.findById(decoded.id);

    if (
      !user ||
      user.role !== "admin" ||
      user.refreshToken !== token
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token.",
      });
    }

    const accessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;

    await user.save();

    res.cookie(
      "adminRefreshToken",
      newRefreshToken,
      cookieOptions
    );

    return res.json({
      success: true,
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   USER LOGOUT
========================================================= */

export const logout = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;

    if (token) {
      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_REFRESH_SECRET
        );

        const user = await User.findById(decoded.id);

        if (user) {
          user.refreshToken = null;
          await user.save();
        }
      } catch {
        // Ignore invalid/expired token
      }
    }

    res.clearCookie(
      "refreshToken",
      cookieOptions
    );

    return res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   ADMIN LOGOUT
========================================================= */

export const adminLogout = async (req, res, next) => {
  try {
    const token = req.cookies.adminRefreshToken;

    if (token) {
      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_REFRESH_SECRET
        );

        const user = await User.findById(decoded.id);

        if (user) {
          user.refreshToken = null;
          await user.save();
        }
      } catch {
        // Ignore invalid token
      }
    }

    res.clearCookie("adminRefreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Admin logged out successfully.",
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   GET CURRENT USER
========================================================= */

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-password -refreshToken"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   ADMIN LOGIN
========================================================= */

export const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and Password are required.",
      });
    }

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!user || user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials",
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials",
      });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;

    await user.save();

    res.cookie(
      "adminRefreshToken",
      refreshToken,
      cookieOptions
    );

    return res.json({
      success: true,
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};