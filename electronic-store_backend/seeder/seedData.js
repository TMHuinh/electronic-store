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
connectDB();

const seedData = async () => {
  try {
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
      { name: 'Vi điều khiển' },
      { name: 'Cảm biến' },
      { name: 'Module nguồn' },
      { name: 'IC - Transistor' },
      { name: 'Linh kiện thụ động' },
    ]);

    const brands = await Brand.insertMany([
      { name: 'Arduino' },
      { name: 'Espressif' },
      { name: 'STM' },
      { name: 'Texas Instruments' },
      { name: 'Raspberry Pi' },
    ]);

    const users = await User.insertMany([
      {
        name: 'Admin',
        email: 'admin@linhkien.vn',
        password: '123456',
        isAdmin: true,
      },
      {
        name: 'Nguyen Van A',
        email: 'a@linhkien.vn',
        password: '123456',
      },
    ]);

    const products = await Product.insertMany([
      {
        name: 'Arduino Uno R3',
        description:
          'Board vi điều khiển phổ biến, dễ dùng cho người mới bắt đầu.',
        price: 250000,
        category: categories[0]._id,
        brand: brands[0]._id,
        stock: 100,
        images: [
          {
            url: 'https://res.cloudinary.com/demo/image/upload/v1720000000/products/arduino_uno.jpg',
            public_id: 'products/arduino_uno',
          },
        ],
        specifications: {
          voltage: '5V',
          current: '500mA',
          size: '68.6mm x 53.4mm',
          weight: '25g',
        },
      },
      {
        name: 'Cảm biến DHT11',
        description:
          'Cảm biến đo nhiệt độ và độ ẩm, giao tiếp digital, dễ tích hợp.',
        price: 35000,
        category: categories[1]._id,
        brand: brands[2]._id,
        stock: 200,
        images: [
          {
            url: 'https://res.cloudinary.com/demo/image/upload/v1720000000/products/dht11.jpg',
            public_id: 'products/dht11',
          },
        ],
        specifications: {
          voltage: '3V-5V',
          current: '2.5mA',
          size: '15mm x 12mm',
          weight: '5g',
        },
      },
      {
        name: 'Module nguồn LM2596',
        description: 'Bộ giảm áp DC-DC có thể điều chỉnh điện áp ra.',
        price: 45000,
        category: categories[2]._id,
        brand: brands[3]._id,
        stock: 80,
        images: [
          {
            url: 'https://res.cloudinary.com/demo/image/upload/v1720000000/products/arduino_uno.jpg',
            public_id: 'products/arduino_uno',
          },
        ],
        specifications: {
          voltage: '4V-40V',
          current: '3A',
          size: '43mm x 21mm',
          weight: '12g',
        },
      },
    ]);

    await Inventory.insertMany([
      { product: products[0]._id, quantity: 100, type: 'import' },
      { product: products[1]._id, quantity: 200, type: 'import' },
      { product: products[2]._id, quantity: 80, type: 'import' },
    ]);

    await Cart.insertMany([
      {
        user: users[1]._id,
        items: [{ product: products[0]._id, quantity: 2 }],
      },
    ]);

    await Order.insertMany([
      {
        user: users[1]._id,
        products: [
          { product: products[0]._id, quantity: 1 },
          { product: products[1]._id, quantity: 3 },
        ],
        total: 355000,
        address: '123 Nguyễn Văn Linh, Đà Nẵng',
        status: 'Processing',
      },
    ]);

    await Review.insertMany([
      {
        product: products[0]._id,
        user: users[1]._id,
        rating: 5,
        comment: 'Chất lượng tốt, giao hàng nhanh!',
      },
    ]);

    console.log('✅ Đã thêm dữ liệu mẫu thành công!');
    process.exit();
  } catch (error) {
    console.error(`❌ Lỗi seed dữ liệu: ${error.message}`);
    process.exit(1);
  }
};

seedData();
