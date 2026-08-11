const express = require('express');
const { getGallery, getAllGallery, createGalleryItem, updateGalleryItem, deleteGalleryItem } = require('../controllers/galleryController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public route: active items only (for frontend)
router.get('/', getGallery);

// Protected admin routes: all items, CRUD
router.get('/all', protect, getAllGallery);
router.post('/', protect, createGalleryItem);
router.put('/:id', protect, updateGalleryItem);
router.delete('/:id', protect, deleteGalleryItem);

module.exports = router;
