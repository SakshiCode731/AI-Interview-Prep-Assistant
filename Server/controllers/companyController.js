const Company = require('../models/Company');
const cache = require('../utils/cache');
const Sentry = require('@sentry/node');

const getCompanies = async (req, res) => {
  try {
    const searchKeyword = req.query.search || '';
    const cacheKey = `companies:list:${searchKeyword}`;

    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      res.set('X-Cache', 'HIT');
      return res.status(200).json(cachedData);
    }

    const keyword = searchKeyword
      ? { name: { $regex: searchKeyword, $options: 'i' } }
      : {};

    const companies = await Company.find(keyword);

    cache.set(cacheKey, companies);
    res.set('X-Cache', 'MISS');
    res.status(200).json(companies);
  } catch (error) {
    Sentry.captureException(error);
    res.status(500).json({ message: error.message });
  }
};

const getCompanyById = async (req, res) => {
  try {
    const cacheKey = `companies:id:${req.params.id}`;

    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      res.set('X-Cache', 'HIT');
      return res.status(200).json(cachedData);
    }

    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: 'Company not found' });

    cache.set(cacheKey, company);
    res.set('X-Cache', 'MISS');
    res.status(200).json(company);
  } catch (error) {
    Sentry.captureException(error);
    res.status(500).json({ message: error.message });
  }
};

const createCompany = async (req, res) => {
  try {
    const company = await Company.create(req.body);
    cache.flushAll();
    res.status(201).json(company);
  } catch (error) {
    Sentry.captureException(error);
    res.status(500).json({ message: error.message });
  }
};

const updateCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!company) return res.status(404).json({ message: 'Company not found' });

    cache.flushAll();
    res.status(200).json(company);
  } catch (error) {
    Sentry.captureException(error);
    res.status(500).json({ message: error.message });
  }
};

const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) return res.status(404).json({ message: 'Company not found' });

    cache.flushAll();
    res.status(200).json({ message: 'Company deleted successfully' });
  } catch (error) {
    Sentry.captureException(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCompanies, getCompanyById, createCompany, updateCompany, deleteCompany };