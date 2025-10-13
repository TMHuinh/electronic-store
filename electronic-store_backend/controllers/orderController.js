import Order from '../models/orderModel.js';

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
    const { user, items, total, address, paymentMethod, status } = req.body;

    const order = await Order.create({
      user,
      items,
      total,
      address,
      paymentMethod,
      status,
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
