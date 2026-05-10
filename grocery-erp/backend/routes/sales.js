const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const authMiddleware = require('../middleware/auth');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Ledger = require('../models/Ledger');

// Record a new sale
router.post('/', authMiddleware, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { customerId, items, paymentStatus, paidAmount } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'At least one item is required' });
    }

    let totalAmount = 0;
    let totalCost = 0;
    let saleItems = [];

    // Process each item
    for (const item of items) {
      const product = await Product.findById(item.productId).session(session);

      if (!product) {
        await session.abortTransaction();
        return res.status(404).json({ message: `Product ${item.productId} not found` });
      }

      if (product.currentStock < item.quantity) {
        await session.abortTransaction();
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Available: ${product.currentStock}, Requested: ${item.quantity}` 
        });
      }

      const profit = (item.quantity * item.sellingPrice) - (item.quantity * item.costPrice);
      
      saleItems.push({
        product: product._id,
        quantity: item.quantity,
        costPrice: item.costPrice,
        sellingPrice: item.sellingPrice,
        profit: profit
      });

      totalAmount += item.quantity * item.sellingPrice;
      totalCost += item.quantity * item.costPrice;

      // Decrease stock
      product.currentStock -= item.quantity;
      await product.save({ session });
    }

    const totalProfit = totalAmount - totalCost;
    const dueAmount = totalAmount - (paidAmount || totalAmount);

    // Create sale record
    const sale = new Sale({
      shop: req.shopId,
      customer: customerId || null,
      items: saleItems,
      totalAmount,
      totalCost,
      totalProfit,
      paymentStatus: paymentStatus || (dueAmount > 0 ? 'partial' : 'paid'),
      paidAmount: paidAmount || totalAmount,
      dueAmount
    });

    await sale.save({ session });

    // Update customer ledger if customer is provided
    if (customerId && dueAmount > 0) {
      // Update customer total due
      await Customer.findByIdAndUpdate(
        customerId,
        { $inc: { totalDue: dueAmount } },
        { session }
      );

      // Add ledger entry
      const ledger = new Ledger({
        shop: req.shopId,
        customer: customerId,
        type: 'sale',
        amount: dueAmount,
        balanceAfter: dueAmount,
        description: `Sale on credit - Invoice #${sale._id}`,
        reference: sale._id
      });
      await ledger.save({ session });
    }

    await session.commitTransaction();
    res.status(201).json({ message: 'Sale recorded successfully', sale });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: 'Server error', error: error.message });
  } finally {
    session.endSession();
  }
});

// Get all sales with filters
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate, customerId } = req.query;
    
    let query = { shop: req.shopId };
    
    if (startDate && endDate) {
      query.saleDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (customerId) {
      query.customer = customerId;
    }

    const sales = await Sale.find(query)
      .populate('customer', 'name phone')
      .populate('items.product', 'name')
      .sort({ saleDate: -1 });

    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get sales analytics
router.get('/analytics/summary', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let matchStage = { shop: mongoose.Types.ObjectId(req.shopId) };
    
    if (startDate && endDate) {
      matchStage.saleDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const analytics = await Sale.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$totalAmount' },
          totalCost: { $sum: '$totalCost' },
          totalProfit: { $sum: '$totalProfit' },
          totalTransactions: { $sum: 1 }
        }
      }
    ]);

    res.json(analytics[0] || {
      totalSales: 0,
      totalCost: 0,
      totalProfit: 0,
      totalTransactions: 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get top selling products
router.get('/analytics/top-products', authMiddleware, async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const topProducts = await Sale.aggregate([
      { $match: { shop: mongoose.Types.ObjectId(req.shopId) } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalQuantitySold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.sellingPrice'] } },
          totalProfit: { $sum: '$items.profit' }
        }
      },
      { $sort: { totalQuantitySold: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          productId: '$_id',
          productName: '$product.name',
          category: '$product.category',
          totalQuantitySold: 1,
          totalRevenue: 1,
          totalProfit: 1
        }
      }
    ]);

    res.json(topProducts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get sales trend (daily/weekly/monthly)
router.get('/analytics/trend', authMiddleware, async (req, res) => {
  try {
    const { period = 'daily', days = 30 } = req.query;
    
    const dateGrouping = {
      daily: { $dateToString: { format: '%Y-%m-%d', date: '$saleDate' } },
      weekly: { $dateToString: { format: '%Y-W%V', date: '$saleDate' } },
      monthly: { $dateToString: { format: '%Y-%m', date: '$saleDate' } }
    };

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - parseInt(days));

    const trend = await Sale.aggregate([
      {
        $match: {
          shop: mongoose.Types.ObjectId(req.shopId),
          saleDate: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: dateGrouping[period],
          totalSales: { $sum: '$totalAmount' },
          totalProfit: { $sum: '$totalProfit' },
          transactions: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(trend);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
