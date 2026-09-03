import express from "express";

import {
  protect,
  admin,
} from "../middlewares/authMiddleware.js";

import {
  getMyOrderRequests,
  getMyOrderRequestById,
  createOrderRequest,
  cancelMyOrderRequest,

  getAllOrderRequests,
  getAdminOrderRequestById,
  approveOrderRequest,
  rejectOrderRequest,
} from "../controllers/orderRequestController.js";

const router = express.Router();

/* =========================================================
   USER REQUESTS
========================================================= */

/*
 * GET /api/v1/orders/requests/my
 *
 * User ki saari cancellation / return / replacement requests.
 */
router.get(
  "/my",
  protect,
  getMyOrderRequests
);

/*
 * GET /api/v1/orders/requests/my/:requestId
 *
 * User ki single request details.
 */
router.get(
  "/my/:requestId",
  protect,
  getMyOrderRequestById
);

/*
 * POST /api/v1/orders/requests/:orderId
 *
 * Cancel / Return / Replacement request create karega.
 *
 * JSON example:
 *
 * {
 *   "type": "cancel",
 *   "reason": "other",
 *   "description": "I don't need this order anymore"
 * }
 *
 * Return:
 *
 * {
 *   "type": "return",
 *   "orderItemId": "0",
 *   "reason": "damaged",
 *   "description": "..."
 * }
 *
 * Replacement:
 *
 * multipart/form-data
 *
 * type = replacement
 * orderItemId = 0
 * reason = damaged
 * description = Product damaged tha
 * images = damage photos
 *
 * NOTE:
 * Image upload middleware ko hum next step me
 * tumhare existing R2 / multer setup ke according
 * attach karenge.
 */
router.post(
  "/:orderId",
  protect,
  createOrderRequest
);

/*
 * PATCH /api/v1/orders/requests/my/:requestId/cancel
 *
 * User apni pending request cancel kar sakta hai.
 */
router.patch(
  "/my/:requestId/cancel",
  protect,
  cancelMyOrderRequest
);


/* =========================================================
   ADMIN REQUEST MANAGEMENT
========================================================= */

/*
 * GET /api/v1/orders/requests/admin/all
 *
 * Optional filters:
 *
 * ?status=pending
 * ?type=replacement
 *
 * Example:
 *
 * /orders/requests/admin/all?status=pending
 */
router.get(
  "/admin/all",
  protect,
  admin,
  getAllOrderRequests
);

/*
 * GET /api/v1/orders/requests/admin/:requestId
 *
 * Admin single request details.
 *
 * Replacement request me:
 * - customer
 * - order
 * - product
 * - damage images
 * - reason
 * - description
 * sab milega.
 */
router.get(
  "/admin/:requestId",
  protect,
  admin,
  getAdminOrderRequestById
);

/*
 * PATCH /api/v1/orders/requests/admin/:requestId/approve
 *
 * body:
 *
 * {
 *   "adminNote": "Damage verified."
 * }
 */
router.patch(
  "/admin/:requestId/approve",
  protect,
  admin,
  approveOrderRequest
);

/*
 * PATCH /api/v1/orders/requests/admin/:requestId/reject
 *
 * body:
 *
 * {
 *   "rejectionReason": "Damage could not be verified.",
 *   "adminNote": "Please provide clearer images."
 * }
 */
router.patch(
  "/admin/:requestId/reject",
  protect,
  admin,
  rejectOrderRequest
);

export default router;