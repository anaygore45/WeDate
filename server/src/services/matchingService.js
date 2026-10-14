import Swipe from '../models/Swipe.js';
import Match from '../models/Match.js';
import Chat from '../models/Chat.js';
import Notification from '../models/Notification.js';
import Profile from '../models/Profile.js';
import Block from '../models/Block.js';
import User from '../models/User.js';

export const recordSwipe = async (actorId, targetId, action) => {
  if (actorId.toString() === targetId.toString()) {
    throw new Error('You cannot swipe on your own profile.');
  }

  if (!['like', 'pass'].includes(action)) {
    throw new Error('Action must be either "like" or "pass".');
  }

  // Check if either user has blocked the other
  const isBlocked = await Block.findOne({
    $or: [
      { blocker: actorId, blocked: targetId },
      { blocker: targetId, blocked: actorId }
    ]
  });
  if (isBlocked) {
    throw new Error('Action cannot be performed on this profile.');
  }

  // Ensure target profile is completed and active
  const targetProfile = await Profile.findOne({ user: targetId });
  if (!targetProfile || !targetProfile.isVisible || !targetProfile.isCompleted) {
    throw new Error('This profile is not currently available for interaction.');
  }

  // Persist swipe (upsert to prevent duplicate errors)
  const swipe = await Swipe.findOneAndUpdate(
    { actor: actorId, target: targetId },
    { action },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // If action is pass, no match can occur
  if (action === 'pass') {
    return {
      action: 'pass',
      isMatch: false
    };
  }

  // If action is like, check for reciprocal like
  const reciprocalSwipe = await Swipe.findOne({
    actor: targetId,
    target: actorId,
    action: 'like'
  });

  if (reciprocalSwipe) {
    // Both users liked each other! Create or reactivate match
    const ids = [actorId.toString(), targetId.toString()].sort();
    const pairKey = `${ids[0]}_${ids[1]}`;

    let match = await Match.findOne({ pairKey });
    let isNewMatch = false;

    if (!match) {
      match = new Match({
        users: [actorId, targetId],
        pairKey,
        isActive: true
      });
      await match.save();
      isNewMatch = true;
    } else if (!match.isActive) {
      match.isActive = true;
      match.deactivatedBy = null;
      match.deactivatedAt = null;
      match.lastActivityAt = new Date();
      await match.save();
    }

    // Ensure associated Chat exists
    let chat = await Chat.findOne({ match: match._id });
    if (!chat) {
      chat = new Chat({
        match: match._id,
        participants: [actorId, targetId]
      });
      await chat.save();
    }

    // Send notifications to both participants
    const actorProfile = await Profile.findOne({ user: actorId });

    await Notification.create([
      {
        recipient: targetId,
        sender: actorId,
        type: 'match',
        title: 'New Mutual Match!',
        message: `You and ${actorProfile ? actorProfile.name : 'someone'} liked each other! Start the conversation.`,
        data: { matchId: match._id, chatId: chat._id }
      },
      {
        recipient: actorId,
        sender: targetId,
        type: 'match',
        title: 'New Mutual Match!',
        message: `You and ${targetProfile.name} liked each other! Start the conversation.`,
        data: { matchId: match._id, chatId: chat._id }
      }
    ]);

    return {
      action: 'like',
      isMatch: true,
      matchId: match._id,
      chatId: chat._id,
      matchedProfile: targetProfile
    };
  }

  // One-way like recorded
  return {
    action: 'like',
    isMatch: false
  };
};

export const getUserMatches = async (userId) => {
  const matches = await Match.find({
    users: userId,
    isActive: true
  }).sort({ lastActivityAt: -1 });

  const populatedMatches = await Promise.all(
    matches.map(async (m) => {
      const otherUserId = m.users.find((u) => u.toString() !== userId.toString());
      const otherProfile = await Profile.findOne({ user: otherUserId }).select(
        'name age department academicYear bio photos interests relationshipGoals'
      );
      const chat = await Chat.findOne({ match: m._id });

      return {
        _id: m._id,
        createdAt: m.createdAt,
        lastActivityAt: m.lastActivityAt,
        otherUser: otherUserId,
        profile: otherProfile,
        chat: chat ? {
          _id: chat._id,
          lastMessage: chat.lastMessage,
          unreadCount: chat.unreadCounts?.get(userId.toString()) || 0
        } : null
      };
    })
  );

  return populatedMatches.filter((m) => m.profile !== null);
};

export const removeMatch = async (matchId, userId) => {
  const match = await Match.findOne({
    _id: matchId,
    users: userId
  });

  if (!match) {
    throw new Error('Match not found or already removed.');
  }

  match.isActive = false;
  match.deactivatedBy = userId;
  match.deactivatedAt = new Date();
  await match.save();

  return true;
};

export const getReceivedLikesCount = async (userId) => {
  // Profiles that liked this user
  const incomingLikes = await Swipe.find({
    target: userId,
    action: 'like'
  });

  // Filter out those who are already mutual matches or already swiped back
  const mySwipes = await Swipe.find({ actor: userId }).select('target');
  const swipedTargetIds = new Set(mySwipes.map((s) => s.target.toString()));

  const pendingLikes = incomingLikes.filter(
    (l) => !swipedTargetIds.has(l.actor.toString())
  );

  return {
    totalPendingLikes: pendingLikes.length
  };
};
