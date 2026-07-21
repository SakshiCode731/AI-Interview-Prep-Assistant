const express = require('express');
const router = express.Router();
const { getCompanies, getCompanyById, createCompany, updateCompany, deleteCompany } = require('../controllers/companyController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, getCompanies);
router.get('/:id', protect, getCompanyById);
router.post('/', protect, adminOnly, createCompany);
router.put('/:id', protect, adminOnly, updateCompany);
router.delete('/:id', protect, adminOnly, deleteCompany);

module.exports = router;