const express = require('express');
const { getLanguages, createLanguage, updateLanguage, deleteLanguage } = require('../controllers/languageController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public route to fetch languages for the frontend
router.get('/', getLanguages);

// Protected routes for Admin CMS
router.post('/', protect, createLanguage);
router.put('/:id', protect, updateLanguage);
router.delete('/:id', protect, deleteLanguage);

module.exports = router;
