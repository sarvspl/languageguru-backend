const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getPageBySlug,
  getAllPages,
  createPage,
  updatePage,
  deletePage
} = require('../controllers/pageController');

const router = express.Router();

// Admin routes
router.get('/admin/all', protect, getAllPages);
router.post('/', protect, createPage);
router.put('/:id', protect, updatePage);
router.delete('/:id', protect, deletePage);

// Public route
router.get('/:slug', getPageBySlug);

module.exports = router;
