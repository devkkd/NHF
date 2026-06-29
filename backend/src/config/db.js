import dns from "dns";
import mongoose from "mongoose";

// Force IPv4 resolution first for DNS lookups (fixes ECONNREFUSED on Windows Node.js)
dns.setDefaultResultOrder("ipv4first");

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/nhf_db";
    console.log(`Connecting to MongoDB at: ${mongoUri.replace(/:([^@]+)@/, ":****@")}`); // Hide credentials in logs if any
    
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
