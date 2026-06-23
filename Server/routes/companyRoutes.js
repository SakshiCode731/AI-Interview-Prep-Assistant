const express = require('express');
const router = express.Router();
const { getCompanies, getCompanyById } = require('../controllers/companyController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getCompanies);
router.get('/:id', protect, getCompanyById);

module.exports = router;