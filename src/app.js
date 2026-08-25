// Validates every required variable and exits with a clear message if any is
// missing. Must be first so nothing reads process.env directly.
const env = require('./config/env');
// Reloaded with updated database configuration
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/authRoutes');
const languageRoutes = require('./routes/languageRoutes');
const quoteRoutes = require('./routes/quoteRoutes');
const cityRoutes = require('./routes/cityRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const translatorRoutes = require('./routes/translatorRoutes');
const industryRoutes = require('./routes/industryRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const testimonialRoutes = require('./routes/testimonialRoutes');
const clientRoutes = require('./routes/clientRoutes');
const faqRoutes = require('./routes/faqRoutes');
const pageRoutes = require('./routes/pageRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const homeSectionRoutes = require('./routes/homeSectionRoutes');
const whyChooseRoutes = require('./routes/whyChooseRoutes');
const aboutRoutes = require('./routes/aboutRoutes');
const contactRoutes = require('./routes/contactRoutes');
const clientsPageRoutes = require('./routes/clientsPageRoutes');
const sitePageRoutes = require('./routes/sitePageRoutes');
const serviceCityRoutes = require('./routes/serviceCityRoutes');
const languageCityRoutes = require('./routes/languageCityRoutes');
const app = express();
const PORT = env.PORT;

// Behind nginx every request arrives from 127.0.0.1, so req.ip is the proxy
// unless Express is told how many hops to unwind. express-rate-limit keys on
// req.ip: without this the login limiter counts all visitors as one client.
if (env.TRUST_PROXY > 0) app.set('trust proxy', env.TRUST_PROXY);

// Security Headers
const helmet = require('helmet');
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// Rate Limiting
const rateLimit = require('express-rate-limit');
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login requests per windowMs
  message: { success: false, message: 'Too many login attempts, please try again after 15 minutes' }
});
// Reserved for any future unauthenticated write endpoint. Submission routes are
// throttled at the router level instead - see quoteRoutes.js.
// eslint-disable-next-line no-unused-vars
const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // Limit each IP to 50 public requests per windowMs
  message: { success: false, message: 'Too many requests from this IP, please try again after an hour' }
});

// Allowed origins come from FRONTEND_URL and ADMIN_URL only, plus anything
// listed in EXTRA_CORS_ORIGINS. No host is trusted implicitly by being written
// into the source, and the previous blanket localhost allowance is gone.
app.use(cors({
  origin: function (origin, callback) {
    // Same-origin and server-to-server requests send no Origin header.
    if (!origin) return callback(null, true);
    const clean = origin.replace(/\/+$/, '');
    if (env.ALLOWED_ORIGINS.includes(clean)) return callback(null, true);
    return callback(new Error('Not allowed by CORS: ' + origin));
  },
  credentials: true // Crucial for httpOnly cookies
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Language Guru Backend API is running cleanly.' });
});

// API Routes
app.use('/api/v1/auth/login', loginLimiter);
// SEC-08: quote/contact submission is throttled by `submitLimiter` inside
// quoteRoutes.js (30 per 15 min), which is stricter than apiLimiter. Do NOT put
// apiLimiter on /api/v1/contact - that route serves the contact page's CMS
// content on every page load, so throttling it per IP breaks normal browsing
// for anyone behind shared NAT.
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/languages', languageRoutes);
app.use('/api/v1/quotes', quoteRoutes);
app.use('/api/v1/cities', cityRoutes);
app.use('/api/v1/services', serviceRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/gallery', galleryRoutes);
app.use('/api/v1/translators', translatorRoutes);
app.use('/api/v1/industries', industryRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/testimonials', testimonialRoutes);
app.use('/api/v1/clients', clientRoutes);
app.use('/api/v1/faqs', faqRoutes);
app.use('/api/v1/pages', pageRoutes);
app.use('/api/v1/home-sections', homeSectionRoutes);
app.use('/api/v1/why-choose', whyChooseRoutes);
app.use('/api/v1/about', aboutRoutes);
app.use('/api/v1/contact', contactRoutes);
app.use('/api/v1/clients-page', clientsPageRoutes);
app.use('/api/v1/site-pages', sitePageRoutes);
app.use('/api/v1/upload', uploadRoutes);
// Service + City localized overrides:
// /:serviceKey/cities endpoints (admin CRUD) + /all-overrides (public, for Next.js routing & sitemap)
app.use('/api/v1/services', serviceCityRoutes);
app.use('/api/v1/service-city-overrides', serviceCityRoutes);

// Language + City localized overrides:
// /:languageKey/cities endpoints (admin CRUD) + /all-overrides (public, for Next.js routing & sitemap)
app.use('/api/v1/languages', languageCityRoutes);
app.use('/api/v1/language-city-overrides', languageCityRoutes);


// Serve uploads folder statically
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// CFG-09: unmatched API routes must return JSON, not Express's HTML error page,
// so client-side error handling can parse the response.
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  if (err && /Not allowed by CORS/.test(err.message || '')) {
    return res.status(403).json({ success: false, message: 'Origin not allowed.' });
  }
  console.error('Unhandled Error:', err);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

app.listen(PORT, env.HOST, () => {
  console.log(`🚀 Language Guru API listening on ${env.HOST}:${PORT} [${env.NODE_ENV}]`);
  console.log(`   CORS origins: ${env.ALLOWED_ORIGINS.join(', ')}`);
  console.log(`   trust proxy: ${env.TRUST_PROXY || 'off'}`);
});

module.exports = app;
// Reloaded with database active
