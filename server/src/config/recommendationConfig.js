/**
 * WeDate Smart Discovery Recommendation Configuration
 * Centralized feature weights, compatibility mappings, and algorithm parameters.
 */

export const RECOMMENDATION_WEIGHTS = {
  interests: 0.35,      // 35% Shared academic and personal interests (Jaccard)
  hobbies: 0.20,        // 20% Shared hobbies and lifestyle activities (Jaccard)
  relationshipGoals: 0.20, // 20% Explicit relationship goal compatibility mapping
  languages: 0.10,      // 10% Shared spoken and regional languages (Jaccard)
  bio: 0.15             // 15% Biography content similarity (TF-IDF & Cosine)
};

/**
 * Standardized relationship goals supported across WeDate
 */
export const RELATIONSHIP_GOALS = [
  'Long-term relationship',
  'Short-term relationship',
  'Casual dating',
  'Friendship & Study partner',
  'Open to exploring'
];

/**
 * Documented compatibility matrix for explicitly selected relationship goals.
 * Scale: 0.0 (conflicting / incompatible) to 1.0 (exact match).
 */
export const GOAL_COMPATIBILITY_MATRIX = {
  'Long-term relationship': {
    'Long-term relationship': 1.0,
    'Short-term relationship': 0.3,
    'Casual dating': 0.2,
    'Friendship & Study partner': 0.4,
    'Open to exploring': 0.7
  },
  'Short-term relationship': {
    'Long-term relationship': 0.3,
    'Short-term relationship': 1.0,
    'Casual dating': 0.85,
    'Friendship & Study partner': 0.5,
    'Open to exploring': 0.75
  },
  'Casual dating': {
    'Long-term relationship': 0.2,
    'Short-term relationship': 0.85,
    'Casual dating': 1.0,
    'Friendship & Study partner': 0.4,
    'Open to exploring': 0.75
  },
  'Friendship & Study partner': {
    'Long-term relationship': 0.4,
    'Short-term relationship': 0.5,
    'Casual dating': 0.4,
    'Friendship & Study partner': 1.0,
    'Open to exploring': 0.7
  },
  'Open to exploring': {
    'Long-term relationship': 0.7,
    'Short-term relationship': 0.75,
    'Casual dating': 0.75,
    'Friendship & Study partner': 0.7,
    'Open to exploring': 1.0
  }
};

/**
 * Default fallback compatibility when encountering custom or partial goals
 */
export const DEFAULT_GOAL_COMPATIBILITY = 0.3;

/**
 * Common English and conversational stop words for TF-IDF biographical vectorization
 */
export const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any',
  'are', 'aren', 'arent', 'as', 'at', 'be', 'because', 'been', 'before', 'being',
  'below', 'between', 'both', 'but', 'by', 'can', 'cannot', 'could', 'did', 'do',
  'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had',
  'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself',
  'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me',
  'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once',
  'only', 'or', 'other', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same',
  'she', 'should', 'so', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs',
  'them', 'themselves', 'then', 'there', 'these', 'they', 'this', 'those', 'through',
  'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when',
  'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your',
  'yours', 'yourself', 'yourselves', 'im', 'ive', 'like', 'love', 'looking'
]);
