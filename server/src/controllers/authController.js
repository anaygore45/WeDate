import {
  registerUser,
  verifyEmailToken,
  resendVerificationEmail,
  loginUser,
  requestPasswordReset,
  resetPasswordWithToken
} from '../services/authService.js';
import Profile from '../models/Profile.js';
import User from '../models/User.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

export const register = async (req, res, next) => {
  try {
    const { email, password, name, dateOfBirth, gender, department, academicYear } = req.body;
    if (!email || !password || !name || !dateOfBirth) {
      return res.status(400).json({
        success: false,
        message: 'Name, student email, password, and date of birth are required.'
      });
    }

    const result = await registerUser({
      email,
      password,
      name,
      dateOfBirth,
      gender,
      department,
      academicYear
    });

    res.cookie('token', result.token, COOKIE_OPTIONS);

    res.status(201).json({
      success: true,
      message: 'Account created successfully. Please verify your campus email address.',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const token = req.query.token || req.body.token;
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required.'
      });
    }

    const user = await verifyEmailToken(token);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully. Welcome to the WeDate verified community!'
    });
  } catch (error) {
    next(error);
  }
};

export const resendVerification = async (req, res, next) => {
  try {
    await resendVerificationEmail(req.user._id);
    res.status(200).json({
      success: true,
      message: 'A fresh verification link has been sent to your student email address.'
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const result = await loginUser({ email, password });
    res.cookie('token', result.token, COOKIE_OPTIONS);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  res.clearCookie('token', COOKIE_OPTIONS);
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your registered student email address.'
      });
    }

    await requestPasswordReset(email);
    res.status(200).json({
      success: true,
      message: 'If an active account exists with that email, a password reset link has been dispatched.'
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Reset token and new password are required.'
      });
    }

    await resetPasswordWithToken(token, newPassword);
    res.status(200).json({
      success: true,
      message: 'Your password has been reset successfully. You may now log in.'
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const profile = await Profile.findOne({ user: req.user._id });

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          isVerified: user.isVerified,
          status: user.status,
          notificationPreferences: user.notificationPreferences,
          privacySettings: user.privacySettings
        },
        profile
      }
    });
  } catch (error) {
    next(error);
  }
};
