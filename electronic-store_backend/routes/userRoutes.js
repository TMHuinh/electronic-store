import express from 'express';
import {
  getUsers,
  registerUser,
  loginUser,
  getProfile,
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getProfile);
router.get('/', protect, admin, getUsers);

export default router;
