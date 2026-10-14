import {
  getUserConversations,
  getChatByMatchId,
  getMessagesForChat,
  createMessage
} from '../services/chatService.js';
import { uploadMedia } from '../services/mediaService.js';

export const getConversations = async (req, res, next) => {
  try {
    const conversations = await getUserConversations(req.user._id);
    res.status(200).json({
      success: true,
      data: conversations
    });
  } catch (error) {
    next(error);
  }
};

export const getConversationByMatch = async (req, res, next) => {
  try {
    const { matchId } = req.params;
    const conversationData = await getChatByMatchId(matchId, req.user._id);
    const messagesData = await getMessagesForChat(conversationData.chat._id, req.user._id);

    res.status(200).json({
      success: true,
      data: {
        ...conversationData,
        ...messagesData
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const { page, limit } = req.query;

    const result = await getMessagesForChat(chatId, req.user._id, {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 50
    });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const postMessage = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const { content, messageType, mediaUrl } = req.body;

    const message = await createMessage({
      chatId,
      senderId: req.user._id,
      content,
      messageType: messageType || 'text',
      mediaUrl: mediaUrl || ''
    });

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    next(error);
  }
};

export const uploadChatImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded.' });
    }

    const uploadResult = await uploadMedia(
      req.file.buffer,
      req.file.originalname,
      'wedate/chat'
    );

    res.status(201).json({
      success: true,
      data: {
        url: uploadResult.url,
        publicId: uploadResult.publicId
      }
    });
  } catch (error) {
    next(error);
  }
};
