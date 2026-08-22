import express from 'express';

import {
  getCategories,
  getCategoryBySlug,
  getSubcategories,
  getAllCategoriesAdmin,
  createCategory,
  updateCategory,
  deleteCategory,
  getFooterCategories,
  permanentlyDeleteCategory,

} from '../controllers/categoryController.js';

import {
  protect,
  admin,
} from '../middlewares/authMiddleware.js';

const router = express.Router();

/*
|--------------------------------------------------------------------------
| ADMIN
|--------------------------------------------------------------------------
*/

/**
 * Get all categories/subcategories for admin
 *
 * Optional:
 * ?search=bedsheet
 * ?parent=null
 * ?parent=CATEGORY_ID
 * ?home=true
 * ?wardrobe=true
 * ?active=true
 */
router.get(
  '/admin/all',
  protect,
  admin,
  getAllCategoriesAdmin
);

/**
 * Create category OR subcategory
 */
router.post(
  '/',
  protect,
  admin,
  createCategory
);

/**
 * Update category OR subcategory
 *
 * Supports:
 * - name
 * - description
 * - image
 * - parent
 * - showInHome
 * - showInWardrobe
 * - showInFooter
 * - isActive
 * - sortOrder
 */
router.patch(
  '/:id',
  protect,
  admin,
  updateCategory
);

/**
 * Soft delete/deactivate category
 */
router.delete(
  '/:id',
  protect,
  admin,
  deleteCategory
);

// ======================================================
// PERMANENT DELETE CATEGORY / SUBCATEGORY
// ======================================================

router.delete(
  "/permanent/:id",
  protect,
  admin,
  permanentlyDeleteCategory
);
/*
|--------------------------------------------------------------------------
| PUBLIC
|--------------------------------------------------------------------------
*/

/**
 * Footer category tree
 *
 * Main Category
 *   └── Subcategory
 */
router.get(
  '/footer-tree',
  getFooterCategories
);

/**
 * Get direct subcategories of a category
 *
 * GET /api/v1/categories/:id/subcategories
 */
router.get(
  '/:id/subcategories',
  getSubcategories
);

/**
 * Get categories
 *
 * Default:
 *   GET /categories
 *
 * Home:
 *   GET /categories?home=true
 *
 * Wardrobe:
 *   GET /categories?wardrobe=true
 *
 * Tree:
 *   GET /categories?tree=true
 *
 * Home + tree:
 *   GET /categories?home=true&tree=true
 */
router.get(
  '/',
  getCategories
);

/**
 * Get category by slug
 *
 * Example:
 * /categories/bedsheets
 */
router.get(
  '/:slug',
  getCategoryBySlug
);

export default router;