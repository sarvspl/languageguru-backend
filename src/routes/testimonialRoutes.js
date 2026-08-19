const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getTestimonials,
  getAllTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial
} = require('../controllers/testimonialController');

const router = express.Router();

// Public route
router.get('/', getTestimonials);

// Admin routes
router.get('/all', protect, getAllTestimonials);
router.post('/', protect, createTestimonial);
router.put('/:id', protect, updateTestimonial);
router.delete('/:id', protect, deleteTestimonial);

module.exports = router;
