const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { submitQuote, getQuotes, updateQuoteStatus, deleteQuote } = require('../controllers/quoteController');
const { verifyAdminToken } = require('../middleware/auth');

const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, message: 'Too many quote submissions, please try again after 15 minutes.' }
});

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname || '') || '.pdf';
    const baseName = path.basename(file.originalname || 'doc', ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 30);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${baseName}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB limit per file
});

const handleQuoteUploads = (req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    upload.any()(req, res, function (err) {
      if (err) {
        console.error('Quote upload multer error:', err);
        return res.status(400).json({ success: false, message: err.message || 'File upload error.' });
      }
      next();
    });
  } else {
    next();
  }
};

router.post('/submit', submitLimiter, handleQuoteUploads, submitQuote);
router.post('/', submitLimiter, handleQuoteUploads, submitQuote);
router.get('/', verifyAdminToken, getQuotes);
router.put('/:id/status', verifyAdminToken, updateQuoteStatus);
router.delete('/:id', verifyAdminToken, deleteQuote);

module.exports = router;
