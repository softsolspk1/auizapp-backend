const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Get pending users (admin only)
router.get('/pending', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const users = await User.find({ isApproved: false }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Approve user (admin only)
router.put('/:id/approve', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isApproved = true;
    await user.save();

    res.json({ message: 'User approved successfully', user });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Deactivate user (admin only)
router.put('/:id/deactivate', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = false;
    await user.save();

    res.json({ message: 'User deactivated successfully', user });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Activate user (admin only)
router.put('/:id/activate', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = true;
    await user.save();

    res.json({ message: 'User activated successfully', user });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Get user statistics
router.get('/stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const totalUsers = await User.countDocuments();
    const approvedUsers = await User.countDocuments({ isApproved: true });
    const pendingUsers = await User.countDocuments({ isApproved: false });
    const activeUsers = await User.countDocuments({ isActive: true });

    res.json({
      totalUsers,
      approvedUsers,
      pendingUsers,
      activeUsers
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Get user leaderboard
router.get('/leaderboard', auth, async (req, res) => {
  try {
    const users = await User.find({ isApproved: true, isActive: true })
      .select('doctorName specialty hospitalName totalPoints gamesPlayed correctAnswers wrongAnswers')
      .sort({ totalPoints: -1 })
      .limit(50);

    res.json(users);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;


