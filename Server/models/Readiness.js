const mongoose = require('mongoose');
// this is the schema for the Readiness model, which stores the readiness score and related information for a user in a specific job role.

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