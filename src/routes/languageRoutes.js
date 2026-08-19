const express = require('express');
const {
  getLanguages,
  getAllLanguages,
  getLanguageByKey,
  createLanguage,
  updateLanguage,
  deleteLanguage
} = require('../controllers/languageController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public route to fetch active languages for the frontend
router.get('/', getLanguages);

// Admin route to fetch all languages (including inactive)
router.get('/all', protect, getAllLanguages);

// Public route to fetch a single language by key or slug
router.get('/:key', getLanguageByKey);

// Protected routes for Admin CMS
router.post('/', protect, createLanguage);
router.put('/:id', protect, updateLanguage);
router.delete('/:id', protect, deleteLanguage);

module.exports = router;
