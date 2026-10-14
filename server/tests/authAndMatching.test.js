import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../src/config/db.js';
import User from '../src/models/User.js';
import Profile from '../src/models/Profile.js';
import Swipe from '../src/models/Swipe.js';
import Match from '../src/models/Match.js';
import Chat from '../src/models/Chat.js';
import Block from '../src/models/Block.js';

import { registerUser, isAllowedEmailDomain } from '../src/services/authService.js';
import { recordSwipe } from '../src/services/matchingService.js';
import { blockUser } from '../src/services/safetyService.js';

describe('WeDate Authentication, Matching & Safety Integration', () => {
  beforeAll(async () => {
    process.env.MONGODB_URI = 'memory';
    process.env.ALLOWED_EMAIL_DOMAIN = 'campus.edu';
    await connectDB();
  }, 120_000);

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Profile.deleteMany({});
    await Swipe.deleteMany({});
    await Match.deleteMany({});
    await Chat.deleteMany({});
    await Block.deleteMany({});
  });

  describe('Student Domain Verification & Age Validation', () => {
    test('strictly validates student domain from environment variable', () => {
      expect(isAllowedEmailDomain('student@campus.edu')).toBe(true);
      expect(isAllowedEmailDomain('student@sub.campus.edu')).toBe(true);
      expect(isAllowedEmailDomain('hacker@randomgmail.com')).toBe(false);
      expect(isAllowedEmailDomain('user@unauthorized.edu')).toBe(false);
    });

    test('rejects registration with disallowed email domain', async () => {
      await expect(
        registerUser({
          email: 'test@unauthorized.com',
          password: 'Password123!',
          name: 'Unauthorized User',
          dateOfBirth: '2002-05-10',
          gender: 'Man'
        })
      ).rejects.toThrow(/Registration is restricted/);
    });

    test('rejects registration for underage users (< 18 years)', async () => {
      const today = new Date();
      const underageDob = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());

      await expect(
        registerUser({
          email: 'underage@campus.edu',
          password: 'Password123!',
          name: 'Underage Student',
          dateOfBirth: underageDob.toISOString(),
          gender: 'Woman'
        })
      ).rejects.toThrow(/at least 18 years of age/);
    });

    test('registers valid adult student with hashed password', async () => {
      const result = await registerUser({
        email: 'valid.student@campus.edu',
        password: 'SecurePassword123!',
        name: 'Valid Student',
        dateOfBirth: '2003-01-15',
        gender: 'Woman',
        department: 'Computer Engineering',
        academicYear: 'Third Year (TE)'
      });

      expect(result.user.email).toBe('valid.student@campus.edu');
      expect(result.token).toBeDefined();

      const userInDb = await User.findById(result.user.id).select('+password');
      expect(userInDb.password).not.toBe('SecurePassword123!');
      const passwordMatches = await userInDb.comparePassword('SecurePassword123!');
      expect(passwordMatches).toBe(true);
    });
  });

  describe('Mutual Matching & Swipe Invariance', () => {
    let user1, user2;

    beforeEach(async () => {
      user1 = await User.create({
        email: 'user1@campus.edu',
        password: 'Password123!',
        isVerified: true
      });
      await Profile.create({
        user: user1._id,
        name: 'User One',
        dateOfBirth: new Date('2002-01-01'),
        gender: 'Man',
        department: 'Engineering',
        academicYear: 'Third Year (TE)',
        photos: [{ url: 'https://example.com/p1.jpg', isPrimary: true }],
        isVisible: true,
        isCompleted: true
      });

      user2 = await User.create({
        email: 'user2@campus.edu',
        password: 'Password123!',
        isVerified: true
      });
      await Profile.create({
        user: user2._id,
        name: 'User Two',
        dateOfBirth: new Date('2003-01-01'),
        gender: 'Woman',
        department: 'Information Technology',
        academicYear: 'Second Year (SE)',
        photos: [{ url: 'https://example.com/p2.jpg', isPrimary: true }],
        isVisible: true,
        isCompleted: true
      });
    });

    test('single like persists but does NOT create a match', async () => {
      const res = await recordSwipe(user1._id, user2._id, 'like');
      expect(res.action).toBe('like');
      expect(res.isMatch).toBe(false);

      const matchesCount = await Match.countDocuments({});
      expect(matchesCount).toBe(0);
    });

    test('reciprocal like generates exactly one active mutual match & chat', async () => {
      // User 1 likes User 2
      await recordSwipe(user1._id, user2._id, 'like');

      // User 2 likes User 1 (reciprocal)
      const res = await recordSwipe(user2._id, user1._id, 'like');
      expect(res.isMatch).toBe(true);
      expect(res.matchId).toBeDefined();
      expect(res.chatId).toBeDefined();

      const matches = await Match.find({});
      expect(matches.length).toBe(1);
      expect(matches[0].isActive).toBe(true);

      const chat = await Chat.findOne({ match: matches[0]._id });
      expect(chat).toBeDefined();
      expect(chat.participants.map(String)).toContain(user1._id.toString());
      expect(chat.participants.map(String)).toContain(user2._id.toString());
    });

    test('prevents swiping on self', async () => {
      await expect(recordSwipe(user1._id, user1._id, 'like')).rejects.toThrow(
        /cannot swipe on your own profile/
      );
    });

    test('blocking a user deactivates mutual match and prevents interaction', async () => {
      // Establish mutual match
      await recordSwipe(user1._id, user2._id, 'like');
      await recordSwipe(user2._id, user1._id, 'like');

      let activeMatch = await Match.findOne({ isActive: true });
      expect(activeMatch).toBeDefined();

      // User 1 blocks User 2
      await blockUser(user1._id, user2._id);

      // Match is deactivated
      const matchAfterBlock = await Match.findById(activeMatch._id);
      expect(matchAfterBlock.isActive).toBe(false);
      expect(matchAfterBlock.deactivatedBy.toString()).toBe(user1._id.toString());

      // Subsequent swipe attempt is blocked
      await expect(recordSwipe(user2._id, user1._id, 'like')).rejects.toThrow(
        /cannot be performed on this profile/
      );
    });
  });
});
