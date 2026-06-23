const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  round: { type: String }
});

const companySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String, default: '' },
  requiredSkills: { type: [String], default: [] },
  rounds: { type: [String], default: [] },
  questions: [questionSchema],
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' }
}, { timestamps: true });

const Company = mongoose.model('Company', companySchema);
module.exports = Company;