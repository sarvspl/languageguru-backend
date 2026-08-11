const prisma = require('../config/db');

// Submit quote request (Public)
const submitQuote = async (req, res) => {
  try {
    const { name, email, phone, serviceKey, sourceLang, targetLang, pages, isInterpreter, notes } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Name and phone are required.' });
    }

    const quote = await prisma.quoteRequest.create({
      data: {
        name,
        email,
        phone,
        serviceKey,
        sourceLang,
        targetLang,
        pages: parseInt(pages) || 1,
        isInterpreter: Boolean(isInterpreter),
        notes
      }
    });

    return res.status(201).json({ success: true, message: 'Quote request submitted successfully!', data: quote });
  } catch (error) {
    console.error('Submit quote error:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit quote request.' });
  }
};

// Get all quotes (Admin)
const getQuotes = async (req, res) => {
  try {
    const quotes = await prisma.quoteRequest.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return res.status(200).json({ success: true, data: quotes });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch quote requests.' });
  }
};

// Update quote status (Admin)
const updateQuoteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await prisma.quoteRequest.update({
      where: { id },
      data: { status }
    });

    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update quote status.' });
  }
};

// Delete a quote request (Admin)
const deleteQuote = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.quoteRequest.delete({ where: { id } });
    return res.status(200).json({ success: true, message: 'Quote deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete quote.' });
  }
};

module.exports = { submitQuote, getQuotes, updateQuoteStatus, deleteQuote };
