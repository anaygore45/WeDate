import Profile from '../models/Profile.js';
import User from '../models/User.js';
import Swipe from '../models/Swipe.js';
import Block from '../models/Block.js';
import { rankEligibleProfiles } from './recommendationService.js';

export const getEligibleDiscoveryQueue = async (userId, customFilters = {}) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found.');

  const userProfile = await Profile.findOne({ user: userId });
  if (!userProfile) throw new Error('User profile not found.');

  // 1. Gather all excluded User IDs:
  // - Current user
  const excludedUserIds = new Set([userId.toString()]);

  // - Previously swiped profiles (both like and pass)
  const previousSwipes = await Swipe.find({ actor: userId }).select('target');
  for (const s of previousSwipes) {
    excludedUserIds.add(s.target.toString());
  }

  // - Blocked users in either direction
  const blocks = await Block.find({
    $or: [{ blocker: userId }, { blocked: userId }]
  });
  for (const b of blocks) {
    excludedUserIds.add(b.blocker.toString());
    excludedUserIds.add(b.blocked.toString());
  }

  // 2. Base eligibility MongoDB query
  const query = {
    user: { $nin: Array.from(excludedUserIds) },
    isCompleted: true,
    isVisible: true
  };

  // 3. Apply active filters (merging customFilters with saved filterPreferences)
  const filters = {
    minAge: customFilters.minAge !== undefined ? Number(customFilters.minAge) : userProfile.filterPreferences?.minAge || 18,
    maxAge: customFilters.maxAge !== undefined ? Number(customFilters.maxAge) : userProfile.filterPreferences?.maxAge || 30,
    gender: customFilters.gender || (userProfile.filterPreferences?.genders?.length ? userProfile.filterPreferences.genders[0] : null),
    department: customFilters.department || userProfile.filterPreferences?.department || '',
    academicYear: customFilters.academicYear || userProfile.filterPreferences?.academicYear || '',
    interests: customFilters.interests ? (Array.isArray(customFilters.interests) ? customFilters.interests : [customFilters.interests]) : []
  };

  // Age filter
  if (filters.minAge || filters.maxAge) {
    query.age = {};
    if (filters.minAge) query.age.$gte = filters.minAge;
    if (filters.maxAge) query.age.$lte = filters.maxAge;
  }

  // Gender filter
  if (filters.gender && filters.gender !== 'Everyone' && filters.gender !== 'All') {
    query.gender = filters.gender;
  }

  // Department filter
  if (filters.department && filters.department !== 'All Departments') {
    query.department = filters.department;
  }

  // Academic Year filter
  if (filters.academicYear && filters.academicYear !== 'All Years') {
    query.academicYear = filters.academicYear;
  }

  // Interests filter
  if (filters.interests && filters.interests.length > 0) {
    query.interests = { $in: filters.interests };
  }

  // 4. Query candidate profiles (limit to sensible batch e.g. 50 candidates)
  const candidates = await Profile.find(query)
    .populate({
      path: 'user',
      select: 'status'
    })
    .limit(50);

  // Exclude any candidates whose user account is suspended or deleted
  const activeCandidates = candidates.filter(
    (c) => c.user && c.user.status === 'active'
  );

  // 5. Check user personalization setting
  const personalize = user.privacySettings?.personalizedRecommendations ?? true;

  // 6. Rank candidates using Content-Based Recommendation Engine
  const rankedQueue = rankEligibleProfiles(userProfile, activeCandidates, {
    personalize
  });

  return {
    candidates: rankedQueue,
    totalEligible: rankedQueue.length,
    activeFilters: filters,
    isPersonalized: personalize
  };
};
