require('dotenv').config();
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
const app = express();
const PORT = process.env.PORT || 5000;

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
const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // Limit each IP to 50 public requests per windowMs
  message: { success: false, message: 'Too many requests from this IP, please try again after an hour' }
});

// Allowed Origins for CORS with Credentials (Cookies)
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:5000',
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    if (allowedOrigins.includes(origin) || isLocalhost) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS: ' + origin));
    }
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
app.use('/api/v1/upload', uploadRoutes);

// Serve uploads folder statically
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Language Guru Express Backend running on http://localhost:${PORT}`);
});

module.exports = app;
// Reloaded with database active
