const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Shop = require('../models/Shop');

// Register a new shop (for multi-tenant support)
router.post('/register', async (req, res) => {
  try {
    const { name, owner, location, phone, email } = req.body;

    // Validate required fields
    if (!name || !owner || !location) {
      return res.status(400).json({ message: 'Name, owner, and location are required' });
    }

    // Create new shop
    const shop = new Shop({
      name,
      owner,
      location,
      phone,
      email
    });

    await shop.save();

    // Generate JWT token
    const token = jwt.sign(
      { shopId: shop._id, owner: shop.owner },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Shop registered successfully',
      shop: {
        id: shop._id,
        name: shop.name,
        owner: shop.owner,
        location: shop.location
      },
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login for existing shop
router.post('/login', async (req, res) => {
  try {
    const { shopId, owner } = req.body;

    const shop = await Shop.findOne({ _id: shopId, owner });

    if (!shop) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!shop.isActive) {
      return res.status(403).json({ message: 'Shop account is deactivated' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { shopId: shop._id, owner: shop.owner },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      shop: {
        id: shop._id,
        name: shop.name,
        owner: shop.owner,
        location: shop.location
      },
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
