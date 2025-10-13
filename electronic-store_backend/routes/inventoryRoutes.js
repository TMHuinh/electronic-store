import express from 'express';
import {
  getInventory,
  addInventory,
  deleteInventory,
} from '../controllers/inventoryController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// 📦 Quản lý kho chỉ dành cho admin
router.get('/', protect, admin, getInventory);
router.post('/', protect, admin, addInventory);
router.delete('/:id', protect, admin, deleteInventory);

export default router;
