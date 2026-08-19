const express = require('express');
const {
  getPages, getAllPages, getPage, createPage, updatePage, deletePage,
  upsertSection, deleteSection, saveSections,
} = require('../controllers/sitePageController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public — published pages and sections
router.get('/', getPages);

// Admin
router.get('/all', protect, getAllPages);
router.post('/', protect, createPage);
router.get('/:key', protect, getPage);
router.put('/:key', protect, updatePage);
router.delete('/:key', protect, deletePage);
router.put('/:key/sections', protect, saveSections);
router.put('/:key/sections/:sectionKey', protect, upsertSection);
router.delete('/:key/sections/:sectionKey', protect, deleteSection);

module.exports = router;
