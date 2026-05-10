const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const authMiddleware = require('../middleware/auth');
const Purchase = require('../models/Purchase');
const Product = require('../models/Product');

// Record a new purchase from supplier
router.post('/', authMiddleware, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { supplier, items, paymentStatus } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'At least one item is required' });
    }

    let totalAmount = 0;
    let purchaseItems = [];

    // Process each item
    for (const item of items) {
      const product = await Product.findById(item.productId).session(session);

      if (!product) {
        await session.abortTransaction();
        return res.status(404).json({ message: `Product ${item.productId} not found` });
      }

      purchaseItems.push({
        product: product._id,
        quantity: item.quantity,
        costPrice: item.costPrice
      });

      totalAmount += item.quantity * item.costPrice;

      // Increase stock
      product.currentStock += item.quantity;
      
      // Update cost price if changed
      if (item.costPrice !== product.costPrice) {
        product.costPrice = item.costPrice;
      }
      
      await product.save({ session });
    }

    // Create purchase record
    const purchase = new Purchase({
      shop: req.shopId,
      supplier: supplier || 'SR',
      items: purchaseItems,
      totalAmount,
      paymentStatus: paymentStatus || 'pending'
    });

    await purchase.save({ session });

    await session.commitTransaction();
    res.status(201).json({ message: 'Purchase recorded successfully', purchase });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: 'Server error', error: error.message });
  } finally {
    session.endSession();
  }
});

// Get all purchases
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate, supplier } = req.query;
    
    let query = { shop: req.shopId };
    
    if (startDate && endDate) {
      query.purchaseDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (supplier) {
      query.supplier = supplier;
    }

    const purchases = await Purchase.find(query)
      .populate('items.product', 'name')
      .sort({ purchaseDate: -1 });

    res.json(purchases);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
