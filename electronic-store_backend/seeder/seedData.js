import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';

import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import Category from '../models/categoryModel.js';
import Brand from '../models/brandModel.js';
import Cart from '../models/cartModel.js';
import Order from '../models/orderModel.js';
import Review from '../models/reviewModel.js';
import Inventory from '../models/inventoryModel.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    console.log('🧹 Xóa dữ liệu cũ...');
    await Promise.all([
      User.deleteMany(),
      Product.deleteMany(),
      Category.deleteMany(),
      Brand.deleteMany(),
      Cart.deleteMany(),
      Order.deleteMany(),
      Review.deleteMany(),
      Inventory.deleteMany(),
    ]);

    console.log('🌱 Thêm dữ liệu mẫu...');

    const categories = await Category.insertMany([
      { name: 'Smartphones' },
      { name: 'Laptops' },
      { name: 'Accessories' },
    ]);

    const brands = await Brand.insertMany([
      { name: 'Apple' },
      { name: 'Samsung' },
      { name: 'Dell' },
    ]);

    const users = await User.insertMany([
      { name: 'Admin', email: 'admin@example.com', password: '123456' },
      { name: 'John Doe', email: 'john@example.com', password: '123456' },
    ]);

    const products = await Product.insertMany([
      {
        name: 'iPhone 15',
        description: 'Latest iPhone model with A17 chip',
        price: 1200,
        category: categories[0]._id,
        brand: brands[0]._id,
        stock: 50,
      },
      {
        name: 'Samsung Galaxy S24',
        description: 'High-end Android smartphone',
        price: 999,
        category: categories[0]._id,
        brand: brands[1]._id,
        stock: 60,
      },
    ]);

    await Inventory.insertMany([
      { product: products[0]._id, quantity: 50, type: 'import' },
      { product: products[1]._id, quantity: 60, type: 'import' },
    ]);

    await Cart.insertMany([
      {
        user: users[1]._id,
        items: [{ product: products[0]._id, quantity: 1 }],
      },
    ]);

    await Order.insertMany([
      {
        user: users[0]._id,
        products: [
          { product: products[0]._id, quantity: 2 },
          { product: products[1]._id, quantity: 1 },
        ],
        total: 200000,
        address: '123 Nguyễn Văn Linh, Đà Nẵng',
        status: 'Processing',
      },
    ]);

    await Review.insertMany([
      {
        product: products[0]._id,
        user: users[1]._id,
        rating: 5,
        comment: 'Tuyệt vời, rất đáng tiền!',
      },
    ]);

    console.log('✅ Dữ liệu mẫu đã được thêm thành công!');
    process.exit();
  } catch (error) {
    console.error('❌ Lỗi seed dữ liệu:', error);
    process.exit(1);
  }
};

seedData();
