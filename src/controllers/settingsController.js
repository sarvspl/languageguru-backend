const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const prisma = require('../config/db');
const { adminCookieOptions } = require('../config/cookie');

const ENV_PATH = path.resolve(__dirname, '../../.env');

function updateEnvFile(updates) {
  let envContent = '';
  if (fs.existsSync(ENV_PATH)) {
    envContent = fs.readFileSync(ENV_PATH, 'utf8');
  }

  for (const [key, value] of Object.entries(updates)) {
    let cleanVal = String(value !== undefined && value !== null ? value : '').trim();
    if (key === 'SMTP_FROM') {
      cleanVal = `"${cleanVal.replace(/^"|"$/g, '')}"`;
    }

    const regex = new RegExp('^' + key + '=.*$', 'm');
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, `${key}=${cleanVal}`);
    } else {
      envContent = envContent.trimEnd() + `\n${key}=${cleanVal}\n`;
    }
  }

  fs.writeFileSync(ENV_PATH, envContent, 'utf8');
}

// ─── Defensive helper: ensures new template columns exist in DB ─────────
let columnsEnsured = false;
async function ensureSettingsColumns() {
  if (columnsEnsured) return;
  const cols = [
    'whatsappQuoteTemplate',
    'whatsappContactTemplate',
    'whatsappJoinTemplate',
    'emailAdminSubjectContact',
    'emailAdminHeadingContact',
    'emailCustomerSubjectContact',
    'emailCustomerHeadingContact',
    'emailAdminSubjectQuote',
    'emailAdminHeadingQuote',
    'emailCustomerSubjectQuote',
    'emailCustomerHeadingQuote',
    'emailAdminSubjectJoin',
    'emailAdminHeadingJoin',
    'emailCustomerSubjectJoin',
    'emailCustomerHeadingJoin',
    'emailCustomerBodyContact',
    'emailCustomerBodyQuote',
    'emailCustomerBodyJoin'
  ];
  try {
    for (const col of cols) {
      await prisma.$executeRawUnsafe(`ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "${col}" TEXT;`);
    }
    columnsEnsured = true;
  } catch (err) {
    console.warn('ensureSettingsColumns warning:', err && err.message ? err.message : err);
  }
}

const DEFAULT_TEMPLATES = {
  whatsappQuoteTemplate: "Hello Language Guru,\nSubmitted Translation Query ({referenceId}) for {sourceLang} to {targetLang} {service}\n\nQuery:\nDocument: {docType}, {pages} {unit}\nAdd-ons: {addons}\nCity: {city}\n\nEstimated total: {total} (incl. GST)\n{notes}\nPlease confirm the next steps.\n\nRegards,\n{name}\n{phone}\n{email}",
  whatsappContactTemplate: "Hello Language Guru,\nSubmitted Contact Inquiry ({referenceId}) for {service}\n\nInquiry Details:\nCity: {city}\nMessage: {message}\n\nPlease confirm the next steps.\n\nRegards,\n{name}\n{phone}\n{email}",
  whatsappJoinTemplate: "Hello Language Guru,\nSubmitted Linguist Application ({referenceId}) for {expertise} ({sourceLang} to {targetLang})\n\nDetails:\nExperience: {experience}\nCity: {city}\n\nPlease confirm the next steps.\n\nRegards,\n{name}\n{phone}\n{email}",

  emailAdminSubjectContact: "📬 New Contact Inquiry: {name} ({city}) [Ref: {referenceId}]",
  emailAdminHeadingContact: "New Contact Inquiry: {name} ({city})",
  emailCustomerSubjectContact: "✅ Contact Inquiry Received: {name} ({city}) [Ref: {referenceId}] — Language Guru India",
  emailCustomerHeadingContact: "Thank You, {name}!",
  emailCustomerBodyContact: "We have successfully received your inquiry. Our support team has assigned a dedicated coordinator to respond within 15–30 minutes.",

  emailAdminSubjectQuote: "🔔 New Quote Request: {service} ({sourceLang} → {targetLang}) [Ref: {referenceId}]",
  emailAdminHeadingQuote: "New Quote Request: {service}",
  emailCustomerSubjectQuote: "✅ Quote Request Received: {service} [Ref: {referenceId}] — Language Guru India",
  emailCustomerHeadingQuote: "Quotation Request Confirmed",
  emailCustomerBodyQuote: "We have successfully received your quote request. Our translation coordinators are reviewing your document scope right now.",

  emailAdminSubjectJoin: "🤝 New Linguist Application: {name} - {expertise} [Ref: {referenceId}]",
  emailAdminHeadingJoin: "New Linguist Application: {name}",
  emailCustomerSubjectJoin: "✅ Application Received: Language Guru Linguist Panel [Ref: {referenceId}]",
  emailCustomerHeadingJoin: "Application Received Successfully",
  emailCustomerBodyJoin: "Your application to join the certified translator and interpreter panel at Language Guru India has been successfully registered."
};

// ─── Helper: Get or Create singleton settings record ───────────────────────
const getOrCreateSettings = async () => {
  await ensureSettingsColumns();
  let settings = await prisma.siteSettings.findUnique({ where: { id: 'singleton' } });
  if (!settings) {
    settings = await prisma.siteSettings.create({ data: { id: 'singleton', ...DEFAULT_TEMPLATES } });
  } else {
    // Fill in default templates if any are null/undefined
    let needsUpdate = false;
    const patchData = {};
    for (const [key, defaultVal] of Object.entries(DEFAULT_TEMPLATES)) {
      if (!settings[key]) {
        patchData[key] = defaultVal;
        settings[key] = defaultVal;
        needsUpdate = true;
      }
    }
    if (needsUpdate) {
      try {
        await prisma.siteSettings.update({
          where: { id: 'singleton' },
          data: patchData
        });
      } catch (err) {
        console.warn('Could not backfill default templates:', err && err.message ? err.message : err);
      }
    }
  }
  return settings;
};

// GET /api/v1/settings (Admin full access)
const getSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    return res.status(200).json({ success: true, settings });
  } catch (error) {
    console.error('Settings GET error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const getPublicSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    const { gstNumber, panNumber, ...publicSettings } = settings;
    return res.status(200).json({ success: true, settings: publicSettings });
  } catch (error) {
    console.error('Public Settings GET error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// PUT /api/v1/settings
const updateSettings = async (req, res) => {
  try {
    const allowedFields = [
      'companyName', 'logoUrl', 'tagline', 'phone', 'email', 'address', 'website',
      'facebook', 'instagram', 'twitter', 'linkedin', 'youtube',
      'defaultTurnaround', 'pricePerPage', 'gstNumber', 'panNumber',
      'metaTitle', 'metaDesc', 'heroHeading', 'heroSubtitle',
      'whatsappNumber', 'maintenanceMode', 'heroBgImage',
      'bankName', 'bankAccountName', 'bankAccountNo', 'bankIFSC', 'bankBranch', 'upiId', 'paypalEmail',
      'stat1Value', 'stat1Label', 'stat2Value', 'stat2Label', 'stat3Value', 'stat3Label', 'stat4Value', 'stat4Label',
      'whyChooseTag', 'whyChooseTitle', 'whyChooseSubtitle',
      'heroTopBadge', 'heroTopLine', 'heroTrustBadge1', 'heroTrustBadge2', 'heroTrustBadge3', 'heroTrustBadge4',
      'whatsappQuoteTemplate', 'whatsappContactTemplate', 'whatsappJoinTemplate',
      'emailAdminSubjectContact', 'emailAdminHeadingContact',
      'emailCustomerSubjectContact', 'emailCustomerHeadingContact',
      'emailAdminSubjectQuote', 'emailAdminHeadingQuote',
      'emailCustomerSubjectQuote', 'emailCustomerHeadingQuote',
      'emailAdminSubjectJoin', 'emailAdminHeadingJoin',
      'emailCustomerSubjectJoin', 'emailCustomerHeadingJoin',
      'emailCustomerBodyContact', 'emailCustomerBodyQuote', 'emailCustomerBodyJoin'
    ];

    const updateData = {};
    if (req.body.phone && (!req.body.whatsappNumber || req.body.whatsappNumber === '+919147433460')) {
      updateData.whatsappNumber = req.body.phone;
    }
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    const settings = await prisma.siteSettings.upsert({
      where: { id: 'singleton' },
      create: { id: 'singleton', ...updateData },
      update: updateData,
    });

    return res.status(200).json({ success: true, settings, message: 'Settings saved successfully!' });
  } catch (error) {
    console.error('Settings PUT error:', error);
    return res.status(500).json({ success: false, message: 'Server error saving settings.' });
  }
};

// PUT /api/v1/settings/change-password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, username } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both current and new password are required.' });
    }

    if (newPassword.length < 12) {
      return res.status(400).json({ success: false, message: 'New password must be at least 12 characters.' });
    }
    if (!/[a-z]/.test(newPassword) || !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      return res.status(400).json({ success: false, message: 'New password must contain upper case, lower case and a number.' });
    }

    // Find the admin user
    const admin = await prisma.adminUser.findUnique({
      where: { id: req.admin.id }
    });

    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin user not found.' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    // Hash new password
    const newHash = await bcrypt.hash(newPassword, 12);

    // Update
    await prisma.adminUser.update({
      where: { id: req.admin.id },
      data: {
        passwordHash: newHash,
        passwordChangedAt: new Date(),
        ...(username && username !== admin.username ? { username } : {})
      }
    });

    // SEC-10: drop the current session; verifyAdminToken now rejects any token
    // issued before passwordChangedAt, so every other device is logged out too.
    res.clearCookie('admin_token', adminCookieOptions());

    return res.status(200).json({ success: true, message: 'Password updated successfully! Please log in again.' });
  } catch (error) {
    if (error && error.code === 'P2002') {
      return res.status(409).json({ success: false, message: 'That username is already taken.' });
    }
    console.error('Change password error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/v1/settings/admin-profile - Get admin user info (for prefill)
const getAdminProfile = async (req, res) => {
  try {
    const admin = await prisma.adminUser.findUnique({
      where: { id: req.admin.id },
      select: { id: true, username: true, name: true, role: true, createdAt: true }
    });
    return res.status(200).json({ success: true, admin });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};


// ─── SMTP Configuration & Testing ───────────────────────────────────────────

function parseSenderDisplay(fromStr, fallbackEmail) {
  if (!fromStr || !String(fromStr).trim()) {
    return `"Language Guru India" <${fallbackEmail}>`;
  }
  const str = String(fromStr).trim();
  if (!str.includes('<') && str.includes('@')) {
    return `"Language Guru India" <${str.replace(/["']/g, '').trim()}>`;
  }
  const match = str.match(/^(.*?)\s*<([^>]+)>/);
  if (match) {
    const rawName = match[1].replace(/["']/g, '').trim();
    const cleanEmail = match[2].trim();
    return `"${rawName || 'Language Guru India'}" <${cleanEmail}>`;
  }
  return str;
}

// GET /api/v1/settings/smtp
const getSmtpSettings = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      smtp: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '465', 10),
        secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
        from: (process.env.SMTP_FROM || `"Language Guru India" <${process.env.SMTP_USER || 'info@languageguruindia.com'}>`).replace(/^"+|"+$/g, '').trim(),
        adminNotificationEmail: process.env.ADMIN_NOTIFICATION_EMAIL || process.env.SMTP_USER || ''
      }
    });
  } catch (error) {
    console.error('Error getting SMTP settings:', error);
    return res.status(500).json({ success: false, message: 'Server error reading SMTP settings.' });
  }
};

// PUT /api/v1/settings/smtp
const updateSmtpSettings = async (req, res) => {
  try {
    const { host, port, secure, user, pass, from, adminNotificationEmail } = req.body;

    if (!host || !String(host).trim()) {
      return res.status(400).json({ success: false, message: 'SMTP Host is required.' });
    }
    if (!user || !String(user).trim()) {
      return res.status(400).json({ success: false, message: 'Sender Email / Username is required.' });
    }
    if (!pass || !String(pass).trim()) {
      return res.status(400).json({ success: false, message: 'SMTP Password / App Password is required.' });
    }

    const cleanHost = String(host).trim();
    const cleanPort = String(port || '465').trim();
    const isSecure = secure !== undefined ? (secure === true || secure === 'true') : (cleanPort === '465');
    const cleanSecure = isSecure ? 'true' : 'false';
    const cleanUser = String(user).trim();
    const cleanPass = String(pass).trim();
    const cleanFrom = parseSenderDisplay(from, cleanUser);
    const rawFrom = cleanFrom.replace(/^"|"$/g, '');
    const cleanAdminEmail = adminNotificationEmail && String(adminNotificationEmail).trim() ? String(adminNotificationEmail).trim() : cleanUser;

    const updates = {
      SMTP_HOST: cleanHost,
      SMTP_PORT: cleanPort,
      SMTP_SECURE: cleanSecure,
      SMTP_USER: cleanUser,
      SMTP_PASS: cleanPass,
      SMTP_FROM: cleanFrom,
      ADMIN_NOTIFICATION_EMAIL: cleanAdminEmail
    };

    // Update .env file
    updateEnvFile(updates);

    // Update in-memory process.env
    for (const [key, val] of Object.entries(updates)) {
      process.env[key] = val.replace(/^"|"$/g, '');
    }

    return res.status(200).json({
      success: true,
      message: 'SMTP settings updated successfully! Email configuration is now active.',
      smtp: {
        host: cleanHost,
        port: parseInt(cleanPort, 10),
        secure: isSecure,
        user: cleanUser,
        pass: cleanPass,
        from: rawFrom,
        adminNotificationEmail: cleanAdminEmail
      }
    });
  } catch (error) {
    console.error('Error updating SMTP settings:', error);
    return res.status(500).json({ success: false, message: 'Server error saving SMTP settings.' });
  }
};

// POST /api/v1/settings/smtp/test
const testSmtpSettings = async (req, res) => {
  try {
    const { host, port, secure, user, pass, from, adminNotificationEmail } = req.body;

    const testHost = host ? String(host).trim() : (process.env.SMTP_HOST || 'smtp.gmail.com');
    const testPort = parseInt(port || process.env.SMTP_PORT || '465', 10);
    const testSecure = secure !== undefined ? (secure === true || secure === 'true') : (testPort === 465 || process.env.SMTP_SECURE === 'true');
    const testUser = user ? String(user).trim() : process.env.SMTP_USER;
    const testPass = pass ? String(pass).trim() : process.env.SMTP_PASS;
    const targetEmail = (adminNotificationEmail && String(adminNotificationEmail).trim()) || process.env.ADMIN_NOTIFICATION_EMAIL || testUser;

    if (!testHost || !testUser || !testPass) {
      return res.status(400).json({
        success: false,
        message: 'SMTP Host, Sender Email/Username, and Password/App Password are required to test.'
      });
    }

    if (!targetEmail) {
      return res.status(400).json({
        success: false,
        message: 'Recipient email address (Admin Notification Email) is required.'
      });
    }

    const cleanPass = String(testPass).replace(/\s+/g, '');
    const transporter = nodemailer.createTransport({
      host: testHost,
      port: testPort,
      secure: testSecure,
      auth: {
        user: testUser,
        pass: cleanPass
      },
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000
    });

    // Step 1: Verify SMTP credentials
    await transporter.verify();

    // Step 2: Send test email
    const senderDisplay = parseSenderDisplay(from, testUser);
    const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    await transporter.sendMail({
      from: senderDisplay,
      to: targetEmail,
      subject: `🧪 Language Guru - SMTP Test Email (${now})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
          <div style="background: linear-gradient(135deg, #16a34a, #059669); padding: 24px; color: #ffffff; text-align: center;">
            <h1 style="margin: 0; font-size: 22px;">✓ SMTP Connection Successful!</h1>
            <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.95;">Your Language Guru email configuration is active and working.</p>
          </div>
          <div style="padding: 24px; background: #ffffff;">
            <p style="font-size: 14px; color: #334155; margin-top: 0;">This test confirms that outgoing emails (Quote Requests, Contact Inquiries, and Linguist Applications) are configured properly and delivering successfully.</p>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin: 20px 0;">
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; color: #64748b; font-weight: bold; width: 40%;">SMTP Host:</td>
                <td style="padding: 10px 0; color: #0f172a; font-family: monospace;">${testHost}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; color: #64748b; font-weight: bold;">SMTP Port:</td>
                <td style="padding: 10px 0; color: #0f172a; font-family: monospace;">${testPort} (${testSecure ? 'SSL' : 'TLS'})</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; color: #64748b; font-weight: bold;">Sender Account:</td>
                <td style="padding: 10px 0; color: #0f172a;">${testUser}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; color: #64748b; font-weight: bold;">Recipient (Admin Email):</td>
                <td style="padding: 10px 0; color: #0f172a;">${targetEmail}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #64748b; font-weight: bold;">Timestamp:</td>
                <td style="padding: 10px 0; color: #0f172a;">${now} IST</td>
              </tr>
            </table>
            <div style="padding: 12px 16px; background: #f0fdf4; border-left: 4px solid #16a34a; border-radius: 6px; font-size: 13px; color: #166534;">
              All future emails submitted through the website will be sent from this account to <strong>${targetEmail}</strong>.
            </div>
          </div>
          <div style="background: #f8fafc; padding: 14px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9;">
            Language Guru India — Certified Translation Management System
          </div>
        </div>
      `
    });

    return res.status(200).json({
      success: true,
      message: `Test email sent successfully to ${targetEmail}! Please check your inbox.`
    });
  } catch (error) {
    console.error('SMTP test error:', error);
    let errMsg = error.message || 'Failed to connect to SMTP server.';
    if (errMsg.includes('535') || errMsg.includes('BadCredentials') || errMsg.includes('Username and Password not accepted')) {
      errMsg = 'Authentication failed: Google/SMTP rejected your username or app password. Please ensure 2-Step Verification is enabled and you generated a 16-character App Password (not your personal Google account password).';
    } else if (errMsg.includes('ETIMEDOUT') || errMsg.includes('ECONNREFUSED')) {
      const pUsed = req.body.port || 465;
      const altP = (pUsed == 465) ? '587 (TLS)' : '465 (SSL)';
      errMsg = `Connection timeout: Could not connect to ${req.body.host || 'SMTP host'} on port ${pUsed}. Your server firewall may be blocking outbound port ${pUsed}. Try switching to Port ${altP}.`;
    }
    return res.status(400).json({
      success: false,
      message: errMsg
    });
  }
};

module.exports = { getSettings, getPublicSettings, updateSettings, changePassword, getAdminProfile, getSmtpSettings, updateSmtpSettings, testSmtpSettings };
