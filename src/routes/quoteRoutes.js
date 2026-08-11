const express = require('express');
const router = express.Router();
const { submitQuote, getQuotes, updateQuoteStatus, deleteQuote } = require('../controllers/quoteController');
const { verifyAdminToken } = require('../middleware/auth');

router.post('/submit', submitQuote);
router.get('/', verifyAdminToken, getQuotes);
router.put('/:id/status', verifyAdminToken, updateQuoteStatus);
router.delete('/:id', verifyAdminToken, deleteQuote);

module.exports = router;
