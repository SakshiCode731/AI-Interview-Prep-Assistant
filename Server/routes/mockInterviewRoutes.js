const express = require('express');
const router = express.Router();
const { getMockQuestions, evaluateAnswer } = require('../controllers/mockInterviewController');
const { protect } = require('../middleware/authMiddleware');
// this is interview portion

router.post('/questions', protect, getMockQuestions);
router.post('/evaluate', protect, evaluateAnswer);

module.exports = router;