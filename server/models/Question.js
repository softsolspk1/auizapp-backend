const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  options: [{
    type: String,
    required: true,
    trim: true
  }],
  correctAnswer: {
    type: Number,
    required: true,
    min: 0,
    max: 3
  },
  explanation: {
    type: String,
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  timesAnswered: {
    type: Number,
    default: 0
  },
  correctCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate success rate
questionSchema.virtual('successRate').get(function() {
  if (this.timesAnswered === 0) return 0;
  return (this.correctCount / this.timesAnswered * 100).toFixed(2);
});

module.exports = mongoose.model('Question', questionSchema);


