const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' }, // Optional for walk-in customers
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    costPrice: { type: Number, required: true }, // Snapshot of cost at time of sale
    sellingPrice: { type: Number, required: true }, // Snapshot of selling price
    profit: { type: Number, required: true } // Calculated profit per item
  }],
  totalAmount: { type: Number, required: true },
  totalCost: { type: Number, required: true },
  totalProfit: { type: Number, required: true },
  paymentStatus: { 
    type: String, 
    enum: ['paid', 'pending', 'partial'], 
    default: 'paid' 
  },
  paidAmount: { type: Number, default: 0 },
  dueAmount: { type: Number, default: 0 },
  saleDate: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Sale', saleSchema);
