const express = require('express');
const { getTranslators, getAllTranslators, createTranslator, updateTranslator, deleteTranslator } = require('../controllers/translatorController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public route: active translators only (for frontend)
router.get('/', getTranslators);

// Protected admin routes: all translators, CRUD
router.get('/all', protect, getAllTranslators);
router.post('/', protect, createTranslator);
router.put('/:id', protect, updateTranslator);
router.delete('/:id', protect, deleteTranslator);

module.exports = router;
