import { verifyToken } from '../config/jwt.js';
import Chat from '../models/Chat.js';
import Match from '../models/Match.js';
import Block from '../models/Block.js';
import { createMessage, getMessagesForChat } from '../services/chatService.js';

// Global online users map: userId -> Set of socketIds
const onlineUsers = new Map();

export const setupSocketIO = (io) => {
  // Authentication middleware for Socket.IO
  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(' ')[1] ||
        socket.handshake.query?.token;

      if (!token) {
        return next(new Error('Authentication required for real-time socket.'));
      }

      const decoded = verifyToken(token);
      if (!decoded || !decoded.userId) {
        return next(new Error('Invalid or expired socket token.'));
      }

      socket.userId = decoded.userId.toString();
      next();
    } catch (err) {
      next(new Error('Socket authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;

    // Track online presence
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // Join personal user room for direct match/notification events
    socket.join(`user:${userId}`);

    // Broadcast online status to mutual contacts
    io.emit('user_presence', { userId, status: 'online' });

    // Client requests check if target user is online
    socket.on('check_presence', ({ targetUserId }, callback) => {
      const isOnline = onlineUsers.has(targetUserId) && onlineUsers.get(targetUserId).size > 0;
      if (typeof callback === 'function') {
        callback({ userId: targetUserId, status: isOnline ? 'online' : 'offline' });
      }
    });

    // Join authorized chat room
    socket.on('join_chat', async ({ chatId }, callback) => {
      try {
        const chat = await Chat.findOne({
          _id: chatId,
          participants: userId
        });

        if (!chat) {
          if (typeof callback === 'function') {
            return callback({ success: false, message: 'Unauthorized chat room request.' });
          }
          return;
        }

        const match = await Match.findOne({ _id: chat.match });
        if (!match || !match.isActive) {
          if (typeof callback === 'function') {
            return callback({ success: false, message: 'Cannot join. Match is inactive.' });
          }
          return;
        }

        const roomName = `chat:${chatId}`;
        socket.join(roomName);

        if (typeof callback === 'function') {
          callback({ success: true, room: roomName });
        }
      } catch (err) {
        console.error('[Socket Join Error]', err.message);
        if (typeof callback === 'function') {
          callback({ success: false, message: 'Failed to join conversation.' });
        }
      }
    });

    // Send real-time message
    socket.on('send_message', async (data, callback) => {
      try {
        const { chatId, content, messageType, mediaUrl } = data;

        const message = await createMessage({
          chatId,
          senderId: userId,
          content,
          messageType: messageType || 'text',
          mediaUrl: mediaUrl || ''
        });

        // Broadcast to chat room
        const roomName = `chat:${chatId}`;
        io.to(roomName).emit('new_message', {
          chatId,
          message
        });

        // Notify recipient in their personal room
        const recipientId = message.recipient.toString();
        io.to(`user:${recipientId}`).emit('chat_notification', {
          chatId,
          message,
          title: 'New message',
          snippet: messageType === 'image' ? 'Sent an image' : message.content
        });

        if (typeof callback === 'function') {
          callback({ success: true, message });
        }
      } catch (err) {
        console.error('[Socket Message Error]', err.message);
        if (typeof callback === 'function') {
          callback({ success: false, message: err.message });
        }
      }
    });

    // Typing start
    socket.on('typing_start', ({ chatId }) => {
      socket.to(`chat:${chatId}`).emit('user_typing', {
        chatId,
        userId,
        isTyping: true
      });
    });

    // Typing stop
    socket.on('typing_stop', ({ chatId }) => {
      socket.to(`chat:${chatId}`).emit('user_typing', {
        chatId,
        userId,
        isTyping: false
      });
    });

    // Read receipt
    socket.on('mark_read', async ({ chatId }) => {
      try {
        await getMessagesForChat(chatId, userId);
        socket.to(`chat:${chatId}`).emit('messages_read', {
          chatId,
          readBy: userId,
          readAt: new Date()
        });
      } catch (err) {
        console.warn('[Socket Read Error]', err.message);
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      if (onlineUsers.has(userId)) {
        const userSockets = onlineUsers.get(userId);
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          io.emit('user_presence', { userId, status: 'offline' });
        }
      }
    });
  });
};
