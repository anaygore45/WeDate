import express from 'express';
import {
  getMyProfile,
  updateMyProfile,
  getProfileById,
  uploadProfilePhoto,
  deleteProfilePhoto,
  setPrimaryPhoto,
  toggleVisibility
} from '../controllers/profileController.js';
import { protect, requireVerified } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.use(protect);

router.get('/me', getMyProfile);
router.patch('/me', requireVerified, updateMyProfile);
router.post('/photos', requireVerified, upload.single('photo'), uploadProfilePhoto);
router.delete('/photos/:photoId', requireVerified, deleteProfilePhoto);
router.patch('/photos/:photoId/primary', requireVerified, setPrimaryPhoto);
router.patch('/visibility', requireVerified, toggleVisibility);
router.get('/:id', requireVerified, getProfileById);

export default router;
