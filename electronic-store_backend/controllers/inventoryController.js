import Inventory from '../models/inventoryModel.js';
import Product from '../models/productModel.js';

export const getInventory = async (req, res) => {
  try {
    const records = await Inventory.find().populate('product');
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ➕ Thêm một bản ghi nhập/xuất kho
 * Nếu type = import → tăng tồn kho
 * Nếu type = export → giảm tồn kho
 */
export const addInventory = async (req, res) => {
  const { product, quantity, type, note } = req.body;

  try {
    // ✅ Kiểm tra sản phẩm tồn tại
    const productDoc = await Product.findById(product);
    if (!productDoc)
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });

    // ✅ Tạo bản ghi inventory
    const record = await Inventory.create({
      product,
      quantity,
      type,
      note,
    });

    // ✅ Cập nhật tồn kho sản phẩm
    if (type === 'import') {
      productDoc.stock += quantity;
    } else if (type === 'export') {
      if (productDoc.stock < quantity) {
        return res
          .status(400)
          .json({ message: 'Số lượng xuất vượt quá tồn kho hiện có' });
      }
      productDoc.stock -= quantity;
    }

    await productDoc.save();

    res.status(201).json({
      message: 'Đã thêm bản ghi kho và cập nhật tồn kho sản phẩm',
      record,
      updatedStock: productDoc.stock,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteInventory = async (req, res) => {
  try {
    const record = await Inventory.findById(req.params.id);
    if (!record)
      return res.status(404).json({ message: 'Không tìm thấy bản ghi kho' });

    await record.deleteOne();
    res.json({ message: 'Đã xóa bản ghi kho' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
