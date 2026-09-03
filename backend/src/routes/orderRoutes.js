import express from "express";

import {
  protect,
  admin,
} from "../middlewares/authMiddleware.js";

import {
  createOrder,
  createRazorpayOrder,
  verifyPayment,

  trackOrder,
  adminTrackOrder,

  getMyOrders,
  getOrderById,

  // Admin
  getAllOrders,
  getAdminOrderById,
  updateOrderStatus,
} from "../controllers/orderController.js";

import {
  getPendingApprovalOrders,
  getApprovalOrder,
  approveOrder,
  rejectOrder,
} from "../controllers/adminOrderController.js";

const router = express.Router();

/* =========================================================
   ADMIN - ORDER APPROVAL
========================================================= */

/*
 * Pending approval orders
 *
 * GET /api/v1/orders/admin/pending
 *
 * Ye routes /:id se pehle hone chahiye.
 */

router.get(
  "/admin/pending",
  protect,
  admin,
  getPendingApprovalOrders
);

/*
 * Single order for approval
 *
 * GET /api/v1/orders/admin/:id/approval
 */

router.get(
  "/admin/:id/approval",
  protect,
  admin,
  getApprovalOrder
);

/*
 * Approve order
 *
 * PATCH /api/v1/orders/admin/:id/approve
 *
 * Iske andar:
 *
 * 1. Payment check
 * 2. Shiprocket order create
 * 3. AWB assign
 * 4. Pickup request
 * 5. Admin approval = approved
 * 6. Order status = confirmed
 */

router.patch(
  "/admin/:id/approve",
  protect,
  admin,
  approveOrder
);

/*
 * Reject order
 *
 * PATCH /api/v1/orders/admin/:id/reject
 *
 * body:
 *
 * {
 *   "reason": "Product temporarily unavailable"
 * }
 */

router.patch(
  "/admin/:id/reject",
  protect,
  admin,
  rejectOrder
);

/* =========================================================
   ADMIN - ALL ORDERS
========================================================= */

/*
 * GET /api/v1/orders/admin/all
 */

router.get(
  "/admin/all",
  protect,
  admin,
  getAllOrders
);

/*
 * GET /api/v1/orders/admin/:id
 *
 * IMPORTANT:
 * /admin/:id ko approval routes ke BAAD rakha gaya hai.
 */

router.get(
  "/admin/:id",
  protect,
  admin,
  getAdminOrderById
);

/*
 * PATCH /api/v1/orders/admin/:id/status
 */

router.patch(
  "/admin/:id/status",
  protect,
  admin,
  updateOrderStatus
);

/*
 * GET /api/v1/orders/admin/:id/tracking
 *
 * Admin order tracking refresh.
 */

router.get(
  "/admin/:id/tracking",
  protect,
  admin,
  adminTrackOrder
);

/* =========================================================
   USER - CREATE ORDER
========================================================= */

/*
 * POST /api/v1/orders
 */

router.post(
  "/",
  protect,
  createOrder
);

/* =========================================================
   USER - RAZORPAY
========================================================= */

/*
 * POST /api/v1/orders/razorpay
 */

router.post(
  "/razorpay",
  protect,
  createRazorpayOrder
);

/*
 * POST /api/v1/orders/verify
 */

router.post(
  "/verify",
  protect,
  verifyPayment
);

/* =========================================================
   USER - MY ORDERS
========================================================= */

/*
 * GET /api/v1/orders/my-orders
 */

router.get(
  "/my-orders",
  protect,
  getMyOrders
);

/* =========================================================
   USER - TRACKING
========================================================= */

/*
 * GET /api/v1/orders/track/:id
 *
 * User can track only own order.
 */

router.get(
  "/track/:id",
  protect,
  trackOrder
);

/* =========================================================
   USER - SINGLE ORDER
========================================================= */

/*
 * IMPORTANT:
 * Keep this LAST.
 *
 * Otherwise:
 *
 * /admin/pending
 * /admin/:id
 * /my-orders
 * etc.
 *
 * can accidentally get matched by /:id.
 */

router.get(
  "/:id",
  protect,
  getOrderById
);

export default router;