const express = require('express');
const { protect } = require('../middleware/auth');
const { getAbout, updateAbout } = require('../controllers/aboutController');

const router = express.Router();

// Public route to fetch about page details
router.get('/', getAbout);

// Admin route to update about page details
router.put('/', protect, updateAbout);

module.exports = router;
