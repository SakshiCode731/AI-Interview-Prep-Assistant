const express = require('express');
const router = express.Router();
const { getMockQuestions, evaluateAnswer } = require('../controllers/mockInterviewController');
const { runAgent, listSessions, getSession } = require('../controllers/agentController');
const { protect } = require('../middleware/authMiddleware');
const { aiLimiter } = require('../middleware/rateLimiter');
const { validate, mockInterviewEvaluateSchema } = require('../middleware/validate');
// this is interview portion

router.post('/questions', protect, aiLimiter, getMockQuestions);
router.post('/evaluate', protect, aiLimiter, validate(mockInterviewEvaluateSchema), evaluateAnswer);

// agent route
router.post('/agent/chat', protect, aiLimiter, async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'message field required' });
    }

    const result = await runAgent({
      userId: req.user._id,
      sessionId: sessionId || null,
      userMessage: message,
    });

    res.json(result); // { reply, sessionId }
  } catch (err) {
    console.error('Agent error:', err);
    res.status(500).json({ error: 'Something went wrong', details: err.message });
  }
});

// List all agent sessions for logged-in user
router.get('/agent/sessions', protect, async (req, res) => {
  try {
    const sessions = await listSessions(req.user._id);
    res.json({ sessions });
  } catch (err) {
    console.error('List sessions error:', err);
    res.status(500).json({ error: 'Something went wrong', details: err.message });
  }
});

// Get one specific session's full history
router.get('/agent/sessions/:id', protect, async (req, res) => {
  try {
    const session = await getSession(req.user._id, req.params.id);
    res.json(session);
  } catch (err) {
    console.error('Get session error:', err);
    res.status(404).json({ error: 'Session not found', details: err.message });
  }
});

module.exports = router;