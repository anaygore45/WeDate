import express from 'express';
import {
  updateNotificationPreferences,
  updatePrivacySettings,
  changePassword,
  deleteMyAccount
} from '../controllers/settingsController.js';
import { protect, requireVerified } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, requireVerified);

router.patch('/notifications', updateNotificationPreferences);
router.patch('/privacy', updatePrivacySettings);
router.patch('/password', changePassword);
router.delete('/account', deleteMyAccount);

export default router;
