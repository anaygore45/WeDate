/**
 * WeDate Smart Connection Assistant — Generative AI Service
 * Powered by Google Gemini (@google/genai SDK)
 * 
 * Provides:
 * - Smart Discovery Synergy Analysis
 * - Grounded Personalized Explanations
 * - Personalized Mutual-Match Conversation Starters
 * - Voice-Preserving Bio Enhancements
 */

import { GoogleGenAI } from '@google/genai';

const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

/**
 * Checks if the Gemini API key is configured in the environment
 */
export const isAiConfigured = () => {
  return Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
};

/**
 * Returns an instance of GoogleGenAI initialized with the server API key
 */
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim().length === 0) {
    const error = new Error('Gemini API key is not configured on the server. Please set GEMINI_API_KEY in your .env file.');
    error.code = 'AI_NOT_CONFIGURED';
    error.statusCode = 503;
    throw error;
  }
  return new GoogleGenAI({ apiKey: apiKey.trim() });
};

const handleAiError = (err, fallbackMessage) => {
  console.error('[Gemini API Error]', err.message);
  if (err.code === 'AI_NOT_CONFIGURED') throw err;

  const isAuthError =
    err.message?.includes('API key not valid') ||
    err.message?.includes('ACCESS_TOKEN_TYPE_UNSUPPORTED') ||
    err.message?.includes('UNAUTHENTICATED') ||
    err.status === 401;

  if (isAuthError) {
    const error = new Error('Invalid Gemini API key. Please check that GEMINI_API_KEY in .env starts with AIzaSy... from Google AI Studio (https://aistudio.google.com/app/apikey).');
    error.code = 'AI_INVALID_KEY';
    error.statusCode = 401;
    throw error;
  }

  const error = new Error(fallbackMessage || 'AI Connection Assistant is temporarily unavailable. Please try again.');
  error.code = 'AI_SERVICE_ERROR';
  error.statusCode = 502;
  throw error;
};

/**
 * Sanitizes a profile object, extracting ONLY voluntary and publicly visible attributes.
 * Strips emails, user IDs, auth tokens, passwords, timestamps, and private data.
 */
export const sanitizeForAi = (profile) => {
  if (!profile) return null;
  const doc = profile.toObject ? profile.toObject() : profile;

  return {
    name: doc.name || 'Student',
    department: doc.department || 'Not specified',
    academicYear: doc.academicYear || 'Not specified',
    bio: doc.bio || '',
    interests: Array.isArray(doc.interests) ? doc.interests : [],
    hobbies: Array.isArray(doc.hobbies) ? doc.hobbies : [],
    relationshipGoals: Array.isArray(doc.relationshipGoals) ? doc.relationshipGoals : [],
    languages: Array.isArray(doc.languages) ? doc.languages : []
  };
};

/**
 * Helper to strip JSON markdown code fences if returned by the model
 */
const cleanJsonOutput = (text = '') => {
  const trimmed = text.trim();
  if (trimmed.startsWith('```json')) {
    return trimmed.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
  }
  if (trimmed.startsWith('```')) {
    return trimmed.replace(/^```\s*/, '').replace(/```\s*$/, '').trim();
  }
  return trimmed;
};

/**
 * Generates a deeply personalized, strictly grounded explanation of why two profiles connect
 */
export const generatePersonalizedExplanation = async (userProfile, candidateProfile) => {
  const ai = getAiClient();
  const studentA = sanitizeForAi(userProfile);
  const studentB = sanitizeForAi(candidateProfile);

  const prompt = `You are the WeDate Smart Connection Assistant for a verified university student community.
Your task is to explain why two students may have common interests and potential connection synergy.

RULES:
1. Ground every claim STRICTLY in their provided profile data (interests, hobbies, bio text, academic department, relationship goals, or languages).
2. DO NOT hallucinate, invent, or assume any hobbies, experiences, mutual friends, or details not provided.
3. Keep the tone warm, approachable, collegiate, and respectful.
4. Keep the explanation to 2-3 concise, engaging sentences.
5. Return ONLY a valid JSON object matching the requested schema.

Profile A (Current User):
- Name: ${studentA.name}
- Department: ${studentA.department} (${studentA.academicYear})
- Interests: ${studentA.interests.join(', ') || 'None stated'}
- Hobbies: ${studentA.hobbies.join(', ') || 'None stated'}
- Relationship Goals: ${studentA.relationshipGoals.join(', ') || 'None stated'}
- Bio: "${studentA.bio || 'No bio provided'}"
- Languages: ${studentA.languages.join(', ') || 'None stated'}

Profile B (Potential Match):
- Name: ${studentB.name}
- Department: ${studentB.department} (${studentB.academicYear})
- Interests: ${studentB.interests.join(', ') || 'None stated'}
- Hobbies: ${studentB.hobbies.join(', ') || 'None stated'}
- Relationship Goals: ${studentB.relationshipGoals.join(', ') || 'None stated'}
- Bio: "${studentB.bio || 'No bio provided'}"
- Languages: ${studentB.languages.join(', ') || 'None stated'}

JSON Schema:
{
  "explanation": "2-3 sentence grounded explanation of why they might hit it off.",
  "sharedHighlights": ["exact shared topic 1", "exact shared topic 2"],
  "conversationSpark": "One lighthearted suggested topic to explore based on their profiles"
}`;

  try {
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        temperature: 0.4,
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(cleanJsonOutput(response.text));
    return {
      explanation: parsed.explanation || 'You share common passions and academic life interests.',
      sharedHighlights: Array.isArray(parsed.sharedHighlights) ? parsed.sharedHighlights : [],
      conversationSpark: parsed.conversationSpark || ''
    };
  } catch (err) {
    handleAiError(err, 'AI Connection Assistant is temporarily unavailable. Please try again.');
  }
};

/**
 * Generates natural, grounded conversation starters for mutually matched users
 */
export const generateConversationStarters = async (userProfile, partnerProfile) => {
  const ai = getAiClient();
  const studentA = sanitizeForAi(userProfile);
  const studentB = sanitizeForAi(partnerProfile);

  const prompt = `You are the WeDate Smart Connection Assistant.
Student A (${studentA.name}) and Student B (${studentB.name}) have just formed a mutual match on WeDate.
Help Student A start a natural, friendly, non-cliché conversation with Student B.

RULES:
1. Every icebreaker MUST reference real information present in Student B's profile or a clear shared interest between both students.
2. DO NOT use generic cheesy pickup lines or robotic pleasantries.
3. Keep the messages casual, thoughtful, and appropriate for university students.
4. Produce exactly 3 distinct conversation starters.
5. Return ONLY a valid JSON array of 3 objects.

Student A Profile:
- Department: ${studentA.department}
- Interests: ${studentA.interests.join(', ')}
- Hobbies: ${studentA.hobbies.join(', ')}
- Bio: "${studentA.bio}"

Student B Profile (Match):
- Name: ${studentB.name}
- Department: ${studentB.department} (${studentB.academicYear})
- Interests: ${studentB.interests.join(', ')}
- Hobbies: ${studentB.hobbies.join(', ')}
- Bio: "${studentB.bio}"
- Relationship Goals: ${studentB.relationshipGoals.join(', ')}

JSON Schema:
[
  {
    "category": "Shared Passion / Hobby / Campus Life",
    "starter": "The exact message Student A can send",
    "rationale": "Why this starter works based on their profile"
  }
]`;

  try {
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        temperature: 0.6,
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(cleanJsonOutput(response.text));
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.slice(0, 3);
    }
    throw new Error('Unexpected model response format');
  } catch (err) {
    handleAiError(err, 'Could not generate conversation starters at this moment.');
  }
};

/**
 * Suggests voice-preserving improvements to a user's biography
 */
export const enhanceBio = async (currentBio = '', profileContext = {}, desiredTone = 'authentic') => {
  const ai = getAiClient();
  const context = sanitizeForAi(profileContext);

  const prompt = `You are an expert personal branding and dating profile coach for college students on WeDate.
Your goal is to suggest 3 improvements to the student's biography while STRICTLY preserving their authentic voice, genuine interests, and truthfulness.

RULES:
1. NEVER invent fake hobbies, achievements, sports, or interests that are not mentioned in their bio or profile context.
2. Keep the length realistic for a dating profile (30-65 words).
3. Provide 3 distinct tonal variations:
   - "Authentic & Conversational" (natural, friendly, easy to talk to)
   - "Engaging & Story-driven" (evocative, vivid, highlights lifestyle)
   - "Concise & Expressive" (punchy, witty, memorable)
4. For each variation, include a short "coachTip" explaining why it helps start conversations.
5. Return ONLY a valid JSON object.

Student Context:
- Current Bio: "${currentBio.trim() || 'No bio written yet. Looking to write a great intro.'}"
- Department: ${context.department} (${context.academicYear})
- Key Interests: ${context.interests.join(', ') || 'Not specified'}
- Hobbies: ${context.hobbies.join(', ') || 'Not specified'}
- Relationship Goals: ${context.relationshipGoals.join(', ') || 'Not specified'}

JSON Schema:
{
  "suggestions": [
    {
      "tone": "Authentic & Conversational",
      "bio": "Proposed enhanced biography text",
      "coachTip": "Brief tip on what makes this effective"
    },
    {
      "tone": "Engaging & Story-driven",
      "bio": "Proposed enhanced biography text",
      "coachTip": "Brief tip on what makes this effective"
    },
    {
      "tone": "Concise & Expressive",
      "bio": "Proposed enhanced biography text",
      "coachTip": "Brief tip on what makes this effective"
    }
  ]
}`;

  try {
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        temperature: 0.6,
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(cleanJsonOutput(response.text));
    return parsed.suggestions || [];
  } catch (err) {
    handleAiError(err, 'Could not generate bio suggestions at this moment.');
  }
};

/**
 * Analyzes semantic discovery synergy between a user and candidate profiles
 */
export const analyzeDiscoverySynergy = async (userProfile, candidateProfiles = []) => {
  if (!Array.isArray(candidateProfiles) || candidateProfiles.length === 0) {
    return [];
  }

  const ai = getAiClient();
  const studentA = sanitizeForAi(userProfile);
  const candidates = candidateProfiles.slice(0, 5).map((c, i) => ({
    candidateIndex: i,
    profile: sanitizeForAi(c)
  }));

  const prompt = `You are the WeDate Smart Discovery AI.
Analyze the potential collegiate connection synergy between Student A and each of the candidate profiles.

RULES:
1. Ground evaluations solely in provided data.
2. For each candidate, score their holistic synergy from 0 to 100 based on shared passions, conversational hooks, and goal alignment.
3. Provide a single concise 1-sentence synergy highlight.
4. Return ONLY a valid JSON array of objects.

Student A:
- Department: ${studentA.department}
- Interests: ${studentA.interests.join(', ')}
- Hobbies: ${studentA.hobbies.join(', ')}
- Goals: ${studentA.relationshipGoals.join(', ')}
- Bio: "${studentA.bio}"

Candidates:
${JSON.stringify(candidates, null, 2)}

JSON Schema:
[
  {
    "candidateIndex": 0,
    "synergyScore": 85,
    "synergyHighlight": "One grounded sentence highlight"
  }
]`;

  try {
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        temperature: 0.3,
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(cleanJsonOutput(response.text));
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    handleAiError(err, 'AI Discovery analysis unavailable.');
  }
};

/**
 * Generates 3 contextual, natural "what to reply" suggestions based on recent chat history and profiles
 */
export const generateReplySuggestions = async (userProfile, partnerProfile, recentMessages = []) => {
  const ai = getAiClient();
  const studentA = sanitizeForAi(userProfile);
  const studentB = sanitizeForAi(partnerProfile);

  const formattedMessages = recentMessages.slice(-8).map((m) => {
    const isFromA = m.sender.toString() === (userProfile.user?._id || userProfile.user).toString();
    const senderName = isFromA ? studentA.name : studentB.name;
    const content = m.messageType === 'image' ? '[Sent an image]' : m.content;
    return `${senderName}: "${content}"`;
  });

  const prompt = `You are the WeDate Smart Chat Assistant for university students.
Student A (${studentA.name}) is chatting with their mutual match Student B (${studentB.name}) on WeDate.
Student A wants suggestions for "What to reply" next.

Student A:
- Department: ${studentA.department}
- Interests: ${studentA.interests.join(', ') || 'Not specified'}
- Hobbies: ${studentA.hobbies.join(', ') || 'Not specified'}

Student B (Match):
- Name: ${studentB.name}
- Department: ${studentB.department} (${studentB.academicYear})
- Interests: ${studentB.interests.join(', ') || 'Not specified'}
- Hobbies: ${studentB.hobbies.join(', ') || 'Not specified'}
- Bio: "${studentB.bio}"

Recent Conversation:
${formattedMessages.length > 0 ? formattedMessages.join('\n') : '(No messages yet; conversation just started)'}

RULES:
1. Provide exactly 3 distinct, natural, conversational reply options:
   - "Flirty & Playful": witty, charming banter, light teasing or compliment.
   - "Thoughtful & Curious": insightful question or continuation showing genuine interest in what they said or shared.
   - "Casual & Chill": easygoing, relaxed, low-pressure campus chat.
2. Directly answer or react to Student B's last statement or topic. If Student B hasn't spoken yet, suggest natural starters.
3. Keep the messages sound like a real, authentic 18-24 college student (no corporate or robotic speak).
4. Return ONLY a valid JSON object matching the schema below.

JSON Schema:
{
  "replies": [
    {
      "tone": "Flirty & Playful",
      "reply": "The exact message Student A can send",
      "contextReason": "Brief note on why this reply works"
    },
    {
      "tone": "Thoughtful & Curious",
      "reply": "The exact message Student A can send",
      "contextReason": "Brief note on why this reply works"
    },
    {
      "tone": "Casual & Chill",
      "reply": "The exact message Student A can send",
      "contextReason": "Brief note on why this reply works"
    }
  ]
}`;

  try {
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        temperature: 0.6,
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(cleanJsonOutput(response.text));
    return Array.isArray(parsed.replies) ? parsed.replies : [];
  } catch (err) {
    handleAiError(err, 'Could not generate reply suggestions at this moment.');
  }
};
