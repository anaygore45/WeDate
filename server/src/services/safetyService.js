import Block from '../models/Block.js';
import Report from '../models/Report.js';
import Match from '../models/Match.js';
import User from '../models/User.js';
import Profile from '../models/Profile.js';
import Swipe from '../models/Swipe.js';
import Notification from '../models/Notification.js';
import { deleteMedia } from './mediaService.js';

export const blockUser = async (blockerId, blockedId) => {
  if (blockerId.toString() === blockedId.toString()) {
    throw new Error('You cannot block your own account.');
  }

  // Create block record
  await Block.findOneAndUpdate(
    { blocker: blockerId, blocked: blockedId },
    { blocker: blockerId, blocked: blockedId },
    { upsert: true, new: true }
  );

  // Deactivate any active match between these two users
  const ids = [blockerId.toString(), blockedId.toString()].sort();
  const pairKey = `${ids[0]}_${ids[1]}`;

  await Match.findOneAndUpdate(
    { pairKey },
    {
      isActive: false,
      deactivatedBy: blockerId,
      deactivatedAt: new Date()
    }
  );

  return true;
};

export const unblockUser = async (blockerId, blockedId) => {
  const result = await Block.findOneAndDelete({
    blocker: blockerId,
    blocked: blockedId
  });
  return Boolean(result);
};

export const getBlockedUsersList = async (blockerId) => {
  const blocks = await Block.find({ blocker: blockerId }).sort({ createdAt: -1 });

  const populated = await Promise.all(
    blocks.map(async (b) => {
      const profile = await Profile.findOne({ user: b.blocked }).select('name photos age');
      return {
        _id: b._id,
        blockedUserId: b.blocked,
        name: profile ? profile.name : 'Unknown User',
        primaryPhoto: profile?.photos?.find((p) => p.isPrimary)?.url || profile?.photos?.[0]?.url || '',
        createdAt: b.createdAt
      };
    })
  );

  return populated;
};

export const reportUser = async (reporterId, reportedUserId, { reason, details }) => {
  if (reporterId.toString() === reportedUserId.toString()) {
    throw new Error('You cannot report yourself.');
  }

  const report = new Report({
    reporter: reporterId,
    reportedUser: reportedUserId,
    reason,
    details: details ? details.trim() : '',
    status: 'pending'
  });
  await report.save();

  // Safety safeguard: immediately block the reported user for the reporter
  await blockUser(reporterId, reportedUserId);

  return report;
};

export const deleteAccount = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found.');

  // Clean up user photos
  const profile = await Profile.findOne({ user: userId });
  if (profile && profile.photos && profile.photos.length > 0) {
    for (const photo of profile.photos) {
      if (photo.publicId) {
        await deleteMedia(photo.publicId, photo.url);
      }
    }
  }

  // Deactivate all user matches
  await Match.updateMany(
    { users: userId },
    {
      isActive: false,
      deactivatedBy: userId,
      deactivatedAt: new Date()
    }
  );

  // Delete profile, notifications, swipes
  await Profile.findOneAndDelete({ user: userId });
  await Notification.deleteMany({ recipient: userId });
  await Swipe.deleteMany({ $or: [{ actor: userId }, { target: userId }] });
  await Block.deleteMany({ $or: [{ blocker: userId }, { blocked: userId }] });

  // Soft-delete or remove user record
  user.status = 'deleted';
  user.email = `deleted_${userId}_${Date.now()}@deleted.invalid`;
  user.password = 'DELETED_ACCOUNT';
  await user.save();

  return true;
};
