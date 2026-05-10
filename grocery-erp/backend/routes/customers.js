const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const authMiddleware = require('../middleware/auth');
const Customer = require('../models/Customer');
const Ledger = require('../models/Ledger');

// Get all customers for the shop
router.get('/', authMiddleware, async (req, res) => {
  try {
    const customers = await Customer.find({ shop: req.shopId, isActive: true });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add new customer
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, phone, address, creditLimit } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: 'Name and phone are required' });
    }

    const customer = new Customer({
      shop: req.shopId,
      name,
      phone,
      address,
      creditLimit: creditLimit || 10000
    });

    await customer.save();
    res.status(201).json({ message: 'Customer added successfully', customer });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get customer ledger
router.get('/:id/ledger', authMiddleware, async (req, res) => {
  try {
    const ledger = await Ledger.find({ 
      shop: req.shopId, 
      customer: req.params.id 
    }).sort({ transactionDate: -1 });

    res.json(ledger);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Record payment from customer
router.post('/:id/payment', authMiddleware, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { amount, description } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid payment amount is required' });
    }

    const customer = await Customer.findById(req.params.id).session(session);

    if (!customer) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Update customer total due
    customer.totalDue = Math.max(0, customer.totalDue - amount);
    await customer.save({ session });

    // Add ledger entry (negative amount for payment)
    const ledger = new Ledger({
      shop: req.shopId,
      customer: customer._id,
      type: 'payment',
      amount: -amount,
      balanceAfter: customer.totalDue,
      description: description || 'Payment received'
    });
    await ledger.save({ session });

    await session.commitTransaction();
    res.json({ message: 'Payment recorded successfully', customer, ledger });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: 'Server error', error: error.message });
  } finally {
    session.endSession();
  }
});

// Get customers with outstanding dues
router.get('/dues/outstanding', authMiddleware, async (req, res) => {
  try {
    const customers = await Customer.find({ 
      shop: req.shopId, 
      totalDue: { $gt: 0 },
      isActive: true 
    }).sort({ totalDue: -1 });

    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
