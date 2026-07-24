const jwt = require('jsonwebtoken');
const User = require('../models/user');

const protect = async (req, res, next) => {
  let token;

  // Check karo token header mein hai ya nahi
  if (req.headers.authorization && 
      req.headers.authorization.startsWith('Bearer')) {
    
    try {
      // Token extract karo "Bearer <token>" se
      token = req.headers.authorization.split(' ')[1];

      // Token verify karo
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // User ko req object mein daalo (password ke bina)
      req.user = await User.findById(decoded.id).select('-password');

      next(); // Aage badhne do

    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin only.' });
  }
};

module.exports = { protect, adminOnly };