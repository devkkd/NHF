import dns from "dns";
import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";

// Force IPv4 resolution first for DNS lookups (fixes ECONNREFUSED on Windows Node.js)
dns.setDefaultResultOrder("ipv4first");

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
