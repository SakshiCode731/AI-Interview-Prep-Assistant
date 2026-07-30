const express = require('express');
const router = express.Router();
const { getProgress } = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');
// @desc Get user progress
// @route GET /api/progress

router.get('/', protect, getProgress);

module.exports = router;
