const env = require('./env');

/**
 * Options for the admin session cookie.
 *
 * Kept in one place so setting and clearing can never disagree — a mismatch in
 * sameSite or path silently leaves the cookie in the browser on logout.
 */
const adminCookieOptions = () => ({
  httpOnly: true,
  secure: env.isProduction,
  sameSite: env.isProduction ? 'none' : 'lax',
  path: '/',
});

module.exports = { adminCookieOptions };
