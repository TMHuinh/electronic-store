import Review from '../models/reviewModel.js';
import Product from '../models/productModel.js';
import Order from '../models/orderModel.js';
import mongoose from "mongoose";

// 📍 Lấy tất cả review
export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find().populate('user product', 'name email');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📍 Lấy review theo product
export const getReviewsByProduct = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name email');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📍 Tạo review mới
export const createReview = async (req, res) => {
  const { rating, comment } = req.body;
  const userId = req.user._id;
  const productId = req.params.productId;

  try {
    // 🧩 1. Kiểm tra user đã nhận hàng sản phẩm này chưa
    const hasDeliveredOrder = await Order.findOne({
      user: userId,
      status: "Delivered",
      items: {
        $elemMatch: {
          product: new mongoose.Types.ObjectId(productId),
        },
      },
    });

    if (!hasDeliveredOrder) {
      return res.status(400).json({
        message: "Bạn chỉ có thể đánh giá sản phẩm đã mua và đã nhận hàng.",
      });
    }

    // 🧩 2. Kiểm tra nếu user đã từng review sản phẩm này
    const existingReview = await Review.findOne({ user: userId, product: productId });
    if (existingReview) {
      return res.status(400).json({ message: "Bạn đã đánh giá sản phẩm này rồi." });
    }

    // 🧩 3. Tạo review mới
    const review = await Review.create({
      user: userId,
      product: productId,
      rating,
      comment,
    });

    // ✅ Populate user để hiện tên ngay sau khi tạo
    await review.populate("user", "name email");

    // 🧩 4. Cập nhật lại điểm trung bình & số lượng đánh giá
    const reviews = await Review.find({ product: productId });
    const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { rating: avgRating, numReviews: reviews.length },
      { new: true }
    );

    res.status(201).json({ review, product: updatedProduct });
  } catch (error) {
    console.error("❌ createReview error:", error);
    res.status(500).json({ message: error.message });
  }
};

// 📍 Cập nhật review
export const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Không tìm thấy review' });

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bạn không thể sửa review của người khác' });
    }

    review.rating = req.body.rating || review.rating;
    review.comment = req.body.comment || review.comment;
    await review.save();

    // Cập nhật rating trung bình
    const reviews = await Review.find({ product: review.product });
    const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
    const updatedProduct = await Product.findByIdAndUpdate(
      review.product,
      { rating: avgRating, numReviews: reviews.length },
      { new: true }
    );

    res.json({ review, product: updatedProduct });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 📍 Xóa review
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Không tìm thấy review' });

    if (!req.user.isAdmin && review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Không có quyền xóa review này' });
    }

    const productId = review.product;

    // Xóa review
    await review.deleteOne();

    // Cập nhật rating trung bình sau khi xóa
    const reviews = await Review.find({ product: productId });
    const avgRating = reviews.length
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 0;

    await Product.findByIdAndUpdate(productId, {
      rating: avgRating,
      numReviews: reviews.length,
    });

    res.json({ message: 'Đã xóa review và cập nhật lại rating sản phẩm' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const canReview = async (req, res) => {
  try {
    const userId = req.user._id;
    const productId = req.params.productId;

    const hasDeliveredOrder = await Order.findOne({
      user: userId,
      status: "Delivered",
      items: { $elemMatch: { product: productId } },
    });

    res.json({ canReview: !!hasDeliveredOrder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
