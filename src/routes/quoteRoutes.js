const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { submitQuote, getQuotes, updateQuoteStatus, deleteQuote } = require('../controllers/quoteController');
const { verifyAdminToken } = require('../middleware/auth');

const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, message: 'Too many quote submissions, please try again after 15 minutes.' }
});

router.post('/submit', submitLimiter, submitQuote);
router.post('/', submitLimiter, submitQuote);
router.get('/', verifyAdminToken, getQuotes);
router.put('/:id/status', verifyAdminToken, updateQuoteStatus);
router.delete('/:id', verifyAdminToken, deleteQuote);

module.exports = router;
