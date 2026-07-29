const mongoose = require('mongoose');

const readinessSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    jobRole: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    skillsMatch: {
      type: Number,
      default: 0,
    },
    experience: {
      type: Number,
      default: 0,
    },
    projects: {
      type: Number,
      default: 0,
    },
    resumeQuality: {
      type: Number,
      default: 0,
    },
    strengths: {
      type: [String],
      default: [],
    },
    improvements: {
      type: [String],
      default: [],
    },
    summary: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Readiness', readinessSchema);