import express from 'express';
import {
  getReviews,
  getReviewsByProduct,
  createReview,
  updateReview,
  deleteReview,
} from '../controllers/reviewController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, admin, getReviews);

router.get('/product/:productId', getReviewsByProduct);

router.post('/product/:productId', protect, createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

export default router;
