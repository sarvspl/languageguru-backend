const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getWhyChoose,
  getAllWhyChoose,
  createWhyChoose,
  updateWhyChoose,
  deleteWhyChoose
} = require('../controllers/whyChooseController');

const router = express.Router();

// Public route
router.get('/', getWhyChoose);

// Admin routes
router.get('/all', protect, getAllWhyChoose);
router.post('/', protect, createWhyChoose);
router.put('/:id', protect, updateWhyChoose);
router.delete('/:id', protect, deleteWhyChoose);

module.exports = router;
