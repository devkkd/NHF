import express from "express";
import { protect, admin } from "../middlewares/authMiddleware.js";
// Agar admin middleware hai to uncomment karo
// import { adminOnly } from "../middlewares/authMiddleware.js";

import {
  createOrder,
  createRazorpayOrder,
  verifyPayment,
  trackOrder,
  getMyOrders,
  getOrderById,

  // Admin Controllers
  getAllOrders,
  getAdminOrderById,
  updateOrderStatus,
} from "../controllers/orderController.js";

const router = express.Router();
/* ==========================================
   ADMIN ROUTES
========================================== */

// All Orders
router.get("/admin/all", protect, admin, getAllOrders);


// Single Order Details
router.get("/admin/:id", protect, admin, getAdminOrderById);


// Update Order Status
router.patch("/admin/:id/status", protect, admin, updateOrderStatus);
/* ==========================================
   USER ROUTES
========================================== */

// Create Order
router.post("/", protect, createOrder);

// Create Razorpay Order
router.post("/razorpay", protect, createRazorpayOrder);

// Verify Payment
router.post("/verify", protect, verifyPayment);

// User Orders
router.get("/my-orders", protect, getMyOrders);

// Track Order
router.get("/track/:id", protect, trackOrder);

// User Single Order
router.get("/:id", protect, getOrderById);



export default router;