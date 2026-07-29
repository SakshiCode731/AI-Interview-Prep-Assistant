const express = require('express');
const router = express.Router();
const { getReadinessScore, getMyReadiness } = require('../controllers/readinessController');
const { protect } = require('../middleware/authMiddleware');

router.post('/score', protect, getReadinessScore);
router.get('/me', protect, getMyReadiness);

module.exports = router;