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
 * ?page=1
 * ?limit=20
 * ?category=SUBCATEGORY_ID
 * ?search=bedsheet
 * ?active=true
 * ?active=false
 *
 * Response includes complete product data:
 *
 * - images
 * - colors
 * - sizes
 * - actualPrice
 * - sellingPrice
 * - shippingCost
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
 *
 * Product supports:
 *
 * - name
 * - sku
 * - category
 * - mainImage
 * - galleryImages
 * - colors
 *
 * Pricing:
 * - actualPrice
 * - sellingPrice
 * - shippingCost
 *
 * Size-wise pricing:
 *
 * sizes: [
 *   {
 *     name: "Queen",
 *     actualPrice: 3000,
 *     sellingPrice: 2400
 *   }
 * ]
 *
 * Existing colour system remains unchanged.
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
 *
 * - product details
 * - images
 * - colors
 * - category/subcategory
 * - sortOrder
 *
 * Pricing:
 *
 * - actualPrice
 * - sellingPrice
 * - shippingCost
 *
 * Size pricing:
 *
 * - sizes
 *
 * Example:
 *
 * sizes: [
 *   {
 *     name: "S",
 *     actualPrice: 1999,
 *     sellingPrice: 1499
 *   },
 *   {
 *     name: "M",
 *     actualPrice: 2099,
 *     sellingPrice: 1599
 *   }
 * ]
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
 * IMPORTANT:
 * This must come BEFORE /:id
 *
 * so:
 *
 * /permanent/:id
 *
 * is not treated as a normal product id.
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
 *
 * The product remains in the database
 * but isActive becomes false.
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
 * GET /products
 *
 * GET /products?category=SUBCATEGORY_ID
 *
 * GET /products?search=cotton
 *
 * GET /products?featured=true
 *
 * GET /products?newArrivals=true
 *
 * GET /products?wardrobe=true
 *
 * GET /products?page=1&limit=20
 *
 * Public response includes:
 *
 * - images
 * - colors
 * - sizes
 * - actualPrice
 * - sellingPrice
 * - shippingCost
 */
router.get(
  "/",
  getProducts
);

/**
 * Get product by slug
 *
 * Example:
 *
 * GET /products/cotton-queen-bedsheet
 *
 * Returns complete product information,
 * including size pricing and shipping cost.
 */
router.get(
  "/:slug",
  getProductBySlug
);

export default router;