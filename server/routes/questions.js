const express = require('express');
const prisma = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

// Get questions by category
router.get('/category/:categoryId', async (req, res) => {
  try {
    const categoryId = parseInt(req.params.categoryId);
    const limit = parseInt(req.query.limit) || 10;
    const { difficulty } = req.query;

    let query = { categoryId, isActive: true };
    if (difficulty) {
      query.difficulty = difficulty;
    }

    const questions = await prisma.question.findMany({
      where: query,
      include: { category: { select: { name: true } } },
      take: limit,
      orderBy: { createdAt: 'desc' }
    });

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

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { category, difficulty } = req.query;

    let query = {};
    if (category) query.categoryId = parseInt(category);
    if (difficulty) query.difficulty = difficulty;

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where: query,
        include: { category: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit
      }),
      prisma.question.count({ where: query })
    ]);

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

    const categoryId = parseInt(category);

    // Check if category exists
    const categoryExists = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!categoryExists) {
      return res.status(400).json({ message: 'Category not found' });
    }

    const newQuestion = await prisma.question.create({
      data: {
        question,
        options,
        correctAnswer,
        explanation,
        categoryId,
        difficulty: difficulty || 'medium'
      }
    });

    // Update category question count
    await prisma.category.update({
      where: { id: categoryId },
      data: { questionCount: { increment: 1 } }
    });

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

    const id = parseInt(req.params.id);
    const { question, options, correctAnswer, explanation, difficulty, isActive } = req.body;

    const existingQuestion = await prisma.question.findUnique({ where: { id } });
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

    const updatedQuestion = await prisma.question.update({
      where: { id },
      data: {
        question: question || existingQuestion.question,
        options: options || existingQuestion.options,
        correctAnswer: correctAnswer !== undefined ? correctAnswer : existingQuestion.correctAnswer,
        explanation: explanation || existingQuestion.explanation,
        difficulty: difficulty || existingQuestion.difficulty,
        isActive: isActive !== undefined ? isActive : existingQuestion.isActive
      }
    });

    res.json(updatedQuestion);
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

    const id = parseInt(req.params.id);
    const question = await prisma.question.findUnique({ where: { id } });
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Update category question count
    await prisma.category.update({
      where: { id: question.categoryId },
      data: { questionCount: { decrement: 1 } }
    });

    await prisma.question.delete({ where: { id } });
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

    const id = parseInt(req.params.id);
    const question = await prisma.question.findUnique({ where: { id } });
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const successRate = question.timesAnswered === 0 ? 0 : ((question.correctCount / question.timesAnswered) * 100).toFixed(2);

    res.json({
      timesAnswered: question.timesAnswered,
      correctCount: question.correctCount,
      successRate: parseFloat(successRate)
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
