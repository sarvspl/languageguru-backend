const express = require('express');
const { protect } = require('../middleware/auth');
const { getClientsPage, updateClientsPage } = require('../controllers/clientsPageController');

const router = express.Router();

// Public: Get dynamic clients page details
router.get('/', getClientsPage);

// Admin: Update dynamic clients page details
router.put('/', protect, updateClientsPage);

module.exports = router;
