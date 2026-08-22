import express from "express";

import {
  bulkUploadProducts,
  downloadBulkProductTemplate,
} from "../controllers/bulkProductController.js";

import {
  protect,
  admin,
} from "../middlewares/authMiddleware.js";

import {
  bulkUploadFiles,
} from "../middlewares/bulkUploadMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| BULK PRODUCT TEMPLATE
|--------------------------------------------------------------------------
|
| GET
| /api/v1/products/bulk-upload/template
|
| Authentication:
| - protect
| - admin
|
| The generated Excel template contains:
|
| - category
|   -> MUST be a subcategory
|
| - sortOrder
|   -> product serial number inside that subcategory
|
|--------------------------------------------------------------------------
*/

router.get(
  "/bulk-upload/template",
  protect,
  admin,
  downloadBulkProductTemplate
);

/*
|--------------------------------------------------------------------------
| BULK PRODUCT UPLOAD
|--------------------------------------------------------------------------
|
| POST
| /api/v1/products/bulk-upload
|
| Authentication:
| - protect
| - admin
|
| multipart/form-data:
|
| excel
| images[]
|
| Excel category column:
|   Subcategory name
|   OR subcategory slug
|   OR subcategory MongoDB ID
|
| Main category is NOT accepted.
|
| sortOrder:
|   - blank for new product -> added at bottom
|   - value for new product -> inserted at that position
|   - blank for existing product -> current position preserved
|   - value for existing product -> product moved to that position
|
|--------------------------------------------------------------------------
*/

router.post(
  "/bulk-upload",
  protect,
  admin,
  bulkUploadFiles,
  bulkUploadProducts
);

export default router;