import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";

await mongoose.connect(process.env.MONGO_URI);

// Purana admin delete
await User.deleteOne({
  email: process.env.ADMIN_EMAIL,
});

// Naya admin create
await User.create({
  name: process.env.ADMIN_NAME || "Admin",
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD,
  role: "admin",
  isVerified: true,
});

console.log("✅ Admin recreated successfully");

await mongoose.disconnect();
process.exit(0);