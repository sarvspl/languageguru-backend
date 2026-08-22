const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyAdminToken } = require('../middleware/auth');

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
    const ext = path.extname(file.originalname || '') || '.jpg';
    const cleanName = (file.originalname || 'upload')
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .slice(0, 30);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + cleanName + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB limit
});

router.post('/', verifyAdminToken, (req, res) => {
  upload.any()(req, res, function (err) {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ success: false, message: err.message || 'File upload error.' });
    }

    const uploadedFile = req.file || (req.files && req.files[0]);
    if (!uploadedFile) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const fileUrl = '/uploads/' + uploadedFile.filename;
    return res.status(200).json({
      success: true,
      url: fileUrl,
      filename: uploadedFile.filename
    });
  });
});

module.exports = router;
