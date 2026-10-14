import crypto from 'crypto';
import User from '../models/User.js';
import Profile from '../models/Profile.js';
import { signToken } from '../config/jwt.js';
import { sendVerificationEmail, sendPasswordResetEmail } from './emailService.js';

export const isAllowedEmailDomain = (email = '') => {
  const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN || 'campus.edu';
  if (!allowedDomain || allowedDomain === '*') return true;

  const normalized = email.trim().toLowerCase();
  const domainPart = normalized.split('@')[1];
  if (!domainPart) return false;

  const cleanAllowed = allowedDomain.trim().toLowerCase().replace(/^@/, '');
  return domainPart === cleanAllowed || domainPart.endsWith(`.${cleanAllowed}`);
};

export const registerUser = async ({ email, password, name, dateOfBirth, gender, department, academicYear }) => {
  const normalizedEmail = email.trim().toLowerCase();

  // Validate allowed student community domain
  if (!isAllowedEmailDomain(normalizedEmail)) {
    const allowed = process.env.ALLOWED_EMAIL_DOMAIN || 'campus.edu';
    throw new Error(`Registration is restricted to verified student accounts ending in @${allowed}`);
  }

  // Check duplicate
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new Error('An account with this email address already exists.');
  }

  // Validate DOB & derive age server-side (minimum 18 years)
  const dob = new Date(dateOfBirth);
  if (isNaN(dob.getTime())) {
    throw new Error('Invalid date of birth provided.');
  }

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  if (age < 18) {
    throw new Error('You must be at least 18 years of age to register for WeDate.');
  }

  // Create User
  const user = new User({
    email: normalizedEmail,
    password
  });

  const rawVerificationToken = user.createEmailVerificationToken();
  await user.save();

  // Create initial Profile
  const profile = new Profile({
    user: user._id,
    name: name.trim(),
    dateOfBirth: dob,
    gender: gender || 'Woman',
    department: department || 'Engineering',
    academicYear: academicYear || 'First Year (FE)'
  });
  await profile.save();

  // Send verification email
  try {
    await sendVerificationEmail(normalizedEmail, rawVerificationToken, name);
  } catch (err) {
    console.warn('[Email] Warning: could not send verification email:', err.message);
  }

  const token = signToken({ userId: user._id, email: user.email });

  return {
    user: {
      id: user._id,
      email: user.email,
      isVerified: user.isVerified,
      status: user.status
    },
    profile,
    token
  };
};

export const verifyEmailToken = async (rawToken) => {
  if (!rawToken) {
    throw new Error('Verification token is missing.');
  }

  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  const user = await User.findOne({
    verificationToken: hashedToken,
    verificationTokenExpires: { $gt: Date.now() }
  }).select('+verificationToken +verificationTokenExpires');

  if (!user) {
    throw new Error('Invalid or expired email verification link. Please request a new one.');
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  await user.save();

  return user;
};

export const resendVerificationEmail = async (userId) => {
  const user = await User.findById(userId).select('+verificationTokenExpires');
  if (!user) throw new Error('User not found.');
  if (user.isVerified) throw new Error('Account email is already verified.');

  const profile = await Profile.findOne({ user: user._id });
  const name = profile ? profile.name : 'Student';

  const rawToken = user.createEmailVerificationToken();
  await user.save();

  await sendVerificationEmail(user.email, rawToken, name);
  return true;
};

export const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail }).select('+password');
  if (!user || user.status === 'deleted') {
    throw new Error('Invalid email or password.');
  }

  if (user.status === 'suspended') {
    throw new Error('This account has been suspended for safety violations.');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error('Invalid email or password.');
  }

  const profile = await Profile.findOne({ user: user._id });
  const token = signToken({ userId: user._id, email: user.email });

  return {
    user: {
      id: user._id,
      email: user.email,
      isVerified: user.isVerified,
      status: user.status,
      notificationPreferences: user.notificationPreferences,
      privacySettings: user.privacySettings
    },
    profile,
    token
  };
};

export const requestPasswordReset = async (email) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user || user.status !== 'active') {
    // Avoid revealing account existence for security
    return true;
  }

  const profile = await Profile.findOne({ user: user._id });
  const name = profile ? profile.name : 'Student';

  const rawToken = user.createPasswordResetToken();
  await user.save();

  try {
    await sendPasswordResetEmail(user.email, rawToken, name);
  } catch (err) {
    console.warn('[Email] Warning: could not send reset email:', err.message);
  }

  return true;
};

export const resetPasswordWithToken = async (rawToken, newPassword) => {
  if (!rawToken) throw new Error('Reset token is missing.');
  if (!newPassword || newPassword.length < 8) {
    throw new Error('New password must be at least 8 characters long.');
  }

  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() }
  }).select('+resetPasswordToken +resetPasswordExpires');

  if (!user) {
    throw new Error('Invalid or expired password reset token.');
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return true;
};
