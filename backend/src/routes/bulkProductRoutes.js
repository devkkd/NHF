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
=========================================================
DOWNLOAD BULK PRODUCT TEMPLATE

GET
/api/v1/products/bulk-upload/template

Auth:
protect + admin
=========================================================
*/

router.get(
  "/bulk-upload/template",
  protect,
  admin,
  downloadBulkProductTemplate
);

/*
=========================================================
BULK PRODUCT UPLOAD

POST
/api/v1/products/bulk-upload

Auth:
protect + admin

FormData:

excel
images[]
=========================================================
*/

router.post(
  "/bulk-upload",
  protect,
  admin,
  bulkUploadFiles,
  bulkUploadProducts
);

export default router;