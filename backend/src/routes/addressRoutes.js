import express from "express";

import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getDefaultAddress,
} from "../controllers/addressController.js";
import { validateAddress } from "../middlewares/addressValidation.js";

import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

/*
    User Address Routes
*/

// Get all addresses
router.get("/", protect, getAddresses);
router.get(
  "/default",
  protect,
  getDefaultAddress
);

// Add new address
router.post(
  "/",
  protect,
  validateAddress,
  addAddress
);

// Update address
router.put(
  "/:id",
  protect,
  validateAddress,
  updateAddress
);


// Delete address
router.delete("/:id", protect, deleteAddress);

// Set default address
router.patch("/:id/default", protect, setDefaultAddress);

export default router;