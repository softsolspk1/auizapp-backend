const express = require('express');
const Question = require('../models/Question');
const QuizSession = require('../models/QuizSession');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Start new quiz session
router.post('/start', auth, async (req, res) => {
  try {
    const { categoryId, totalQuestions = 10, gameMode = 'single' } = req.body;

    // Get random questions from category
    const questions = await Question.aggregate([
      { $match: { category: categoryId, isActive: true } },
      { $sample: { size: parseInt(totalQuestions) } }
    ]);

    if (questions.length === 0) {
      return res.status(400).json({ message: 'No questions available in this category' });
    }

    // Create quiz session
    const quizSession = new QuizSession({
      userId: req.user.id,
      category: categoryId,
      questions: questions.map(q => ({
        questionId: q._id
      })),
      totalQuestions: questions.length,
      gameMode
    });

    await quizSession.save();

    // Return questions without correct answers
    const questionsForUser = questions.map(q => ({
      id: q._id,
      question: q.question,
      options: q.options,
      difficulty: q.difficulty
    }));

    res.json({
      sessionId: quizSession._id,
      questions: questionsForUser,
      totalQuestions: questions.length
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Submit quiz answers
router.post('/submit', auth, async (req, res) => {
  try {
    const { sessionId, answers } = req.body;

    const quizSession = await QuizSession.findById(sessionId)
      .populate('questions.questionId')
      .populate('category', 'name');

    if (!quizSession) {
      return res.status(404).json({ message: 'Quiz session not found' });
    }

    if (quizSession.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (quizSession.isCompleted) {
      return res.status(400).json({ message: 'Quiz already completed' });
    }

    let score = 0;
    let correctAnswers = 0;
    let wrongAnswers = 0;
    const pointMultiplier = quizSession.gameMode === 'multiplayer' ? 2 : 1;

    // Process each answer
    for (let i = 0; i < quizSession.questions.length; i++) {
      const questionData = quizSession.questions[i];
      const userAnswer = answers[i];
      
      questionData.userAnswer = userAnswer.answer;
      questionData.timeSpent = userAnswer.timeSpent || 0;

      const isCorrect = userAnswer.answer === questionData.questionId.correctAnswer;
      questionData.isCorrect = isCorrect;

      if (isCorrect) {
        correctAnswers++;
        score += 10 * pointMultiplier;
      } else {
        wrongAnswers++;
        score -= 5; // Always deduct 5 points for wrong answers
      }

      // Update question statistics
      await Question.findByIdAndUpdate(questionData.questionId._id, {
        $inc: {
          timesAnswered: 1,
          correctCount: isCorrect ? 1 : 0
        }
      });
    }

    // Update quiz session
    quizSession.score = Math.max(0, score); // Ensure score doesn't go below 0
    quizSession.correctAnswers = correctAnswers;
    quizSession.wrongAnswers = wrongAnswers;
    quizSession.timeSpent = answers.reduce((total, answer) => total + (answer.timeSpent || 0), 0);
    quizSession.isCompleted = true;
    quizSession.completedAt = new Date();

    await quizSession.save();

    // Update user statistics
    const user = await User.findById(req.user.id);
    user.totalPoints += Math.max(0, score);
    user.gamesPlayed += 1;
    user.correctAnswers += correctAnswers;
    user.wrongAnswers += wrongAnswers;
    await user.save();

    res.json({
      score: Math.max(0, score),
      correctAnswers,
      wrongAnswers,
      totalQuestions: quizSession.totalQuestions,
      timeSpent: quizSession.timeSpent,
      gameMode: quizSession.gameMode,
      category: quizSession.category.name
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Get user's quiz history
router.get('/history', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const quizSessions = await QuizSession.find({ userId: req.user.id, isCompleted: true })
      .populate('category', 'name')
      .sort({ completedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await QuizSession.countDocuments({ userId: req.user.id, isCompleted: true });

    res.json({
      sessions: quizSessions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Get quiz session details
router.get('/session/:id', auth, async (req, res) => {
  try {
    const quizSession = await QuizSession.findById(req.params.id)
      .populate('questions.questionId')
      .populate('category', 'name');

    if (!quizSession) {
      return res.status(404).json({ message: 'Quiz session not found' });
    }

    if (quizSession.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(quizSession);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Create multiplayer room
router.post('/multiplayer/create-room', auth, async (req, res) => {
  try {
    const { categoryId, totalQuestions = 10 } = req.body;
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Get random questions from category
    const questions = await Question.aggregate([
      { $match: { category: categoryId, isActive: true } },
      { $sample: { size: parseInt(totalQuestions) } }
    ]);

    if (questions.length === 0) {
      return res.status(400).json({ message: 'No questions available in this category' });
    }

    // Create quiz session for multiplayer
    const quizSession = new QuizSession({
      userId: req.user.id,
      category: categoryId,
      questions: questions.map(q => ({
        questionId: q._id
      })),
      totalQuestions: questions.length,
      gameMode: 'multiplayer',
      roomId
    });

    await quizSession.save();

    res.json({
      roomId,
      sessionId: quizSession._id,
      totalQuestions: questions.length
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Join multiplayer room
router.post('/multiplayer/join-room', auth, async (req, res) => {
  try {
    const { roomId } = req.body;

    // Find existing room
    const existingSession = await QuizSession.findOne({ roomId, gameMode: 'multiplayer' });
    if (!existingSession) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Create new session for joining user
    const quizSession = new QuizSession({
      userId: req.user.id,
      category: existingSession.category,
      questions: existingSession.questions,
      totalQuestions: existingSession.totalQuestions,
      gameMode: 'multiplayer',
      roomId
    });

    await quizSession.save();

    res.json({
      roomId,
      sessionId: quizSession._id,
      totalQuestions: quizSession.totalQuestions
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;


