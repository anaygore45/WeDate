import Profile from '../models/Profile.js';
import Match from '../models/Match.js';
import Block from '../models/Block.js';
import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import {
  isAiConfigured,
  generatePersonalizedExplanation,
  generateConversationStarters,
  enhanceBio,
  analyzeDiscoverySynergy,
  generateReplySuggestions
} from '../services/aiAssistantService.js';

/**
 * Check AI service status and configuration
 * GET /api/ai/status
 */
export const getAiStatus = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      isConfigured: isAiConfigured(),
      provider: 'Google Gemini',
      model: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
      features: [
        'smart_discovery',
        'personalized_explanations',
        'conversation_starters',
        'bio_enhancements'
      ]
    }
  });
};

/**
 * Generate a grounded, personalized match explanation for a discovery candidate
 * POST /api/ai/explain
 */
export const explainMatch = async (req, res, next) => {
  try {
    const { candidateUserId } = req.body;
    if (!candidateUserId) {
      return res.status(400).json({
        success: false,
        message: 'candidateUserId is required.'
      });
    }

    if (candidateUserId.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot generate an explanation for yourself.'
      });
    }

    // Verify neither user has blocked the other
    const isBlocked = await Block.findOne({
      $or: [
        { blocker: req.user._id, blocked: candidateUserId },
        { blocker: candidateUserId, blocked: req.user._id }
      ]
    });

    if (isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Unable to analyze this profile due to privacy settings.'
      });
    }

    // Fetch user profile and candidate profile
    const [userProfile, candidateProfile] = await Promise.all([
      Profile.findOne({ user: req.user._id }),
      Profile.findOne({ user: candidateUserId, isVisible: true })
    ]);

    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: 'Your user profile was not found.'
      });
    }

    if (!candidateProfile) {
      return res.status(404).json({
        success: false,
        message: 'Candidate profile not found or is currently private.'
      });
    }

    const explanation = await generatePersonalizedExplanation(userProfile, candidateProfile);

    res.status(200).json({
      success: true,
      data: explanation
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate 3 personalized, grounded conversation starters for mutual matches
 * POST /api/ai/icebreakers
 */
export const getIcebreakers = async (req, res, next) => {
  try {
    const { matchId } = req.body;
    if (!matchId) {
      return res.status(400).json({
        success: false,
        message: 'matchId is required.'
      });
    }

    // Enforce mutual match authorization
    const match = await Match.findOne({
      _id: matchId,
      users: req.user._id,
      isActive: true
    });

    if (!match) {
      return res.status(403).json({
        success: false,
        message: 'Conversation starters are only available for confirmed, active mutual matches.'
      });
    }

    // Find the partner's user ID
    const partnerUserId = match.users.find(
      (id) => id.toString() !== req.user._id.toString()
    );

    // Verify blocking status
    const isBlocked = await Block.findOne({
      $or: [
        { blocker: req.user._id, blocked: partnerUserId },
        { blocker: partnerUserId, blocked: req.user._id }
      ]
    });

    if (isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Unable to generate starters for this match.'
      });
    }

    const [userProfile, partnerProfile] = await Promise.all([
      Profile.findOne({ user: req.user._id }),
      Profile.findOne({ user: partnerUserId })
    ]);

    if (!userProfile || !partnerProfile) {
      return res.status(404).json({
        success: false,
        message: 'One or both match profiles could not be found.'
      });
    }

    const starters = await generateConversationStarters(userProfile, partnerProfile);

    res.status(200).json({
      success: true,
      data: {
        partnerName: partnerProfile.name,
        starters
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate authentic, voice-preserving bio enhancements
 * POST /api/ai/enhance-bio
 */
export const enhanceBioSuggestions = async (req, res, next) => {
  try {
    const userProfile = await Profile.findOne({ user: req.user._id });
    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found.'
      });
    }

    const currentBio = req.body.currentBio !== undefined ? req.body.currentBio : userProfile.bio;
    const tone = req.body.tone || 'authentic';

    const suggestions = await enhanceBio(currentBio, userProfile, tone);

    res.status(200).json({
      success: true,
      data: {
        suggestions
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Evaluate discovery synergy across candidate profiles
 * POST /api/ai/synergy
 */
export const evaluateSynergy = async (req, res, next) => {
  try {
    const { candidateUserIds } = req.body;
    if (!Array.isArray(candidateUserIds) || candidateUserIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'candidateUserIds array is required.'
      });
    }

    const userProfile = await Profile.findOne({ user: req.user._id });
    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found.'
      });
    }

    // Exclude blocked candidates
    const blockedRecords = await Block.find({
      $or: [
        { blocker: req.user._id, blocked: { $in: candidateUserIds } },
        { blocker: { $in: candidateUserIds }, blocked: req.user._id }
      ]
    });
    const blockedIds = new Set(
      blockedRecords.flatMap((b) => [b.blocker.toString(), b.blocked.toString()])
    );

    const validCandidateIds = candidateUserIds.filter(
      (id) => !blockedIds.has(id.toString()) && id.toString() !== req.user._id.toString()
    );

    const candidates = await Profile.find({
      user: { $in: validCandidateIds },
      isVisible: true
    }).limit(5);

    const synergyResults = await analyzeDiscoverySynergy(userProfile, candidates);

    res.status(200).json({
      success: true,
      data: {
        synergies: synergyResults
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate 3 contextual "what to reply" suggestions for active conversation
 * POST /api/ai/suggest-replies
 */
export const getReplySuggestions = async (req, res, next) => {
  try {
    const { chatId, matchId } = req.body;
    if (!chatId && !matchId) {
      return res.status(400).json({
        success: false,
        message: 'chatId or matchId is required.'
      });
    }

    let chat;
    if (chatId) {
      chat = await Chat.findOne({ _id: chatId, participants: req.user._id });
    } else {
      chat = await Chat.findOne({ match: matchId, participants: req.user._id });
    }

    if (!chat) {
      const match = await Match.findOne({
        _id: matchId,
        users: req.user._id,
        isActive: true
      });
      if (!match) {
        return res.status(403).json({
          success: false,
          message: 'Active conversation or match not found.'
        });
      }
      chat = new Chat({ match: match._id, participants: match.users });
      await chat.save();
    }

    // Verify active match
    const match = await Match.findOne({ _id: chat.match, isActive: true });
    if (!match) {
      return res.status(403).json({
        success: false,
        message: 'This match is inactive or has been removed.'
      });
    }

    const partnerUserId = chat.participants.find(
      (p) => p.toString() !== req.user._id.toString()
    );

    // Verify no blocks
    const isBlocked = await Block.findOne({
      $or: [
        { blocker: req.user._id, blocked: partnerUserId },
        { blocker: partnerUserId, blocked: req.user._id }
      ]
    });
    if (isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'AI helper is unavailable due to safety block.'
      });
    }

    // Fetch user and partner profiles
    const [userProfile, partnerProfile] = await Promise.all([
      Profile.findOne({ user: req.user._id }),
      Profile.findOne({ user: partnerUserId })
    ]);

    if (!userProfile || !partnerProfile) {
      return res.status(404).json({
        success: false,
        message: 'Profile information not found.'
      });
    }

    // Fetch last 8 messages from chat
    const messages = await Message.find({ chat: chat._id })
      .sort({ createdAt: -1 })
      .limit(8);

    const replies = await generateReplySuggestions(
      userProfile,
      partnerProfile,
      messages.reverse()
    );

    res.status(200).json({
      success: true,
      data: {
        replies
      }
    });
  } catch (error) {
    next(error);
  }
};
