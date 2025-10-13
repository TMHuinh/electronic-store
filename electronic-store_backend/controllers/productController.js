import Product from '../models/productModel.js';
import cloudinary from '../config/cloudinary.js';

export const getProducts = async (req, res) => {
  try {
    const { category, brand, min, max, keyword } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (brand) filter.brand = brand;
    if (keyword) filter.name = { $regex: keyword, $options: 'i' };
    if (min || max) {
      filter.price = {};
      if (min) filter.price.$gte = Number(min);
      if (max) filter.price.$lte = Number(max);
    }

    const products = await Product.find(filter)
      .populate('category brand')
      .sort({ createdAt: -1 });

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      'category brand'
    );
    if (!product)
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, brand, stock } = req.body;
    const files = req.files;

    const imageUploads = await Promise.all(
      files.map((file) =>
        cloudinary.uploader.upload(file.path, { folder: 'products' })
      )
    );

    const images = imageUploads.map((img) => ({
      url: img.secure_url,
      public_id: img.public_id,
    }));

    const product = await Product.create({
      name,
      description,
      price,
      category,
      brand,
      stock,
      images,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });

    const { name, description, price, category, brand, stock } = req.body;
    if (req.files && req.files.length > 0) {
      // Xóa ảnh cũ trên Cloudinary
      for (const img of product.images) {
        await cloudinary.uploader.destroy(img.public_id);
      }

      // Upload ảnh mới
      const newUploads = await Promise.all(
        req.files.map((file) =>
          cloudinary.uploader.upload(file.path, { folder: 'products' })
        )
      );
      product.images = newUploads.map((u) => ({
        url: u.secure_url,
        public_id: u.public_id,
      }));
    }

    Object.assign(product, {
      name,
      description,
      price,
      category,
      brand,
      stock,
    });
    const updatedProduct = await product.save();

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });

    for (const img of product.images) {
      await cloudinary.uploader.destroy(img.public_id);
    }

    await product.deleteOne();
    res.json({ message: 'Đã xóa sản phẩm & ảnh trên Cloudinary' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
