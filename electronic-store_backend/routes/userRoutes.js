import express from 'express';
import {
  getUsers,
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  verifyEmail,
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.get('/verify/:token', verifyEmail);
router.post('/login', loginUser);
router.get('/profile', protect, getProfile);
router.get('/', protect, admin, getUsers);
router.put('/profile', protect, updateProfile);

export default router;
