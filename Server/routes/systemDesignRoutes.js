const express = require('express');
const router = express.Router();
const { getQuestions, evaluateDesign } = require('../controllers/systemDesignController');
const { protect } = require('../middleware/authMiddleware');

router.get('/questions', protect, getQuestions);
router.post('/evaluate', protect, evaluateDesign);

module.exports = router;