import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import brandRoutes from './routes/brandRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import orrderRoutes from './routes/orderRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express());

app.use('/api/users', userRoutes);
app.use('/api/categorys', categoryRoutes);
app.use('/api/orders', orrderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/carts', cartRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/brands', brandRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Srever running on port ${PORT}`));
