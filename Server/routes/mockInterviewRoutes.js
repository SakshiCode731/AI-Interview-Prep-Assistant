const express = require('express');
const router = express.Router();
const { getMockQuestions, evaluateAnswer } = require('../controllers/mockInterviewController');
const { protect } = require('../middleware/authMiddleware');
const { aiLimiter } = require('../middleware/rateLimiter');
const { validate, mockInterviewEvaluateSchema } = require('../middleware/validate');
// this is interview portion

router.post('/questions', protect, aiLimiter, getMockQuestions);
router.post('/evaluate', protect, aiLimiter, validate(mockInterviewEvaluateSchema), evaluateAnswer);

module.exports = router;