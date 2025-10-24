import express from 'express';
import {
  getReviews,
  getReviewsByProduct,
  createReview,
  updateReview,
  deleteReview,
  canReview,
} from '../controllers/reviewController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, admin, getReviews);

router.get('/product/:productId', getReviewsByProduct);

router.post('/product/:productId', protect, createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);
router.get('/can-review/:productId', protect, canReview);

export default router;
