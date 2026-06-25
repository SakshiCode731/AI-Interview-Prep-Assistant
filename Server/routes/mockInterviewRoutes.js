const express = require('express');
const router = express.Router();
const { getMockQuestions } = require('../controllers/mockInterviewController');
const { protect } = require('../middleware/authMiddleware');

router.post('/questions', protect, getMockQuestions);

module.exports = router;