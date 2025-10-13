import Cart from '../models/cartModel.js';
import Product from '../models/productModel.js';

/**
 * 🛒 Lấy giỏ hàng hiện tại của user
 */
export const getMyCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      'items.product'
    );
    res.json(cart || { user: req.user._id, items: [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ➕ Thêm sản phẩm vào giỏ hàng
 */
export const addToCart = async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product)
      return res.status(404).json({ message: 'Sản phẩm không tồn tại' });

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = new Cart({ user: req.user._id, items: [] });

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    const updatedCart = await cart.populate('items.product');
    res.json(updatedCart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * ♻️ Cập nhật số lượng sản phẩm trong giỏ
 */
export const updateQuantity = async (req, res) => {
  const { productId, quantity } = req.body;

  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart)
      return res.status(404).json({ message: 'Giỏ hàng không tồn tại' });

    const item = cart.items.find((i) => i.product.toString() === productId);
    if (!item)
      return res
        .status(404)
        .json({ message: 'Sản phẩm không có trong giỏ hàng' });

    if (quantity <= 0) {
      cart.items = cart.items.filter((i) => i.product.toString() !== productId);
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    const updatedCart = await cart.populate('items.product');
    res.json(updatedCart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * ❌ Xóa 1 sản phẩm khỏi giỏ hàng
 */
export const removeFromCart = async (req, res) => {
  const { productId } = req.params;
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Chưa có giỏ hàng' });

    cart.items = cart.items.filter((i) => i.product.toString() !== productId);
    await cart.save();

    const updatedCart = await cart.populate('items.product');
    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * 🧹 Xóa toàn bộ giỏ hàng
 */
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart)
      return res.status(404).json({ message: 'Không có giỏ hàng để xóa' });

    cart.items = [];
    await cart.save();
    res.json({ message: 'Đã xóa toàn bộ giỏ hàng' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * 🔄 Đồng bộ giỏ hàng localStorage (khi đăng nhập)
 */
export const syncCart = async (req, res) => {
  const { localCart } = req.body; // [{ productId, quantity }]
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = new Cart({ user: req.user._id, items: [] });

    localCart.forEach((localItem) => {
      const existing = cart.items.find(
        (i) => i.product.toString() === localItem.productId
      );
      if (existing) existing.quantity += localItem.quantity;
      else
        cart.items.push({
          product: localItem.productId,
          quantity: localItem.quantity,
        });
    });

    await cart.save();
    const updatedCart = await cart.populate('items.product');
    res.json(updatedCart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
