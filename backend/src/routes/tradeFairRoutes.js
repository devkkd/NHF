import express from "express";

import {
  getTradeFairs,
  getAdminTradeFairs,
  createTradeFair,
  updateTradeFair,
  deleteTradeFair,
  deleteTradeFairImage,
} from "../controllers/tradeFairController.js";

import {
  protect,
  admin,
} from "../middlewares/authMiddleware.js";

import tradeFairUpload from "../middlewares/tradeFairUpload.js";

const router =
  express.Router();


// ======================================================
// PUBLIC
// ======================================================

router.get(
  "/",
  getTradeFairs
);


// ======================================================
// ADMIN LIST
// ======================================================

router.get(
  "/admin",
  protect,
  admin,
  getAdminTradeFairs
);


// ======================================================
// CREATE
// ======================================================

router.post(
  "/admin",
  protect,
  admin,
  tradeFairUpload.array(
    "images",
    8
  ),
  createTradeFair
);


// ======================================================
// UPDATE
// ======================================================

router.put(
  "/admin/:id",
  protect,
  admin,
  tradeFairUpload.array(
    "images",
    8
  ),
  updateTradeFair
);


// ======================================================
// DELETE FAIR
// ======================================================

router.delete(
  "/admin/:id",
  protect,
  admin,
  deleteTradeFair
);


// ======================================================
// DELETE IMAGE
// ======================================================

router.delete(
  "/admin/:id/images/:imageId",
  protect,
  admin,
  deleteTradeFairImage
);


export default router;