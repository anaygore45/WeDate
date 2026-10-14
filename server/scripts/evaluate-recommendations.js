/**
 * WeDate Smart Discovery Offline Recommendation Evaluation Script
 * Evaluates recommendation quality, ranking consistency, Precision@K,
 * candidate coverage, and score distributions across synthetic benchmark test cases.
 */

import {
  calculateJaccardSimilarity,
  calculateCosineSimilarity,
  calculateGoalCompatibility,
  calculateRecommendationScore,
  generateRecommendationReasons,
  rankEligibleProfiles
} from '../src/services/recommendationService.js';
import { RECOMMENDATION_WEIGHTS } from '../src/config/recommendationConfig.js';

// Synthetic benchmark user profile
const testUser = {
  name: 'Benchmark Student',
  age: 22,
  department: 'Computer Engineering',
  bio: 'Passionate about machine learning, open source software, and playing acoustic guitar.',
  interests: ['Coding', 'AI & Machine Learning', 'Music'],
  hobbies: ['Cafe Hopping', 'Guitar / Jamming', 'Reading'],
  relationshipGoals: ['Long-term relationship'],
  languages: ['English', 'Hindi', 'Marathi']
};

// Synthetic candidate cohort with known ground-truth relevance:
// High relevance: candidate 1 & 2 (shared interests, hobbies, compatible goals, languages)
// Moderate relevance: candidate 3 & 4 (partial overlap)
// Low relevance / disjoint: candidate 5 & 6 (disjoint attributes)
const candidateCohort = [
  {
    id: 'cand-1',
    name: 'Ananya (High Relevance)',
    age: 22,
    department: 'Computer Engineering',
    bio: 'Software developer who loves machine learning and playing acoustic guitar over weekend coffee.',
    interests: ['Coding', 'AI & Machine Learning', 'Design'],
    hobbies: ['Cafe Hopping', 'Guitar / Jamming', 'Reading'],
    relationshipGoals: ['Long-term relationship'],
    languages: ['English', 'Marathi'],
    groundTruthRelevant: true
  },
  {
    id: 'cand-2',
    name: 'Rohan (High Relevance)',
    age: 23,
    department: 'Data Science',
    bio: 'AI researcher and guitarist passionate about open source coding and literature.',
    interests: ['Coding', 'AI & Machine Learning', 'Music'],
    hobbies: ['Guitar / Jamming', 'Reading'],
    relationshipGoals: ['Long-term relationship', 'Open to exploring'],
    languages: ['English', 'Hindi'],
    groundTruthRelevant: true
  },
  {
    id: 'cand-3',
    name: 'Diya (Moderate Relevance)',
    age: 21,
    department: 'Electronics',
    bio: 'Hardware tinkerer, loves badminton and cooking pasta.',
    interests: ['Coding', 'Robotics'],
    hobbies: ['Badminton', 'Cooking & Baking'],
    relationshipGoals: ['Open to exploring'],
    languages: ['English', 'Hindi'],
    groundTruthRelevant: false
  },
  {
    id: 'cand-4',
    name: 'Kabir (Moderate Relevance)',
    age: 24,
    department: 'Artificial Intelligence',
    bio: 'Landscape photography enthusiast who hikes on weekends.',
    interests: ['AI & Machine Learning', 'Photography'],
    hobbies: ['Trekking & Hiking', 'Reading'],
    relationshipGoals: ['Long-term relationship'],
    languages: ['English'],
    groundTruthRelevant: false
  },
  {
    id: 'cand-5',
    name: 'Tanmay (Low Relevance)',
    age: 23,
    department: 'Management',
    bio: 'Stock market analysis and marathon running fanatic.',
    interests: ['Debating', 'Philosophy'],
    hobbies: ['Fitness & Gym', 'Gaming'],
    relationshipGoals: ['Casual dating'],
    languages: ['German'],
    groundTruthRelevant: false
  },
  {
    id: 'cand-6',
    name: 'Isha (Zero/Disjoint Information)',
    age: 21,
    department: 'Biotech',
    bio: '',
    interests: [],
    hobbies: [],
    relationshipGoals: [],
    languages: [],
    groundTruthRelevant: false
  }
];

export const runEvaluation = () => {
  console.log(`\n===============================================================`);
  console.log(`📊 WeDate Smart Discovery Offline Recommendation Evaluation`);
  console.log(`===============================================================\n`);

  // 1. Evaluate Individual Candidate Scores & Reasons
  console.log('--- Candidate Scores & Component Breakdown ---');
  const scoredResults = candidateCohort.map((cand) => {
    const { score, available, breakdown } = calculateRecommendationScore(testUser, cand);
    const reasons = generateRecommendationReasons(testUser, cand);
    return {
      cand,
      score,
      available,
      breakdown,
      reasons
    };
  });

  for (const res of scoredResults) {
    console.log(`Candidate: ${res.cand.name}`);
    console.log(`  Score: ${res.score !== null ? `${res.score}%` : 'Unavailable (Zero Info)'}`);
    console.log(`  Reasons: ${res.reasons.length > 0 ? res.reasons.join(' | ') : 'None'}`);
    console.log(`  Available: ${res.available}`);
  }

  // 2. Ranking Verification
  console.log('\n--- Ranked Discovery Queue Output ---');
  const ranked = rankEligibleProfiles(testUser, candidateCohort, { personalize: true });
  ranked.forEach((r, idx) => {
    console.log(`  #${idx + 1} [Score: ${r.recommendationScore ?? 'N/A'}] ${r.name}`);
  });

  // 3. Metric Calculations:
  // Precision@K: Fraction of top K recommendations that are ground-truth relevant
  const calculatePrecisionAtK = (rankedList, k) => {
    const topK = rankedList.slice(0, k);
    if (topK.length === 0) return 0;
    const relevantCount = topK.filter((item) => item.groundTruthRelevant).length;
    return relevantCount / k;
  };

  const pAt1 = calculatePrecisionAtK(ranked, 1);
  const pAt2 = calculatePrecisionAtK(ranked, 2);
  const pAt3 = calculatePrecisionAtK(ranked, 3);

  // Recall@K: Fraction of total ground truth relevant items found in top K
  const totalRelevant = candidateCohort.filter((c) => c.groundTruthRelevant).length;
  const rAt2 = ranked.slice(0, 2).filter((item) => item.groundTruthRelevant).length / totalRelevant;
  const rAt3 = ranked.slice(0, 3).filter((item) => item.groundTruthRelevant).length / totalRelevant;

  // Candidate Coverage: percentage of eligible candidates for which a valid score was calculated
  const scoredCount = scoredResults.filter((r) => r.available).length;
  const coverage = (scoredCount / candidateCohort.length) * 100;

  // Score Distribution
  const validScores = scoredResults.filter((r) => r.score !== null).map((r) => r.score);
  const avgScore = validScores.reduce((a, b) => a + b, 0) / validScores.length;
  const maxScore = Math.max(...validScores);
  const minScore = Math.min(...validScores);

  // Determinism / Ranking Consistency Check
  const secondRun = rankEligibleProfiles(testUser, candidateCohort, { personalize: true });
  const isDeterministic = JSON.stringify(ranked.map((r) => r.id)) === JSON.stringify(secondRun.map((r) => r.id));

  // Opt-out check (Personalization toggle disabled)
  const nonPersonalized = rankEligibleProfiles(testUser, candidateCohort, { personalize: false });
  const isOptOutClean = nonPersonalized.every((c) => c.recommendationScore === null && c.isPersonalized === false);

  console.log('\n===============================================================');
  console.log('📈 Quantitative Evaluation Metrics:');
  console.log(`  • Precision@1: ${(pAt1 * 100).toFixed(1)}%`);
  console.log(`  • Precision@2: ${(pAt2 * 100).toFixed(1)}%`);
  console.log(`  • Precision@3: ${(pAt3 * 100).toFixed(1)}%`);
  console.log(`  • Recall@2:    ${(rAt2 * 100).toFixed(1)}%`);
  console.log(`  • Recall@3:    ${(rAt3 * 100).toFixed(1)}%`);
  console.log(`  • Coverage:    ${coverage.toFixed(1)}% (${scoredCount}/${candidateCohort.length} candidates)`);
  console.log(`  • Score Range: Min = ${minScore}%, Max = ${maxScore}%, Mean = ${avgScore.toFixed(1)}%`);
  console.log(`  • Ranking Determinism: ${isDeterministic ? 'PASS (100% Identical)' : 'FAIL'}`);
  console.log(`  • Personalization Opt-Out: ${isOptOutClean ? 'PASS (Clean Baseline)' : 'FAIL'}`);
  console.log('===============================================================\n');

  return {
    precisionAt1: pAt1,
    precisionAt2: pAt2,
    precisionAt3: pAt3,
    recallAt2: rAt2,
    recallAt3: rAt3,
    coverage,
    minScore,
    maxScore,
    avgScore,
    isDeterministic,
    isOptOutClean
  };
};

// Execute if run directly from CLI
if (process.argv[1] && process.argv[1].endsWith('evaluate-recommendations.js')) {
  runEvaluation();
}
