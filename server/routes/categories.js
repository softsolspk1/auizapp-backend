const express = require('express');
const Category = require('../models/Category');
const Question = require('../models/Question');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ 
      name: 1 
    });
    
    // Move Specialty category to the top if it exists
    const specialtyIndex = categories.findIndex(cat => cat.name === 'Specialty');
    if (specialtyIndex > 0) {
      const specialtyCategory = categories.splice(specialtyIndex, 1)[0];
      categories.unshift(specialtyCategory);
    }
    
    res.json(categories);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Get all categories (admin only)
router.get('/admin', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Create new category (admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { name, description } = req.body;

    // Check if category already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = new Category({
      name,
      description
    });

    await category.save();
    res.json(category);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Update category (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { name, description, isActive } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    category.name = name || category.name;
    category.description = description || category.description;
    category.isActive = isActive !== undefined ? isActive : category.isActive;

    await category.save();
    res.json(category);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Delete category (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if category has questions
    const questionCount = await Question.countDocuments({ category: req.params.id });
    if (questionCount > 0) {
      return res.status(400).json({ message: 'Cannot delete category with existing questions' });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Get category statistics
router.get('/:id/stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const questionCount = await Question.countDocuments({ category: req.params.id });
    const activeQuestionCount = await Question.countDocuments({ category: req.params.id, isActive: true });

    res.json({
      totalQuestions: questionCount,
      activeQuestions: activeQuestionCount
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;


