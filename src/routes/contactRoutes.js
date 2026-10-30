const express = require('express');
const rateLimit = require('express-rate-limit');
const { verifyAdminToken } = require('../middleware/auth');
const {
  getContact,
  updateContact,
  submitContactInquiry,
  getContactInquiries,
  updateContactInquiryStatus,
  deleteContactInquiry
} = require('../controllers/contactController');

const router = express.Router();

const contactSubmitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, message: 'Too many contact messages submitted, please try again after 15 minutes.' }
});

// ─── Public routes ───
// GET /api/v1/contact (fetch contact CMS content)
router.get('/', getContact);

// POST /api/v1/contact/inquiry (submit contact form from /contact page)
router.post('/inquiry', contactSubmitLimiter, submitContactInquiry);

// ─── Admin routes ───
// PUT /api/v1/contact (update contact CMS content)
router.put('/', verifyAdminToken, updateContact);

// GET /api/v1/contact/inquiries (fetch user submitted contact messages)
router.get('/inquiries', verifyAdminToken, getContactInquiries);

// PATCH & PUT /api/v1/contact/inquiries/:id/status (update inquiry status)
router.patch('/inquiries/:id/status', verifyAdminToken, updateContactInquiryStatus);
router.put('/inquiries/:id/status', verifyAdminToken, updateContactInquiryStatus);

// DELETE /api/v1/contact/inquiries/:id (delete contact inquiry)
router.delete('/inquiries/:id', verifyAdminToken, deleteContactInquiry);

module.exports = router;
