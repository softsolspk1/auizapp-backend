const mongoose = require('mongoose');

const quizSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  questions: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question'
    },
    userAnswer: Number,
    isCorrect: Boolean,
    timeSpent: Number // in seconds
  }],
  score: {
    type: Number,
    default: 0
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  correctAnswers: {
    type: Number,
    default: 0
  },
  wrongAnswers: {
    type: Number,
    default: 0
  },
  timeSpent: {
    type: Number, // total time in seconds
    default: 0
  },
  gameMode: {
    type: String,
    enum: ['single', 'multiplayer'],
    required: true
  },
  roomId: {
    type: String, // for multiplayer games
    default: null
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('QuizSession', quizSessionSchema);


