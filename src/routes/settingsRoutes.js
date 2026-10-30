const express = require('express');
const router = express.Router();
const { getSettings, getPublicSettings, updateSettings, changePassword, getAdminProfile, getSmtpSettings, updateSmtpSettings, testSmtpSettings } = require('../controllers/settingsController');
const { verifyAdminToken } = require('../middleware/auth');

// Public route for frontend
router.get('/public', getPublicSettings);

// All other settings routes require admin auth
router.get('/', verifyAdminToken, getSettings);
router.put('/', verifyAdminToken, updateSettings);
router.put('/change-password', verifyAdminToken, changePassword);
router.get('/admin-profile', verifyAdminToken, getAdminProfile);

// SMTP configuration & testing routes
router.get('/smtp', verifyAdminToken, getSmtpSettings);
router.put('/smtp', verifyAdminToken, updateSmtpSettings);
router.post('/smtp/test', verifyAdminToken, testSmtpSettings);

module.exports = router;
