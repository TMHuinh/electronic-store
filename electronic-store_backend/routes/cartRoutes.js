import express from 'express';
import {
  getCarts,
  createCart,
  updateCart,
  deleteCart,
} from '../controllers/cartController.js';
const router = express.Router();

router.get('/', getCarts);
router.post('/', createCart);
router.put('/:id', updateCart);
router.delete('/:id', deleteCart);

export default router;
