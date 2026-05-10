const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Product = require('../models/Product');

// Get all products for the shop
router.get('/', authMiddleware, async (req, res) => {
  try {
    const products = await Product.find({ shop: req.shopId, isActive: true });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get low stock products
router.get('/low-stock', authMiddleware, async (req, res) => {
  try {
    const lowStockProducts = await Product.aggregate([
      { $match: { shop: require('mongoose').Types.ObjectId(req.shopId), isActive: true } },
      { $addFields: { isLowStock: { $lte: ['$currentStock', '$minStockLevel'] } } },
      { $match: { isLowStock: true } }
    ]);
    
    res.json(lowStockProducts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add new product
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, category, unit, costPrice, sellingPrice, currentStock, minStockLevel, reorderQuantity } = req.body;

    if (!name || !category || !costPrice || !sellingPrice) {
      return res.status(400).json({ message: 'Name, category, cost price, and selling price are required' });
    }

    const product = new Product({
      shop: req.shopId,
      name,
      category,
      unit: unit || 'pcs',
      costPrice,
      sellingPrice,
      currentStock: currentStock || 0,
      minStockLevel: minStockLevel || 10,
      reorderQuantity: reorderQuantity || 50
    });

    await product.save();
    res.status(201).json({ message: 'Product added successfully', product });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update product
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, shop: req.shopId },
      req.body,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product updated successfully', product });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete product (soft delete)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, shop: req.shopId },
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
