import Profile from '../models/Profile.js';
import Block from '../models/Block.js';
import { uploadMedia, deleteMedia } from '../services/mediaService.js';

export const getMyProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }
    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

export const updateMyProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }

    const updatableFields = [
      'name',
      'gender',
      'genderPreference',
      'department',
      'academicYear',
      'bio',
      'interests',
      'hobbies',
      'relationshipGoals',
      'height',
      'languages',
      'socialLinks',
      'filterPreferences'
    ];

    for (const field of updatableFields) {
      if (req.body[field] !== undefined) {
        profile[field] = req.body[field];
      }
    }

    await profile.save();
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

export const getProfileById = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;

    // Check if blocked in either direction
    const isBlocked = await Block.findOne({
      $or: [
        { blocker: req.user._id, blocked: targetUserId },
        { blocker: targetUserId, blocked: req.user._id }
      ]
    });

    if (isBlocked) {
      return res.status(404).json({
        success: false,
        message: 'Profile is not available.'
      });
    }

    const profile = await Profile.findOne({ user: targetUserId });
    if (!profile || (!profile.isVisible && targetUserId.toString() !== req.user._id.toString())) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found or currently hidden.'
      });
    }

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

export const uploadProfilePhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No photo file provided.' });
    }

    const profile = await Profile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }

    if (profile.photos.length >= 6) {
      return res.status(400).json({ success: false, message: 'Maximum of 6 photos allowed.' });
    }

    const uploadResult = await uploadMedia(
      req.file.buffer,
      req.file.originalname,
      'wedate/profiles'
    );

    const isFirst = profile.photos.length === 0;

    profile.photos.push({
      url: uploadResult.url,
      publicId: uploadResult.publicId,
      isPrimary: isFirst,
      caption: req.body.caption || ''
    });

    await profile.save();

    res.status(201).json({
      success: true,
      message: 'Photo uploaded successfully.',
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProfilePhoto = async (req, res, next) => {
  try {
    const { photoId } = req.params;
    const profile = await Profile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }

    const photoIndex = profile.photos.findIndex((p) => p._id.toString() === photoId);
    if (photoIndex === -1) {
      return res.status(404).json({ success: false, message: 'Photo not found.' });
    }

    const [deletedPhoto] = profile.photos.splice(photoIndex, 1);

    // Delete remote/local file
    if (deletedPhoto.publicId) {
      await deleteMedia(deletedPhoto.publicId, deletedPhoto.url);
    }

    // If deleted photo was primary, assign first remaining as primary
    if (deletedPhoto.isPrimary && profile.photos.length > 0) {
      profile.photos[0].isPrimary = true;
    }

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Photo removed successfully.',
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

export const setPrimaryPhoto = async (req, res, next) => {
  try {
    const { photoId } = req.params;
    const profile = await Profile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }

    let found = false;
    for (const photo of profile.photos) {
      if (photo._id.toString() === photoId) {
        photo.isPrimary = true;
        found = true;
      } else {
        photo.isPrimary = false;
      }
    }

    if (!found) {
      return res.status(404).json({ success: false, message: 'Photo not found.' });
    }

    await profile.save();
    res.status(200).json({
      success: true,
      message: 'Primary photo updated.',
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

export const toggleVisibility = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }

    profile.isVisible = req.body.isVisible !== undefined ? req.body.isVisible : !profile.isVisible;
    await profile.save();

    res.status(200).json({
      success: true,
      message: `Profile is now ${profile.isVisible ? 'visible' : 'hidden'} from discovery.`,
      data: { isVisible: profile.isVisible }
    });
  } catch (error) {
    next(error);
  }
};
