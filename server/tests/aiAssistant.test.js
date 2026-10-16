import { isAiConfigured, sanitizeForAi } from '../src/services/aiAssistantService.js';
import express from 'express';
import request from 'supertest';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../src/config/db.js';
import User from '../src/models/User.js';
import Profile from '../src/models/Profile.js';
import Match from '../src/models/Match.js';
import Block from '../src/models/Block.js';
import app from '../src/app.js';
import { signToken } from '../src/config/jwt.js';

describe('WeDate Smart Connection Assistant — AI Service & Privacy Tests', () => {
  let userToken;
  let testUser;
  let testProfile;
  let partnerUser;
  let partnerProfile;
  let mutualMatch;

  beforeAll(async () => {
    process.env.MONGODB_URI = 'memory';
    process.env.ALLOWED_EMAIL_DOMAIN = 'campus.edu';
    process.env.JWT_SECRET = 'test_jwt_secret_key_12345';
    delete process.env.GEMINI_API_KEY; // Ensure clean unconfigured state for baseline tests

    await connectDB();
  }, 120_000);

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Profile.deleteMany({});
    await Match.deleteMany({});
    await Block.deleteMany({});

    // Create primary verified student
    testUser = await User.create({
      email: 'student.primary@campus.edu',
      password: 'WeDatePass123!',
      isVerified: true,
      status: 'active'
    });

    testProfile = await Profile.create({
      user: testUser._id,
      name: 'Primary Student',
      dateOfBirth: new Date('2003-05-10'),
      gender: 'Man',
      department: 'Computer Engineering',
      academicYear: 'Third Year (TE)',
      bio: 'Loves building indie apps, acoustic guitar, and local campus coffee.',
      interests: ['Coding', 'Music', 'Design'],
      hobbies: ['Cafe Hopping', 'Guitar / Jamming', 'Reading'],
      relationshipGoals: ['Long-term relationship'],
      languages: ['English', 'Hindi'],
      photos: [{ url: 'https://images.unsplash.com/photo-1', isPrimary: true }],
      isCompleted: true,
      isVisible: true
    });

    // Create partner verified student
    partnerUser = await User.create({
      email: 'student.partner@campus.edu',
      password: 'WeDatePass123!',
      isVerified: true,
      status: 'active'
    });

    partnerProfile = await Profile.create({
      user: partnerUser._id,
      name: 'Partner Student',
      dateOfBirth: new Date('2004-03-22'),
      gender: 'Woman',
      department: 'Information Technology',
      academicYear: 'Third Year (TE)',
      bio: 'UI designer who loves cafe hopping and film photography.',
      interests: ['Design', 'Photography', 'Coding'],
      hobbies: ['Cafe Hopping', 'Reading'],
      relationshipGoals: ['Long-term relationship'],
      languages: ['English', 'Marathi'],
      photos: [{ url: 'https://images.unsplash.com/photo-2', isPrimary: true }],
      isCompleted: true,
      isVisible: true
    });

    // Generate JWT token using application config
    userToken = signToken({ userId: testUser._id, email: testUser.email });
  });

  describe('Configuration & Privacy Sanitization Unit Tests', () => {
    test('isAiConfigured returns false when GEMINI_API_KEY is not set', () => {
      delete process.env.GEMINI_API_KEY;
      expect(isAiConfigured()).toBe(false);
    });

    test('isAiConfigured returns true when GEMINI_API_KEY has valid non-empty string', () => {
      process.env.GEMINI_API_KEY = 'AIzaSyFakeKeyTest12345';
      expect(isAiConfigured()).toBe(true);
      delete process.env.GEMINI_API_KEY;
    });

    test('sanitizeForAi strictly strips email, tokens, passwords, and database IDs', () => {
      const fullProfile = {
        _id: new mongoose.Types.ObjectId(),
        user: testUser._id,
        email: 'secret.email@campus.edu',
        passwordHash: '$2a$12$fakeHash1234567890',
        name: 'Aarav Sharma',
        department: 'Computer Engineering',
        academicYear: 'Final Year',
        bio: 'Coding and coffee lover',
        interests: ['Coding', 'Design'],
        hobbies: ['Reading'],
        relationshipGoals: ['Long-term relationship'],
        languages: ['English', 'Hindi'],
        photos: [{ url: 'https://images.unsplash.com/photo-1' }],
        verificationToken: 'secret_token_123',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const sanitized = sanitizeForAi(fullProfile);

      expect(sanitized.name).toBe('Aarav Sharma');
      expect(sanitized.department).toBe('Computer Engineering');
      expect(sanitized.interests).toEqual(['Coding', 'Design']);
      expect(sanitized.email).toBeUndefined();
      expect(sanitized.passwordHash).toBeUndefined();
      expect(sanitized.verificationToken).toBeUndefined();
      expect(sanitized._id).toBeUndefined();
      expect(sanitized.user).toBeUndefined();
      expect(sanitized.photos).toBeUndefined();
    });
  });

  describe('AI Endpoints Security, Blocking & Authorization', () => {
    test('GET /api/ai/status reports unconfigured state gracefully without errors', async () => {
      const res = await request(app).get('/api/ai/status');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isConfigured).toBe(false);
      expect(res.body.data.provider).toBe('Google Gemini');
    });

    test('POST /api/ai/explain requires authentication token', async () => {
      const res = await request(app)
        .post('/api/ai/explain')
        .send({ candidateUserId: partnerUser._id });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test('POST /api/ai/icebreakers fails if users do not have an active mutual match', async () => {
      // Create a fake match id not involving users
      const randomMatchId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .post('/api/ai/icebreakers')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ matchId: randomMatchId });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('only available for confirmed, active mutual matches');
    });

    test('POST /api/ai/explain rejects analysis if users have blocked each other', async () => {
      // Create block record
      await Block.create({
        blocker: testUser._id,
        blocked: partnerUser._id,
        reason: 'Privacy test'
      });

      const res = await request(app)
        .post('/api/ai/explain')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ candidateUserId: partnerUser._id });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('privacy settings');
    });

    test('POST /api/ai/icebreakers rejects analysis if partner is blocked', async () => {
      // Create active match
      const pairKey = [testUser._id.toString(), partnerUser._id.toString()].sort().join('_');
      mutualMatch = await Match.create({
        users: [testUser._id, partnerUser._id],
        pairKey,
        isActive: true
      });

      // But partner blocked user
      await Block.create({
        blocker: partnerUser._id,
        blocked: testUser._id,
        reason: 'Privacy block'
      });

      const res = await request(app)
        .post('/api/ai/icebreakers')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ matchId: mutualMatch._id });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Unable to generate starters');
    });

    test('POST /api/ai/enhance-bio returns 503 AI_NOT_CONFIGURED when API key is missing', async () => {
      delete process.env.GEMINI_API_KEY;

      const res = await request(app)
        .post('/api/ai/enhance-bio')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ currentBio: 'Looking to meet study buddies and coffee fans.' });

      expect(res.status).toBe(503);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Gemini API key is not configured');
    });
  });
});
