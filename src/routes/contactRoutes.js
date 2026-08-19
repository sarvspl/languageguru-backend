const express = require('express');
const { protect } = require('../middleware/auth');
const { getContact, updateContact } = require('../controllers/contactController');

const router = express.Router();

// Public route to fetch contact page details
router.get('/', getContact);

// Admin route to update contact page details
router.put('/', protect, updateContact);

module.exports = router;
