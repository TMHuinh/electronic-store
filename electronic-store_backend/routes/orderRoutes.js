import express from 'express';
import {
  getOrders,
  createOrder,
  updateOrder,
  deleteOrder,
  getMyOrders,
  getOrderById,
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createOrder);

router.get('/', protect, admin, getOrders);
router.put('/:id', protect, admin, updateOrder);
router.delete('/:id', protect, admin, deleteOrder);
router.get('/myorders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);

export default router;
