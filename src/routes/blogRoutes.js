const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getPublishedBlogs,
  getBlogBySlug,
  getAllAdminBlogs,
  getAdminBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  toggleBlogStatus
} = require('../controllers/blogController');

const router = express.Router();

// ── Public Routes ──
router.get('/', getPublishedBlogs);

// ── Admin Routes (Protected by JWT) ──
router.get('/admin/all', protect, getAllAdminBlogs);
router.get('/admin/:id', protect, getAdminBlogById);
router.post('/', protect, createBlog);
router.put('/:id', protect, updateBlog);
router.delete('/:id', protect, deleteBlog);
router.patch('/:id/toggle', protect, toggleBlogStatus);

// ── Public Slug Route (must be last to prevent route parameter collision) ──
router.get('/:slug', getBlogBySlug);

module.exports = router;
