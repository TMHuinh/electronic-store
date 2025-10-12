import Inventory from '../models/inventoryModel.js';

export const getInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find().populate('product');
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addInventory = async (req, res) => {
  const { product, quantity, type } = req.body;
  try {
    const record = await Inventory.create({ product, quantity, type });
    res.status(201).json(record);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
