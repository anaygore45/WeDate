import express from 'express';
import {
  getAiStatus,
  explainMatch,
  getIcebreakers,
  enhanceBioSuggestions,
  evaluateSynergy,
  getReplySuggestions
} from '../controllers/aiController.js';
import { protect, requireVerified, requireCompletedProfile } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public / Authenticated health status check
router.get('/status', getAiStatus);

// All generative features require authentication, email verification, and profile completion
router.use(protect);
router.use(requireVerified);
router.use(requireCompletedProfile);
router.use(aiLimiter);

// Grounded match explanation for a discovery candidate
router.post('/explain', explainMatch);

// Personalized conversation starters for mutual matches
router.post('/icebreakers', getIcebreakers);

// Voice-preserving bio enhancement suggestions
router.post('/enhance-bio', enhanceBioSuggestions);

// Multi-candidate discovery synergy evaluation
router.post('/synergy', evaluateSynergy);

// AI Chat Helper: Contextual "what to reply" suggestions
router.post('/suggest-replies', getReplySuggestions);

export default router;
