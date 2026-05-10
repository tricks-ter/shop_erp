const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String },
  totalDue: { type: Number, default: 0 },
  creditLimit: { type: Number, default: 10000 }, // Maximum credit allowed
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Customer', customerSchema);
