const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: String, required: true },
  location: { type: String, required: true },
  phone: { type: String },
  email: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Shop', shopSchema);
