const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DEFAULT_WHY_CHOOSE = [
  {
    icon: '🎯',
    title: 'Accuracy & Expertise',
    desc: 'Certified translators with deep domain knowledge in legal, medical, technical and academic fields. Every translation reviewed by a second expert. Zero-error guarantee with free revisions on all orders.',
    sortOrder: 1,
    isActive: true
  },
  {
    icon: '🔒',
    title: 'Confidential & Secure',
    desc: 'All documents handled under strict NDA and ISO-9001:2015 and ISO 17100:2015 data-security protocols. Your personal, legal and medical documents are 100% protected from start to delivery — GDPR compliant.',
    sortOrder: 2,
    isActive: true
  },
  {
    icon: '🏛️',
    title: 'Globally Recognized',
    desc: 'Translations accepted by embassies, universities, courts and government offices in 190+ countries worldwide. MEA empanelled and embassy-approved without the need for additional certification.',
    sortOrder: 3,
    isActive: true
  },
  {
    icon: '⚡',
    title: 'Fast Turnaround',
    desc: 'Standard delivery in 2–3 business days. Express 24-hour service available for all common language pairs without compromising quality. Same-day delivery on request via WhatsApp.',
    sortOrder: 4,
    isActive: true
  },
  {
    icon: '💰',
    title: 'Transparent Pricing',
    desc: "From ₹850/page with no hidden charges. Clear per-page pricing with bulk discounts for large-volume orders. Instant online quotes available 24×7. High quality at India's most competitive rates.",
    sortOrder: 5,
    isActive: true
  },
  {
    icon: '🌐',
    title: '120+ Languages',
    desc: 'Native-speaking certified translators for every major world language — European, Asian, Indian regional and Middle Eastern. Specialized teams for rare and less-common language pairs.',
    sortOrder: 6,
    isActive: true
  }
];

async function ensureDefaultWhyChoose() {
  const count = await prisma.whyChooseItem.count();
  if (count === 0) {
    for (const item of DEFAULT_WHY_CHOOSE) {
      await prisma.whyChooseItem.create({ data: item });
    }
  }
}

exports.getWhyChoose = async (req, res) => {
  try {
    await ensureDefaultWhyChoose();
    const items = await prisma.whyChooseItem.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllWhyChoose = async (req, res) => {
  try {
    await ensureDefaultWhyChoose();
    const items = await prisma.whyChooseItem.findMany({
      orderBy: { sortOrder: 'asc' }
    });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createWhyChoose = async (req, res) => {
  try {
    const item = await prisma.whyChooseItem.create({
      data: req.body
    });
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateWhyChoose = async (req, res) => {
  try {
    const item = await prisma.whyChooseItem.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteWhyChoose = async (req, res) => {
  try {
    await prisma.whyChooseItem.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
