const crypto = require('crypto');
const prisma = require('../config/db');
const {
  isValidEmail,
  sendAdminContactInquiryNotification,
  sendCustomerContactInquiryConfirmation
} = require('../utils/emailNotifier');

const DEFAULT_CONTACT = {
  id: 'singleton',
  heroTitle: '📞 Contact Us',
  heroSubtitle: 'Reach out via call, WhatsApp, email or visit our office. Response in 30 minutes.',
  heroCallBtnText: '📞 Call Now',
  heroWaBtnText: '💬 WhatsApp',
  card1Icon: '📞',
  card1Title: 'Call / WhatsApp',
  card1Phone: '+91-9312690490',
  card1Timing: 'Mon–Sat: 9 AM – 7 PM • Sun: 10 AM – 4 PM',
  card1BtnText: '💬 WhatsApp Now',
  card2Icon: '✉️',
  card2Title: 'Email Us',
  card2Email: 'info@languageguruindia.com',
  card2Timing: 'Response within 1 hour during working hours',
  card2BtnText: '✉️ Send Email',
  card3Icon: '📍',
  card3Title: 'Visit Our Office',
  card3Address: '617, West End Mall, Janakpuri, New Delhi – 110058',
  card3BtnText: '📍 Get Directions',
  mapUrl: '',
  formTitle: 'Send Us a Message',
  formBtnText: '📬 Send Message',
  formNote1: '*Indicative rates only; final charges may vary by language pair, document type, complexity & number of pages.',
  formNote2: '🔒 Secure & confidential · Response in 30 minutes',
  hoursTitle: '⏱️ Working Hours',
  hoursMonFri: '9:00 AM — 7:00 PM',
  hoursSat: '10:00 AM — 6:00 PM',
  hoursSun: '10:00 AM — 4:00 PM',
  urgentText: '🆘 Urgent: WhatsApp 24/7 at +91-9312690490',
  certsTitle: '🏆 Certifications',
  certsList: JSON.stringify([
    '🏅 ISO 9001:2015',
    '🏅 ISO 17100:2015',
    '🏆 MSME Registered',
    '🏛️ Govt. Authorized',
    '🏛️ MEA Empanelled',
    '⭐ 4.9/5 Rating'
  ]),
  metaTitle: 'Contact Us — Language Guru',
  metaDesc: 'Contact Language Guru: 617 West End Mall, Janakpuri, New Delhi. Phone, email and WhatsApp.'
};

const getContactData = async () => {
  if (prisma.contactPage && typeof prisma.contactPage.findUnique === 'function') {
    let contact = await prisma.contactPage.findUnique({ where: { id: 'singleton' } });
    if (!contact) {
      contact = await prisma.contactPage.create({ data: DEFAULT_CONTACT });
    }
    return contact;
  }

  // Fallback to raw SQL
  const rows = await prisma.$queryRawUnsafe('SELECT * FROM "ContactPage" WHERE id = \'singleton\' LIMIT 1');
  if (rows && rows.length > 0) {
    return rows[0];
  }

  const keys = Object.keys(DEFAULT_CONTACT);
  const cols = keys.map(k => `"${k}"`).join(', ') + ', "updatedAt"';
  const vals = keys.map(k => `'${DEFAULT_CONTACT[k].replace(/'/g, "''")}'`).join(', ') + ', NOW()';
  await prisma.$executeRawUnsafe(`INSERT INTO "ContactPage" (${cols}) VALUES (${vals})`);
  const newRows = await prisma.$queryRawUnsafe('SELECT * FROM "ContactPage" WHERE id = \'singleton\' LIMIT 1');
  return newRows[0] || DEFAULT_CONTACT;
};

// GET /api/v1/contact (Public CMS content)
exports.getContact = async (req, res) => {
  try {
    const contact = await getContactData();
    
    let parsedCerts = [];
    try {
      parsedCerts = typeof contact.certsList === 'string' ? JSON.parse(contact.certsList) : (contact.certsList || []);
    } catch {
      parsedCerts = [];
    }

    res.json({
      success: true,
      data: {
        ...contact,
        certBadges: parsedCerts
      }
    });
  } catch (error) {
    console.error('Error in getContact:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/v1/contact (Admin CMS update)
exports.updateContact = async (req, res) => {
  try {
    const allowedFields = [
      'heroTitle', 'heroSubtitle', 'heroCallBtnText', 'heroWaBtnText',
      'card1Icon', 'card1Title', 'card1Phone', 'card1Timing', 'card1BtnText',
      'card2Icon', 'card2Title', 'card2Email', 'card2Timing', 'card2BtnText',
      'card3Icon', 'card3Title', 'card3Address', 'card3BtnText', 'mapUrl',
      'formTitle', 'formBtnText', 'formNote1', 'formNote2',
      'hoursTitle', 'hoursMonFri', 'hoursSat', 'hoursSun', 'urgentText',
      'certsTitle', 'certsList',
      'metaTitle', 'metaDesc'
    ];

    const updateData = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === 'certsList') {
          updateData[field] = typeof req.body[field] === 'string' ? req.body[field] : JSON.stringify(req.body[field]);
        } else {
          updateData[field] = String(req.body[field]);
        }
      }
    }

    if (prisma.contactPage && typeof prisma.contactPage.upsert === 'function') {
      const updated = await prisma.contactPage.upsert({
        where: { id: 'singleton' },
        create: { id: 'singleton', ...DEFAULT_CONTACT, ...updateData },
        update: updateData
      });

      let parsedCerts = [];
      try {
        parsedCerts = typeof updated.certsList === 'string' ? JSON.parse(updated.certsList) : (updated.certsList || []);
      } catch {
        parsedCerts = [];
      }

      return res.json({
        success: true,
        data: {
          ...updated,
          certBadges: parsedCerts
        },
        message: 'Contact page updated successfully'
      });
    }

    // Raw SQL update fallback
    const updateEntries = Object.entries(updateData);
    if (updateEntries.length > 0) {
      const setClause = updateEntries.map(([k, v]) => `"${k}" = '${String(v).replace(/'/g, "''")}'`).join(', ') + ', "updatedAt" = NOW()';
      await prisma.$executeRawUnsafe(`UPDATE "ContactPage" SET ${setClause} WHERE id = 'singleton'`);
    }

    const rows = await prisma.$queryRawUnsafe('SELECT * FROM "ContactPage" WHERE id = \'singleton\' LIMIT 1');
    const updated = rows[0] || DEFAULT_CONTACT;

    let parsedCerts = [];
    try {
      parsedCerts = typeof updated.certsList === 'string' ? JSON.parse(updated.certsList) : (updated.certsList || []);
    } catch {
      parsedCerts = [];
    }

    res.json({
      success: true,
      data: {
        ...updated,
        certBadges: parsedCerts
      },
      message: 'Contact page updated successfully'
    });
  } catch (error) {
    console.error('Error in updateContact:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// CONTACT INQUIRIES MANAGEMENT (Public Submission & Admin Viewing)
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/v1/contact/inquiry (Public submission from /contact page)
exports.submitContactInquiry = async (req, res) => {
  try {
    const { name, phone, email, city, service, message } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Full name and phone number are required.' });
    }

    if (email && !isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid authentic email address.' });
    }

    const cleanName = String(name).trim().slice(0, 120);
    const cleanPhone = String(phone).trim().slice(0, 32);
    const cleanEmail = email ? String(email).trim().slice(0, 160) : null;
    const cleanCity = city ? String(city).trim().slice(0, 100) : null;
    const cleanService = service ? String(service).trim().slice(0, 120) : 'General Inquiry';
    const cleanMessage = message ? String(message).trim().slice(0, 4000) : '';

    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
    const referenceId = `LG-CNT-${year}-${randomSuffix}`;
    const newId = crypto.randomUUID();

    if (prisma.contactInquiry && typeof prisma.contactInquiry.create === 'function') {
      await prisma.contactInquiry.create({
        data: {
          id: newId,
          referenceId,
          name: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
          city: cleanCity,
          service: cleanService,
          message: cleanMessage,
          status: 'new'
        }
      });
    } else {
      await prisma.$executeRaw`
        INSERT INTO "ContactInquiry" ("id", "referenceId", "name", "email", "phone", "city", "service", "message", "status", "createdAt", "updatedAt")
        VALUES (${newId}, ${referenceId}, ${cleanName}, ${cleanEmail}, ${cleanPhone}, ${cleanCity}, ${cleanService}, ${cleanMessage}, 'new', NOW(), NOW())
      `;
    }

    // Trigger Admin notification (asynchronous, non-blocking)
    sendAdminContactInquiryNotification({
      referenceId,
      name: cleanName,
      phone: cleanPhone,
      email: cleanEmail,
      city: cleanCity,
      service: cleanService,
      message: cleanMessage
    }).catch(err => console.error('[CONTACT INQUIRY] Admin email notification error:', err));

    // Trigger Customer confirmation (if valid email provided)
    if (isValidEmail(cleanEmail)) {
      sendCustomerContactInquiryConfirmation({
        toEmail: cleanEmail,
        name: cleanName,
        city: cleanCity,
        referenceId,
        service: cleanService,
        message: cleanMessage
      }).catch(err => console.error('[CONTACT INQUIRY] Customer confirmation email error:', err));
    }

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your message has been sent successfully.',
      refId: referenceId
    });
  } catch (error) {
    console.error('Error submitting contact inquiry:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit contact message.' });
  }
};

// GET /api/v1/contact/inquiries (Admin fetch all submitted contact inquiries)
exports.getContactInquiries = async (req, res) => {
  try {
    let inquiries = [];
    if (prisma.contactInquiry && typeof prisma.contactInquiry.findMany === 'function') {
      inquiries = await prisma.contactInquiry.findMany({
        orderBy: { createdAt: 'desc' }
      });
    } else {
      inquiries = await prisma.$queryRaw`
        SELECT * FROM "ContactInquiry" ORDER BY "createdAt" DESC
      `;
    }

    return res.status(200).json({ success: true, data: inquiries });
  } catch (error) {
    console.error('Error fetching contact inquiries:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching contact inquiries.' });
  }
};

// PATCH /api/v1/contact/inquiries/:id/status (Admin update status)
exports.updateContactInquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ['new', 'contacted', 'resolved'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    if (prisma.contactInquiry && typeof prisma.contactInquiry.update === 'function') {
      await prisma.contactInquiry.update({
        where: { id },
        data: { status }
      });
    } else {
      await prisma.$executeRaw`
        UPDATE "ContactInquiry" SET "status" = ${status}, "updatedAt" = NOW() WHERE "id" = ${id}
      `;
    }

    return res.status(200).json({ success: true, message: 'Status updated successfully.' });
  } catch (error) {
    console.error('Error updating inquiry status:', error);
    return res.status(500).json({ success: false, message: 'Failed to update status.' });
  }
};

// DELETE /api/v1/contact/inquiries/:id (Admin delete inquiry)
exports.deleteContactInquiry = async (req, res) => {
  try {
    const { id } = req.params;

    if (prisma.contactInquiry && typeof prisma.contactInquiry.delete === 'function') {
      await prisma.contactInquiry.delete({ where: { id } });
    } else {
      await prisma.$executeRaw`
        DELETE FROM "ContactInquiry" WHERE "id" = ${id}
      `;
    }

    return res.status(200).json({ success: true, message: 'Contact inquiry deleted successfully.' });
  } catch (error) {
    console.error('Error deleting contact inquiry:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete inquiry.' });
  }
};
