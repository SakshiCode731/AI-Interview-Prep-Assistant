const express = require('express');
const router = express.Router();
const { evaluateAnswer } = require('../controllers/answerEvaluatorController');
const { protect } = require('../middleware/authMiddleware');

router.post('/evaluate', protect, evaluateAnswer);

module.exports = router;