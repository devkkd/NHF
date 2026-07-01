import express from "express";
import { presign } from "../controllers/uploadController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Admin only — generate presigned upload URL
router.post("/presign", protect, admin, presign);

export default router;
