import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import bulkProductRoutes from "./routes/bulkProductRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import enquiryRoutes from "./routes/enquiryRoutes.js";
import bannerRoutes from "./routes/bannerRoutes.js";
import showcaseBannerRoutes from "./routes/showcaseBannerRoutes.js";
import testimonialRoutes from "./routes/testimonialRoutes.js";
import newArrivalsSectionRoutes from "./routes/newArrivalsSectionRoutes.js";


const app = express();

/* ---------------- Security ---------------- */

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

if (process.env.NODE_ENV === "production") {
  app.use(limiter);
}

/* ---------------- CORS ---------------- */

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors());

/* ---------------- Body Parser ---------------- */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

/* ---------------- Health ---------------- */

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server Running",
    timestamp: new Date(),
  });
});

/* ---------------- API Routes ---------------- */

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/upload", uploadRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/wishlist", wishlistRoutes);
app.use("/api/v1/user/addresses", addressRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/enquiries", enquiryRoutes);
app.use("/api/v1/banners", bannerRoutes);
app.use("/api/v1/showcase-banner", showcaseBannerRoutes);
app.use("/api/v1/testimonials", testimonialRoutes);
app.use("/api/v1/new-arrivals-section", newArrivalsSectionRoutes);
app.use(
  "/api/v1/products",
  bulkProductRoutes
);

/* ---------------- 404 ---------------- */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

/* ---------------- Global Error Handler ---------------- */

app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;