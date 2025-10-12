import express from 'express';
import {
  getInventory,
  addInventory,
} from '../controllers/inventoryController.js';
const router = express.Router();

router.get('/', getInventory);
router.post('/', addInventory);

export default router;
