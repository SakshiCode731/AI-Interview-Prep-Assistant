const express = require('express');
const router = express.Router();
const { sendMessage } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');
const { aiLimiter } = require('../middleware/rateLimiter');
const { validate, chatMessageSchema } = require('../middleware/validate');

router.post('/message', protect, aiLimiter, validate(chatMessageSchema), sendMessage);

module.exports = router;