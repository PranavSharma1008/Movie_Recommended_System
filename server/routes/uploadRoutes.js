import express from 'express';
import { uploadAvatarFile } from '../controllers/uploadController.js';
import { uploadAvatar } from '../middleware/uploadMiddleware.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/avatar', optionalAuth, uploadAvatar.single('avatar'), uploadAvatarFile);

export default router;
