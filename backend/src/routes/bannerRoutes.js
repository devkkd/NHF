import express from 'express';
import {
  getActiveBanners,
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBanner,
  reorderBanners,
} from '../controllers/bannerController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public
router.get('/', getActiveBanners);

// Admin
router.get('/admin', protect, admin, getAllBanners);
router.post('/admin', protect, admin, createBanner);
router.patch('/admin/reorder', protect, admin, reorderBanners);
router.put('/admin/:id', protect, admin, updateBanner);
router.delete('/admin/:id', protect, admin, deleteBanner);
router.patch('/admin/:id/toggle', protect, admin, toggleBanner);

export default router;
