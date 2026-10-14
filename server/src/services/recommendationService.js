/**
 * WeDate Smart Discovery Recommendation Service
 * Content-based recommendation engine implementing:
 * - Jaccard similarity (interests, hobbies, languages)
 * - TF-IDF vectorization & Cosine similarity (biography text)
 * - Explicit relationship goal compatibility mapping
 * - Dynamically normalized weighted scoring
 * - Deterministic, explainable recommendation reasons
 */

import {
  RECOMMENDATION_WEIGHTS,
  GOAL_COMPATIBILITY_MATRIX,
  DEFAULT_GOAL_COMPATIBILITY,
  STOP_WORDS
} from '../config/recommendationConfig.js';

/**
 * Normalizes an array of string tags (trim, lowercase)
 */
export const normalizeTags = (tags = []) => {
  if (!Array.isArray(tags)) return [];
  return tags
    .map((tag) => (typeof tag === 'string' ? tag.trim().toLowerCase() : ''))
    .filter(Boolean);
};

/**
 * Calculates Jaccard similarity between two sets of strings
 * Jaccard(A, B) = |A ∩ B| / |A ∪ B|
 * Returns null if both sets are empty (insufficient data)
 * Returns a value between 0.0 and 1.0
 */
export const calculateJaccardSimilarity = (listA = [], listB = []) => {
  const setA = new Set(normalizeTags(listA));
  const setB = new Set(normalizeTags(listB));

  if (setA.size === 0 && setB.size === 0) {
    return null; // Both empty -> component unavailable
  }

  if (setA.size === 0 || setB.size === 0) {
    return 0.0;
  }

  let intersectionCount = 0;
  for (const item of setA) {
    if (setB.has(item)) {
      intersectionCount++;
    }
  }

  const unionSize = new Set([...setA, ...setB]).size;
  if (unionSize === 0) return null;

  return intersectionCount / unionSize;
};

/**
 * Tokenizes and normalizes text for TF-IDF analysis
 */
export const tokenizeText = (text = '') => {
  if (typeof text !== 'string') return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
};

/**
 * Calculates Term Frequency (TF) vector for a list of tokens
 */
export const computeTF = (tokens = []) => {
  const tf = {};
  if (tokens.length === 0) return tf;

  for (const token of tokens) {
    tf[token] = (tf[token] || 0) + 1;
  }

  // Normalize by total tokens
  for (const token in tf) {
    tf[token] = tf[token] / tokens.length;
  }

  return tf;
};

/**
 * Calculates Cosine similarity between two biography texts using TF-IDF vectors
 * Cosine(A, B) = (A · B) / (||A|| * ||B||)
 * Returns null if either biography is empty or contains zero informative tokens
 */
export const calculateCosineSimilarity = (textA = '', textB = '', corpusTexts = []) => {
  const tokensA = tokenizeText(textA);
  const tokensB = tokenizeText(textB);

  if (tokensA.length === 0 || tokensB.length === 0) {
    return null; // Empty or uninformative bio
  }

  const tfA = computeTF(tokensA);
  const tfB = computeTF(tokensB);

  // Vocabulary across both texts (and optional corpus)
  const vocab = new Set([...Object.keys(tfA), ...Object.keys(tfB)]);

  // Compute document frequency (DF) across documents
  const allDocs = [tokensA, tokensB, ...(corpusTexts.map((t) => tokenizeText(t)).filter((t) => t.length > 0))];
  const docCount = allDocs.length;
  const idf = {};

  for (const term of vocab) {
    let docsWithTerm = 0;
    for (const doc of allDocs) {
      if (doc.includes(term)) docsWithTerm++;
    }
    // Standard smoothed IDF: ln((1 + N) / (1 + df)) + 1
    idf[term] = Math.log((1 + docCount) / (1 + docsWithTerm)) + 1;
  }

  // Calculate TF-IDF vectors and dot product
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (const term of vocab) {
    const valA = (tfA[term] || 0) * (idf[term] || 1);
    const valB = (tfB[term] || 0) * (idf[term] || 1);

    dotProduct += valA * valB;
    normA += valA * valA;
    normB += valB * valB;
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) return null;

  const similarity = dotProduct / (normA * normB);
  return Math.min(1.0, Math.max(0.0, similarity));
};

/**
 * Calculates relationship goal compatibility between two users
 * Scale: 0.0 to 1.0. Returns null if either user has no goals specified.
 */
export const calculateGoalCompatibility = (goalsA = [], goalsB = []) => {
  if (!Array.isArray(goalsA) || !Array.isArray(goalsB)) return null;
  if (goalsA.length === 0 || goalsB.length === 0) return null;

  let maxCompatibility = 0.0;
  let matchFound = false;

  for (const gA of goalsA) {
    for (const gB of goalsB) {
      let score = DEFAULT_GOAL_COMPATIBILITY;
      if (GOAL_COMPATIBILITY_MATRIX[gA] && GOAL_COMPATIBILITY_MATRIX[gA][gB] !== undefined) {
        score = GOAL_COMPATIBILITY_MATRIX[gA][gB];
      } else if (gA.trim().toLowerCase() === gB.trim().toLowerCase()) {
        score = 1.0;
      }
      matchFound = true;
      if (score > maxCompatibility) {
        maxCompatibility = score;
      }
    }
  }

  return matchFound ? maxCompatibility : null;
};

/**
 * Calculates the overall recommendation score across all available components
 * Formula: 100 * Σ(weight_i * similarity_i) / Σ(weight_i)
 */
export const calculateRecommendationScore = (
  userProfile,
  candidateProfile,
  weights = RECOMMENDATION_WEIGHTS
) => {
  if (!userProfile || !candidateProfile) {
    return { score: null, available: false, breakdown: {} };
  }

  const interestsSim = calculateJaccardSimilarity(userProfile.interests, candidateProfile.interests);
  const hobbiesSim = calculateJaccardSimilarity(userProfile.hobbies, candidateProfile.hobbies);
  const goalsSim = calculateGoalCompatibility(userProfile.relationshipGoals, candidateProfile.relationshipGoals);
  const languagesSim = calculateJaccardSimilarity(userProfile.languages, candidateProfile.languages);
  const bioSim = calculateCosineSimilarity(userProfile.bio, candidateProfile.bio);

  const breakdown = {
    interests: interestsSim,
    hobbies: hobbiesSim,
    relationshipGoals: goalsSim,
    languages: languagesSim,
    bio: bioSim
  };

  let weightedSum = 0;
  let availableWeight = 0;

  for (const [key, sim] of Object.entries(breakdown)) {
    if (sim !== null && typeof sim === 'number') {
      const weight = weights[key] || 0;
      weightedSum += weight * sim;
      availableWeight += weight;
    }
  }

  // If no components were available to evaluate (zero-information case)
  if (availableWeight === 0) {
    return {
      score: null,
      available: false,
      breakdown,
      availableWeight: 0
    };
  }

  // Renormalize by sum of available component weights and scale to 0-100
  const normalizedScore = (weightedSum / availableWeight) * 100;
  const clampedScore = Math.min(100, Math.max(0, Math.round(normalizedScore)));

  return {
    score: clampedScore,
    available: true,
    breakdown,
    availableWeight: Math.round(availableWeight * 100) / 100
  };
};

/**
 * Generates transparent, human-readable explanations based on real shared data
 */
export const generateRecommendationReasons = (userProfile, candidateProfile) => {
  if (!userProfile || !candidateProfile) return [];

  const reasons = [];

  // 1. Shared Interests
  const userInterests = new Set(normalizeTags(userProfile.interests));
  const sharedInterests = normalizeTags(candidateProfile.interests).filter((i) => userInterests.has(i));
  if (sharedInterests.length > 0) {
    // Format capitalized names
    const prettyInterests = sharedInterests.map(
      (i) => i.charAt(0).toUpperCase() + i.slice(1)
    );
    if (prettyInterests.length === 1) {
      reasons.push(`You both share an interest in ${prettyInterests[0]}`);
    } else if (prettyInterests.length === 2) {
      reasons.push(`You both share interests in ${prettyInterests[0]} and ${prettyInterests[1]}`);
    } else {
      reasons.push(
        `You both share interests in ${prettyInterests[0]}, ${prettyInterests[1]}, and ${prettyInterests.length - 2} other(s)`
      );
    }
  }

  // 2. Shared Hobbies
  const userHobbies = new Set(normalizeTags(userProfile.hobbies));
  const sharedHobbies = normalizeTags(candidateProfile.hobbies).filter((h) => userHobbies.has(h));
  if (sharedHobbies.length > 0) {
    const prettyHobbies = sharedHobbies.map(
      (h) => h.charAt(0).toUpperCase() + h.slice(1)
    );
    if (prettyHobbies.length === 1) {
      reasons.push(`You both enjoy ${prettyHobbies[0]}`);
    } else if (prettyHobbies.length === 2) {
      reasons.push(`You both enjoy ${prettyHobbies[0]} and ${prettyHobbies[1]}`);
    } else {
      reasons.push(
        `You both enjoy ${prettyHobbies[0]}, ${prettyHobbies[1]}, and more`
      );
    }
  }

  // 3. Relationship Goals
  const userGoals = userProfile.relationshipGoals || [];
  const candidateGoals = candidateProfile.relationshipGoals || [];
  const exactGoals = userGoals.filter((g) => candidateGoals.includes(g));
  if (exactGoals.length > 0) {
    reasons.push(`Your relationship goals (${exactGoals[0]}) align closely`);
  } else {
    const goalComp = calculateGoalCompatibility(userGoals, candidateGoals);
    if (goalComp !== null && goalComp >= 0.7) {
      reasons.push('Your relationship goals are compatible');
    }
  }

  // 4. Shared Languages
  const userLangs = new Set(normalizeTags(userProfile.languages));
  const sharedLangs = normalizeTags(candidateProfile.languages).filter((l) => userLangs.has(l));
  if (sharedLangs.length > 0) {
    const prettyLangs = sharedLangs.map((l) => l.charAt(0).toUpperCase() + l.slice(1));
    if (prettyLangs.length >= 2) {
      reasons.push(`You both speak ${prettyLangs.join(', ')}`);
    } else if (prettyLangs.length === 1 && prettyLangs[0] !== 'English') {
      reasons.push(`You both speak ${prettyLangs[0]}`);
    }
  }

  // 5. Shared Department / Academic field (academic affinity)
  if (
    userProfile.department &&
    candidateProfile.department &&
    userProfile.department.trim().toLowerCase() === candidateProfile.department.trim().toLowerCase()
  ) {
    reasons.push(`You are both in ${userProfile.department}`);
  }

  // 6. Bio Keyword Overlap
  const tokensA = new Set(tokenizeText(userProfile.bio));
  const sharedBioWords = tokenizeText(candidateProfile.bio).filter((t) => tokensA.has(t));
  const uniqueBioWords = [...new Set(sharedBioWords)];
  if (uniqueBioWords.length >= 2 && reasons.length < 3) {
    reasons.push(`You both talk about ${uniqueBioWords.slice(0, 2).join(' & ')} in your bios`);
  }

  return reasons.slice(0, 3); // Return top 3 clearest reasons
};

/**
 * Ranks eligible profiles using Smart Discovery content-based recommendation
 * Preserves authorization & eligibility constraints.
 * If user has opted out of personalization, returns baseline ordering without scores.
 */
export const rankEligibleProfiles = (
  userProfile,
  candidateProfiles = [],
  options = { personalize: true }
) => {
  if (!Array.isArray(candidateProfiles) || candidateProfiles.length === 0) {
    return [];
  }

  // Non-personalized baseline ordering (e.g., chronological newest candidates)
  if (!options.personalize) {
    return candidateProfiles.map((candidate) => {
      const doc = candidate.toObject ? candidate.toObject() : { ...candidate };
      return {
        ...doc,
        recommendationScore: null,
        reasons: [],
        isPersonalized: false
      };
    });
  }

  // Personalized ranking
  const scoredCandidates = candidateProfiles.map((candidate) => {
    const doc = candidate.toObject ? candidate.toObject() : { ...candidate };
    const { score, available, breakdown } = calculateRecommendationScore(userProfile, doc);
    const reasons = generateRecommendationReasons(userProfile, doc);

    return {
      ...doc,
      recommendationScore: available ? score : null,
      recommendationBreakdown: breakdown,
      reasons,
      isPersonalized: true
    };
  });

  // Sort descending by recommendationScore (scored profiles first, nulls at bottom)
  scoredCandidates.sort((a, b) => {
    if (a.recommendationScore !== null && b.recommendationScore !== null) {
      if (b.recommendationScore !== a.recommendationScore) {
        return b.recommendationScore - a.recommendationScore;
      }
      // Tie-breaker: creation date or age difference
      const ageDiffA = Math.abs((a.age || 20) - (userProfile?.age || 20));
      const ageDiffB = Math.abs((b.age || 20) - (userProfile?.age || 20));
      return ageDiffA - ageDiffB;
    }
    if (a.recommendationScore !== null) return -1;
    if (b.recommendationScore !== null) return 1;
    return 0;
  });

  return scoredCandidates;
};
