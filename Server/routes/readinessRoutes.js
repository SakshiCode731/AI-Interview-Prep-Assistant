const express = require('express');
const router = express.Router();
const { getReadinessScore } = require('../controllers/readinessController');
const { protect } = require('../middleware/authMiddleware');

router.post('/score', protect, getReadinessScore);

module.exports = router;