import express from 'express';
import {
  getDiscoveryQueue,
  swipeProfile,
  getFilterPreferences,
  updateFilterPreferences,
  getLikesStats
} from '../controllers/discoveryController.js';
import { protect, requireVerified, requireCompletedProfile } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, requireVerified, requireCompletedProfile);

router.get('/', getDiscoveryQueue);
router.post('/:userId/swipe', swipeProfile);
router.get('/filters', getFilterPreferences);
router.put('/filters', updateFilterPreferences);
router.get('/likes-stats', getLikesStats);

export default router;
