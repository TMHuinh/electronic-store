import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: Number,
        price: Number,
      },
    ],
    total: { type: Number, required: true },
    address: { type: String, required: true },
    paymentMethod: { type: String, default: 'COD' },
    status: {
      type: String,
      enum: ['Processing', 'Shipped', 'Delivered', 'Canceled'],
      default: 'Processing',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);
