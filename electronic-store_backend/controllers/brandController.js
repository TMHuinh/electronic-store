import Brand from '../models/brandModel.js';

export const getBrands = async (req, res) => {
  try {
    const brands = await Brand.find();
    res.json(brands);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createBrand = async (req, res) => {
  const { name, country } = req.body;
  try {
    const brand = await Brand.create({ name, country });
    res.status(201).json(brand);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
