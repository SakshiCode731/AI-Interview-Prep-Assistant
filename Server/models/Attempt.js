const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['mock-interview', 'answer-evaluator', 'readiness'],
    required: true
  },
  jobRole: { type: String, default: '' },
  topic: { type: String, default: 'General' }, // e.g. DSA, React, System Design, HR
  question: { type: String, default: '' },
  score: { type: Number, required: true }, // normalize sab kuch 0-10 scale pe
}, { timestamps: true });

const Attempt = mongoose.model('Attempt', attemptSchema);
module.exports = Attempt;