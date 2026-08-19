const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

const verifyAdminToken = async (req, res, next) => {
  // Read token from httpOnly cookie or Authorization header fallback
  const token = req.cookies?.admin_token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. Authentication token missing.' });
  }

  if (!process.env.JWT_SECRET) {
    console.error('CRITICAL: JWT_SECRET is missing from environment variables.');
    return res.status(500).json({ success: false, message: 'Internal Server Error: Authentication configuration missing.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // SEC-10: Invalidate token if password has changed
    if (decoded.id && decoded.pwHash) {
      const admin = await prisma.adminUser.findUnique({ where: { id: decoded.id } });
      if (!admin || admin.passwordHash.substring(0, 10) !== decoded.pwHash) {
        return res.status(401).json({ success: false, message: 'Session expired due to password change.' });
      }
    }
    
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
  }
};

module.exports = { verifyAdminToken, protect: verifyAdminToken, verifyToken: verifyAdminToken };
