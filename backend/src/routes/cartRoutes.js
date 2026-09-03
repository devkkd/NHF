import express from "express";

import {
  addToCart,
  getCart,
  updateCart,
  updateCartVariant,
  removeCartItem,
} from "../controllers/cartController.js";

import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

/* =========================================================
   ALL CART ROUTES REQUIRE LOGIN
========================================================= */

router.use(protect);

/* =========================================================
   ADD
========================================================= */

router.post(
  "/add",
  addToCart
);

/* =========================================================
   GET
========================================================= */

router.get(
  "/",
  getCart
);

/* =========================================================
   QUANTITY UPDATE
========================================================= */

router.put(
  "/update",
  updateCart
);

/* =========================================================
   CHANGE COLOUR / SIZE
========================================================= */

router.put(
  "/variant",
  updateCartVariant
);

/* =========================================================
   REMOVE
========================================================= */

router.delete(
  "/remove",
  removeCartItem
);

export default router;