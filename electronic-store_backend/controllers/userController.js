import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

const usedTokens = new Set();

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const registerUser = async (req, res) => {
  const { name, email, password, phone, address } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email đã được sử dụng" });

    const encodedData = Buffer.from(
      JSON.stringify({
        name,
        email,
        password,
        phone,
        address,
      })
    ).toString("base64");

    const verifyUrl = `${process.env.FRONTEND_URL}/verify/${encodedData}`;

    const message = `
      <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f5f6fa; padding: 30px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background-color: #28a745; color: white; padding: 20px 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; letter-spacing: 1px;">HUINH Store</h1>
          </div>

          <!-- Body -->
          <div style="padding: 30px 40px;">
            <h2 style="color: #333; font-size: 20px;">Xin chào ${name},</h2>
            <p style="color: #555; font-size: 15px; line-height: 1.6;">
              Cảm ơn bạn đã đăng ký tài khoản tại <strong>HUINH Store</strong>.<br/>
              Vui lòng nhấn nút bên dưới để xác thực email và hoàn tất quá trình đăng ký:
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${verifyUrl}" 
                style="background-color: #28a745; color: white; padding: 12px 28px; 
                font-size: 16px; border-radius: 6px; text-decoration: none; 
                display: inline-block; font-weight: 600;">
                Xác thực tài khoản
              </a>
            </div>

            <p style="color: #777; font-size: 14px; line-height: 1.6;">
              Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.<br/>
              Liên kết xác thực có hiệu lực trong vòng <strong>24 giờ</strong>.
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #f1f3f6; color: #888; text-align: center; padding: 15px; font-size: 13px;">
            © 2025 HUINH Store. Mọi quyền được bảo lưu.<br/>
            <a href="https://huinh.vn" style="color: #28a745; text-decoration: none;">huinh.vn</a>
          </div>
        </div>
      </div>
    `;

    try {
      await sendEmail(email, "Xác thực tài khoản cho HUINH Store", message);

      return res.status(200).json({
        success: true,
        message:
          "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.",
      });
    } catch (emailError) {
      console.error("❌ Lỗi gửi email:", emailError);
      return res.status(500).json({
        success: false,
        message: "Không thể gửi email xác thực. Vui lòng thử lại sau.",
      });
    }
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Lỗi khi đăng ký: " + error.message });
  }
};

export const verifyEmail = async (req, res) => {
  const token = req.params.token;
  const now = new Date().toISOString();

  console.log("=== VERIFY REQUEST START ===");
  console.log("🕒 Thời gian:", now);
  console.log("📦 Token (50 ký tự đầu):", token ? token.slice(0, 50) : null);
  console.log("🌐 IP:", req.ip || req.connection?.remoteAddress);
  console.log("🧭 User-Agent:", req.get("User-Agent"));
  console.log("🔗 Referer:", req.get("referer"));
  console.log("============================\n");

  const ua = (req.get("User-Agent") || "").toLowerCase();
  if (
    ua.includes("google") ||
    ua.includes("proxy") ||
    ua.includes("crawler") ||
    ua.includes("bot") ||
    ua.includes("preview")
  ) {
    console.log("🚫 Phát hiện prefetch / bot UA:", ua);
    return res.status(200).json({
      message:
        "Hệ thống phát hiện truy cập tự động (prefetch). Vui lòng mở liên kết trong trình duyệt thật để xác thực tài khoản.",
    });
  }
  await new Promise((r) => setTimeout(r, 1000));

  try {
    const decoded = JSON.parse(Buffer.from(token, "base64").toString("utf8"));

    const { name, email, password, phone, address } = decoded;

    console.log("✅ Đã giải mã token cho:", email);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("⚠️ Email đã tồn tại:", email);
      return res
        .status(400)
        .json({ message: "Email này đã được xác thực trước đó." });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      address,
      isVerified: true,
    });

    console.log("🎉 Tạo tài khoản thành công cho:", email);

    res.status(201).json({
      message: "Xác thực thành công! Tài khoản của bạn đã được tạo.",
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });

    console.log("=== VERIFY REQUEST END ===\n");
  } catch (error) {
    console.error("❌ Lỗi khi xác thực:", error);
    res
      .status(400)
      .json({ message: "Liên kết xác thực không hợp lệ hoặc đã hết hạn." });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Sai email hoặc mật khẩu" });

    if (!user.isVerified)
      return res.status(403).json({ message: "Tài khoản chưa xác thực email" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: "Sai email hoặc mật khẩu" });

    res.json({
      message: "Đăng nhập thành công",
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User không tồn tại" });

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    user.address = req.body.address || user.address;

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();

    res.json({
      message: "Cập nhật thành công",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
