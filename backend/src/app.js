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
import tradeFairRoutes from "./routes/tradeFairRoutes.js";


const app = express();


// ======================================================
// SECURITY
// ======================================================

app.use(
  helmet()
);


const limiter = rateLimit({
  windowMs:
    15 * 60 * 1000,

  max: 10000,

  message: {
    success: false,
    message:
      "Too many requests. Please try again later.",
  },
});


if (
  process.env.NODE_ENV ===
  "production"
) {
  app.use(
    limiter
  );
}


// ======================================================
// CORS
// ENV BASED
// ======================================================

const allowedOrigins = (
  process.env.CLIENT_URL ||
  "http://localhost:3000"
)
  .split(",")
  .map(
    (origin) =>
      origin.trim()
  )
  .filter(Boolean);


/*
 * IMPORTANT:
 *
 * Direct array/string based CORS.
 * Custom callback nahi use kar rahe,
 * taaki rejected CORS request par
 * middleware error na throw kare.
 */

app.use(
  cors({
    origin:
      allowedOrigins.length === 1
        ? allowedOrigins[0]
        : allowedOrigins,

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],

    optionsSuccessStatus: 204,
  })
);


// ======================================================
// PREFLIGHT
// ======================================================

app.options(
  "*",
  cors({
    origin:
      allowedOrigins.length === 1
        ? allowedOrigins[0]
        : allowedOrigins,

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],

    optionsSuccessStatus: 204,
  })
);


// ======================================================
// BODY PARSER
// ======================================================

app.use(
  express.json()
);

app.use(
  express.urlencoded({
    extended: true,
  })
);


// ======================================================
// COOKIE PARSER
// ======================================================

app.use(
  cookieParser()
);


// ======================================================
// HEALTH
// ======================================================

app.get(
  "/health",
  (req, res) => {
    res.status(200).json({
      success: true,

      message:
        "Server Running",

      timestamp:
        new Date(),
    });
  }
);


// ======================================================
// API ROUTES
// ======================================================

app.use(
  "/api/v1/auth",
  authRoutes
);

app.use(
  "/api/v1/categories",
  categoryRoutes
);

app.use(
  "/api/v1/products",
  productRoutes
);

app.use(
  "/api/v1/upload",
  uploadRoutes
);

app.use(
  "/api/v1/cart",
  cartRoutes
);

app.use(
  "/api/v1/wishlist",
  wishlistRoutes
);

app.use(
  "/api/v1/user/addresses",
  addressRoutes
);

app.use(
  "/api/v1/orders",
  orderRoutes
);

app.use(
  "/api/v1/enquiries",
  enquiryRoutes
);

app.use(
  "/api/v1/banners",
  bannerRoutes
);

app.use(
  "/api/v1/showcase-banner",
  showcaseBannerRoutes
);

app.use(
  "/api/v1/testimonials",
  testimonialRoutes
);

app.use(
  "/api/v1/new-arrivals-section",
  newArrivalsSectionRoutes
);

app.use(
  "/api/v1/products",
  bulkProductRoutes
);

app.use(
  "/api/v1/trade-fairs",
  tradeFairRoutes
);

// ======================================================
// 404
// ======================================================

app.use(
  (req, res) => {
    res.status(404).json({
      success: false,

      message:
        "Route Not Found",
    });
  }
);


// ======================================================
// GLOBAL ERROR HANDLER
// ======================================================

app.use(
  (
    err,
    req,
    res,
    next
  ) => {
    console.error(
      "GLOBAL ERROR:",
      err
    );

    res.status(
      err.status || 500
    ).json({
      success: false,

      message:
        err.message ||
        "Internal Server Error",
    });
  }
);


export default app;