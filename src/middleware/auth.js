const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

const verifyAdminToken = async (req, res, next) => {
  // Read token from httpOnly cookie or Authorization header fallback
  const token = req.cookies.admin_token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. Authentication token missing.' });
  }

  if (!process.env.JWT_SECRET) {
    console.error('CRITICAL: JWT_SECRET is missing from environment variables.');
    return res.status(500).json({ success: false, message: 'Server authentication is not configured.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // SEC-10: a password change must invalidate every token issued before it,
    // otherwise a stolen token stays valid for its full 7-day life.
    const admin = await prisma.adminUser.findUnique({
      where: { id: decoded.id },
      select: { id: true, passwordChangedAt: true }
    });

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Account no longer exists.' });
    }

    if (admin.passwordChangedAt && decoded.iat) {
      const changedAtSec = Math.floor(new Date(admin.passwordChangedAt).getTime() / 1000);
      if (decoded.iat < changedAtSec) {
        return res.status(401).json({ success: false, message: 'Session expired after a password change. Please log in again.' });
      }
    }

    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
  }
};

module.exports = { verifyAdminToken, protect: verifyAdminToken };
