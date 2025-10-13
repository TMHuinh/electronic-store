import express from 'express';
import {
  getUsers,
  registerUser,
  loginUser,
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Private route — chỉ admin mới được xem danh sách user
router.get('/', protect, admin, getUsers);

export default router;
