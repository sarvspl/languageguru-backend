const prisma = require('../config/db');

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
    const { name, lang, city, spec, exp, rate, cert, isActive } = req.body;
    if (!name || !lang || !city) {
      return res.status(400).json({ success: false, message: 'name, lang, and city are required.' });
    }
    const translator = await prisma.translator.create({
      data: { name, lang, city, spec, exp, rate, cert, isActive: isActive !== false }
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
    const { name, lang, city, spec, exp, rate, cert, isActive } = req.body;
    const existing = await prisma.translator.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Translator not found.' });

    const translator = await prisma.translator.update({
      where: { id },
      data: { name, lang, city, spec, exp, rate, cert, isActive }
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

    const expStr = experience ? (String(experience).toLowerCase().includes('year') ? experience : `${experience} exp`) : '3+ years';
    const langStr = tgtLang ? tgtLang.trim() : (srcLang ? srcLang.trim() : 'English');
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
        isActive: true
      }
    });

    // Also record application into QuoteRequest for admin notification / lead tracking
    try {
      const year = new Date().getFullYear();
      const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
      const referenceId = `LG-JOIN-${year}-${randomSuffix}`;
      const notes = [
        `Applicant Name: ${name}`,
        `Phone: ${mobile || 'N/A'}`,
        `Email: ${email || 'N/A'}`,
        `City: ${city}`,
        `Language Pair: ${srcLang || 'N/A'} → ${tgtLang || 'N/A'}`,
        `Expertise: ${specStr}`,
        `Experience: ${expStr}`,
        intro ? `Cover Note: ${intro}` : ''
      ].filter(Boolean).join('\n');

      await prisma.quoteRequest.create({
        data: {
          name: name.trim(),
          email: email ? email.trim() : null,
          phone: mobile ? mobile.trim() : 'N/A',
          serviceKey: 'Linguist Application',
          sourceLang: srcLang || null,
          targetLang: tgtLang || null,
          pages: 1,
          isInterpreter: false,
          notes: `Ref: ${referenceId} | ${notes}`
        }
      });
    } catch (leadErr) {
      console.warn('Failed to record applicant in QuoteRequest:', leadErr);
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully! Your profile is now visible on our translation team page.',
      data: translator
    });
  } catch (error) {
    console.error('Error in applyTranslator:', error);
    res.status(500).json({ success: false, message: 'Server error submitting application.' });
  }
};

module.exports = { getTranslators, getAllTranslators, createTranslator, updateTranslator, deleteTranslator, applyTranslator };
