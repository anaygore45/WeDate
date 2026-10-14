import User from '../models/User.js';
import Profile from '../models/Profile.js';
import { deleteAccount } from '../services/safetyService.js';

export const updateNotificationPreferences = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.notificationPreferences = {
      ...user.notificationPreferences,
      ...req.body
    };
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Notification preferences updated.',
      data: user.notificationPreferences
    });
  } catch (error) {
    next(error);
  }
};

export const updatePrivacySettings = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const profile = await Profile.findOne({ user: req.user._id });

    if (req.body.profileVisibility !== undefined) {
      user.privacySettings.profileVisibility = req.body.profileVisibility;
      if (profile) {
        profile.isVisible = req.body.profileVisibility;
        await profile.save();
      }
    }

    if (req.body.personalizedRecommendations !== undefined) {
      user.privacySettings.personalizedRecommendations = req.body.personalizedRecommendations;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Privacy settings updated successfully.',
      data: user.privacySettings
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Both current password and new password are required.'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long.'
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password provided is incorrect.'
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMyAccount = async (req, res, next) => {
  try {
    const { confirmationText } = req.body;
    if (confirmationText !== 'DELETE') {
      return res.status(400).json({
        success: false,
        message: 'Please type "DELETE" to confirm permanent account deletion.'
      });
    }

    await deleteAccount(req.user._id);

    res.clearCookie('token');
    res.status(200).json({
      success: true,
      message: 'Your WeDate account and associated data have been permanently removed.'
    });
  } catch (error) {
    next(error);
  }
};
