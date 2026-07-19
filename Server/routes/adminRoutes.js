const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const Company = require('../models/Company');

// GET all companies (admin view)
router.get('/companies', protect, adminOnly, async (req, res) => {
  const companies = await Company.find();
  res.json(companies);
});

// CREATE company
router.post('/companies', protect, adminOnly, async (req, res) => {
  const company = await Company.create(req.body);
  res.status(201).json(company);
});

// UPDATE company
router.put('/companies/:id', protect, adminOnly, async (req, res) => {
  const company = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(company);
});

// DELETE company
router.delete('/companies/:id', protect, adminOnly, async (req, res) => {
  await Company.findByIdAndDelete(req.params.id);
  res.json({ message: 'Company deleted' });
});

module.exports = router;