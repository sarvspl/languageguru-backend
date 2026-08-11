const express = require('express');
const router = express.Router();
const { getSettings, getPublicSettings, updateSettings, changePassword, getAdminProfile } = require('../controllers/settingsController');
const { verifyAdminToken } = require('../middleware/auth');

// Public route for frontend
router.get('/public', getPublicSettings);

// All other settings routes require admin auth
router.get('/', verifyAdminToken, getSettings);
router.put('/', verifyAdminToken, updateSettings);
router.put('/change-password', verifyAdminToken, changePassword);
router.get('/admin-profile', verifyAdminToken, getAdminProfile);

module.exports = router;
