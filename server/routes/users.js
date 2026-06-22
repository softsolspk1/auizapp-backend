const express = require('express');
const prisma = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

const excludePassword = {
  id: true,
  doctorName: true,
  designation: true,
  specialty: true,
  hospitalName: true,
  pmdcNumber: true,
  city: true,
  phoneNumber: true,
  email: true,
  isApproved: true,
  isActive: true,
  role: true,
  totalPoints: true,
  gamesPlayed: true,
  correctAnswers: true,
  wrongAnswers: true,
  lastLogin: true,
  createdAt: true,
  updatedAt: true
};

// Get all users (admin only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const users = await prisma.user.findMany({
      select: excludePassword,
      orderBy: { createdAt: 'desc' }
    });
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

    const users = await prisma.user.findMany({
      where: { isApproved: false },
      select: excludePassword,
      orderBy: { createdAt: 'desc' }
    });
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

    const id = parseInt(req.params.id);
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isApproved: true },
      select: excludePassword
    });

    res.json({ message: 'User approved successfully', user: updatedUser });
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

    const id = parseInt(req.params.id);
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: excludePassword
    });

    res.json({ message: 'User deactivated successfully', user: updatedUser });
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

    const id = parseInt(req.params.id);
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive: true },
      select: excludePassword
    });

    res.json({ message: 'User activated successfully', user: updatedUser });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Change user role (admin only)
router.put('/:id/role', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { role } = req.body;
    if (!['user', 'subadmin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const id = parseInt(req.params.id);
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent changing admin's role
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot change admin role' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: excludePassword
    });

    res.json({ message: 'User role updated successfully', user: updatedUser });
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

    const [totalUsers, approvedUsers, pendingUsers, activeUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isApproved: true } }),
      prisma.user.count({ where: { isApproved: false } }),
      prisma.user.count({ where: { isActive: true } })
    ]);

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
    const { mode, designation, city, hospital, quizName } = req.query;

    let userFilter = { isApproved: true, isActive: true };
    if (designation) userFilter.designation = { contains: designation, mode: 'insensitive' };
    if (city) userFilter.city = { contains: city, mode: 'insensitive' };
    if (hospital) userFilter.hospitalName = { contains: hospital, mode: 'insensitive' };

    // If mode or quizName is provided, calculate points dynamically from QuizSession
    if (mode || quizName) {
      let sessionFilter = { isCompleted: true };
      if (mode) sessionFilter.gameMode = mode;
      
      if (quizName) {
        // Assuming quizName matches the category name for single/multiplayer, or wardName for PIN
        sessionFilter.OR = [
          { category: { name: { contains: quizName, mode: 'insensitive' } } },
          { pin: { contains: quizName, mode: 'insensitive' } } // Approximate matching for ward if PIN is used
        ];
      }

      // Fetch all valid sessions for approved/active users
      const sessions = await prisma.quizSession.findMany({
        where: {
          ...sessionFilter,
          user: userFilter
        },
        select: { userId: true, score: true }
      });

      // Aggregate scores per user
      const userScores = {};
      sessions.forEach(s => {
        userScores[s.userId] = (userScores[s.userId] || 0) + s.score;
      });

      const userIds = Object.keys(userScores).map(Number);
      if (userIds.length === 0) return res.json([]);

      // Get users
      const users = await prisma.user.findMany({
        where: { id: { in: userIds }, ...userFilter },
        select: {
          id: true,
          doctorName: true,
          specialty: true,
          hospitalName: true,
          city: true,
          designation: true
        }
      });

      const leaderboard = users.map(u => ({
        ...u,
        totalPoints: userScores[u.id] || 0
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 50);

      return res.json(leaderboard);
    }

    // Default global leaderboard
    const users = await prisma.user.findMany({
      where: userFilter,
      select: {
        id: true,
        doctorName: true,
        specialty: true,
        hospitalName: true,
        city: true,
        designation: true,
        totalPoints: true,
        gamesPlayed: true,
        correctAnswers: true,
        wrongAnswers: true
      },
      orderBy: { totalPoints: 'desc' },
      take: 50
    });

    res.json(users);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
