import {
  calculateJaccardSimilarity,
  calculateCosineSimilarity,
  calculateGoalCompatibility,
  calculateRecommendationScore,
  generateRecommendationReasons,
  rankEligibleProfiles
} from '../src/services/recommendationService.js';
import { RECOMMENDATION_WEIGHTS } from '../src/config/recommendationConfig.js';

describe('WeDate Smart Discovery - AI Recommendation Engine', () => {
  describe('Jaccard Similarity', () => {
    test('returns 1.0 for identical sets', () => {
      const setA = ['Coding', 'Music', 'Design'];
      const setB = ['design', 'coding', 'music'];
      const sim = calculateJaccardSimilarity(setA, setB);
      expect(sim).toBe(1.0);
    });

    test('returns 0.0 for completely disjoint sets', () => {
      const setA = ['Coding', 'Robotics'];
      const setB = ['Cooking', 'Dance'];
      const sim = calculateJaccardSimilarity(setA, setB);
      expect(sim).toBe(0.0);
    });

    test('calculates correct fractional overlap', () => {
      // Intersection: ['coding'] (size 1)
      // Union: ['coding', 'music', 'design'] (size 3)
      const setA = ['Coding', 'Music'];
      const setB = ['Coding', 'Design'];
      const sim = calculateJaccardSimilarity(setA, setB);
      expect(sim).toBeCloseTo(1 / 3, 4);
    });

    test('returns null when both sets are empty (insufficient data)', () => {
      const sim = calculateJaccardSimilarity([], []);
      expect(sim).toBeNull();
    });

    test('returns 0.0 when one set is empty and the other is not', () => {
      const sim = calculateJaccardSimilarity(['Coding'], []);
      expect(sim).toBe(0.0);
    });
  });

  describe('TF-IDF & Cosine Similarity', () => {
    test('computes positive similarity for overlapping informative text', () => {
      const textA = 'Passionate about machine learning and software engineering';
      const textB = 'Studying machine learning, deep learning and software';
      const sim = calculateCosineSimilarity(textA, textB);
      expect(sim).toBeGreaterThan(0.3);
      expect(sim).toBeLessThanOrEqual(1.0);
    });

    test('returns null for empty biography text', () => {
      const sim = calculateCosineSimilarity('', 'Software developer');
      expect(sim).toBeNull();
    });

    test('returns null or 0 when text contains only stop words', () => {
      const sim = calculateCosineSimilarity('the and is of', 'just me in');
      expect(sim).toBeNull();
    });
  });

  describe('Relationship Goal Compatibility', () => {
    test('awards 1.0 for exact agreement in relationship goals', () => {
      const score = calculateGoalCompatibility(
        ['Long-term relationship'],
        ['Long-term relationship']
      );
      expect(score).toBe(1.0);
    });

    test('awards documented partial score for compatible goals', () => {
      // Long-term relationship + Open to exploring = 0.7
      const score = calculateGoalCompatibility(
        ['Long-term relationship'],
        ['Open to exploring']
      );
      expect(score).toBe(0.7);
    });

    test('assigns low score for conflicting goals', () => {
      // Long-term relationship + Casual dating = 0.2
      const score = calculateGoalCompatibility(
        ['Long-term relationship'],
        ['Casual dating']
      );
      expect(score).toBe(0.2);
    });

    test('returns null when either profile has no specified goals', () => {
      expect(calculateGoalCompatibility([], ['Casual dating'])).toBeNull();
      expect(calculateGoalCompatibility(['Casual dating'], [])).toBeNull();
    });
  });

  describe('Weighted Scoring & Clamping', () => {
    test('calculates normalized score within [0, 100]', () => {
      const user = {
        interests: ['Coding', 'AI & Machine Learning'],
        hobbies: ['Reading', 'Guitar / Jamming'],
        relationshipGoals: ['Long-term relationship'],
        languages: ['English', 'Hindi'],
        bio: 'Machine learning researcher and guitarist'
      };

      const candidate = {
        interests: ['Coding', 'Design'],
        hobbies: ['Reading'],
        relationshipGoals: ['Long-term relationship'],
        languages: ['English'],
        bio: 'Software engineer and reader'
      };

      const { score, available } = calculateRecommendationScore(user, candidate);
      expect(available).toBe(true);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    test('renormalizes available weights when some fields are missing', () => {
      const user = {
        interests: ['Coding'],
        hobbies: ['Reading'],
        relationshipGoals: ['Long-term relationship'],
        languages: [], // Missing
        bio: ''        // Missing
      };

      const candidate = {
        interests: ['Coding'],
        hobbies: ['Reading'],
        relationshipGoals: ['Long-term relationship'],
        languages: [],
        bio: ''
      };

      // Since all 3 available components are 1.0, renormalized score should be 100
      const { score, available, availableWeight } = calculateRecommendationScore(user, candidate);
      expect(available).toBe(true);
      expect(score).toBe(100);
      expect(availableWeight).toBeCloseTo(0.35 + 0.20 + 0.20, 2);
    });

    test('handles zero-information candidate safely without crashing', () => {
      const user = {
        interests: [],
        hobbies: [],
        relationshipGoals: [],
        languages: [],
        bio: ''
      };
      const candidate = {
        interests: [],
        hobbies: [],
        relationshipGoals: [],
        languages: [],
        bio: ''
      };

      const { score, available } = calculateRecommendationScore(user, candidate);
      expect(available).toBe(false);
      expect(score).toBeNull();
    });
  });

  describe('Explanations & Ranking', () => {
    test('generates transparent, accurate reasons based only on shared data', () => {
      const user = {
        interests: ['Coding', 'Music'],
        hobbies: ['Cafe Hopping'],
        relationshipGoals: ['Long-term relationship'],
        languages: ['English', 'Marathi']
      };

      const candidate = {
        interests: ['Coding', 'Art'],
        hobbies: ['Cafe Hopping', 'Gaming'],
        relationshipGoals: ['Long-term relationship'],
        languages: ['English', 'Marathi']
      };

      const reasons = generateRecommendationReasons(user, candidate);
      expect(reasons.length).toBeGreaterThan(0);
      expect(reasons.some((r) => r.includes('Coding'))).toBe(true);
      expect(reasons.some((r) => r.includes('Cafe hopping') || r.includes('Cafe Hopping'))).toBe(true);
      expect(reasons.some((r) => r.includes('Long-term relationship'))).toBe(true);
    });

    test('ranks candidates in descending order of recommendation score', () => {
      const user = {
        interests: ['Coding', 'Music'],
        hobbies: ['Reading'],
        relationshipGoals: ['Long-term relationship'],
        languages: ['English']
      };

      const candidateHigh = {
        id: 'high',
        name: 'High',
        interests: ['Coding', 'Music'],
        hobbies: ['Reading'],
        relationshipGoals: ['Long-term relationship'],
        languages: ['English']
      };

      const candidateLow = {
        id: 'low',
        name: 'Low',
        interests: ['Gardening'],
        hobbies: ['Skydiving'],
        relationshipGoals: ['Casual dating'],
        languages: ['Japanese']
      };

      const ranked = rankEligibleProfiles(user, [candidateLow, candidateHigh], { personalize: true });
      expect(ranked[0].id).toBe('high');
      expect(ranked[1].id).toBe('low');
    });

    test('respects personalization opt-out setting', () => {
      const user = { interests: ['Coding'] };
      const candidate = { id: 'c1', interests: ['Coding'] };

      const unranked = rankEligibleProfiles(user, [candidate], { personalize: false });
      expect(unranked[0].recommendationScore).toBeNull();
      expect(unranked[0].isPersonalized).toBe(false);
    });
  });
});
