const prisma = require('../config/db');

// Submit quote request (Public)
const submitQuote = async (req, res) => {
  try {
    const { name, email, phone, serviceKey, sourceLang, targetLang, pages, isInterpreter, notes, service, city, message } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Name and phone are required.' });
    }

    const numericMap = {
      '850': 'Certified Translation',
      '899': 'Website Localization',
      '999': 'Notarized Translation',
      '1400': 'Apostille & Attestation',
      '2500': 'Interpreter Service',
      '4500': 'Interpreter Service (Half-Day)',
      '7500': 'Interpreter Service (Full-Day)',
      'certified': 'Certified Translation',
      'legal': 'Legal Translation',
      'medical': 'Medical Translation',
      'technical': 'Technical Translation',
      'business': 'Business Translation',
      'academic': 'Academic Translation',
      'interpretation': 'Interpretation Service',
      'apostille': 'MEA Apostille',
      'attestation': 'Embassy Attestation',
      'localization': 'Website Localization'
    };
    let cleanKey = (serviceKey || service || 'Certified Translation').toString().trim();
    if (numericMap[cleanKey.toLowerCase()]) {
      cleanKey = numericMap[cleanKey.toLowerCase()];
    } else {
      cleanKey = cleanKey.split(' — ')[0].split(' - ')[0].trim();
    }
    const finalServiceKey = cleanKey;
    const finalNotes = notes || [
      city ? `City: ${city}` : '',
      message ? `Message: ${message}` : ''
    ].filter(Boolean).join('\n') || null;

    const quote = await prisma.quoteRequest.create({
      data: {
        name: name.trim(),
        email: email ? email.trim() : null,
        phone: phone.trim(),
        serviceKey: finalServiceKey,
        sourceLang: sourceLang || null,
        targetLang: targetLang || null,
        pages: parseInt(pages) || 1,
        isInterpreter: Boolean(isInterpreter),
        notes: finalNotes
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
    
    const validStatuses = ['PENDING', 'CONTACTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

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
