import jwt from "jsonwebtoken";
import User from "../models/User.js";
import OTP from "../models/OTP.js";
import bcrypt from "bcryptjs";
import sendMail from "../utils/sendMail.js";
import { OAuth2Client } from "google-auth-library";
import { generateOTP } from "../utils/generateOTP.js";
import { otpTemplate } from "../utils/emailTemplates.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields.",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered.",
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      provider: "email",
      isVerified: false,
    });

    const otp = generateOTP();

    await OTP.deleteMany({
      email: user.email,
      purpose: "register",
    });

    await OTP.create({
      email: user.email,
      otp,
      purpose: "register",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    await sendMail({
      to: user.email,
      subject: "Verify your account",
      html: otpTemplate(user.name, otp),
    });

    return res.status(201).json({
      success: true,
      message: "OTP sent successfully.",
    });
  } catch (error) {
    next(error);
  }
};

export const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required.",
      });
    }

   const user = await User.findOne({
  email: email.toLowerCase(),
}).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const otpData = await OTP.findOne({
      email: email.toLowerCase(),
      otp,
      purpose: "register",
      expiresAt: { $gt: new Date() },
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
      email: email.toLowerCase(),
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
      },
    });
  } catch (error) {
    next(error);
  }
};

export const resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
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

    await OTP.deleteMany({
      email: user.email,
      purpose: "register",
    });

    const otp = generateOTP();

    await OTP.create({
      email: user.email,
      otp,
      purpose: "register",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    await sendMail({
      to: user.email,
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

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log("==== LOGIN ====");
console.log("Email:", email);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and Password are required.",
      });
    }

   const user = await User.findOne({
  email: email.toLowerCase(),
}).select("+password");

console.log("User:", user);
if (user) {
  console.log("Role:", user.role);
  console.log("Verified:", user.isVerified);
  console.log("Provider:", user.provider);

  const isMatch = await user.matchPassword(password);
  console.log("Password Match:", isMatch);
}

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
if (user.role !== "admin" && !user.isVerified) {
  return res.status(403).json({
    success: false,
    message: "Please verify your email first.",
  });
}

    if (user.provider === "google") {
      return res.status(400).json({
        success: false,
        message: "This account was created using Google. Please login with Google.",
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
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
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
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

    // Token rotation
    const accessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save();

    res.cookie("refreshToken", newRefreshToken, cookieOptions);

    return res.json({
      success: true,
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};
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

  } catch (err) {
    next(err);
  }
};
export const logout = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.id);

        if (user) {
          user.refreshToken = null;
          await user.save();
        }
      } catch (err) {
        // token invalid/expired → ignore, just clear cookie
      }
    }

    res.clearCookie("refreshToken", cookieOptions);

    return res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password -refreshToken");

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

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

  const user = await User.findOne({
  email: email.toLowerCase(),
}).select("+password");

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
      email: user.email,
      purpose: "forgot-password",
    });

    await OTP.create({
      email: user.email,
      otp,
      purpose: "forgot-password",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    await sendMail({
      to: user.email,
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

export const verifyForgotOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const otpData = await OTP.findOne({
      email: email.toLowerCase(),
      otp,
      purpose: "forgot-password",
      expiresAt: { $gt: new Date() },
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

export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, password } = req.body;

    const otpData = await OTP.findOne({
      email: email.toLowerCase(),
      otp,
      purpose: "forgot-password",
      expiresAt: { $gt: new Date() },
    });

    if (!otpData) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP.",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // plain password — pre-save hook hash karega
    user.password = password;
    await user.save();

    await OTP.deleteMany({
      email: user.email,
      purpose: "forgot-password",
    });

    return res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    next(error);
  }
};

export const googleLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: "Google ID Token is required.",
      });
    }

    // Verify token with Google
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

    const { email, name, sub: googleId, picture: avatar } = payload;

    let user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      user = await User.create({
        name: name || "Google User",
        email: email.toLowerCase(),
        googleId,
        avatar,
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
    // Google verification fail
    if (error.message?.includes("Wrong recipient") || error.message?.includes("Token used too late")) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired Google token.",
      });
    }
    next(error);
  }
};
export const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase(),
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

    res.cookie("adminRefreshToken", refreshToken, cookieOptions);

    return res.json({
      success: true,
      accessToken,
      user,
    });
  } catch (err) {
    next(err);
  }
};
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
      } catch (err) {
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