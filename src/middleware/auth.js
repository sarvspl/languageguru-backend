const jwt = require('jsonwebtoken');

const verifyAdminToken = (req, res, next) => {
  // Read token from httpOnly cookie or Authorization header fallback
  const token = req.cookies.admin_token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. Authentication token missing.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'languageguru_secret_key_2026_super_secure_jwt');
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
  }
};

module.exports = { verifyAdminToken, protect: verifyAdminToken };
