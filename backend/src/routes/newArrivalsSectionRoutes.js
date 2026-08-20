import express from 'express';
import {
  getNewArrivalsSection,
  getNewArrivalsSectionAdmin,
  upsertNewArrivalsSection,
} from '../controllers/newArrivalsSectionController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/',        getNewArrivalsSection);
router.get('/admin',   protect, admin, getNewArrivalsSectionAdmin);
router.post('/admin',  protect, admin, upsertNewArrivalsSection);

export default router;
