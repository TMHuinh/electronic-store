import multer from 'multer';

// Lưu file tạm vào ổ đĩa (Cloudinary sẽ đọc từ đây)
const storage = multer.diskStorage({});

const upload = multer({ storage });

export default upload;
