const express = require('express');
const router = express.Router();
const { getReadinessScore, getMyReadiness } = require('../controllers/readinessController');
const { protect } = require('../middleware/authMiddleware');
const { aiLimiter } = require('../middleware/rateLimiter');
const { validate, readinessSchema } = require('../middleware/validate');

router.post('/score', protect, aiLimiter, validate(readinessSchema), getReadinessScore);
router.get('/me', protect, getMyReadiness);

module.exports = router;