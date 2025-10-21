import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';

export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product', 'name price');
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createOrder = async (req, res) => {
  try {
    const { user, items, address, paymentMethod } = req.body;

    // Lấy giá sản phẩm từ DB và map vào items
    const itemsWithPrice = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findById(item.product);
        if (!product) throw new Error('Sản phẩm không tồn tại');
        return {
          product: product._id,
          quantity: item.quantity,
          price: product.price, // lưu giá tại thời điểm đặt
        };
      })
    );

    // Tính tổng tiền
    const total = itemsWithPrice.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0
    );

    const order = await Order.create({
      user,
      items: itemsWithPrice,
      total,
      address,
      paymentMethod,
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!order)
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    res.status(200).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    await order.deleteOne();
    res.json({ message: 'Đã xóa đơn hàng' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate({
        path: 'items.product',
        select: 'name price images',
        strictPopulate: false,
      });

    if (!orders || orders.length === 0) {
      return res.status(200).json([]);
    }

    const formattedOrders = orders.map((order) => ({
      _id: order._id,
      items: order.items.map((item) => ({
        productId: item.product?._id || null,
        name: item.product?.name || 'Sản phẩm đã xóa',
        price: item.price,
        quantity: item.quantity,
        image: item.product?.images?.[0]?.url || '/no-image.png',
      })),
      total: order.total,
      address: order.address,
      paymentMethod: order.paymentMethod,
      status: order.status,
      createdAt: order.createdAt,
    }));

    res.json(formattedOrders);
  } catch (error) {
    console.error('❌ Lỗi GET /myorders:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate({
        path: 'items.product',
        select: 'name price images',
        strictPopulate: false,
      });

    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

    // Format order để frontend dùng an toàn
    const formattedOrder = {
      _id: order._id,
      items: order.items.map((item) => ({
        productId: item.product?._id || null,
        name: item.product?.name || 'Sản phẩm đã xóa',
        price: item.price ?? 0,
        quantity: item.quantity ?? 0,
        image: item.product?.images?.[0]?.url || '/no-image.png',
      })),
      total: order.total ?? 0,
      address: order.address || '',
      paymentMethod: order.paymentMethod || 'COD',
      status: order.status || 'Processing',
      createdAt: order.createdAt,
    };

    res.json(formattedOrder);
  } catch (error) {
    console.error('❌ Lỗi GET /orders/:id', error);
    res.status(500).json({ message: error.message });
  }
};