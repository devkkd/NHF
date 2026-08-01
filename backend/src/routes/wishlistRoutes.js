import express from "express";
import { protect } from "../middlewares/authMiddleware.js";

import {
  getWishlist,
  addToWishlist,
  removeWishlistItem,
} from "../controllers/wishlistController.js";

const router = express.Router();

router.use(protect);

router.get("/", getWishlist);

router.post("/add", addToWishlist);

router.delete("/remove", removeWishlistItem);

export default router;