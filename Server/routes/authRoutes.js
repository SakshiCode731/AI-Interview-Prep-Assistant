const express = require('express');
const router = express.Router();
const { signupUser, loginUser } = require('../controllers/authController');
const { validate, signupSchema, loginSchema } = require('../middleware/validate');

// POST /api/auth/signup
router.post('/signup', validate(signupSchema), signupUser);

// POST /api/auth/login
router.post('/login', validate(loginSchema), loginUser);

module.exports = router;