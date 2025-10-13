import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

export const protect = async (req, res, next) => {
  let token;

  // Lấy token từ header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Giải mã token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Lấy user từ token (trừ password)
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error('❌ Token không hợp lệ:', error);
      res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }
  }

  if (!token) {
    res
      .status(401)
      .json({ message: 'Không có token, quyền truy cập bị từ chối' });
  }
};

// Middleware cho admin
export const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: 'Chỉ admin mới được phép truy cập' });
  }
};
