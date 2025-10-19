import express from 'express';
import multer from 'multer';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { optionalProtect } from '../middleware/optionalProtect.js';


const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.get('/', getProducts);
router.get('/:id', optionalProtect, getProductById);
router.post('/', protect, admin, upload.array('images', 5), createProduct);
router.put('/:id', protect, admin, upload.array('images', 5), updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

export default router;
