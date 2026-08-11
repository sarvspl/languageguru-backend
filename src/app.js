require('dotenv').config();
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

const app = express();
const PORT = process.env.PORT || 5000;

// Allowed Origins for CORS with Credentials (Cookies)
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  process.env.ADMIN_URL || 'http://localhost:3001'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow during dev
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

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Language Guru Express Backend running on http://localhost:${PORT}`);
});

module.exports = app;
