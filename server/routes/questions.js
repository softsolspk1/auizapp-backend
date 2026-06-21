const express = require('express');
const Question = require('../models/Question');
const Category = require('../models/Category');
const auth = require('../middleware/auth');

const router = express.Router();

// Get questions by category
router.get('/category/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { limit = 10, difficulty } = req.query;

    let query = { category: categoryId, isActive: true };
    if (difficulty) {
      query.difficulty = difficulty;
    }

    const questions = await Question.find(query)
      .populate('category', 'name')
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.json(questions);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Get all questions (admin only)
router.get('/admin', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { category, difficulty, page = 1, limit = 20 } = req.query;
    let query = {};

    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;

    const questions = await Question.find(query)
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Question.countDocuments(query);

    res.json({
      questions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Create new question (admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { question, options, correctAnswer, explanation, category, difficulty } = req.body;

    // Validate options
    if (!options || options.length !== 4) {
      return res.status(400).json({ message: 'Question must have exactly 4 options' });
    }

    // Validate correct answer
    if (correctAnswer < 0 || correctAnswer > 3) {
      return res.status(400).json({ message: 'Correct answer must be between 0 and 3' });
    }

    // Check if category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ message: 'Category not found' });
    }

    const newQuestion = new Question({
      question,
      options,
      correctAnswer,
      explanation,
      category,
      difficulty: difficulty || 'medium'
    });

    await newQuestion.save();

    // Update category question count
    await Category.findByIdAndUpdate(category, { $inc: { questionCount: 1 } });

    res.json(newQuestion);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Update question (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { question, options, correctAnswer, explanation, difficulty, isActive } = req.body;

    const existingQuestion = await Question.findById(req.params.id);
    if (!existingQuestion) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Validate options if provided
    if (options && options.length !== 4) {
      return res.status(400).json({ message: 'Question must have exactly 4 options' });
    }

    // Validate correct answer if provided
    if (correctAnswer !== undefined && (correctAnswer < 0 || correctAnswer > 3)) {
      return res.status(400).json({ message: 'Correct answer must be between 0 and 3' });
    }

    existingQuestion.question = question || existingQuestion.question;
    existingQuestion.options = options || existingQuestion.options;
    existingQuestion.correctAnswer = correctAnswer !== undefined ? correctAnswer : existingQuestion.correctAnswer;
    existingQuestion.explanation = explanation || existingQuestion.explanation;
    existingQuestion.difficulty = difficulty || existingQuestion.difficulty;
    existingQuestion.isActive = isActive !== undefined ? isActive : existingQuestion.isActive;

    await existingQuestion.save();
    res.json(existingQuestion);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Delete question (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Update category question count
    await Category.findByIdAndUpdate(question.category, { $inc: { questionCount: -1 } });

    await Question.findByIdAndDelete(req.params.id);
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Get question statistics
router.get('/:id/stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json({
      timesAnswered: question.timesAnswered,
      correctCount: question.correctCount,
      successRate: question.successRate
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;


