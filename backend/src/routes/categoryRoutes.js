import express from "express";
import {
  getCategories,
  getCategoryBySlug,
  getAllCategoriesAdmin,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ── Public ─────────────────────────────────────────────────
router.get("/",       getCategories);       // ?wardrobe=true for wardrobe filter
router.get("/:slug",  getCategoryBySlug);

// ── Admin (protected) ───────────────────────────────────────
router.get(   "/admin/all", protect, admin, getAllCategoriesAdmin);
router.post(  "/",          protect, admin, createCategory);
router.patch( "/:id",       protect, admin, updateCategory);
router.delete("/:id",       protect, admin, deleteCategory);

export default router;
