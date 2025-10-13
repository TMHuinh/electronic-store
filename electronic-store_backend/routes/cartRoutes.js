import express from 'express';
import {
  getMyCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  syncCart,
} from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// 🛒 Các route yêu cầu user đăng nhập
router.get('/', protect, getMyCart);
router.post('/', protect, addToCart);
router.put('/', protect, updateQuantity);
router.delete('/clear', protect, clearCart);
router.delete('/:productId', protect, removeFromCart);
router.post('/sync', protect, syncCart);

export default router;
