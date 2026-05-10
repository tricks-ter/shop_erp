const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  unit: { type: String, default: 'pcs' }, // pcs, kg, liter, etc.
  costPrice: { type: Number, required: true }, // Price from supplier SR
  sellingPrice: { type: Number, required: true }, // Price to customers
  currentStock: { type: Number, default: 0 },
  minStockLevel: { type: Number, default: 10 }, // Alert when stock goes below this
  reorderQuantity: { type: Number, default: 50 }, // Suggested order quantity
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Product', productSchema);
