import express from 'express';
import {
  getConversations,
  getConversationByMatch,
  getMessages,
  postMessage,
  uploadChatImage
} from '../controllers/chatController.js';
import { protect, requireVerified } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.use(protect, requireVerified);

router.get('/', getConversations);
router.get('/match/:matchId', getConversationByMatch);
router.get('/:chatId/messages', getMessages);
router.post('/:chatId/messages', postMessage);
router.post('/:chatId/media', upload.single('image'), uploadChatImage);

export default router;
