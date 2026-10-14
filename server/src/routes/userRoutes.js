import express from 'express';
import { block, unblock, getBlockedUsers, report } from '../controllers/userController.js';
import { protect, requireVerified } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, requireVerified);

router.post('/:userId/block', block);
router.delete('/:userId/block', unblock);
router.get('/blocked', getBlockedUsers);
router.post('/:userId/report', report);

export default router;
