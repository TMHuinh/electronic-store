import Review from '../models/reviewModel.js';

export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find().populate('user product');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createReview = async (req, res) => {
  const { user, product, rating, comment } = req.body;
  try {
    const review = await Review.create({ user, product, rating, comment });
    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
