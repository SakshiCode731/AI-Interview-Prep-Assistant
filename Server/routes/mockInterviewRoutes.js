const express = require('express');
const router = express.Router();
const { getMockQuestions, evaluateAnswer } = require('../controllers/mockInterviewController');
const { runAgent } = require('../controllers/agentController');
const { protect } = require('../middleware/authMiddleware');
const { aiLimiter } = require('../middleware/rateLimiter');
const { validate, mockInterviewEvaluateSchema } = require('../middleware/validate');
// this is interview portion

router.post('/questions', protect, aiLimiter, getMockQuestions);
router.post('/evaluate', protect, aiLimiter, validate(mockInterviewEvaluateSchema), evaluateAnswer);

// agent route
router.post('/agent/chat', protect, aiLimiter, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'message field required' });
    }

    const reply = await runAgent(message);
    res.json({ reply });
  } catch (err) {
    console.error('Agent error:', err);
    res.status(500).json({ error: 'Something went wrong', details: err.message });
  }
});

module.exports = router;