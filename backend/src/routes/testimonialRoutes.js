import express from 'express';
import {
  getActiveTestimonials,
  getAllTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  toggleTestimonial,
} from '../controllers/testimonialController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/',              getActiveTestimonials);
router.get('/admin',         protect, admin, getAllTestimonials);
router.post('/admin',        protect, admin, createTestimonial);
router.put('/admin/:id',     protect, admin, updateTestimonial);
router.delete('/admin/:id',  protect, admin, deleteTestimonial);
router.patch('/admin/:id/toggle', protect, admin, toggleTestimonial);

export default router;
