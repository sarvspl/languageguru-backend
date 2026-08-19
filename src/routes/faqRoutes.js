const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getFaqs,
  getAllFaqs,
  createFaq,
  updateFaq,
  deleteFaq
} = require('../controllers/faqController');

const router = express.Router();

// Public route
router.get('/', getFaqs);

// Admin routes
router.get('/all', protect, getAllFaqs);
router.post('/', protect, createFaq);
router.put('/:id', protect, updateFaq);
router.delete('/:id', protect, deleteFaq);

module.exports = router;
