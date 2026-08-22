import express from "express";

import {
  getProducts,
  getProductBySlug,
  getAllProductsAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
  permanentlyDeleteProduct,
} from "../controllers/productController.js";

import {
  protect,
  admin,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| ADMIN PRODUCT ROUTES
|--------------------------------------------------------------------------
*/

/**
 * Get all products for admin
 *
 * Optional query params:
 *
 * ?category=SUBCATEGORY_ID
 * ?search=bedsheet
 * ?active=true
 * ?active=false
 *
 * Products are returned in sortOrder.
 */
router.get(
  "/admin/all",
  protect,
  admin,
  getAllProductsAdmin
);

/**
 * Create product
 *
 * IMPORTANT:
 * category must be a SUBCATEGORY id.
 *
 * Main category product creation is rejected
 * by productController.
 */
router.post(
  "/",
  protect,
  admin,
  createProduct
);

/**
 * Update product
 *
 * Supports:
 * - product details
 * - category/subcategory
 * - sortOrder
 *
 * Changing sortOrder automatically reorders
 * other products inside the same subcategory.
 */
router.patch(
  "/:id",
  protect,
  admin,
  updateProduct
);

/**
 * PERMANENT DELETE PRODUCT
 *
 * This must come BEFORE /:id
 * so "/permanent/:id" is not treated
 * as a normal product id route.
 */
router.delete(
  "/permanent/:id",
  protect,
  admin,
  permanentlyDeleteProduct
);

/**
 * Soft delete / deactivate product
 *
 * Existing behaviour is preserved.
 */
router.delete(
  "/:id",
  protect,
  admin,
  deleteProduct
);

/*
|--------------------------------------------------------------------------
| PUBLIC PRODUCT ROUTES
|--------------------------------------------------------------------------
*/

/**
 * Get products
 *
 * Examples:
 *
 * /products
 *
 * /products?category=SUBCATEGORY_ID
 *
 * /products?search=cotton
 *
 * /products?featured=true
 *
 * /products?newArrivals=true
 *
 * /products?wardrobe=true
 */
router.get(
  "/",
  getProducts
);

/**
 * Get product by slug
 */
router.get(
  "/:slug",
  getProductBySlug
);

export default router;