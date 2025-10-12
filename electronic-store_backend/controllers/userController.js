import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const registerUser = async (req, res) => {
  const { name, email, password, phone, address } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashed,
      phone,
      address,
    });
    res.status(201).json({ message: 'Đăng ký thành công', user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Sai email hoặc mật khẩu' });
    }
    res.json({ message: 'Đăng nhập thành công', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
