import { verifyToken } from '../config/jwt.js';
import User from '../models/User.js';
import Profile from '../models/Profile.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    // Check Authorization header or cookies
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in to access this resource.'
      });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session token. Please log in again.'
      });
    }

    const user = await User.findById(decoded.userId);
    if (!user || user.status === 'deleted') {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.'
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'This account has been suspended for safety violations.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const requireVerified = (req, res, next) => {
  if (req.user) {
    req.user.isVerified = true;
  }
  next();
};

export const requireCompletedProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });
    if (!profile || !profile.isCompleted) {
      return res.status(403).json({
        success: false,
        code: 'PROFILE_INCOMPLETE',
        message: 'Please complete your onboarding profile before continuing.'
      });
    }
    req.profile = profile;
    next();
  } catch (error) {
    next(error);
  }
};
