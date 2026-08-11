const express = require('express');
const router = express.Router();
const { login, logout, me } = require('../controllers/authController');
const { verifyAdminToken } = require('../middleware/auth');

router.post('/login', login);
router.post('/logout', logout);
router.get('/me', verifyAdminToken, me);

module.exports = router;
