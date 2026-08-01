import "dotenv/config";

import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    // Connect MongoDB
    await connectDB();

    // Start Express Server
    app.listen(PORT, () => {
      console.log("======================================");
      console.log("🚀 Server Started Successfully");
      console.log(`🌍 Environment : ${process.env.NODE_ENV}`);
      console.log(`📡 Port        : ${PORT}`);
      console.log(`🔗 URL         : http://localhost:${PORT}`);
      console.log("======================================");
    });
  } catch (error) {
    console.error("======================================");
    console.error("❌ Failed to Start Server");
    console.error(error.message);
    console.error("======================================");
    process.exit(1);
  }
};

startServer();