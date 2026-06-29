import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.js";
import connectDB from "../config/db.js";

// Load env variables
dotenv.config();

const seedAdmin = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log("Checking for existing admin user...");
    const adminEmail = "admin@nikitahf.com";
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log(`Admin user with email '${adminEmail}' already exists.`);
      console.log("Seed skipped.");
      mongoose.connection.close();
      process.exit(0);
    }

    console.log("Seeding default admin user...");
    const adminUser = new User({
      name: "NHF Admin",
      email: adminEmail,
      password: "admin123", // Will be automatically hashed by User schema pre-save hook
      role: "admin",
    });

    await adminUser.save();

    console.log("-----------------------------------------");
    console.log("Admin user seeded successfully!");
    console.log(`Email:    ${adminEmail}`);
    console.log("Password: admin123");
    console.log("-----------------------------------------");

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding admin: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
