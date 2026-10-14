import express from 'express';
import { getSmartRecommendations } from '../controllers/recommendationController.js';
import { protect, requireVerified, requireCompletedProfile } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, requireVerified, requireCompletedProfile);

router.get('/', getSmartRecommendations);

export default router;
