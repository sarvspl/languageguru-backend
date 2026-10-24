const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getTranslators, getAllTranslators, createTranslator, updateTranslator, deleteTranslator, applyTranslator } = require('../controllers/translatorController');
const { protect } = require('../middleware/auth');

const router = express.Router();

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
    const baseName = path.basename(file.originalname || 'resume', ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 30);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${baseName}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 15 * 1024 * 1024 }
});

// Public route: active translators only (for frontend)
router.get('/', getTranslators);
router.post('/apply', (req, res, next) => {
  upload.any()(req, res, function (err) {
    if (err) {
      console.error('Multer apply error:', err);
      return res.status(400).json({ success: false, message: err.message || 'File upload error.' });
    }
    const uploadedFile = req.file || (req.files && req.files[0]);
    if (uploadedFile) {
      req.file = uploadedFile;
    }
    next();
  });
}, applyTranslator);

// Protected admin routes: all translators, CRUD
router.get('/all', protect, getAllTranslators);
router.post('/', protect, createTranslator);
router.put('/:id', protect, updateTranslator);
router.delete('/:id', protect, deleteTranslator);

module.exports = router;
