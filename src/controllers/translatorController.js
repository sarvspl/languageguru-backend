const prisma = require('../config/db');
const { sendLinguistApplicationNotifications } = require('../utils/emailNotifier');

// Get all translators (public — active only)
const getTranslators = async (req, res) => {
  try {
    const translators = await prisma.translator.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
    res.status(200).json({ success: true, data: translators });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching translators.' });
  }
};

// Get ALL translators (admin — includes inactive)
const getAllTranslators = async (req, res) => {
  try {
    const translators = await prisma.translator.findMany({ orderBy: { name: 'asc' } });
    res.status(200).json({ success: true, data: translators });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching translators.' });
  }
};

// Create a translator
const createTranslator = async (req, res) => {
  try {
    const { name, lang, city, spec, exp, rate, cert, email, phone, resumeUrl, isActive } = req.body;
    if (!name || !lang || !city) {
      return res.status(400).json({ success: false, message: 'name, lang, and city are required.' });
    }
    const translator = await prisma.translator.create({
      data: {
        name,
        lang,
        city,
        spec,
        exp,
        rate,
        cert,
        email: email ? email.trim() : null,
        phone: phone ? phone.trim() : null,
        resumeUrl: resumeUrl || null,
        isActive: isActive !== false
      }
    });
    res.status(201).json({ success: true, data: translator });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error creating translator.' });
  }
};

// Update a translator
const updateTranslator = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, lang, city, spec, exp, rate, cert, email, phone, resumeUrl, isActive } = req.body;
    const existing = await prisma.translator.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Translator not found.' });

    const translator = await prisma.translator.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existing.name,
        lang: lang !== undefined ? lang : existing.lang,
        city: city !== undefined ? city : existing.city,
        spec: spec !== undefined ? spec : existing.spec,
        exp: exp !== undefined ? exp : existing.exp,
        rate: rate !== undefined ? rate : existing.rate,
        cert: cert !== undefined ? cert : existing.cert,
        email: email !== undefined ? (email ? email.trim() : null) : existing.email,
        phone: phone !== undefined ? (phone ? phone.trim() : null) : existing.phone,
        resumeUrl: resumeUrl !== undefined ? resumeUrl : existing.resumeUrl,
        isActive: isActive !== undefined ? isActive : existing.isActive
      }
    });
    res.status(200).json({ success: true, data: translator });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating translator.' });
  }
};

// Delete a translator
const deleteTranslator = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.translator.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Translator not found.' });

    await prisma.translator.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Translator deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting translator.' });
  }
};

// Public: Submit translator application from Join page
const applyTranslator = async (req, res) => {
  try {
    const { name, email, mobile, city, srcLang, tgtLang, expertise, experience, intro, rate, cert } = req.body;

    if (!name || !city) {
      return res.status(400).json({ success: false, message: 'Name and city are required.' });
    }

    let resumeUrl = req.body.resumeUrl || null;
    if (req.file) {
      resumeUrl = `/uploads/${req.file.filename}`;
    }

    const expStr = experience ? (String(experience).toLowerCase().includes('year') ? experience : `${experience} exp`) : '3+ years';
    const langStr = (srcLang && tgtLang) ? `${srcLang.trim()} → ${tgtLang.trim()}` : (tgtLang ? tgtLang.trim() : (srcLang ? srcLang.trim() : 'English'));
    const certStr = cert ? cert.trim() : `Certified ${langStr} Specialist`;
    const rateStr = rate ? rate.trim() : '₹850/pg';
    const specStr = expertise ? expertise.trim() : 'General';

    const translator = await prisma.translator.create({
      data: {
        name: name.trim(),
        lang: langStr,
        city: city.trim(),
        spec: specStr,
        exp: expStr,
        rate: rateStr,
        cert: certStr,
        email: email ? email.trim() : null,
        phone: mobile ? mobile.trim() : null,
        resumeUrl: resumeUrl || null,
        isActive: false // Set to false by default — requires Admin approval to appear on frontend!
      }
    });

    // Trigger dual email notification (Admin alert + Applicant confirmation)
    const originalFileName = req.file ? req.file.originalname : (req.body.fileName || null);
    sendLinguistApplicationNotifications({
      referenceId: `LG-JOIN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      name: translator.name,
      email: translator.email,
      phone: translator.phone,
      city: translator.city,
      srcLang,
      tgtLang,
      expertise: specStr,
      experience: expStr,
      intro,
      resumeUrl: translator.resumeUrl,
      originalFileName
    }).catch(emailErr => console.error('Linguist application email notification error:', emailErr));

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully! Our team will review your application within 2-3 working days.',
      data: translator
    });
  } catch (error) {
    console.error('Error in applyTranslator:', error);
    res.status(500).json({ success: false, message: 'Server error submitting application.' });
  }
};

module.exports = { getTranslators, getAllTranslators, createTranslator, updateTranslator, deleteTranslator, applyTranslator };
