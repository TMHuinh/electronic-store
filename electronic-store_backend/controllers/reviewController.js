import Review from '../models/reviewModel.js';
import Product from '../models/productModel.js';
import Order from '../models/orderModel.js';

export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find().populate('user product', 'name email');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getReviewsByProduct = async (req, res) => {
  try {
    const reviews = await Review.find({
      product: req.params.productId,
    }).populate('user', 'name email');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createReview = async (req, res) => {
  const { rating, comment } = req.body;
  const userId = req.user._id;
  const productId = req.params.productId;

  try {
    // Kiểm tra user đã mua hàng chưa
    const hasOrdered = await Order.findOne({
      user: userId,
      'items.product': productId,
    });

    if (!hasOrdered) {
      return res
        .status(400)
        .json({ message: 'Bạn chỉ có thể đánh giá sản phẩm đã mua' });
    }

    // Tạo review
    const review = await Review.create({
      user: userId,
      product: productId,
      rating,
      comment,
    });

    // Cập nhật rating trung bình cho sản phẩm
    const reviews = await Review.find({ product: productId });
    const avgRating =
      reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
    await Product.findByIdAndUpdate(productId, {
      rating: avgRating,
      numReviews: reviews.length,
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review)
      return res.status(404).json({ message: 'Không tìm thấy review' });

    if (review.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: 'Bạn không thể sửa review của người khác' });
    }

    review.rating = req.body.rating || review.rating;
    review.comment = req.body.comment || review.comment;
    await review.save();
    const reviews = await Review.find({ product: review.product });
    const avgRating =
      reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
    await Product.findByIdAndUpdate(review.product, {
      rating: avgRating,
      numReviews: reviews.length,
    });
    res.json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review)
      return res.status(404).json({ message: 'Không tìm thấy review' });

    if (
      !req.user.isAdmin &&
      review.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Không có quyền xóa review này' });
    }

    const productId = review.product;

    // Xóa review
    await review.deleteOne();

    // 🔄 Cập nhật lại rating trung bình sản phẩm sau khi xóa
    const reviews = await Review.find({ product: productId });

    let avgRating = 0;
    if (reviews.length > 0) {
      avgRating =
        reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
    }

    await Product.findByIdAndUpdate(productId, {
      rating: avgRating,
      numReviews: reviews.length,
    });

    res.json({ message: 'Đã xóa review và cập nhật lại rating sản phẩm' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
