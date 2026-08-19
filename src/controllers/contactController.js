const prisma = require('../config/db');

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

// GET /api/v1/contact
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

// PUT /api/v1/contact
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
