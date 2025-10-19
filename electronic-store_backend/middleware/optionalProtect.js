import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const optionalProtect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return next();

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Gắn toàn bộ user info nếu cần
    const user = await User.findById(decoded.id).select("-password");
    if (user) req.user = user;
    next();
  } catch (error) {
    next();
  }
};
