const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

// Login Admin and set httpOnly cookie
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const trimmedUsername = username ? username.trim() : '';

    if (!trimmedUsername || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('CRITICAL: JWT_SECRET is missing from environment variables.');
      return res.status(500).json({ success: false, message: 'Internal Server Error: Authentication configuration missing.' });
    }

    const admin = await prisma.adminUser.findUnique({ where: { username: trimmedUsername } });
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      // A JWT payload is base64, not encrypted, so nothing derived from the
      // password hash belongs in it. Session invalidation on password change is
      // handled by comparing `iat` against AdminUser.passwordChangedAt in
      // verifyAdminToken, which covers every device rather than just this one.
      { id: admin.id, username: admin.username, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set secure httpOnly cookie
    res.cookie('admin_token', token, {
      httpOnly: true, // Cannot be accessed by JavaScript (XSS protection)
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/' // CRITICAL: ensure cookie is sent to all routes
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: { id: admin.id, username: admin.username, name: admin.name, role: admin.role }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

// Logout Admin and clear httpOnly cookie
const logout = async (req, res) => {
  res.clearCookie('admin_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/'
  });
  return res.status(200).json({ success: true, message: 'Logged out successfully.' });
};

// Get Current Logged In Admin Profile
const me = async (req, res) => {
  try {
    const admin = await prisma.adminUser.findUnique({
      where: { id: req.admin.id },
      select: { id: true, username: true, name: true, role: true, createdAt: true }
    });
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin user not found.' });
    }
    return res.status(200).json({ success: true, user: admin });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { login, logout, me };
