import { getEligibleDiscoveryQueue } from '../services/discoveryService.js';
import Profile from '../models/Profile.js';

export const getSmartRecommendations = async (req, res, next) => {
  try {
    const queueResult = await getEligibleDiscoveryQueue(req.user._id);

    // Return the top AI recommended profiles
    const recommendations = queueResult.candidates.map((candidate) => ({
      _id: candidate._id,
      user: candidate.user,
      name: candidate.name,
      age: candidate.age,
      gender: candidate.gender,
      department: candidate.department,
      academicYear: candidate.academicYear,
      bio: candidate.bio,
      interests: candidate.interests,
      hobbies: candidate.hobbies,
      relationshipGoals: candidate.relationshipGoals,
      languages: candidate.languages,
      photos: candidate.photos,
      recommendationScore: candidate.recommendationScore,
      reasons: candidate.reasons,
      breakdown: candidate.recommendationBreakdown
    }));

    res.status(200).json({
      success: true,
      meta: {
        totalEvaluated: queueResult.totalEligible,
        isPersonalized: queueResult.isPersonalized,
        algorithm: 'WeDate Smart Discovery (Content-Based: Jaccard + TF-IDF Cosine + Goal Matrix)'
      },
      data: recommendations
    });
  } catch (error) {
    next(error);
  }
};
