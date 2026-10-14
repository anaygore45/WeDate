import express from 'express';
import { getMatches, getMatchById, deleteMatch } from '../controllers/matchController.js';
import { protect, requireVerified } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, requireVerified);

router.get('/', getMatches);
router.get('/:matchId', getMatchById);
router.delete('/:matchId', deleteMatch);

export default router;
