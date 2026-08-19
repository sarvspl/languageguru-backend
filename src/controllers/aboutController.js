const prisma = require('../config/db');

const DEFAULT_ABOUT = {
  id: 'singleton',
  heroTitle: 'About Language Guru',
  heroSubtitle: "India's most trusted ISO-certified translation agency since 2005",
  storyTag: 'Our Story',
  storyHeading: 'Language Guru – A Subsidiary of Language Guru',
  storyParagraph1: 'LANGUAGE GURU, a Subsidiary of Language Guru, is a one-stop language translation and interpretation service provider. Founded in 2005, based in New Delhi, we provide dedicated Document Translation Services, Interpretation and Recruitment Services for all Languages across the Globe.',
  storyParagraph2: 'Headquartered at 617, West End Mall, Janakpuri, New Delhi – 110058. ISO-9001:2015 and ISO 17100:2015 certified. MSME registered and government-authorized.',
  storyBtn1Text: '📋 Get Free Quote',
  storyBtn1Link: '/quote',
  storyBtn2Text: '📞 Contact Us',
  storyBtn2Link: '/contact',
  stat1Num: '2005',
  stat1Label: 'Founded',
  stat2Num: '120+',
  stat2Label: 'Languages',
  stat3Num: '50K+',
  stat3Label: 'Documents',
  stat4Num: '150+',
  stat4Label: 'Cities',
  stat5Num: '10K+',
  stat5Label: 'Clients',
  stat6Num: '4.9★',
  stat6Label: 'Rating',
  whyChooseItems: JSON.stringify([
    { ic: '🏛️', t: 'Government Authorized', d: 'MSME registered, ISO-9001:2015 and ISO 17100:2015. Accepted by MEA, all courts, and all embassies across India.' },
    { ic: '🌍', t: '120+ Languages', d: 'Native speakers for every language — European, Asian, Middle Eastern, Indian regional.' },
    { ic: '✅', t: 'Embassy Accepted', d: 'All certified translations accepted by all 60+ embassies in India. 100% acceptance rate.' },
    { ic: '⚡', t: '24-Hour Express', d: 'Urgent translation in 24 hours for all common language pairs. Weekend service available.' },
    { ic: '🔒', t: '100% Confidential', d: 'NDA-backed confidentiality. Secure document handling. GDPR-compliant practices.' },
    { ic: '🚗', t: 'Easy Document Submission', d: 'Office submission in Delhi or scanned copies via email / WhatsApp. Pan-India courier available for all cities.' }
  ]),
  certSectionTitle: 'Certifications & Accreditations',
  certItems: JSON.stringify([
    { ic: '📋', t: 'ISO 9001:2015', s: 'Quality Management' },
    { ic: '🌐', t: 'ISO 17100:2015', s: 'Translation Services' },
    { ic: '🏛️', t: 'MSME Registered', s: 'Govt. of India' },
    { ic: '🏅', t: 'MEA Empanelled', s: 'Ministry External Affairs' }
  ]),
  ctaHeading: 'Ready to Get Started?',
  ctaSubtitle: 'Get a free quote in 30 minutes. ISO-certified translations accepted by all embassies.',
  ctaBtn1Text: '📋 Get Quote',
  ctaBtn1Link: '/quote',
  ctaBtn2Text: '📞 Call Now',
  metaTitle: "About Language Guru — India's Trusted ISO-Certified Translation Agency",
  metaDesc: 'Learn about Language Guru India — founded in 2005, ISO 9001:2015 & ISO 17100:2015 certified, MSME registered, serving 120+ languages across 150+ cities.'
};

const getOrCreateAbout = async () => {
  let about = await prisma.aboutPage.findUnique({ where: { id: 'singleton' } });
  if (!about) {
    about = await prisma.aboutPage.create({ data: DEFAULT_ABOUT });
  }
  return about;
};

// GET /api/v1/about
exports.getAbout = async (req, res) => {
  try {
    const about = await getOrCreateAbout();
    
    // Parse JSON arrays for convenient frontend consumption
    let parsedWhyChoose = [];
    let parsedCerts = [];
    try {
      parsedWhyChoose = typeof about.whyChooseItems === 'string' ? JSON.parse(about.whyChooseItems) : (about.whyChooseItems || []);
    } catch {
      parsedWhyChoose = [];
    }
    try {
      parsedCerts = typeof about.certItems === 'string' ? JSON.parse(about.certItems) : (about.certItems || []);
    } catch {
      parsedCerts = [];
    }

    res.json({
      success: true,
      data: {
        ...about,
        whyChooseList: parsedWhyChoose,
        certList: parsedCerts
      }
    });
  } catch (error) {
    console.error('Error in getAbout:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/v1/about
exports.updateAbout = async (req, res) => {
  try {
    const allowedFields = [
      'heroTitle', 'heroSubtitle',
      'storyTag', 'storyHeading', 'storyParagraph1', 'storyParagraph2',
      'storyBtn1Text', 'storyBtn1Link', 'storyBtn2Text', 'storyBtn2Link',
      'stat1Num', 'stat1Label', 'stat2Num', 'stat2Label', 'stat3Num', 'stat3Label',
      'stat4Num', 'stat4Label', 'stat5Num', 'stat5Label', 'stat6Num', 'stat6Label',
      'whyChooseItems', 'certSectionTitle', 'certItems',
      'ctaHeading', 'ctaSubtitle', 'ctaBtn1Text', 'ctaBtn1Link', 'ctaBtn2Text',
      'metaTitle', 'metaDesc'
    ];

    const updateData = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === 'whyChooseItems' || field === 'certItems') {
          updateData[field] = typeof req.body[field] === 'string' ? req.body[field] : JSON.stringify(req.body[field]);
        } else {
          updateData[field] = req.body[field];
        }
      }
    }

    const updated = await prisma.aboutPage.upsert({
      where: { id: 'singleton' },
      create: { id: 'singleton', ...DEFAULT_ABOUT, ...updateData },
      update: updateData
    });

    let parsedWhyChoose = [];
    let parsedCerts = [];
    try {
      parsedWhyChoose = typeof updated.whyChooseItems === 'string' ? JSON.parse(updated.whyChooseItems) : (updated.whyChooseItems || []);
    } catch {
      parsedWhyChoose = [];
    }
    try {
      parsedCerts = typeof updated.certItems === 'string' ? JSON.parse(updated.certItems) : (updated.certItems || []);
    } catch {
      parsedCerts = [];
    }

    res.json({
      success: true,
      data: {
        ...updated,
        whyChooseList: parsedWhyChoose,
        certList: parsedCerts
      },
      message: 'About page updated successfully'
    });
  } catch (error) {
    console.error('Error in updateAbout:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
