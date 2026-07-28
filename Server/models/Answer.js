const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true
  },
  jobRole: {
    type: String,
    default: ''
  },
  question: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: 'Technical'
  },
  userAnswer: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 10
  },
  feedback: {
    type: String,
    default: ''
  },
  strengths: {
    type: String,
    default: ''
  },
  improvement: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

const Answer = mongoose.model('Answer', answerSchema);

module.exports = Answer;