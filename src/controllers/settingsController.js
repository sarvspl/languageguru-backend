const bcrypt = require('bcryptjs');
const prisma = require('../config/db');

// ─── Helper: Get or Create singleton settings record ───────────────────────
const getOrCreateSettings = async () => {
  let settings = await prisma.siteSettings.findUnique({ where: { id: 'singleton' } });
  if (!settings) {
    settings = await prisma.siteSettings.create({ data: { id: 'singleton' } });
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
      'heroTopBadge', 'heroTopLine', 'heroTrustBadge1', 'heroTrustBadge2', 'heroTrustBadge3', 'heroTrustBadge4'
    ];

    const updateData = {};
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
    res.clearCookie('admin_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/'
    });

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

module.exports = { getSettings, getPublicSettings, updateSettings, changePassword, getAdminProfile };
