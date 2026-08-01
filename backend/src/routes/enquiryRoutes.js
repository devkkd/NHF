import express from "express";
import { protect, admin } from "../middlewares/authMiddleware.js";

import {
  createEnquiry,
  getAllEnquiries,
  getEnquiryById,
  updateEnquiryStatus,
  deleteEnquiry,
} from "../controllers/enquiryController.js";

const router = express.Router();

/* ==========================================
   PUBLIC
========================================== */

// Bulk Enquiry
router.post("/", createEnquiry);

/* ==========================================
   ADMIN
========================================== */

// All Enquiries
router.get("/admin/all", protect, admin, getAllEnquiries);

// Single Enquiry
router.get("/admin/:id", protect, admin, getEnquiryById);

// Update Status
router.patch("/admin/:id/status", protect, admin, updateEnquiryStatus);

// Delete
router.delete("/admin/:id", protect, admin, deleteEnquiry);

export default router;