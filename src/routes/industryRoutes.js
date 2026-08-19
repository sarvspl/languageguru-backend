const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getIndustries,
  getAllIndustries,
  createIndustry,
  updateIndustry,
  deleteIndustry
} = require('../controllers/industryController');

const router = express.Router();

// Public route
router.get('/', getIndustries);

// Admin routes
router.get('/all', protect, getAllIndustries);
router.post('/', protect, createIndustry);
router.put('/:id', protect, updateIndustry);
router.delete('/:id', protect, deleteIndustry);

module.exports = router;
