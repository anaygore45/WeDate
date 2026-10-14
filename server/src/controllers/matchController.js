import { getUserMatches, removeMatch } from '../services/matchingService.js';
import Match from '../models/Match.js';
import Profile from '../models/Profile.js';

export const getMatches = async (req, res, next) => {
  try {
    const matches = await getUserMatches(req.user._id);
    res.status(200).json({
      success: true,
      data: matches
    });
  } catch (error) {
    next(error);
  }
};

export const getMatchById = async (req, res, next) => {
  try {
    const { matchId } = req.params;
    const match = await Match.findOne({
      _id: matchId,
      users: req.user._id
    });

    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found.' });
    }

    const otherUserId = match.users.find((u) => u.toString() !== req.user._id.toString());
    const otherProfile = await Profile.findOne({ user: otherUserId });

    res.status(200).json({
      success: true,
      data: {
        match,
        otherProfile
      }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMatch = async (req, res, next) => {
  try {
    const { matchId } = req.params;
    await removeMatch(matchId, req.user._id);

    res.status(200).json({
      success: true,
      message: 'Match removed successfully.'
    });
  } catch (error) {
    next(error);
  }
};
