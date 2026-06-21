const express = require('express');
const User = require('../models/User');
const QuizSession = require('../models/QuizSession');
const Question = require('../models/Question');
const Category = require('../models/Category');
const auth = require('../middleware/auth');

const router = express.Router();

// Get overall analytics (admin only)
router.get('/overview', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const [
      totalUsers,
      approvedUsers,
      totalQuestions,
      totalSessions,
      completedSessions,
      totalPoints
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isApproved: true }),
      Question.countDocuments(),
      QuizSession.countDocuments(),
      QuizSession.countDocuments({ isCompleted: true }),
      User.aggregate([
        { $group: { _id: null, total: { $sum: '$totalPoints' } } }
      ])
    ]);

    res.json({
      totalUsers,
      approvedUsers,
      pendingUsers: totalUsers - approvedUsers,
      totalQuestions,
      totalSessions,
      completedSessions,
      totalPointsEarned: totalPoints[0]?.total || 0
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Get user activity analytics
router.get('/user-activity', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const [
      newUsers,
      activeUsers,
      sessionsByDay
    ] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: startDate } }),
      User.countDocuments({ lastLogin: { $gte: startDate } }),
      QuizSession.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    res.json({
      newUsers,
      activeUsers,
      sessionsByDay
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Get category performance analytics
router.get('/category-performance', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const categoryStats = await Category.aggregate([
      {
        $lookup: {
          from: 'questions',
          localField: '_id',
          foreignField: 'category',
          as: 'questions'
        }
      },
      {
        $lookup: {
          from: 'quizsessions',
          localField: '_id',
          foreignField: 'category',
          as: 'sessions'
        }
      },
      {
        $project: {
          name: 1,
          description: 1,
          questionCount: { $size: '$questions' },
          sessionCount: { $size: '$sessions' },
          completedSessions: {
            $size: {
              $filter: {
                input: '$sessions',
                cond: { $eq: ['$$this.isCompleted', true] }
              }
            }
          },
          averageScore: {
            $avg: {
              $map: {
                input: {
                  $filter: {
                    input: '$sessions',
                    cond: { $eq: ['$$this.isCompleted', true] }
                  }
                },
                as: 'session',
                in: '$$session.score'
              }
            }
          }
        }
      },
      { $sort: { sessionCount: -1 } }
    ]);

    res.json(categoryStats);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Get question performance analytics
router.get('/question-performance', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { categoryId, limit = 20 } = req.query;
    let matchQuery = {};

    if (categoryId) {
      matchQuery.category = categoryId;
    }

    const questionStats = await Question.aggregate([
      { $match: matchQuery },
      {
        $project: {
          question: 1,
          category: 1,
          difficulty: 1,
          timesAnswered: 1,
          correctCount: 1,
          successRate: {
            $cond: {
              if: { $eq: ['$timesAnswered', 0] },
              then: 0,
              else: { $multiply: [{ $divide: ['$correctCount', '$timesAnswered'] }, 100] }
            }
          }
        }
      },
      { $sort: { timesAnswered: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      }
    ]);

    res.json(questionStats);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Get top performers
router.get('/top-performers', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { limit = 10 } = req.query;

    const topPerformers = await User.find({ isApproved: true, isActive: true })
      .select('doctorName specialty hospitalName totalPoints gamesPlayed correctAnswers wrongAnswers')
      .sort({ totalPoints: -1 })
      .limit(parseInt(limit));

    res.json(topPerformers);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Get game mode statistics
router.get('/game-mode-stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const gameModeStats = await QuizSession.aggregate([
      {
        $group: {
          _id: '$gameMode',
          totalSessions: { $sum: 1 },
          completedSessions: {
            $sum: { $cond: [{ $eq: ['$isCompleted', true] }, 1, 0] }
          },
          averageScore: {
            $avg: {
              $cond: [{ $eq: ['$isCompleted', true] }, '$score', null]
            }
          },
          totalPoints: {
            $sum: {
              $cond: [{ $eq: ['$isCompleted', true] }, '$score', 0]
            }
          }
        }
      }
    ]);

    res.json(gameModeStats);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Get user's personal analytics
router.get('/personal', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const [
      totalSessions,
      completedSessions,
      categoryStats,
      recentSessions
    ] = await Promise.all([
      QuizSession.countDocuments({ userId: req.user.id }),
      QuizSession.countDocuments({ userId: req.user.id, isCompleted: true }),
      QuizSession.aggregate([
        { $match: { userId: req.user.id, isCompleted: true } },
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'categoryInfo'
          }
        },
        {
          $group: {
            _id: '$category',
            categoryName: { $first: { $arrayElemAt: ['$categoryInfo.name', 0] } },
            sessionsPlayed: { $sum: 1 },
            averageScore: { $avg: '$score' },
            bestScore: { $max: '$score' }
          }
        },
        { $sort: { sessionsPlayed: -1 } }
      ]),
      QuizSession.find({ userId: req.user.id, isCompleted: true })
        .populate('category', 'name')
        .sort({ completedAt: -1 })
        .limit(5)
    ]);

    const accuracy = user.correctAnswers + user.wrongAnswers > 0 
      ? (user.correctAnswers / (user.correctAnswers + user.wrongAnswers) * 100).toFixed(2)
      : 0;

    res.json({
      totalPoints: user.totalPoints,
      gamesPlayed: user.gamesPlayed,
      correctAnswers: user.correctAnswers,
      wrongAnswers: user.wrongAnswers,
      accuracy: parseFloat(accuracy),
      totalSessions,
      completedSessions,
      categoryStats,
      recentSessions
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;


