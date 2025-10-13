import Brand from '../models/brandModel.js';

export const getBrands = async (req, res) => {
  try {
    const brands = await Brand.find();
    res.json(brands);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBrandById = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand)
      return res.status(404).json({ message: 'Không tìm thấy thương hiệu' });
    res.json(brand);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createBrand = async (req, res) => {
  const { name, logo, description, country } = req.body;
  try {
    const brand = await Brand.create({ name, logo, description, country });
    res.status(201).json(brand);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateBrand = async (req, res) => {
  try {
    const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!brand)
      return res.status(404).json({ message: 'Không tìm thấy thương hiệu' });
    res.json(brand);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand)
      return res.status(404).json({ message: 'Không tìm thấy thương hiệu' });

    await brand.deleteOne();
    res.json({ message: 'Đã xóa thương hiệu' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
