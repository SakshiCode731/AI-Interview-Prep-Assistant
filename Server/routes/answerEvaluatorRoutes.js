const express = require('express');
const router = express.Router();
const { evaluateAnswer } = require('../controllers/answerEvaluatorController');
const { protect } = require('../middleware/authMiddleware');
const { aiLimiter } = require('../middleware/rateLimiter');
const { validate, answerEvaluatorSchema } = require('../middleware/validate');

router.post('/evaluate', protect, aiLimiter, validate(answerEvaluatorSchema), evaluateAnswer);

module.exports = router;