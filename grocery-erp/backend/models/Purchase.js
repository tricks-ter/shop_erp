const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  supplier: { type: String, default: 'SR' }, // Your main supplier
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    costPrice: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  paymentStatus: { 
    type: String, 
    enum: ['paid', 'pending'], 
    default: 'pending' 
  },
  purchaseDate: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Purchase', purchaseSchema);
