import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import Match from '../models/Match.js';
import Block from '../models/Block.js';
import Profile from '../models/Profile.js';

export const getChatByMatchId = async (matchId, userId) => {
  const match = await Match.findOne({
    _id: matchId,
    users: userId
  });

  if (!match) {
    throw new Error('Authorized match not found.');
  }

  if (!match.isActive) {
    throw new Error('This match has been removed and chat is no longer active.');
  }

  const otherUserId = match.users.find((u) => u.toString() !== userId.toString());

  // Check blocks
  const isBlocked = await Block.findOne({
    $or: [
      { blocker: userId, blocked: otherUserId },
      { blocker: otherUserId, blocked: userId }
    ]
  });
  if (isBlocked) {
    throw new Error('Communication is unavailable due to account safety settings.');
  }

  let chat = await Chat.findOne({ match: match._id });
  if (!chat) {
    chat = new Chat({
      match: match._id,
      participants: match.users
    });
    await chat.save();
  }

  const otherProfile = await Profile.findOne({ user: otherUserId }).select(
    'name age photos department academicYear'
  );

  return {
    chat,
    match,
    otherUser: otherUserId,
    otherProfile
  };
};

export const getMessagesForChat = async (chatId, userId, { page = 1, limit = 50 } = {}) => {
  const chat = await Chat.findOne({
    _id: chatId,
    participants: userId
  });

  if (!chat) {
    throw new Error('Chat conversation not found or access denied.');
  }

  const skip = (Math.max(1, page) - 1) * limit;

  const messages = await Message.find({ chat: chatId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Mark unread messages sent to this user as read
  await Message.updateMany(
    { chat: chatId, recipient: userId, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );

  // Clear unread count for this user
  if (chat.unreadCounts) {
    chat.unreadCounts.set(userId.toString(), 0);
    await chat.save();
  }

  const total = await Message.countDocuments({ chat: chatId });

  return {
    messages: messages.reverse(), // chronologically ordered for client view
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit)
  };
};

export const createMessage = async ({ chatId, senderId, content, messageType = 'text', mediaUrl = '' }) => {
  const chat = await Chat.findOne({
    _id: chatId,
    participants: senderId
  });

  if (!chat) {
    throw new Error('Chat not found or sender is not an authorized participant.');
  }

  // Verify active match
  const match = await Match.findOne({ _id: chat.match });
  if (!match || !match.isActive) {
    throw new Error('Cannot send message. This match is inactive or has been removed.');
  }

  const recipientId = chat.participants.find((p) => p.toString() !== senderId.toString());

  // Verify no blocks
  const isBlocked = await Block.findOne({
    $or: [
      { blocker: senderId, blocked: recipientId },
      { blocker: recipientId, blocked: senderId }
    ]
  });
  if (isBlocked) {
    throw new Error('Cannot send message due to safety block.');
  }

  const message = new Message({
    chat: chat._id,
    match: chat.match,
    sender: senderId,
    recipient: recipientId,
    content: content ? content.trim() : '',
    messageType,
    mediaUrl: mediaUrl || '',
    isRead: false
  });

  await message.save();

  // Update chat last message
  chat.lastMessage = {
    text: messageType === 'image' ? 'Sent an image' : message.content,
    sender: senderId,
    createdAt: message.createdAt,
    mediaUrl: message.mediaUrl
  };

  // Increment unread count for recipient
  const currentUnread = chat.unreadCounts?.get(recipientId.toString()) || 0;
  chat.unreadCounts.set(recipientId.toString(), currentUnread + 1);
  await chat.save();

  // Update match last activity
  match.lastActivityAt = new Date();
  await match.save();

  return message;
};

export const getUserConversations = async (userId) => {
  // Query all active matches for this user
  const matches = await Match.find({
    users: userId,
    isActive: true
  }).sort({ lastActivityAt: -1, updatedAt: -1 });

  const populated = await Promise.all(
    matches.map(async (m) => {
      const otherUserId = m.users.find((u) => u.toString() !== userId.toString());
      if (!otherUserId) return null;

      // Verify no active blocks
      const isBlocked = await Block.findOne({
        $or: [
          { blocker: userId, blocked: otherUserId },
          { blocker: otherUserId, blocked: userId }
        ]
      });
      if (isBlocked) return null;

      // Find or create associated Chat document
      let chat = await Chat.findOne({ match: m._id });
      if (!chat) {
        chat = new Chat({
          match: m._id,
          participants: m.users
        });
        await chat.save();
      }

      const otherProfile = await Profile.findOne({ user: otherUserId }).select(
        'name age photos department academicYear interests'
      );
      if (!otherProfile) return null;

      return {
        _id: chat._id,
        matchId: m._id,
        otherUser: otherUserId,
        profile: otherProfile,
        lastMessage: chat.lastMessage,
        unreadCount: chat.unreadCounts?.get(userId.toString()) || 0,
        updatedAt: chat.updatedAt || m.lastActivityAt || m.createdAt
      };
    })
  );

  return populated.filter(Boolean);
};
