import Cart from '../models/cartModel.js';

export const getCarts = async (req, res) => {
  try {
    const carts = await Cart.find().populate('user products.product');
    res.json(carts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCart = async (req, res) => {
  const { user, products } = req.body;
  try {
    const cart = await Cart.create({ user, products });
    res.status(201).json(cart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateCart = async (req, res) => {
  try {
    const cart = await Cart.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!cart)
      return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });
    res.json(cart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteCart = async (req, res) => {
  try {
    await Cart.findByIdAndDelete(req.params.id);
    res.json({ message: 'Đã xóa giỏ hàng' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
