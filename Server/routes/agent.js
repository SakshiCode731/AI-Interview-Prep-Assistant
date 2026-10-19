const express = require('express');
const router = express.Router();
const { handleMessage } = require('../agents/orchestrator');

router.post('/', async (req, res) => {
  try {
    const { messages } = req.body; // [{role:'user'|'assistant', content:'...'}]
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages required' });
    }
    const result = await handleMessage(messages);
    res.json(result); // { agent, reply }
  } catch (err) {
    res.status(500).json({ error: 'Agent failed' });
  }
});

module.exports = router;