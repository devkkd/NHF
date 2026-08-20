import express from 'express';
import {
  getActiveShowcase,
  getAllShowcases,
  createShowcase,
  updateShowcase,
  deleteShowcase,
  toggleShowcase,
} from '../controllers/showcaseBannerController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public
router.get('/', getActiveShowcase);

// Admin
router.get('/admin', protect, admin, getAllShowcases);
router.post('/admin', protect, admin, createShowcase);
router.put('/admin/:id', protect, admin, updateShowcase);
router.delete('/admin/:id', protect, admin, deleteShowcase);
router.patch('/admin/:id/toggle', protect, admin, toggleShowcase);

export default router;
