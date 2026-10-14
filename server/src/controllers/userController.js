import {
  blockUser,
  unblockUser,
  getBlockedUsersList,
  reportUser
} from '../services/safetyService.js';

export const block = async (req, res, next) => {
  try {
    const { userId: targetUserId } = req.params;
    await blockUser(req.user._id, targetUserId);

    res.status(200).json({
      success: true,
      message: 'User has been blocked. They can no longer see your profile or contact you.'
    });
  } catch (error) {
    next(error);
  }
};

export const unblock = async (req, res, next) => {
  try {
    const { userId: targetUserId } = req.params;
    await unblockUser(req.user._id, targetUserId);

    res.status(200).json({
      success: true,
      message: 'User unblocked successfully.'
    });
  } catch (error) {
    next(error);
  }
};

export const getBlockedUsers = async (req, res, next) => {
  try {
    const blockedList = await getBlockedUsersList(req.user._id);
    res.status(200).json({
      success: true,
      data: blockedList
    });
  } catch (error) {
    next(error);
  }
};

export const report = async (req, res, next) => {
  try {
    const { userId: targetUserId } = req.params;
    const { reason, details } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'A valid reason is required for safety reports.'
      });
    }

    const reportRecord = await reportUser(req.user._id, targetUserId, {
      reason,
      details
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for keeping our community safe. Your report has been logged and the user has been blocked.',
      data: { id: reportRecord._id, status: reportRecord.status }
    });
  } catch (error) {
    next(error);
  }
};
