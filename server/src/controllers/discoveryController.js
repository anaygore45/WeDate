import { getEligibleDiscoveryQueue } from '../services/discoveryService.js';
import { recordSwipe, getReceivedLikesCount } from '../services/matchingService.js';
import Profile from '../models/Profile.js';

export const getDiscoveryQueue = async (req, res, next) => {
  try {
    const { minAge, maxAge, gender, department, academicYear, interests } = req.query;

    const customFilters = {};
    if (minAge) customFilters.minAge = minAge;
    if (maxAge) customFilters.maxAge = maxAge;
    if (gender) customFilters.gender = gender;
    if (department) customFilters.department = department;
    if (academicYear) customFilters.academicYear = academicYear;
    if (interests) {
      customFilters.interests = Array.isArray(interests) ? interests : [interests];
    }

    const result = await getEligibleDiscoveryQueue(req.user._id, customFilters);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const swipeProfile = async (req, res, next) => {
  try {
    const { userId: targetUserId } = req.params;
    const { action } = req.body;

    if (!action || !['like', 'pass'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Swipe action must be either "like" or "pass".'
      });
    }

    const result = await recordSwipe(req.user._id, targetUserId, action);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getFilterPreferences = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id }).select('filterPreferences');
    res.status(200).json({
      success: true,
      data: profile?.filterPreferences || {}
    });
  } catch (error) {
    next(error);
  }
};

export const updateFilterPreferences = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }

    profile.filterPreferences = {
      ...profile.filterPreferences,
      ...req.body
    };
    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Filter preferences saved successfully.',
      data: profile.filterPreferences
    });
  } catch (error) {
    next(error);
  }
};

export const getLikesStats = async (req, res, next) => {
  try {
    const stats = await getReceivedLikesCount(req.user._id);
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};
