const prisma = require('../config/db');

// Get active FAQs (public)
exports.getFaqs = async (req, res) => {
  try {
    const faqs = await prisma.faq.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });
    res.json({ success: true, data: faqs });
  } catch (error) {
    console.error('Error fetching faqs:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Admin: Get all FAQs
exports.getAllFaqs = async (req, res) => {
  try {
    const faqs = await prisma.faq.findMany({
      orderBy: { sortOrder: 'asc' }
    });
    res.json({ success: true, data: faqs });
  } catch (error) {
    console.error('Error fetching all faqs:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Admin: Create FAQ
exports.createFaq = async (req, res) => {
  try {
    const { question, answer, category, isActive, sortOrder } = req.body;
    const faq = await prisma.faq.create({
      data: {
        question,
        answer,
        category: category || 'General',
        isActive: isActive !== undefined ? isActive : true,
        sortOrder: sortOrder ? parseInt(sortOrder) : 0
      }
    });
    res.status(201).json({ success: true, data: faq });
  } catch (error) {
    console.error('Error creating faq:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Admin: Update FAQ
exports.updateFaq = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer, category, isActive, sortOrder } = req.body;

    const existing = await prisma.faq.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'FAQ not found' });
    }

    const faq = await prisma.faq.update({
      where: { id },
      data: {
        question: question !== undefined ? question : existing.question,
        answer: answer !== undefined ? answer : existing.answer,
        category: category !== undefined ? category : existing.category,
        isActive: isActive !== undefined ? isActive : existing.isActive,
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : existing.sortOrder
      }
    });
    res.json({ success: true, data: faq });
  } catch (error) {
    console.error('Error updating faq:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Admin: Delete FAQ
exports.deleteFaq = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.faq.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: 'FAQ not found' });

    await prisma.faq.delete({ where: { id } });
    res.json({ success: true, message: 'FAQ deleted successfully.' });
  } catch (error) {
    console.error('Error deleting faq:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
