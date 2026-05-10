const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema({
  shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  type: { 
    type: String, 
    enum: ['sale', 'payment', 'adjustment'], 
    required: true 
  },
  amount: { type: Number, required: true }, // Positive for dues, negative for payments
  balanceAfter: { type: Number, required: true },
  description: { type: String },
  reference: { type: mongoose.Schema.Types.ObjectId }, // Reference to Sale or Payment
  transactionDate: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Ledger', ledgerSchema);
