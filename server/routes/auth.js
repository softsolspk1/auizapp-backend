const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Register new user
router.post('/register', [
  body('doctorName').notEmpty().withMessage('Doctor name is required'),
  body('designation').notEmpty().withMessage('Designation is required'),
  body('specialty').notEmpty().withMessage('Specialty is required'),
  body('hospitalName').notEmpty().withMessage('Hospital name is required'),
  body('pmdcNumber').notEmpty().withMessage('PMDC number is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('phoneNumber').notEmpty().withMessage('Phone number is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { doctorName, designation, specialty, hospitalName, pmdcNumber, city, phoneNumber, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ $or: [{ email }, { pmdcNumber }] });
    if (user) {
      return res.status(400).json({ message: 'User already exists with this email or PMDC number' });
    }

    // Create new user
    user = new User({
      doctorName,
      designation,
      specialty,
      hospitalName,
      pmdcNumber,
      city,
      phoneNumber,
      email,
      password
    });

    await user.save();

    // Generate JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err) throw err;
      res.json({
        token,
        user: {
          id: user.id,
          doctorName: user.doctorName,
          email: user.email,
          isApproved: user.isApproved,
          role: user.role
        }
      });
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Login user
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').exists().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(400).json({ message: 'Account is deactivated' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err) throw err;
      res.json({
        token,
        user: {
          id: user.id,
          doctorName: user.doctorName,
          email: user.email,
          isApproved: user.isApproved,
          role: user.role,
          totalPoints: user.totalPoints
        }
      });
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;


