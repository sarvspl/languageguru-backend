const express = require('express');
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
router.get('/all', getAllIndustries);
router.post('/', createIndustry);
router.put('/:id', updateIndustry);
router.delete('/:id', deleteIndustry);

module.exports = router;
