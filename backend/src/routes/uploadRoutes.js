import express from 'express';
import { presign } from '../controllers/uploadController.js';
import { protect } from '../middlewares/authMiddleware.js';
const router = express.Router();
router.post('/presign', protect, presign);
export default router;
