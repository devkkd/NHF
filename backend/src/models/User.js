import mongoose from "mongoose";
import bcrypt from "bcryptjs";

/* ===========================
   Address Schema
=========================== */

const addressSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    address1: {
      type: String,
      required: true,
      trim: true,
    },

    address2: {
      type: String,
      default: "",
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    country: {
      type: String,
      required: true,
      trim: true,
    },

    pin: {
      type: String,
      required: true,
      trim: true,
    },

    mobile: {
      type: String,
      required: true,
      trim: true,
    },

    altMobile: {
      type: String,
      default: "",
      trim: true,
    },

    lat: {
      type: Number,
      default: null,
    },

    lng: {
      type: Number,
      default: null,
    },

    label: {
      type: String,
      enum: ["Home", "Office", "Other"],
      default: "Home",
    },

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

/* ===========================
   User Schema
=========================== */

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      default: null,
      select: false,
    },

    provider: {
      type: String,
      enum: ["email", "google"],
      default: "email",
    },

    googleId: {
      type: String,
      default: null,
    },

    avatar: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    refreshToken: {
      type: String,
      default: null,
    },

    // =========================
    // User Addresses
    // =========================
    addresses: {
      type: [addressSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

/* ===========================
   Password Hash
=========================== */

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  if (!this.password) return next();

  this.password = await bcrypt.hash(this.password, 12);

  next();
});

/* ===========================
   Compare Password
=========================== */

userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;

  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;