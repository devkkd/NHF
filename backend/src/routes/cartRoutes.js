import express from "express";
import {
  addToCart,
  getCart,
  updateCart,
  removeCartItem,
} from "../controllers/cartController.js";
import { protect } from "../middlewares/authMiddleware.js";


const router = express.Router();

router.use(protect);

router.post("/add", addToCart);
router.get("/", getCart);
router.put("/update", updateCart);
router.delete("/remove", removeCartItem);

export default router;