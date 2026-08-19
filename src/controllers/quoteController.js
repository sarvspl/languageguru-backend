const prisma = require('../config/db');

// Submit quote request (Public)
const submitQuote = async (req, res) => {
  try {
    const { name, email, phone, serviceKey, sourceLang, targetLang, pages, isInterpreter, notes, service, city, message } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Name and phone are required.' });
    }

    // SEC-08: bound every free-text field. Unbounded `notes` is the natural
    // target for spam flooding now that the endpoint is public and rate-limited
    // only per IP.
    const cap = (v, n) => (typeof v === 'string' ? v.trim().slice(0, n) : v);
    if (String(name).trim().length > 120 || String(phone).trim().length > 32) {
      return res.status(400).json({ success: false, message: 'Name or phone is too long.' });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
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
        name: cap(name, 120),
        email: email ? cap(email, 160) : null,
        phone: cap(phone, 32),
        serviceKey: cap(finalServiceKey, 60),
        sourceLang: cap(sourceLang, 60) || null,
        targetLang: cap(targetLang, 60) || null,
        pages: Math.min(Math.max(parseInt(pages) || 1, 1), 10000),
        isInterpreter: Boolean(isInterpreter),
        notes: cap(finalNotes, 4000)
      }
    });

    return res.status(201).json({ success: true, message: 'Quote request submitted successfully!', data: quote });
  } catch (error) {
    console.error('Submit quote error:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit quote request.' });
  }
};

// Get all quotes (Admin)
// BUG-15: paginated. Returning every quote ever created was fine at 50 rows and
// a multi-megabyte response at 50,000. `all=true` is kept for admin exports.
const getQuotes = async (req, res) => {
  try {
    const { status, all } = req.query;
    const where = status ? { status } : {};

    if (all === 'true') {
      const quotes = await prisma.quoteRequest.findMany({ where, orderBy: { createdAt: 'desc' } });
      return res.status(200).json({ success: true, data: quotes, total: quotes.length });
    }

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 50, 1), 200);

    const [quotes, total] = await Promise.all([
      prisma.quoteRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.quoteRequest.count({ where })
    ]);

    return res.status(200).json({
      success: true,
      data: quotes,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1
    });
  } catch (error) {
    console.error('getQuotes error:', error);
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
    if (error && error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Quote request not found.' });
    }
    console.error('updateQuoteStatus error:', error);
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
    if (error && error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Quote request not found.' });
    }
    console.error('deleteQuote error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete quote.' });
  }
};

module.exports = { submitQuote, getQuotes, updateQuoteStatus, deleteQuote };
