import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    type: { type: String, enum: ['import', 'export'], required: true },
    quantity: { type: Number, required: true },
    note: String,
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('Inventory', inventorySchema);
